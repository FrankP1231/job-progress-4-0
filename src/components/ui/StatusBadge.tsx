
import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus, TaskStatus } from '@/lib/types';
import { calculateAreaStatus } from '@/lib/supabase/task-status';

type StatusType = MaterialStatus | LaborStatus | PowderCoatStatus | RentalEquipmentStatus | InstallationStatus | TaskStatus;

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
  tasks?: any[]; // Array of tasks to determine status
  forceTaskStatus?: boolean; // Force using task-based status calculation
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className, 
  tasks = [], // Default to empty array to simplify logic
  forceTaskStatus = false
}) => {
  // Determine status based on tasks
  let statusKey = status;
  
  // If tasks are provided and forceTaskStatus is true, use task-based status calculation
  if (forceTaskStatus && tasks && tasks.length > 0) {
    statusKey = calculateAreaStatus(tasks);
  } 
  // If no tasks and not forcing task status, use the provided status
  else if (tasks.length === 0 && !forceTaskStatus) {
    // For material statuses, show "not-needed" when there are no tasks (only for non-forced task status)
    if (
      status === 'not-ordered' || 
      status === 'ordered' || 
      status === 'received'
    ) {
      statusKey = 'not-needed';
    }
  }
  
  // Make sure status is a string and is one of the valid status types
  statusKey = typeof statusKey === 'string' ? statusKey : 'not-started';
  
  // Get config for the status or use a default
  const config = statusConfig[statusKey as StatusType] || { 
    label: String(statusKey), 
    className: 'bg-gray-100 text-gray-600 border-gray-200' 
  };
  
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
