
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './hooks/useAuth.ts';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import SignIn from './pages/SignIn.tsx';
import SignUp from './pages/SignUp.tsx';
import GroupsPage from './pages/GroupsPage.tsx';
import GroupDetailPage from './pages/GroupDetailPage.tsx';
import JoinGroupPage from './pages/JoinGroupPage.tsx';
import ReelSpinnerPage from './pages/ReelSpinnerPage.tsx';
import WatchHistoryPage from './pages/WatchHistoryPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import { Film } from './components/icons/Icons.tsx';
import LanguageSelector from './components/common/LanguageSelector.tsx';

// Landing Page Component with Internationalization
const Landing: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-center p-4 relative">
      {/* Language Toggle in top right */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
        <LanguageSelector />
      </div>
      
      <div className="flex items-center space-x-4">
        <Film className="w-16 h-16 text-gold" />
        <h1 className="text-6xl font-extrabold text-gold tracking-wider">DECIDE</h1>
      </div>
      
      {/* Translated Tagline */}
      <p className="mt-4 text-xl text-gray-400">{t('auth.signIn.subtitle')}</p>
      
      <div className="mt-12 flex space-x-4">
        <Link to="/signin" className="px-8 py-3 bg-gold text-dark font-bold rounded-lg shadow-lg hover:bg-gold-light transition-transform transform hover:scale-105">
          {t('auth.signIn.button')}
        </Link>
        <Link to="/signup" className="px-8 py-3 bg-dark-elevated text-white font-bold rounded-lg shadow-lg hover:bg-dark-hover transition-transform transform hover:scale-105">
          {t('auth.signIn.signUpLink')}
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/join/:inviteCode?" element={<ProtectedRoute><JoinGroupPage /></ProtectedRoute>} />
          
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/groups/:groupId" 
            element={
              <ProtectedRoute>
                <GroupDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups/:groupId/spin" 
            element={
              <ProtectedRoute>
                <ReelSpinnerPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups/:groupId/history" 
            element={
              <ProtectedRoute>
                <WatchHistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
