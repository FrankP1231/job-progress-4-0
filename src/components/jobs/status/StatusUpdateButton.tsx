
import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updatePhase } from '@/lib/supabase/phaseUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MaterialStatus,
  LaborStatus,
  PowderCoatStatus,
  RentalEquipmentStatus,
} from '@/lib/types';

type StatusType = 'material' | 'labor' | 'powderCoat' | 'rental';
type StatusValue = MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus;

interface StatusOption {
  value: StatusValue;
  label: string;
}

interface StatusUpdateButtonProps {
  jobId: string;
  phaseId: string;
  statusType: StatusType;
  fieldPath: string;
  currentStatus: StatusValue;
  options: StatusOption[];
  onSuccess?: () => void;
}

const StatusUpdateButton: React.FC<StatusUpdateButtonProps> = ({
  jobId,
  phaseId,
  statusType,
  fieldPath,
  currentStatus,
  options,
  onSuccess,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<StatusValue>(currentStatus);
  const queryClient = useQueryClient();

  // Update local state when currentStatus changes (from parent)
  React.useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusUpdate = async (newStatus: StatusValue) => {
    if (newStatus === status) return;
    
    setIsUpdating(true);
    try {
      // Create update data with the nested structure based on fieldPath
      // e.g., "weldingMaterials.status" => { weldingMaterials: { status: newStatus }}
      const pathParts = fieldPath.split('.');
      let updateData: any = {};
      
      if (pathParts.length === 2) {
        // Handle nested object like weldingMaterials.status
        updateData[pathParts[0]] = {
          ...updateData[pathParts[0]],
          [pathParts[1]]: newStatus
        };
      } else if (pathParts.length === 3) {
        // Handle deeper nested objects like installation.rentalEquipment.status
        updateData[pathParts[0]] = {
          ...updateData[pathParts[0]],
          [pathParts[1]]: {
            [pathParts[2]]: newStatus
          }
        };
      } else {
        // Simple case like powderCoat.status
        updateData[fieldPath] = newStatus;
      }
      
      await updatePhase(jobId, phaseId, updateData);
      
      // Immediately update the local state
      setStatus(newStatus);
      
      // Invalidate both phase and job queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['phase', jobId, phaseId] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      
      toast.success(`Status updated to ${getStatusLabel(newStatus, options)}`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      // Revert to original status on error
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusLabel = (
    status: StatusValue,
    options: StatusOption[]
  ) => {
    return options.find(option => option.value === status)?.label || status;
  };

  // Get the current status label
  const currentStatusLabel = getStatusLabel(status, options);
  
  // Get status color class based on status value
  const getStatusColorClass = (status: StatusValue): string => {
    switch (status) {
      case 'not-needed':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'not-ordered':
      case 'not-started':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'ordered':
        return 'bg-amber-300 hover:bg-amber-400 text-amber-900';
      case 'received':
      case 'complete':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'estimated':
      case 'in-progress':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      default:
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`rounded-md px-3 py-1 text-sm font-medium flex items-center transition-colors ${getStatusColorClass(status)}`}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="flex items-center">
              <div className="animate-spin h-3 w-3 mr-2 border-2 border-current border-opacity-20 border-t-current rounded-full" />
              Updating...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              {currentStatusLabel}
              <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
            className="flex justify-between items-center"
            disabled={isUpdating}
          >
            {option.label}
            {status === option.value && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusUpdateButton;
