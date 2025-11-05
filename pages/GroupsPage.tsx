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
  const [error, setError] = useState<string | null>(null); // State to hold fetch errors
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [newGroupInfo, setNewGroupInfo] = useState<{ code: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('[GroupsPage] Component mounted or user changed.');
    if (!user) {
        console.log('[GroupsPage] No user found, skipping subscription.');
        setLoading(false);
        return;
    };

    console.log('[GroupsPage] useEffect: Subscribing to user groups for user:', user.uid);
    setLoading(true);
    setError(null);

    const unsubscribe = onUserGroupsSnapshot(
      user.uid,
      (fetchedGroups) => {
        console.log('[GroupsPage] onSnapshot SUCCESS: Received updated groups list.', fetchedGroups);
        setGroups(fetchedGroups);
        setError(null); // Clear previous errors on successful fetch
        setLoading(false);
      },
      (err) => {
        console.error('[GroupsPage] onSnapshot ERROR:', err);
        // The error message from Firestore is often very helpful, especially for missing indexes.
        setError(`Failed to load groups: ${err.message}. Check the browser console for a link to create a required Firestore index.`);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log('[GroupsPage] useEffect cleanup: Unsubscribing from snapshot listener.');
      unsubscribe();
    };
  }, [user]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handleCreateGroup = async (name: string, color: string) => {
    if (!user) return;
    try {
        const { id, inviteCode } = await createGroup(name, color, user.uid);
        setNewGroupInfo({ code: inviteCode, name });
        showToast("Group created! 🎉 Share the invite code.");
        setCreateModalOpen(false);
        setInviteModalOpen(true);
    } catch(err: any) {
        console.error("Failed to create group:", err);
        setError(err.message);
    }
  };

  const EmptyState = () => (
    <div className="text-center col-span-full mt-16">
        <Film className="w-24 h-24 text-gray-700 mx-auto" />
        <h2 className="mt-6 text-2xl font-bold text-white">Your Movie Crew Awaits</h2>
        <p className="mt-2 text-gray-400">Start your first group to begin solving movie night debates. 🍿</p>
    </div>
  );
  
  const renderContent = () => {
    console.log(`[GroupsPage] renderContent called. Loading: ${loading}, Error: ${error}, Groups: ${groups.length}`);
    if (loading) {
        console.log('[GroupsPage] Rendering Skeletons.');
        return [...Array(3)].map((_, i) => <GroupCardSkeleton key={i} />);
    }
    if (error) {
        console.log('[GroupsPage] Rendering Error message.');
        return (
            <div className="col-span-full mt-16 text-center bg-dark-elevated p-6 rounded-lg">
                <h3 className="text-xl text-cinema-red font-bold">Oops! Something went wrong.</h3>
                <p className="text-gray-400 mt-2 whitespace-pre-wrap">{error}</p>
            </div>
        );
    }
    if (groups.length > 0) {
        console.log('[GroupsPage] Rendering Group Cards.');
        return groups.map((group) => <GroupCard key={group.id} group={group} />);
    }
    console.log('[GroupsPage] Rendering Empty State.');
    return <EmptyState />;
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderContent()}
          </div>
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
