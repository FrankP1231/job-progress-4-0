import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getJobById, 
  createNewPhase, 
  addPhaseToJob 
} from '@/lib/supabase';
import { Job, MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PhaseForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Basic phase info
  const [phaseName, setPhaseName] = useState('');
  const [phaseNumber, setPhaseNumber] = useState('');
  
  // Welding materials
  const [weldingMaterialStatus, setWeldingMaterialStatus] = useState<MaterialStatus>('not-ordered');
  const [weldingMaterialNotes, setWeldingMaterialNotes] = useState('');
  
  // Sewing materials
  const [sewingMaterialStatus, setSewingMaterialStatus] = useState<MaterialStatus>('not-ordered');
  const [sewingMaterialNotes, setSewingMaterialNotes] = useState('');
  
  // Installation materials
  const [installationMaterialStatus, setInstallationMaterialStatus] = useState<MaterialStatus>('not-ordered');
  const [installationMaterialNotes, setInstallationMaterialNotes] = useState('');
  
  // Welding labor
  const [weldingLaborStatus, setWeldingLaborStatus] = useState<LaborStatus>('not-needed');
  const [weldingLaborNotes, setWeldingLaborNotes] = useState('');
  const [weldingLaborHours, setWeldingLaborHours] = useState('');
  
  // Sewing labor
  const [sewingLaborStatus, setSewingLaborStatus] = useState<LaborStatus>('not-needed');
  const [sewingLaborNotes, setSewingLaborNotes] = useState('');
  const [sewingLaborHours, setSewingLaborHours] = useState('');
  
  // Powder coat
  const [powderCoatStatus, setPowderCoatStatus] = useState<PowderCoatStatus>('not-needed');
  const [powderCoatNotes, setPowderCoatNotes] = useState('');
  const [powderCoatEta, setPowderCoatEta] = useState('');
  
  // Installation
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus>('not-started');
  const [crewMembersNeeded, setCrewMembersNeeded] = useState('2');
  const [crewHoursNeeded, setCrewHoursNeeded] = useState('4');
  const [siteReadyDate, setSiteReadyDate] = useState('');
  const [installDeadline, setInstallDeadline] = useState('');
  const [installNotes, setInstallNotes] = useState('');
  
  // Rental equipment
  const [rentalEquipmentStatus, setRentalEquipmentStatus] = useState<RentalEquipmentStatus>('not-needed');
  const [rentalEquipmentDetails, setRentalEquipmentDetails] = useState('');
  const [rentalEquipmentNotes, setRentalEquipmentNotes] = useState('');

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
          status: weldingMaterialStatus,
          notes: weldingMaterialNotes || undefined
        },
        sewingMaterials: {
          status: sewingMaterialStatus,
          notes: sewingMaterialNotes || undefined
        },
        installationMaterials: {
          status: installationMaterialStatus,
          notes: installationMaterialNotes || undefined
        },
        weldingLabor: {
          status: weldingLaborStatus,
          notes: weldingLaborNotes || undefined,
          hours: weldingLaborHours ? Number(weldingLaborHours) : undefined
        },
        sewingLabor: {
          status: sewingLaborStatus,
          notes: sewingLaborNotes || undefined,
          hours: sewingLaborHours ? Number(sewingLaborHours) : undefined
        },
        powderCoat: {
          status: powderCoatStatus,
          notes: powderCoatNotes || undefined,
          eta: powderCoatEta || undefined
        },
        installation: {
          status: installationStatus,
          crewMembersNeeded: Number(crewMembersNeeded),
          crewHoursNeeded: Number(crewHoursNeeded),
          siteReadyDate: siteReadyDate || undefined,
          installDeadline: installDeadline || undefined,
          notes: installNotes || undefined,
          rentalEquipment: {
            status: rentalEquipmentStatus,
            notes: rentalEquipmentNotes || undefined,
            details: rentalEquipmentDetails || undefined
          }
        }
      };
      
      return addPhaseToJob(jobId, newPhase);
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
              Details about welding materials and labor for this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Materials</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weldingMaterialStatus">Status</Label>
                    <Select 
                      value={weldingMaterialStatus} 
                      onValueChange={(value: MaterialStatus) => setWeldingMaterialStatus(value)}
                    >
                      <SelectTrigger id="weldingMaterialStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-needed">Not Needed</SelectItem>
                        <SelectItem value="not-ordered">Not Ordered</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weldingMaterialNotes">Notes</Label>
                    <Input
                      id="weldingMaterialNotes"
                      placeholder="Any special notes about materials"
                      value={weldingMaterialNotes}
                      onChange={(e) => setWeldingMaterialNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Labor</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="weldingLaborStatus">Status</Label>
                    <Select 
                      value={weldingLaborStatus} 
                      onValueChange={(value: LaborStatus) => setWeldingLaborStatus(value)}
                    >
                      <SelectTrigger id="weldingLaborStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-needed">Not Needed</SelectItem>
                        <SelectItem value="estimated">Estimated</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weldingLaborHours">Hours</Label>
                    <Input
                      id="weldingLaborHours"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Estimated hours"
                      value={weldingLaborHours}
                      onChange={(e) => setWeldingLaborHours(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weldingLaborNotes">Notes</Label>
                    <Input
                      id="weldingLaborNotes"
                      placeholder="Any special notes about labor"
                      value={weldingLaborNotes}
                      onChange={(e) => setWeldingLaborNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sewing</CardTitle>
            <CardDescription>
              Details about sewing materials and labor for this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Materials</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sewingMaterialStatus">Status</Label>
                    <Select 
                      value={sewingMaterialStatus} 
                      onValueChange={(value: MaterialStatus) => setSewingMaterialStatus(value)}
                    >
                      <SelectTrigger id="sewingMaterialStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-needed">Not Needed</SelectItem>
                        <SelectItem value="not-ordered">Not Ordered</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sewingMaterialNotes">Notes</Label>
                    <Input
                      id="sewingMaterialNotes"
                      placeholder="Any special notes about materials"
                      value={sewingMaterialNotes}
                      onChange={(e) => setSewingMaterialNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Labor</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="sewingLaborStatus">Status</Label>
                    <Select 
                      value={sewingLaborStatus} 
                      onValueChange={(value: LaborStatus) => setSewingLaborStatus(value)}
                    >
                      <SelectTrigger id="sewingLaborStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-needed">Not Needed</SelectItem>
                        <SelectItem value="estimated">Estimated</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sewingLaborHours">Hours</Label>
                    <Input
                      id="sewingLaborHours"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Estimated hours"
                      value={sewingLaborHours}
                      onChange={(e) => setSewingLaborHours(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sewingLaborNotes">Notes</Label>
                    <Input
                      id="sewingLaborNotes"
                      placeholder="Any special notes about labor"
                      value={sewingLaborNotes}
                      onChange={(e) => setSewingLaborNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Powder Coat</CardTitle>
            <CardDescription>
              Details about powder coating for this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="powderCoatStatus">Status</Label>
                <Select 
                  value={powderCoatStatus} 
                  onValueChange={(value: PowderCoatStatus) => setPowderCoatStatus(value)}
                >
                  <SelectTrigger id="powderCoatStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-needed">Not Needed</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="powderCoatEta">ETA</Label>
                <Input
                  id="powderCoatEta"
                  type="date"
                  value={powderCoatEta}
                  onChange={(e) => setPowderCoatEta(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="powderCoatNotes">Notes</Label>
                <Input
                  id="powderCoatNotes"
                  placeholder="Any special notes about powder coating"
                  value={powderCoatNotes}
                  onChange={(e) => setPowderCoatNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Installation</CardTitle>
            <CardDescription>
              Details about the installation of this phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Installation Status</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="installationStatus">Status</Label>
                    <Select 
                      value={installationStatus} 
                      onValueChange={(value: InstallationStatus) => setInstallationStatus(value)}
                    >
                      <SelectTrigger id="installationStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Materials</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="installationMaterialStatus">Status</Label>
                    <Select 
                      value={installationMaterialStatus} 
                      onValueChange={(value: MaterialStatus) => setInstallationMaterialStatus(value)}
                    >
                      <SelectTrigger id="installationMaterialStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-needed">Not Needed</SelectItem>
                        <SelectItem value="not-ordered">Not Ordered</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="installationMaterialNotes">Notes</Label>
                    <Input
                      id="installationMaterialNotes"
                      placeholder="Any special notes about materials"
                      value={installationMaterialNotes}
                      onChange={(e) => setInstallationMaterialNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Crew Information</h3>
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
                <h3 className="text-lg font-medium mb-4">Schedule</h3>
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
                <h3 className="text-lg font-medium mb-4">Rental Equipment</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="rentalEquipmentStatus">Status</Label>
                    <Select 
                      value={rentalEquipmentStatus} 
                      onValueChange={(value: RentalEquipmentStatus) => setRentalEquipmentStatus(value)}
                    >
                      <SelectTrigger id="rentalEquipmentStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-needed">Not Needed</SelectItem>
                        <SelectItem value="not-ordered">Not Ordered</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rentalEquipmentDetails">Details</Label>
                    <Input
                      id="rentalEquipmentDetails"
                      placeholder="Equipment type and size"
                      value={rentalEquipmentDetails}
                      onChange={(e) => setRentalEquipmentDetails(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rentalEquipmentNotes">Notes</Label>
                    <Input
                      id="rentalEquipmentNotes"
                      placeholder="Any special notes about rental equipment"
                      value={rentalEquipmentNotes}
                      onChange={(e) => setRentalEquipmentNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Additional Notes</h3>
                <div className="space-y-2">
                  <Label htmlFor="installNotes">Installation Notes</Label>
                  <Input
                    id="installNotes"
                    placeholder="Any special notes about the installation"
                    value={installNotes}
                    onChange={(e) => setInstallNotes(e.target.value)}
                  />
                </div>
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
