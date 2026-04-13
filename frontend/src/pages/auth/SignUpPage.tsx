import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { signUp, signInWithGitHub, isMockAuth } = useAuth();

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 8) return 'weak';
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[!@#$%^&*]/.test(pwd)) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password);
      setSuccess(
        isMockAuth
          ? 'Sign up successful in local dev mode. Redirecting to dashboard...'
          : 'Sign up successful! Please check your email for verification link.'
      );
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreeTerms(false);
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate(isMockAuth ? '/dashboard' : '/verify-email');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGitHub();
    } catch (err: any) {
      setError(err.message || 'GitHub sign up failed');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account">
      <form className="auth-form" onSubmit={handleSignUp}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          {passwordStrength && (
            <div className={`password-strength ${passwordStrength}`}>
              Strength: <strong>{passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}</strong>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={isLoading}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>
              I agree to the{' '}
              <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>
                Terms & Conditions
              </a>
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div className="auth-divider">OR</div>

        <button 
          type="button"
          className="oauth-btn"
          onClick={handleGitHubSignUp}
          disabled={isLoading}
        >
          <span>🐙</span> Sign up with GitHub
        </button>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </form>
    </AuthLayout>
  );
};
