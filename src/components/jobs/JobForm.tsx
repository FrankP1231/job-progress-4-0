
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const JobForm: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    jobNumber: '',
    projectName: '',
    buyer: '',
    title: '',
    salesman: '',
    drawingsUrl: '',
    worksheetUrl: ''
  });

  const createJobMutation = useMutation({
    mutationFn: (data: typeof formData) => createJob(data),
    onSuccess: (newJob) => {
      toast.success('Job created successfully');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setTimeout(() => {
        navigate(`/jobs/${newJob.id}`);
      }, 500);
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to create job';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobNumber || !formData.projectName || !formData.buyer || !formData.salesman) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    createJobMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Enter the basic information for this new project
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobNumber">Job Number *</Label>
                <Input
                  id="jobNumber"
                  name="jobNumber"
                  value={formData.jobNumber}
                  onChange={handleChange}
                  placeholder="e.g., J2023-001"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g., Main Street Cafe Awnings"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buyer">Buyer/Client *</Label>
                <Input
                  id="buyer"
                  name="buyer"
                  value={formData.buyer}
                  onChange={handleChange}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Calendar Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Cafe Awning Installation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salesman">Salesperson *</Label>
                <Input
                  id="salesman"
                  name="salesman"
                  value={formData.salesman}
                  onChange={handleChange}
                  placeholder="e.g., Sarah Johnson"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="drawingsUrl">Drawings URL</Label>
              <Input
                id="drawingsUrl"
                name="drawingsUrl"
                value={formData.drawingsUrl}
                onChange={handleChange}
                placeholder="e.g., https://drive.google.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="worksheetUrl">Worksheet URL</Label>
              <Input
                id="worksheetUrl"
                name="worksheetUrl"
                value={formData.worksheetUrl}
                onChange={handleChange}
                placeholder="e.g., https://drive.google.com/..."
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={createJobMutation.isPending}
            >
              Cancel
            </Button>
            
            <Button type="submit" disabled={createJobMutation.isPending}>
              {createJobMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-opacity-20 rounded-full" />
                  Creating Job...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Job
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default JobForm;
