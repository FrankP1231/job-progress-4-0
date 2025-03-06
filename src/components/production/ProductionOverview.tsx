
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAllJobs } from '@/lib/supabase/jobUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Wrench, Scissors, ArrowRight } from 'lucide-react';
import { Job, Phase } from '@/lib/types';

const ProductionOverview: React.FC = () => {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: getAllJobs
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
    </div>;
  }

  if (error) {
    console.error('Error fetching jobs:', error);
    return <div className="text-red-500">Error loading jobs</div>;
  }

  // Filter jobs that have phases with welding or sewing labor
  const productionJobs = jobs?.filter(job => 
    job.phases.some(phase => 
      phase.weldingLabor.status !== 'not-needed' || 
      phase.sewingLabor.status !== 'not-needed'
    )
  ) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Overview</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs with Production Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {productionJobs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No jobs with production tasks found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Welding Phases</TableHead>
                  <TableHead>Sewing Phases</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionJobs.map(job => {
                  const weldingCount = job.phases.filter(phase => phase.weldingLabor.status !== 'not-needed').length;
                  const sewingCount = job.phases.filter(phase => phase.sewingLabor.status !== 'not-needed').length;
                  
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.projectName || job.jobNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-blue-500" />
                          <span>{weldingCount} phases</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-purple-500" />
                          <span>{sewingCount} phases</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/production/${job.id}`}>
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionOverview;
