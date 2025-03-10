
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
  Wrench,
  CheckSquare,
  User,
  Users
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SearchBar from './SearchBar';
import TimeTracker from '@/components/time-tracking/TimeTracker';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('Logging out...');
    await logout();
    // Navigation is now handled in the logout function itself
  };

  // Check if user is a team lead, admin, or master admin
  const isAdmin = user.role === 'Front Office' || 
                  user.role === 'Lead Welder' || 
                  user.role === 'Lead Installer' || 
                  user.role === 'Master Admin';

  // If not authenticated, show a simplified navbar with login
  if (!user.isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
                alt="USA Canvas Logo" 
                className="h-8" 
              />
            </Link>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </header>
    );
  }

  // Get initials for avatar
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="flex items-center space-x-2">
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
                  <Link to="/tasks" className="flex items-center py-2">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    Tasks
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/jobs/new" className="flex items-center py-2">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Job
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/production" className="flex items-center py-2">
                    <Wrench className="mr-2 h-5 w-5" />
                    Production
                  </Link>
                </SheetClose>
                
                {/* Only show Users menu for admins */}
                {isAdmin && (
                  <SheetClose asChild>
                    <Link to="/admin/users" className="flex items-center py-2">
                      <Users className="mr-2 h-5 w-5" />
                      Manage Users
                    </Link>
                  </SheetClose>
                )}
                
                <SheetClose asChild>
                  <Link to="/profile" className="flex items-center py-2">
                    <User className="mr-2 h-5 w-5" />
                    My Profile
                  </Link>
                </SheetClose>
                
                <SheetClose asChild>
                  <Button 
                    variant="ghost" 
                    className="justify-start px-2" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </SheetClose>

                {/* Time tracker for mobile */}
                <div className="flex items-center justify-center pt-4 mt-4 border-t">
                  <TimeTracker />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center">
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
            to="/tasks"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Tasks
          </Link>
          <Link
            to="/jobs/new"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            New Job
          </Link>
          <Link
            to="/production"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Production
          </Link>
          
          {/* Only show Users menu for admins */}
          {isAdmin && (
            <Link
              to="/admin/users"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Users
            </Link>
          )}
        </nav>
        
        {/* Add the search bar */}
        <div className="flex-1 flex justify-center mx-4">
          <SearchBar className="max-w-md hidden md:flex" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add TimeTracker component */}
          <div className="hidden md:block">
            <TimeTracker />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.firstName && user.lastName ? 
                      `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 
                      user.email?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                {user.role && (
                  <div className="text-xs text-muted-foreground">{user.role}</div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
