import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUnwatchedMoviesForReel } from '../services/movieService';
import { Movie } from '../types';
import { ChevronLeft } from '../components/icons/Icons';
import LoadingSpinner from '../components/common/LoadingSpinner';

type ReelFilter = 'all' | 'must-watch' | 'must-watch-seen' | 'must-watch-pass';

const ReelSpinnerPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reelFilter, setReelFilter] = useState<ReelFilter>('must-watch');

  useEffect(() => {
    if (!groupId) return;
    const fetchReelMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const movies = await getUnwatchedMoviesForReel(groupId);
        setAllMovies(movies);
      } catch (err) {
        console.error("Failed to fetch reel movies:", err);
        setError("Could not load movies for the reel.");
      } finally {
        setLoading(false);
      }
    };
    fetchReelMovies();
  }, [groupId]);

  const eligibleMovies = useMemo(() => {
    if (!user) return [];
    return allMovies.filter(movie => {
        // Safe access to opinion data
        const counts = movie.opinionCounts || { mustWatch: 0, alreadySeen: 0, pass: 0 };
        const userOpinion = movie.opinions?.[user.uid];

        // User's "pass" opinion always excludes the movie
        if (userOpinion === 'pass') return false;

        switch (reelFilter) {
            case 'must-watch':
                return (counts.mustWatch ?? 0) > 0;
            case 'must-watch-seen':
                return userOpinion !== 'already-seen' && ((counts.mustWatch ?? 0) > 0 || (counts.alreadySeen ?? 0) > 0);
            case 'must-watch-pass':
                return (counts.mustWatch ?? 0) > 0 || (counts.pass ?? 0) > 0;
            case 'all':
                return true;
            default:
                return true;
        }
    });
  }, [allMovies, reelFilter, user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="min-h-screen bg-dark flex items-center justify-center text-cinema-red">{error}</div>;

  const FilterButton: React.FC<{ value: ReelFilter, label: string, emoji: string }> = ({ value, label, emoji }) => (
    <button
      onClick={() => setReelFilter(value)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        reelFilter === value ? 'bg-gold text-dark' : 'bg-dark-elevated text-gray-300 hover:bg-dark-hover'
      }`}
    >
      <span className="mr-2">{emoji}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <header className="p-4 md:px-8 flex items-center">
        <Link to={`/groups/${groupId}`} className="p-2 rounded-full hover:bg-dark-elevated" aria-label="Back to group">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold ml-4">Reel Spinner</h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-300">Reel Filter</h2>
          <div className="flex flex-wrap justify-center gap-2 my-4">
            <FilterButton value="must-watch" label="Must Watch" emoji="🌟" />
            <FilterButton value="must-watch-seen" label="Must + Seen" emoji="🌟✅" />
            <FilterButton value="all" label="All Movies" emoji="🎬" />
          </div>
          
          <p className="text-lg text-gray-400 mt-6">
            <span className="text-4xl font-bold text-gold">{eligibleMovies.length}</span>
            <br/>
            {eligibleMovies.length === 1 ? 'movie' : 'movies'} in the reel
          </p>

          <div className="my-12 w-full h-64 bg-dark-elevated rounded-2xl border-4 border-dashed border-gray-700 flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-2xl">Reel Spinner Coming Soon!</span>
          </div>

          <button 
            disabled={eligibleMovies.length === 0}
            className="w-full max-w-xs h-16 bg-gold text-dark font-bold text-xl rounded-lg shadow-lg hover:bg-gold-light disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
          >
            SPIN TO DECIDE!
          </button>
          {eligibleMovies.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">Add more movies or change filters to spin.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReelSpinnerPage;