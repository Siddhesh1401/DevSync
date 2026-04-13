import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  github_username: string;
  avatar_url?: string;
  updated_at?: string;
}

export const useUserProfile = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile from backend
  const fetchProfile = async () => {
    if (!session?.access_token) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setProfile(data.data.profile || data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile on backend
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.access_token) {
      setError('Not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setProfile(data.data);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile when session changes
  useEffect(() => {
    fetchProfile();
  }, [session?.access_token]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
};
