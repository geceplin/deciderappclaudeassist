import { MovieSearchResult, MovieDetails, CastMember, CrewMember, Video, MoviePreview } from '../types';

const API_KEY = 'ec80894db7608dc7d6bea55e2a6aa650';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const PREVIEW_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const PLACEHOLDER_POSTER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750"%3E%3Crect fill="%232C2C2C" width="500" height="750"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="30" text-anchor="middle" x="250" y="375"%3ENo Poster%3C/text%3E%3C/svg%3E';
const PLACEHOLDER_PROFILE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="185" height="278"%3E%3Crect fill="%232C2C2C" width="185" height="278"/%3E%3C/svg%3E';

const cache = new Map<string, { data: any, timestamp: number }>();

/**
 * Fetches data from cache or network, caching the result.
 * @param cacheKey Unique key for the cache.
 * @param fetcher Async function to fetch data if not in cache.
 * @param duration Cache duration in milliseconds.
 * @returns The fetched or cached data.
 */
const _fetchWithCache = async <T>(cacheKey: string, fetcher: () => Promise<T>, duration: number = CACHE_DURATION_MS): Promise<T> => {
    const cachedItem = cache.get(cacheKey);
    if (cachedItem && (Date.now() - cachedItem.timestamp < duration)) {
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
 * Maps a movie object from the TMDb API to our internal MovieDetails type.
 * @param tmdbMovie The raw movie object from TMDb.
 * @returns A MovieDetails object.
 */
const mapToMovieDetails = (tmdbMovie: any): MovieDetails => ({
    ...mapToMovieSearchResult(tmdbMovie),
    backdropPath: tmdbMovie.backdrop_path,
    genres: tmdbMovie.genres ? tmdbMovie.genres.map((g: { name: string }) => g.name) : [],
});

/**
 * Searches for movies on TMDb.
 * @param query The search query.
 * @param page The page number to fetch.
 * @returns A promise that resolves to the search results.
 */
export const searchMovies = async (query: string, page = 1): Promise<{ results: MovieSearchResult[], total_results: number, total_pages: number }> => {
    if (!query.trim()) {
        return { results: [], total_results: 0, total_pages: 0 };
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
export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
    console.log(`🔍 Fetching details for movie ID: ${movieId}`);
    const cacheKey = `movie-${movieId}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/movie/${movieId}`, { language: 'en-US' }));
    console.log(`✅ Fetched details for "${data.title}"`);
    return mapToMovieDetails(data);
};

/**
 * Fetches movie credits (cast and crew).
 * @param movieId The ID of the movie.
 * @returns A promise resolving to the cast and director.
 */
export const getMovieCredits = async (movieId: number): Promise<{ cast: CastMember[], director: CrewMember | null }> => {
    console.log(`🔍 Fetching credits for movie ID: ${movieId}`);
    const cacheKey = `credits-${movieId}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/movie/${movieId}/credits`));
    
    const cast: CastMember[] = data.cast.slice(0, 15).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path,
    }));
    
    const director = data.crew.find((c: any) => c.job === 'Director') || null;

    console.log(`✅ Fetched credits for movie ID: ${movieId}`);
    return { cast, director };
};

/**
 * Fetches movie videos (trailers, teasers).
 * @param movieId The ID of the movie.
 * @returns A promise resolving to a list of videos.
 */
export const getMovieVideos = async (movieId: number): Promise<Video[]> => {
    console.log(`🔍 Fetching videos for movie ID: ${movieId}`);
    const cacheKey = `videos-${movieId}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/movie/${movieId}/videos`));
    return data.results;
};

/**
 * Finds the official trailer Key from a list of videos for embedding.
 * @param videos Array of video objects from TMDb.
 * @returns The YouTube video ID, or null.
 */
export const getTrailerKey = (videos: Video[]): string | null => {
    if (!videos || videos.length === 0) return null;
    const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
    const anyTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube'); 
    const trailer = officialTrailer || anyTrailer || teaser;
    return trailer ? trailer.key : null;
};

/**
 * Fetches a lightweight preview for a movie, optimized for modals.
 * Includes trailer key if available.
 * @param movieId The TMDb ID of the movie.
 * @returns A promise resolving to the movie preview data.
 */
export const getMoviePreview = async (movieId: number): Promise<MoviePreview> => {
    const cacheKey = `preview-${movieId}`;
    const fetcher = async () => {
        const data = await _fetchFromTMDb(`/movie/${movieId}`, {
            append_to_response: 'credits,videos',
            language: 'en-US'
        });
        return {
            tmdbId: data.id,
            title: data.title,
            year: data.release_date ? parseInt(data.release_date.substring(0, 4), 10) : null,
            rating: data.vote_average,
            runtime: data.runtime,
            genres: data.genres?.map((g: any) => g.name) || [],
            overview: data.overview || 'No description available.',
            cast: data.credits?.cast?.slice(0, 5).map((actor: any) => ({
                name: actor.name,
                character: actor.character,
                profilePath: actor.profile_path,
            })) || [],
            posterPath: data.poster_path,
            backdropPath: data.backdrop_path,
            youtubeKey: getTrailerKey(data.videos?.results || []),
        };
    };
    return _fetchWithCache(cacheKey, fetcher, PREVIEW_CACHE_DURATION_MS);
};

/**
 * Helper to fetch just the trailer key for a movie.
 * @param movieId The TMDb ID.
 * @returns The trailer key or null.
 */
export const getMovieTrailer = async (movieId: number): Promise<string | null> => {
    const videos = await getMovieVideos(movieId);
    return getTrailerKey(videos);
};


/**
 * Fetches a list of popular movies.
 * @param page The page number to fetch.
 * @returns A promise that resolves to the list of popular movies.
 */
export const getPopularMovies = async (page = 1): Promise<{ results: MovieSearchResult[], total_pages: number }> => {
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
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<{ results: MovieSearchResult[], total_results: number }> => {
    console.log(`🔍 Fetching trending movies for the ${timeWindow}`);
    const cacheKey = `trending-${timeWindow}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/trending/movie/${timeWindow}`, { language: 'en-US' }));
    console.log(`✅ Fetched ${data.results.length} trending movies`);
    return {
      ...data,
      results: data.results.map(mapToMovieSearchResult)
    };
};

export const getTopRatedMovies = async (page = 1): Promise<{ results: MovieSearchResult[] }> => {
    const data = await _fetchFromTMDb('/movie/top_rated', { page });
    return { results: data.results.map(mapToMovieSearchResult) };
};

export const getNowPlayingMovies = async (page = 1): Promise<{ results: MovieSearchResult[] }> => {
    const data = await _fetchFromTMDb('/movie/now_playing', { page });
    return { results: data.results.map(mapToMovieSearchResult) };
};

export const getUpcomingMovies = async (page = 1): Promise<{ results: MovieSearchResult[] }> => {
    const data = await _fetchFromTMDb('/movie/upcoming', { page });
    return { results: data.results.map(mapToMovieSearchResult) };
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
 * Constructs the full URL for an actor's profile image.
 * @param path The profile path from the TMDb API.
 * @param size The desired image width.
 * @returns The full image URL or a placeholder if path is missing.
 */
export const getProfileUrl = (path: string | null | undefined, size = 'w185'): string => {
    if (!path) {
        return PLACEHOLDER_PROFILE;
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
        // You might want a different, landscape placeholder for backdrops
        return PLACEHOLDER_POSTER;
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