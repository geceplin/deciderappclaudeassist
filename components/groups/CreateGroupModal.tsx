
import React, { useState } from 'react';
import { groupColors } from '../../utils/colorPalette';
import { X } from '../icons/Icons';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(groupColors[0].value);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Group name must be at least 2 characters.');
      return;
    }
    if (name.trim().length > 30) {
      setError('Group name must be 30 characters or less.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onCreate(name, selectedColor);
      setName('');
      setSelectedColor(groupColors[0].value);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
    >
      <div 
        className="bg-dark-elevated rounded-2xl shadow-lg w-full max-w-md p-8 transform transition-transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="create-group-title" className="text-2xl font-bold text-white">Create New Group</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-300 mb-2">Group Name</label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Roommates Movie Night"
              className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              maxLength={30}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Group Color</label>
            <div className="flex space-x-3">
              {groupColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-gold scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Select ${color.name} color`}
                ></button>
              ))}
            </div>
          </div>

          {error && <p className="text-cinema-red text-sm text-center">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg text-white hover:bg-dark-hover">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gold text-dark font-bold hover:bg-gold-light disabled:bg-gold-dark disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
