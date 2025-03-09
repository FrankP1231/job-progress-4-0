
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role check is required
  if (requiredRole && user.role) {
    if (!requiredRole.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and role check passes, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
