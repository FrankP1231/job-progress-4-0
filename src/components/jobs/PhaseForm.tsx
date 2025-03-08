
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, createNewPhase, addPhaseToJob } from '@/lib/supabase';
import { Job, Phase, MaterialStatus, LaborStatus, PowderCoatStatus, InstallationStatus, RentalEquipmentStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import our new components
import PhaseInfoCard from './phases/PhaseInfoCard';
import WeldingCard from './phases/WeldingCard';
import SewingCard from './phases/SewingCard';
import PowderCoatCard from './phases/PowderCoatCard';
import InstallationCard from './phases/InstallationCard';

const PhaseForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Basic phase info
  const [phaseName, setPhaseName] = useState('');
  const [phaseNumber, setPhaseNumber] = useState('');
  
  // Task lists for each area
  const [weldingMaterialTasks, setWeldingMaterialTasks] = useState<string[]>([]);
  const [sewingMaterialTasks, setSewingMaterialTasks] = useState<string[]>([]);
  const [installationMaterialTasks, setInstallationMaterialTasks] = useState<string[]>([]);
  const [weldingLaborTasks, setWeldingLaborTasks] = useState<string[]>([]);
  const [sewingLaborTasks, setSewingLaborTasks] = useState<string[]>([]);
  const [powderCoatTasks, setPowderCoatTasks] = useState<string[]>([]);
  const [installationTasks, setInstallationTasks] = useState<string[]>([]);
  const [rentalEquipmentTasks, setRentalEquipmentTasks] = useState<string[]>([]);
  
  // Crew information
  const [crewMembersNeeded, setCrewMembersNeeded] = useState('2');
  const [crewHoursNeeded, setCrewHoursNeeded] = useState('4');
  const [siteReadyDate, setSiteReadyDate] = useState('');
  const [installDeadline, setInstallDeadline] = useState('');
  const [installNotes, setInstallNotes] = useState('');
  const [powderCoatEta, setPowderCoatEta] = useState('');
  const [powderCoatNotes, setPowderCoatNotes] = useState('');
  const [powderCoatColor, setPowderCoatColor] = useState('');

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
      toast.error('Failed to load job data');
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
  }, [job]);

  const addPhaseMutation = useMutation({
    mutationFn: async () => {
      if (!jobId || !job) throw new Error('Job ID is required');
      if (!phaseName.trim()) throw new Error('Please enter a phase name');
      if (!phaseNumber.trim() || isNaN(Number(phaseNumber)) || Number(phaseNumber) <= 0) {
        throw new Error('Please enter a valid phase number');
      }
      
      // Create a new phase with proper typing
      const newPhase = createNewPhase(jobId, phaseName, Number(phaseNumber));
      
      // Add installation details
      newPhase.installation = {
        status: 'not-started' as InstallationStatus,
        crewMembersNeeded: Number(crewMembersNeeded),
        crewHoursNeeded: Number(crewHoursNeeded),
        siteReadyDate: siteReadyDate || undefined,
        installDeadline: installDeadline || undefined,
        notes: installNotes || undefined,
        rentalEquipment: {
          status: 'not-needed' as RentalEquipmentStatus
        }
      };
      
      // Add powder coat details
      if (powderCoatEta || powderCoatNotes || powderCoatColor) {
        newPhase.powderCoat = {
          status: 'not-started' as PowderCoatStatus,
          eta: powderCoatEta || undefined,
          notes: powderCoatNotes || undefined,
          color: powderCoatColor || undefined
        };
      }
      
      // Prepare tasks for each area
      const pendingTasks: Record<string, string[]> = {};
      
      if (weldingMaterialTasks.length > 0) {
        pendingTasks.weldingMaterials = weldingMaterialTasks;
      }
      
      if (sewingMaterialTasks.length > 0) {
        pendingTasks.sewingMaterials = sewingMaterialTasks;
      }
      
      if (installationMaterialTasks.length > 0) {
        pendingTasks.installationMaterials = installationMaterialTasks;
      }
      
      if (weldingLaborTasks.length > 0) {
        pendingTasks.weldingLabor = weldingLaborTasks;
      }
      
      if (sewingLaborTasks.length > 0) {
        pendingTasks.sewingLabor = sewingLaborTasks;
      }
      
      if (powderCoatTasks.length > 0) {
        pendingTasks.powderCoat = powderCoatTasks;
      }
      
      if (installationTasks.length > 0) {
        pendingTasks.installation = installationTasks;
      }
      
      if (rentalEquipmentTasks.length > 0) {
        pendingTasks.rentalEquipment = rentalEquipmentTasks;
      }
      
      return addPhaseToJob(jobId, newPhase, pendingTasks);
    },
    onSuccess: () => {
      toast.success('Phase added successfully');
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['inProgressPhases'] });
      navigate(`/jobs/${jobId}`);
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to add phase';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPhaseMutation.mutate();
  };

  // Task handlers
  const addTaskToArea = (area: string, taskName: string) => {
    if (!taskName.trim()) return;
    
    switch (area) {
      case 'weldingMaterials':
        setWeldingMaterialTasks([...weldingMaterialTasks, taskName]);
        break;
      case 'sewingMaterials':
        setSewingMaterialTasks([...sewingMaterialTasks, taskName]);
        break;
      case 'installationMaterials':
        setInstallationMaterialTasks([...installationMaterialTasks, taskName]);
        break;
      case 'weldingLabor':
        setWeldingLaborTasks([...weldingLaborTasks, taskName]);
        break;
      case 'sewingLabor':
        setSewingLaborTasks([...sewingLaborTasks, taskName]);
        break;
      case 'powderCoat':
        setPowderCoatTasks([...powderCoatTasks, taskName]);
        break;
      case 'installation':
        setInstallationTasks([...installationTasks, taskName]);
        break;
      case 'rentalEquipment':
        setRentalEquipmentTasks([...rentalEquipmentTasks, taskName]);
        break;
    }
  };

  const removeTaskFromArea = (area: string, index: number) => {
    switch (area) {
      case 'weldingMaterials':
        setWeldingMaterialTasks(weldingMaterialTasks.filter((_, i) => i !== index));
        break;
      case 'sewingMaterials':
        setSewingMaterialTasks(sewingMaterialTasks.filter((_, i) => i !== index));
        break;
      case 'installationMaterials':
        setInstallationMaterialTasks(installationMaterialTasks.filter((_, i) => i !== index));
        break;
      case 'weldingLabor':
        setWeldingLaborTasks(weldingLaborTasks.filter((_, i) => i !== index));
        break;
      case 'sewingLabor':
        setSewingLaborTasks(sewingLaborTasks.filter((_, i) => i !== index));
        break;
      case 'powderCoat':
        setPowderCoatTasks(powderCoatTasks.filter((_, i) => i !== index));
        break;
      case 'installation':
        setInstallationTasks(installationTasks.filter((_, i) => i !== index));
        break;
      case 'rentalEquipment':
        setRentalEquipmentTasks(rentalEquipmentTasks.filter((_, i) => i !== index));
        break;
    }
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
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(`/jobs/${jobId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add New Phase
          </h1>
          <p className="text-muted-foreground">
            Job {job.jobNumber}: {job.projectName}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/jobs/${jobId}`)}
            disabled={addPhaseMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={addPhaseMutation.isPending}>
            {addPhaseMutation.isPending ? 'Adding...' : 'Add Phase'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PhaseForm;
