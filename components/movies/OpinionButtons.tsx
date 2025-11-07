import React from 'react';
import { Movie, Opinion } from '../../types';

interface OpinionButtonsProps {
  movie: Movie;
  currentUserId: string;
  onOpinionChange: (newOpinion: Opinion | null) => void;
  disabled?: boolean;
}

// A helper to get the camelCase key for opinionCounts from the opinion value
const getCountKey = (opinion: Opinion): keyof Movie['opinionCounts'] => {
    if (opinion === 'must-watch') return 'mustWatch';
    if (opinion === 'already-seen') return 'alreadySeen';
    return 'pass';
};

const OpinionButtons: React.FC<OpinionButtonsProps> = ({ movie, currentUserId, onOpinionChange, disabled = false }) => {
  // Null-safe access to opinions and counts
  const userOpinion = movie.opinions?.[currentUserId] || null;
  const opinionCounts = movie.opinionCounts || { mustWatch: 0, alreadySeen: 0, pass: 0 };
  
  const options: { value: Opinion; emoji: string; label: string; color: string }[] = [
    { value: 'must-watch', emoji: '🌟', label: 'Must Watch', color: 'gold' },
    { value: 'already-seen', emoji: '✅', label: 'Seen', color: 'cinema-green' },
    { value: 'pass', emoji: '👎', label: 'Pass', color: 'cinema-red' }
  ];

  const handleClick = (clickedOpinion: Opinion) => {
    if (disabled) return;
    // If the user clicks the currently active button, it deselects it (removes opinion).
    // Otherwise, it sets the new opinion.
    const newOpinion = userOpinion === clickedOpinion ? null : clickedOpinion;
    onOpinionChange(newOpinion);
    if (navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback
    }
  };

  return (
    <div className="flex gap-2 w-full mt-4">
      {options.map(option => {
        const isActive = userOpinion === option.value;
        const count = opinionCounts[getCountKey(option.value)] ?? 0;

        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            disabled={disabled}
            className={`
              flex-1 p-2 rounded-xl border-2 transition-all duration-200 ease-in-out
              flex flex-col items-center justify-center text-center
              ${isActive 
                ? `bg-${option.color} border-${option.color} text-dark font-bold transform scale-105 shadow-lg` 
                : `bg-dark-hover border-gray-700 text-gray-300 hover:border-gray-500`
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-pressed={isActive}
          >
            <span className="text-xl block">{option.emoji}</span>
            <span className="text-xs font-semibold block mt-1">{option.label}</span>
            <span className="text-sm font-bold block mt-0.5">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default OpinionButtons;