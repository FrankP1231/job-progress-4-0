
import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus } from '@/lib/types';

type StatusType = MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus;

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  'not-needed': { label: 'Not Needed', className: 'bg-muted text-muted-foreground border-muted' },
  'not-ordered': { label: 'Not Ordered', className: 'bg-status-not-ordered text-white border-status-not-ordered' },
  'ordered': { label: 'Ordered', className: 'bg-status-ordered text-foreground border-status-ordered' },
  'received': { label: 'Received', className: 'bg-status-received text-white border-status-received' },
  'estimated': { label: 'Estimated', className: 'bg-status-in-progress text-white border-status-in-progress' },
  'complete': { label: 'Complete', className: 'bg-status-complete text-white border-status-complete' },
  'not-started': { label: 'Not Started', className: 'bg-status-not-ordered text-white border-status-not-ordered' },
  'in-progress': { label: 'In Progress', className: 'bg-status-in-progress text-white border-status-in-progress' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: '' };
  
  return (
    <Badge 
      className={cn(config.className, "font-normal py-1 h-auto", className)}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
