
import React, { useState } from 'react';
import {
  MaterialStatus,
  LaborStatus,
  PowderCoatStatus,
  RentalEquipmentStatus,
  InstallationStatus
} from '@/lib/types';
import { updatePhaseStatus } from '@/lib/supabase';
import { logActivity } from '@/lib/supabase/activityLogUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type StatusType = 'material' | 'labor' | 'powderCoat' | 'rental' | 'installation';

export interface StatusUpdateButtonProps {
  jobId: string;
  phaseId: string;
  statusType: StatusType;
  fieldPath: string;
  currentStatus: MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus | InstallationStatus;
  currentEta?: string;
  currentHours?: number;
  options: { value: string; label: string }[];
  onStatusChange?: (newStatus: string) => Record<string, any> | void;
}

const StatusUpdateButton: React.FC<StatusUpdateButtonProps> = ({
  jobId,
  phaseId,
  statusType,
  fieldPath,
  currentStatus,
  currentEta,
  currentHours,
  options,
  onStatusChange
}) => {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [eta, setEta] = useState(currentEta || '');
  const [hours, setHours] = useState(currentHours || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Enhanced check for status string that handles all edge cases
  let statusString = 'not-started';
  
  if (typeof currentStatus === 'string') {
    statusString = currentStatus;
  } else if (currentStatus && typeof currentStatus === 'object') {
    // Safe type check and access
    const statusObject = currentStatus as any;
    if (statusObject && 'status' in statusObject && statusObject.status !== undefined) {
      statusString = String(statusObject.status);
    }
  }

  const handleStatusChange = async () => {
    try {
      setIsSubmitting(true);
      
      // Create update data object based on status type
      let updateData: Record<string, any> = {};
      
      if (typeof newStatus === 'string') {
        updateData.status = newStatus;
      } else if (newStatus && typeof newStatus === 'object' && 'status' in newStatus) {
        updateData.status = (newStatus as any).status;
      } else {
        updateData.status = statusString;
      }

      if (statusType === 'material' || statusType === 'powderCoat') {
        updateData = { ...updateData, eta: eta };
      }

      if (statusType === 'labor') {
        updateData = { ...updateData, hours: hours };
      }

      // Store previous values before update for activity log
      const previousValue = {
        status: statusString,
        ...(statusType === 'material' || statusType === 'powderCoat' ? { eta: currentEta } : {}),
        ...(statusType === 'labor' ? { hours: currentHours } : {})
      };

      console.log(`Updating ${fieldPath} with data:`, updateData);
      await updatePhaseStatus(jobId, phaseId, fieldPath, updateData);
      
      // Log the activity
      const statusTypeName = {
        'material': 'Material',
        'labor': 'Labor',
        'powderCoat': 'Powder Coat',
        'rental': 'Rental Equipment',
        'installation': 'Installation'
      }[statusType];
      
      const newStatusString = typeof updateData.status === 'string' ? updateData.status : 'not-started';
      const description = `${statusTypeName} status updated from ${getDisplayStatusLabel(statusString)} to ${getDisplayStatusLabel(newStatusString)}`;
      
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['phase', jobId, phaseId] });
      queryClient.invalidateQueries({ queryKey: ['activities', jobId, phaseId] });
      queryClient.invalidateQueries({ queryKey: ['inProgressPhases'] });
      
      toast.success(`Phase ${statusType} status updated successfully.`);
      setOpen(false);

      if (onStatusChange) {
        onStatusChange(newStatusString);
      }
    } catch (error) {
      console.error("Error updating phase status:", error);
      toast.error("Failed to update phase status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get display label for a status value
  const getDisplayStatusLabel = (statusValue: string): string => {
    const option = options.find(opt => opt.value === statusValue);
    return option ? option.label : statusValue;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer transition-opacity hover:opacity-90 inline-block">
          <StatusBadge status={statusString as any} className="w-full justify-center" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update {statusType} Status</DialogTitle>
          <DialogDescription>
            Change the status and related details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select 
              value={typeof newStatus === 'string' ? newStatus : statusString} 
              onValueChange={(value) => setNewStatus(value as any)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {options && options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(statusType === 'material' || statusType === 'powderCoat') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eta" className="text-right">
                ETA
              </Label>
              <Input
                type="date"
                id="eta"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}

          {statusType === 'labor' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right">
                Hours
              </Label>
              <Input
                type="number"
                id="hours"
                value={String(hours)}
                onChange={(e) => setHours(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleStatusChange} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateButton;
