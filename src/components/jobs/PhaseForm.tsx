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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PhaseForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phaseName, setPhaseName] = useState('');
  const [phaseNumber, setPhaseNumber] = useState('');

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
      
      const newPhase = createNewPhase(jobId, phaseName, Number(phaseNumber));
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
                disabled={addPhaseMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addPhaseMutation.isPending}>
                {addPhaseMutation.isPending ? 'Adding...' : 'Add Phase'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhaseForm;
