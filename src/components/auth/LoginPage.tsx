
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LockIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If user is already authenticated, redirect to dashboard
  if (user.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = login(password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid password. Please try again.');
      }
      
      setIsLoading(false);
    }, 500); // Simulate network request
  };

  return (
    <div className="h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4">
        <Card className="w-full">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-full max-w-[200px] mb-4">
              <img 
                src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
                alt="USA Canvas Logo" 
                className="w-full" 
              />
            </div>
            <CardDescription>Enter your password to access the job tracking system</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <LockIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
