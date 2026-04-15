import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';
import './SettingsNotificationsPage.css';

const API = import.meta.env.VITE_API_URL;

interface NotificationPreferences {
  email_on_pr_created: boolean;
  email_on_pr_merged: boolean;
  email_on_pr_updated: boolean;
  email_on_task_assigned: boolean;
}

export const SettingsNotificationsPage: React.FC = () => {
  const { session, user } = useAuth();
  const token = session?.access_token;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    email_on_pr_created: true,
    email_on_pr_merged: true,
    email_on_pr_updated: false,
    email_on_task_assigned: true,
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch(`${API}/api/settings/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPrefs({
            email_on_pr_created: json.data.pr_created ?? true,
            email_on_pr_merged: json.data.pr_merged ?? true,
            email_on_pr_updated: json.data.pr_updated ?? true,
            email_on_task_assigned: json.data.task_assigned ?? true,
          });
        }
      } catch (err) {
        console.error('Failed to fetch preferences', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPrefs();
  }, [token]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`${API}/api/settings/notifications`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pr_created: prefs.email_on_pr_created,
          pr_merged: prefs.email_on_pr_merged,
          pr_updated: prefs.email_on_pr_updated,
          task_assigned: prefs.email_on_task_assigned
        })
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Notification preferences saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save preferences', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Notification Settings">
      <div className="settings-page">
        <div className="settings-card">
          <div className="settings-header">
            <h3>Email Notifications</h3>
            <p>Control what emails DevSync sends to <strong>{user?.email}</strong>.</p>
          </div>

          {loading ? (
            <div className="settings-loading">Loading preferences...</div>
          ) : (
            <div className="preferences-list">
              
              <div className="preference-item">
                <div className="preference-info">
                  <h4>New Pull Requests</h4>
                  <p>Get alerted when someone opens a PR in your team's connected repositories.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={prefs.email_on_pr_created} 
                    onChange={() => handleToggle('email_on_pr_created')} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h4>Merged Pull Requests</h4>
                  <p>Get alerted when a PR is merged into the main branch.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={prefs.email_on_pr_merged} 
                    onChange={() => handleToggle('email_on_pr_merged')} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h4>Pull Request Updates</h4>
                  <p>Get alerted when someone pushes new commits to an open PR.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={prefs.email_on_pr_updated} 
                    onChange={() => handleToggle('email_on_pr_updated')} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h4>Task Assignments (Upcoming)</h4>
                  <p>Get alerted when you are assigned a new task in the Kanban board.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={prefs.email_on_task_assigned} 
                    onChange={() => handleToggle('email_on_task_assigned')} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

            </div>
          )}

          <div className="settings-actions">
            {successMsg && <span className="success-msg">{successMsg}</span>}
            <button 
              className="btn-primary" 
              onClick={handleSave} 
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
