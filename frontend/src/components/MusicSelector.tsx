import React from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Play, Pause, X } from 'lucide-react';

interface MusicSelectorProps {
  onClose: () => void;
  currentTrack: number;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
  onPlayPause: () => void;
}

const MusicSelector: React.FC<MusicSelectorProps> = ({
  onClose,
  currentTrack,
  isPlaying,
  onTrackSelect,
  onPlayPause
}) => {
  const { musicList } = useMusic();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="pixel-container bg-white w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Music Selection</h2>
          <button 
            onClick={onClose}
            className="pixel-button"
            aria-label="Close music selector"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
        {musicList.length === 0 ? (
            <p>No tracks available</p>
        ) : (
            <div className="space-y-4">
                {musicList.map((track, index) => (
                    <button
                        key={track.id}
                        onClick={() => onTrackSelect(index)}
                        className={`pixel-button w-full flex justify-between items-center ${
                            index === currentTrack ? 'primary' : ''
                        }`}
                    >
                        <span>{track.title}</span>
                        {index === currentTrack && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayPause();
                                }}
                                className="pixel-button secondary"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                        )}
                    </button>
                ))}
            </div>
        )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <button 
            onClick={onClose} 
            className="pixel-button primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicSelector;