
import { WatchProvider } from '../types';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const getStreamingProviders = async (tmdbId: number): Promise<WatchProvider[]> => {
  try {
    // In local dev without Netlify CLI, this might 404 unless proxy is set up.
    // In production (Netlify), this works relative to domain.
    const response = await fetch(`/.netlify/functions/getStreaming?movieId=${tmdbId}`);
    
    if (!response.ok) {
        // Fallback or silence error since this is a "nice to have" feature
        console.warn('Could not fetch streaming data');
        return [];
    }
    
    const providers: WatchProvider[] = await response.json();
    return providers;
  } catch (error) {
    console.error('Error in streaming service:', error);
    return [];
  }
};

export const getProviderLogoUrl = (logoPath: string): string => {
  if (!logoPath) return '';
  return `${IMAGE_BASE_URL}${logoPath}`;
};
