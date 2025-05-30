import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMusic } from "../contexts/MusicContext";
import YouTube, { YouTubePlayer } from "react-youtube";

const MusicPlayer: React.FC = () => {
  const { user } = useAuth();
  const { musicList, addMusic, updateMusic, deleteMusic } = useMusic();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [formTitle, setFormTitle] = useState<string>("");
  const [formUrl, setFormUrl] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (musicList.length === 0) return;

    const idx = Math.min(currentIndex, musicList.length - 1);
    if (idx !== currentIndex) setCurrentIndex(idx);

    audioRef.current?.pause();
    audioRef.current = null;
    ytPlayerRef.current = null;

    const track = musicList[idx];
    if (track.type === "audio" && track.url) {
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.muted = isMuted;
      audioRef.current = audio;
    }
  }, [currentIndex, musicList]);

  useEffect(() => {
    if (musicList.length === 0) return;
    const track = musicList[currentIndex];
    if (track.type === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) =>
          console.error("Audio playback error:", error)
        );
      } else {
        audioRef.current.pause();
      }
    }
    if (track.type === "youtube" && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, currentIndex, musicList]);

  // Mute Control: Update mute state when isMuted changes
  useEffect(() => {
    if (musicList.length === 0) return;
    const track = musicList[currentIndex];
    if (track.type === "audio" && audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (track.type === "youtube" && ytPlayerRef.current) {
      if (isMuted) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
      }
    }
  }, [isMuted, currentIndex, musicList]);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleMute = () => setIsMuted((prev) => !prev);

  const handleSubmit = async () => {
    if (!formUrl.trim()) {
      setErrorMessage("URL must not be empty!");
      return;
    }
    try {
      setErrorMessage("");
      if (editingId == null) {
        await addMusic(formTitle || "Custom Track", formUrl.trim());
        setCurrentIndex(musicList.length);
      } else {
        await updateMusic(editingId, { title: formTitle, url: formUrl });
      }
      setFormTitle("");
      setFormUrl("");
      setEditingId(null);
    } catch {
      setErrorMessage("Failed to Add URL, please recheck URL.");
    }
  };

  const confirmDelete = (id: number) => {
    setEditingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (editingId != null) {
      await deleteMusic(editingId);
      setShowDeleteModal(false);
      setFormTitle("");
      setFormUrl("");
      setEditingId(null);
      setCurrentIndex(0);
    }
  };

  const startEdit = (idx: number) => {
    const t = musicList[idx];
    setEditingId(t.id);
    setFormTitle(t.title);
    setFormUrl(t.url || `https://www.youtube.com/watch?v=${t.videoId}`);
    setErrorMessage("");
  };

  const ytOpts = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist:
        musicList[currentIndex]?.type === "youtube"
          ? musicList[currentIndex].videoId
          : undefined,
    },
  };

  const onYTReady = (e: { target: YouTubePlayer }) => {
    ytPlayerRef.current = e.target;
    if (isMuted) e.target.mute();
    else e.target.unMute();
    
    if (isPlaying) {
      e.target.playVideo();
    } else {
      e.target.pauseVideo();
    }
  };

  const onYTStateChange = (e: { data: number; target: YouTubePlayer }) => {
    const ENDED = window.YT?.PlayerState.ENDED;
    if (e.data === ENDED && isPlayingRef.current) {
      e.target.playVideo();
    }
  };

  if (musicList.length === 0 && editingId == null) {
    return (
      <div className="flex justify-center items-center mt-16">
        <div className="pixel-container w-full max-w-md">
          <h2 className="text-xl mb-6 text-center text-[#7e57c2]">
            Background Music
          </h2>
          <p>No music available. Please add some tracks.</p>
          {user && (
            <div className="mt-8 space-y-4">
              <h3 className="text-sm text-[#7e57c2]">Add Custom Track</h3>
              <input
                type="text"
                placeholder="Track Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
              />
              <input
                type="url"
                placeholder="Track URL"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
              />
              <button
                onClick={handleSubmit}
                className="pixel-button secondary w-full flex items-center justify-center gap-4 ml-0"
              >
                <Plus size={16} />
                <span>Add Track</span>
              </button>
              {errorMessage && (
                <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-16">
      <div className="pixel-container w-full max-w-md">
        <h2 className="text-xl mb-6 text-center text-[#7e57c2]">
          Background Music
        </h2>

        <div className="flex flex-col gap-4">
          {musicList.map((track, idx) => (
            <div key={track.id} className="flex">
              <button
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(true);
                  startEdit(idx);
                }}
                className={`pixel-button w-full text-left 
                  ${idx === currentIndex ? "primary" : ""}`}
              >
                {track.title}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={togglePlay}
            className="pixel-button primary flex items-center justify-center gap-4"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={toggleMute}
            className="pixel-button flex items-center justify-center gap-4"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {user && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              {editingId != null && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormTitle("");
                    setFormUrl("");
                    setErrorMessage("");
                    setShowDeleteModal(false);
                  }}
                  className="px-2 py-1 pixel-button flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm">Back</span>
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Track Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
            />
            <input
              type="url"
              placeholder="Track URL"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
            />
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="pixel-button secondary flex-1 flex items-center justify-center gap-4"
              >
                {editingId == null ? <Plus size={16} /> : <Check size={16} />}
                <span>{editingId == null ? "Add Track" : "Save Changes"}</span>
              </button>
              {editingId != null && (
                <button
                  onClick={() => confirmDelete(editingId)}
                  className="pixel-button danger flex items-center justify-center gap-4"
                >
                  <Trash2 size={16} /> <span>Delete</span>
                </button>
              )}
            </div>
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
        )}

        {musicList[currentIndex]?.type === "youtube" && (
          <YouTube
            videoId={musicList[currentIndex].videoId}
            opts={ytOpts}
            onReady={onYTReady}
            onStateChange={onYTStateChange}
          />
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="pixel-container w-96 p-6">
            <h3 className="text-lg mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this track?</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="pixel-button flex items-center gap-1"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleDelete}
                className="pixel-button danger flex items-center gap-1"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;