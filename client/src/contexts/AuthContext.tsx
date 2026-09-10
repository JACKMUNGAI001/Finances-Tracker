import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../services/supabase';

interface User {
  name?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Do not decide which screen to show until Supabase has restored the saved
  // session from this device. Without this, a cold start briefly looks signed
  // out and sends returning users back to the password form.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setSessionUser = (session: { user: { email?: string; user_metadata: { name?: string } } } | null) => {
      setUser(session?.user ? { email: session.user.email ?? '', name: session.user.user_metadata.name } : null);
    };

    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session);
      setIsLoading(false);
    }).catch(() => {
      setUser(null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionUser(session);
      setIsLoading(false);
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    return { needsEmailConfirmation: !!data.user && !data.session };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (name: string, email: string) => {
    const { error } = await supabase.auth.updateUser({
      email,
      data: { name },
    });
    if (error) throw error;
    setUser((prev) => prev ? { ...prev, name, email } : prev);
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, logout, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
