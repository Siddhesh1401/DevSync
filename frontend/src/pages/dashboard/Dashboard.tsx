import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import './Dashboard.css';

const API = import.meta.env.VITE_API_URL;

interface Stats {
  openPrs: number;
  assignedTasks: number;
  teamMembers: number;
  newMessages: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ openPrs: 0, assignedTasks: 0, teamMembers: 0, newMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = user?.session?.access_token;
        if (!token) return;

        const res = await fetch(`${API}/api/teams/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to real-time updates for stats
    const channel = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pull_requests' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pr_comments' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="dashboard-page">
        <div className="welcome-section">
          <h2>👋 Welcome back, {user?.user_metadata?.name || user?.email}!</h2>
          <p>Here's your team's status at a glance</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-label">Open PRs</div>
              <div className="stat-value">{loading ? '...' : stats.openPrs}</div>
              <div className="stat-description">Awaiting review</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <div className="stat-label">Assigned Tasks</div>
              <div className="stat-value">{loading ? '...' : stats.assignedTasks}</div>
              <div className="stat-description">For you</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Team Members</div>
              <div className="stat-value">{loading ? '...' : stats.teamMembers}</div>
              <div className="stat-description">In your team</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <div className="stat-label">New Messages</div>
              <div className="stat-value">{loading ? '...' : stats.newMessages}</div>
              <div className="stat-description">Today</div>
            </div>
          </div>
        </div>

        <div className="recent-activity-section">
          <h3>🔔 Recent Activity</h3>
          <div className="empty-state">
            <p>No recent activity yet. Start by inviting team members or connecting a GitHub repository!</p>
          </div>
        </div>

        <div className="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="action-grid">
            <button className="action-btn">
              <span className="action-icon">➕</span>
              <span>Create Task</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🐙</span>
              <span>Connect GitHub</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">👥</span>
              <span>Invite Team Member</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">⚙️</span>
              <span>Team Settings</span>
            </button>
          </div>
        </div>

        <div className="getting-started">
          <h3>📚 Getting Started</h3>
          <div className="checklist">
            <div className="checklist-item">
              <input type="checkbox" id="item1" />
              <label htmlFor="item1">Complete your profile</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="item2" />
              <label htmlFor="item2">Invite team members to your team</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="item3" />
              <label htmlFor="item3">Connect your first GitHub repository</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="item4" />
              <label htmlFor="item4">Create your first task</label>
            </div>
            <div className="checklist-item">
              <input type="checkbox" id="item5" />
              <label htmlFor="item5">Set your notification preferences</label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
