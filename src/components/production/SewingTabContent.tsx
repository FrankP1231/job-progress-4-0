
import React from 'react';
import { Phase } from '@/lib/types';
import ProductionPhasesTab from './ProductionPhasesTab';

interface SewingTabContentProps {
  sewingPhases: Phase[];
  totalSewingHours: number;
}

const SewingTabContent: React.FC<SewingTabContentProps> = ({ 
  sewingPhases, 
  totalSewingHours 
}) => {
  return (
    <ProductionPhasesTab 
      phases={sewingPhases} 
      tabType="sewing"
      totalHours={totalSewingHours}
    />
  );
};

export default SewingTabContent;
