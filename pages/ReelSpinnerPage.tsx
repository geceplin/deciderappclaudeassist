import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getGroupById } from '../../services/groupService';
import { getUnwatchedMoviesForReel, markMovieWatchedTogether } from '../../services/movieService';
import { filterMoviesForReel } from '../../utils/spinLogic';
import { Movie, Group } from '../../types';
import { useRoulette } from '../../hooks/useRoulette';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MovieReel from '../../components/roulette/MovieReel';
import ResultModal from '../../components/roulette/ResultModal';
import ReelFilterTabs, { ReelFilterType } from '../../components/roulette/ReelFilterTabs';
import { getPosterUrl } from '../../services/tmdbService';
import { ChevronLeft, Film, Ticket } from '../../components/icons/Icons';

const ReelSpinnerPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [unwatchedMovies, setUnwatchedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ReelFilterType>('must-watch');

  const moviesForReel = useMemo(() => filterMoviesForReel(unwatchedMovies, filter), [unwatchedMovies, filter]);
  
  const {
    isSpinning,
    winner,
    reelItems,
    spinTargetIndex,
    startSpin,
    reset,
    SPIN_DURATION_MS,
  } = useRoulette(moviesForReel);

  const fetchSpinnerData = useCallback(async () => {
      if (!groupId) { navigate('/groups'); return; }
      setLoading(true);
      try {
        const [groupData, moviesData] = await Promise.all([
          getGroupById(groupId),
          getUnwatchedMoviesForReel(groupId),
        ]);
        setGroup(groupData);
        setUnwatchedMovies(moviesData);
      } catch (err) {
        console.error("Failed to load spinner data:", err);
        setError("Could not load data for the reel. Please try again.");
      } finally {
        setLoading(false);
      }
  }, [groupId, navigate]);
  
  useEffect(() => {
    fetchSpinnerData();
  }, [fetchSpinnerData]);

  const handleMarkWatched = async (movieId: string) => {
    if (!groupId || !user) return;
    await markMovieWatchedTogether(groupId, movieId, user.uid);
    reset();
    // Refresh list of unwatched movies after marking one as watched
    setUnwatchedMovies(prev => prev.filter(m => m.id !== movieId));
  };

  const handleSpinAgain = () => {
    reset();
    startSpin();
  };

  const filterCounts = useMemo(() => ({
      'must-watch': filterMoviesForReel(unwatchedMovies, 'must-watch').length,
      'all': filterMoviesForReel(unwatchedMovies, 'all').length,
      'must-watch-seen': filterMoviesForReel(unwatchedMovies, 'must-watch-seen').length,
      'must-watch-pass': filterMoviesForReel(unwatchedMovies, 'must-watch-pass').length,
  }), [unwatchedMovies]);
  
  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-cinema-red">{error}</div>;

    if (unwatchedMovies.length === 0) {
      return (
        <div className="text-center p-8">
            <Film className="w-24 h-24 text-gray-700 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold">The Reel is Empty!</h2>
            <p className="text-gray-400">Add some movies to the group list to get started.</p>
        </div>
      );
    }
    
    if (moviesForReel.length < 2) {
       return (
        <div className="text-center p-8">
            <Film className="w-24 h-24 text-gray-700 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold">Not Enough Movies</h2>
            <p className="text-gray-400">You need at least 2 eligible movies for this filter to spin the reel.</p>
            <p className="text-gray-400 mt-1">Try a different filter or get more votes!</p>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center gap-8">
        <MovieReel
          items={reelItems}
          targetIndex={spinTargetIndex}
          isSpinning={isSpinning}
          spinDuration={SPIN_DURATION_MS}
        />
        <button
          onClick={startSpin}
          disabled={isSpinning || !!winner || moviesForReel.length < 2}
          className="flex items-center gap-3 px-12 py-4 bg-gold text-dark font-bold text-xl rounded-lg shadow-lg hover:bg-gold-light transition-transform transform hover:scale-105 active:scale-100 disabled:bg-gold-dark disabled:cursor-not-allowed disabled:scale-100"
        >
          <Ticket className="w-7 h-7" />
          {isSpinning ? 'Spinning...' : 'Spin the Reel!'}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <header className="p-4 md:px-8 flex items-center">
          <Link to={`/groups/${groupId}`} className="p-2 rounded-full hover:bg-dark-elevated" aria-label="Back to group">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col ml-4">
            <h1 className="text-xl md:text-2xl font-bold truncate">{group?.name}</h1>
            <span className="text-sm text-gray-400">Reel Spinner</span>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
            {renderContent()}
        </main>
        
        <footer className="p-4 md:p-8 flex flex-col items-center gap-4">
            <ReelFilterTabs 
                activeFilter={filter}
                onFilterChange={setFilter}
                counts={filterCounts}
            />
        </footer>
      </div>
      <ResultModal
        winner={winner}
        onClose={reset}
        onMarkWatched={handleMarkWatched}
        onSpinAgain={handleSpinAgain}
      />
    </>
  );
};

export default ReelSpinnerPage;