
import React from 'react';
import { getStatusColorClass, getStatusLabel } from '@/lib/jobUtils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const colorClass = getStatusColorClass(status);
  const label = getStatusLabel(status);
  
  return (
    <Badge className={cn(colorClass, 'font-medium', className)}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
