
import React from 'react';
import { TableCell } from '@/components/ui/table';
import StatusUpdateButton from '../StatusUpdateButton';
import { PowderCoatStatus } from '@/lib/types';

interface PowderCoatColumnProps {
  jobId: string;
  phaseId: string;
  status: PowderCoatStatus;
  eta?: string;
  color?: string;
  options: { value: PowderCoatStatus; label: string }[];
}

const PowderCoatColumn: React.FC<PowderCoatColumnProps> = ({
  jobId,
  phaseId,
  status,
  eta,
  color,
  options,
}) => {
  return (
    <TableCell className="border-t border-gray-200 py-4">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">PC Status</div>
          <StatusUpdateButton
            jobId={jobId}
            phaseId={phaseId}
            statusType="powderCoat"
            fieldPath="powderCoat.status"
            currentStatus={status}
            currentEta={eta}
            options={options}
          />
        </div>
        
        <div className="w-full">
          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Color</div>
          <div className="text-center bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2 text-sm text-gray-700">
            {color || 'Not specified'}
          </div>
        </div>
      </div>
    </TableCell>
  );
};

export default PowderCoatColumn;
