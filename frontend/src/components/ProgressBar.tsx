import React from 'react';

interface ProgressBarProps {
  progress: number;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="w-full h-4 bg-gray-200 border-2 border-black mt-4">
      <div 
        className={`h-full ${colorClass}`}
        style={{ width: `${clampedProgress}%` }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  );
};

export default ProgressBar;