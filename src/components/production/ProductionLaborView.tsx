
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '@/lib/supabase/jobUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench, Scissors, Clock } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Phase } from '@/lib/types';

const ProductionLaborView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [activeTab, setActiveTab] = useState<'welding' | 'sewing'>('welding');
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId || ''),
    enabled: !!jobId
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
    </div>;
  }

  if (error) {
    console.error('Error fetching job:', error);
    return <div className="text-red-500">Error loading job</div>;
  }

  if (!job) {
    return <div className="text-center py-6">Job not found</div>;
  }

  // Filter phases based on active tab
  const weldingPhases = job.phases.filter(phase => phase.weldingLabor.status !== 'not-needed');
  const sewingPhases = job.phases.filter(phase => phase.sewingLabor.status !== 'not-needed');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/production">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{job.projectName || job.jobNumber}</h1>
        </div>
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
                Welding Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weldingPhases.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No phases with welding tasks found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Materials Status</TableHead>
                      <TableHead>Labor Status</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Material ETA</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weldingPhases
                      .sort((a, b) => a.phaseNumber - b.phaseNumber)
                      .map((phase) => (
                        <PhaseRow 
                          key={phase.id} 
                          phase={phase} 
                          materialStatus={phase.weldingMaterials.status}
                          materialEta={phase.weldingMaterials.eta}
                          materialNotes={phase.weldingMaterials.notes}
                          laborStatus={phase.weldingLabor.status}
                          laborHours={phase.weldingLabor.hours}
                          laborNotes={phase.weldingLabor.notes}
                        />
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
                Sewing Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sewingPhases.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No phases with sewing tasks found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Materials Status</TableHead>
                      <TableHead>Labor Status</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Material ETA</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sewingPhases
                      .sort((a, b) => a.phaseNumber - b.phaseNumber)
                      .map((phase) => (
                        <PhaseRow 
                          key={phase.id} 
                          phase={phase} 
                          materialStatus={phase.sewingMaterials.status}
                          materialEta={phase.sewingMaterials.eta}
                          materialNotes={phase.sewingMaterials.notes}
                          laborStatus={phase.sewingLabor.status}
                          laborHours={phase.sewingLabor.hours}
                          laborNotes={phase.sewingLabor.notes}
                        />
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

interface PhaseRowProps {
  phase: Phase;
  materialStatus: string;
  materialEta?: string;
  materialNotes?: string;
  laborStatus: string;
  laborHours?: number;
  laborNotes?: string;
}

const PhaseRow: React.FC<PhaseRowProps> = ({
  phase,
  materialStatus,
  materialEta,
  materialNotes,
  laborStatus,
  laborHours,
  laborNotes
}) => {
  return (
    <TableRow key={phase.id}>
      <TableCell className="font-medium">
        <Link to={`/jobs/${phase.jobId}/phases/${phase.id}`} className="hover:underline">
          {phase.phaseNumber}: {phase.phaseName}
        </Link>
      </TableCell>
      <TableCell>
        <StatusBadge status={materialStatus} />
      </TableCell>
      <TableCell>
        <StatusBadge status={laborStatus} />
      </TableCell>
      <TableCell>
        {laborHours ? (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            {laborHours} hrs
          </div>
        ) : (
          <span className="text-gray-400">Not estimated</span>
        )}
      </TableCell>
      <TableCell>
        {materialEta ? (
          new Date(materialEta).toLocaleDateString()
        ) : (
          <span className="text-gray-400">No ETA</span>
        )}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {materialNotes || laborNotes ? (
          <div className="text-sm text-gray-600">
            {materialNotes && <div className="truncate">{materialNotes}</div>}
            {laborNotes && <div className="truncate">{laborNotes}</div>}
          </div>
        ) : (
          <span className="text-gray-400">No notes</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ProductionLaborView;
