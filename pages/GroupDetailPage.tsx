import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupById, leaveGroup } from '../services/groupService';
import { onGroupMoviesSnapshot, addMovieToGroup } from '../services/movieService';
import { getUsersByIds } from '../services/userService';
import { Group, Movie, UserProfile, MovieSearchResult } from '../types';

import LoadingSpinner from '../components/common/LoadingSpinner';
import InviteModal from '../components/groups/InviteModal';
import AddMovieModal from '../components/movies/AddMovieModal';
import MovieCard from '../components/movies/MovieCard';
import Avatar from '../components/common/Avatar';
import { ChevronLeft, Plus, Film } from '../components/icons/Icons';

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [members, setMembers] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isAddMovieModalOpen, setAddMovieModalOpen] = useState(false);

  // Fetch group details
  useEffect(() => {
    if (!groupId) {
      navigate('/groups');
      return;
    }
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const groupData = await getGroupById(groupId);
        if (groupData) {
          // Check if current user is a member
          if (!user || !groupData.members.includes(user.uid)) {
            setError("You are not a member of this group.");
          } else {
            setGroup(groupData);
          }
        } else {
          setError("Group not found.");
        }
      } catch (err) {
        setError("Failed to fetch group details.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId, navigate, user]);
  
  // Set up real-time listener for movies
  useEffect(() => {
    if (!groupId) return;
    const unsubscribe = onGroupMoviesSnapshot(
      groupId,
      (newMovies) => {
        setMovies(newMovies);
        setError('');
      },
      (err) => {
        console.error("Movie snapshot error: ", err);
        setError("Could not load movies.");
      }
    );
    return () => unsubscribe();
  }, [groupId]);

  // Memoize all unique user IDs from group members and movie adders
  const allUserIds = useMemo(() => {
    const userIds = new Set<string>();
    if (group) {
      group.members.forEach(id => userIds.add(id));
    }
    movies.forEach(movie => userIds.add(movie.addedBy));
    return Array.from(userIds);
  }, [group, movies]);
  
  // Fetch profiles for all unique users
  useEffect(() => {
    if (allUserIds.length === 0) return;
    const fetchMembers = async () => {
        const usersMap = await getUsersByIds(allUserIds);
        setMembers(usersMap);
    };
    fetchMembers();
  }, [allUserIds]);

  const handleLeaveGroup = async () => {
    if (!groupId || !user) return;
    if (window.confirm("Are you sure you want to leave this group? This action cannot be undone.")) {
      try {
        await leaveGroup(groupId, user.uid);
        navigate('/groups');
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleAddMovie = async (movie: MovieSearchResult) => {
    if (!user || !groupId) return;
    try {
        await addMovieToGroup(groupId, movie, user.uid);
    } catch (err: any) {
        console.error("Failed to add movie:", err);
        // Re-throw to allow modal to handle UI feedback
        throw err;
    }
  };

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      // Primary sort: number of likes (descending)
      const likeDiff = b.likes.length - a.likes.length;
      if (likeDiff !== 0) return likeDiff;
      // Secondary sort: added date (descending - newest first)
      return (b.addedAt?.toMillis() || 0) - (a.addedAt?.toMillis() || 0);
    });
  }, [movies]);
  
  const existingTmdbIds = useMemo(() => movies.map(m => m.tmdbId).filter(Boolean), [movies]);


  if (loading) return <LoadingSpinner />;
  if (error) return <div className="min-h-screen bg-dark flex items-center justify-center text-cinema-red p-4 text-center">{error}</div>;
  if (!group) return <div className="min-h-screen bg-dark flex items-center justify-center">Group not found.</div>;

  return (
    <>
      <div className="min-h-screen bg-dark text-white">
        <header className="p-4 md:px-8 flex items-center">
          <Link to="/groups" className="p-2 rounded-full hover:bg-dark-elevated transition-colors" aria-label="Back to groups">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center ml-4">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }}></div>
            <h1 className="text-3xl font-bold ml-3 truncate">{group.name}</h1>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Members Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Members ({group.members.length})</h2>
            <div className="flex flex-wrap gap-4">
              {group.members.map(memberId => (
                  <div key={memberId} className="flex items-center space-x-2 bg-dark-elevated p-2 rounded-full">
                      <Avatar name={members.get(memberId)?.displayName} size="sm" />
                      <span className="text-sm font-medium pr-2">{members.get(memberId)?.displayName || '...'}</span>
                  </div>
              ))}
            </div>
          </section>

          {/* Movies Section */}
          <section>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Movie Watchlist ({movies.length})</h2>
                <button
                    onClick={() => setAddMovieModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gold text-dark font-bold rounded-lg shadow-lg hover:bg-gold-light transition-transform transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Movie</span>
                </button>
            </div>
            
            {movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {sortedMovies.map(movie => (
                        <MovieCard 
                            key={movie.id}
                            movie={movie}
                            groupId={group.id}
                            addedBy={members.get(movie.addedBy)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-dark-elevated rounded-2xl border-2 border-dashed border-gray-700">
                    <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">Your Watchlist is Empty</h3>
                    <p className="text-gray-400 mt-2">Be the first to add a movie suggestion!</p>
                </div>
            )}
          </section>

          {/* Actions Section */}
          <section className="mt-12 text-center">
             <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="w-full md:w-auto px-8 py-3 bg-dark-elevated text-white font-bold rounded-lg hover:bg-dark-hover"
                >
                    Invite Friends
                </button>
                 <button
                    onClick={handleLeaveGroup}
                    className="w-full md:w-auto px-6 py-2 text-cinema-red hover:underline"
                >
                    Leave Group
                </button>
            </div>
          </section>
        </main>
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        inviteCode={group.inviteCode}
        groupName={group.name}
      />
      <AddMovieModal
        isOpen={isAddMovieModalOpen}
        onClose={() => setAddMovieModalOpen(false)}
        onAddMovie={handleAddMovie}
        existingTmdbIds={existingTmdbIds}
      />
    </>
  );
};

export default GroupDetailPage;
