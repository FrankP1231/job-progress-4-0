
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById } from '@/lib/supabase';
import { Job, TaskWithMetadata } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

import PhaseInfoCard from './phases/PhaseInfoCard';
import WeldingCard from './phases/WeldingCard';
import SewingCard from './phases/SewingCard';
import PowderCoatCard from './phases/PowderCoatCard';
import InstallationCard from './phases/InstallationCard';
import FormHeader from './phases/FormHeader';
import FormActions from './phases/FormActions';
import { usePhaseFormState } from '@/hooks/usePhaseFormState';
import { useAddPhaseMutation } from '@/services/phaseService';

const PhaseForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const formState = usePhaseFormState();
  const {
    phaseName,
    setPhaseName,
    phaseNumber,
    setPhaseNumber,
    isSubmitting,
    setIsSubmitting,
    weldingMaterialTasks,
    sewingMaterialTasks,
    installationMaterialTasks,
    weldingLaborTasks,
    sewingLaborTasks,
    powderCoatTasks,
    installationTasks,
    rentalEquipmentTasks,
    crewMembersNeeded,
    setCrewMembersNeeded,
    crewHoursNeeded,
    setCrewHoursNeeded,
    siteReadyDate,
    setSiteReadyDate,
    installDeadline,
    setInstallDeadline,
    installNotes,
    setInstallNotes,
    powderCoatEta,
    setPowderCoatEta,
    powderCoatNotes,
    setPowderCoatNotes,
    powderCoatColor,
    setPowderCoatColor,
    addTaskToArea,
    removeTaskFromArea
  } = formState;

  const { 
    data: job,
    isLoading,
    error
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobId ? getJobById(jobId) : Promise.resolve(undefined),
    enabled: !!jobId
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error loading job:', error);
      navigate('/dashboard');
    }
  }, [error, navigate]);

  useEffect(() => {
    if (job && job.phases) {
      const existingPhaseNumbers = job.phases.map(p => p.phaseNumber);
      const nextPhaseNumber = existingPhaseNumbers.length > 0 
        ? Math.max(...existingPhaseNumbers) + 1 
        : 1;
      setPhaseNumber(nextPhaseNumber.toString());
    }
  }, [job, setPhaseNumber]);

  const addPhaseMutation = useAddPhaseMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || !jobId) return;
    
    setIsSubmitting(true);
    
    const mapTasks = (tasks: TaskWithMetadata[], area: string) => {
      if (tasks.length > 0) {
        return tasks.map(task => ({
          name: task.name,
          hours: task.hours,
          eta: task.eta,
          _assigneeIds: task.assigneeIds
        }));
      }
      return [];
    };
    
    const pendingTasks: Record<string, any[]> = {
      weldingMaterials: mapTasks(weldingMaterialTasks, 'weldingMaterials'),
      sewingMaterials: mapTasks(sewingMaterialTasks, 'sewingMaterials'),
      installationMaterials: mapTasks(installationMaterialTasks, 'installationMaterials'),
      weldingLabor: mapTasks(weldingLaborTasks, 'weldingLabor'),
      sewingLabor: mapTasks(sewingLaborTasks, 'sewingLabor'),
      powderCoat: mapTasks(powderCoatTasks, 'powderCoat'),
      installation: mapTasks(installationTasks, 'installation'),
      rentalEquipment: mapTasks(rentalEquipmentTasks, 'rentalEquipment')
    };
    
    // Remove empty task arrays
    Object.keys(pendingTasks).forEach(key => {
      if (pendingTasks[key].length === 0) {
        delete pendingTasks[key];
      }
    });
    
    addPhaseMutation.mutate({
      jobId,
      phaseName,
      phaseNumber,
      crewMembersNeeded,
      crewHoursNeeded,
      siteReadyDate,
      installDeadline,
      installNotes,
      powderCoatEta,
      powderCoatNotes,
      powderCoatColor,
      pendingTasks,
      onSuccess: () => navigate(`/jobs/${jobId}`),
      onError: () => setIsSubmitting(false)
    });
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
      <FormHeader job={job} />
      
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            e.stopPropagation();
          }
        }}
      >
        <PhaseInfoCard 
          phaseName={phaseName}
          setPhaseName={setPhaseName}
          phaseNumber={phaseNumber}
          setPhaseNumber={setPhaseNumber}
        />
        
        <WeldingCard 
          weldingMaterialTasks={weldingMaterialTasks}
          weldingLaborTasks={weldingLaborTasks}
          onAddTask={addTaskToArea}
          onRemoveTask={removeTaskFromArea}
        />
        
        <SewingCard 
          sewingMaterialTasks={sewingMaterialTasks}
          sewingLaborTasks={sewingLaborTasks}
          onAddTask={addTaskToArea}
          onRemoveTask={removeTaskFromArea}
        />
        
        <PowderCoatCard 
          powderCoatTasks={powderCoatTasks}
          powderCoatEta={powderCoatEta}
          powderCoatNotes={powderCoatNotes}
          powderCoatColor={powderCoatColor}
          setPowderCoatEta={setPowderCoatEta}
          setPowderCoatNotes={setPowderCoatNotes}
          setPowderCoatColor={setPowderCoatColor}
          onAddTask={addTaskToArea}
          onRemoveTask={removeTaskFromArea}
        />
        
        <InstallationCard 
          installationMaterialTasks={installationMaterialTasks}
          installationTasks={installationTasks}
          rentalEquipmentTasks={rentalEquipmentTasks}
          crewMembersNeeded={crewMembersNeeded}
          crewHoursNeeded={crewHoursNeeded}
          siteReadyDate={siteReadyDate}
          installDeadline={installDeadline}
          installNotes={installNotes}
          setCrewMembersNeeded={setCrewMembersNeeded}
          setCrewHoursNeeded={setCrewHoursNeeded}
          setSiteReadyDate={setSiteReadyDate}
          setInstallDeadline={setInstallDeadline}
          setInstallNotes={setInstallNotes}
          onAddTask={addTaskToArea}
          onRemoveTask={removeTaskFromArea}
        />
        
        <FormActions 
          jobId={jobId as string} 
          isPending={addPhaseMutation.isPending} 
          isSubmitting={isSubmitting} 
        />
      </form>
    </div>
  );
};

export default PhaseForm;
