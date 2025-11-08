import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as tmdbService from '../../services/tmdbService';
import { MovieDetails, MovieSearchResult } from '../../types';
import { X, Search, Loader2 } from '../icons/Icons';
import { useDebounce } from '../../hooks/useDebounce';
import MoviePreviewModal from './MoviePreviewModal';
import BrowseCategory from './BrowseCategory';

interface MovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMovie: (movie: MovieDetails) => Promise<void>;
  existingTmdbIds: number[];
}

const MovieResultCard: React.FC<{
  movie: MovieSearchResult;
  onAdd: () => void;
  onPreview: () => void;
  isAdding: boolean;
  isAdded: boolean;
}> = ({ movie, onAdd, onPreview, isAdding, isAdded }) => {
  const posterUrl = tmdbService.getPosterUrl(movie.posterPath, 'w342');

  const getButtonContent = () => {
    if (isAdded) return <>✓ Added</>;
    if (isAdding) return <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Adding...</>;
    return <>+ Add</>;
  };
  
  return (
    <div className="bg-dark-hover rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:ring-2 hover:ring-gold-dark transform hover:-translate-y-1 flex flex-col">
       <div className="aspect-[2/3] relative cursor-pointer" onClick={onPreview}>
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
                className={`w-full h-9 flex items-center justify-center text-sm font-semibold rounded-md transition-all duration-200
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
    const debouncedSearch = useDebounce(searchQuery, 400);
    
    const [popularMovies, setPopularMovies] = useState<MovieSearchResult[]>([]);
    const [popularPage, setPopularPage] = useState(1);
    const [hasMorePopular, setHasMorePopular] = useState(true);

    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    
    const [activeTab, setActiveTab] = useState<'popular' | 'search' | 'browse'>('popular');
    const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
    const [previewMovieId, setPreviewMovieId] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const loadMoreRef = useRef(null);

    const loadPopular = useCallback(async (page: number) => {
        if (page === 1) setLoading(true); else setLoadingMore(true);
        setError('');
        try {
            const data = await tmdbService.getPopularMovies(page);
            setPopularMovies(prev => page === 1 ? data.results : [...prev, ...data.results]);
            setHasMorePopular(page < data.total_pages);
            setPopularPage(page);
        } catch (err) { setError('Failed to load popular movies.'); }
        finally { page === 1 ? setLoading(false) : setLoadingMore(false); }
    }, []);

    // Initial load
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (popularMovies.length === 0) {
                loadPopular(1);
            }
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = '';
        }
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
    }, [isOpen, popularMovies.length, loadPopular]);
    
    // Search effect
    useEffect(() => {
        if (debouncedSearch.trim().length > 0) {
            setActiveTab('search');
            setLoading(true);
            setError('');
            const search = async () => {
                try {
                    const data = await tmdbService.searchMovies(debouncedSearch);
                    setSearchResults(data.results);
                } catch (err) { setError('Failed to fetch search results.'); }
                setLoading(false);
            };
            search();
        } else if (activeTab === 'search') {
            setActiveTab('popular');
        }
    }, [debouncedSearch]);
    
    // Infinite scroll observer
    useEffect(() => {
        if (!loadMoreRef.current || !hasMorePopular || activeTab !== 'popular') return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loadingMore) {
                loadPopular(popularPage + 1);
            }
        }, { threshold: 0.8 });
        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [popularPage, hasMorePopular, loadingMore, activeTab, loadPopular]);
    
    const handleAddMovie = async (movie: MovieDetails | MovieSearchResult) => {
        setAddingMovieId(movie.tmdbId);
        try {
            // Ensure we have MovieDetails
            const movieDetails = 'genres' in movie ? movie : await tmdbService.getMovieDetails(movie.tmdbId);
            await onAddMovie(movieDetails);
        } catch (err: any) {
            alert(err.message || 'Could not add movie. Please try again.');
        } finally {
            setAddingMovieId(null);
        }
    };
    
    const browseCategories = [
        { id: 'trending', label: '🔥 Trending Today', fetch: () => tmdbService.getTrendingMovies('day') },
        { id: 'top-rated', label: '⭐ Top Rated', fetch: tmdbService.getTopRatedMovies },
        { id: 'now-playing', label: '🎬 In Theaters', fetch: tmdbService.getNowPlayingMovies },
    ];
    
    const TabButton: React.FC<{tab: typeof activeTab, label: string}> = ({tab, label}) => (
        <button onClick={() => setActiveTab(tab)} disabled={tab === 'search' && !debouncedSearch.length} className={`py-3 px-4 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'} ${tab === 'search' && !debouncedSearch.length ? 'hidden' : ''}`}>
            {label}
        </button>
    );

    const renderContent = () => {
        if (loading) {
            return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => <div key={i} className="bg-dark-hover rounded-xl aspect-[2/3] animate-pulse"/>)}
            </div>
        }
        if (error) return <div className="text-center text-cinema-red">{error}</div>;

        if (activeTab === 'search') {
            if (searchResults.length === 0) return <div className="text-center py-12 text-gray-400">No results for "{debouncedSearch}".</div>;
            return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map(movie => <MovieResultCard key={movie.tmdbId} movie={movie} onAdd={() => handleAddMovie(movie)} onPreview={() => setPreviewMovieId(movie.tmdbId)} isAdding={addingMovieId === movie.tmdbId} isAdded={existingTmdbIds.includes(movie.tmdbId)} />)}
            </div>
        }
        
        if (activeTab === 'browse') {
            return <div className="space-y-4">
                {browseCategories.map(cat => <BrowseCategory key={cat.id} category={cat} onMovieClick={setPreviewMovieId} onMovieAdd={handleAddMovie} existingTmdbIds={existingTmdbIds} addingMovieId={addingMovieId} />)}
            </div>;
        }

        // Popular Tab
        return <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {popularMovies.map(movie => <MovieResultCard key={movie.tmdbId} movie={movie} onAdd={() => handleAddMovie(movie)} onPreview={() => setPreviewMovieId(movie.tmdbId)} isAdding={addingMovieId === movie.tmdbId} isAdded={existingTmdbIds.includes(movie.tmdbId)} />)}
            </div>
            {hasMorePopular && <div ref={loadMoreRef} className="col-span-full py-8 flex justify-center">{loadingMore && <Loader2 className="animate-spin text-gold" />}</div>}
        </>
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
                <div className="bg-dark-elevated rounded-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
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
                            <TabButton tab="popular" label="🔥 Popular" />
                            <TabButton tab="browse" label="🔭 Browse" />
                            <TabButton tab="search" label="🔍 Search Results" />
                        </div>
                    </div>

                    <main className="p-6 overflow-y-auto flex-grow">
                        {renderContent()}
                    </main>
                </div>
            </div>
            {previewMovieId && (
                <MoviePreviewModal 
                    tmdbId={previewMovieId}
                    onClose={() => setPreviewMovieId(null)}
                    onAddMovie={handleAddMovie}
                    isAdded={existingTmdbIds.includes(previewMovieId)}
                />
            )}
        </>
    );
};

export default AddMovieModal;