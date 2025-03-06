
import React from 'react';
import { Job } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus } from '@/lib/types';
import StatusColumnHeaders from './status/StatusColumnHeaders';
import PhaseStatusRow from './status/PhaseStatusRow';

interface PhaseStatusOverviewProps {
  job: Job;
  materialStatusOptions: { value: MaterialStatus; label: string }[];
  laborStatusOptions: { value: LaborStatus; label: string }[];
  powderCoatStatusOptions: { value: PowderCoatStatus; label: string }[];
  rentalEquipmentStatusOptions: { value: RentalEquipmentStatus; label: string }[];
  installationStatusOptions: { value: InstallationStatus; label: string }[];
}

const PhaseStatusOverview: React.FC<PhaseStatusOverviewProps> = ({
  job,
  materialStatusOptions,
  laborStatusOptions,
  powderCoatStatusOptions,
  rentalEquipmentStatusOptions,
  installationStatusOptions
}) => {
  return (
    <Card className="overflow-hidden border-gray-200">
      <CardHeader className="bg-white pb-2">
        <CardTitle className="text-xl font-semibold text-gray-800">Phase Status Overview</CardTitle>
        <CardDescription className="text-gray-500">
          Production and installation status for all phases
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <StatusColumnHeaders />
            </TableHeader>
            <TableBody>
              {job.phases
                .sort((a, b) => a.phaseNumber - b.phaseNumber)
                .map(phase => (
                  <PhaseStatusRow
                    key={phase.id}
                    phase={phase}
                    materialStatusOptions={materialStatusOptions}
                    laborStatusOptions={laborStatusOptions}
                    powderCoatStatusOptions={powderCoatStatusOptions}
                    rentalEquipmentStatusOptions={rentalEquipmentStatusOptions}
                    installationStatusOptions={installationStatusOptions}
                  />
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhaseStatusOverview;
