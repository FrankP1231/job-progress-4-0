
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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

interface StatusOption {
  value: MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus;
  label: string;
}

interface StatusUpdateButtonProps {
  jobId: string;
  phaseId: string;
  statusType: StatusType;
  fieldPath: string;
  currentStatus: MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus;
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

  const handleStatusUpdate = async (newStatus: MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus) => {
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
      
      toast.success(`Status updated successfully to ${getStatusLabel(newStatus, options)}`);
      
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
    status: MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus,
    options: StatusOption[]
  ) => {
    return options.find(option => option.value === status)?.label || status;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="flex items-center">
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-opacity-20 border-t-primary rounded-full" />
              Updating...
            </span>
          ) : (
            <span className="flex items-center">
              Change Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
            className="flex justify-between items-center"
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
