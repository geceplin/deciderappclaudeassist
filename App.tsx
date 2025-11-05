
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
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

// Placeholder for the groups page
const GroupsPage: React.FC = () => {
    const { signOut, user } = useAuth();
    return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold text-white">Welcome, {user?.displayName || 'User'}!</h1>
            <p className="text-gray-400 mt-2">This is the protected groups page.</p>
            <button
                onClick={signOut}
                className="mt-8 px-6 py-2 bg-cinema-red text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
            >
                Sign Out
            </button>
        </div>
    );
};

// Import useAuth at the end to avoid "used before defined" with GroupsPage
import { useAuth } from './hooks/useAuth';


function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
