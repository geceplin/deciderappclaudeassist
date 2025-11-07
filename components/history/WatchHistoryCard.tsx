import React, { useState } from 'react';
import { Movie } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getPosterUrl } from '../../services/tmdbService';
import { formatDate } from '../../utils/formatters';
import { Star } from '../icons/Icons';

interface WatchHistoryCardProps {
  movie: Movie;
  onRate: (rating: number) => void;
}

const StarRating: React.FC<{ value: number; onChange: (newValue: number) => void }> = ({ value, onChange }) => {
  const [hoverValue, setHoverValue] = useState(0);
  return (
    <div className="flex items-center" onMouseLeave={() => setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map(starValue => (
        <button
          key={starValue}
          onClick={() => onChange(starValue)}
          onMouseEnter={() => setHoverValue(starValue)}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              (hoverValue || value) >= starValue ? 'text-gold' : 'text-gray-600'
            }`}
            filled={(hoverValue || value) >= starValue}
          />
        </button>
      ))}
    </div>
  );
};

const WatchHistoryCard: React.FC<WatchHistoryCardProps> = ({ movie, onRate }) => {
  const { user } = useAuth();
  const userRating = user ? movie.groupRatings?.[user.uid] || 0 : 0;

  return (
    <div className="bg-dark-elevated rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="relative aspect-[2/3]">
        <img src={getPosterUrl(movie.posterPath)} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-cinema-green text-white text-xs font-bold px-2 py-1 rounded">
          ✓ WATCHED
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-white truncate">{movie.title}</h3>
        <p className="text-xs text-gray-500">
          Watched on {formatDate(movie.watchedTogetherDate)}
        </p>
        
        {typeof movie.averageGroupRating === 'number' && (
          <p className="text-sm font-bold flex items-center text-yellow-400 mt-2">
            ⭐<span className="ml-1 text-white">{movie.averageGroupRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400 ml-1"> (Group)</span>
          </p>
        )}

        <div className="mt-auto pt-4">
          <p className="text-xs text-gray-400 mb-1">Your rating:</p>
          <StarRating value={userRating} onChange={onRate} />
        </div>
      </div>
    </div>
  );
};

export default WatchHistoryCard;