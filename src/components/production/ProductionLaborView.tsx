
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Phase, LaborStatus } from '@/lib/types';
import { getJobById } from '@/lib/supabase/jobUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/ui/StatusBadge';
import { Wrench, Scissors } from 'lucide-react';
import LaborStatusCard from '../jobs/status/LaborStatusCard';

const ProductionLaborView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId!),
    enabled: !!jobId
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
    </div>;
  }

  if (error) {
    console.error('Error fetching job data:', error);
    return <div className="text-red-500">Error loading job data</div>;
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  // Filter phases for welding and sewing
  const weldingPhases = job.phases.filter(phase => phase.weldingLabor.status !== 'not-needed');
  const sewingPhases = job.phases.filter(phase => phase.sewingLabor.status !== 'not-needed');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{job.projectName || job.jobNumber} - Production Labor</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Production</TabsTrigger>
          <TabsTrigger value="welding">Welding</TabsTrigger>
          <TabsTrigger value="sewing">Sewing</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {renderWeldingSection(weldingPhases)}
          {renderSewingSection(sewingPhases)}
        </TabsContent>

        <TabsContent value="welding" className="space-y-6">
          {renderWeldingSection(weldingPhases)}
        </TabsContent>

        <TabsContent value="sewing" className="space-y-6">
          {renderSewingSection(sewingPhases)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to render the welding section
const renderWeldingSection = (phases: Phase[]) => {
  if (phases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            <span>Welding Labor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No phases require welding labor
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          <span>Welding Labor</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Est. Hours</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phases.map(phase => (
              <TableRow key={`welding-${phase.id}`}>
                <TableCell className="font-medium">
                  {phase.phaseNumber}. {phase.phaseName}
                </TableCell>
                <TableCell>
                  <StatusBadge status={phase.weldingLabor.status} />
                </TableCell>
                <TableCell>{phase.weldingLabor.hours || '-'}</TableCell>
                <TableCell>{phase.weldingLabor.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Helper function to render the sewing section
const renderSewingSection = (phases: Phase[]) => {
  if (phases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            <span>Sewing Labor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No phases require sewing labor
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          <span>Sewing Labor</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Est. Hours</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phases.map(phase => (
              <TableRow key={`sewing-${phase.id}`}>
                <TableCell className="font-medium">
                  {phase.phaseNumber}. {phase.phaseName}
                </TableCell>
                <TableCell>
                  <StatusBadge status={phase.sewingLabor.status} />
                </TableCell>
                <TableCell>{phase.sewingLabor.hours || '-'}</TableCell>
                <TableCell>{phase.sewingLabor.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductionLaborView;
