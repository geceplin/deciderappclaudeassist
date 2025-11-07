import React from 'react';
import { Movie } from '../../types';
import { getPosterUrl } from '../../services/tmdbService';
import { Film } from '../icons/Icons';

interface MovieReelProps {
  movies: Movie[];
  rotation: number;
  isSpinning: boolean;
  result: Movie | null;
}

const MovieReel: React.FC<MovieReelProps> = ({ movies, rotation, isSpinning, result }) => {
  const reelSize = 500; // The diameter of the main reel in px
  const posterSize = { width: 80, height: 120 };
  const radius = (reelSize / 2) - (posterSize.height / 2) - 24; // 24 is rim width

  return (
    <div className="relative flex items-center justify-center scale-75 sm:scale-100">
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${isSpinning ? 'scale-105' : 'scale-100'}`}
        style={{ width: `${reelSize}px`, height: `${reelSize}px` }}
      >
        <div 
          className="w-full h-full rounded-full border-[24px] border-gold bg-dark-elevated shadow-gold-glow relative"
        >
          {/* Film Strip Container */}
          <div
            className="w-full h-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
              filter: isSpinning ? 'blur(3px)' : 'blur(0px)',
            }}
          >
            {movies.map((movie, index) => {
              const angle = (360 / movies.length) * index;
              const isWinner = result?.id === movie.id && !isSpinning;
              const transform = `
                rotate(${angle}deg) 
                translateY(-${radius}px) 
                rotate(-${angle}deg)
                scale(${isWinner ? 1.25 : 1})
              `;

              return (
                <div
                  key={movie.id}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center transition-transform duration-500"
                  style={{ 
                    width: `${posterSize.width}px`, 
                    height: `${posterSize.height}px`, 
                    transform,
                    zIndex: isWinner ? 10 : 1,
                  }}
                >
                  <img
                    src={getPosterUrl(movie.posterPath, 'w185')}
                    alt={movie.title}
                    className={`w-full h-full object-cover rounded-sm border-2 ${isWinner ? 'border-gold' : 'border-white/50'}`}
                  />
                </div>
              );
            })}
          </div>
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-dark rounded-full flex flex-col items-center justify-center border-4 border-gold-dark">
            <Film className="w-10 h-10 text-gold" />
            <span className="text-xs text-gray-400 mt-1 font-bold">DECIDE</span>
          </div>
        </div>
      </div>
       {/* Selector Pointer */}
      <div 
        className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
        style={{
            width: 0,
            height: 0,
            borderLeft: '16px solid transparent',
            borderRight: '16px solid transparent',
            borderTop: '24px solid white',
            filter: 'drop-shadow(0 -2px 4px rgba(255,195,0,0.7))'
        }}
      />
    </div>
  );
};

export default MovieReel;
