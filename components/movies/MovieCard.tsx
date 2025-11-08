
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
// FIX: Imported the missing Opinion type used in the handleOpinionChange function.
import { Movie, Opinion } from '../../types';
import { setMovieOpinion } from '../../services/movieService';
import { getPosterUrl } from '../../services/tmdbService';
import Avatar from '../common/Avatar';
import OpinionButtons from './OpinionButtons';
import ConfirmationModal from '../common/ConfirmationModal';
import { MoreVertical, Trash2 } from '../icons/Icons';

interface MovieCardProps {
  movie: Movie;
  groupId: string;
  groupOwnerId: string;
  onClick: () => void;
  onDelete: (movieId: string) => Promise<void>;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, groupId, groupOwnerId, onClick, onDelete }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const posterUrl = getPosterUrl(movie.posterPath, 'w500');
  
  if (!user) return null;

  const canDelete = user.uid === movie.addedBy || user.uid === groupOwnerId;

  const handleOpinionChange = async (newOpinion: Opinion | null) => {
    setIsUpdating(true);
    setError('');
    try {
      await setMovieOpinion(groupId, movie.id, user.uid, newOpinion);
    } catch (err) {
      console.error("Failed to set opinion:", err);
      setError("Couldn't update opinion.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(movie.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      // Error is handled/shown by parent
    } finally {
      setIsDeleting(false);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
      <button
        onClick={onClick}
        className="relative bg-dark-elevated rounded-2xl p-4 flex flex-col items-center text-center shadow-lg transition-all duration-300 hover:shadow-gold-glow hover:-translate-y-1 w-full"
        aria-label={`View details for ${movie.title}`}
      >
        {canDelete && (
          <div className="absolute top-2 right-2 z-10" onClick={stopPropagation}>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
                className="p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-dark rounded-md shadow-lg z-10 border border-gray-700">
                  <button onClick={() => { setShowDeleteConfirm(true); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cinema-red hover:bg-dark-hover">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden pointer-events-none">
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover" 
            loading="lazy" 
            onError={(e) => { (e.target as HTMLImageElement).src = getPosterUrl(null); }}
          />
          {movie.rating > 0 && (
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  ⭐<span className="ml-1">{movie.rating.toFixed(1)}</span>
              </div>
          )}
        </div>

        <div className="w-full mt-4 pointer-events-none">
          <h3 className="font-bold text-white truncate" title={movie.title}>{movie.title}</h3>
          <p className="text-sm text-gray-400">{movie.year}</p>
          
          <p className="text-xs text-gray-500 mt-2 h-10 overflow-hidden" title={movie.overview}>
              {movie.overview.substring(0, 60)}{movie.overview.length > 60 ? '...' : ''}
          </p>
        </div>

        <div onClick={stopPropagation} className="w-full">
          <OpinionButtons 
            movie={movie}
            currentUserId={user.uid}
            onOpinionChange={handleOpinionChange}
            disabled={isUpdating}
          />
        </div>
        
        {error && <p className="text-xs text-cinema-red mt-2">{error}</p>}

        <div className="flex items-center space-x-2 mt-4 text-xs text-gray-500 justify-center pointer-events-none">
            <Avatar name={movie.addedByName} size="sm" />
            <span>Added by {movie.addedByName}</span>
        </div>
      </button>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this movie?"
        description={`This will permanently remove "${movie.title}" from your group's watchlist.`}
        confirmText="Delete Movie"
        confirmStyle="destructive"
        isLoading={isDeleting}
      />
    </>
  );
};

export default MovieCard;
