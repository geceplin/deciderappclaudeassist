import React, { useState, useEffect, useRef } from 'react';
import * as tmdbService from '../../services/tmdbService';
import { MovieDetails } from '../../types';
import { X, Search, Loader2 } from '../icons/Icons';
import { useDebounce } from '../../hooks/useDebounce';

interface MovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMovie: (movie: MovieDetails) => Promise<void>;
  existingTmdbIds: number[];
}

const MovieResultCard: React.FC<{
  movie: MovieDetails;
  onAdd: () => void;
  isAdding: boolean;
  isAdded: boolean;
}> = ({ movie, onAdd, isAdding, isAdded }) => {
  const posterUrl = tmdbService.getPosterUrl(movie.posterPath, 'w342');

  const getButtonContent = () => {
    if (isAdded) return <>✓ Added</>;
    if (isAdding) return <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Adding...</>;
    return <>+ Add</>;
  };
  
  return (
    <div className="group bg-dark-hover rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:ring-2 hover:ring-gold-dark transform hover:-translate-y-1 flex flex-col">
       <div className="aspect-[2/3] relative">
            <img 
                src={posterUrl} 
                alt={movie.title}
                className="w-full h-full object-cover" 
                loading="lazy" 
                onError={(e) => { (e.target as HTMLImageElement).src = tmdbService.getPosterUrl(null); }}
            />
             {movie.rating > 0 && (
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    ⭐<span className="ml-1">{movie.rating.toFixed(1)}</span>
                </div>
            )}
       </div>
       <div className="p-3 flex flex-col flex-grow">
          <h3 className="font-bold text-white truncate text-sm" title={movie.title}>{movie.title}</h3>
          <p className="text-xs text-gray-400">{movie.year}</p>
          <div className="mt-auto pt-2">
            <button
                onClick={onAdd}
                disabled={isAdding || isAdded}
                className={`w-full h-9 flex items-center justify-center text-sm font-semibold rounded-md transition-all duration-200 group-hover:scale-105
                    ${isAdded ? 'bg-cinema-green text-white cursor-not-allowed' : ''}
                    ${isAdding ? 'bg-gold-dark text-dark cursor-wait' : ''}
                    ${!isAdded && !isAdding ? 'bg-gold text-dark hover:bg-gold-light' : ''}
                `}
            >
                {getButtonContent()}
            </button>
          </div>
       </div>
    </div>
  );
};

const AddMovieModal: React.FC<MovieSearchModalProps> = ({ isOpen, onClose, onAddMovie, existingTmdbIds }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [popularMovies, setPopularMovies] = useState<MovieDetails[]>([]);
    const [searchResults, setSearchResults] = useState<MovieDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'popular' | 'search'>('popular');
    const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (popularMovies.length === 0) {
                const loadPopular = async () => {
                    setLoading(true);
                    try {
                        const data = await tmdbService.getPopularMovies();
                        // Fetch full details for popular movies to get genres etc.
                        const detailedMovies = await Promise.all(data.results.slice(0, 12).map(m => tmdbService.getMovieDetails(m.tmdbId)));
                        setPopularMovies(detailedMovies);
                    } catch (err) {
                        setError('Failed to load popular movies.');
                    }
                    setLoading(false);
                };
                loadPopular();
            }
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = '';
        }

        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    
    useEffect(() => {
        if (debouncedSearch.trim().length > 0) {
            setActiveTab('search');
            setLoading(true);
            setError('');
            const search = async () => {
                try {
                    const data = await tmdbService.searchMovies(debouncedSearch);
                    const detailedMovies = await Promise.all(data.results.slice(0, 20).map(m => tmdbService.getMovieDetails(m.tmdbId)));
                    setSearchResults(detailedMovies);
                } catch (err) {
                    setError('Failed to fetch search results.');
                }
                setLoading(false);
            };
            search();
        } else {
            setActiveTab('popular');
            setSearchResults([]);
        }
    }, [debouncedSearch]);
    
    const handleAddMovie = async (movie: MovieDetails) => {
        setAddingMovieId(movie.tmdbId);
        try {
            await onAddMovie(movie);
        } catch (err) {
            alert('Could not add movie. Please try again.');
        } finally {
            setAddingMovieId(null);
        }
    };
    
    const displayMovies = activeTab === 'popular' ? popularMovies : searchResults;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-dark-elevated rounded-2xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Add Movies</h2>
                        <button onClick={onClose} aria-label="Close modal" className="p-1 rounded-full hover:bg-dark-hover"><X className="w-6 h-6 text-gray-400"/></button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                        <input ref={inputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search any movie..." className="w-full h-12 pl-12 pr-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"/>
                    </div>
                </header>
                
                <div className="px-6 pt-4 flex-shrink-0">
                    <div className="flex border-b border-gray-700">
                        <button onClick={() => setActiveTab('popular')} disabled={debouncedSearch.length > 0} className={`py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'popular' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>🔥 Popular</button>
                        {debouncedSearch.length > 0 && <button onClick={() => setActiveTab('search')} className={`py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'search' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>🔍 Search Results</button>}
                    </div>
                </div>

                <main className="p-6 overflow-y-auto flex-grow">
                    {loading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => <div key={i} className="bg-dark-hover rounded-xl aspect-[2/3] animate-pulse"/>)}
                        </div>
                    )}
                    {!loading && error && <div className="text-center text-cinema-red">{error}</div>}
                    {!loading && !error && displayMovies.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {displayMovies.map(movie => (
                                <MovieResultCard
                                    key={movie.tmdbId}
                                    movie={movie}
                                    onAdd={() => handleAddMovie(movie)}
                                    isAdding={addingMovieId === movie.tmdbId}
                                    isAdded={existingTmdbIds.includes(movie.tmdbId)}
                                />
                            ))}
                        </div>
                    )}
                    {!loading && !error && displayMovies.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            {activeTab === 'search' ? `No results for "${debouncedSearch}".` : 'No popular movies found.'}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AddMovieModal;