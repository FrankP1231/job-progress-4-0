
import React from 'react';
import { TableCell } from '@/components/ui/table';
import StatusUpdateButton from '../StatusUpdateButton';
import { MaterialStatus, InstallationStatus, RentalEquipmentStatus } from '@/lib/types';

interface InstallationColumnProps {
  jobId: string;
  phaseId: string;
  materialStatus: MaterialStatus;
  materialEta?: string;
  installationStatus: InstallationStatus;
  rentalStatus: RentalEquipmentStatus;
  materialStatusOptions: { value: MaterialStatus; label: string }[];
  installationStatusOptions: { value: InstallationStatus; label: string }[];
  rentalEquipmentStatusOptions: { value: RentalEquipmentStatus; label: string }[];
}

const InstallationColumn: React.FC<InstallationColumnProps> = ({
  jobId,
  phaseId,
  materialStatus,
  materialEta,
  installationStatus,
  materialStatusOptions,
  installationStatusOptions,
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
            fieldPath="installationMaterials.status"
            currentStatus={materialStatus}
            currentEta={materialEta}
            options={materialStatusOptions}
          />
        </div>
        
        <div className="w-full">
          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Status</div>
          <StatusUpdateButton
            jobId={jobId}
            phaseId={phaseId}
            statusType="installation"
            fieldPath="installation.status"
            currentStatus={installationStatus}
            options={installationStatusOptions}
          />
        </div>
      </div>
    </TableCell>
  );
};

export default InstallationColumn;
