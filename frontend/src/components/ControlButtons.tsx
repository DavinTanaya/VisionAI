import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ControlButtonsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  disabled?: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isRunning,
  onStart,
  onPause,
  onReset,
  disabled = false
}) => {
  return (
    <div className="flex justify-center items-center space-x-4 mt-6">
      {isRunning ? (
        <button
          onClick={onPause}
          className="pixel-button primary"
          aria-label="Pause"
          disabled={disabled}
        >
          <Pause size={18} className="mr-2" />
          Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="pixel-button primary"
          aria-label="Start"
          disabled={disabled}
        >
          <Play size={18} className="mr-2" />
          Start
        </button>
      )}
      <button
        onClick={onReset}
        className="pixel-button"
        aria-label="Reset"
        disabled={disabled}
      >
        <RotateCcw size={18} className="mr-2" />
        Reset
      </button>
    </div>
  );
};

export default ControlButtons;