import React from 'react';

type SessionCounterProps = {
  completedSessions: number;
  maxSessions: number;
};

const SessionCounter: React.FC<SessionCounterProps> = ({ completedSessions, maxSessions }) => {
  const dots = Array.from({ length: maxSessions }, (_, index) => (
    <div 
      key={index}
      className={`pixel-dot ${index < completedSessions ? 'completed' : ''}`}
      aria-label={index < completedSessions ? 'Completed session' : 'Pending session'}
    />
  ));

  return (
    <div className="mt-4">
      <p className="text-xs text-center mb-2">Sessions: {completedSessions % maxSessions} / {maxSessions}</p>
      <div className="pixel-counter">
        {dots}
      </div>
    </div>
  );
};

export default SessionCounter;