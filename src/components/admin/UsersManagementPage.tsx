
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
import { UserRole, WorkArea } from '@/lib/types';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'Installer' as UserRole,
    work_area: 'Installation' as WorkArea,
    password: ''
  });

  // Check if current user is Master Admin
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
        
        const isMasterAdminUser = data.role === 'Master Admin';
        setIsMasterAdmin(isMasterAdminUser);
        
        if (!isMasterAdminUser) {
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
    if (!isMasterAdmin) return;
    
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
  }, [isMasterAdmin]);

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
      
      setIsEditDialogOpen(false);
      toast.success('User updated successfully');
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      // Then update the profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role,
          work_area: newUser.work_area,
          last_modified_by: user.id
        })
        .eq('id', authData.user.id);
        
      if (profileError) throw profileError;
      
      // Fetch the newly created profile
      const { data: newProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Add the new profile to the local state
      setProfiles([...profiles, newProfile]);
      
      // Reset the new user form
      setNewUser({
        email: '',
        first_name: '',
        last_name: '',
        role: 'Installer',
        work_area: 'Installation',
        password: ''
      });
      
      setIsAddDialogOpen(false);
      toast.success('User added successfully');
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user: ' + error.message);
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

  if (!isMasterAdmin) {
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
                View, add, and update user information
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
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
                              setIsEditDialogOpen(true);
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="addEmail">Email *</Label>
              <Input
                id="addEmail"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({
                  ...newUser,
                  email: e.target.value
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addPassword">Password *</Label>
              <Input
                id="addPassword"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({
                  ...newUser,
                  password: e.target.value
                })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addFirstName">First Name *</Label>
                <Input
                  id="addFirstName"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    first_name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addLastName">Last Name *</Label>
                <Input
                  id="addLastName"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    last_name: e.target.value
                  })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addRole">Role</Label>
              <Select 
                value={newUser.role}
                onValueChange={(value: UserRole) => setNewUser({
                  ...newUser,
                  role: value
                })}
              >
                <SelectTrigger id="addRole">
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
              <Label htmlFor="addWorkArea">Work Area</Label>
              <Select 
                value={newUser.work_area}
                onValueChange={(value: WorkArea) => setNewUser({
                  ...newUser,
                  work_area: value
                })}
              >
                <SelectTrigger id="addWorkArea">
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
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddUser}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
