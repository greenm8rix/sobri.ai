import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, supabase } from '../utils/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  hasPaid: boolean;
  chatSyncEnabled: boolean;
  chatCount: number;
  refreshUserStatus: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  loading: true,
  hasPaid: false,
  chatSyncEnabled: false,
  chatCount: 0,
  refreshUserStatus: async () => {},
});

// Hook for using auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [chatSyncEnabled, setChatSyncEnabled] = useState(false);
  const [chatCount, setChatCount] = useState(0);

  // Upsert user in Supabase users table
  const upsertUser = async (userObj: User) => {
    if (!userObj) return;
    const { id, email } = userObj;
    if (!id || !email) return;
    const { error } = await supabase
      .from('users')
      .upsert([{ id, email }], { onConflict: 'id' });
    if (error) console.error('Error upserting user:', error);
  };

  // Fetch user status (has_paid, chat_sync_enabled, chat_count)
  const fetchUserStatus = async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('has_paid, chat_sync_enabled, chat_count')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching user status:', error);
      setHasPaid(false);
      setChatSyncEnabled(false);
      setChatCount(0);
      return;
    }
    setHasPaid(!!data.has_paid);
    setChatSyncEnabled(!!data.chat_sync_enabled);
    setChatCount(data.chat_count || 0);
  };

  // Refresh user status (exposed for Stripe integration)
  const refreshUserStatus = async () => {
    if (user?.id) {
      await fetchUserStatus(user.id);
    }
  };

  useEffect(() => {
    // Get session from supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        upsertUser(session.user);
        fetchUserStatus(session.user.id);
      }
    });

    // Set up the listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        upsertUser(session.user);
        fetchUserStatus(session.user.id);
      } else {
        setHasPaid(false);
        setChatSyncEnabled(false);
      }
    });

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    signInWithGoogle,
    signOut,
    loading,
    hasPaid,
    chatSyncEnabled,
    chatCount,
    refreshUserStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};