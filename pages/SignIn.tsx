
import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Film, Eye, EyeOff, GoogleGLogo } from '../components/icons/Icons';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/groups');
    }
  }, [user, navigate]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/groups');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/groups');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-dark-elevated rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
              <Link to="/" className="inline-block">
                <Film className="w-12 h-12 text-gold mx-auto" />
              </Link>
            <h1 className="text-4xl font-extrabold text-gold mt-2">DECIDE</h1>
            <p className="text-gray-400 mt-1">Movie night solved.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoFocus
                className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-200"
                required
              />
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-200"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gold"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </button>
            </div>
            
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-gray-400 hover:text-gold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && <p aria-live="polite" className="text-cinema-red text-sm text-center pt-2">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full h-14 flex items-center justify-center bg-gold text-dark font-bold text-lg rounded-lg shadow-md hover:bg-gold-light active:scale-95 transition-all duration-200 disabled:bg-gold-dark disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-6 h-6 border-4 border-dark border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center">
            <hr className="flex-grow border-gray-600" />
            <span className="px-4 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 flex items-center justify-center bg-transparent border-2 border-gray-600 text-white font-semibold rounded-lg hover:border-white active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <GoogleGLogo className="h-6 w-6 mr-3" />
            Continue with Google
          </button>

          <p className="text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-gold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
};

export default SignIn;