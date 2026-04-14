import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';
import './PRDetailPage.css';

interface PR {
  id: string;
  github_pr_id: number;
  title: string;
  description: string | null;
  author_name: string;
  author_avatar: string | null;
  branch_name: string;
  base_branch: string;
  status: 'open' | 'merged' | 'closed';
  github_url: string;
  commits_count: number;
  changed_files_count: number;
  merged_at: string | null;
  merged_by: string | null;
  created_at: string;
  updated_at: string;
  repositories: { github_repo_name: string; github_repo_url: string } | null;
}

const API = import.meta.env.VITE_API_URL;

const STATUS_CONFIG = {
  open:   { label: 'Open',   color: '#3fb950', bg: 'rgba(63,185,80,0.12)',   icon: '🟢' },
  merged: { label: 'Merged', color: '#a371f7', bg: 'rgba(163,113,247,0.12)', icon: '🟣' },
  closed: { label: 'Closed', color: '#8b949e', bg: 'rgba(139,148,158,0.12)', icon: '⚫' },
};

export const PRDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const token = session?.access_token;

  const [pr, setPr] = useState<PR | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) return;

    const fetchPR = async () => {
      try {
        const res = await fetch(`${API}/api/prs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || 'PR not found');
        setPr(json.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load pull request');
      } finally {
        setLoading(false);
      }
    };

    fetchPR();
  }, [id, token]);

  const statusConfig = pr ? STATUS_CONFIG[pr.status] : null;

  return (
    <DashboardLayout title="Pull Request">
      <div className="pr-detail-page">

        {/* ── Back ── */}
        <button className="back-btn" onClick={() => navigate('/dashboard/prs')}>
          ← Back to Pull Requests
        </button>

        {loading ? (
          <div className="pr-detail-loading">
            <div className="loading-spinner" />
            <span>Loading pull request...</span>
          </div>
        ) : error ? (
          <div className="pr-detail-error">
            <div className="error-icon">⚠️</div>
            <h3>{error}</h3>
            <Link to="/dashboard/prs" className="btn-primary">Back to PRs</Link>
          </div>
        ) : pr ? (
          <>
            {/* ── PR Header ── */}
            <div className="pr-detail-header">
              <div className="pr-title-row">
                <span
                  className="pr-status-pill"
                  style={{ color: statusConfig!.color, background: statusConfig!.bg }}
                >
                  {statusConfig!.icon} {statusConfig!.label}
                </span>
                <h1 className="pr-title">
                  {pr.title}
                  <span className="pr-number"> #{pr.github_pr_id}</span>
                </h1>
              </div>

              <div className="pr-sub">
                <span className="pr-repo">
                  📁 {pr.repositories?.github_repo_name || 'Unknown repo'}
                </span>
                <span>opened {new Date(pr.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span>updated {new Date(pr.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>

              <a
                href={pr.github_url}
                target="_blank"
                rel="noreferrer"
                className="view-on-github-btn"
              >
                🐙 View on GitHub ↗
              </a>
            </div>

            {/* ── Metadata grid ── */}
            <div className="pr-meta-grid">
              <div className="meta-card">
                <div className="meta-label">Author</div>
                <div className="meta-value author-value">
                  <img
                    src={pr.author_avatar || `https://github.com/${pr.author_name}.png?size=32`}
                    alt={pr.author_name}
                    className="author-avatar"
                  />
                  <a
                    href={`https://github.com/${pr.author_name}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {pr.author_name}
                  </a>
                </div>
              </div>

              <div className="meta-card">
                <div className="meta-label">Branch</div>
                <div className="meta-value branch-value">
                  <code>{pr.branch_name}</code>
                  <span className="branch-arrow">→</span>
                  <code>{pr.base_branch}</code>
                </div>
              </div>

              <div className="meta-card">
                <div className="meta-label">Commits</div>
                <div className="meta-value">💬 {pr.commits_count} commit{pr.commits_count !== 1 ? 's' : ''}</div>
              </div>

              <div className="meta-card">
                <div className="meta-label">Files Changed</div>
                <div className="meta-value">📝 {pr.changed_files_count} file{pr.changed_files_count !== 1 ? 's' : ''}</div>
              </div>

              {pr.status === 'merged' && pr.merged_by && (
                <div className="meta-card">
                  <div className="meta-label">Merged by</div>
                  <div className="meta-value">
                    <a href={`https://github.com/${pr.merged_by}`} target="_blank" rel="noreferrer">
                      {pr.merged_by}
                    </a>
                    {pr.merged_at && (
                      <span className="merged-date">
                        {' '}on {new Date(pr.merged_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Description ── */}
            {pr.description && (
              <div className="pr-description-section">
                <h3>📄 Description</h3>
                <div className="pr-description">{pr.description}</div>
              </div>
            )}

            {/* ── Discussion placeholder ── */}
            <div className="pr-discussion-placeholder">
              <div className="placeholder-icon">💬</div>
              <h3>Discussion coming in Phase 5</h3>
              <p>
                In-app PR discussions with @mentions and markdown support will be
                available after Phase 5 is complete.
              </p>
              <a href={pr.github_url} target="_blank" rel="noreferrer" className="btn-ghost">
                Discuss on GitHub for now ↗
              </a>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};
