import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft, Save, Loader2, Settings } from '../components/icons/Icons';
import Avatar from '../components/common/Avatar';
import { formatDate } from '../utils/formatters';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setDisplayName(userProfile.displayName || '');
          setBio(userProfile.bio || '');
        } else {
          setError("Could not find your profile.");
        }
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUserProfile(user.uid, { displayName, bio });
      setSuccess('Profile updated successfully! 🎉');
      // Also update the auth context user display name if it changed
      if (user.displayName !== displayName) {
          await user.reload(); // This reloads user data from Firebase auth
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !profile) return <div className="min-h-screen bg-dark flex items-center justify-center text-cinema-red p-4 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="p-4 md:px-8 flex items-center justify-between sticky top-0 bg-dark/80 backdrop-blur-sm z-10">
        <Link to="/groups" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Groups</span>
        </Link>
        <Link to="/settings" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg -mr-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
        </Link>
      </header>
      <main className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <Avatar name={displayName} size="lg" />
            <div>
                <h1 className="text-4xl font-extrabold text-white">{displayName}</h1>
                <p className="text-gray-400">{profile?.email}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-elevated rounded-2xl p-8 space-y-6">
            <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  required
                />
            </div>
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your friends a bit about yourself..."
                  rows={4}
                  maxLength={150}
                  className="w-full p-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
                <p className="text-xs text-gray-500 text-right mt-1">{bio.length} / 150</p>
            </div>

            {error && <p className="text-cinema-red text-sm">{error}</p>}
            {success && <p className="text-cinema-green text-sm">{success}</p>}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gold text-dark font-bold rounded-lg hover:bg-gold-light disabled:bg-gold-dark disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>
        </form>

        <div className="mt-8 bg-dark-elevated rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gold mb-4">Account Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-dark p-4 rounded-lg">
                    <p className="text-gray-400">Groups Joined</p>
                    <p className="text-white font-semibold text-lg">{profile?.groupIds?.length || 0}</p>
                </div>
                <div className="bg-dark p-4 rounded-lg">
                    <p className="text-gray-400">Member Since</p>
                    <p className="text-white font-semibold text-lg">{formatDate(profile?.createdAt || null)}</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;