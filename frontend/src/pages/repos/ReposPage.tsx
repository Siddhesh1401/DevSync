import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';
import './ReposPage.css';

interface Team {
  id: string;
  name: string;
  description: string | null;
}

interface Repo {
  id: string;
  github_repo_name: string;
  github_repo_url: string;
  webhook_secret?: string;
  is_connected: boolean;
  connected_at: string | null;
  created_at: string;
}

const API = import.meta.env.VITE_API_URL;

export const ReposPage: React.FC = () => {
  const { session } = useAuth();
  const token = session?.access_token;

  const [team, setTeam] = useState<Team | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Create team form
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamError, setTeamError] = useState('');

  // Connect repo form
  const [repoUrl, setRepoUrl] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [repoError, setRepoError] = useState('');
  const [newRepo, setNewRepo] = useState<(Repo & { webhook_url: string; webhook_secret: string }) | null>(null);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API}/api/teams/me`, { headers: authHeaders });
      const json = await res.json();
      setTeam(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchRepos = async () => {
    if (!team) return;
    setLoadingRepos(true);
    try {
      const res = await fetch(`${API}/api/repos`, { headers: authHeaders });
      const json = await res.json();
      setRepos(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => { if (token) fetchTeam(); }, [token]);
  useEffect(() => { if (team) fetchRepos(); }, [team]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) { setTeamError('Team name is required'); return; }
    setCreatingTeam(true);
    setTeamError('');
    try {
      const res = await fetch(`${API}/api/teams`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: teamName, description: teamDesc }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      setTeam(json.data);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) { setRepoError('Repository URL is required'); return; }
    setConnecting(true);
    setRepoError('');
    setNewRepo(null);
    try {
      // Extract repo name from URL (e.g. "owner/repo" from "https://github.com/owner/repo")
      const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
      if (!match) throw new Error('Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)');
      const repoName = match[1].replace(/\.git$/, '');

      const res = await fetch(`${API}/api/repos`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ github_repo_name: repoName, github_repo_url: repoUrl.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      setNewRepo(json.data);
      setRepos(prev => [json.data, ...prev]);
      setRepoUrl('');
      setShowConnectForm(false);
    } catch (err: any) {
      setRepoError(err.message || 'Failed to connect repository');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (repoId: string) => {
    if (!confirm('Disconnect this repository? Existing PR data will be preserved.')) return;
    try {
      await fetch(`${API}/api/repos/${repoId}`, { method: 'DELETE', headers: authHeaders });
      setRepos(prev => prev.filter(r => r.id !== repoId));
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <DashboardLayout title="GitHub Repositories">
      <div className="repos-page">

        {/* ── No team yet ── */}
        {loadingTeam ? (
          <div className="repos-loading">Loading...</div>
        ) : !team ? (
          <div className="create-team-section">
            <div className="create-team-card">
              <div className="create-team-icon">👥</div>
              <h2>Create Your Team First</h2>
              <p>Before connecting a GitHub repository, you need to set up your team.</p>
              <form onSubmit={handleCreateTeam} className="team-form">
                {teamError && <div className="error-banner">{teamError}</div>}
                <div className="form-group">
                  <label htmlFor="team-name">Team Name *</label>
                  <input
                    id="team-name"
                    type="text"
                    placeholder="e.g. My Dev Team"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    disabled={creatingTeam}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="team-desc">Description (optional)</label>
                  <input
                    id="team-desc"
                    type="text"
                    placeholder="What does your team work on?"
                    value={teamDesc}
                    onChange={e => setTeamDesc(e.target.value)}
                    disabled={creatingTeam}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={creatingTeam}>
                  {creatingTeam ? 'Creating...' : 'Create Team'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* ── Team header ── */}
            <div className="team-banner">
              <div>
                <span className="team-label">Team</span>
                <span className="team-name">👥 {team.name}</span>
              </div>
              <button
                className="btn-primary"
                onClick={() => { setShowConnectForm(true); setNewRepo(null); setRepoError(''); }}
              >
                + Connect Repository
              </button>
            </div>

            {/* ── Success banner with webhook instructions ── */}
            {newRepo && (
              <div className="webhook-instructions">
                <h3>✅ Repository added! Now connect it to GitHub:</h3>
                <div className="webhook-steps">
                  <div className="webhook-step">
                    <span className="webhook-step-num">1</span>
                    <span>Go to your GitHub repo → <strong>Settings → Webhooks → Add webhook</strong></span>
                  </div>
                  <div className="webhook-step">
                    <span className="webhook-step-num">2</span>
                    <div>
                      <div className="webhook-step-label">Payload URL</div>
                      <div className="copy-row">
                        <code>{newRepo.webhook_url}</code>
                        <button onClick={() => copyToClipboard(newRepo.webhook_url, 'url')}>
                          {copiedField === 'url' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <div style={{ fontSize: '12px', color: '#8d96a0', marginTop: '4px' }}>
                        * Use this exact URL in GitHub Webhook Payload URL.
                      </div>
                    </div>
                  </div>
                  <div className="webhook-step">
                    <span className="webhook-step-num">3</span>
                    <div>
                      <div className="webhook-step-label">Secret</div>
                      <div className="copy-row">
                        <code>{newRepo.webhook_secret}</code>
                        <button onClick={() => copyToClipboard(newRepo.webhook_secret, 'secret')}>
                          {copiedField === 'secret' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="webhook-step">
                    <span className="webhook-step-num">4</span>
                    <span>Set Content type to <strong>application/json</strong>, select <strong>"Send me everything"</strong>, then click <strong>Add webhook</strong></span>
                  </div>
                  <div className="webhook-step">
                    <span className="webhook-step-num">5</span>
                    <span>GitHub will send a ping — DevSync will auto-confirm the connection ✅</span>
                  </div>
                </div>
                <button className="dismiss-btn" onClick={() => setNewRepo(null)}>Dismiss</button>
              </div>
            )}

            {/* ── Connect form ── */}
            {showConnectForm && !newRepo && (
              <div className="connect-form-card">
                <h3>Connect a GitHub Repository</h3>
                <form onSubmit={handleConnectRepo}>
                  {repoError && <div className="error-banner">{repoError}</div>}
                  <div className="form-group">
                    <label htmlFor="repo-url">GitHub Repository URL</label>
                    <input
                      id="repo-url"
                      type="url"
                      placeholder="https://github.com/owner/repository"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      disabled={connecting}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowConnectForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={connecting}>
                      {connecting ? 'Connecting...' : 'Connect Repository'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Repos list ── */}
            {loadingRepos ? (
              <div className="repos-loading">Loading repositories...</div>
            ) : repos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🐙</div>
                <h3>No repositories connected yet</h3>
                <p>Click "Connect Repository" above to link your first GitHub repo.</p>
              </div>
            ) : (
              <div className="repos-list">
                {repos.map(repo => (
                  <div key={repo.id} className="repo-card">
                    <div className="repo-info">
                      <div className="repo-name">
                        <span className="repo-icon">📁</span>
                        <a href={repo.github_repo_url} target="_blank" rel="noreferrer">
                          {repo.github_repo_name}
                        </a>
                      </div>
                      <div className="repo-meta">
                        Added {new Date(repo.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="repo-actions">
                      <span className={`status-badge ${repo.is_connected ? 'connected' : 'pending'}`}>
                        {repo.is_connected ? '✅ Connected' : '⏳ Pending'}
                      </span>
                      {!repo.is_connected && (
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => setNewRepo({
                            ...repo,
                            webhook_url: `${API}/api/webhook/github`,
                            webhook_secret: repo.webhook_secret || ''
                          })}
                        >
                          Setup Instructions
                        </button>
                      )}
                      <a href={repo.github_repo_url} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                        View on GitHub ↗
                      </a>
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => handleDisconnect(repo.id)}
                        title="Remove this repository from DevSync"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
