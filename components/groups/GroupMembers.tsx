
import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Group, UserProfile } from '../../types';
import { removeMemberFromGroup } from '../../services/groupService';
import Avatar from '../common/Avatar';
import { Shield, MoreVertical, Trash2 } from '../icons/Icons';

interface GroupMembersProps {
  group: Group;
  members: Map<string, UserProfile>;
  currentUser: FirebaseUser | null;
  onLeaveGroup: () => Promise<void>;
}

const MemberRow: React.FC<{
  member: UserProfile;
  isOwner: boolean;
  isCurrentUser: boolean;
  canManage: boolean;
  onRemove: () => void;
  onLeave: () => void;
}> = ({ member, isOwner, isCurrentUser, canManage, onRemove, onLeave }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar name={member.displayName} />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">{member.displayName}</p>
            {isOwner && (
              <div className="flex items-center gap-1 text-xs text-gold bg-gold/20 px-2 py-0.5 rounded-full" title="Group Owner">
                <Shield className="w-3 h-3" />
                <span>Owner</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400">{member.email}</p>
        </div>
      </div>
      <div className="relative">
        {(canManage && !isOwner) || isCurrentUser ? (
            <button onClick={() => setMenuOpen(prev => !prev)} onBlur={() => setTimeout(() => setMenuOpen(false), 200)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-dark">
                <MoreVertical className="w-5 h-5" />
            </button>
        ) : null}

        {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-elevated rounded-md shadow-lg z-10 border border-gray-700">
                {canManage && !isCurrentUser && (
                    <button onClick={onRemove} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-cinema-red hover:bg-dark-hover">
                        <Trash2 className="w-4 h-4" />
                        Remove Member
                    </button>
                )}
                 {isCurrentUser && (
                    <button onClick={onLeave} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-cinema-red hover:bg-dark-hover">
                         <Trash2 className="w-4 h-4" />
                        Leave Group
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

const GroupMembers: React.FC<GroupMembersProps> = ({ group, members, currentUser, onLeaveGroup }) => {
  const [error, setError] = useState('');
  
  if (!currentUser) return null;

  const handleRemoveMember = async (memberId: string) => {
    if (!group.id || !currentUser) return;
    if (window.confirm("Are you sure you want to remove this member from the group?")) {
        try {
            await removeMemberFromGroup(group.id, memberId, currentUser.uid);
        } catch (err: any) {
            setError(err.message);
            alert(err.message);
        }
    }
  };

  const sortedMembers = (Array.from(members.values()) as UserProfile[]).sort((a, b) => {
    if (a.uid === group.ownerId) return -1;
    if (b.uid === group.ownerId) return 1;
    return (a.displayName || '').localeCompare(b.displayName || '');
  });

  return (
    <div className="bg-dark-elevated rounded-2xl p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Group Members ({members.size})</h2>
        <div className="space-y-3">
            {sortedMembers.map(member => (
                <MemberRow
                    key={member.uid}
                    member={member}
                    isOwner={member.uid === group.ownerId}
                    isCurrentUser={member.uid === currentUser.uid}
                    canManage={currentUser.uid === group.ownerId}
                    onRemove={() => handleRemoveMember(member.uid)}
                    onLeave={onLeaveGroup}
                />
            ))}
        </div>
        {error && <p className="text-cinema-red text-sm mt-4">{error}</p>}
    </div>
  );
};

export default GroupMembers;
