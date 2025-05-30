import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  mode: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, mode }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const getColorClass = () => {
    if (mode === 'pomodoro') return 'text-[var(--theme-primary)]';
    if (mode === 'shortBreak') return 'text-[var(--theme-secondary)]';
    return 'text-black';
  };

  return (
    <div className="text-center my-6">
      <h2 className={`text-6xl font-bold pixel-blink ${getColorClass()}`}>
        {formattedTime}
      </h2>
      <p className="mt-2 text-sm">
        {mode === 'pomodoro' ? 'FOCUS TIME' : 'BREAK TIME'}
      </p>
    </div>
  );
};

export default TimerDisplay;