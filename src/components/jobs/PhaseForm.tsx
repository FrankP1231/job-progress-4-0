
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getJobById, 
  createNewPhase, 
  addPhaseToJob 
} from '@/lib/supabase';
import { Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TasksContainer from '@/components/production/TasksContainer';

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
      
      const newPhase = {
        ...createNewPhase(jobId, phaseName, Number(phaseNumber)),
        weldingMaterials: {
          status: 'not-ordered'
        },
        sewingMaterials: {
          status: 'not-ordered'
        },
        installationMaterials: {
          status: 'not-ordered'
        },
        weldingLabor: {
          status: 'not-needed',
          hours: 0
        },
        sewingLabor: {
          status: 'not-needed',
          hours: 0
        },
        powderCoat: {
          status: 'not-needed',
          eta: powderCoatEta || undefined,
          notes: powderCoatNotes || undefined
        },
        installation: {
          status: 'not-started',
          crewMembersNeeded: Number(crewMembersNeeded),
          crewHoursNeeded: Number(crewHoursNeeded),
          siteReadyDate: siteReadyDate || undefined,
          installDeadline: installDeadline || undefined,
          notes: installNotes || undefined,
          rentalEquipment: {
            status: 'not-needed'
          }
        }
      };
      
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

  // Render a task list preview
  const renderTasksList = (tasks: string[], area: string) => {
    return (
      <div className="space-y-2 mt-2">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <span className="text-sm">{task}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => removeTaskFromArea(area, index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              const taskName = prompt('Enter task name:');
              if (taskName) addTaskToArea(area, taskName);
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Task
          </Button>
        </div>
      </div>
    );
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
        <Card>
          <CardHeader>
            <CardTitle>Phase Information</CardTitle>
            <CardDescription>
              Enter the basic information for this phase of the project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phaseName">Phase Name</Label>
                <Input
                  id="phaseName"
                  placeholder="e.g., Front Entrance Awning"
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phaseNumber">Phase Number</Label>
                <Input
                  id="phaseNumber"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g., 1"
                  value={phaseNumber}
                  onChange={(e) => setPhaseNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Welding</CardTitle>
            <CardDescription>
              Add tasks for welding materials and labor for this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Materials</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks for welding materials. Status will be determined by task completion.
                </p>
                {renderTasksList(weldingMaterialTasks, 'weldingMaterials')}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Labor</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks for welding labor. Status will be determined by task completion.
                </p>
                {renderTasksList(weldingLaborTasks, 'weldingLabor')}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sewing</CardTitle>
            <CardDescription>
              Add tasks for sewing materials and labor for this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Materials</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks for sewing materials. Status will be determined by task completion.
                </p>
                {renderTasksList(sewingMaterialTasks, 'sewingMaterials')}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Labor</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks for sewing labor. Status will be determined by task completion.
                </p>
                {renderTasksList(sewingLaborTasks, 'sewingLabor')}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Powder Coat</CardTitle>
            <CardDescription>
              Add tasks and details for powder coating this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="powderCoatEta">Expected Completion Date (Optional)</Label>
                <Input
                  id="powderCoatEta"
                  type="date"
                  value={powderCoatEta}
                  onChange={(e) => setPowderCoatEta(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="powderCoatNotes">Notes (Optional)</Label>
                <Input
                  id="powderCoatNotes"
                  placeholder="Any special notes about powder coating"
                  value={powderCoatNotes}
                  onChange={(e) => setPowderCoatNotes(e.target.value)}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Tasks</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks for powder coating. Status will be determined by task completion.
                </p>
                {renderTasksList(powderCoatTasks, 'powderCoat')}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Installation</CardTitle>
            <CardDescription>
              Add tasks and details for installation of this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Installation Materials</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks for installation materials. Status will be determined by task completion.
                </p>
                {renderTasksList(installationMaterialTasks, 'installationMaterials')}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Crew Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="crewMembersNeeded">Crew Members Needed</Label>
                    <Input
                      id="crewMembersNeeded"
                      type="number"
                      min="1"
                      placeholder="Number of crew members"
                      value={crewMembersNeeded}
                      onChange={(e) => setCrewMembersNeeded(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="crewHoursNeeded">Crew Hours Needed</Label>
                    <Input
                      id="crewHoursNeeded"
                      type="number"
                      min="0.5"
                      step="0.5"
                      placeholder="Estimated hours"
                      value={crewHoursNeeded}
                      onChange={(e) => setCrewHoursNeeded(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Schedule</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteReadyDate">Site Ready Date</Label>
                    <Input
                      id="siteReadyDate"
                      type="date"
                      value={siteReadyDate}
                      onChange={(e) => setSiteReadyDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="installDeadline">Installation Deadline</Label>
                    <Input
                      id="installDeadline"
                      type="date"
                      value={installDeadline}
                      onChange={(e) => setInstallDeadline(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Installation Tasks</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks for the installation process. Status will be determined by task completion.
                </p>
                {renderTasksList(installationTasks, 'installation')}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Rental Equipment</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add specific tasks related to rental equipment. Status will be determined by task completion.
                </p>
                {renderTasksList(rentalEquipmentTasks, 'rentalEquipment')}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="installNotes">Additional Notes (Optional)</Label>
                <Input
                  id="installNotes"
                  placeholder="Any special notes about the installation"
                  value={installNotes}
                  onChange={(e) => setInstallNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
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
