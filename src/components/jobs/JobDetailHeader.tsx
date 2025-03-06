
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Job } from '@/lib/types';
import { ArrowLeft, PlusCircle, FileEdit } from 'lucide-react';

interface JobDetailHeaderProps {
  job: Job;
  onToggleEdit: () => void;
  isEditing: boolean;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({ job, onToggleEdit, isEditing }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {job.jobNumber}: {job.projectName}
          </h1>
          <p className="text-muted-foreground">
            Created {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant={isEditing ? "secondary" : "outline"} 
          onClick={onToggleEdit}
        >
          <FileEdit className="mr-2 h-4 w-4" />
          {isEditing ? "Cancel Editing" : "Edit Job"}
        </Button>
        <Button asChild>
          <div onClick={() => navigate(`/jobs/${job.id}/phases/new`)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Phase
          </div>
        </Button>
      </div>
    </div>
  );
};

export default JobDetailHeader;
