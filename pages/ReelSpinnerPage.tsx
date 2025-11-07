import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUnwatchedMoviesForReel, markWatchedTogether } from '../services/movieService';
import { Movie } from '../types';
import { useRoulette } from '../hooks/useRoulette';
import { filterEligibleMovies } from '../utils/spinLogic';
import { ChevronLeft, Loader2, Film } from '../components/icons/Icons';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MovieReel from '../components/roulette/MovieReel';
import ResultModal from '../components/roulette/ResultModal';

const ReelSpinnerPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [allUnwatchedMovies, setAllUnwatchedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);

  const { isSpinning, result, spin, reset } = useRoulette();

  useEffect(() => {
    if (!groupId) return;
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const movies = await getUnwatchedMoviesForReel(groupId);
        setAllUnwatchedMovies(movies);
      } catch (err) {
        setError("Could not load movies for the reel.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [groupId]);

  const eligibleMovies = useMemo(() => filterEligibleMovies(allUnwatchedMovies), [allUnwatchedMovies]);

  const handleSpin = async () => {
    const winner = await spin(eligibleMovies);
    setTimeout(() => {
        setShowResultModal(true);
    }, 500); // Small delay after spin stops to show result
  };

  const handleMarkWatched = async (movieId: string) => {
    if (!groupId) return;
    await markWatchedTogether(groupId, movieId);
    // Refresh movie list
    setAllUnwatchedMovies(prev => prev.filter(m => m.id !== movieId));
    setShowResultModal(false);
    reset();
  };

  const handleSpinAgain = () => {
    setShowResultModal(false);
    reset();
    handleSpin();
  };
  
  const handleCloseModal = () => {
    setShowResultModal(false);
    reset();
  };

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-cinema-red">{error}</div>;

    if (allUnwatchedMovies.length > 0 && eligibleMovies.length < 2) {
      return (
        <div className="text-center">
            <Film className="w-16 h-16 text-gray-700 mx-auto" />
            <h3 className="text-xl font-bold mt-4">Not enough movies to spin!</h3>
            <p className="text-gray-400 mt-2">
                At least two movies need more 'Must Watch' votes than 'Pass' votes.
            </p>
            <Link to={`/groups/${groupId}`} className="mt-6 inline-block px-6 py-3 bg-gold text-dark font-bold rounded-lg">
                Back to Group
            </Link>
        </div>
      );
    }
    
    if (allUnwatchedMovies.length === 0) {
       return (
        <div className="text-center">
            <Film className="w-16 h-16 text-gray-700 mx-auto" />
            <h3 className="text-xl font-bold mt-4">You've watched everything!</h3>
            <p className="text-gray-400 mt-2">
                Add some new movies to the group to spin the reel.
            </p>
            <Link to={`/groups/${groupId}`} className="mt-6 inline-block px-6 py-3 bg-gold text-dark font-bold rounded-lg">
                Add Movies
            </Link>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center justify-center gap-8">
        <MovieReel
          movies={eligibleMovies}
          rotation={result?.finalRotation ?? 0}
          isSpinning={isSpinning}
          result={result?.movie ?? null}
        />
        <button
          onClick={handleSpin}
          disabled={isSpinning || eligibleMovies.length < 2}
          className="w-full max-w-xs h-16 flex items-center justify-center bg-gold text-dark font-bold text-xl rounded-lg shadow-lg hover:bg-gold-light disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
        >
          {isSpinning ? (
            <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Spinning...</>
          ) : (
            '🎡 SPIN TO DECIDE!'
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <header className="p-4 md:px-8 flex items-center justify-between">
          <Link to={`/groups/${groupId}`} className="p-2 rounded-full hover:bg-dark-elevated" aria-label="Back to group">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="text-center">
              <h1 className="text-3xl font-bold">Reel Spinner</h1>
              <p className="text-gold font-semibold">{eligibleMovies.length} movies in the reel</p>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {renderContent()}
        </main>
      </div>

      <ResultModal
        isOpen={showResultModal && !!result}
        movie={result?.movie ?? null}
        onClose={handleCloseModal}
        onMarkWatched={handleMarkWatched}
        onSpinAgain={handleSpinAgain}
      />
    </>
  );
};

export default ReelSpinnerPage;
