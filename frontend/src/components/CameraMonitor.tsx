import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useSession } from "../contexts/SessionContext";
import { Eye, AlertTriangle } from "lucide-react";

const WS_URL = "ws://api.davintanaya.me/vision/ws";

interface CameraMonitorProps {
  isActive: boolean;
}

export default function CameraMonitor({ isActive }: CameraMonitorProps) {
  const webcamRef = useRef<Webcam>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameInterval = useRef<NodeJS.Timeout | null>(null);
  const { currentSession, incrementYawning, incrementClosed } = useSession();
  const [stats, setStats] = useState({
    eyesClosed: false,
    yawning: false,
    eyeClosedDuration: 0,
    yawnCount: 0,
  });

  const lastClosedTs = useRef<number>(0);
  const lastYawnTs = useRef<number>(0);
  const COOLDOWN_MS = 10_000;

  const prevStateRef = useRef({
    eyesClosed: false,
    yawning: false,
  });

  useEffect(() => {
    if (isActive && currentSession?.id) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log("Setting up WebSocket connection...");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = async (evt) => {
        const msg = JSON.parse(evt.data) as {
          status: string;
          bbox: [number, number, number, number] | null;
        };

        const now = Date.now();
        const isClosed = msg.status === "Closed";
        const isYawning = msg.status === "Yawning";

        if (currentSession.id) {
          // Debounced closed-eyes increment
          if (
            isClosed &&
            !prevStateRef.current.eyesClosed &&
            now - lastClosedTs.current > COOLDOWN_MS
          ) {
            lastClosedTs.current = now;
            incrementClosed(currentSession.id).catch((e) =>
              console.error("incrementClosed error", e)
            );
          }

          // Debounced yawning increment
          if (
            isYawning &&
            !prevStateRef.current.yawning &&
            now - lastYawnTs.current > COOLDOWN_MS
          ) {
            lastYawnTs.current = now;
            incrementYawning(currentSession.id).catch((e) =>
              console.error("incrementYawning error", e)
            );
          }
        }

        // Update previous state reference
        prevStateRef.current = {
          eyesClosed: isClosed,
          yawning: isYawning,
        };

        // Update local UI state
        setStats((prev) => ({
          eyesClosed: isClosed,
          yawning: isYawning,
          eyeClosedDuration: isClosed
            ? prev.eyeClosedDuration + 1
            : prev.eyeClosedDuration,
          yawnCount:
            isYawning && !prev.yawning ? prev.yawnCount + 1 : prev.yawnCount,
        }));
      };

      ws.onopen = () => console.log("Vision WebSocket connected");
      ws.onclose = () => console.log("Vision WebSocket disconnected");
      ws.onerror = (error) => console.error("Vision WebSocket error:", error);

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [isActive, currentSession]);

  // Setup frame sending interval
  useEffect(() => {
    if (isActive && currentSession?.id) {
      // Clear any existing interval
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
        frameInterval.current = null;
      }

      // Send frames at a lower rate (250ms)
      const interval = setInterval(() => {
        if (webcamRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          const jpegB64 = webcamRef.current.getScreenshot();
          if (jpegB64) {
            const payload = { jpeg_b64: jpegB64.split(",")[1] };
            wsRef.current.send(JSON.stringify(payload));
          }
        }
      }, 250);

      frameInterval.current = interval;

      return () => {
        if (frameInterval.current) {
          clearInterval(frameInterval.current);
          frameInterval.current = null;
        }
      };
    }

    return () => {};
  }, [isActive, currentSession]);

  return (
    <div className="pixel-container w-full max-w-4xl mx-auto">
      <h2 className="text-xl mb-6 text-center text-[#7e57c2]">Focus Monitor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="pixel-container">
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              width={640}
              height={480}
              className="w-full rounded-lg"
              screenshotFormat="image/jpeg"
              videoConstraints={{ width: 640, height: 480 }}
            />
            {!isActive && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white">
                <p>Camera inactive</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="pixel-display">
            <h3 className="text-sm mb-4">Current Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`flex items-center gap-2 ${
                  stats.eyesClosed ? "text-red-500" : "text-green-500"
                }`}
              >
                <Eye size={18} />
                <span>{stats.eyesClosed ? "Eyes Closed" : "Eyes Open"}</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  stats.yawning ? "text-yellow-500" : "text-green-500"
                }`}
              >
                <AlertTriangle size={18} />
                <span>{stats.yawning ? "Yawning" : "Alert"}</span>
              </div>
            </div>
          </div>

          <div className="pixel-display">
            <h3 className="text-sm mb-4">Session Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm">Eyes Closed Count</p>
                <p className="text-2xl">{currentSession?.closed || 0}</p>
              </div>
              <div>
                <p className="text-sm">Yawn Count</p>
                <p className="text-2xl">{currentSession?.yawning || 0}</p>
              </div>
              <div>
                <p className="text-sm">Focus Sessions Completed</p>
                <p className="text-2xl">{currentSession?.done || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
