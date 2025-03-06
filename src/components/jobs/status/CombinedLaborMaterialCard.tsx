
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Labor, Material } from '@/lib/types';
import LaborStatusCard from './LaborStatusCard';
import MaterialStatusCard from './MaterialStatusCard';

interface CombinedLaborMaterialCardProps {
  title: string;
  icon: React.ReactNode;
  labor: Labor;
  material: Material;
  laborStatus?: React.ReactNode;
  materialStatus?: React.ReactNode;
}

const CombinedLaborMaterialCard: React.FC<CombinedLaborMaterialCardProps> = ({
  icon,
  labor,
  material,
  laborStatus,
  materialStatus,
}) => {
  return (
    <CardContent className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Labor</span>
          {laborStatus}
        </div>
        <LaborStatusCard
          title=""
          hideTitle
          icon={icon}
          labor={{
            ...labor,
            status: undefined as any
          }}
          hideStatus={true}
        />
      </div>

      <div className="h-px w-full bg-border" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Materials</span>
          {materialStatus}
        </div>
        <MaterialStatusCard
          title=""
          hideTitle
          icon={icon}
          material={{
            ...material,
            status: undefined as any
          }}
          hideStatus={true}
        />
      </div>
    </CardContent>
  );
};

export default CombinedLaborMaterialCard;
