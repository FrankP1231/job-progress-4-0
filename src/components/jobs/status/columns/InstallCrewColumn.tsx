
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { Installation, RentalEquipmentStatus } from '@/lib/types';
import StatusUpdateButton from '../StatusUpdateButton';

interface InstallCrewColumnProps {
  jobId: string;
  phaseId: string;
  installation: Installation;
  rentalStatus: RentalEquipmentStatus;
  rentalEquipmentStatusOptions: { value: RentalEquipmentStatus; label: string }[];
}

const InstallCrewColumn: React.FC<InstallCrewColumnProps> = ({ 
  jobId,
  phaseId,
  installation,
  rentalStatus,
  rentalEquipmentStatusOptions
}) => {
  return (
    <TableCell className="border-t border-gray-200 py-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-x-2 w-full text-center">
          <div>
            <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Crew Size</div>
            <div className="bg-gray-50 border border-gray-200 rounded-md py-1.5 text-sm text-gray-700">
              {installation.crewMembersNeeded}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Hours</div>
            <div className="bg-gray-50 border border-gray-200 rounded-md py-1.5 text-sm text-gray-700">
              {installation.crewHoursNeeded}
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Rental</div>
          <StatusUpdateButton
            jobId={jobId}
            phaseId={phaseId}
            statusType="rental"
            fieldPath="installation.rentalEquipment.status"
            currentStatus={rentalStatus}
            options={rentalEquipmentStatusOptions}
          />
        </div>
        
        {(installation.siteReadyDate || installation.installDeadline) && (
          <div className="w-full mt-1 space-y-1.5">
            {installation.siteReadyDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>Site Ready: {new Date(installation.siteReadyDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {installation.installDeadline && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>Deadline: {new Date(installation.installDeadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </TableCell>
  );
};

export default InstallCrewColumn;
