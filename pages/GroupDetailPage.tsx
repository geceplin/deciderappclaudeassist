
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupById, leaveGroup } from '../services/groupService';
import { Group } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ChevronLeft, Users, Film } from '../components/icons/Icons';
import InviteModal from '../components/groups/InviteModal';

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

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
          setGroup(groupData);
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
  }, [groupId, navigate]);

  const handleLeaveGroup = async () => {
    if (!groupId || !user) return;
    if (window.confirm("Are you sure you want to leave this group?")) {
        try {
            await leaveGroup(groupId, user.uid);
            navigate('/groups');
        } catch (err: any) {
            setError(err.message);
        }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="min-h-screen bg-dark flex items-center justify-center text-cinema-red">{error}</div>;
  if (!group) return <div className="min-h-screen bg-dark flex items-center justify-center">Group not found.</div>;

  return (
    <>
      <div className="min-h-screen bg-dark text-white p-4 md:p-8">
        <header className="flex items-center mb-8">
          <Link to="/groups" className="p-2 rounded-full hover:bg-dark-elevated">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center ml-4">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: group.color }}></div>
            <h1 className="text-3xl font-bold ml-3">{group.name}</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
            <div className="bg-dark-elevated rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Members ({group.members.length})</h2>
                {/* Member list would go here */}
                <div className="flex items-center justify-center text-gray-400 h-24 border-2 border-dashed border-gray-700 rounded-lg">
                    <Users className="w-6 h-6 mr-2" />
                    <span>Member avatars and names coming soon!</span>
                </div>
            </div>

            <div className="text-center p-8 bg-dark-elevated rounded-2xl">
                 <Film className="w-16 h-16 text-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Movie selection is coming soon!</h2>
                <p className="text-gray-400 mt-2">Get ready to add, vote, and decide on movies together.</p>
            </div>

             <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="w-full md:w-auto px-6 py-3 bg-gold text-dark font-bold rounded-lg"
                >
                    Invite Friends
                </button>
                 <button
                    onClick={handleLeaveGroup}
                    className="w-full md:w-auto text-cinema-red hover:underline"
                >
                    Leave Group
                </button>
            </div>
        </div>
      </div>
       <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            inviteCode={group.inviteCode}
            groupName={group.name}
        />
    </>
  );
};

export default GroupDetailPage;
