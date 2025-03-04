
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, getPhaseById, updatePhase } from '@/lib/jobUtils';
import { Phase, Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const PhaseDetail: React.FC = () => {
  const { jobId, phaseId } = useParams<{ jobId: string, phaseId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId || !phaseId) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const foundJob = getJobById(jobId);
      
      if (foundJob) {
        setJob(foundJob);
        
        const foundPhase = getPhaseById(jobId, phaseId);
        if (foundPhase) {
          setPhase(foundPhase);
        } else {
          toast.error('Phase not found');
          navigate(`/jobs/${jobId}`);
        }
      } else {
        toast.error('Job not found');
        navigate('/dashboard');
      }
      
      setLoading(false);
    }, 300);
  }, [jobId, phaseId, navigate]);

  if (loading) {
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
        <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(`/jobs/${jobId}`)}>
          <ArrowLeft className="h-4 w-4" />
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
      
      <Card>
        <CardHeader>
          <CardTitle>Phase Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Detailed phase editing will be implemented soon.
          </p>
          
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate(`/jobs/${jobId}`)}>
              Return to Job
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhaseDetail;
