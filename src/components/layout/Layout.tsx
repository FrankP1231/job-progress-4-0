
import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const isAuthenticated = user.isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Navbar />}
      <main className="flex-1 container py-6">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container flex flex-col items-center">
          <img 
            src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
            alt="USA Canvas Logo" 
            className="h-6 mb-2" 
          />
          <div>USA Canvas Job Tracking System &copy; {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
