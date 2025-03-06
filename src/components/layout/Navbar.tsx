
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  PlusCircle, 
  LogOut,
  Menu,
  Briefcase,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user.isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
              alt="USA Canvas Logo" 
              className="h-8" 
            />
          </Link>
        </div>
        
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>
                  <img 
                    src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
                    alt="USA Canvas Logo" 
                    className="h-8 mx-auto" 
                  />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <SheetClose asChild>
                  <Link to="/dashboard" className="flex items-center py-2">
                    <Home className="mr-2 h-5 w-5" />
                    Dashboard
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/projects" className="flex items-center py-2">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Projects
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/jobs/new" className="flex items-center py-2">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Job
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start px-2" onClick={handleLogout}>
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/dashboard" className="flex items-center">
            <img 
              src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
              alt="USA Canvas Logo" 
              className="h-6" 
            />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            to="/projects"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Projects
          </Link>
          <Link
            to="/jobs/new"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            New Job
          </Link>
        </nav>
        
        <div className="flex-1 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
