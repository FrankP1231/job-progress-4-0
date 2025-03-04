
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getJobById, 
  createNewPhase, 
  addPhaseToJob 
} from '@/lib/jobUtils';
import { Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const PhaseForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [phaseName, setPhaseName] = useState('');
  const [phaseNumber, setPhaseNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const foundJob = getJobById(jobId);
      
      if (foundJob) {
        setJob(foundJob);
        
        // Set default phase number (next available)
        const existingPhaseNumbers = foundJob.phases.map(p => p.phaseNumber);
        const nextPhaseNumber = existingPhaseNumbers.length > 0 
          ? Math.max(...existingPhaseNumbers) + 1 
          : 1;
        setPhaseNumber(nextPhaseNumber.toString());
      } else {
        toast.error('Job not found');
        navigate('/dashboard');
      }
      
      setLoading(false);
    }, 300);
  }, [jobId, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId || !job) return;
    
    if (!phaseName.trim()) {
      toast.error('Please enter a phase name');
      return;
    }
    
    if (!phaseNumber.trim() || isNaN(Number(phaseNumber)) || Number(phaseNumber) <= 0) {
      toast.error('Please enter a valid phase number');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const newPhase = createNewPhase(jobId, phaseName, Number(phaseNumber));
      const success = addPhaseToJob(jobId, newPhase);
      
      if (success) {
        toast.success('Phase added successfully');
        navigate(`/jobs/${jobId}`);
      } else {
        toast.error('Failed to add phase');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setSubmitting(false);
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
      
      <Card>
        <CardHeader>
          <CardTitle>Phase Information</CardTitle>
          <CardDescription>
            Enter the basic information for this phase of the project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/jobs/${jobId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Phase'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhaseForm;
