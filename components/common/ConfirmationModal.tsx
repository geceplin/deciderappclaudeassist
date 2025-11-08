import React from 'react';
import { X, Loader2 } from '../icons/Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  confirmStyle?: 'primary' | 'destructive';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmStyle = 'destructive',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const confirmButtonClasses = {
    primary: 'bg-gold text-dark hover:bg-gold-light',
    destructive: 'bg-cinema-red text-white hover:bg-red-700',
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div
        className="bg-dark-elevated rounded-2xl shadow-lg w-full max-w-sm p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <h2 id="confirmation-title" className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 mb-8">{description}</p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full h-12 flex items-center justify-center font-bold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-wait ${confirmButtonClasses[confirmStyle]}`}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full h-12 rounded-lg text-white font-semibold hover:bg-dark-hover disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;