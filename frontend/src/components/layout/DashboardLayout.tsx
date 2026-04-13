import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">DevSync</h1>
          <button 
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </Link>
          <Link to="/dashboard/prs" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📋</span>
            <span className="nav-label">Pull Requests</span>
          </Link>
          <Link to="/dashboard/tasks" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">✓</span>
            <span className="nav-label">Tasks</span>
          </Link>
          <Link to="/dashboard/activity" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Activity</span>
          </Link>
          <Link to="/dashboard/team" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">Team</span>
          </Link>
          <Link to="/profile" className="nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            {title && <h2 className="page-title">{title}</h2>}
          </div>

          <div className="header-right">
            <div className="user-menu">
              <button 
                className="user-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <span className="user-avatar">{user?.email?.[0]?.toUpperCase()}</span>
                <span className="user-email">{user?.email}</span>
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    Profile Settings
                  </Link>
                  <button 
                    className="dropdown-item logout-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};
