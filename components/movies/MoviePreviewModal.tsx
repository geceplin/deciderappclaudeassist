import React, { useState, useEffect } from 'react';
import { MovieDetails, MoviePreview } from '../../types';
import * as tmdbService from '../../services/tmdbService';
import { X, Loader2, PlayCircle, User, Star } from '../icons/Icons';

interface MoviePreviewModalProps {
  tmdbId: number;
  onClose: () => void;
  onAddMovie: (movie: MovieDetails) => Promise<void>;
  isAdded: boolean;
}

const MoviePreviewModal: React.FC<MoviePreviewModalProps> = ({ tmdbId, onClose, onAddMovie, isAdded }) => {
  const [preview, setPreview] = useState<MoviePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);

    const fetchPreview = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await tmdbService.getMoviePreview(tmdbId);
        setPreview(data);
      } catch (err) {
        setError("Could not load preview.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tmdbId, onClose]);
  
  const handleAddClick = async () => {
      if (!preview) return;
      setIsAdding(true);
      try {
        // We need to pass a MovieDetails object, not a MoviePreview
        const movieDetails: MovieDetails = {
            tmdbId: preview.tmdbId,
            title: preview.title,
            year: preview.year || 0,
            overview: preview.overview,
            posterPath: preview.posterPath,
            rating: preview.rating,
            backdropPath: preview.backdropPath,
            genres: preview.genres
        }
        await onAddMovie(movieDetails);
        onClose(); // Close modal on success
      } catch(err: any) {
        alert(err.message || 'Failed to add movie.');
      } finally {
        setIsAdding(false);
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose} role="dialog" aria-modal="true"
    >
      <div
        className="bg-dark-elevated rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <style>{`.animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        
        {loading && <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}
        {error && <div className="text-center text-cinema-red py-12">{error}</div>}

        {preview && (
          <>
            <header className="relative w-full aspect-[16/7] flex-shrink-0">
              <img src={tmdbService.getBackdropUrl(preview.backdropPath)} alt="" className="w-full h-full object-cover rounded-t-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-elevated to-transparent"></div>
              <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 z-10">
                <X className="w-6 h-6" />
              </button>
            </header>
            
            <main className="p-6 overflow-y-auto flex-grow -mt-20 z-10">
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <img src={tmdbService.getPosterUrl(preview.posterPath, 'w342')} alt={preview.title} className="w-32 sm:w-40 h-auto object-cover rounded-lg shadow-lg flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-3xl font-extrabold text-white">{preview.title}</h2>
                  <p className="text-gray-400 mt-1">{preview.year} {preview.runtime ? `• ${preview.runtime} min` : ''}</p>
                  <div className="flex items-center gap-2 mt-2"><Star className="w-5 h-5 text-gold" filled/><span className="font-bold text-white text-lg">{preview.rating.toFixed(1)}</span></div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {preview.genres.map(g => <span key={g} className="px-2 py-1 bg-dark text-gray-300 text-xs font-semibold rounded-full">{g}</span>)}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gold mb-2">Overview</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{preview.overview}</p>
                </div>

                {preview.cast.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gold mb-3">Top Cast</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                      {preview.cast.map(member => (
                        <div key={member.name} className="text-center">
                          <img src={tmdbService.getProfileUrl(member.profilePath)} alt={member.name} className="w-20 h-20 mx-auto object-cover rounded-full shadow-md bg-dark" />
                          <p className="text-white text-xs font-bold mt-2 truncate">{member.name}</p>
                          <p className="text-gray-400 text-xs truncate">{member.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
            
            <footer className="p-6 border-t border-gray-700 flex-shrink-0">
                <button
                    onClick={handleAddClick}
                    disabled={isAdding || isAdded}
                    className={`w-full h-12 flex items-center justify-center font-bold rounded-lg transition-colors
                        ${isAdded ? 'bg-cinema-green text-white cursor-not-allowed' : ''}
                        ${isAdding ? 'bg-gold-dark text-dark cursor-wait' : ''}
                        ${!isAdded && !isAdding ? 'bg-gold text-dark hover:bg-gold-light' : ''}
                    `}
                >
                    {isAdded ? '✓ Already in Watchlist' : isAdding ? <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Adding...</> : '+ Add to Watchlist'}
                </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default MoviePreviewModal;