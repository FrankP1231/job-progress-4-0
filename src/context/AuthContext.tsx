
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: {
    isAuthenticated: boolean;
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    workArea?: string;
  };
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile after authentication
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Error loading user profile information');
        return;
      }
      
      if (data) {
        setUser(prev => ({
          ...prev,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role,
          workArea: data.work_area
        }));
      } else {
        console.warn('No profile found for user:', userId);
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    }
  };

  // Set up the auth state listener
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser({
          isAuthenticated: true,
          id: session.user.id,
          email: session.user.email
        });
        
        // Fetch additional user profile data
        await fetchUserProfile(session.user.id);
      } else {
        setUser({ isAuthenticated: false });
      }
      
      setLoading(false);
      
      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setUser({
              isAuthenticated: true,
              id: session.user.id,
              email: session.user.email
            });
            
            // Fetch additional user profile data
            await fetchUserProfile(session.user.id);
          } else {
            setUser({ isAuthenticated: false });
          }
          setLoading(false);
        }
      );
      
      // Clean up subscription
      return () => {
        subscription?.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
