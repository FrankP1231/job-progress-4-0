
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, ClipboardList, BarChart3, Wrench, Truck, Clock, CheckSquare } from 'lucide-react';

const Index: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect to login if user is not authenticated
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navigationCards = [
    {
      title: "Dashboard",
      description: "View an overview of all jobs and phases in progress",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      path: "/dashboard",
      color: "bg-primary/10"
    },
    {
      title: "Tasks",
      description: "View and manage all tasks across projects",
      icon: <CheckSquare className="h-8 w-8 text-amber-500" />,
      path: "/tasks",
      color: "bg-amber-500/10"
    },
    {
      title: "Projects",
      description: "Browse and search all projects",
      icon: <ClipboardList className="h-8 w-8 text-indigo-500" />,
      path: "/projects",
      color: "bg-indigo-500/10"
    },
    {
      title: "Production",
      description: "View production status and workload",
      icon: <Wrench className="h-8 w-8 text-green-500" />,
      path: "/production",
      color: "bg-green-500/10"
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <img 
          src="/lovable-uploads/f153bcda-a503-407d-8c91-07659a793378.png" 
          alt="USA Canvas Logo" 
          className="h-16 mx-auto mb-4" 
        />
        <h1 className="text-3xl font-bold tracking-tight">USA Canvas Job Tracking System</h1>
        <p className="text-xl text-muted-foreground">Track projects, manage tasks, and improve workflow efficiency</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {navigationCards.map((card) => (
          <Link to={card.path} key={card.title} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className={`rounded-t-lg ${card.color} flex flex-col items-center justify-center pt-6`}>
                {card.icon}
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="text-center mb-2">{card.title}</CardTitle>
                <CardDescription className="text-center">{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-amber-500 pl-4 py-1">
                <p className="font-medium">Blackbear South Lake - Phase 1</p>
                <p className="text-sm text-muted-foreground">Installation due in 3 days</p>
              </div>
              <div className="border-l-2 border-amber-500 pl-4 py-1">
                <p className="font-medium">Nelson Restaurant - Canopy</p>
                <p className="text-sm text-muted-foreground">Welding due in 5 days</p>
              </div>
              <Link to="/tasks" className="flex justify-end">
                <Button variant="link" size="sm" className="mt-2">
                  View all tasks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-500" />
              <span>Ready for Installation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-2 border-green-500 pl-4 py-1">
                <p className="font-medium">Mountain View Hotel - Cabana Covers</p>
                <p className="text-sm text-muted-foreground">4 phases ready</p>
              </div>
              <div className="border-l-2 border-green-500 pl-4 py-1">
                <p className="font-medium">Lakeshore Apartments - Balcony Shades</p>
                <p className="text-sm text-muted-foreground">2 phases ready</p>
              </div>
              <Link to="/production" className="flex justify-end">
                <Button variant="link" size="sm" className="mt-2">
                  View all ready projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button asChild size="lg" className="px-8">
          <Link to="/jobs/new">Create New Project</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
