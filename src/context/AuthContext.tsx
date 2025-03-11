import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: {
    isAuthenticated: boolean;
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    workArea?: string;
    cellPhoneNumber?: string;
    profilePictureUrl?: string;
  };
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  resetPassword: (email: string, redirectTo?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  const [profileFetchRetries, setProfileFetchRetries] = useState(0);
  const MAX_PROFILE_RETRIES = 3;

  const fetchUserProfile = async (userId: string, forceRefresh = false) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      if (forceRefresh) {
        setProfileFetchRetries(0);
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, work_area, email, cell_phone_number, profile_picture_url')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Error loading user profile information');
        
        setUser(prev => ({
          ...prev,
          isAuthenticated: true,
          id: userId
        }));
        
        return;
      }
      
      if (data) {
        console.log('Profile data received:', data);
        setUser(prev => ({
          ...prev,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role,
          workArea: data.work_area,
          email: data.email || prev.email,
          cellPhoneNumber: data.cell_phone_number,
          profilePictureUrl: data.profile_picture_url,
          isAuthenticated: true,
          id: userId
        }));
        
        setProfileFetchRetries(0);
      } else {
        console.warn('No profile found for user:', userId);
        
        const newRetryCount = profileFetchRetries + 1;
        setProfileFetchRetries(newRetryCount);
        
        setUser(prev => ({
          ...prev,
          isAuthenticated: true,
          id: userId
        }));
        
        if (newRetryCount < MAX_PROFILE_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, newRetryCount), 10000);
          console.log(`Retrying profile fetch after ${delay}ms (attempt ${newRetryCount+1}/${MAX_PROFILE_RETRIES})...`);
          setTimeout(() => {
            fetchUserProfile(userId);
          }, delay);
        } else {
          console.warn(`Maximum profile fetch retries (${MAX_PROFILE_RETRIES}) reached. User may have limited profile data.`);
          toast.warning('Could not load all profile data. Some features may be limited.');
        }
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setUser(prev => ({
        ...prev,
        isAuthenticated: true,
        id: userId
      }));
    }
  };

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

  const resetPassword = async (email: string, redirectTo?: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/profile`,
      });
      
      if (error) {
        console.error('Reset password error:', error.message);
        toast.error(error.message || 'Failed to send reset password email');
        return false;
      }
      
      toast.success('Password reset instructions sent to your email');
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset password email');
      return false;
    }
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
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        toast.error(error.message || 'Failed to login');
        setLoading(false);
        return false;
      }
      
      toast.success('Logged in successfully');
      
      if (data.user) {
        setUser({
          isAuthenticated: true,
          id: data.user.id,
          email: data.user.email
        });
        
        await fetchUserProfile(data.user.id);
      }
      
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Failed to login');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Failed to log out: ' + error.message);
        setLoading(false);
        return;
      }
      
      setUser({ isAuthenticated: false });
      setLoading(false);
      
      toast.success('Logged out successfully');
      
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      setLoading(false);
    }
  };

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
