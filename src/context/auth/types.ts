
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  isAuthenticated: boolean;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  workArea?: string;
  cellPhoneNumber?: string;
  profilePictureUrl?: string;
}

export interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  resetPassword: (email: string, redirectTo?: string) => Promise<boolean>;
}
