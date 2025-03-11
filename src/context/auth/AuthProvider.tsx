
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from './types';
import { 
  fetchUserProfile as fetchProfile, 
  loginUser, 
  logoutUser, 
  resetUserPassword,
  MAX_PROFILE_RETRIES
} from './auth-utils';

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  const [profileFetchRetries, setProfileFetchRetries] = useState(0);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false) => {
    await fetchProfile(userId, setUser, profileFetchRetries, setProfileFetchRetries, forceRefresh);
  }, [profileFetchRetries]);

  const refreshUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id, true);
        return;
      }
      console.warn('No active session found when trying to refresh profile');
    } catch (err) {
      console.error('Error in refreshUserProfile:', err);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    return loginUser(email, password, setLoading, setUser, fetchUserProfile);
  };

  const logout = async () => {
    await logoutUser(setLoading, setUser);
  };

  const resetPassword = async (email: string, redirectTo?: string): Promise<boolean> => {
    return resetUserPassword(email, redirectTo);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            isAuthenticated: true,
            id: session.user.id,
            email: session.user.email
          });
          
          await fetchUserProfile(session.user.id);
        } else {
          setUser({ isAuthenticated: false });
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setUser({ isAuthenticated: false });
      } finally {
        setLoading(false);
      }
      
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (session?.user) {
            setUser({
              isAuthenticated: true,
              id: session.user.id,
              email: session.user.email
            });
            
            await fetchUserProfile(session.user.id);
          } else {
            setUser({ isAuthenticated: false });
          }
          setLoading(false);
        }
      );
      
      return () => {
        subscription?.unsubscribe();
      };
    };
    
    initializeAuth();
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refreshUserProfile, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
