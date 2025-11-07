import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getWatchHistory, rateWatchedMovie } from '../../services/movieService';
import { Movie } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WatchHistoryCard from '../../components/history/WatchHistoryCard';
import { ArrowLeft, Film } from '../../components/icons/Icons';

const WatchHistoryPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    getWatchHistory(groupId)
      .then(setHistory)
      .catch(err => console.error("Error loading history:", err))
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleRateMovie = async (movieId: string, rating: number) => {
    if (!groupId || !user) return;
    try {
      await rateWatchedMovie(groupId, movieId, user.uid, rating);
      // Optimistically update the UI
      setHistory(prevHistory => 
        prevHistory.map(movie => {
          if (movie.id === movieId) {
            const newRatings = { ...movie.groupRatings, [user.uid]: rating };
            const allRatings = Object.values(newRatings);
            // FIX: Explicitly convert reduce value `r` to a Number to handle cases where its type is inferred as `unknown`.
            const newAverage = allRatings.reduce((sum, r) => sum + (Number(r) || 0), 0) / allRatings.length;
            return { ...movie, groupRatings: newRatings, averageGroupRating: newAverage };
          }
          return movie;
        })
      );
    } catch (error) {
      console.error("Failed to rate movie:", error);
      alert("Could not save your rating. Please try again.");
    }
  };
  
  const renderContent = () => {
      if (loading) return <LoadingSpinner />;
      if (history.length === 0) {
          return (
             <div className="text-center col-span-full mt-16">
                <Film className="w-24 h-24 text-gray-700 mx-auto" />
                <h2 className="mt-6 text-2xl font-bold text-white">History is Empty</h2>
                <p className="mt-2 text-gray-400">Spin the reel and mark a movie as watched to start your history!</p>
                <button
                    onClick={() => navigate(`/groups/${groupId}/spin`)}
                    className="mt-6 px-6 py-3 bg-gold text-dark font-bold rounded-lg shadow-lg hover:bg-gold-light transition-transform transform hover:scale-105"
                >
                    Go to Reel Spinner
                </button>
            </div>
          );
      }
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {history.map(movie => (
                <WatchHistoryCard 
                    key={movie.id} 
                    movie={movie}
                    onRate={(rating) => handleRateMovie(movie.id, rating)}
                />
            ))}
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="p-4 md:px-8 flex items-center sticky top-0 bg-dark/80 backdrop-blur-sm z-10">
        <Link to={`/groups/${groupId}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg -ml-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Group</span>
        </Link>
      </header>
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white">Watch History</h1>
            <p className="text-gray-400 mt-1">{history.length} movie{history.length !== 1 ? 's' : ''} watched together</p>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default WatchHistoryPage;
