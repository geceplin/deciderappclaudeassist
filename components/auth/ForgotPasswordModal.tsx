
import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, Loader2, Mail } from '../icons/Icons';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { sendPasswordResetLink } = useAuth();

  useEffect(() => {
    // Reset state when modal is closed/opened
    if (isOpen) {
      setEmail('');
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    try {
      await sendPasswordResetLink(email);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 4000); // Close automatically after showing success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-dark-elevated rounded-2xl shadow-lg w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <Mail className="w-16 h-16 text-gold mx-auto mb-4" />
            <p className="text-lg font-semibold text-white mb-2">Check your email!</p>
            <p className="text-sm text-gray-400">
              We've sent a password reset link to <br />
              <strong className="text-white">{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label htmlFor="reset-email" className="sr-only">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                autoFocus
                required
              />
            </div>

            {error && <p className="text-cinema-red text-sm text-center">{error}</p>}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center bg-gold text-dark font-bold rounded-lg hover:bg-gold-light disabled:bg-gold-dark disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 rounded-lg text-white font-semibold hover:bg-dark-hover"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
