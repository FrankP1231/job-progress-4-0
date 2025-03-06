
import React from 'react';
import { TableCell } from '@/components/ui/table';
import StatusUpdateButton from '../StatusUpdateButton';
import { MaterialStatus, LaborStatus } from '@/lib/types';

interface WeldingSewingColumnProps {
  jobId: string;
  phaseId: string;
  materialFieldPath: string;
  materialStatus: MaterialStatus;
  materialEta?: string;
  laborFieldPath: string;
  laborStatus: LaborStatus;
  laborHours?: number;
  materialStatusOptions: { value: MaterialStatus; label: string }[];
  laborStatusOptions: { value: LaborStatus; label: string }[];
}

const WeldingSewingColumn: React.FC<WeldingSewingColumnProps> = ({
  jobId,
  phaseId,
  materialFieldPath,
  materialStatus,
  materialEta,
  laborFieldPath,
  laborStatus,
  laborHours,
  materialStatusOptions,
  laborStatusOptions,
}) => {
  return (
    <TableCell className="border-t border-gray-200 py-4">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Materials</div>
          <StatusUpdateButton
            jobId={jobId}
            phaseId={phaseId}
            statusType="material"
            fieldPath={materialFieldPath}
            currentStatus={materialStatus}
            currentEta={materialEta}
            options={materialStatusOptions}
          />
        </div>
        
        <div className="w-full">
          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Labor</div>
          <StatusUpdateButton
            jobId={jobId}
            phaseId={phaseId}
            statusType="labor"
            fieldPath={laborFieldPath}
            currentStatus={laborStatus}
            currentHours={laborHours}
            options={laborStatusOptions}
          />
        </div>
      </div>
    </TableCell>
  );
};

export default WeldingSewingColumn;
