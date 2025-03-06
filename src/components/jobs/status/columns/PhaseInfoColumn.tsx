
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface PhaseInfoColumnProps {
  phaseNumber: number;
  phaseName: string;
  isComplete: boolean;
}

const PhaseInfoColumn: React.FC<PhaseInfoColumnProps> = ({
  phaseNumber,
  phaseName,
  isComplete,
}) => {
  return (
    <TableCell className="font-medium border-t border-gray-200 align-top py-4">
      <div className="font-medium text-gray-800">
        Phase {phaseNumber}: {phaseName}
      </div>
      <Badge 
        variant={isComplete ? "outline" : "default"} 
        className={isComplete ? "bg-green-100 text-green-700 border-green-200 mt-2" : "mt-2"}
      >
        {isComplete ? 'Complete' : 'In Progress'}
      </Badge>
    </TableCell>
  );
};

export default PhaseInfoColumn;
