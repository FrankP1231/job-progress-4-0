
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job, Phase } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Check } from 'lucide-react';
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog';
import { deletePhase } from '@/lib/supabase/phaseUtils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PhasesTabsCardProps {
  job: Job;
  markingComplete: Record<string, boolean>;
  onTogglePhaseComplete: (phaseId: string, currentStatus: boolean) => void;
  getProgressPercentage: (phase: Phase) => number;
}

const PhasesTabsCard: React.FC<PhasesTabsCardProps> = ({ 
  job, 
  markingComplete, 
  onTogglePhaseComplete,
  getProgressPercentage
}) => {
  const [deletingPhaseId, setDeletingPhaseId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDeletePhase = async (phaseId: string) => {
    try {
      setDeletingPhaseId(phaseId);
      
      // Get the phase info for the toast message
      const phaseToDelete = job.phases.find(p => p.id === phaseId);
      const phaseName = phaseToDelete ? `Phase ${phaseToDelete.phaseNumber}: ${phaseToDelete.phaseName}` : 'Phase';
      
      await deletePhase(job.id, phaseId);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['job', job.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['activities', job.id] });
      
      toast.success(`${phaseName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting phase:', error);
      toast.error('Failed to delete phase. Please try again.');
    } finally {
      setDeletingPhaseId(null);
    }
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Installation Phases</CardTitle>
        <CardDescription>
          {job.phases.length} phase{job.phases.length !== 1 ? 's' : ''} for this job
        </CardDescription>
      </CardHeader>
      <CardContent>
        {job.phases.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No phases have been added to this job yet.</p>
            <Button asChild className="mt-4">
              <Link to={`/jobs/${job.id}/phases/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Phase
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Production Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.phases
                    .sort((a, b) => a.phaseNumber - b.phaseNumber)
                    .map(phase => (
                      <TableRow key={phase.id}>
                        <TableCell>
                          <div className="font-medium">Phase {phase.phaseNumber}</div>
                          <div className="text-sm text-muted-foreground">{phase.phaseName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${getProgressPercentage(phase)}%` }} 
                              />
                            </div>
                            <span className="text-xs whitespace-nowrap">{getProgressPercentage(phase)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={phase.isComplete ? "outline" : "default"} className={phase.isComplete ? "bg-status-complete text-white" : ""}>
                            {phase.isComplete ? 'Complete' : 'In Progress'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs whitespace-nowrap">Complete</span>
                              <Switch 
                                checked={phase.isComplete}
                                onCheckedChange={() => onTogglePhaseComplete(phase.id, phase.isComplete)}
                                disabled={markingComplete[phase.id]}
                                className={phase.isComplete ? "bg-status-complete" : ""}
                              />
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                View
                              </Link>
                            </Button>
                            <DeleteConfirmDialog
                              title={`Delete Phase ${phase.phaseNumber}`}
                              description={`Are you sure you want to delete Phase ${phase.phaseNumber}: ${phase.phaseName}? This action cannot be undone.`}
                              onDelete={() => handleDeletePhase(phase.id)}
                              isDeleting={deletingPhaseId === phase.id}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="active" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Production Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.phases
                    .filter(phase => !phase.isComplete)
                    .sort((a, b) => a.phaseNumber - b.phaseNumber)
                    .map(phase => (
                      <TableRow key={phase.id}>
                        <TableCell>
                          <div className="font-medium">Phase {phase.phaseNumber}</div>
                          <div className="text-sm text-muted-foreground">{phase.phaseName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${getProgressPercentage(phase)}%` }} 
                              />
                            </div>
                            <span className="text-xs whitespace-nowrap">{getProgressPercentage(phase)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs whitespace-nowrap">Complete</span>
                              <Switch 
                                checked={phase.isComplete}
                                onCheckedChange={() => onTogglePhaseComplete(phase.id, phase.isComplete)}
                                disabled={markingComplete[phase.id]}
                              />
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                View
                              </Link>
                            </Button>
                            <DeleteConfirmDialog
                              title={`Delete Phase ${phase.phaseNumber}`}
                              description={`Are you sure you want to delete Phase ${phase.phaseNumber}: ${phase.phaseName}? This action cannot be undone.`}
                              onDelete={() => handleDeletePhase(phase.id)}
                              isDeleting={deletingPhaseId === phase.id}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {job.phases.filter(phase => !phase.isComplete).length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No active phases for this job.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.phases
                    .filter(phase => phase.isComplete)
                    .sort((a, b) => a.phaseNumber - b.phaseNumber)
                    .map(phase => (
                      <TableRow key={phase.id}>
                        <TableCell>
                          <div className="font-medium">Phase {phase.phaseNumber}</div>
                          <div className="text-sm text-muted-foreground">{phase.phaseName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-status-complete text-white">
                            <Check className="mr-1 h-3 w-3" /> Complete
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs whitespace-nowrap">Complete</span>
                              <Switch 
                                checked={phase.isComplete}
                                onCheckedChange={() => onTogglePhaseComplete(phase.id, phase.isComplete)}
                                disabled={markingComplete[phase.id]}
                                className="bg-status-complete"
                              />
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                View
                              </Link>
                            </Button>
                            <DeleteConfirmDialog
                              title={`Delete Phase ${phase.phaseNumber}`}
                              description={`Are you sure you want to delete Phase ${phase.phaseNumber}: ${phase.phaseName}? This action cannot be undone.`}
                              onDelete={() => handleDeletePhase(phase.id)}
                              isDeleting={deletingPhaseId === phase.id}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {job.phases.filter(phase => phase.isComplete).length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No completed phases for this job.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      {job.phases.length > 0 && (
        <CardFooter className="flex justify-center border-t pt-6">
          <Button asChild variant="outline">
            <Link to={`/jobs/${job.id}/phases/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Phase
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PhasesTabsCard;
