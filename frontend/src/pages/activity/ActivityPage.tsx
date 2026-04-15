import React, { useEffect, useState } from 'react';
import './ActivityPage.css';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ActivityEvent {
  id: string;
  actor_name: string;
  event_type: string;
  description: string;
  metadata: any;
  created_at: string;
}

const ActivityPage: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const token = session?.access_token;

  useEffect(() => {
    if (!token) return;

    const fetchActivity = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch activity feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [token]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderIconContent = (actor: string) => {
    return actor ? actor.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <DashboardLayout>
      <div className="activity-container fade-in">
        <header className="activity-header">
          <h1>Team Activity</h1>
          <p>A real-time heartbeat of everything happening in your team.</p>
        </header>

        {loading ? (
          <div className="timeline-empty">Loading team heartbeat...</div>
        ) : events.length === 0 ? (
          <div className="timeline-empty">No activity found. Connect a GitHub repository to see the magic happen!</div>
        ) : (
          <div className="timeline">
            {events.map((evt) => (
              <div key={evt.id} className={`timeline-item ${evt.event_type}`}>
                <div className="timeline-content">
                  <header>
                    <div className="actor-meta">
                      <div className="actor-avatar">{renderIconContent(evt.actor_name)}</div>
                      <span className="actor-name">@{evt.actor_name}</span>
                    </div>
                    <span className="event-time">{formatTime(evt.created_at)}</span>
                  </header>
                  <div className="event-description">
                    {/* Provide formatted output: embolden keywords for aesthetic */}
                    {evt.description.split(/(\d+ commits?|PR #\d+|merged|opened|pushed)/).map((part, i) => {
                      const highlightWords = ['merged', 'opened', 'pushed', 'commits', 'PR'];
                      if (highlightWords.some(w => part.includes(w))) {
                        return <strong key={i}>{part}</strong>;
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export { ActivityPage };
