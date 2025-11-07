import { MovieSearchResult } from '../types';

const API_KEY = 'ec80894db7608dc7d6bea55e2a6aa650';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

const PLACEHOLDER_POSTER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750"%3E%3Crect fill="%232C2C2C" width="500" height="750"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="30" text-anchor="middle" x="250" y="375"%3ENo Poster%3C/text%3E%3C/svg%3E';

const cache = new Map<string, { data: any, timestamp: number }>();

/**
 * Fetches data from cache or network, caching the result.
 * @param cacheKey Unique key for the cache.
 * @param fetcher Async function to fetch data if not in cache.
 * @returns The fetched or cached data.
 */
const _fetchWithCache = async <T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> => {
    const cachedItem = cache.get(cacheKey);
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION_MS)) {
        console.log(`✅ Using cached data for: ${cacheKey}`);
        return cachedItem.data as T;
    }

    const data = await fetcher();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
};

/**
 * A generic fetch wrapper for the TMDb API.
 * @param endpoint The API endpoint to call (e.g., '/search/movie').
 * @param params Query parameters for the request.
 * @returns The JSON response from the API.
 */
const _fetchFromTMDb = async (endpoint: string, params: Record<string, string | number> = {}): Promise<any> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    for (const key in params) {
        url.searchParams.append(key, String(params[key]));
    }

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Gracefully handle non-json errors
            console.error(`❌ TMDb API Error (${response.status}):`, errorData.status_message || 'Unknown error');
            if (response.status === 401) {
                throw new Error('Invalid TMDb API Key. Please contact the developer.');
            }
            throw new Error(errorData.status_message || 'Failed to fetch data from TMDb.');
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Network or fetch error:', error);
        throw error;
    }
};

/**
 * Maps a movie object from the TMDb API to our internal MovieSearchResult type.
 * @param tmdbMovie The raw movie object from TMDb.
 * @returns A MovieSearchResult object.
 */
const mapToMovieSearchResult = (tmdbMovie: any): MovieSearchResult => ({
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title,
    year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.substring(0, 4), 10) : 0,
    overview: tmdbMovie.overview,
    posterPath: tmdbMovie.poster_path,
    rating: tmdbMovie.vote_average,
});

/**
 * Searches for movies on TMDb.
 * @param query The search query.
 * @param page The page number to fetch.
 * @returns A promise that resolves to the search results.
 */
export const searchMovies = async (query: string, page = 1): Promise<{ results: MovieSearchResult[], total_results: number }> => {
    if (!query.trim()) {
        return { results: [], total_results: 0 };
    }
    console.log(`🔍 Searching TMDb for: ${query}`);
    const cacheKey = `search-${query}-${page}`;

    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb('/search/movie', {
        query,
        page,
        include_adult: 'false',
        language: 'en-US',
    }));
    
    console.log(`✅ Found ${data.total_results} movies for "${query}"`);
    return {
        ...data,
        results: data.results.map(mapToMovieSearchResult)
    };
};

/**
 * Fetches the full details for a single movie.
 * @param movieId The ID of the movie to fetch.
 * @returns A promise that resolves to the movie details.
 */
export const getMovieDetails = async (movieId: number) => {
    console.log(`🔍 Fetching details for movie ID: ${movieId}`);
    const cacheKey = `movie-${movieId}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/movie/${movieId}`, { language: 'en-US' }));
    console.log(`✅ Fetched details for "${data.title}"`);
    return data;
};

/**
 * Fetches a list of popular movies.
 * @param page The page number to fetch.
 * @returns A promise that resolves to the list of popular movies.
 */
export const getPopularMovies = async (page = 1): Promise<{ results: MovieSearchResult[], total_results: number }> => {
    console.log(`🔍 Fetching popular movies (page ${page})`);
    const cacheKey = `popular-${page}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb('/movie/popular', { page, language: 'en-US' }));
    console.log(`✅ Fetched ${data.results.length} popular movies`);
    return {
      ...data,
      results: data.results.map(mapToMovieSearchResult)
    };
};

/**
 * Fetches a list of trending movies.
 * @param timeWindow The time window for trending ('day' or 'week').
 * @returns A promise that resolves to the list of trending movies.
 */
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week') => {
    console.log(`🔍 Fetching trending movies for the ${timeWindow}`);
    const cacheKey = `trending-${timeWindow}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/trending/movie/${timeWindow}`, { language: 'en-US' }));
    console.log(`✅ Fetched ${data.results.length} trending movies`);
    return data;
};

/**
 * Constructs the full URL for a movie poster image.
 * @param path The poster path from the TMDb API.
 * @param size The desired image width (e.g., 'w92', 'w500', 'original').
 * @returns The full image URL or a placeholder if the path is missing.
 */
export const getPosterUrl = (path: string | null | undefined, size = 'w500'): string => {
    if (!path) {
        return PLACEHOLDER_POSTER;
    }
    return `${IMAGE_BASE_URL}${size}${path}`;
};

/**
 * Constructs the full URL for a movie backdrop image.
 * @param path The backdrop path from the TMDb API.
 * @param size The desired image width (e.g., 'w300', 'w1280', 'original').
 * @returns The full image URL or a placeholder if the path is missing.
 */
export const getBackdropUrl = (path: string | null | undefined, size = 'w1280'): string => {
    if (!path) {
        return PLACEHOLDER_POSTER; // Can be a different placeholder if desired
    }
    return `${IMAGE_BASE_URL}${size}${path}`;
};

/**
 * Clears the in-memory cache. Useful for development.
 */
export const clearCache = (): void => {
    cache.clear();
    console.log('🧹 TMDb cache cleared.');
};
