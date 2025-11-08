import React, { useState, useEffect } from 'react';
import { MovieSearchResult } from '../../types';
import MovieBrowseCard from './MovieBrowseCard';

interface BrowseCategoryProps {
  category: {
    id: string;
    label: string;
    fetch: () => Promise<{ results: MovieSearchResult[] }>;
  };
  onMovieClick: (tmdbId: number) => void;
  onMovieAdd: (movie: MovieSearchResult) => void;
  existingTmdbIds: number[];
  addingMovieId: number | null;
}

const BrowseCategory: React.FC<BrowseCategoryProps> = ({ category, onMovieClick, onMovieAdd, existingTmdbIds, addingMovieId }) => {
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const data = await category.fetch();
        setMovies(data.results.slice(0, 15)); // Limit to 15 per category
      } catch (error) {
        console.error(`Error loading category ${category.label}:`, error);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, [category]);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gold mb-4">{category.label}</h3>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-32 h-48 bg-dark-hover rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3 -mb-3 cast-scrollbar">
          {movies.map(movie => (
            <MovieBrowseCard
              key={movie.tmdbId}
              movie={movie}
              onPreview={() => onMovieClick(movie.tmdbId)}
              onAdd={() => onMovieAdd(movie)}
              isAdded={existingTmdbIds.includes(movie.tmdbId)}
              isAdding={addingMovieId === movie.tmdbId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCategory;