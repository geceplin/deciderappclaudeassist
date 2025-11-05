
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { onUserGroupsSnapshot, createGroup } from '../services/groupService';
import { Group } from '../types';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import InviteModal from '../components/groups/InviteModal';
import { Film, Plus } from '../components/icons/Icons';

const GroupCardSkeleton: React.FC = () => (
    <div className="bg-dark-elevated rounded-2xl p-6 h-48 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 rounded-full bg-gray-700"></div>
        <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
      </div>
      <div className="space-y-3 mt-8">
        <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
        <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
      </div>
      <div className="h-3 w-1/4 bg-gray-700 rounded mt-6 ml-auto"></div>
    </div>
);

const GroupsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [newGroupInfo, setNewGroupInfo] = useState<{ code: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = onUserGroupsSnapshot(user.uid, (fetchedGroups) => {
      setGroups(fetchedGroups);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handleCreateGroup = async (name: string, color: string) => {
    if (!user) return;
    const { id, inviteCode } = await createGroup(name, color, user.uid);
    setNewGroupInfo({ code: inviteCode, name });
    showToast("Group created! 🎉 Share the invite code.");
    setCreateModalOpen(false);
    setInviteModalOpen(true);
  };

  const EmptyState = () => (
    <div className="text-center col-span-full mt-16">
        <Film className="w-24 h-24 text-gray-700 mx-auto" />
        <h2 className="mt-6 text-2xl font-bold text-white">Your Movie Crew Awaits</h2>
        <p className="mt-2 text-gray-400">Start your first group to begin solving movie night debates. 🍿</p>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-dark text-white">
        <header className="p-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Film className="w-8 h-8 text-gold" />
            <span className="text-2xl font-bold">DECIDE</span>
          </div>
          <button onClick={signOut} className="px-4 py-2 text-sm bg-dark-elevated rounded-lg hover:bg-dark-hover">
            Sign Out
          </button>
        </header>

        <main className="p-4 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Movie Groups</h1>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-gold text-dark font-bold rounded-lg shadow-lg hover:bg-gold-light transition-transform transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Group</span>
            </button>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <GroupCardSkeleton key={i} />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.length > 0 ? (
                    groups.map((group) => <GroupCard key={group.id} group={group} />)
                ) : (
                    <EmptyState />
                )}
            </div>
          )}
        </main>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateGroup}
      />

      {newGroupInfo && (
        <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            inviteCode={newGroupInfo.code}
            groupName={newGroupInfo.name}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-cinema-green text-white px-6 py-3 rounded-lg shadow-lg">
            {toastMessage}
        </div>
      )}
    </>
  );
};

export default GroupsPage;
