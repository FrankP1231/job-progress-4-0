
import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus } from '@/lib/types';

type StatusType = MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus | InstallationStatus;

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  'not-needed': { label: 'Not Needed', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  'not-ordered': { label: 'Not Ordered', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  'ordered': { label: 'Ordered', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  'received': { label: 'Received', className: 'bg-green-100 text-green-700 border-green-200' },
  'estimated': { label: 'Estimated', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  'complete': { label: 'Complete', className: 'bg-green-100 text-green-700 border-green-200' },
  'not-started': { label: 'Not Started', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-200' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: '' };
  
  return (
    <Badge 
      className={cn(
        config.className, 
        "font-normal py-1 h-auto rounded-md transition-all hover:opacity-90",
        className
      )}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
