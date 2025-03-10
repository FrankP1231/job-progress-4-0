
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Briefcase, User as UserIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole, WorkArea } from '@/lib/types';

const AuthPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workArea, setWorkArea] = useState<WorkArea | ''>('');
  const [role, setRole] = useState<UserRole | ''>('');
  
  // Signup confirmation state
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  // If user is already authenticated, redirect to home
  if (user.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await login(email, password);
      
      if (success) {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName || !workArea || !role) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            work_area: workArea,
            role: role
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Set signup success state instead of just showing a toast
      setSignupSuccess(true);
      
      // Reset form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setWorkArea('');
      setRole('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  // Get available roles based on selected work area
  const getAvailableRoles = () => {
    switch (workArea) {
      case 'Welding':
        return [
          { value: 'Lead Welder', label: 'Lead Welder' },
          { value: 'Welder', label: 'Welder' },
          { value: 'Welder\'s Helper', label: 'Welder\'s Helper' }
        ];
      case 'Sewing':
        return [
          { value: 'Sewer', label: 'Sewer' }
        ];
      case 'Installation':
        return [
          { value: 'Lead Installer', label: 'Lead Installer' },
          { value: 'Installer', label: 'Installer' },
          { value: 'Installer\'s Helper', label: 'Installer\'s Helper' }
        ];
      case 'Front Office':
        return [
          { value: 'Front Office', label: 'Front Office' }
        ];
      default:
        return [];
    }
  };
  
  // Render signup success message
  const renderSignupSuccess = () => {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Account Created Successfully!</h2>
        <Alert className="mb-6 bg-green-50 border-green-100">
          <AlertDescription>
            Please check your email inbox to confirm your account. 
            You'll need to click the confirmation link before you can log in.
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-4">
          <Button onClick={() => setSignupSuccess(false)} variant="outline">
            Back to Sign Up
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
              alt="USA Canvas Logo" 
              className="h-12" 
            />
          </div>
          <CardTitle className="text-2xl">USA Canvas Job Tracking</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            {signupSuccess ? (
              renderSignupSuccess()
            ) : (
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center" htmlFor="workArea">
                      <Briefcase className="h-4 w-4 mr-2" /> Work Area
                    </Label>
                    <Select 
                      value={workArea} 
                      onValueChange={(value) => {
                        setWorkArea(value as WorkArea);
                        setRole(''); // Reset role when work area changes
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your work area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Welding">Welding</SelectItem>
                        <SelectItem value="Sewing">Sewing</SelectItem>
                        <SelectItem value="Installation">Installation</SelectItem>
                        <SelectItem value="Front Office">Front Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center" htmlFor="role">
                      <UserIcon className="h-4 w-4 mr-2" /> Role
                    </Label>
                    <Select 
                      value={role} 
                      onValueChange={(value) => setRole(value as UserRole)}
                      disabled={!workArea}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={workArea ? "Select your role" : "Select work area first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableRoles().map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!workArea && (
                      <p className="text-sm text-muted-foreground">
                        Please select a work area first
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || !workArea || !role}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
