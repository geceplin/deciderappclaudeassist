import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import JoinGroupPage from './pages/JoinGroupPage';
import ReelSpinnerPage from './pages/ReelSpinnerPage';
import WatchHistoryPage from './pages/WatchHistoryPage';
import ProfilePage from './pages/ProfilePage';
import { Film } from './components/icons/Icons';

// Placeholder for the landing page
const Landing: React.FC = () => (
  <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-center p-4">
    <div className="flex items-center space-x-4">
      <Film className="w-16 h-16 text-gold" />
      <h1 className="text-6xl font-extrabold text-gold tracking-wider">DECIDE</h1>
    </div>
    <p className="mt-4 text-xl text-gray-400">Movie night solved.</p>
    <div className="mt-12 flex space-x-4">
      <Link to="/signin" className="px-8 py-3 bg-gold text-dark font-bold rounded-lg shadow-lg hover:bg-gold-light transition-transform transform hover:scale-105">
        Sign In
      </Link>
      <Link to="/signup" className="px-8 py-3 bg-dark-elevated text-white font-bold rounded-lg shadow-lg hover:bg-dark-hover transition-transform transform hover:scale-105">
        Sign Up
      </Link>
    </div>
  </div>
);

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
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
