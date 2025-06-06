'use client';

import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  createAnonymousAccount: () => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id || 'No user');
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'User:', session?.user?.id || 'No user');
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createAnonymousAccount = async () => {
    try {
      console.log('Attempting anonymous sign in...');

      // Create a promise that resolves when the auth state changes
      const authStatePromise = new Promise<User>((resolve, reject) => {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('Anonymous sign in successful:', session.user.id);
            subscription.unsubscribe();
            resolve(session.user);
          } else if (event === 'SIGNED_OUT') {
            subscription.unsubscribe();
            reject(new Error('Anonymous sign in failed'));
          }
        });
      });

      // Start the anonymous sign in
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign in error:', error);
        throw error;
      }

      // Wait for the auth state to actually update and return the user
      const user = await authStatePromise;
      setUser(user);
      return user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    signOut,
    createAnonymousAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
