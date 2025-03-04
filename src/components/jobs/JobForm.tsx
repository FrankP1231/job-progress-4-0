
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewJob, saveJob } from '@/lib/jobUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Package, Save, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

const JobForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobNumber: '',
    projectName: '',
    buyer: '',
    title: '',
    salesman: '',
    drawingsUrl: '',
    worksheetUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create new job with the form data
      const newJob = createNewJob(
        formData.jobNumber,
        formData.projectName,
        formData.buyer,
        formData.title || formData.projectName, // Default title to project name if not provided
        formData.salesman
      );

      // Add optional URLs
      if (formData.drawingsUrl) newJob.drawingsUrl = formData.drawingsUrl;
      if (formData.worksheetUrl) newJob.worksheetUrl = formData.worksheetUrl;

      // Save the job
      saveJob(newJob);

      toast.success('Job created successfully');
      
      // Wait a moment then navigate to the new job
      setTimeout(() => {
        navigate(`/jobs/${newJob.id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          <span>Create New Job</span>
        </h1>
        
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Enter the basic information for this job
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobNumber">Job Number *</Label>
                <Input
                  id="jobNumber"
                  name="jobNumber"
                  value={formData.jobNumber}
                  onChange={handleChange}
                  placeholder="Enter unique job number"
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
                  placeholder="Enter project name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyer">Buyer *</Label>
                <Input
                  id="buyer"
                  name="buyer"
                  value={formData.buyer}
                  onChange={handleChange}
                  placeholder="Enter buyer name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salesman">Salesman *</Label>
                <Input
                  id="salesman"
                  name="salesman"
                  value={formData.salesman}
                  onChange={handleChange}
                  placeholder="Enter salesman name"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Calendar Title (Optional)</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter calendar title (defaults to project name)"
              />
              <p className="text-xs text-muted-foreground">
                This will be used for Outlook calendar entries. If left blank, project name will be used.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="drawingsUrl">Drawings URL (Optional)</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </span>
                <Input
                  id="drawingsUrl"
                  name="drawingsUrl"
                  value={formData.drawingsUrl}
                  onChange={handleChange}
                  placeholder="Enter drawings URL"
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="worksheetUrl">Worksheet URL (Optional)</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </span>
                <Input
                  id="worksheetUrl"
                  name="worksheetUrl"
                  value={formData.worksheetUrl}
                  onChange={handleChange}
                  placeholder="Enter worksheet URL"
                  className="rounded-l-none"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
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
