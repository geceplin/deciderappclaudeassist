import React, { useEffect, useState } from 'react';
import { Movie } from '../../types';
import { getBackdropUrl } from '../../services/tmdbService';
import Confetti from '../common/Confetti';
import { X, RefreshCw } from '../icons/Icons';

interface ResultModalProps {
  winner: Movie | null;
  onClose: () => void;
  onMarkWatched: () => Promise<void>;
  onSpinAgain: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ winner, onClose, onMarkWatched, onSpinAgain }) => {
  const [isMarking, setIsMarking] = useState(false);
  
  useEffect(() => {
    if (winner) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [winner]);

  if (!winner) return null;

  const backdropUrl = getBackdropUrl(winner.backdropPath, 'w1280');
  
  const handleMarkWatched = async () => {
      setIsMarking(true);
      try {
        await onMarkWatched();
        onClose(); // Close after success
      } catch (error) {
        console.error("Failed to mark movie as watched:", error);
        alert("Could not mark as watched. Please try again.");
      } finally {
        setIsMarking(false);
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Confetti active={!!winner} />
      <div
        className="relative bg-dark-elevated rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-white"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80">
          <X className="w-6 h-6" />
        </button>

        <div className="relative w-full aspect-video">
            <img src={backdropUrl} alt={winner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-elevated via-dark-elevated/70 to-transparent"></div>
        </div>

        <div className="p-8 -mt-20 z-10 flex-grow overflow-y-auto">
            <h2 className="text-4xl font-extrabold text-gold">{winner.title}</h2>
            <p className="text-gray-400 mt-1">{winner.year}</p>
            {winner.rating > 0 && (
                <div className="mt-2 text-lg font-bold flex items-center text-yellow-400">
                    ⭐<span className="ml-1 text-white">{winner.rating.toFixed(1)}</span>
                </div>
            )}
            <p className="mt-4 text-gray-300 max-h-32 overflow-y-auto">{winner.overview}</p>
        </div>

        <div className="p-6 bg-dark flex flex-col sm:flex-row gap-4 justify-end">
            <button onClick={onSpinAgain} className="px-6 py-3 flex items-center justify-center gap-2 rounded-lg text-white font-semibold bg-dark-hover hover:bg-gray-700">
                <RefreshCw className="w-5 h-5" />
                Spin Again
            </button>
            <button
                onClick={handleMarkWatched}
                disabled={isMarking}
                className="px-8 py-3 rounded-lg bg-gold text-dark font-bold hover:bg-gold-light disabled:bg-gold-dark disabled:cursor-wait"
            >
                {isMarking ? 'Marking...' : "We're Watching This!"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
