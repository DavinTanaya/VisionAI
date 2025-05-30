import React, { useState } from "react";
import { useSession } from "../contexts/SessionContext";
import { X } from "lucide-react";

interface SettingsPanelProps {
  customTimes: {
    pomodoro: number;
    shortBreak: number;
    repeatCount: number;
  };
  onUpdate: (newTimes: {
    pomodoro: number;
    shortBreak: number;
    repeatCount: number;
  }) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  customTimes,
  onClose,
}) => {
  const { currentSession, updateSession } = useSession();
  const [focusMinutes, setFocusMinutes] = useState(
    Math.floor(customTimes.pomodoro / 60)
  );
  const [breakMinutes, setBreakMinutes] = useState(
    Math.floor(customTimes.shortBreak / 60)
  );
  const [repeatCount, setRepeatCount] = useState(customTimes.repeatCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentSession?.id) {
      await updateSession(currentSession.id, {
        focus: focusMinutes,
        break: breakMinutes,
        repeat: repeatCount,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="pixel-container bg-white w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Timer Settings</h2>
          <button
            onClick={onClose}
            className="pixel-button"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--theme-text-light)] mb-1">
              Focus Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 25)}
              className="w-full px-3 py-2 pixel-border bg-[var(--theme-background)]"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--theme-text-light)] mb-1">
              Break Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 pixel-border bg-[var(--theme-background)]"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--theme-text-light)] mb-1">
              Session Count
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={repeatCount}
              onChange={(e) => setRepeatCount(parseInt(e.target.value) || 4)}
              className="w-full px-3 py-2 pixel-border bg-[var(--theme-background)]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="pixel-button">
              Cancel
            </button>
            <button type="submit" className="pixel-button primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;
