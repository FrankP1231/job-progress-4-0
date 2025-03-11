
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser } from './types';

// Max retries for profile fetching
export const MAX_PROFILE_RETRIES = 3;

export async function fetchUserProfile(
  userId: string, 
  setUser: (user: AuthUser | ((prev: AuthUser) => AuthUser)) => void,
  profileFetchRetries: number,
  setProfileFetchRetries: (count: number) => void,
  forceRefresh = false
): Promise<void> {
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
          fetchUserProfile(userId, setUser, newRetryCount, setProfileFetchRetries);
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
}

export async function loginUser(
  email: string, 
  password: string, 
  setLoading: (loading: boolean) => void,
  setUser: (user: AuthUser) => void,
  fetchUserProfile: (userId: string, forceRefresh?: boolean) => Promise<void>
): Promise<boolean> {
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
}

export async function logoutUser(
  setLoading: (loading: boolean) => void,
  setUser: (user: AuthUser) => void
): Promise<void> {
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
}

export async function resetUserPassword(
  email: string, 
  redirectTo?: string
): Promise<boolean> {
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
}
