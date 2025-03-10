
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge, Edit, Key, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';

const BadgeProfilePage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  // Profile data states
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    workArea: '',
    cellPhoneNumber: '',
    profilePictureUrl: ''
  });
  
  // Fetch profile data
  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role, work_area, cell_phone_number, profile_picture_url')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Failed to load profile:', error);
          toast.error('Failed to load profile: ' + error.message);
          return;
        }
        
        if (data) {
          setProfileData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            role: data.role || '',
            workArea: data.work_area || '',
            cellPhoneNumber: data.cell_phone_number || '',
            profilePictureUrl: data.profile_picture_url || ''
          });
          setResetEmail(data.email || '');
        } else {
          toast.error('No profile found. Please contact an administrator.');
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);
  
  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setIsEditMode(false);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          cell_phone_number: profileData.cellPhoneNumber
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh the profile in auth context
      await refreshUserProfile();
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    }
  };
  
  // Handle profile picture upload
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      console.log('Uploading profile picture...');
      
      // Generate unique filename
      const fileName = `${user.id}_${Date.now()}_${file.name}`;
      
      // Upload file directly to the profile-pictures bucket we just created
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload profile picture: ' + error.message);
        setIsUploading(false);
        return;
      }
      
      console.log('File uploaded successfully:', data);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
        
      const publicUrl = publicUrlData.publicUrl;
      console.log('Public URL:', publicUrl);
      
      // Update profile with new picture URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: publicUrl
        })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        toast.error('Failed to update profile with picture: ' + updateError.message);
        setIsUploading(false);
        return;
      }
      
      // Update local state (safely, to prevent rendering issues)
      setProfileData(prevData => ({
        ...prevData,
        profilePictureUrl: publicUrl
      }));
      
      // Refresh the profile in auth context
      try {
        await refreshUserProfile();
      } catch (refreshError) {
        console.error('Error refreshing profile:', refreshError);
        // Continue execution even if refresh fails
      }
      
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle password reset
  const handleResetPassword = async () => {
    try {
      setIsSendingReset(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/profile`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset link sent to your email');
      setIsResetPasswordOpen(false);
    } catch (error: any) {
      console.error('Error sending reset password:', error);
      toast.error('Failed to send reset password email: ' + error.message);
    } finally {
      setIsSendingReset(false);
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
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col items-center">
        {/* Badge-like card */}
        <Card className="w-full max-w-xl overflow-hidden bg-white shadow-lg border-2 border-[#E5DEFF]">
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] h-20 relative flex items-center justify-center">
            <div className="absolute -bottom-16 w-32 h-32 border-4 border-white rounded-full overflow-hidden bg-white shadow-lg">
              {profileData.profilePictureUrl ? (
                <Avatar className="w-full h-full">
                  <AvatarImage 
                    src={profileData.profilePictureUrl} 
                    alt="Profile picture" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      // If image fails to load, show fallback
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="w-full h-full text-3xl font-bold text-[#8B5CF6] bg-[#E5DEFF]">
                    {profileData.firstName?.[0] || ''}{profileData.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#E5DEFF] text-3xl font-bold text-[#8B5CF6]">
                  {profileData.firstName?.[0] || ''}{profileData.lastName?.[0] || ''}
                </div>
              )}
              {isEditMode && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer">
                  {isUploading ? (
                    <div className="text-white">Uploading...</div>
                  ) : (
                    <span className="text-white text-sm font-medium">Change</span>
                  )}
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>
          
          <CardContent className="pt-20 pb-4 px-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? (
                  <div className="flex gap-2 mb-2">
                    <Input 
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      placeholder="First Name"
                      className="text-center"
                    />
                    <Input 
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      placeholder="Last Name"
                      className="text-center"
                    />
                  </div>
                ) : (
                  `${profileData.firstName} ${profileData.lastName}`
                )}
              </h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E5DEFF] text-[#8B5CF6]">
                {profileData.role}
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F6F6F7]">
                <User className="h-5 w-5 text-[#8B5CF6]" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Work Area</p>
                  <p className="font-medium">{profileData.workArea}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F6F6F7]">
                <Badge className="h-5 w-5 text-[#8B5CF6]" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  {isEditMode ? (
                    <Input 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Email"
                      className="h-8 mt-1"
                    />
                  ) : (
                    <p className="font-medium">{profileData.email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F6F6F7]">
                <Badge className="h-5 w-5 text-[#8B5CF6]" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  {isEditMode ? (
                    <Input 
                      value={profileData.cellPhoneNumber}
                      onChange={(e) => setProfileData({...profileData, cellPhoneNumber: e.target.value})}
                      placeholder="Phone Number"
                      className="h-8 mt-1"
                    />
                  ) : (
                    <p className="font-medium">{profileData.cellPhoneNumber || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between px-6 pb-6 pt-0">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)}
                  className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#E5DEFF] hover:text-[#8B5CF6]">
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}
                  className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsResetPasswordOpen(true)}
                  className="gap-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#E5DEFF] hover:text-[#8B5CF6]"
                >
                  <Key className="h-4 w-4" /> Reset Password
                </Button>
                <Button 
                  onClick={() => setIsEditMode(true)}
                  className="gap-2 bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                >
                  <Edit className="h-4 w-4" /> Edit Profile
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Password Reset Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              We'll send a password reset link to your email address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}
              className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#E5DEFF] hover:text-[#8B5CF6]">
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={isSendingReset || !resetEmail}
              className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            >
              {isSendingReset ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BadgeProfilePage;
