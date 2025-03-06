
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAllJobs } from '@/lib/supabase/jobUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Wrench, Scissors, ArrowRight, Clock } from 'lucide-react';
import { Job, Phase } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';

const ProductionOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'welding' | 'sewing'>('welding');
  
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

  // Extract all welding and sewing phases across all jobs
  const weldingPhases: { phase: Phase, job: Job }[] = [];
  const sewingPhases: { phase: Phase, job: Job }[] = [];
  
  productionJobs.forEach(job => {
    job.phases.forEach(phase => {
      if (phase.weldingLabor.status !== 'not-needed') {
        weldingPhases.push({ phase, job });
      }
      if (phase.sewingLabor.status !== 'not-needed') {
        sewingPhases.push({ phase, job });
      }
    });
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Overview</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'welding' | 'sewing')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="welding" className="flex items-center">
            <Wrench className="mr-2 h-4 w-4" />
            Welding ({weldingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="sewing" className="flex items-center">
            <Scissors className="mr-2 h-4 w-4" />
            Sewing ({sewingPhases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="welding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5 text-blue-500" />
                Welding Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weldingPhases.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No welding tasks found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Materials Status</TableHead>
                      <TableHead>Labor Status</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weldingPhases.map(({ phase, job }) => (
                      <TableRow key={`${job.id}-${phase.id}`}>
                        <TableCell className="font-medium">
                          <Link to={`/jobs/${job.id}`} className="hover:underline">
                            {job.projectName || job.jobNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/jobs/${job.id}/phases/${phase.id}`} className="hover:underline">
                            {phase.phaseNumber}: {phase.phaseName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={phase.weldingMaterials.status} />
                          {phase.weldingMaterials.eta && (
                            <div className="text-xs text-gray-500 mt-1">
                              ETA: {new Date(phase.weldingMaterials.eta).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={phase.weldingLabor.status} />
                          {phase.weldingLabor.hours && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {phase.weldingLabor.hours} hrs
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {phase.weldingLabor.hours ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-500" />
                              {phase.weldingLabor.hours} hrs
                            </div>
                          ) : (
                            <span className="text-gray-400">Not estimated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/production/${job.id}`}>
                              View Details <ArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sewing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scissors className="mr-2 h-5 w-5 text-purple-500" />
                Sewing Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sewingPhases.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No sewing tasks found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Materials Status</TableHead>
                      <TableHead>Labor Status</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sewingPhases.map(({ phase, job }) => (
                      <TableRow key={`${job.id}-${phase.id}`}>
                        <TableCell className="font-medium">
                          <Link to={`/jobs/${job.id}`} className="hover:underline">
                            {job.projectName || job.jobNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/jobs/${job.id}/phases/${phase.id}`} className="hover:underline">
                            {phase.phaseNumber}: {phase.phaseName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={phase.sewingMaterials.status} />
                          {phase.sewingMaterials.eta && (
                            <div className="text-xs text-gray-500 mt-1">
                              ETA: {new Date(phase.sewingMaterials.eta).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={phase.sewingLabor.status} />
                          {phase.sewingLabor.hours && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {phase.sewingLabor.hours} hrs
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {phase.sewingLabor.hours ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-500" />
                              {phase.sewingLabor.hours} hrs
                            </div>
                          ) : (
                            <span className="text-gray-400">Not estimated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/production/${job.id}`}>
                              View Details <ArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionOverview;
