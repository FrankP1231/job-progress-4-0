
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ClipboardList, 
  PlusCircle, 
  LogOut,
  Menu,
  X
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
            <span className="font-bold text-xl">Awning Tracker</span>
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
                <SheetTitle>Awning Tracker</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <SheetClose asChild>
                  <Link to="/dashboard" className="flex items-center py-2">
                    <Home className="mr-2 h-5 w-5" />
                    Dashboard
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/jobs" className="flex items-center py-2">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    All Jobs
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
            <span className="font-bold">Awning Tracker</span>
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
            to="/jobs"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            All Jobs
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
