
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  work_area: string;
}

const ProfilePage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching profile from ProfilePage, user ID:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Failed to load profile:', error);
          throw error;
        }
        
        if (data) {
          console.log('Profile data loaded:', data);
          setProfile(data);
        } else {
          setError('No profile found. Please contact an administrator.');
        }
      } catch (error: any) {
        console.error('Failed to load profile:', error.message);
        setError(`Failed to load profile: ${error.message}`);
        toast.error('Failed to load profile: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          // Note: role and work_area might require admin privileges to change
        })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      // Refresh the profile in auth context
      await refreshUserProfile();
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRetry = async () => {
    // Clear any error
    setError(null);
    
    // Try to refresh user profile in auth context
    await refreshUserProfile();
    
    // Then refetch the profile
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setProfile(data);
      } else {
        setError('No profile found. Please contact an administrator.');
      }
    } catch (error: any) {
      setError(`Failed to load profile: ${error.message}`);
      toast.error('Failed to load profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            View and update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button 
                onClick={handleRetry} 
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Loading Profile
              </Button>
            </div>
          ) : null}
          
          {profile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name}
                    onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name}
                    onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Role can only be changed by admins</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workArea">Work Area</Label>
                  <Input
                    id="workArea"
                    value={profile.work_area}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Work area can only be changed by admins</p>
                </div>
              </div>
              
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : !error ? (
            <div className="text-center py-4">
              <p>Loading profile information...</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
