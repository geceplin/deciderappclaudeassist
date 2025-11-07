import React from 'react';

type Filter = 'eligible' | 'all';

interface ReelFilterTabsProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  eligibleCount: number;
  allCount: number;
}

const ReelFilterTabs: React.FC<ReelFilterTabsProps> = ({ activeFilter, onFilterChange, eligibleCount, allCount }) => {
  const TabButton: React.FC<{ filter: Filter, label: string, count: number }> = ({ filter, label, count }) => (
    <button
      onClick={() => onFilterChange(filter)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeFilter === filter
          ? 'bg-gold text-dark'
          : 'bg-dark-elevated text-gray-400 hover:bg-dark-hover hover:text-white'
      }`}
    >
      {label} <span className="font-mono bg-dark px-1.5 py-0.5 rounded">{count}</span>
    </button>
  );

  return (
    <div className="flex gap-2 p-1 bg-dark rounded-lg">
      <TabButton filter="eligible" label="Eligible to Spin" count={eligibleCount} />
      <TabButton filter="all" label="All Unwatched" count={allCount} />
    </div>
  );
};

export default ReelFilterTabs;
