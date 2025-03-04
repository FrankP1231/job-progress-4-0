
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Plus, LayoutDashboard, Settings, Package } from 'lucide-react';

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-white bg-opacity-80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl text-primary">Awning & Canopy</span>
          </Link>
        </div>
        
        <nav className="flex-1 hidden md:flex items-center justify-center">
          <ul className="flex space-x-1">
            <li>
              <Button variant="ghost" asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild>
                <Link to="/jobs" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>Jobs</span>
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild>
                <Link to="/jobs/new" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>New Job</span>
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
