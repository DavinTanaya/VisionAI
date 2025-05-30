import React, { useEffect } from 'react'; 
import { useSession } from '../contexts/SessionContext';
import { Clock, Calendar, Check, Eye, AlertTriangle } from 'lucide-react';

const SessionHistory: React.FC = () => {
  const { sessions, fetchSessions, isLoading } = useSession();

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // flatten the nested-array you get from the backend
  const flatSessions = React.useMemo(
    () => sessions.flat(), 
    [sessions]
  );

  const formatTime = (seconds: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="pixel-container w-full max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="pixel-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pixel-container w-full max-w-4xl mx-auto">
      <h1 className="text-xl mb-6 text-center text-[#7e57c2]">Focus Session History</h1>
      
      {flatSessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No sessions recorded yet. Start a timer to create your first session!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {flatSessions.map((session, idx) => (
            <div key={idx} className="pixel-display p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {session.name || `Session ${idx + 1}`}
                </h3>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={14} />
                    
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#7e57c2]" />
                  <div>
                    <p className="text-xs text-gray-500">Total Focus Time</p>
                    <p className="font-medium">{formatTime(session.runtime ?? 0)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Completed Sessions</p>
                    <p className="font-medium">{session.done}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Eyes Closed</p>
                    <p className="font-medium">{session.closed} s</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Yawning Count</p>
                    <p className="font-medium">{session.yawning}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Focus</p>
                    <p className="font-medium">{session.focus} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Break</p>
                    <p className="font-medium">{session.break} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Repeat</p>
                    <p className="font-medium">{session.repeat} cycles</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
