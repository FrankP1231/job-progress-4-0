
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Labor } from '@/lib/types';

interface LaborStatusCardProps {
  title: string;
  icon?: React.ReactNode;
  labor: Labor;
  hideTitle?: boolean;
}

const LaborStatusCard: React.FC<LaborStatusCardProps> = ({
  title,
  icon = <Users className="h-4 w-4" />,
  labor,
  hideTitle = false
}) => {
  return (
    <>
      {!hideTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge status={labor.status} />
        </div>
        
        {labor.hours !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Hours</span>
            <span className="text-sm">{labor.hours}</span>
          </div>
        )}
        
        {labor.notes && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Notes</span>
            <p className="text-sm mt-1">{labor.notes}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default LaborStatusCard;
