
import React from 'react';
import { Job } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Check, Wrench, Scissors, Package, Palette, Truck 
} from 'lucide-react';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus } from '@/lib/types';
import StatusUpdateButton from './status/StatusUpdateButton';

interface PhaseStatusOverviewProps {
  job: Job;
  materialStatusOptions: { value: MaterialStatus; label: string }[];
  laborStatusOptions: { value: LaborStatus; label: string }[];
  powderCoatStatusOptions: { value: PowderCoatStatus; label: string }[];
  rentalEquipmentStatusOptions: { value: RentalEquipmentStatus; label: string }[];
}

const PhaseStatusOverview: React.FC<PhaseStatusOverviewProps> = ({
  job,
  materialStatusOptions,
  laborStatusOptions,
  powderCoatStatusOptions,
  rentalEquipmentStatusOptions
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase Status Overview</CardTitle>
        <CardDescription>
          Production and installation status for all phases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phase</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  <Wrench className="mr-1 h-4 w-4" />
                  <span>Welding</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  <Scissors className="mr-1 h-4 w-4" />
                  <span>Sewing</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  <Package className="mr-1 h-4 w-4" />
                  <span>Installation</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  <Palette className="mr-1 h-4 w-4" />
                  <span>PC Status</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center">
                  <Truck className="mr-1 h-4 w-4" />
                  <span>Install Crew</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {job.phases
              .sort((a, b) => a.phaseNumber - b.phaseNumber)
              .map(phase => (
                <TableRow key={phase.id} className={phase.isComplete ? "bg-muted/20" : ""}>
                  <TableCell>
                    <div className="font-medium">
                      Phase {phase.phaseNumber}: {phase.phaseName}
                    </div>
                    <Badge variant={phase.isComplete ? "outline" : "default"} className={phase.isComplete ? "bg-status-complete text-white mt-1" : "mt-1"}>
                      {phase.isComplete ? 'Complete' : 'In Progress'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <div className="font-medium text-sm">Materials</div>
                      <StatusUpdateButton
                        jobId={job.id}
                        phaseId={phase.id}
                        statusType="material"
                        fieldPath="weldingMaterials.status"
                        currentStatus={phase.weldingMaterials.status}
                        currentEta={phase.weldingMaterials.eta}
                        options={materialStatusOptions}
                      />
                      
                      <div className="font-medium text-sm mt-2">Labor</div>
                      <StatusUpdateButton
                        jobId={job.id}
                        phaseId={phase.id}
                        statusType="labor"
                        fieldPath="weldingLabor.status"
                        currentStatus={phase.weldingLabor.status}
                        currentHours={phase.weldingLabor.hours}
                        options={laborStatusOptions}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <div className="font-medium text-sm">Materials</div>
                      <StatusUpdateButton
                        jobId={job.id}
                        phaseId={phase.id}
                        statusType="material"
                        fieldPath="sewingMaterials.status"
                        currentStatus={phase.sewingMaterials.status}
                        currentEta={phase.sewingMaterials.eta}
                        options={materialStatusOptions}
                      />
                      
                      <div className="font-medium text-sm mt-2">Labor</div>
                      <StatusUpdateButton
                        jobId={job.id}
                        phaseId={phase.id}
                        statusType="labor"
                        fieldPath="sewingLabor.status"
                        currentStatus={phase.sewingLabor.status}
                        currentHours={phase.sewingLabor.hours}
                        options={laborStatusOptions}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <div className="font-medium text-sm">Materials</div>
                      <StatusUpdateButton
                        jobId={job.id}
                        phaseId={phase.id}
                        statusType="material"
                        fieldPath="installationMaterials.status"
                        currentStatus={phase.installationMaterials.status}
                        currentEta={phase.installationMaterials.eta}
                        options={materialStatusOptions}
                      />
                      
                      <div className="font-medium text-sm mt-2">Rental</div>
                      <StatusUpdateButton
                        jobId={job.id}
                        phaseId={phase.id}
                        statusType="rental"
                        fieldPath="installation.rentalEquipment.status"
                        currentStatus={phase.installation.rentalEquipment.status}
                        options={rentalEquipmentStatusOptions}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <StatusUpdateButton
                        jobId={job.id}
                        phaseId={phase.id}
                        statusType="powderCoat"
                        fieldPath="powderCoat.status"
                        currentStatus={phase.powderCoat.status}
                        currentEta={phase.powderCoat.eta}
                        options={powderCoatStatusOptions}
                      />
                      
                      <div className="font-medium text-sm mt-2">Color</div>
                      {phase.powderCoat.color ? (
                        <div className="text-sm">
                          {phase.powderCoat.color}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Not specified
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center text-sm">
                      <div>
                        <span className="font-medium">Crew Size:</span> {phase.installation.crewMembersNeeded}
                      </div>
                      <div>
                        <span className="font-medium">Hours Needed:</span> {phase.installation.crewHoursNeeded}
                      </div>
                      
                      {phase.installation.siteReadyDate && (
                        <div className="flex items-center mt-1 text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span className="whitespace-nowrap">Site Ready: {new Date(phase.installation.siteReadyDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {phase.installation.installDeadline && (
                        <div className="flex items-center mt-1 text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span className="whitespace-nowrap">Deadline: {new Date(phase.installation.installDeadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PhaseStatusOverview;
