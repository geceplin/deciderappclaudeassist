
import React from 'react';
import { Movie } from '../../types.ts';
import { getPosterUrl } from '../../services/tmdbService.ts';
import StreamingBadges from '../movies/StreamingBadges.tsx';

interface MovieReelProps {
  items: Movie[];
  targetIndex: number;
  isSpinning: boolean;
  spinDuration: number;
}

const ITEM_WIDTH = 160; // Corresponds to w-40
const GAP = 16; // Corresponds to gap-4
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + GAP;

const MovieReel: React.FC<MovieReelProps> = ({ items, targetIndex, isSpinning, spinDuration }) => {
  // Calculate the offset to center the target item
  // We want the target item's center to align with the reel's center
  const reelOffset = `calc(50% - ${ITEM_WIDTH / 2}px)`;
  
  // Calculate the total translation distance
  // The 'jitter' adds a small random amount to make the landing spot less predictable
  const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.6);
  const translation = targetIndex * TOTAL_ITEM_WIDTH + jitter;

  return (
    <div className="relative w-full h-64 overflow-hidden">
      {/* Center Marker */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gold rounded-full z-20 shadow-lg"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full bg-gradient-to-t from-transparent via-gold/30 to-transparent z-10 pointer-events-none"></div>
      
      {/* Fades */}
      <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-dark to-transparent z-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-dark to-transparent z-20 pointer-events-none"></div>

      <div
        className="flex items-center h-full gap-4"
        style={{
          transform: isSpinning
            ? `translateX(calc(${reelOffset} - ${translation}px))`
            : `translateX(${reelOffset})`,
          transition: `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
        }}
      >
        {items.map((movie, index) => (
          <div key={`${movie.id}-${index}`} className="relative flex-shrink-0 w-40 h-60 rounded-xl overflow-hidden shadow-lg group">
            <img
              src={getPosterUrl(movie.posterPath, 'w342')}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = getPosterUrl(null); }}
            />
            {/* Streaming Badges Overlay */}
            <StreamingBadges movieId={movie.tmdbId} mode="overlay" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieReel;
