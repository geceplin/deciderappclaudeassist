import React from 'react';

export type ReelFilterType = 'must-watch' | 'all' | 'must-watch-seen' | 'must-watch-pass';

interface ReelFilterTabsProps {
  activeFilter: ReelFilterType;
  onFilterChange: (filter: ReelFilterType) => void;
  counts: Record<ReelFilterType, number>;
}

const filters: { id: ReelFilterType; label: string; }[] = [
  { id: 'must-watch', label: '🌟 Must Watch' },
  { id: 'all', label: '🎬 All Movies' },
  { id: 'must-watch-seen', label: '🌟✅ Must + Seen' },
  { id: 'must-watch-pass', label: '🌟👎 Must + Pass' },
];

const ReelFilterTabs: React.FC<ReelFilterTabsProps> = ({ activeFilter, onFilterChange, counts }) => {
  return (
    <div className="w-full max-w-3xl px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {filters.map(filter => {
                const count = counts[filter.id] ?? 0;
                const isActive = activeFilter === filter.id;
                
                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        disabled={count === 0}
                        className={`
                            flex-shrink-0 px-5 py-3 rounded-lg border-2 text-sm font-semibold
                            flex items-center gap-2 transition-all duration-200 whitespace-nowrap
                            ${isActive
                                ? 'bg-gold border-gold text-dark shadow-md'
                                : 'bg-dark-elevated border-gray-700 text-gray-300 hover:border-gray-500'
                            }
                            ${count === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5'}
                        `}
                    >
                        <span>{filter.label}</span>
                        <span className={`
                            px-2 py-0.5 rounded-full text-xs font-mono
                             ${isActive ? 'bg-black/10' : 'bg-dark'}
                        `}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    </div>
  );
};

export default ReelFilterTabs;