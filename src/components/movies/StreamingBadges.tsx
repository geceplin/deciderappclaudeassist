
import React, { useEffect, useState } from 'react';
import { getStreamingAvailability, getProviderLogoUrl } from '../../services/tmdbService';
import { WatchProvider } from '../../types';

interface StreamingBadgesProps {
  movieId: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  mode?: 'normal' | 'overlay';
}

const StreamingBadges: React.FC<StreamingBadgesProps> = ({ 
  movieId, 
  size = 'sm', 
  showLabel = false, 
  mode = 'normal'
}) => {
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [accessType, setAccessType] = useState<'stream' | 'rent' | 'buy' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    const loadProviders = async () => {
      setLoading(true);
      setError(false);
      try {
        // Fetch for US by default
        const availability = await getStreamingAvailability(movieId, 'US');
        
        let activeProviders: WatchProvider[] = [];
        let type: 'stream' | 'rent' | 'buy' | null = null;

        // Priority 1: Subscription (Flatrate)
        if (availability?.flatrate && availability.flatrate.length > 0) {
            activeProviders = availability.flatrate;
            type = 'stream';
        } 
        // Priority 2: Rent
        else if (availability?.rent && availability.rent.length > 0) {
            activeProviders = availability.rent;
            type = 'rent';
        }
        // Priority 3: Buy
        else if (availability?.buy && availability.buy.length > 0) {
            activeProviders = availability.buy;
            type = 'buy';
        }

        if (activeProviders.length > 0) {
          // Sort by display priority and take top 4
          // Deduplicate by provider_id just in case
          const unique = activeProviders.filter((v,i,a)=>a.findIndex(t=>(t.provider_id===v.provider_id))===i);
          const sorted = unique.sort((a, b) => a.display_priority - b.display_priority).slice(0, 4);
          setProviders(sorted);
          setAccessType(type);
        } else {
          setProviders([]);
          setAccessType(null);
        }
      } catch (err) {
        console.error('Error loading streaming providers:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [movieId]);

  // Determine size classes
  const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
  }[size];

  // Overlay Mode Logic (Posters)
  if (mode === 'overlay') {
      if (loading || error || !movieId || providers.length === 0) return null;
      
      return (
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-10 pointer-events-auto">
            {accessType !== 'stream' && (
                <span className="text-[10px] font-bold text-white bg-black/70 px-1.5 rounded backdrop-blur-sm border border-white/10 uppercase">
                    {accessType}
                </span>
            )}
            <div className="flex gap-1">
                {providers.slice(0, 3).map((provider) => (
                    <img
                        key={provider.provider_id}
                        src={getProviderLogoUrl(provider.logo_path)}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="w-6 h-6 rounded-md object-cover shadow-sm border border-white/20 bg-dark"
                        loading="lazy"
                    />
                ))}
            </div>
        </div>
      );
  }

  // Normal Mode Logic (Card Details / Modal)

  if (!movieId) {
    return showLabel ? <div className="text-xs text-cinema-red font-medium mt-2">🎬 Missing ID</div> : null;
  }

  if (loading) {
    return showLabel ? <div className="text-xs text-gold font-medium mt-2 flex items-center justify-center gap-1 animate-pulse">⏳ checking...</div> : null;
  }

  if (error) {
    return showLabel ? <div className="text-xs text-gray-500 font-medium mt-2">⚠️ Info unavailable</div> : null;
  }

  if (providers.length === 0) {
    return showLabel ? (
        <div className="mt-2 text-center">
            <span className="text-xs text-gray-600 font-medium border border-gray-700 rounded px-2 py-1">
                Not streaming in US
            </span>
        </div>
    ) : null;
  }

  // Success State
  return (
    <div className={`flex flex-col items-center ${showLabel ? 'gap-1' : ''}`}>
      {showLabel && (
          <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-400">
                  {accessType === 'stream' ? 'Stream on:' : accessType === 'rent' ? 'Rent on:' : 'Buy on:'}
              </span>
          </div>
      )}
      <div className={`flex items-center gap-2 flex-wrap justify-center ${!showLabel ? 'mt-2' : ''}`}>
        {providers.map((provider) => (
            <img
            key={provider.provider_id}
            src={getProviderLogoUrl(provider.logo_path)}
            alt={provider.provider_name}
            title={provider.provider_name}
            className={`${sizeClasses} rounded-md object-cover shadow-sm border border-gray-700 bg-dark`}
            loading="lazy"
            />
        ))}
      </div>
    </div>
  );
};

export default StreamingBadges;
