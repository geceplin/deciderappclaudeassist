import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Movie, UserProfile } from '../../types';
import { toggleMovieLike, removeMovieFromGroup } from '../../services/movieService';
import { getPosterUrl } from '../../services/tmdbService';
import { Heart, Trash2 } from '../icons/Icons';
import Avatar from '../common/Avatar';

interface MovieCardProps {
  movie: Movie;
  groupId: string;
  addedBy: UserProfile | undefined;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, groupId, addedBy }) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLiked = user ? movie.likes.includes(user.uid) : false;
  const canDelete = user ? movie.addedBy === user.uid : false;
  const posterUrl = getPosterUrl(movie.posterPath, 'w500');

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      await toggleMovieLike(groupId, movie.id, user.uid);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !canDelete || isDeleting) return;
    if (window.confirm(`Are you sure you want to remove "${movie.title}"?`)) {
        setIsDeleting(true);
        try {
            await removeMovieFromGroup(groupId, movie.id, user.uid);
        } catch (error) {
            console.error("Failed to delete movie:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Could not delete movie.'}`);
        } finally {
            setIsDeleting(false);
        }
    }
  };

  return (
    <div className="group relative aspect-[2/3] bg-dark-elevated rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-gold-glow">
        <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 transition-opacity duration-300"></div>

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="font-bold truncate">{movie.title}</h3>
            <p className="text-xs text-gray-400">{movie.year}</p>
        </div>
        
        <div className="absolute top-2 left-2 flex items-center space-x-1" title={`Added by ${addedBy?.displayName || 'Unknown'}`}>
            <Avatar name={addedBy?.displayName} size="sm" />
        </div>

        {canDelete && (
            <button 
                onClick={handleDelete}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-gray-300 hover:text-cinema-red hover:bg-black/70 transition-colors"
                aria-label="Remove movie"
                disabled={isDeleting}
            >
                <Trash2 className="w-4 h-4" />
            </button>
        )}

        <div className="absolute bottom-2 right-2">
             <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${isLiked ? 'bg-gold text-dark' : 'bg-black/60 text-white hover:bg-black/80'}`}
             >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{movie.likes.length}</span>
            </button>
        </div>
    </div>
  );
};

export default MovieCard;
