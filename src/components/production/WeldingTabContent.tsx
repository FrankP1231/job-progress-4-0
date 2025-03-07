
import React from 'react';
import { Phase } from '@/lib/types';
import ProductionPhasesTab from './ProductionPhasesTab';

interface WeldingTabContentProps {
  weldingPhases: Phase[];
  totalWeldingHours: number;
}

const WeldingTabContent: React.FC<WeldingTabContentProps> = ({ 
  weldingPhases, 
  totalWeldingHours 
}) => {
  return (
    <ProductionPhasesTab 
      phases={weldingPhases} 
      tabType="welding"
      totalHours={totalWeldingHours}
    />
  );
};

export default WeldingTabContent;
