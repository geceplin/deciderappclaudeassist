import React from 'react';
import { MovieSearchResult } from '../../types';
import * as tmdbService from '../../services/tmdbService';
import { Plus, Check, Loader2 } from '../icons/Icons';

interface MovieBrowseCardProps {
  movie: MovieSearchResult;
  onPreview: () => void;
  onAdd: () => void;
  isAdded: boolean;
  isAdding: boolean;
}

const MovieBrowseCard: React.FC<MovieBrowseCardProps> = ({ movie, onPreview, onAdd, isAdded, isAdding }) => {
  const posterUrl = tmdbService.getPosterUrl(movie.posterPath, 'w342');
  
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent preview from opening
    onAdd();
  }

  const getButtonContent = () => {
    if (isAdded) return <Check className="w-5 h-5 text-white" />;
    if (isAdding) return <Loader2 className="w-5 h-5 animate-spin" />;
    return <Plus className="w-5 h-5" />;
  };
  
  const getButtonClasses = () => {
    if (isAdded) return 'bg-cinema-green';
    if (isAdding) return 'bg-gold-dark cursor-wait';
    return 'bg-black/60 group-hover:bg-gold group-hover:text-dark';
  }

  return (
    <div 
        className="group relative w-32 h-48 rounded-lg overflow-hidden shadow-lg flex-shrink-0 cursor-pointer transition-transform transform hover:-translate-y-1"
        onClick={onPreview}
    >
      <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
        <h4 className="text-xs font-bold truncate">{movie.title}</h4>
        <p className="text-xs text-gray-300">{movie.year}</p>
      </div>
      <button
        onClick={handleAddClick}
        disabled={isAdding || isAdded}
        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${getButtonClasses()}`}
        aria-label={isAdded ? "Added" : "Add movie"}
      >
        {getButtonContent()}
      </button>
    </div>
  );
};

export default MovieBrowseCard;