import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Movie, Opinion } from '../../types';
import { setMovieOpinion } from '../../services/movieService';
import { getPosterUrl } from '../../services/tmdbService';
import Avatar from '../common/Avatar';
import OpinionButtons from './OpinionButtons';

interface MovieCardProps {
  movie: Movie;
  groupId: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, groupId }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const posterUrl = getPosterUrl(movie.posterPath, 'w500');
  
  if (!user) return null; // Should not happen in a protected route

  const handleOpinionChange = async (newOpinion: Opinion | null) => {
    setIsUpdating(true);
    setError('');
    try {
      await setMovieOpinion(groupId, movie.id, user.uid, newOpinion);
    } catch (err) {
      console.error("Failed to set opinion:", err);
      setError("Couldn't update opinion.");
      // Revert UI optimistically if needed, or show toast
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-dark-elevated rounded-2xl p-4 flex flex-col items-center text-center shadow-lg transition-shadow duration-300 hover:shadow-gold-glow">
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover" 
          loading="lazy" 
          onError={(e) => { (e.target as HTMLImageElement).src = getPosterUrl(null); }}
        />
        {movie.rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                ⭐<span className="ml-1">{movie.rating.toFixed(1)}</span>
            </div>
        )}
      </div>

      <div className="w-full mt-4">
        <h3 className="font-bold text-white truncate" title={movie.title}>{movie.title}</h3>
        <p className="text-sm text-gray-400">{movie.year}</p>
        
        <p className="text-xs text-gray-500 mt-2 h-10 overflow-hidden" title={movie.overview}>
            {movie.overview.substring(0, 60)}{movie.overview.length > 60 ? '...' : ''}
        </p>

        <OpinionButtons 
          movie={movie}
          currentUserId={user.uid}
          onOpinionChange={handleOpinionChange}
          disabled={isUpdating}
        />
        
        {error && <p className="text-xs text-cinema-red mt-2">{error}</p>}

        <div className="flex items-center space-x-2 mt-4 text-xs text-gray-500 justify-center">
            <Avatar name={movie.addedByName} size="sm" />
            <span>Added by {movie.addedByName}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;