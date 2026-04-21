import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const token = session?.access_token;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your invitation...');

  useEffect(() => {
    if (!token || !user) return;

    const processInvite = async () => {
      try {
        const inviteToken = searchParams.get('token');
        if (!inviteToken) {
          setStatus('error');
          setMessage('No invitation token provided.');
          return;
        }

        const res = await fetch(`${API_URL}/api/teams/members/accept`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inviteToken })
        });

        const json = await res.json();

        if (json.success) {
          setStatus('success');
          setMessage(`✅ Welcome! You've joined the team.`);
          setTimeout(() => {
            navigate(`/teams/${json.data.teamId}/dashboard`);
          }, 2000);
        } else {
          setStatus('error');
          setMessage(`❌ ${json.error?.message || 'Failed to accept invitation'}`);
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
        console.error(err);
      }
    };

    processInvite();
  }, [token, user, searchParams, navigate]);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2rem' }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #334155',
              borderTop: '3px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <h2 style={{ color: '#e6edf3' }}>{message}</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: '#86efac' }}>{message}</h2>
            <p style={{ color: '#94a3b8' }}>Redirecting to your team dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#fca5a5' }}>{message}</h2>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Go to Dashboard
            </button>
          </>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};
