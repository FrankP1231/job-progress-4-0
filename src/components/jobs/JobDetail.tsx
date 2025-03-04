
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, deleteJob } from '@/lib/jobUtils';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Job } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Package, Plus, Trash, FileText, Link2, ArrowLeft, Pencil } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/jobUtils';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      const foundJob = getJobById(jobId);
      if (foundJob) {
        setJob(foundJob);
      } else {
        toast.error('Job not found');
        navigate('/dashboard');
      }
    }
    setLoading(false);
  }, [jobId, navigate]);

  const handleDeleteJob = () => {
    if (jobId) {
      deleteJob(jobId);
      toast.success('Job deleted successfully');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Job not found</h2>
          <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist or has been deleted.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" />
              <span>Job: {job.jobNumber}</span>
            </h1>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button asChild variant="outline">
              <Link to={`/jobs/${job.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Job
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete job 
                    <strong> {job.jobNumber} - {job.projectName}</strong> and all its phases.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Project Name</p>
                <p className="font-medium">{job.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Buyer</p>
                <p className="font-medium">{job.buyer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salesman</p>
                <p className="font-medium">{job.salesman}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calendar Title</p>
                <p className="font-medium">{job.title}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Links & Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Drawings</p>
                {job.drawingsUrl ? (
                  <a 
                    href={job.drawingsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View Drawings
                  </a>
                ) : (
                  <p className="text-muted-foreground italic">No drawings URL provided</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Worksheet</p>
                {job.worksheetUrl ? (
                  <a 
                    href={job.worksheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <Link2 className="h-4 w-4" />
                    View Worksheet
                  </a>
                ) : (
                  <p className="text-muted-foreground italic">No worksheet URL provided</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Phases</p>
                <p className="font-medium">{job.phases.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(job.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(job.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold">Phases</h2>
            
            <Button asChild>
              <Link to={`/jobs/${job.id}/phases/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Phase
              </Link>
            </Button>
          </div>
          
          {job.phases.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-medium">Phase #</th>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Welding Materials</th>
                        <th className="text-left p-3 font-medium">Sewing Materials</th>
                        <th className="text-left p-3 font-medium">Install Deadline</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.phases.map((phase) => (
                        <tr key={phase.id} className="border-t hover:bg-muted/30">
                          <td className="p-3 font-medium">Phase {phase.phaseNumber}</td>
                          <td className="p-3">{phase.phaseName}</td>
                          <td className="p-3">
                            <StatusBadge status={phase.status} />
                          </td>
                          <td className="p-3">
                            <StatusBadge status={phase.weldingMaterials.status} />
                          </td>
                          <td className="p-3">
                            <StatusBadge status={phase.sewingMaterials.status} />
                          </td>
                          <td className="p-3">{formatDate(phase.installation.installDeadline)}</td>
                          <td className="p-3 text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No phases have been added to this job yet.</p>
                <Button asChild>
                  <Link to={`/jobs/${job.id}/phases/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Phase
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
