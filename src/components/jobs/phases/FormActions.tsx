
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FormActionsProps {
  jobId: string;
  isPending: boolean;
  isSubmitting: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  jobId, 
  isPending, 
  isSubmitting 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate(`/jobs/${jobId}`)}
        disabled={isPending || isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isPending || isSubmitting}
      >
        {isPending || isSubmitting ? 'Adding...' : 'Add Phase'}
      </Button>
    </div>
  );
};

export default FormActions;
