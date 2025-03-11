
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings } from 'lucide-react';
import { toast } from 'sonner';

const AdministrationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if current user is an admin
  React.useEffect(() => {
    if (!user.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const isAdmin = user.role === 'Front Office' || 
                    user.role === 'Lead Welder' || 
                    user.role === 'Lead Installer' || 
                    user.role === 'Master Admin';
    
    if (!isAdmin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground">Manage system settings and users</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Management Card */}
        <Card className="hover:shadow-md transition-shadow">
          <Link to="/admin/users" className="block h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, edit, and manage user profiles and system access roles.
              </p>
            </CardContent>
          </Link>
        </Card>
        
        {/* More admin sections can be added here in the future */}
      </div>
    </div>
  );
};

export default AdministrationPage;
