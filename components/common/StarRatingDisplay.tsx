import React from 'react';
import { Star } from '../icons/Icons';

interface StarRatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  max?: number;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating = 0, size = 'md', max = 5 }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        let fillPercentage = 0;
        if (starValue <= rating) {
          fillPercentage = 100;
        } else if (starValue - 1 < rating && starValue > rating) {
          fillPercentage = (rating - index) * 100;
        }

        return (
          <div key={index} className={`relative ${sizeClasses[size]}`}>
            {/* Background star (empty) */}
            <Star className={`text-gray-600 ${sizeClasses[size]}`} />
            {/* Filled star with clip-path like effect */}
            {fillPercentage > 0 && (
              <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star className={`text-gold ${sizeClasses[size]}`} filled />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarRatingDisplay;
