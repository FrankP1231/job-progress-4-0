import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAllJobs } from '@/lib/supabase/jobUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Wrench, Scissors, ArrowRight, Clock, PackageCheck } from 'lucide-react';
import { Job, Phase } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';

const ProductionOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'welding' | 'sewing' | 'readyForInstall'>('welding');
  
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

  const productionJobs = jobs?.filter(job => 
    job.phases.some(phase => 
      phase.weldingLabor.status !== 'not-needed' || 
      phase.sewingLabor.status !== 'not-needed'
    )
  ) || [];

  const weldingPhases: { phase: Phase, job: Job }[] = [];
  const sewingPhases: { phase: Phase, job: Job }[] = [];
  const readyForInstallPhases: { phase: Phase, job: Job }[] = [];
  
  productionJobs.forEach(job => {
    job.phases.forEach(phase => {
      if (phase.weldingLabor.status !== 'not-needed') {
        weldingPhases.push({ phase, job });
      }
      if (phase.sewingLabor.status !== 'not-needed') {
        sewingPhases.push({ phase, job });
      }
      
      const isWeldingComplete = phase.weldingLabor.status === 'complete' || phase.weldingLabor.status === 'not-needed';
      const isSewingComplete = phase.sewingLabor.status === 'complete' || phase.sewingLabor.status === 'not-needed';
      const isPowderCoatComplete = phase.powderCoat.status === 'complete' || phase.powderCoat.status === 'not-needed';
      
      const areWeldingMaterialsReceived = phase.weldingMaterials.status === 'received' || phase.weldingMaterials.status === 'not-needed';
      const areSewingMaterialsReceived = phase.sewingMaterials.status === 'received' || phase.sewingMaterials.status === 'not-needed';
      const areInstallMaterialsReceived = phase.installationMaterials.status === 'received' || phase.installationMaterials.status === 'not-needed';
      
      if (isWeldingComplete && isSewingComplete && isPowderCoatComplete && 
          areWeldingMaterialsReceived && areSewingMaterialsReceived && areInstallMaterialsReceived && 
          phase.installation.status !== 'complete') {
        readyForInstallPhases.push({ phase, job });
      }
    });
  });

  const totalWeldingHours = weldingPhases.reduce((total, { phase }) => {
    return total + (phase.weldingLabor.hours || 0);
  }, 0);

  const totalSewingHours = sewingPhases.reduce((total, { phase }) => {
    return total + (phase.sewingLabor.hours || 0);
  }, 0);
  
  const totalInstallHours = readyForInstallPhases.reduce((total, { phase }) => {
    return total + (phase.installation.crewHoursNeeded || 0);
  }, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Overview</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'welding' | 'sewing' | 'readyForInstall')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="welding" className="flex items-center">
            <Wrench className="mr-2 h-4 w-4" />
            Welding ({weldingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="sewing" className="flex items-center">
            <Scissors className="mr-2 h-4 w-4" />
            Sewing ({sewingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="readyForInstall" className="flex items-center">
            <PackageCheck className="mr-2 h-4 w-4" />
            Ready for Install ({readyForInstallPhases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="welding" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5 text-blue-500" />
                Welding Tasks
              </CardTitle>
              <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Total Est. Hours: {totalWeldingHours}</span>
              </div>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Scissors className="mr-2 h-5 w-5 text-purple-500" />
                Sewing Tasks
              </CardTitle>
              <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-md">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Total Est. Hours: {totalSewingHours}</span>
              </div>
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

        <TabsContent value="readyForInstall" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <PackageCheck className="mr-2 h-5 w-5 text-green-500" />
                Ready for Installation
              </CardTitle>
              <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-md">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Total Est. Hours: {totalInstallHours}</span>
              </div>
            </CardHeader>
            <CardContent>
              {readyForInstallPhases.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No phases ready for installation
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Production Status</TableHead>
                      <TableHead>Install Crew</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyForInstallPhases.map(({ phase, job }) => (
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
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-3 w-3 text-blue-500" />
                              <StatusBadge status={phase.weldingLabor.status} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Scissors className="h-3 w-3 text-purple-500" />
                              <StatusBadge status={phase.sewingLabor.status} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {phase.installation.crewMembersNeeded} crew members
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            {phase.installation.crewHoursNeeded} hrs
                          </div>
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
