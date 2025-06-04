// Sessions.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import { Plus, Timer, History } from "lucide-react";

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const { fetchSessions, sessions, addSession } = useSession();
  const flatSessions = sessions.flat();
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSession, setNewSession] = useState({
    name: "",
    focus: 25,
    break: 5,
    repeat: 4,
  });

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateSession = async () => {
    try {
      const created = await addSession({
        name: newSession.name || "Focus Session",
        focus: newSession.focus,
        break: newSession.break,
        repeat: newSession.repeat,
        runtime: 0,
        yawning: 0,
        closed: 0,
        done: 0,
      });
      if (created?.id) {
        setNewSession({ name: "", focus: 25, break: 5, repeat: 4 });
        setShowNewSession(false);
        navigate(`/session/${created.id}`, { state: { session: created }});
      } else {
        console.warn("Session created but no ID returned.");
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <div className="pixel-container">
          <h2 className="text-xl mb-6 text-center text-[#7e57c2]">
            Recent Sessions
          </h2>
          <div className="space-y-4">
            {flatSessions.slice(0, 5).map((session, idx) => (
              <div key={session.id ?? idx} className="pixel-display p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md">
                      {session.name || "Unnamed Session"}
                    </h3>
                    <p className="text-xs text-[#7e57c2]">
                      Completed Pomodoros: {session.done / session.repeat || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => session.id && navigate(`/session/${session.id}`, {state: { session }})}
                    className="pixel-button primary flex items-center gap-2"
                  >
                    <Timer size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate("/history")}
              className="pixel-button secondary w-full flex items-center justify-center gap-2"
            >
              <History size={16} />
              <span>View All Sessions</span>
            </button>
          </div>
        </div>

        {/* New Session Form */}
        <div className="pixel-container">
          <h2 className="text-xl mb-6 text-center text-[#7e57c2]">
            {showNewSession ? "Create New Session" : "Start New Session"}
          </h2>

          {!showNewSession ? (
            <button
              onClick={() => setShowNewSession(true)}
              className="pixel-button primary w-full flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>New Session</span>
            </button>
          ) : (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-[#7e57c2] mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) =>
                    setNewSession((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
                  placeholder="My Focus Session"
                />
              </div>

              {/* Focus, Break, Repeat */}
              {[
                { label: "Focus Time (minutes)", key: "focus", min: 1, max: 60 },
                { label: "Break Time (minutes)", key: "break", min: 1, max: 30 },
                { label: "Repeat Count", key: "repeat", min: 1, max: 10 }
              ].map(({ label, key, min, max }) => (
                <div key={key}>
                  <label className="block text-sm text-[#7e57c2] mb-2">{label}</label>
                  <input
                    type="number"
                    value={newSession[key as keyof typeof newSession]}
                    onChange={(e) =>
                      setNewSession((prev) => ({
                        ...prev,
                        [key]: parseInt(e.target.value) || prev[key as keyof typeof newSession]
                      }))
                    }
                    className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
                    min={min}
                    max={max}
                  />
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="pixel-button w-full"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  className="pixel-button primary w-full"
                >
                  Create & Start
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;