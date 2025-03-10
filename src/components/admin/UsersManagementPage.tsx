
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Search, UserPlus } from 'lucide-react';

// Define type for user roles
type UserRole = 'Sewer' | 'Lead Welder' | 'Welder' | 'Welder\'s Helper' | 'Lead Installer' | 'Installer\'s Helper' | 'Installer' | 'Front Office' | 'Master Admin';

// Define type for work areas
type WorkArea = 'Sewing' | 'Welding' | 'Installation' | 'Front Office';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  work_area: WorkArea;
}

const roles: UserRole[] = [
  'Sewer', 
  'Lead Welder', 
  'Welder', 
  'Welder\'s Helper', 
  'Lead Installer', 
  'Installer\'s Helper', 
  'Installer', 
  'Front Office',
  'Master Admin'
];

const workAreas: WorkArea[] = [
  'Sewing',
  'Welding',
  'Installation',
  'Front Office'
];

const UsersManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user.isAuthenticated || !user.id) {
        navigate('/login');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        const isUserAdmin = ['Front Office', 'Lead Welder', 'Lead Installer', 'Master Admin'].includes(data.role);
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          toast.error('You do not have permission to access this page');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };
    
    checkAdminStatus();
  }, [user, navigate]);

  // Fetch all profiles
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('last_name', { ascending: true });
          
        if (error) throw error;
        setProfiles(data || []);
      } catch (error: any) {
        toast.error('Failed to load users: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfiles();
  }, [isAdmin]);

  const handleUpdateProfile = async () => {
    if (!selectedProfile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: selectedProfile.first_name,
          last_name: selectedProfile.last_name,
          role: selectedProfile.role,
          work_area: selectedProfile.work_area,
          last_modified_by: user.id
        })
        .eq('id', selectedProfile.id);
        
      if (error) throw error;
      
      // Update the profile in the local state
      setProfiles(profiles.map(p => 
        p.id === selectedProfile.id ? selectedProfile : p
      ));
      
      setIsDialogOpen(false);
      toast.success('User updated successfully');
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchString = searchTerm.toLowerCase();
    return (
      profile.first_name.toLowerCase().includes(searchString) ||
      profile.last_name.toLowerCase().includes(searchString) ||
      profile.email?.toLowerCase().includes(searchString) ||
      profile.role.toLowerCase().includes(searchString) ||
      profile.work_area.toLowerCase().includes(searchString)
    );
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                View and update user information
              </CardDescription>
            </div>
            <Button variant="outline" disabled>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filter */}
          <div className="flex mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Users table */}
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Work Area</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No users found matching your search' : 'No users found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.role}</TableCell>
                        <TableCell>{profile.work_area}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProfile(profile);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user profile details
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={selectedProfile.first_name}
                    onChange={(e) => setSelectedProfile({
                      ...selectedProfile,
                      first_name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={selectedProfile.last_name}
                    onChange={(e) => setSelectedProfile({
                      ...selectedProfile,
                      last_name: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select 
                  value={selectedProfile.role}
                  onValueChange={(value: UserRole) => setSelectedProfile({
                    ...selectedProfile,
                    role: value
                  })}
                >
                  <SelectTrigger id="editRole">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editWorkArea">Work Area</Label>
                <Select 
                  value={selectedProfile.work_area}
                  onValueChange={(value: WorkArea) => setSelectedProfile({
                    ...selectedProfile,
                    work_area: value
                  })}
                >
                  <SelectTrigger id="editWorkArea">
                    <SelectValue placeholder="Select work area" />
                  </SelectTrigger>
                  <SelectContent>
                    {workAreas.map(area => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
