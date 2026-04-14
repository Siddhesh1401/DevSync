import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';
import './PRListPage.css';

interface PR {
  id: string;
  github_pr_id: number;
  title: string;
  author_name: string;
  author_avatar: string | null;
  branch_name: string;
  base_branch: string;
  status: 'open' | 'merged' | 'closed';
  github_url: string;
  commits_count: number;
  changed_files_count: number;
  created_at: string;
  updated_at: string;
  repositories: { github_repo_name: string } | null;
}

const API = import.meta.env.VITE_API_URL;

const STATUS_COLORS: Record<string, string> = {
  open: 'status-open',
  merged: 'status-merged',
  closed: 'status-closed',
};

const STATUS_LABELS: Record<string, string> = {
  open: '🟢 Open',
  merged: '🟣 Merged',
  closed: '⚫ Closed',
};

export const PRListPage: React.FC = () => {
  const { session } = useAuth();
  const token = session?.access_token;

  const [prs, setPrs] = useState<PR[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 20;

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchPRs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        ...(status !== 'all' && { status }),
        ...(search && { search }),
      });
      const res = await fetch(`${API}/api/prs?${params}`, { headers: authHeaders });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      setPrs(json.data || []);
      setTotal(json.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load pull requests');
    } finally {
      setLoading(false);
    }
  }, [token, status, search, sort, page]);

  useEffect(() => { fetchPRs(); }, [fetchPRs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout title="Pull Requests">
      <div className="pr-list-page">

        {/* ── Toolbar ── */}
        <div className="pr-toolbar">
          {/* Status filter tabs */}
          <div className="status-tabs">
            {['all', 'open', 'merged', 'closed'].map(s => (
              <button
                key={s}
                className={`tab-btn ${status === s ? 'active' : ''}`}
                onClick={() => { setStatus(s); setPage(1); }}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="toolbar-right">
            {/* Search */}
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">🔍</button>
            </form>

            {/* Sort */}
            <select
              className="sort-select"
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* ── Count ── */}
        {!loading && (
          <div className="pr-count">
            {total} pull request{total !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* ── Error ── */}
        {error && <div className="error-banner">{error}</div>}

        {/* ── Loading ── */}
        {loading ? (
          <div className="pr-loading">
            <div className="loading-spinner" />
            <span>Loading pull requests...</span>
          </div>
        ) : prs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No pull requests found</h3>
            {status !== 'all' || search ? (
              <p>Try adjusting your filters.</p>
            ) : (
              <>
                <p>Connect a GitHub repository to start seeing your PRs here.</p>
                <Link to="/dashboard/repos" className="btn-primary">
                  Connect GitHub Repository →
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            {/* ── PR Table ── */}
            <div className="pr-table">
              {prs.map(pr => (
                <Link key={pr.id} to={`/dashboard/prs/${pr.id}`} className="pr-row">
                  <div className="pr-main">
                    <div className="pr-header-row">
                      <span className={`pr-status-badge ${STATUS_COLORS[pr.status]}`}>
                        {STATUS_LABELS[pr.status]}
                      </span>
                      <span className="pr-repo">{pr.repositories?.github_repo_name}</span>
                    </div>
                    <div className="pr-title">
                      <span className="pr-number">#{pr.github_pr_id}</span>
                      {pr.title}
                    </div>
                    <div className="pr-meta">
                      <span>
                        <img
                          src={pr.author_avatar || `https://github.com/${pr.author_name}.png?size=20`}
                          alt={pr.author_name}
                          className="author-avatar"
                          onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                        />
                        {pr.author_name}
                      </span>
                      <span>🌿 {pr.branch_name} → {pr.base_branch}</span>
                      <span>📅 {new Date(pr.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="pr-stats">
                    <span title="Commits">💬 {pr.commits_count}</span>
                    <span title="Files changed">📝 {pr.changed_files_count}</span>
                    <span className="pr-arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
