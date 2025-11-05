
import React from 'react';
import { Film } from '../icons/Icons';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <Film className="w-16 h-16 text-gold animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
