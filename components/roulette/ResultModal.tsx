import React, { useEffect, useState } from 'react';
import { Movie } from '../../types';
import { getBackdropUrl } from '../../services/tmdbService';
import Confetti from '../common/Confetti';
import { X, RefreshCw, Loader2 } from '../icons/Icons';

interface ResultModalProps {
  winner: Movie | null;
  onClose: () => void;
  onMarkWatched: (movieId: string) => Promise<void>;
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
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [winner, onClose]);

  if (!winner) return null;

  const backdropUrl = getBackdropUrl(winner.backdropPath, 'w1280');
  
  const handleMarkWatched = async () => {
      setIsMarking(true);
      try {
        await onMarkWatched(winner.id);
        onClose(); // Close after success
      } catch (error) {
        console.error("Failed to mark movie as watched:", error);
        alert("Could not mark as watched. Please try again.");
        setIsMarking(false);
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Confetti active={!!winner} />
      <div
        className="relative bg-dark-elevated rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-white animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
        
        <div className="p-8 text-center">
             <h1 className="text-3xl font-bold text-gold mb-2">
              🎬 WE'RE WATCHING THIS! 🎬
            </h1>
        </div>

        <div className="relative w-full aspect-video">
            <img src={backdropUrl} alt={winner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-elevated via-dark-elevated/70 to-transparent"></div>
        </div>

        <div className="p-8 -mt-20 z-10 text-center">
            <h2 className="text-4xl font-extrabold text-white">{winner.title}</h2>
            <p className="text-gray-400 mt-1">{winner.year}</p>
        </div>

        <div className="p-6 bg-dark flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={handleMarkWatched}
                disabled={isMarking}
                className="px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gold text-dark font-bold hover:bg-gold-light disabled:bg-gold-dark disabled:cursor-wait"
            >
                {isMarking ? <><Loader2 className="w-5 h-5 animate-spin"/> Marking...</> : '✓ Mark as Watched'}
            </button>
             <button onClick={onSpinAgain} className="px-6 py-3 w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg text-white font-semibold bg-dark-hover hover:bg-gray-700">
                <RefreshCw className="w-5 h-5" />
                Spin Again
            </button>
        </div>
        <button onClick={onClose} className="py-3 text-sm text-gray-500 hover:text-white">Back to Group</button>
      </div>
    </div>
  );
};

export default ResultModal;