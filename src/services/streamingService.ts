
import { StreamingAvailability } from '../types';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Cache to prevent excessive function calls during a session
const cache = new Map<string, { data: StreamingAvailability | null, timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const getStreamingAvailability = async (movieId: number, country: string = 'US'): Promise<StreamingAvailability | null> => {
  const cacheKey = `${movieId}-${country}`;
  const cached = cache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return cached.data;
  }

  try {
    // Call the Netlify function
    const response = await fetch(`/.netlify/functions/getStreaming?movieId=${movieId}&country=${country}`);
    
    if (!response.ok) {
        console.warn('Could not fetch streaming data via function');
        return null;
    }
    
    const data: StreamingAvailability | null = await response.json();
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error in streaming service:', error);
    return null;
  }
};

export const getProviderLogoUrl = (logoPath: string, size: string = 'original'): string => {
  if (!logoPath) return '';
  return `${IMAGE_BASE_URL}${logoPath}`;
};
