import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';
import { Link } from 'react-router-dom';
import './NotificationHistoryPage.css';

const API = import.meta.env.VITE_API_URL;

interface Notification {
  id: string;
  type: string;
  subject: string;
  status: 'sent' | 'failed';
  error: string | null;
  sent_at: string;
}

export const NotificationHistoryPage: React.FC = () => {
  const { session } = useAuth();
  const token = session?.access_token;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API}/api/settings/notifications/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data || []);
        } else {
          throw new Error(json.error?.message || 'Failed to fetch history');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  return (
    <DashboardLayout title="Notification History">
      <div className="history-page">
        <div className="history-header">
          <Link to="/dashboard/settings" className="back-link">← Back to Settings</Link>
          <p>The last 50 emails dispatched to your account.</p>
        </div>

        {loading ? (
          <div className="history-loading">Loading notification history...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">✉️</div>
            <h3>No history yet</h3>
            <p>Once you start receiving PR alerts or task updates, they will appear here.</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id}>
                    <td>
                      <span className={`type-badge type-${n.type}`}>
                        {n.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{n.subject}</td>
                    <td>
                      <span className={`status-badge status-${n.status}`}>
                        {n.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                      </span>
                      {n.error && <p className="error-text">{n.error}</p>}
                    </td>
                    <td>{new Date(n.sent_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
