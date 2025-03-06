
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { PowderCoat } from '@/lib/types';

interface PowderCoatCardProps {
  powderCoat: PowderCoat;
}

const PowderCoatCard: React.FC<PowderCoatCardProps> = ({ powderCoat }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-4 w-4" />
          <span>Powder Coat</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge status={powderCoat.status} />
        </div>
        
        {powderCoat.eta && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expected Completion</span>
            <span className="text-sm">{new Date(powderCoat.eta).toLocaleDateString()}</span>
          </div>
        )}
        
        {powderCoat.notes && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Notes</span>
            <p className="text-sm mt-1">{powderCoat.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PowderCoatCard;
