import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupById, leaveGroup } from '../services/groupService';
import { onGroupMoviesSnapshot, addMovieToGroup } from '../services/movieService';
import { getUsersByIds } from '../services/userService';
import { Group, Movie, UserProfile, MovieDetails, Opinion } from '../types';

import LoadingSpinner from '../components/common/LoadingSpinner';
import InviteModal from '../components/groups/InviteModal';
import AddMovieModal from '../components/movies/AddMovieModal';
import MovieCard from '../components/movies/MovieCard';
import { ChevronLeft, Plus, Film, Ticket } from '../components/icons/Icons';

type OpinionFilter = 'all' | Opinion;

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [members, setMembers] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<OpinionFilter>('all');

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isAddMovieModalOpen, setAddMovieModalOpen] = useState(false);

  useEffect(() => {
    if (!groupId) { navigate('/groups'); return; }
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const groupData = await getGroupById(groupId);
        if (groupData) {
          if (!user || !groupData.members.includes(user.uid)) {
            setError("Access denied. You are not a member of this group.");
          } else {
            setGroup(groupData);
          }
        } else { setError("Group not found."); }
      } catch (err) { setError("Failed to fetch group details."); }
      finally { setLoading(false); }
    };
    fetchGroup();
  }, [groupId, navigate, user]);
  
  useEffect(() => {
    if (!groupId) return;
    const unsubscribe = onGroupMoviesSnapshot(
      groupId,
      (newMovies) => { setMovies(newMovies); setError(''); },
      (err) => { console.error("Movie snapshot error: ", err); setError("Could not load movies."); }
    );
    return () => unsubscribe();
  }, [groupId]);

  const allUserIds = useMemo(() => {
    const userIds = new Set<string>();
    if (group) { group.members.forEach(id => userIds.add(id)); }
    movies.forEach(movie => userIds.add(movie.addedBy));
    return Array.from(userIds);
  }, [group, movies]);
  
  useEffect(() => {
    if (allUserIds.length === 0) return;
    getUsersByIds(allUserIds).then(setMembers);
  }, [allUserIds]);

  const handleLeaveGroup = async () => {
    if (!groupId || !user) return;
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(groupId, user.uid);
        navigate('/groups');
      } catch (err: any) { setError(err.message); }
    }
  };

  const handleAddMovie = async (movie: MovieDetails) => {
    if (!user || !groupId) return;
    try {
      await addMovieToGroup(groupId, movie, user.uid, user.displayName || 'Anonymous');
    } catch (err: any) {
      console.error("Failed to add movie:", err);
      throw err; // Re-throw for modal to handle
    }
  };

  const enrichedMovies = useMemo(() => {
    return movies.map(movie => {
        const addedByUser = members.get(movie.addedBy);
        return {
            ...movie,
            addedByName: addedByUser?.displayName || movie.addedByName || 'A User',
        };
    });
  }, [movies, members]);

  const filteredMovies = useMemo(() => {
    // Show unwatched movies only on this page
    const unwatched = enrichedMovies.filter(m => !m.watchedTogether);

    if (filter === 'all') {
      return unwatched.sort((a, b) => (b.addedAt?.toMillis() || 0) - (a.addedAt?.toMillis() || 0));
    }
    return unwatched.filter(movie => {
      const counts = movie.opinionCounts || { mustWatch: 0, alreadySeen: 0, pass: 0 };
      if (filter === 'must-watch') return (counts.mustWatch ?? 0) > 0;
      if (filter === 'already-seen') return (counts.alreadySeen ?? 0) > 0;
      if (filter === 'pass') return (counts.pass ?? 0) > 0;
      return false;
    });
  }, [enrichedMovies, filter]);
  
  const existingTmdbIds = useMemo(() => movies.map(m => m.tmdbId), [movies]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="min-h-screen bg-dark flex items-center justify-center text-cinema-red p-4 text-center">{error}</div>;
  if (!group) return <div className="min-h-screen bg-dark flex items-center justify-center">Group not found.</div>;

  const FilterButton: React.FC<{ value: OpinionFilter, label: string, emoji: string }> = ({ value, label, emoji }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center text-center ${
        filter === value ? 'bg-gold text-dark' : 'bg-dark-elevated text-gray-300 hover:bg-dark-hover'
      }`}
    >
      <span className="mr-2">{emoji}</span>
      {label}
    </button>
  );

  return (
    <>
      <div className="min-h-screen bg-dark text-white">
        <header className="p-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/groups" className="p-2 rounded-full hover:bg-dark-elevated" aria-label="Back to groups">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="w-5 h-5 rounded-full ml-4" style={{ backgroundColor: group.color }}></div>
            <h1 className="text-2xl md:text-3xl font-bold ml-3 truncate">{group.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
                onClick={() => navigate(`/groups/${groupId}/history`)}
                className="px-4 py-2 text-sm bg-dark-elevated rounded-lg hover:bg-dark-hover"
              >
                History
              </button>
            <button
              onClick={() => navigate(`/groups/${groupId}/spin`)}
              className="flex items-center space-x-2 px-4 py-2 bg-gold text-dark font-bold rounded-lg shadow-lg hover:bg-gold-light transform hover:scale-105 transition-transform"
            >
              <Ticket className="w-5 h-5" />
              <span>Spin Reel</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
             <div className="grid w-full grid-cols-2 gap-2 md:w-auto md:grid-cols-4">
                <FilterButton value="all" label="All" emoji="🎬" />
                <FilterButton value="must-watch" label="Must Watch" emoji="🌟" />
                <FilterButton value="already-seen" label="Seen" emoji="✅" />
                <FilterButton value="pass" label="Pass" emoji="👎" />
            </div>
            <button
                onClick={() => setAddMovieModalOpen(true)}
                className="flex items-center justify-center space-x-2 w-full md:w-auto px-4 py-3 bg-dark-elevated text-white font-bold rounded-lg hover:bg-dark-hover transition-colors"
            >
                <Plus className="w-5 h-5" />
                <span>Add Movie</span>
            </button>
          </div>
            
          {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMovies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} groupId={group.id} />
                  ))}
              </div>
          ) : (
              <div className="text-center p-12 bg-dark-elevated rounded-2xl border-2 border-dashed border-gray-700">
                  <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white">No Unwatched Movies Found</h3>
                  <p className="text-gray-400 mt-2">
                    {filter === 'all' ? 'Your watchlist is empty. Add a movie to get started!' : `No movies match the "${filter}" filter.`}
                  </p>
              </div>
          )}

          <section className="mt-16 text-center">
             <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button onClick={() => setInviteModalOpen(true)} className="w-full md:w-auto px-8 py-3 bg-dark-elevated text-white font-bold rounded-lg hover:bg-dark-hover">
                    Invite Friends
                </button>
                 <button onClick={handleLeaveGroup} className="w-full md:w-auto px-6 py-2 text-cinema-red hover:underline">
                    Leave Group
                </button>
            </div>
          </section>
        </main>
      </div>

      <InviteModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} inviteCode={group.inviteCode} groupName={group.name} />
      <AddMovieModal isOpen={isAddMovieModalOpen} onClose={() => setAddMovieModalOpen(false)} onAddMovie={handleAddMovie} existingTmdbIds={existingTmdbIds} />
    </>
  );
};

export default GroupDetailPage;