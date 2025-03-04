
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, createNewPhase, addPhaseToJob } from '@/lib/jobUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { Job } from '@/lib/types';
import { Label } from '@/components/ui/label';

const PhaseForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    phaseName: '',
    phaseNumber: 1,
    weldingMaterials: 'not-ordered',
    sewingMaterials: 'not-ordered',
    weldingLabor: 'not-needed',
    sewingLabor: 'not-needed',
    installationMaterials: 'not-ordered',
    powderCoat: 'not-needed',
    crewMembersNeeded: 2,
    crewHoursNeeded: 4,
    rentalEquipment: 'not-needed',
    siteReadyDate: '',
    installDeadline: '',
  });

  useEffect(() => {
    if (jobId) {
      const foundJob = getJobById(jobId);
      if (foundJob) {
        setJob(foundJob);
        
        // Set the phase number to be one higher than the highest existing phase
        if (foundJob.phases.length > 0) {
          const highestPhaseNumber = Math.max(...foundJob.phases.map(p => p.phaseNumber));
          setFormData(prev => ({ ...prev, phaseNumber: highestPhaseNumber + 1 }));
        }
      } else {
        toast.error('Job not found');
        navigate('/dashboard');
      }
    }
    setLoading(false);
  }, [jobId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !jobId) {
      toast.error('Job not found');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a new phase with the form data
      const newPhase = createNewPhase(jobId, formData.phaseName, formData.phaseNumber);
      
      // Update the phase with form values
      newPhase.weldingMaterials.status = formData.weldingMaterials as any;
      newPhase.sewingMaterials.status = formData.sewingMaterials as any;
      newPhase.weldingLabor.status = formData.weldingLabor as any;
      newPhase.sewingLabor.status = formData.sewingLabor as any;
      newPhase.installationMaterials.status = formData.installationMaterials as any;
      newPhase.powderCoat.status = formData.powderCoat as any;
      
      newPhase.installation.crewMembersNeeded = formData.crewMembersNeeded;
      newPhase.installation.crewHoursNeeded = formData.crewHoursNeeded;
      newPhase.installation.rentalEquipment.status = formData.rentalEquipment as any;
      
      if (formData.siteReadyDate) {
        newPhase.installation.siteReadyDate = new Date(formData.siteReadyDate).toISOString();
      }
      
      if (formData.installDeadline) {
        newPhase.installation.installDeadline = new Date(formData.installDeadline).toISOString();
      }
      
      // Add the phase to the job
      const success = addPhaseToJob(jobId, newPhase);
      
      if (success) {
        toast.success('Phase added successfully');
        
        // Navigate back to the job detail page
        setTimeout(() => {
          navigate(`/jobs/${jobId}`);
        }, 500);
      } else {
        toast.error('Failed to add phase');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Failed to add phase:', error);
      toast.error('An error occurred while adding the phase');
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="inline-block text-2xl font-bold">
            Add Phase to Job: {job.jobNumber}
          </h1>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Phase Details</CardTitle>
            <CardDescription>
              Enter the details for this installation phase
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phaseName">Phase Name *</Label>
                <Input
                  id="phaseName"
                  name="phaseName"
                  value={formData.phaseName}
                  onChange={handleChange}
                  placeholder="e.g., Front Entrance Canopy"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phaseNumber">Phase Number *</Label>
                <Input
                  id="phaseNumber"
                  name="phaseNumber"
                  type="number"
                  min="1"
                  value={formData.phaseNumber}
                  onChange={handleNumberChange}
                  required
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Production Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weldingMaterials">Welding Materials</Label>
                  <Select 
                    value={formData.weldingMaterials} 
                    onValueChange={(value) => handleSelectChange('weldingMaterials', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-needed">Not Needed</SelectItem>
                      <SelectItem value="not-ordered">Not Yet Ordered</SelectItem>
                      <SelectItem value="ordered">Ordered / ETA</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sewingMaterials">Sewing Materials</Label>
                  <Select 
                    value={formData.sewingMaterials} 
                    onValueChange={(value) => handleSelectChange('sewingMaterials', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-needed">Not Needed</SelectItem>
                      <SelectItem value="not-ordered">Not Yet Ordered</SelectItem>
                      <SelectItem value="ordered">Ordered / ETA</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weldingLabor">Welding Labor</Label>
                  <Select 
                    value={formData.weldingLabor} 
                    onValueChange={(value) => handleSelectChange('weldingLabor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-needed">Not Needed</SelectItem>
                      <SelectItem value="estimated">Estimated Hours</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sewingLabor">Sewing Labor</Label>
                  <Select 
                    value={formData.sewingLabor} 
                    onValueChange={(value) => handleSelectChange('sewingLabor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-needed">Not Needed</SelectItem>
                      <SelectItem value="estimated">Estimated Hours</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="installationMaterials">Installation Materials</Label>
                  <Select 
                    value={formData.installationMaterials} 
                    onValueChange={(value) => handleSelectChange('installationMaterials', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-needed">Not Needed</SelectItem>
                      <SelectItem value="not-ordered">Not Yet Ordered</SelectItem>
                      <SelectItem value="ordered">Ordered / ETA</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="powderCoat">Powder Coat</Label>
                  <Select 
                    value={formData.powderCoat} 
                    onValueChange={(value) => handleSelectChange('powderCoat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-needed">Not Needed</SelectItem>
                      <SelectItem value="not-started">Not Yet Started</SelectItem>
                      <SelectItem value="in-progress">In Progress / ETC</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Installation Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crewMembersNeeded">Crew Members Needed</Label>
                  <Input
                    id="crewMembersNeeded"
                    name="crewMembersNeeded"
                    type="number"
                    min="1"
                    value={formData.crewMembersNeeded}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crewHoursNeeded">Crew Hours Needed</Label>
                  <Input
                    id="crewHoursNeeded"
                    name="crewHoursNeeded"
                    type="number"
                    min="1"
                    value={formData.crewHoursNeeded}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteReadyDate">
                    Site Ready Date
                    <Calendar className="inline-block ml-2 h-4 w-4 text-muted-foreground" />
                  </Label>
                  <Input
                    id="siteReadyDate"
                    name="siteReadyDate"
                    type="date"
                    value={formData.siteReadyDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="installDeadline">
                    Install Deadline
                    <Calendar className="inline-block ml-2 h-4 w-4 text-muted-foreground" />
                  </Label>
                  <Input
                    id="installDeadline"
                    name="installDeadline"
                    type="date"
                    value={formData.installDeadline}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rentalEquipment">Rental Equipment</Label>
                  <Select 
                    value={formData.rentalEquipment} 
                    onValueChange={(value) => handleSelectChange('rentalEquipment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-needed">Not Needed</SelectItem>
                      <SelectItem value="not-ordered">Not Yet Ordered</SelectItem>
                      <SelectItem value="ordered">Ordered & Called Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/jobs/${jobId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-white border-opacity-20 rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Add Phase
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PhaseForm;
