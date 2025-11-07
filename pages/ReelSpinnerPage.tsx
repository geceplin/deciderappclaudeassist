import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroupById } from '../../services/groupService';
import { getUnwatchedMoviesForReel, markWatchedTogether } from '../../services/movieService';
import { filterEligibleMovies } from '../../utils/spinLogic';
import { Movie, Group } from '../../types';
import { useRoulette } from '../../hooks/useRoulette';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MovieReel from '../../components/roulette/MovieReel';
import ResultModal from '../../components/roulette/ResultModal';
import ReelFilterTabs from '../../components/roulette/ReelFilterTabs';
import { getPosterUrl } from '../../services/tmdbService';
import { ChevronLeft, Film, Ticket } from '../../components/icons/Icons';

type MovieFilter = 'eligible' | 'all';

const ReelSpinnerPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [unwatchedMovies, setUnwatchedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<MovieFilter>('eligible');

  const eligibleMovies = useMemo(() => filterEligibleMovies(unwatchedMovies), [unwatchedMovies]);
  
  const {
    isSpinning,
    winner,
    reelItems,
    spinTargetIndex,
    startSpin,
    reset,
    SPIN_DURATION_MS,
  } = useRoulette(eligibleMovies);

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, [groupId, navigate]);

  const handleMarkWatched = async () => {
    if (!winner || !groupId) return;
    await markWatchedTogether(groupId, winner.id);
    // Refresh list of unwatched movies after marking one as watched
    setUnwatchedMovies(prev => prev.filter(m => m.id !== winner.id));
    reset();
  };

  const handleSpinAgain = () => {
    reset();
    startSpin();
  };
  
  const moviesToShow = filter === 'eligible' ? eligibleMovies : unwatchedMovies;

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-cinema-red">{error}</div>;

    if (unwatchedMovies.length === 0) {
      return (
        <div className="text-center">
            <Film className="w-24 h-24 text-gray-700 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold">The Reel is Empty!</h2>
            <p className="text-gray-400">Add some movies to the group list to get started.</p>
        </div>
      );
    }
    
    if (eligibleMovies.length === 0) {
       return (
        <div className="text-center">
            <Film className="w-24 h-24 text-gray-700 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold">No Movies Eligible</h2>
            <p className="text-gray-400">A movie needs more 'Must Watch' votes than 'Pass' votes to be in the spin.</p>
            <p className="text-gray-400 mt-1">Go back and vote on some movies!</p>
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
          disabled={isSpinning || !!winner}
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
                onFilterChange={setFilter as (filter: 'eligible' | 'all') => void}
                eligibleCount={eligibleMovies.length}
                allCount={unwatchedMovies.length}
            />
            <div className="w-full max-w-5xl h-32 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-dark-elevated">
                <div className="flex gap-3 p-2">
                    {moviesToShow.map(movie => (
                        <div key={movie.id} className="w-20 flex-shrink-0" title={movie.title}>
                           <img src={getPosterUrl(movie.posterPath, 'w92')} alt={movie.title} className="w-full h-auto rounded" />
                        </div>
                    ))}
                </div>
            </div>
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
