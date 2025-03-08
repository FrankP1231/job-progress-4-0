
import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus, TaskStatus } from '@/lib/types';

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
  tasks, 
  forceTaskStatus = true // Default to true to prioritize task-based status
}) => {
  // If tasks are provided, calculate status based on tasks
  let statusKey = status;
  
  if (tasks && Array.isArray(tasks) && (forceTaskStatus || tasks.length > 0)) {
    if (tasks.length === 0) {
      statusKey = 'not-needed';
    } else {
      const completedTasks = tasks.filter(task => task.isComplete || task.status === 'complete');
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
      
      if (completedTasks.length === tasks.length) {
        statusKey = 'complete';
      } else if (completedTasks.length > 0 || inProgressTasks.length > 0) {
        statusKey = 'in-progress';
      } else {
        statusKey = 'not-started';
      }
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
