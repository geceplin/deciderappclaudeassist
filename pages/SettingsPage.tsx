
import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Loader2, Save } from '../components/icons/Icons';

const SettingsPage: React.FC = () => {
  const { user, changeUserPassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isGoogleUser = user?.providerData[0]?.providerId === 'google.com';

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setSuccess('Password changed successfully!');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="p-4 md:px-8 flex items-center sticky top-0 bg-dark/80 backdrop-blur-sm z-10">
        <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Profile</span>
        </Link>
      </header>
      <main className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8">Account Settings</h1>

        <div className="bg-dark-elevated rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gold mb-4">Change Password</h2>

          {isGoogleUser ? (
            <p className="text-gray-400">
              You are signed in with a Google account. Password management is handled by Google.
            </p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  required
                />
              </div>

              {error && <p className="text-cinema-red text-sm">{error}</p>}
              {success && <p className="text-cinema-green text-sm">{success}</p>}

              <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gold text-dark font-bold rounded-lg hover:bg-gold-light disabled:bg-gold-dark disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
