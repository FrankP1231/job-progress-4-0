
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, ClipboardList, BarChart3, Wrench, Truck, Clock, CheckSquare, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getInProgressPhases, getAllJobs } from '@/lib/supabase';
import { useProductionPhases } from '@/hooks/useProductionPhases';

const Index: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect to login if user is not authenticated
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Fetch jobs and phases data
  const { 
    data: jobs = [], 
    isLoading: isLoadingJobs,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: getAllJobs
  });

  const { 
    data: inProgressPhases = [], 
    isLoading: isLoadingPhases,
  } = useQuery({
    queryKey: ['inProgressPhases'],
    queryFn: getInProgressPhases
  });

  // Use the hooks to process the phases data
  const { readyForInstallPhases } = useProductionPhases(jobs);

  // Find phases with upcoming deadlines - phases with installation planned in the next 7 days
  const upcomingDeadlines = inProgressPhases
    .filter(({ phase }) => {
      // Check if this phase has a scheduled installation date
      if (phase.installation && 
          phase.installation.hasOwnProperty('scheduledDate') && 
          phase.installation.scheduledDate && 
          phase.installation.status !== 'complete') {
        try {
          const installDate = new Date(phase.installation.scheduledDate);
          const now = new Date();
          const diffTime = installDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // Return true if installation is scheduled within the next 7 days
          return diffDays >= 0 && diffDays <= 7;
        } catch (error) {
          return false;
        }
      }
      // Also include phases where welding is due soon
      if (phase.weldingLabor && 
          phase.weldingLabor.hasOwnProperty('dueDate') &&
          phase.weldingLabor.dueDate && 
          phase.weldingLabor.status !== 'complete') {
        try {
          const dueDate = new Date(phase.weldingLabor.dueDate);
          const now = new Date();
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        } catch (error) {
          return false;
        }
      }
      return false;
    })
    .sort((a, b) => {
      // Sort by the closest due date first
      const getEarliestDate = (item: any) => {
        let dates = [];
        if (item.phase.installation?.hasOwnProperty('scheduledDate') && item.phase.installation.scheduledDate) {
          dates.push(new Date(item.phase.installation.scheduledDate));
        }
        if (item.phase.weldingLabor?.hasOwnProperty('dueDate') && item.phase.weldingLabor.dueDate) {
          dates.push(new Date(item.phase.weldingLabor.dueDate));
        }
        return dates.length ? Math.min(...dates.map(d => d.getTime())) : Infinity;
      };
      
      return getEarliestDate(a) - getEarliestDate(b);
    })
    .slice(0, 3); // Show at most 3 items

  // Group ready for installation phases by job
  const readyForInstallByJob = readyForInstallPhases.reduce((acc, { job, phase }) => {
    if (!acc[job.id]) {
      acc[job.id] = { 
        job: job, 
        phases: [] 
      };
    }
    acc[job.id].phases.push(phase);
    return acc;
  }, {} as Record<string, { job: any, phases: any[] }>);

  // Convert to array and sort by number of phases ready
  const readyForInstallJobs = Object.values(readyForInstallByJob)
    .sort((a, b) => b.phases.length - a.phases.length)
    .slice(0, 3); // Show at most 3 jobs

  const isLoading = isLoadingJobs || isLoadingPhases;

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
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map(({ job, phase }) => {
                  // Determine what's due and when
                  let dueText = '';
                  let dueDays = 0;
                  
                  if (phase.installation?.hasOwnProperty('scheduledDate') && phase.installation.scheduledDate) {
                    const installDate = new Date(phase.installation.scheduledDate);
                    const now = new Date();
                    dueDays = Math.ceil((installDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    dueText = `Installation due in ${dueDays} day${dueDays !== 1 ? 's' : ''}`;
                  } else if (phase.weldingLabor?.hasOwnProperty('dueDate') && phase.weldingLabor.dueDate) {
                    const dueDate = new Date(phase.weldingLabor.dueDate);
                    const now = new Date();
                    dueDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    dueText = `Welding due in ${dueDays} day${dueDays !== 1 ? 's' : ''}`;
                  }
                  
                  return (
                    <div key={phase.id} className="border-l-2 border-amber-500 pl-4 py-1">
                      <p className="font-medium">{job.projectName} - Phase {phase.phaseNumber}: {phase.phaseName}</p>
                      <p className="text-sm text-muted-foreground">{dueText}</p>
                    </div>
                  );
                })}
                <Link to="/tasks" className="flex justify-end">
                  <Button variant="link" size="sm" className="mt-2">
                    View all tasks
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No upcoming deadlines found</p>
                <Link to="/tasks" className="flex justify-center">
                  <Button variant="link" size="sm" className="mt-2">
                    View all tasks
                  </Button>
                </Link>
              </div>
            )}
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
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : readyForInstallJobs.length > 0 ? (
              <div className="space-y-4">
                {readyForInstallJobs.map(({ job, phases }) => (
                  <div key={job.id} className="border-l-2 border-green-500 pl-4 py-1">
                    <p className="font-medium">{job.projectName}</p>
                    <p className="text-sm text-muted-foreground">
                      {phases.length} phase{phases.length !== 1 ? 's' : ''} ready
                    </p>
                  </div>
                ))}
                <Link to="/production" className="flex justify-end">
                  <Button variant="link" size="sm" className="mt-2">
                    View all ready projects
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No projects ready for installation</p>
                <Link to="/production" className="flex justify-center">
                  <Button variant="link" size="sm" className="mt-2">
                    View all production status
                  </Button>
                </Link>
              </div>
            )}
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
