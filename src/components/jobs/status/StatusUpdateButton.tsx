
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
  const queryClient = useQueryClient();

  const handleStatusUpdate = async (newStatus: StatusValue) => {
    if (newStatus === currentStatus) return;
    
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
  const currentStatusLabel = getStatusLabel(currentStatus, options);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer">
          <div className="bg-gray-200 text-gray-800 rounded-md px-3 py-1 text-sm font-medium flex items-center">
            {isUpdating ? (
              <span className="flex items-center">
                <div className="animate-spin h-3 w-3 mr-2 border-2 border-primary border-opacity-20 border-t-primary rounded-full" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                {currentStatusLabel}
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </span>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
            className="flex justify-between items-center"
            disabled={isUpdating}
          >
            {option.label}
            {currentStatus === option.value && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusUpdateButton;
