import React, { useState, useEffect, useRef } from "react";
import { Settings2, Volume2, VolumeX, Music } from "lucide-react";
import TimerDisplay from "./TimerDisplay";
import ControlButtons from "./ControlButtons";
import ProgressBar from "./ProgressBar";
import SessionCounter from "./SessionCounter";
import SettingsPanel from "./SettingsPanel";
import MusicSelector from "./MusicSelector";
import CameraMonitor from "./CameraMonitor";
import { useSession } from "../contexts/SessionContext";
import { useMusic } from "../contexts/MusicContext";
import YouTube, { YouTubePlayer } from "react-youtube";

let lastSettingsRef: React.MutableRefObject<{
  focus: number;
  shortBreak: number;
  repeatCount: number;
}>;

enum TimerMode {
  POMODORO = "pomodoro",
  SHORT_BREAK = "shortBreak",
}

const DEFAULT_TIMES = {
  [TimerMode.POMODORO]: 5 * 1,
  [TimerMode.SHORT_BREAK]: 5 * 1,
  repeatCount: 4,
};

const PomodoroTimer: React.FC = () => {
  const { musicList } = useMusic();
  lastSettingsRef = useRef({
    focus: 0,
    shortBreak: 0,
    repeatCount: 0,
  });
  const {
    currentSession,
    addSession,
    updateSession,
    incrementRuntime,
    incrementDone,
  } = useSession();

  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.POMODORO);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES[timerMode]);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [customTimes, setCustomTimes] = useState({ ...DEFAULT_TIMES });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicIsMuted, setMusicIsMuted] = useState(false);
  const [runtimeInterval, setRuntimeInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [transitioningTimers, setTransitioningTimers] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const timerRef = useRef<number | null>(null);
  const totalTime = useRef(DEFAULT_TIMES[timerMode]);
  const lastTickTime = useRef(Date.now());

  useEffect(() => {
    if (!currentSession) {
      createNewSession();
      return;
    }

    const focusSec = currentSession.focus * 60;
    const breakSec = currentSession.break * 60;
    const repeatCnt = currentSession.repeat;
    const last = lastSettingsRef.current;

    if (
      focusSec !== last.focus ||
      breakSec !== last.shortBreak ||
      repeatCnt !== last.repeatCount
    ) {
      lastSettingsRef.current = {
        focus: focusSec,
        shortBreak: breakSec,
        repeatCount: repeatCnt,
      };

      setCustomTimes({
        [TimerMode.POMODORO]: focusSec,
        [TimerMode.SHORT_BREAK]: breakSec,
        repeatCount: repeatCnt,
      });

      const initial = timerMode === TimerMode.POMODORO ? focusSec : breakSec;

      setTimeLeft(initial);
      totalTime.current = initial;

      setCompletedSessions(currentSession.done || 0);
    }
  }, [currentSession, timerMode]);

  const createNewSession = async () => {
    const newSession = await addSession({
      name: "Focus Session",
      focus: DEFAULT_TIMES[TimerMode.POMODORO] / 60,
      break: DEFAULT_TIMES[TimerMode.SHORT_BREAK] / 60,
      repeat: DEFAULT_TIMES.repeatCount,
      runtime: 0,
      yawning: 0,
      closed: 0,
      done: 0,
    });

    return newSession;
  };

  // Setup runtime increment interval (every 10 seconds)
  useEffect(() => {
    if (isRunning && currentSession?.id && !runtimeInterval) {
      const interval = setInterval(async () => {
        if (currentSession.id) {
          try {
            await incrementRuntime(currentSession.id);
          } catch (error) {
            console.error("Error incrementing runtime:", error);
          }
        }
      }, 10000); // Every 10 seconds
      setRuntimeInterval(interval);
    }

    return () => {
      if (runtimeInterval) {
        clearInterval(runtimeInterval);
        setRuntimeInterval(null);
      }
    };
  }, [isRunning, currentSession]);

  // Music setup
  useEffect(() => {
    if (musicList.length === 0) return;

    let idx = currentTrackIndex;
    if (idx >= musicList.length) {
      idx = musicList.length - 1;
      setCurrentTrackIndex(idx);
    }
    if (idx < 0) {
      idx = 0;
      setCurrentTrackIndex(idx);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    ytPlayerRef.current = null;

    const track = musicList[idx];
    if (track?.type === "audio" && track.url) {
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.muted = musicIsMuted;
      audioRef.current = audio;
    }
  }, [currentTrackIndex, musicList]);

  // Play/pause music
  useEffect(() => {
    if (musicList.length === 0) return;
    const track = musicList[currentTrackIndex];
    if (track?.type === "audio" && audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Audio playback error:", error));
      } else {
        audioRef.current.pause();
      }
    }
    if (track?.type === "youtube" && ytPlayerRef.current) {
      if (isMusicPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    }
  }, [isMusicPlaying, currentTrackIndex, musicList]);

  // Mute music
  useEffect(() => {
    if (musicList.length === 0) return;
    const track = musicList[currentTrackIndex];
    if (track?.type === "audio" && audioRef.current) {
      audioRef.current.muted = musicIsMuted;
    }
    if (track?.type === "youtube" && ytPlayerRef.current) {
      if (musicIsMuted) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
      }
    }
  }, [musicIsMuted, currentTrackIndex, musicList]);

  // YouTube options and handlers
  const ytOpts = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist:
        musicList[currentTrackIndex]?.type === "youtube"
          ? musicList[currentTrackIndex].videoId
          : undefined,
    },
  };

  const onYTReady = (e: { target: YouTubePlayer }) => {
    ytPlayerRef.current = e.target;
    if (musicIsMuted) e.target.mute();
    else e.target.unMute();

    if (isMusicPlaying) {
      e.target.playVideo();
    } else {
      e.target.pauseVideo();
    }
  };

  const onYTStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const ENDED = window.YT?.PlayerState.ENDED;
    if (e.data === ENDED && isMusicPlaying) {
      e.target.playVideo();
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        lastTickTime.current = now;

        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  // Update timer when mode or custom times change
  useEffect(() => {
    totalTime.current = customTimes[timerMode];
    setTimeLeft(customTimes[timerMode]);
  }, [timerMode, customTimes]);

  const handleTimerComplete = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setTransitioningTimers(true);

    if (timerMode === TimerMode.POMODORO) {
      const newDone = completedSessions + 1;
      setCompletedSessions(newDone);

      if (currentSession?.id) {
        try {
          await incrementDone(currentSession.id);
        } catch (err) {
          console.error("Error incrementing done on server:", err);
        }
      }

      if (newDone >= customTimes.repeatCount) {
        setTimerMode(TimerMode.POMODORO);
        setTimeLeft(customTimes[TimerMode.POMODORO]);
        setCompletedSessions(0);
        setTransitioningTimers(false);
      } else {
        setTimerMode(TimerMode.SHORT_BREAK);
        setTimeLeft(customTimes[TimerMode.SHORT_BREAK]);
        setTimeout(() => {
          setIsRunning(true);
          setTransitioningTimers(false);
        }, 50);
      }
    } else {
      setTimerMode(TimerMode.POMODORO);
      setTimeLeft(customTimes[TimerMode.POMODORO]);
      setTimeout(() => {
        setIsRunning(true);
        setTransitioningTimers(false);
      }, 50);
    }
  };

  const startTimer = () => {
    if (!transitioningTimers) {
      setIsRunning(true);
      lastTickTime.current = Date.now();
    }
  };

  const pauseTimer = () => {
    if (!transitioningTimers) {
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    if (!transitioningTimers) {
      setIsRunning(false);
      setTimeLeft(customTimes[timerMode]);
    }
  };

  const toggleSettings = () => setShowSettings(!showSettings);
  const toggleMusicSelector = () => setShowMusicSelector(!showMusicSelector);

  const updateCustomTimes = async (newTimes: typeof DEFAULT_TIMES) => {
    setCustomTimes(newTimes);
    setTimeLeft(newTimes[timerMode]);
    totalTime.current = newTimes[timerMode];

    // Update session settings on server
    if (currentSession?.id) {
      try {
        await updateSession(currentSession.id, {
          focus: newTimes[TimerMode.POMODORO] / 60,
          break: newTimes[TimerMode.SHORT_BREAK] / 60,
          repeat: newTimes.repeatCount,
        });
      } catch (error) {
        console.error("Failed to update session settings:", error);
      }
    }
  };

  const progress = (timeLeft / totalTime.current) * 100;

  const getModeLabel = (mode: TimerMode): string => {
    switch (mode) {
      case TimerMode.POMODORO:
        return "Focus";
      case TimerMode.SHORT_BREAK:
        return "Break";
    }
  };

  const getModeColor = (mode: TimerMode): string => {
    switch (mode) {
      case TimerMode.POMODORO:
        return "bg-[var(--theme-primary)]";
      case TimerMode.SHORT_BREAK:
        return "bg-[var(--theme-secondary)]";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="pixel-container">
        <h1 className="text-xl mb-6 text-center text-[#7e57c2]">
          PIXEL POMODORO
        </h1>

        <div className="mb-4 flex justify-center gap-2">
          {Object.values(TimerMode).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                if (!transitioningTimers) {
                  setTimerMode(mode);
                  resetTimer();
                }
              }}
              className={`text-xs px-3 py-2 pixel-button ${
                timerMode === mode ? "primary" : ""
              }`}
              disabled={transitioningTimers}
            >
              {getModeLabel(mode)}
            </button>
          ))}
        </div>

        <TimerDisplay timeLeft={timeLeft} mode={timerMode} />

        <ProgressBar progress={progress} colorClass={getModeColor(timerMode)} />

        <ControlButtons
          isRunning={isRunning}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          disabled={transitioningTimers}
        />

        <SessionCounter
          completedSessions={completedSessions}
          maxSessions={customTimes.repeatCount}
        />

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setMusicIsMuted(!musicIsMuted)}
            className="pixel-button"
            aria-label={musicIsMuted ? "Unmute music" : "Mute music"}
          >
            {musicIsMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={toggleMusicSelector}
            className="pixel-button"
            aria-label="Music Selection"
          >
            <Music size={18} />
          </button>
          <button
            onClick={toggleSettings}
            className="pixel-button"
            aria-label="Settings"
          >
            <Settings2 size={18} />
          </button>
        </div>

        {showSettings && (
          <SettingsPanel
            customTimes={customTimes}
            onUpdate={updateCustomTimes}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showMusicSelector && (
          <MusicSelector
            onClose={() => setShowMusicSelector(false)}
            currentTrack={currentTrackIndex}
            isPlaying={isMusicPlaying}
            onTrackSelect={(index) => {
              setCurrentTrackIndex(index);
              if (!isMusicPlaying) setIsMusicPlaying(true);
            }}
            onPlayPause={() => setIsMusicPlaying(!isMusicPlaying)}
          />
        )}

        {musicList.length > 0 &&
          musicList[currentTrackIndex]?.type === "youtube" && (
            <YouTube
              videoId={musicList[currentTrackIndex].videoId}
              opts={ytOpts}
              onReady={onYTReady}
              onStateChange={onYTStateChange}
            />
          )}
      </div>

      <div className="h-full">
        <CameraMonitor isActive={isRunning} />
      </div>
    </div>
  );
};

export default PomodoroTimer;
