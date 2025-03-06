import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Calendar, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updatePhase } from '@/lib/supabase/phaseUtils';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  currentHours?: number;
  currentEta?: string;
  options: StatusOption[];
  onSuccess?: () => void;
}

const StatusUpdateButton: React.FC<StatusUpdateButtonProps> = ({
  jobId,
  phaseId,
  statusType,
  fieldPath,
  currentStatus,
  currentHours,
  currentEta,
  options,
  onSuccess,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<StatusValue>(currentStatus);
  const [hours, setHours] = useState<string>(currentHours?.toString() || '');
  const [eta, setEta] = useState<string>(currentEta || '');
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [showEtaDialog, setShowEtaDialog] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<StatusValue>(currentStatus);
  const queryClient = useQueryClient();

  useEffect(() => {
    setStatus(currentStatus);
    setPreviousStatus(currentStatus);
    setHours(currentHours?.toString() || '');
    setEta(currentEta || '');
  }, [currentStatus, currentHours, currentEta]);

  const handleStatusUpdate = async (newStatus: StatusValue) => {
    if (newStatus === status) return;
    
    setPreviousStatus(status);
    
    if (statusType === 'labor' && newStatus === 'estimated') {
      setStatus(newStatus);
      setShowHoursDialog(true);
      return;
    }
    
    if ((statusType === 'material' || statusType === 'powderCoat') && newStatus === 'ordered') {
      setStatus(newStatus);
      setShowEtaDialog(true);
      return;
    }
    
    await updateStatusInDatabase(newStatus);
  };

  const updateStatusInDatabase = async (newStatus: StatusValue, newHours?: number, newEta?: string) => {
    setIsUpdating(true);
    try {
      const pathParts = fieldPath.split('.');
      let updateData: any = {};
      
      if (pathParts.length === 2) {
        updateData[pathParts[0]] = {
          ...updateData[pathParts[0]],
          [pathParts[1]]: newStatus
        };
        
        if (statusType === 'labor' && newStatus === 'estimated' && newHours !== undefined) {
          updateData[pathParts[0]].hours = newHours;
        }
        
        if ((statusType === 'material' || statusType === 'powderCoat') && newStatus === 'ordered' && newEta) {
          updateData[pathParts[0]].eta = newEta;
        }
      } else if (pathParts.length === 3) {
        updateData[pathParts[0]] = {
          ...updateData[pathParts[0]],
          [pathParts[1]]: {
            [pathParts[2]]: newStatus
          }
        };
      } else {
        updateData[fieldPath] = newStatus;
      }
      
      await updatePhase(jobId, phaseId, updateData);
      
      queryClient.invalidateQueries({ queryKey: ['phase', jobId, phaseId] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      
      let successMessage = `Status updated to ${getStatusLabel(newStatus, options)}`;
      if (newHours !== undefined) {
        successMessage += ` with ${newHours} hours`;
      }
      if (newEta) {
        successMessage += ` with ETA of ${format(new Date(newEta), 'PP')}`;
      }
      
      toast.success(successMessage);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      
      setStatus(previousStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleHoursSubmit = async () => {
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      toast.error('Please enter a valid number of hours');
      return;
    }
    
    await updateStatusInDatabase(status, parsedHours);
    setShowHoursDialog(false);
  };
  
  const handleEtaSubmit = async () => {
    if (!eta) {
      toast.error('Please select a valid date');
      return;
    }
    
    await updateStatusInDatabase(status, undefined, eta);
    setShowEtaDialog(false);
  };

  const handleDialogClose = (dialogType: 'hours' | 'eta') => {
    if (dialogType === 'hours') {
      setShowHoursDialog(false);
    } else {
      setShowEtaDialog(false);
    }
    
    setStatus(previousStatus);
    console.log("Dialog cancelled, reverting status back to:", previousStatus);
    
    setHours(currentHours?.toString() || '');
    setEta(currentEta || '');
  };
  
  const getStatusLabel = (status: StatusValue, options: StatusOption[]) => {
    return options.find(option => option.value === status)?.label || status;
  };

  const currentStatusLabel = getStatusLabel(status, options);
  
  const getDisplayLabel = () => {
    let label = currentStatusLabel;
    
    if (statusType === 'labor' && status === 'estimated' && currentHours) {
      label += ` (${currentHours} hours)`;
    }
    
    if ((statusType === 'material' || statusType === 'powderCoat') && status === 'ordered' && currentEta) {
      label += ` (ETA: ${format(new Date(currentEta), 'PP')})`;
    }
    
    return label;
  };
  
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
    <>
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
                {getDisplayLabel()}
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
      
      <Dialog 
        open={showHoursDialog} 
        onOpenChange={(open) => {
          if (!open) handleDialogClose('hours');
          else setShowHoursDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Labor Hours</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right">
                Hours
              </Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleDialogClose('hours')}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleHoursSubmit}>
              <Clock className="mr-2 h-4 w-4" />
              Update Hours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={showEtaDialog} 
        onOpenChange={(open) => {
          if (!open) handleDialogClose('eta');
          else setShowEtaDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Expected Arrival Date</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eta" className="text-right">
                ETA Date
              </Label>
              <Input
                id="eta"
                type="date"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleDialogClose('eta')}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleEtaSubmit}>
              <Calendar className="mr-2 h-4 w-4" />
              Update ETA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatusUpdateButton;
