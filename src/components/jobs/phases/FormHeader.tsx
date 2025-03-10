
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Job } from '@/lib/types';

interface FormHeaderProps {
  job: Job;
}

const FormHeader: React.FC<FormHeaderProps> = ({ job }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center">
      <Button variant="outline" size="icon" className="mr-2" onClick={() => navigate(`/jobs/${job.id}`)}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Add New Phase
        </h1>
        <p className="text-muted-foreground">
          Job {job?.jobNumber}: {job?.projectName}
        </p>
      </div>
    </div>
  );
};

export default FormHeader;
