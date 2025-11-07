import React, { useMemo } from 'react';
import { Movie, UserProfile } from '../../types';
import { Film, Star, Users } from '../icons/Icons'; // Assuming Users icon exists

interface GroupStatsProps {
  watchedMovies: Movie[];
  members: Map<string, UserProfile>;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-dark-elevated p-4 rounded-xl flex items-center">
        <div className="p-3 bg-dark rounded-lg text-gold">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);


const GroupStats: React.FC<GroupStatsProps> = ({ watchedMovies, members }) => {

  const stats = useMemo(() => {
    // 1. Favorite Genre
    const genreCounts = watchedMovies.flatMap(m => m.genres || []).reduce((acc: Record<string, number>, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    const favoriteGenre = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0] || 'N/A';
    
    // 2. Most Active Member (who marked movies watched)
    const activityCounts = watchedMovies.reduce((acc: Record<string, number>, movie) => {
        if (movie.watchedTogetherBy) {
            acc[movie.watchedTogetherBy] = (acc[movie.watchedTogetherBy] || 0) + 1;
        }
        return acc;
    }, {});
    const mostActiveId = Object.keys(activityCounts).sort((a, b) => activityCounts[b] - activityCounts[a])[0];
    const mostActiveMember = mostActiveId ? (members.get(mostActiveId)?.displayName || 'A member') : 'N/A';

    // 3. Overall Average Rating
    const ratedMovies = watchedMovies.filter(m => typeof m.averageGroupRating === 'number' && m.averageGroupRating > 0);
    const totalRating = ratedMovies.reduce((sum, m) => sum + (m.averageGroupRating || 0), 0);
    const overallAverage = ratedMovies.length > 0 ? (totalRating / ratedMovies.length).toFixed(1) : 'N/A';

    return {
        favoriteGenre,
        mostActiveMember,
        overallAverage,
        totalMovies: watchedMovies.length,
    };
  }, [watchedMovies, members]);

  return (
    <div className="bg-dark rounded-2xl p-4 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Film className="w-6 h-6"/>} label="Movies Watched" value={stats.totalMovies} />
        <StatCard icon={<Star className="w-6 h-6" />} label="Avg. Group Rating" value={stats.overallAverage} />
        <StatCard icon={<div className="w-6 h-6 text-lg">🎭</div>} label="Favorite Genre" value={stats.favoriteGenre} />
        <StatCard icon={<Users className="w-6 h-6" />} label="Top Contributor" value={stats.mostActiveMember} />
      </div>
    </div>
  );
};

export default GroupStats;
