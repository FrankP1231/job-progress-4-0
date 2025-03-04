
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-6 px-4 sm:px-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
