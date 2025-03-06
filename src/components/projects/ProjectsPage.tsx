
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllJobs } from '@/lib/supabase/jobUtils';

const ProjectsPage = () => {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['all-jobs'],
    queryFn: getAllJobs,
  });

  // Filter jobs that have at least one phase in progress (not complete)
  const activeJobs = jobs?.filter(job => 
    job.phases?.some(phase => !phase.isComplete)
  ) || [];

  console.log('All jobs:', jobs);
  console.log('Active jobs:', activeJobs);

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
            
            return (
              <Card key={job.id} className="overflow-hidden">
                <CardHeader className="bg-accent/20 pb-4">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Job #{job.jobNumber}</span>
                    <Badge variant="outline">{completionPercentage}% Complete</Badge>
                  </CardTitle>
                  <CardDescription className="text-base mt-1">{job.projectName}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Active Phases:</h3>
                  <ul className="space-y-2">
                    {inProgressPhases.slice(0, 3).map(phase => (
                      <li key={phase.id} className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Phase {phase.phaseNumber}: {phase.phaseName}
                        </span>
                      </li>
                    ))}
                    {inProgressPhases.length > 3 && (
                      <li className="text-sm text-muted-foreground">
                        +{inProgressPhases.length - 3} more phases in progress
                      </li>
                    )}
                  </ul>
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
