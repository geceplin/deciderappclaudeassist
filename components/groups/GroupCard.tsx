
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../../types';
import { timeAgo } from '../../utils/timeAgo';
import { Users, Film as FilmIcon } from '../icons/Icons';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/groups/${group.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-dark-elevated rounded-2xl p-6 h-48 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-gold-glow hover:-translate-y-1 transition-all duration-200"
      role="button"
      tabIndex={0}
      aria-label={`Navigate to ${group.name} group page`}
    >
      <div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }}></div>
          <h3 className="text-xl font-bold text-white truncate">{group.name}</h3>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <FilmIcon className="w-4 h-4" />
          <span>{group.movieCount} movie{group.movieCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-right">
        <span>Last active: {timeAgo(group.lastActivity)}</span>
      </div>
    </div>
  );
};

export default GroupCard;
