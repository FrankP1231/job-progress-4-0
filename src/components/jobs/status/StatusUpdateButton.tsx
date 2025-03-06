
import React, { useState } from 'react';
import {
  MaterialStatus,
  LaborStatus,
  PowderCoatStatus,
  RentalEquipmentStatus,
  InstallationStatus
} from '@/lib/types';
import { updatePhaseStatus } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { Edit } from 'lucide-react';

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
  const queryClient = useQueryClient();

  const handleStatusChange = async () => {
    try {
      let updateData: Record<string, any> = { status: newStatus };

      if (statusType === 'material' || statusType === 'powderCoat') {
        updateData = { ...updateData, eta: eta };
      }

      if (statusType === 'labor') {
        updateData = { ...updateData, hours: hours };
      }

      await updatePhaseStatus(jobId, phaseId, fieldPath, updateData);
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['inProgressPhases'] });
      toast.success(`Phase ${statusType} status updated successfully.`);
      setOpen(false);

      if (onStatusChange) {
        onStatusChange(newStatus as string);
      }
    } catch (error) {
      console.error("Error updating phase status:", error);
      toast.error("Failed to update phase status.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full relative group hover:shadow-sm transition-all"
        >
          <StatusBadge status={currentStatus} className="w-full justify-center" />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
            <Edit className="h-3 w-3 text-foreground" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update {statusType} Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={newStatus as string} onValueChange={(value) => setNewStatus(value as MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus | InstallationStatus)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
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
          <Button type="button" onClick={handleStatusChange}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateButton;
