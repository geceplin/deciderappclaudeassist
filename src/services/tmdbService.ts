
import { MovieSearchResult, MovieDetails, CastMember, CrewMember, Video, MoviePreview, StreamingAvailability } from '../types';

const getApiKey = () => {
  try {
    return (import.meta as any).env?.VITE_TMDB_API_KEY;
  } catch (e) {
    return undefined;
  }
};

// Use the provided key as a robust fallback
const API_KEY = getApiKey() || 'ec80894db7608dc7d6bea55e2a6aa650';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const PREVIEW_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const PLACEHOLDER_POSTER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750"%3E%3Crect fill="%232C2C2C" width="500" height="750"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="30" text-anchor="middle" x="250" y="375"%3ENo Poster%3C/text%3E%3C/svg%3E';
const PLACEHOLDER_PROFILE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="185" height="278"%3E%3Crect fill="%232C2C2C" width="185" height="278"/%3E%3C/svg%3E';

const cache = new Map<string, { data: any, timestamp: number }>();

/**
 * Common streaming services (for fallback/manual matching)
 */
export const POPULAR_PROVIDERS: Record<string | number, { id?: number; name: string; color: string }> = {
  8: { name: 'Netflix', color: '#E50914' },
  119: { name: 'Amazon Prime Video', color: '#00A8E1' },
  337: { name: 'Disney+', color: '#113CCF' },
  384: { name: 'HBO Max', color: '#B026FF' },
  531: { name: 'Paramount+', color: '#0064FF' },
  350: { name: 'Apple TV+', color: '#000000' },
  // Map names for fallback
  'Netflix': { id: 8, name: 'Netflix', color: '#E50914' },
  'Amazon Prime Video': { id: 119, name: 'Amazon Prime Video', color: '#00A8E1' },
  'Disney+': { id: 337, name: 'Disney+', color: '#113CCF' }
};

/**
 * Fetches data from cache or network, caching the result.
 */
const _fetchWithCache = async <T>(cacheKey: string, fetcher: () => Promise<T>, duration: number = CACHE_DURATION_MS): Promise<T> => {
    const cachedItem = cache.get(cacheKey);
    if (cachedItem && (Date.now() - cachedItem.timestamp < duration)) {
        // console.log(`✅ Using cached data for: ${cacheKey}`);
        return cachedItem.data as T;
    }

    const data = await fetcher();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
};


/**
 * A generic fetch wrapper for the TMDb API.
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
            const errorData = await response.json().catch(() => ({})); 
            console.error(`❌ TMDb API Error (${response.status}):`, errorData.status_message || 'Unknown error');
            if (response.status === 401) {
                console.error('CRITICAL: Invalid TMDb API Key.');
                throw new Error('Invalid TMDb API Key.');
            }
            throw new Error(errorData.status_message || 'Failed to fetch data from TMDb.');
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Network or fetch error:', error);
        throw error;
    }
};

const mapToMovieSearchResult = (tmdbMovie: any): MovieSearchResult => ({
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title,
    year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.substring(0, 4), 10) : 0,
    overview: tmdbMovie.overview,
    posterPath: tmdbMovie.poster_path,
    rating: tmdbMovie.vote_average,
});

const mapToMovieDetails = (tmdbMovie: any): MovieDetails => ({
    ...mapToMovieSearchResult(tmdbMovie),
    backdropPath: tmdbMovie.backdrop_path,
    genres: tmdbMovie.genres ? tmdbMovie.genres.map((g: { name: string }) => g.name) : [],
});

export const searchMovies = async (query: string, page = 1): Promise<{ results: MovieSearchResult[], total_results: number, total_pages: number }> => {
    if (!query.trim()) {
        return { results: [], total_results: 0, total_pages: 0 };
    }
    const cacheKey = `search-${query}-${page}`;

    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb('/search/movie', {
        query,
        page,
        include_adult: 'false',
        language: 'en-US',
    }));
    
    return {
        ...data,
        results: data.results.map(mapToMovieSearchResult)
    };
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
    const cacheKey = `movie-${movieId}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/movie/${movieId}`, { language: 'en-US' }));
    return mapToMovieDetails(data);
};

export const getMovieCredits = async (movieId: number): Promise<{ cast: CastMember[], director: CrewMember | null }> => {
    const cacheKey = `credits-${movieId}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/movie/${movieId}/credits`));
    
    const cast: CastMember[] = data.cast.slice(0, 15).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path,
    }));
    
    const director = data.crew.find((c: any) => c.job === 'Director') || null;
    return { cast, director };
};

export const getMovieVideos = async (movieId: number): Promise<Video[]> => {
    const cacheKey = `videos-${movieId}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/movie/${movieId}/videos`));
    return data.results;
};

export const getTrailerKey = (videos: Video[]): string | null => {
    if (!videos || videos.length === 0) return null;
    const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
    const anyTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube'); 
    const trailer = officialTrailer || anyTrailer || teaser;
    return trailer ? trailer.key : null;
};

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

export const getMovieTrailer = async (movieId: number): Promise<string | null> => {
    const videos = await getMovieVideos(movieId);
    return getTrailerKey(videos);
};

export const getStreamingAvailability = async (movieId: number, country: string = 'US'): Promise<StreamingAvailability | null> => {
    // console.log(`🔍 Fetching streaming for movie ${movieId} in ${country}`);
    
    // Updated cache key to prevent stale empty data from previous broken attempts
    const cacheKey = `streaming-v2-${movieId}-${country}`;
    
    const fetcher = async () => {
        try {
            const data = await _fetchFromTMDb(`/movie/${movieId}/watch/providers`);
            const results = data.results || {};
            const countryData = results[country];

            if (!countryData) {
                // Fallback to US if no data for requested country and it's not already US
                if (country !== 'US' && results['US']) {
                    const usData = results['US'];
                    return {
                        flatrate: usData.flatrate || [],
                        rent: usData.rent || [],
                        buy: usData.buy || [],
                        link: usData.link
                    };
                }
                // If really no data, return object with empty arrays so we know we checked
                return { flatrate: [], rent: [], buy: [], link: '' };
            }

            return {
                flatrate: countryData.flatrate || [],
                rent: countryData.rent || [],
                buy: countryData.buy || [],
                link: countryData.link
            };
        } catch (error) {
            console.error('❌ Error fetching streaming availability:', error);
            return null;
        }
    };

    return _fetchWithCache(cacheKey, fetcher, 7 * 24 * 60 * 60 * 1000);
};

export const getProviderLogoUrl = (path: string | null | undefined, size: string = 'original'): string => {
    if (!path) return '';
    return `${IMAGE_BASE_URL}${size}${path}`;
};

export const getPopularMovies = async (page = 1): Promise<{ results: MovieSearchResult[], total_pages: number }> => {
    const cacheKey = `popular-${page}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb('/movie/popular', { page, language: 'en-US' }));
    return {
      ...data,
      results: data.results.map(mapToMovieSearchResult)
    };
};

export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<{ results: MovieSearchResult[], total_results: number }> => {
    const cacheKey = `trending-${timeWindow}`;
    const data = await _fetchWithCache(cacheKey, () => _fetchFromTMDb(`/trending/movie/${timeWindow}`, { language: 'en-US' }));
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

export const getPosterUrl = (path: string | null | undefined, size = 'w500'): string => {
    if (!path) return PLACEHOLDER_POSTER;
    return `${IMAGE_BASE_URL}${size}${path}`;
};

export const getProfileUrl = (path: string | null | undefined, size = 'w185'): string => {
    if (!path) return PLACEHOLDER_PROFILE;
    return `${IMAGE_BASE_URL}${size}${path}`;
};

export const getBackdropUrl = (path: string | null | undefined, size = 'w1280'): string => {
    if (!path) return PLACEHOLDER_POSTER;
    return `${IMAGE_BASE_URL}${size}${path}`;
};

export const clearCache = (): void => {
    cache.clear();
    console.log('🧹 TMDb cache cleared.');
};
