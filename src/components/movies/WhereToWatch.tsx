
import React, { useEffect, useState } from 'react';
import { WatchProvider } from '../../types';
import { getStreamingProviders, getProviderLogoUrl } from '../../services/streamingService';
import { Loader2 } from '../icons/Icons';

interface WhereToWatchProps {
  tmdbId: number;
}

const WhereToWatch: React.FC<WhereToWatchProps> = ({ tmdbId }) => {
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      const data = await getStreamingProviders(tmdbId);
      setProviders(data);
      setLoading(false);
    };

    if (tmdbId) {
      fetchProviders();
    }
  }, [tmdbId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm h-12">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking streaming availability...</span>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-dark p-4 rounded-xl border border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 mb-1">Where to Watch</h3>
        <p className="text-gray-500 text-xs">Not currently available on major flat-rate subscription services in the US.</p>
      </div>
    );
  }

  return (
    <div className="bg-dark p-4 rounded-xl border border-gray-700/50">
      <h3 className="text-sm font-bold text-gold mb-3 flex items-center gap-2">
        <span>Where to Watch (US)</span>
        <span className="text-xs font-normal text-gray-500 bg-black/30 px-2 py-0.5 rounded-full">Subscription</span>
      </h3>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => (
          <div key={provider.provider_id} className="flex flex-col items-center gap-1 w-16 group">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden shadow-md group-hover:ring-2 group-hover:ring-gold transition-all">
                <img
                src={getProviderLogoUrl(provider.logo_path)}
                alt={provider.provider_name}
                className="w-full h-full object-cover"
                loading="lazy"
                />
            </div>
            <span className="text-[10px] text-center text-gray-400 leading-tight group-hover:text-white transition-colors">
              {provider.provider_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhereToWatch;
