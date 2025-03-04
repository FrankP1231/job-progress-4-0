
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ isAuthenticated: false });

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('auth_status');
    if (authStatus === 'authenticated') {
      setUser({ isAuthenticated: true });
    }
  }, []);

  const login = (password: string): boolean => {
    // In a real application, this would validate against a server
    // For simplicity, we're using a hardcoded password
    if (password === 'GardnerRoad') {
      setUser({ isAuthenticated: true });
      localStorage.setItem('auth_status', 'authenticated');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser({ isAuthenticated: false });
    localStorage.removeItem('auth_status');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
