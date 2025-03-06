
import React, { useState } from 'react';
import { Job } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { updateJob } from '@/lib/supabaseUtils';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface JobDetailsEditCardProps {
  job: Job;
  onCancelEdit: () => void;
}

const JobDetailsEditCard: React.FC<JobDetailsEditCardProps> = ({ job, onCancelEdit }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    jobNumber: job.jobNumber,
    projectName: job.projectName,
    buyer: job.buyer,
    title: job.title || '',
    salesman: job.salesman,
    drawingsUrl: job.drawingsUrl || '',
    worksheetUrl: job.worksheetUrl || '',
  });

  const updateJobMutation = useMutation({
    mutationFn: (data: typeof formData) => updateJob(job.id, data),
    onSuccess: () => {
      toast.success('Job updated successfully');
      queryClient.invalidateQueries({ queryKey: ['job', job.id] });
      onCancelEdit();
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update job';
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
    
    updateJobMutation.mutate(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Job Details</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={onCancelEdit}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobNumber">Job Number *</Label>
              <Input
                id="jobNumber"
                name="jobNumber"
                value={formData.jobNumber}
                onChange={handleChange}
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
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salesman">Project Manager *</Label>
              <Input
                id="salesman"
                name="salesman"
                value={formData.salesman}
                onChange={handleChange}
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="drawingsUrl">Drawings URL</Label>
              <Input
                id="drawingsUrl"
                name="drawingsUrl"
                value={formData.drawingsUrl}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="worksheetUrl">Worksheet URL</Label>
              <Input
                id="worksheetUrl"
                name="worksheetUrl"
                value={formData.worksheetUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={updateJobMutation.isPending}
          >
            Cancel
          </Button>
          
          <Button type="submit" disabled={updateJobMutation.isPending}>
            {updateJobMutation.isPending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-opacity-20 rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JobDetailsEditCard;
