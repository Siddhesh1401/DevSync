import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { supabase } from '../../lib/supabase';

export const VerifyEmailPage: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a session (which means email was verified by clicking the link)
    const checkVerification = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsVerified(true);
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (err) {
        console.error('Verification check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerification();
  }, [navigate]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setError('');

    try {
      if (!email.trim()) {
        setError('Please enter your email address first.');
        return;
      }

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (resendError) {
        throw resendError;
      }

      setError('Verification email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Verifying Email">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Checking verification status...</p>
        </div>
      </AuthLayout>
    );
  }

  if (isVerified) {
    return (
      <AuthLayout title="Email Verified">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: '18px', color: '#388e3c', marginBottom: '20px' }}>
            ✅ Email verified successfully!
          </p>
          <p style={{ color: '#666' }}>Redirecting to dashboard...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify Your Email">
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '18px', marginBottom: '20px', color: '#333' }}>
          We sent a verification link to your email address.
        </p>

        <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          Click the link in your email to confirm your account. If you don't see it, check your spam folder.
        </p>

        <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
          <label htmlFor="verifyEmail">Email Address</label>
          <input
            id="verifyEmail"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={resendLoading}
            required
          />
        </div>

        {error && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleResendEmail}
          disabled={resendLoading}
          style={{
            padding: '10px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px',
            opacity: resendLoading ? 0.6 : 1,
          }}
        >
          {resendLoading ? 'Sending...' : 'Resend Verification Email'}
        </button>

        <p style={{ fontSize: '12px', color: '#999' }}>
          Didn't receive the email? Check your spam folder or try resending above.
        </p>
      </div>
    </AuthLayout>
  );
};
