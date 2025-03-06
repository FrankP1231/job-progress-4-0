
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Material } from '@/lib/types';

interface MaterialStatusCardProps {
  title: string;
  icon?: React.ReactNode;
  material: Material;
  hideTitle?: boolean;
  hideStatus?: boolean;
}

const MaterialStatusCard: React.FC<MaterialStatusCardProps> = ({
  title,
  icon = <Package className="h-4 w-4" />,
  material,
  hideTitle = false,
  hideStatus = false
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
        {!hideStatus && material.status !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={material.status} />
          </div>
        )}
        
        {material.eta && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ETA</span>
            <span className="text-sm">{new Date(material.eta).toLocaleDateString()}</span>
          </div>
        )}
        
        {material.notes && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Notes</span>
            <p className="text-sm mt-1">{material.notes}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MaterialStatusCard;
