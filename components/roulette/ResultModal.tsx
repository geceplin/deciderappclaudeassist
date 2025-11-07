import React from 'react';
import { Movie } from '../../types';
import { getPosterUrl } from '../../services/tmdbService';
import Confetti from '../common/Confetti';

interface ResultModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
  onMarkWatched: (movieId: string) => Promise<void>;
  onSpinAgain: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, movie, onClose, onMarkWatched, onSpinAgain }) => {
  if (!isOpen || !movie) return null;
  
  const handleWatchNow = async () => {
    await onMarkWatched(movie.id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
        <Confetti active={isOpen} />
        <div className="bg-dark-elevated rounded-2xl w-full max-w-lg text-center p-8 shadow-2xl animate-bounce-in">
            <h1 id="result-title" className="text-3xl font-extrabold text-gold mb-4">
                🎬 WE'RE WATCHING THIS! 🎬
            </h1>
            <img
                src={getPosterUrl(movie.posterPath, 'w500')}
                alt={movie.title}
                className="w-48 h-auto mx-auto object-cover rounded-lg shadow-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
            <p className="text-lg text-gray-400 mb-6">
                {movie.year} • ⭐ {movie.rating.toFixed(1)}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button
                    onClick={handleWatchNow}
                    className="flex-1 bg-gold text-dark px-6 py-3 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-gold-glow"
                >
                    🍿 Mark as Watched
                </button>
                <button
                    onClick={onSpinAgain}
                    className="flex-1 bg-dark-hover text-white px-6 py-3 rounded-xl font-bold text-lg border-2 border-gray-600 hover:border-gold transition-colors"
                >
                    🎡 Spin Again
                </button>
            </div>
            
            <button onClick={onClose} className="mt-6 text-gray-500 hover:text-white transition-colors">
                Back to Group
            </button>
        </div>
        <style>{`
            @keyframes bounce-in {
                0% { transform: scale(0.5); opacity: 0; }
                80% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-bounce-in {
                animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            }
        `}</style>
    </div>
  );
};

export default ResultModal;
