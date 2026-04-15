import React, { useEffect, useState } from 'react';
import './TeamPage.css';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  profile: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
}

interface TeamInfo {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

export const TeamPage: React.FC = () => {
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const token = session?.access_token;

  useEffect(() => {
    if (!token) return;

    const fetchTeamMembers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/teams/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setTeam(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [token]);

  return (
    <DashboardLayout>
      <div className="team-container fade-in">
        <header className="team-header">
          <div>
            <h1>Your Team</h1>
            <p>Manage members and operational permissions.</p>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => alert("Team Member Invites require an SMTP Mail Server and a live web address. This feature will be formally unlocked during Phase 8: Final Deployment!")}
          >
            Invite Member
          </button>
        </header>

        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading team metrics...</div>
        ) : !team ? (
          <div className="empty-team">
            <h2>No Active Team</h2>
            <p>Head to the Dashboard to create a new team.</p>
          </div>
        ) : (
          <div className="team-card">
            <div className="team-card-header">
              <h2>{team.name}</h2>
              <span className="badge">Active Workspace</span>
            </div>
            {team.description && <p className="team-desc">{team.description}</p>}

            <h3 className="section-title">Members</h3>
            <div className="members-list">
              {team.members?.map(m => (
                <div key={m.id} className="member-row">
                  <div className="member-identity">
                    <div className="member-avatar">
                      {m.profile.full_name ? m.profile.full_name.substring(0, 2).toUpperCase() : m.profile.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <h4>{m.profile.full_name || m.profile.email}</h4>
                      <p>{m.profile.email}</p>
                    </div>
                  </div>
                  <div className="member-meta">
                    <span className={`role-badge role-${m.role}`}>{m.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
