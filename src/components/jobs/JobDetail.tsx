
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, markPhaseComplete } from '@/lib/supabaseUtils';
import { Job, Phase, MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import JobDetailHeader from './JobDetailHeader';
import JobDetailsCard from './JobDetailsCard';
import PhasesTabsCard from './PhasesTabsCard';
import PhaseStatusOverview from './PhaseStatusOverview';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [markingComplete, setMarkingComplete] = useState<Record<string, boolean>>({});

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

  const rentalEquipmentStatusOptions: { value: RentalEquipmentStatus; label: string }[] = [
    { value: 'not-needed', label: 'Not Needed' },
    { value: 'not-ordered', label: 'Not Ordered' },
    { value: 'ordered', label: 'Ordered' },
  ];

  const installationStatusOptions: { value: InstallationStatus; label: string }[] = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
  ];

  const { 
    data: job,
    isLoading, 
    error
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobId ? getJobById(jobId) : Promise.resolve(undefined),
    enabled: !!jobId
  });

  useEffect(() => {
    if (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job data');
    }
  }, [error]);

  const togglePhaseMutation = useMutation({
    mutationFn: ({ phaseId, currentStatus }: { phaseId: string, currentStatus: boolean }) => {
      if (!jobId) throw new Error('Job ID is required');
      return markPhaseComplete(jobId, phaseId, !currentStatus);
    },
    onMutate: (variables) => {
      setMarkingComplete(prev => ({ ...prev, [variables.phaseId]: true }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['inProgressPhases'] });
    },
    onError: (error) => {
      console.error('Failed to update phase status:', error);
      toast.error('Failed to update phase status');
    },
    onSettled: (data, error, variables) => {
      setMarkingComplete(prev => ({ ...prev, [variables.phaseId]: false }));
    }
  });

  const handleTogglePhaseComplete = (phaseId: string, currentStatus: boolean) => {
    togglePhaseMutation.mutate({ phaseId, currentStatus });
  };

  const getProgressPercentage = (phase: Phase): number => {
    let totalItems = 6;
    let completedItems = 0;
    
    if (phase.weldingMaterials.status === 'received' || phase.weldingMaterials.status === 'not-needed') {
      completedItems++;
    }
    
    if (phase.sewingMaterials.status === 'received' || phase.sewingMaterials.status === 'not-needed') {
      completedItems++;
    }
    
    if (phase.weldingLabor.status === 'complete' || phase.weldingLabor.status === 'not-needed') {
      completedItems++;
    }
    
    if (phase.sewingLabor.status === 'complete' || phase.sewingLabor.status === 'not-needed') {
      completedItems++;
    }
    
    if (phase.installationMaterials.status === 'received' || phase.installationMaterials.status === 'not-needed') {
      completedItems++;
    }
    
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
      <JobDetailHeader job={job} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <JobDetailsCard job={job} />
        
        <PhasesTabsCard
          job={job}
          markingComplete={markingComplete}
          onTogglePhaseComplete={handleTogglePhaseComplete}
          getProgressPercentage={getProgressPercentage}
        />
      </div>
      
      {job.phases.length > 0 && (
        <PhaseStatusOverview
          job={job}
          materialStatusOptions={materialStatusOptions}
          laborStatusOptions={laborStatusOptions}
          powderCoatStatusOptions={powderCoatStatusOptions}
          rentalEquipmentStatusOptions={rentalEquipmentStatusOptions}
          installationStatusOptions={installationStatusOptions}
        />
      )}
    </div>
  );
};

export default JobDetail;
