
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { KeyRound, Unlock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const success = login(password);
      
      if (success) {
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error('Invalid password');
      }
      
      setIsLoading(false);
    }, 500); // Small delay for UX
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md mx-auto animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Awning & Canopy</h1>
          <p className="text-muted-foreground">Production Management System</p>
        </div>
        
        <Card className="w-full glass-panel border-opacity-20">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              <span>Authentication Required</span>
            </CardTitle>
            <CardDescription className="text-center">
              Please enter your password to access the system
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4" />
                    <span>Sign In</span>
                  </div>
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
