
import React from 'react';
import { TableCell } from '@/components/ui/table';
import StatusUpdateButton from '@/components/jobs/status/StatusUpdateButton';
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
  rentalStatus,
  materialStatusOptions,
  installationStatusOptions,
  rentalEquipmentStatusOptions,
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
        
        <div className="w-full">
          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Rental Equipment</div>
          <StatusUpdateButton
            jobId={jobId}
            phaseId={phaseId}
            statusType="rental"
            fieldPath="installation.rentalEquipment.status"
            currentStatus={rentalStatus}
            options={rentalEquipmentStatusOptions}
          />
        </div>
      </div>
    </TableCell>
  );
};

export default InstallationColumn;
