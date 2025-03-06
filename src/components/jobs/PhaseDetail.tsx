
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, getPhaseById } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Wrench, Scissors } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MaterialStatusCard from './status/MaterialStatusCard';
import LaborStatusCard from './status/LaborStatusCard';
import PowderCoatCard from './status/PowderCoatCard';
import InstallationCard from './status/InstallationCard';

const PhaseDetail: React.FC = () => {
  const { jobId, phaseId } = useParams<{ jobId: string, phaseId: string }>();
  const navigate = useNavigate();

  // Fetch job data
  const { 
    data: job,
    isLoading: isLoadingJob,
    error: jobError
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobId ? getJobById(jobId) : Promise.resolve(undefined),
    enabled: !!jobId
  });

  // Handle job loading errors or not found
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

  // Fetch phase data
  const { 
    data: phase,
    isLoading: isLoadingPhase,
    error: phaseError
  } = useQuery({
    queryKey: ['phase', jobId, phaseId],
    queryFn: () => jobId && phaseId ? getPhaseById(jobId, phaseId) : Promise.resolve(undefined),
    enabled: !!jobId && !!phaseId
  });

  // Handle phase loading errors or not found
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

  const isLoading = isLoadingJob || isLoadingPhase;

  // Handle back button click - uses browser history
  const handleBackClick = () => {
    navigate(-1);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-2" onClick={handleBackClick}>
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
        <div className="space-y-6">
          <LaborStatusCard 
            title="Welding Labor"
            icon={<Wrench className="h-4 w-4" />}
            labor={phase.weldingLabor}
          />
          <MaterialStatusCard
            title="Welding Materials"
            icon={<Wrench className="h-4 w-4" />}
            material={phase.weldingMaterials}
          />
        </div>
        
        <div className="space-y-6">
          <LaborStatusCard
            title="Sewing Labor"
            icon={<Scissors className="h-4 w-4" />}
            labor={phase.sewingLabor}
          />
          <MaterialStatusCard
            title="Sewing Materials"
            icon={<Scissors className="h-4 w-4" />}
            material={phase.sewingMaterials}
          />
        </div>
        
        <div className="md:col-span-2">
          <InstallationCard
            installation={phase.installation}
            materials={phase.installationMaterials}
          />
        </div>
        
        <div className="md:col-span-2">
          <PowderCoatCard powderCoat={phase.powderCoat} />
        </div>
      </div>
    </div>
  );
};

export default PhaseDetail;
