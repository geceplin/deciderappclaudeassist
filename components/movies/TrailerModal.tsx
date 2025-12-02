import React, { useEffect, useState } from 'react';
import { X, Loader2 } from '../icons/Icons';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeKey: string | null;
  movieTitle: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, youtubeKey, movieTitle }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen || !youtubeKey) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4 animate-fade-in">
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-dark-elevated rounded-full hover:bg-dark-hover transition-colors z-20 group"
        aria-label="Close trailer"
      >
        <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
      </button>

      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-label="Close trailer overlay"
      />

      {/* Video container */}
      <div className="relative w-full max-w-5xl aspect-video z-10 bg-black rounded-xl overflow-hidden shadow-2xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-elevated">
            <Loader2 className="animate-spin text-gold w-12 h-12" />
          </div>
        )}
        
        <iframe
          src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`}
          title={`${movieTitle} - Trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>

      {/* Movie title below video */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-white text-lg font-semibold px-4 text-shadow-md bg-black/50 inline-block rounded-lg backdrop-blur-sm">
          {movieTitle}
        </p>
      </div>
    </div>
  );
};

export default TrailerModal;