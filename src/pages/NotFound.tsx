
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const NotFound: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Button asChild>
        <Link to={user.isAuthenticated ? "/dashboard" : "/"}>
          Go {user.isAuthenticated ? "to Dashboard" : "Home"}
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
