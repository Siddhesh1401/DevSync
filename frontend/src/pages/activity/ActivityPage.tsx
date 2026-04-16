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
  
  // Search & Filter State
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredEvents = events.filter(evt => {
    if (filterType !== 'all') {
      if (filterType === 'pr' && !evt.event_type.startsWith('pr_')) return false;
      if (filterType === 'task' && !evt.event_type.startsWith('task_')) return false;
      if (filterType === 'other' && (evt.event_type.startsWith('pr_') || evt.event_type.startsWith('task_'))) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!evt.description.toLowerCase().includes(q) && !evt.actor_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="activity-container fade-in">
        <header className="activity-header">
          <div className="activity-title-group">
            <h1>Team Activity</h1>
            <p>A real-time heartbeat of everything happening in your team.</p>
          </div>
          <div className="activity-filters" style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Search feed..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            />
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            >
              <option value="all">All Events</option>
              <option value="pr">Pull Requests</option>
              <option value="task">Tasks</option>
              <option value="other">Other Activity</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="timeline-empty">Loading team heartbeat...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="timeline-empty">No activity found matching your filters.</div>
        ) : (
          <div className="timeline">
            {filteredEvents.map((evt) => (
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
