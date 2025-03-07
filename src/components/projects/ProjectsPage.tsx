
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Clock, Users, CheckCircle, CircleAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllJobs } from '@/lib/supabase/jobUtils';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';

const ProjectsPage = () => {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['all-jobs'],
    queryFn: getAllJobs,
  });

  // Filter jobs that have at least one phase in progress (not complete)
  const activeJobs = jobs?.filter(job => 
    job.phases?.some(phase => !phase.isComplete)
  ) || [];

  // Get all tasks from all phases for a job
  const getJobTasks = (jobId: string): Task[] => {
    const job = jobs?.find(j => j.id === jobId);
    if (!job) return [];

    const allTasks: Task[] = [];
    
    job.phases.forEach(phase => {
      // Collect tasks from different areas
      if (phase.weldingLabor.tasks) {
        allTasks.push(...phase.weldingLabor.tasks);
      }
      if (phase.sewingLabor.tasks) {
        allTasks.push(...phase.sewingLabor.tasks);
      }
      if (phase.installation.tasks) {
        allTasks.push(...phase.installation.tasks);
      }
      if (phase.weldingMaterials.tasks) {
        allTasks.push(...phase.weldingMaterials.tasks);
      }
      if (phase.sewingMaterials.tasks) {
        allTasks.push(...phase.sewingMaterials.tasks);
      }
      if (phase.powderCoat.tasks) {
        allTasks.push(...phase.powderCoat.tasks);
      }
    });
    
    return allTasks;
  };

  // Get recent incomplete tasks
  const getRecentTasks = (jobId: string): Task[] => {
    const allTasks = getJobTasks(jobId);
    return allTasks
      .filter(task => !task.isComplete)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          Projects
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted/40 h-24" />
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded mb-3 w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          Projects
        </h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading projects: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCompletionPercentage = (job) => {
    if (!job.phases || !job.phases.length) return 0;
    const completedPhases = job.phases.filter(phase => phase.isComplete).length;
    return Math.round((completedPhases / job.phases.length) * 100);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Briefcase className="h-6 w-6" />
        Projects
      </h1>

      {activeJobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No active projects found. All phases are complete or no jobs have been created.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeJobs.map(job => {
            const inProgressPhases = job.phases?.filter(phase => !phase.isComplete) || [];
            const completionPercentage = getCompletionPercentage(job);
            const recentTasks = getRecentTasks(job.id);
            
            return (
              <Card key={job.id} className="overflow-hidden">
                <CardHeader className="bg-accent/20 pb-4">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Job #{job.jobNumber}</span>
                    <Badge variant="outline">{completionPercentage}% Complete</Badge>
                  </CardTitle>
                  <CardDescription className="text-base mt-1">{job.projectName}</CardDescription>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Customer: {job.buyer}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 pb-2">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-1">
                    <CircleAlert className="h-4 w-4 text-muted-foreground" />
                    <span>Pending Tasks:</span>
                  </h3>
                  {recentTasks.length > 0 ? (
                    <div className="space-y-2">
                      {recentTasks.map((task) => (
                        <TaskCard 
                          key={task.id} 
                          task={task}
                        />
                      ))}
                      {getJobTasks(job.id).filter(t => !t.isComplete).length > 3 && (
                        <div className="text-sm text-muted-foreground text-center pt-1">
                          +{getJobTasks(job.id).filter(t => !t.isComplete).length - 3} more tasks
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No pending tasks
                    </div>
                  )}
                  
                  {inProgressPhases.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Active Phases:</span>
                      </h3>
                      <ul className="space-y-2">
                        {inProgressPhases.slice(0, 2).map(phase => (
                          <li key={phase.id} className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Phase {phase.phaseNumber}: {phase.phaseName}
                            </span>
                          </li>
                        ))}
                        {inProgressPhases.length > 2 && (
                          <li className="text-sm text-muted-foreground">
                            +{inProgressPhases.length - 2} more phases in progress
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end border-t bg-muted/20 py-3">
                  <Button variant="ghost" asChild size="sm">
                    <Link to={`/jobs/${job.id}`} className="flex items-center gap-1">
                      View Details
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
