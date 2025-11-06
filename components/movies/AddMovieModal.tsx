import React, { useState, useEffect, useRef } from 'react';
import { searchMovies, addMovieToGroup } from '../../services/movieService';
import { getPosterUrl } from '../../services/tmdbService';
import { MovieSearchResult } from '../../types';
import { X, Search, Plus } from '../icons/Icons';
import { useAuth } from '../../hooks/useAuth';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

const SearchResultCard: React.FC<{
    movie: MovieSearchResult,
    onAdd: () => void,
    isAdding: boolean,
}> = ({ movie, onAdd, isAdding }) => {
    const posterUrl = getPosterUrl(movie.posterPath, 'w300');
    return (
        <div className="group relative aspect-[2/3] bg-dark rounded-lg overflow-hidden shadow-md">
            <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onAdd}
                    disabled={isAdding}
                    className="w-12 h-12 bg-gold text-dark rounded-full flex items-center justify-center hover:bg-gold-light disabled:bg-gold-dark"
                    aria-label={`Add ${movie.title}`}
                >
                    {isAdding ? (
                         <div className="w-6 h-6 border-4 border-dark border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Plus className="w-8 h-8"/>
                    )}
                </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-semibold truncate">{movie.title} ({movie.year})</p>
            </div>
        </div>
    );
}

const AddMovieModal: React.FC<AddMovieModalProps> = ({ isOpen, onClose, groupId }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingMovieId, setAddingMovieId] = useState<string | null>(null);
  
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
        setQuery('');
        setResults([]);
        setError('');
        setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) { // Changed to 2 for quicker searching
      setResults([]);
      setError('');
      setLoading(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    
    setLoading(true);
    setError('');

    timeoutRef.current = window.setTimeout(async () => {
        try {
            const movieResults = await searchMovies(query);
            setResults(movieResults);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, 300); // Debounce API calls (reduced to 300ms)

    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }
  }, [query]);

  const handleAddMovie = async (movie: MovieSearchResult) => {
    if (!user) return;
    setAddingMovieId(movie.title + movie.year); // Unique identifier for loading state
    try {
        await addMovieToGroup(groupId, movie, user.uid);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setAddingMovieId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-50 p-4 pt-[10vh] overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-dark-elevated rounded-2xl shadow-lg w-full max-w-2xl transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Add a Movie</h2>
                <button onClick={onClose} aria-label="Close modal">
                    <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search any movie..."
                    className="w-full h-14 pl-12 pr-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                    autoFocus
                />
            </div>
        </div>
        
        <div className="p-6 pt-0 min-h-[300px]">
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-dark rounded-lg"></div>
                    ))}
                </div>
            )}
            {error && <p className="text-center text-cinema-red mt-4">{error}</p>}
            
            {!loading && !error && results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {results.map((movie) => (
                        <SearchResultCard
                            key={movie.title + movie.year}
                            movie={movie}
                            onAdd={() => handleAddMovie(movie)}
                            isAdding={addingMovieId === (movie.title + movie.year)}
                        />
                    ))}
                </div>
            )}

            {!loading && !error && query.trim().length >=2 && results.length === 0 && (
                <p className="text-center text-gray-400 mt-4">No results found for "{query}". Try a different search.</p>
            )}
            {!loading && !error && query.trim().length < 2 && (
                 <p className="text-center text-gray-500 mt-4">Start typing to find movies</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AddMovieModal;
