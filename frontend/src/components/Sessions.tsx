import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { Plus, Timer, History } from 'lucide-react';

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, addSession } = useSession();
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    focus: 25,
    break: 5,
    repeat: 4
  });

  const handleCreateSession = async () => {
    try {
      await addSession({
        name: newSession.name || 'Focus Session',
        focus: newSession.focus,
        break: newSession.break,
        repeat: newSession.repeat,
        runtime: 0,
        yawning: 0,
        closed: 0,
        done: 0
      });
      navigate('/timer');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="pixel-container">
          <h2 className="text-xl mb-6 text-center text-[#7e57c2]">Recent Sessions</h2>
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session, idx) => (
              <div key={session.id || idx} className="pixel-display p-4">
                <div className="flex items-center justify-start gap-4">
                  <div className="flex flex-col items-start flex-1">
                    <h3 className="text-md">{session.name || 'Unnamed Session'}</h3>
                    <p className="text-xs text-[#7e57c2]">
                      Completed Pomodoros: {session.done / session.repeat || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => session.id != null && navigate(`/session/${session.id}`)}
                    className="pixel-button primary"
                  >
                    <Timer size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate('/history')}
              className="pixel-button secondary w-full flex items-center justify-center gap-2"
            >
              <History size={16} />
              <span>View All Sessions</span>
            </button>
          </div>
        </div>

        <div className="pixel-container">
          <h2 className="text-xl mb-6 text-center text-[#7e57c2]">
            {showNewSession ? 'Create New Session' : 'Start New Session'}
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
              <div>
                <label className="block text-sm text-[#7e57c2] mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
                  placeholder="My Focus Session"
                />
              </div>

              <div>
                <label className="block text-sm text-[#7e57c2] mb-2">
                  Focus Time (minutes)
                </label>
                <input
                  type="number"
                  value={newSession.focus}
                  onChange={(e) => setNewSession({ ...newSession, focus: parseInt(e.target.value) || 25 })}
                  className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm text-[#7e57c2] mb-2">
                  Break Time (minutes)
                </label>
                <input
                  type="number"
                  value={newSession.break}
                  onChange={(e) => setNewSession({ ...newSession, break: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm text-[#7e57c2] mb-2">
                  Repeat Count
                </label>
                <input
                  type="number"
                  value={newSession.repeat}
                  onChange={(e) => setNewSession({ ...newSession, repeat: parseInt(e.target.value) || 4 })}
                  className="w-full px-3 py-2 pixel-border bg-[#f8f0fd]"
                  min="1"
                  max="10"
                />
              </div>

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