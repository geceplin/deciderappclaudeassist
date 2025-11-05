
import React, { useState, FormEvent, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Film, Eye, EyeOff, GoogleGLogo } from '../components/icons/Icons';

const PasswordStrengthIndicator: React.FC<{ strength: number }> = ({ strength }) => {
  const strengthColor = useMemo(() => {
    if (strength >= 3) return 'bg-cinema-green';
    if (strength === 2) return 'bg-yellow-500';
    return 'bg-cinema-red';
  }, [strength]);

  const strengthWidth = useMemo(() => {
    if (strength >= 3) return 'w-full';
    if (strength === 2) return 'w-2/3';
    if (strength === 1) return 'w-1/3';
    return 'w-0';
  }, [strength]);

  const strengthText = useMemo(() => {
    if (strength >= 3) return 'Strong';
    if (strength === 2) return 'Medium';
    if (strength === 1) return 'Weak';
    return '';
  }, [strength]);

  return (
    <div className="w-full bg-dark rounded-full h-2.5 mt-2">
      <div className={`h-2.5 rounded-full transition-all duration-300 ${strengthColor} ${strengthWidth}`}></div>
      {strength > 0 && <p className="text-xs text-right mt-1 text-gray-400">{strengthText}</p>}
    </div>
  );
};


const SignUp: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/groups');
    }
  }, [user, navigate]);

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    if(password.length === 0) return 0;
    if(strength === 2 && password.length < 8) return 1;
    return strength;
  }, [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (displayName.length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (passwordStrength < 3) {
      setError('Password is not strong enough. It must be at least 8 characters and contain a letter and a number.');
      return;
    }
    
    setLoading(true);
    try {
      await signUp(email, password, displayName);
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
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-elevated rounded-2xl shadow-lg p-8 space-y-4">
        <div className="text-center">
            <Link to="/" className="inline-block">
              <Film className="w-12 h-12 text-gold mx-auto" />
            </Link>
          <h1 className="text-4xl font-extrabold text-gold mt-2">Create Account</h1>
          <p className="text-gray-400 mt-1">Join the club.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            autoFocus
            className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-200"
            required
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-200"
            required
          />
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-200"
              required
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
          <PasswordStrengthIndicator strength={passwordStrength} />
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full h-12 px-4 bg-dark border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-200"
            required
          />

          {error && <p aria-live="polite" className="text-cinema-red text-sm text-center pt-2">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full h-14 flex items-center justify-center bg-gold text-dark font-bold text-lg rounded-lg shadow-md hover:bg-gold-light active:scale-95 transition-all duration-200 disabled:bg-gold-dark disabled:cursor-not-allowed mt-4"
          >
            {loading ? <div className="w-6 h-6 border-4 border-dark border-t-transparent rounded-full animate-spin"></div> : 'Create Account'}
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
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-gold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
