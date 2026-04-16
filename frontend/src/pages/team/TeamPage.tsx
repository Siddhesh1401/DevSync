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

  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });

  const { session } = useAuth();
  const token = session?.access_token;

  useEffect(() => {
    if (!token) return;
    fetchTeamMembers();
  }, [token]);

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

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/api/teams/members/${userId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const json = await res.json();
      if (json.success) {
        fetchTeamMembers(); // Reload
      } else {
        alert(json.error?.message || 'Failed to update role');
      }
    } catch (err) { console.error(err); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await fetch(`${API_URL}/api/teams/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        fetchTeamMembers(); // Reload
      } else {
        alert(json.error?.message || 'Failed to remove member');
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    try {
      const res = await fetch(`${API_URL}/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });
      const json = await res.json();
      if (json.success) {
        fetchTeamMembers();
        setIsEditingTeam(false);
      } else {
        alert(json.error?.message || 'Failed to update team');
      }
    } catch (err) { console.error(err); }
  };

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
            <div className="team-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>{team.name}</h2>
              <span className="badge">Active Workspace</span>
              {team.members?.find(m => m.profile.email === session?.user?.email)?.role !== 'member' && (
                <button 
                  className="btn-ghost-sm" 
                  onClick={() => {
                    setTeamForm({ name: team.name, description: team.description || '' });
                    setIsEditingTeam(true);
                  }}
                  style={{ marginLeft: 'auto', border: '1px solid #334155' }}
                >
                  Edit Workspace
                </button>
              )}
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
                  <div className="member-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {m.role === 'owner' ? (
                      <span className={`role-badge role-${m.role}`}>{m.role}</span>
                    ) : (
                      <select 
                        value={m.role} 
                        onChange={(e) => handleUpdateRole(m.profile.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '12px' }}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    )}
                    
                    {m.id !== session?.user?.id && m.role !== 'owner' && (
                      <button 
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '12px' }}
                        onClick={() => handleRemoveMember(m.profile.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Modal */}
            {isEditingTeam && (
              <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                <div className="modal-content" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
                  <h2 style={{ marginTop: 0 }}>Edit Workspace</h2>
                  <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Team Name</label>
                      <input 
                        type="text" 
                        required 
                        value={teamForm.name} 
                        onChange={e => setTeamForm({...teamForm, name: e.target.value})} 
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Description</label>
                      <textarea 
                        rows={3} 
                        value={teamForm.description} 
                        onChange={e => setTeamForm({...teamForm, description: e.target.value})} 
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', resize: 'vertical' }}
                      />
                    </div>
                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => setIsEditingTeam(false)}>Cancel</button>
                      <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
