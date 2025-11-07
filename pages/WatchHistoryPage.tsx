import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getWatchHistory, rateWatchedMovie } from '../services/movieService';
import { getGroupById } from '../services/groupService';
import { getUsersByIds } from '../services/userService';
import { Movie, UserProfile, Comment } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WatchHistoryCard from '../components/history/WatchHistoryCard';
import GroupStats from '../components/history/GroupStats';
import { ArrowLeft, Film, Filter, ArrowDown } from '../components/icons/Icons';

type FilterType = 'all' | 'month' | 'year';
type SortType = 'recent' | 'rating';

const WatchHistoryPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [history, setHistory] = useState<Movie[]>([]);
  const [members, setMembers] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);

    const fetchData = async () => {
        try {
            const [historyData, groupData] = await Promise.all([
                getWatchHistory(groupId),
                getGroupById(groupId)
            ]);

            setHistory(historyData);

            if (groupData?.members) {
                const memberProfiles = await getUsersByIds(groupData.members);
                setMembers(memberProfiles);
            }
        } catch (err) {
            console.error("Error loading history page data:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [groupId]);

  const handleRateMovie = async (movieId: string, rating: number) => {
    if (!groupId || !user) return;
    try {
      // Optimistic UI update
      setHistory(prevHistory => 
        prevHistory.map(movie => {
          if (movie.id === movieId) {
            const newRatings = { ...movie.groupRatings, [user.uid]: rating };
            const allRatings = Object.values(newRatings);
            // Fix: Calculate the new average rating, ensuring all values are numeric and guarding against division by zero.
            const totalRating = allRatings.reduce((sum, r) => sum + (Number(r) || 0), 0);
            const newAverage = allRatings.length > 0 ? totalRating / allRatings.length : 0;
            return { ...movie, groupRatings: newRatings, averageGroupRating: newAverage };
          }
          return movie;
        })
      );
      await rateWatchedMovie(groupId, movieId, user.uid, rating);
    } catch (error) {
      console.error("Failed to rate movie:", error);
      alert("Could not save your rating. Please try again.");
      // NOTE: In a real app, you would revert the optimistic update here
    }
  };

  const handleAddComment = (movieId: string, newComment: Comment) => {
    setHistory(prev => prev.map(m => 
      m.id === movieId ? {...m, comments: [...(m.comments || []), newComment]} : m
    ));
  };
  
  const handleDeleteComment = (movieId: string, commentToDelete: Comment) => {
    setHistory(prev => prev.map(m => 
      m.id === movieId ? {...m, comments: (m.comments || []).filter(c => c.id !== commentToDelete.id)} : m
    ));
  };
  
  const displayedHistory = useMemo(() => {
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      return [...history]
        .filter(movie => {
            if (filter === 'all' || !movie.watchedTogetherDate) return true;
            const watchedDate = movie.watchedTogetherDate.toDate();
            if (filter === 'month') return watchedDate > oneMonthAgo;
            if (filter === 'year') return watchedDate > oneYearAgo;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') {
                return (b.averageGroupRating ?? 0) - (a.averageGroupRating ?? 0);
            }
            // Default to 'recent'
            return (b.watchedTogetherDate?.toMillis() ?? 0) - (a.watchedTogetherDate?.toMillis() ?? 0);
        });
  }, [history, filter, sortBy]);

  const ControlButton: React.FC<{onClick: () => void, isActive: boolean, children: React.ReactNode}> = ({onClick, isActive, children}) => (
      <button 
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'bg-gold text-dark' : 'bg-dark-elevated text-gray-300 hover:bg-dark-hover'}`}>
        {children}
      </button>
  );

  const renderContent = () => {
      if (loading) return <LoadingSpinner />;

      return (
        <>
            <GroupStats watchedMovies={history} members={members} />
            
             <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-white">Filter:</span>
                    <ControlButton onClick={() => setFilter('all')} isActive={filter === 'all'}>All Time</ControlButton>
                    <ControlButton onClick={() => setFilter('month')} isActive={filter === 'month'}>Month</ControlButton>
                    <ControlButton onClick={() => setFilter('year')} isActive={filter === 'year'}>Year</ControlButton>
                </div>
                 <div className="flex items-center gap-2">
                    <ArrowDown className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-white">Sort by:</span>
                    <ControlButton onClick={() => setSortBy('recent')} isActive={sortBy === 'recent'}>Recent</ControlButton>
                    <ControlButton onClick={() => setSortBy('rating')} isActive={sortBy === 'rating'}>Rating</ControlButton>
                </div>
            </div>

            {displayedHistory.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {displayedHistory.map(movie => (
                        <WatchHistoryCard 
                            key={movie.id} 
                            movie={movie}
                            onRate={(rating) => handleRateMovie(movie.id, rating)}
                            members={members}
                            groupId={groupId!}
                            onCommentAdded={handleAddComment}
                            onCommentDeleted={handleDeleteComment}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center col-span-full mt-16">
                    <Film className="w-24 h-24 text-gray-700 mx-auto" />
                    <h2 className="mt-6 text-2xl font-bold text-white">No Movies Here</h2>
                    <p className="mt-2 text-gray-400">
                        {history.length === 0 ? "Spin the reel and mark a movie as watched to start your history!" : "Try adjusting your filters to find what you're looking for."}
                    </p>
                    {history.length === 0 && (
                         <button
                            onClick={() => navigate(`/groups/${groupId}/spin`)}
                            className="mt-6 px-6 py-3 bg-gold text-dark font-bold rounded-lg shadow-lg hover:bg-gold-light transition-transform transform hover:scale-105"
                        >
                            Go to Reel Spinner
                        </button>
                    )}
                </div>
            )}
        </>
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
