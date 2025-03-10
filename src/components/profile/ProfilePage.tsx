
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, Upload, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  work_area: string;
  cell_phone_number?: string;
  profile_picture_url?: string;
}

const ProfilePage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
        
        // Use a simpler query to avoid triggering RLS recursion issues
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role, work_area, cell_phone_number, profile_picture_url')
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
          cell_phone_number: profile.cell_phone_number
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
  
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload the file to Supabase Storage
      const fileName = `${user.id}_${Date.now()}_${file.name}`;
      
      // Check if the bucket exists, create it if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const profileBucket = buckets?.find(bucket => bucket.name === 'profile-pictures');
      
      if (!profileBucket) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('profile-pictures', {
          public: true,
        });
      }
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
        
      const publicUrl = publicUrlData.publicUrl;
      
      // Update the profile with the new picture URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: publicUrl
        })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile({
        ...profile,
        profile_picture_url: publicUrl
      });
      
      // Refresh the profile in auth context
      await refreshUserProfile();
      
      toast.success('Profile picture uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture: ' + error.message);
    } finally {
      setIsUploading(false);
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
        .select('id, first_name, last_name, email, role, work_area')
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
            <div className="space-y-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center sm:flex-row sm:space-x-6">
                <div className="mb-4 sm:mb-0">
                  <Avatar className="h-24 w-24">
                    {profile.profile_picture_url ? (
                      <AvatarImage src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} />
                    ) : (
                      <AvatarFallback className="bg-primary text-xl">
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1">
                  <Label htmlFor="profilePicture" className="block text-gray-700 mb-2">
                    Profile Picture
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    {isUploading && (
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload an image (max 5MB)
                  </p>
                </div>
              </div>

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
                
                <div className="space-y-2">
                  <Label htmlFor="cellPhone">Cell Phone Number</Label>
                  <Input
                    id="cellPhone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    value={profile.cell_phone_number || ''}
                    onChange={(e) => setProfile({...profile, cell_phone_number: e.target.value})}
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
            </div>
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
