import React, { createContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasPlaceholderSupabaseConfig =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project-id') ||
  supabaseAnonKey.includes('your_supabase_anon_key_here');

const isMockAuthEnabled = hasPlaceholderSupabaseConfig && import.meta.env.DEV;

const supabaseConfigErrorMessage =
  'Supabase is not configured. Update frontend/.env.local with real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart Vite.';

const ensureSupabaseConfigured = () => {
  if (hasPlaceholderSupabaseConfig && !isMockAuthEnabled) {
    throw new Error(supabaseConfigErrorMessage);
  }
};

const createMockUser = (email = 'dev@local.test'): User => {
  return {
    id: 'dev-local-user',
    aud: 'authenticated',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { name: 'Local Dev User' },
    email,
    created_at: new Date().toISOString(),
  } as User;
};

const normalizeAuthError = (error: unknown): Error => {
  if (error instanceof Error && error.message === 'Failed to fetch') {
    return new Error(supabaseConfigErrorMessage);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error('Authentication failed. Please try again.');
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMockAuth: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isMockAuthEnabled) {
          setSession(null);
          setUser(createMockUser());
          return;
        }

        ensureSupabaseConfigured();
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    if (isMockAuthEnabled) {
      setIsLoading(false);
      return;
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      if (isMockAuthEnabled) {
        setSession(null);
        setUser(createMockUser(email));
        return;
      }

      ensureSupabaseConfigured();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });
      if (error) throw error;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isMockAuthEnabled) {
        setSession(null);
        setUser(createMockUser(email));
        return;
      }

      ensureSupabaseConfigured();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  };

  const signInWithGitHub = async () => {
    try {
      if (isMockAuthEnabled) {
        setSession(null);
        setUser(createMockUser());
        return;
      }

      ensureSupabaseConfigured();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  };

  const signOut = async () => {
    if (isMockAuthEnabled) {
      setSession(null);
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    try {
      if (isMockAuthEnabled) {
        return;
      }

      ensureSupabaseConfigured();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    isAuthenticated: !!user,
    isMockAuth: isMockAuthEnabled,
    signUp,
    signIn,
    signInWithGitHub,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
