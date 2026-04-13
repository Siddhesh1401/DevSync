import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { supabase } from '../lib/supabase';
import './ProfilePage.css';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  github_username: string;
}

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    github_username: '',
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            github_username: data.github_username || '',
          });
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: formData.full_name,
          github_username: formData.github_username,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess('Password changed successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Profile Settings">
        <div className="profile-loading">Loading profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile Settings">
      <div className="profile-page">
        <div className="profile-container">
          {/* Account Section */}
          <div className="profile-card">
            <h2 className="card-title">Account Information</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {!isEditing ? (
              <div className="profile-view">
                <div className="profile-item">
                  <label>Email Address</label>
                  <p>{user?.email}</p>
                  <small>This is the email associated with your account</small>
                </div>

                <div className="profile-item">
                  <label>Full Name</label>
                  <p>{profile?.full_name || 'Not set'}</p>
                </div>

                <div className="profile-item">
                  <label>GitHub Username</label>
                  <p>{profile?.github_username || 'Not connected'}</p>
                </div>

                <button 
                  className="btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="github_username">GitHub Username</label>
                  <input
                    id="github_username"
                    name="github_username"
                    type="text"
                    value={formData.github_username}
                    onChange={handleInputChange}
                    placeholder="your-github-handle"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit"
                    className="btn-save"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: profile?.full_name || '',
                        github_username: profile?.github_username || '',
                      });
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security Section */}
          <div className="profile-card">
            <h2 className="card-title">Security</h2>
            
            <div className="security-section">
              <h3>Password</h3>
              <p>Manage your password and security preferences</p>
              <button 
                className="btn-change-password"
                onClick={handleChangePassword}
                disabled={isSaving}
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Session Section */}
          <div className="profile-card">
            <h2 className="card-title">Session</h2>
            
            <div className="session-section">
              <p>
                You are logged in as <strong>{user?.email}</strong>
              </p>
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Notification Preferences (Placeholder for Phase 4) */}
          <div className="profile-card disabled">
            <h2 className="card-title">Notification Preferences</h2>
            <p className="placeholder-text">🔄 Coming soon in Phase 4</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
