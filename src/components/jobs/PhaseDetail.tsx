import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById } from '@/lib/supabaseUtils';
import { getPhaseById } from '@/lib/supabase/phaseUtils';
import { getPhaseActivities } from '@/lib/supabase/activityLogUtils';
import { getTasksForPhase } from '@/lib/supabase/taskUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Wrench, Scissors, Palette } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus, Task } from '@/lib/types';
import PowderCoatCard from './status/PowderCoatCard';
import InstallationCard from './status/InstallationCard';
import StatusUpdateButton from './status/StatusUpdateButton';
import CombinedLaborMaterialCard from './status/CombinedLaborMaterialCard';
import ActivityLogCard from './ActivityLogCard';
import TasksContainer from '@/components/production/TasksContainer';

const PhaseDetail: React.FC = () => {
  const { jobId, phaseId } = useParams<{ jobId: string, phaseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { 
    data: job,
    isLoading: isLoadingJob,
    error: jobError
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobId ? getJobById(jobId) : Promise.resolve(undefined),
    enabled: !!jobId
  });

  React.useEffect(() => {
    if (jobError) {
      console.error('Error loading job:', jobError);
      toast.error('Failed to load job data');
      navigate('/dashboard');
    }
    
    if (job === undefined && !isLoadingJob) {
      toast.error('Job not found');
      navigate('/dashboard');
    }
  }, [job, jobError, isLoadingJob, navigate]);

  const { 
    data: phase,
    isLoading: isLoadingPhase,
    error: phaseError
  } = useQuery({
    queryKey: ['phase', jobId, phaseId],
    queryFn: () => jobId && phaseId ? getPhaseById(jobId, phaseId) : Promise.resolve(undefined),
    enabled: !!jobId && !!phaseId
  });

  React.useEffect(() => {
    if (phaseError) {
      console.error('Error loading phase:', phaseError);
      toast.error('Failed to load phase data');
      if (jobId) navigate(`/jobs/${jobId}`);
    }
    
    if (phase === undefined && !isLoadingPhase) {
      toast.error('Phase not found');
      if (jobId) navigate(`/jobs/${jobId}`);
    }
  }, [phase, phaseError, isLoadingPhase, jobId, navigate]);

  const { 
    data: activities,
    isLoading: activitiesLoading
  } = useQuery({
    queryKey: ['activities', jobId, phaseId],
    queryFn: () => jobId && phaseId ? getPhaseActivities(jobId, phaseId) : Promise.resolve([]),
    enabled: !!jobId && !!phaseId
  });

  const {
    data: tasks,
    isLoading: tasksLoading
  } = useQuery({
    queryKey: ['tasks', phaseId],
    queryFn: () => phaseId ? getTasksForPhase(phaseId) : Promise.resolve([]),
    enabled: !!phaseId,
    refetchOnWindowFocus: true,
    refetchInterval: 5000
  });

  React.useEffect(() => {
    if (tasks) {
      console.log('Tasks fetched for phase detail:', tasks);
    }
  }, [tasks]);

  const isLoading = isLoadingJob || isLoadingPhase;

  const handleBackClick = () => {
    navigate(-1);
  };

  const materialStatusOptions: { value: MaterialStatus; label: string }[] = [
    { value: 'not-needed', label: 'Not Needed' },
    { value: 'not-ordered', label: 'Not Ordered' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
  ];

  const laborStatusOptions: { value: LaborStatus; label: string }[] = [
    { value: 'not-needed', label: 'Not Needed' },
    { value: 'estimated', label: 'Estimated' },
    { value: 'complete', label: 'Complete' },
  ];

  const powderCoatStatusOptions: { value: PowderCoatStatus; label: string }[] = [
    { value: 'not-needed', label: 'Not Needed' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
  ];

  const installationStatusOptions: { value: InstallationStatus; label: string }[] = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
  ];

  const rentalEquipmentStatusOptions: { value: RentalEquipmentStatus; label: string }[] = [
    { value: 'not-needed', label: 'Not Needed' },
    { value: 'not-ordered', label: 'Not Ordered' },
    { value: 'ordered', label: 'Ordered' },
  ];

  const getTasksForArea = (area: string): Task[] => {
    if (!tasks) return [];
    
    const filteredTasks = tasks.filter(task => task.area === area);
    console.log(`Tasks for area ${area}:`, filteredTasks);
    return filteredTasks;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
      </div>
    );
  }

  if (!job || !phase) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Phase not found</h2>
        <p className="text-muted-foreground mt-2">The phase you're looking for doesn't exist or has been deleted.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const normalizedPhase = {
    ...phase,
    installation: {
      ...phase.installation,
      status: typeof phase.installation.status === 'object' && phase.installation.status !== null && 'status' in phase.installation.status 
        ? phase.installation.status.status as InstallationStatus 
        : phase.installation.status as InstallationStatus
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Phase {phase.phaseNumber}: {phase.phaseName}
          </h1>
          <p className="text-muted-foreground">
            Job {job.jobNumber}: {job.projectName}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-4 w-4" />
              <span>Welding</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CombinedLaborMaterialCard
              title="Welding"
              icon={<Wrench className="h-4 w-4" />}
              labor={phase.weldingLabor}
              material={phase.weldingMaterials}
              laborStatus={
                jobId && phaseId && (
                  <StatusUpdateButton
                    jobId={jobId}
                    phaseId={phaseId}
                    statusType="labor"
                    fieldPath="weldingLabor.status"
                    currentStatus={phase.weldingLabor.status}
                    currentHours={phase.weldingLabor.hours}
                    options={laborStatusOptions}
                  />
                )
              }
              materialStatus={
                jobId && phaseId && (
                  <StatusUpdateButton
                    jobId={jobId}
                    phaseId={phaseId}
                    statusType="material"
                    fieldPath="weldingMaterials.status"
                    currentStatus={phase.weldingMaterials.status}
                    currentEta={phase.weldingMaterials.eta}
                    options={materialStatusOptions}
                  />
                )
              }
              phaseId={phaseId}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scissors className="h-4 w-4" />
              <span>Sewing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CombinedLaborMaterialCard
              title="Sewing"
              icon={<Scissors className="h-4 w-4" />}
              labor={phase.sewingLabor}
              material={phase.sewingMaterials}
              laborStatus={
                jobId && phaseId && (
                  <StatusUpdateButton
                    jobId={jobId}
                    phaseId={phaseId}
                    statusType="labor"
                    fieldPath="sewingLabor.status"
                    currentStatus={phase.sewingLabor.status}
                    currentHours={phase.sewingLabor.hours}
                    options={laborStatusOptions}
                  />
                )
              }
              materialStatus={
                jobId && phaseId && (
                  <StatusUpdateButton
                    jobId={jobId}
                    phaseId={phaseId}
                    statusType="material"
                    fieldPath="sewingMaterials.status"
                    currentStatus={phase.sewingMaterials.status}
                    currentEta={phase.sewingMaterials.eta}
                    options={materialStatusOptions}
                  />
                )
              }
              phaseId={phaseId}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <InstallationCard
              installation={normalizedPhase.installation}
              materials={phase.installationMaterials}
              materialStatus={
                jobId && phaseId ? (
                  <StatusUpdateButton
                    jobId={jobId}
                    phaseId={phaseId}
                    statusType="material"
                    fieldPath="installationMaterials.status"
                    currentStatus={phase.installationMaterials.status}
                    currentEta={phase.installationMaterials.eta}
                    options={materialStatusOptions}
                  />
                ) : undefined
              }
              installationStatus={
                jobId && phaseId ? (
                  <StatusUpdateButton
                    jobId={jobId}
                    phaseId={phaseId}
                    statusType="installation"
                    fieldPath="installation.status"
                    currentStatus={normalizedPhase.installation.status}
                    options={installationStatusOptions}
                    onStatusChange={(newStatus) => {
                      if (newStatus === 'complete') {
                        return { isComplete: true };
                      }
                      return {};
                    }}
                  />
                ) : undefined
              }
              rental={
                jobId && phaseId ? (
                  <StatusUpdateButton
                    jobId={jobId}
                    phaseId={phaseId}
                    statusType="rental"
                    fieldPath="installation.rentalEquipment.status"
                    currentStatus={phase.installation.rentalEquipment.status}
                    options={rentalEquipmentStatusOptions}
                  />
                ) : undefined
              }
            />
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Installation Tasks</h4>
              <TasksContainer 
                tasks={getTasksForArea('installation')}
                phaseId={phaseId}
                area="installation"
                isEditing={true}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-4 w-4" />
              <span>Powder Coat</span>
            </CardTitle>
            <div>
              {jobId && phaseId && (
                <StatusUpdateButton
                  jobId={jobId}
                  phaseId={phaseId}
                  statusType="powderCoat"
                  fieldPath="powderCoat.status"
                  currentStatus={phase.powderCoat.status}
                  currentEta={phase.powderCoat.eta}
                  options={powderCoatStatusOptions}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <PowderCoatCard 
              powderCoat={{
                ...phase.powderCoat,
                status: phase.powderCoat.status
              }}
              hideStatus={true}
            />
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Powder Coat Tasks</h4>
              <TasksContainer 
                tasks={getTasksForArea('powderCoat')}
                phaseId={phaseId}
                area="powderCoat"
                isEditing={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <ActivityLogCard activities={activities || []} />
      </div>
    </div>
  );
};

export default PhaseDetail;
