
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupByInviteCode, joinGroup } from '../services/groupService';
import { Group } from '../types';
import { Film } from '../components/icons/Icons';

const JoinGroupPage: React.FC = () => {
  const { inviteCode: codeFromUrl } = useParams<{ inviteCode?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inviteCode, setInviteCode] = useState(codeFromUrl?.toUpperCase() || '');
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect to search for group when code is available (from URL or input)
  useEffect(() => {
    const findGroup = async () => {
      if (inviteCode.length !== 6) {
        setGroup(null);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const foundGroup = await getGroupByInviteCode(inviteCode);
        if (foundGroup) {
          if (user && foundGroup.members.includes(user.uid)) {
            // If already a member, redirect
            navigate(`/groups/${foundGroup.id}`);
            return;
          }
          setGroup(foundGroup);
        } else {
          setError("Invalid invite code. Please check and try again.");
          setGroup(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    findGroup();
  }, [inviteCode, user, navigate]);

  const handleJoin = async () => {
    if (!group || !user) return;
    setLoading(true);
    setError('');
    try {
      await joinGroup(group.inviteCode, user.uid);
      navigate(`/groups/${group.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-elevated rounded-2xl shadow-lg p-8 text-center space-y-6">
        <Link to="/" className="inline-block">
          <Film className="w-12 h-12 text-gold mx-auto" />
        </Link>
        <h1 className="text-3xl font-bold text-white">Join a Movie Group</h1>

        {!group && (
          <>
            <p className="text-gray-400">Enter the 6-character invite code to join a group.</p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full h-14 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest uppercase placeholder-gray-600 focus:outline-none focus:border-gold"
            />
          </>
        )}

        {loading && <div className="text-gold">Searching for group...</div>}

        {error && <p className="text-cinema-red">{error}</p>}
        
        {group && !loading && (
          <div className="space-y-4">
            <p className="text-gray-300">You've been invited to join:</p>
            <div className="bg-dark p-4 rounded-lg">
                <div className="flex items-center justify-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: group.color}}></div>
                    <h2 className="text-2xl font-bold text-white">{group.name}</h2>
                </div>
                <p className="text-gray-500 mt-1">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
            </div>
            <button
                onClick={handleJoin}
                className="w-full h-14 bg-gold text-dark font-bold text-lg rounded-lg hover:bg-gold-light"
            >
                Join Group
            </button>
          </div>
        )}

        <Link to="/groups" className="text-gold hover:underline">
            Back to my groups
        </Link>

      </div>
    </div>
  );
};

export default JoinGroupPage;
