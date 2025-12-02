
import React, { useState, useEffect } from 'react';
import { Movie, CastMember, CrewMember } from '../../types';
import * as tmdbService from '../../services/tmdbService';
import { getBackdropUrl, getProfileUrl, getTrailerKey } from '../../services/tmdbService';
import { X, Loader2, PlayCircle, User } from '../icons/Icons';
import TrailerModal from './TrailerModal';
import WhereToWatch from './WhereToWatch';

interface MovieDetailsModalProps {
  movie: Movie;
  onClose: () => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, onClose }) => {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [director, setDirector] = useState<CrewMember | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const [credits, videos] = await Promise.all([
          tmdbService.getMovieCredits(movie.tmdbId),
          tmdbService.getMovieVideos(movie.tmdbId),
        ]);
        setCast(credits.cast);
        setDirector(credits.director);
        setTrailerKey(getTrailerKey(videos));
      } catch (err) {
        console.error("Failed to fetch movie details:", err);
        setError("Could not load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movie, onClose]);

  const backdropUrl = getBackdropUrl(movie.backdropPath, 'w1280');

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-details-title"
    >
      <div
        className="bg-dark-elevated rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          /* Custom scrollbar for cast */
          .cast-scrollbar::-webkit-scrollbar { height: 8px; }
          .cast-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .cast-scrollbar::-webkit-scrollbar-thumb { background-color: #4A4A4A; border-radius: 10px; }
        `}</style>
        <header className="relative w-full aspect-video flex-shrink-0">
          <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover rounded-t-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-elevated via-dark-elevated/70 to-transparent"></div>
          <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/80">
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-0 left-0 p-6">
            <h2 id="movie-details-title" className="text-4xl font-extrabold text-white shadow-lg">{movie.title}</h2>
            <p className="text-gray-300 mt-1 shadow-md">{movie.year}</p>
          </div>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-cinema-red py-12">{error}</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => (
                  <span key={genre} className="px-3 py-1 bg-dark-hover text-gray-300 text-xs font-semibold rounded-full">{genre}</span>
                ))}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gold mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{movie.overview || "No overview available."}</p>
              </div>

              {/* Streaming Section */}
              <WhereToWatch tmdbId={movie.tmdbId} />

              {director && (
                <div>
                    <h3 className="text-xl font-bold text-gold mb-3">Director</h3>
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400"/>
                        <span className="text-white font-semibold">{director.name}</span>
                    </div>
                </div>
              )}

              {cast.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gold mb-3">Cast</h3>
                  <div className="flex gap-4 overflow-x-auto pb-3 cast-scrollbar">
                    {cast.map(member => (
                      <div key={member.id} className="text-center flex-shrink-0 w-28">
                        <img src={getProfileUrl(member.profilePath, 'w185')} alt={member.name} className="w-24 h-36 mx-auto object-cover rounded-lg shadow-md bg-dark-hover" />
                        <p className="text-white text-sm font-bold mt-2 truncate">{member.name}</p>
                        <p className="text-gray-400 text-xs truncate">{member.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {trailerKey && (
                  <button 
                    onClick={() => setShowTrailer(true)} 
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-cinema-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105"
                  >
                      <PlayCircle className="w-6 h-6" />
                      Watch Trailer
                  </button>
              )}

            </div>
          )}
        </main>
      </div>
      
      <TrailerModal 
        isOpen={showTrailer} 
        onClose={() => setShowTrailer(false)} 
        youtubeKey={trailerKey} 
        movieTitle={movie.title} 
      />
    </div>
  );
};

export default MovieDetailsModal;
