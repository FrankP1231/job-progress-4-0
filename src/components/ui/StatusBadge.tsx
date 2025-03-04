
import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus } from '@/lib/types';

type StatusType = MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus;

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  'not-needed': { label: 'Not Needed', className: 'bg-status-not-needed text-foreground' },
  'not-ordered': { label: 'Not Ordered', className: 'bg-status-not-ordered text-white' },
  'ordered': { label: 'Ordered', className: 'bg-status-ordered text-foreground' },
  'received': { label: 'Received', className: 'bg-status-received text-white' },
  'estimated': { label: 'Estimated', className: 'bg-status-in-progress text-white' },
  'complete': { label: 'Complete', className: 'bg-status-complete text-white' },
  'not-started': { label: 'Not Started', className: 'bg-status-not-ordered text-white' },
  'in-progress': { label: 'In Progress', className: 'bg-status-in-progress text-white' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: '' };
  
  return (
    <Badge 
      className={cn(config.className, className)}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
