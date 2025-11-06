import React from 'react';

interface AvatarProps {
  name: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
  const getInitials = (nameStr: string | null | undefined): string => {
    if (!nameStr) return '?';
    const names = nameStr.trim().split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const colorClasses = [
    'bg-cinema-red', 'bg-cinema-blue', 'bg-cinema-green', 'bg-yellow-500', 
    'bg-purple-600', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  // A simple hash to get a consistent color for a name
  const colorIndex = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorClasses.length;

  return (
    <div 
        className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${sizeClasses[size]} ${colorClasses[colorIndex]}`}
        title={name || 'Unknown User'}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
