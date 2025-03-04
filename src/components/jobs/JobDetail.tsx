
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, markPhaseComplete } from '@/lib/supabaseUtils';
import { Job, Phase } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  PlusCircle, 
  ExternalLink, 
  Calendar, 
  Clipboard, 
  ClipboardList, 
  FileEdit, 
  Check,
  Wrench,
  Scissors,
  Package,
  Palette,
  Truck
} from 'lucide-react';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [markingComplete, setMarkingComplete] = useState<Record<string, boolean>>({});

  // Fetch job data
  const { 
    data: job,
    isLoading, 
    error
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobId ? getJobById(jobId) : Promise.resolve(undefined),
    enabled: !!jobId
  });

  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job data');
    }
  }, [error]);

  // Mutation to toggle phase completion
  const togglePhaseMutation = useMutation({
    mutationFn: ({ phaseId, currentStatus }: { phaseId: string, currentStatus: boolean }) => {
      if (!jobId) throw new Error('Job ID is required');
      return markPhaseComplete(jobId, phaseId, !currentStatus);
    },
    onMutate: ({ phaseId }) => {
      setMarkingComplete(prev => ({ ...prev, [phaseId]: true }));
    },
    onSuccess: () => {
      // Invalidate and refetch job data
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['inProgressPhases'] });
    },
    onError: (error) => {
      console.error('Failed to update phase status:', error);
      toast.error('Failed to update phase status');
    },
    onSettled: ({ phaseId }) => {
      setMarkingComplete(prev => ({ ...prev, [phaseId]: false }));
    }
  });

  const handleTogglePhaseComplete = (phaseId: string, currentStatus: boolean) => {
    togglePhaseMutation.mutate({ phaseId, currentStatus });
  };

  const getProgressPercentage = (phase: Phase): number => {
    let totalItems = 6; // Total number of status items
    let completedItems = 0;
    
    // Check welding materials
    if (phase.weldingMaterials.status === 'received' || phase.weldingMaterials.status === 'not-needed') {
      completedItems++;
    }
    
    // Check sewing materials
    if (phase.sewingMaterials.status === 'received' || phase.sewingMaterials.status === 'not-needed') {
      completedItems++;
    }
    
    // Check welding labor
    if (phase.weldingLabor.status === 'complete' || phase.weldingLabor.status === 'not-needed') {
      completedItems++;
    }
    
    // Check sewing labor
    if (phase.sewingLabor.status === 'complete' || phase.sewingLabor.status === 'not-needed') {
      completedItems++;
    }
    
    // Check installation materials
    if (phase.installationMaterials.status === 'received' || phase.installationMaterials.status === 'not-needed') {
      completedItems++;
    }
    
    // Check powder coat
    if (phase.powderCoat.status === 'complete' || phase.powderCoat.status === 'not-needed') {
      completedItems++;
    }
    
    return Math.round((completedItems / totalItems) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Job not found</h2>
        <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist or has been deleted.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {job.jobNumber}: {job.projectName}
            </h1>
            <p className="text-muted-foreground">
              Created {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/jobs/${job.id}/edit`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit Job
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/jobs/${job.id}/phases/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Phase
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium">Job Number</div>
              <div>{job.jobNumber}</div>
              
              <div className="text-sm font-medium">Project Name</div>
              <div>{job.projectName}</div>
              
              <div className="text-sm font-medium">Buyer/Client</div>
              <div>{job.buyer}</div>
              
              <div className="text-sm font-medium">Salesperson</div>
              <div>{job.salesman}</div>
              
              <div className="text-sm font-medium">Calendar Title</div>
              <div>{job.title || 'Not specified'}</div>
            </div>
            
            {(job.drawingsUrl || job.worksheetUrl) && (
              <>
                <Separator />
                <div className="space-y-2">
                  {job.drawingsUrl && (
                    <a 
                      href={job.drawingsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <Clipboard className="mr-1 h-4 w-4" />
                      View Drawings
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                  
                  {job.worksheetUrl && (
                    <a 
                      href={job.worksheetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <ClipboardList className="mr-1 h-4 w-4" />
                      View Worksheet
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
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
                        <TableHead>Progress</TableHead>
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
                                    onCheckedChange={() => handleTogglePhaseComplete(phase.id, phase.isComplete)}
                                    disabled={markingComplete[phase.id]}
                                    className={phase.isComplete ? "bg-status-complete" : ""}
                                  />
                                </div>
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                    View
                                  </Link>
                                </Button>
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
                        <TableHead>Progress</TableHead>
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
                                    onCheckedChange={() => handleTogglePhaseComplete(phase.id, phase.isComplete)}
                                    disabled={markingComplete[phase.id]}
                                  />
                                </div>
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                    View
                                  </Link>
                                </Button>
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
                                    onCheckedChange={() => handleTogglePhaseComplete(phase.id, phase.isComplete)}
                                    disabled={markingComplete[phase.id]}
                                    className="bg-status-complete"
                                  />
                                </div>
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                    View
                                  </Link>
                                </Button>
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
      </div>
      
      {job.phases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phase Status Overview</CardTitle>
            <CardDescription>
              Production and installation status for all phases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phase</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <Wrench className="mr-1 h-4 w-4" />
                      <span>Welding</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <Scissors className="mr-1 h-4 w-4" />
                      <span>Sewing</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <Package className="mr-1 h-4 w-4" />
                      <span>Installation</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <Palette className="mr-1 h-4 w-4" />
                      <span>Powder Coat</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center">
                      <Truck className="mr-1 h-4 w-4" />
                      <span>Install Crew</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.phases
                  .sort((a, b) => a.phaseNumber - b.phaseNumber)
                  .map(phase => (
                    <TableRow key={phase.id} className={phase.isComplete ? "bg-muted/20" : ""}>
                      <TableCell>
                        <div className="font-medium">
                          Phase {phase.phaseNumber}: {phase.phaseName}
                        </div>
                        <Badge variant={phase.isComplete ? "outline" : "default"} className={phase.isComplete ? "bg-status-complete text-white mt-1" : "mt-1"}>
                          {phase.isComplete ? 'Complete' : 'In Progress'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <div className="font-medium text-sm">Materials</div>
                          <StatusBadge status={phase.weldingMaterials.status} />
                          
                          <div className="font-medium text-sm mt-2">Labor</div>
                          <StatusBadge status={phase.weldingLabor.status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <div className="font-medium text-sm">Materials</div>
                          <StatusBadge status={phase.sewingMaterials.status} />
                          
                          <div className="font-medium text-sm mt-2">Labor</div>
                          <StatusBadge status={phase.sewingLabor.status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <div className="font-medium text-sm">Materials</div>
                          <StatusBadge status={phase.installationMaterials.status} />
                          
                          <div className="font-medium text-sm mt-2">Rental</div>
                          <StatusBadge status={phase.installation.rentalEquipment.status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <StatusBadge status={phase.powderCoat.status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center text-sm">
                          <div>
                            <span className="font-medium">Crew Size:</span> {phase.installation.crewMembersNeeded}
                          </div>
                          <div>
                            <span className="font-medium">Hours Needed:</span> {phase.installation.crewHoursNeeded}
                          </div>
                          
                          {phase.installation.siteReadyDate && (
                            <div className="flex items-center mt-1 text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              <span className="whitespace-nowrap">Site Ready: {new Date(phase.installation.siteReadyDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {phase.installation.installDeadline && (
                            <div className="flex items-center mt-1 text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              <span className="whitespace-nowrap">Deadline: {new Date(phase.installation.installDeadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobDetail;
