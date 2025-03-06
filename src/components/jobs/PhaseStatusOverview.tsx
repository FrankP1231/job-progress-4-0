
import React from 'react';
import { Job } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Wrench, Scissors, Package, Palette, Truck 
} from 'lucide-react';
import { MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus } from '@/lib/types';
import StatusUpdateButton from './status/StatusUpdateButton';

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
              <TableRow className="bg-gray-50 border-y border-gray-200">
                <TableHead className="font-semibold text-gray-700 py-3">Phase</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 py-3">
                  <div className="flex items-center justify-center">
                    <Wrench className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span>Welding</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 py-3">
                  <div className="flex items-center justify-center">
                    <Scissors className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span>Sewing</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 py-3">
                  <div className="flex items-center justify-center">
                    <Package className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span>Installation</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 py-3">
                  <div className="flex items-center justify-center">
                    <Palette className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span>Powder Coat</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 py-3">
                  <div className="flex items-center justify-center">
                    <Truck className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span>Install Crew</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {job.phases
                .sort((a, b) => a.phaseNumber - b.phaseNumber)
                .map(phase => (
                  <TableRow 
                    key={phase.id} 
                    className={phase.isComplete ? "bg-gray-50/50" : "hover:bg-gray-50/30 transition-colors"}
                  >
                    <TableCell className="font-medium border-t border-gray-200 align-top py-4">
                      <div className="font-medium text-gray-800">
                        Phase {phase.phaseNumber}: {phase.phaseName}
                      </div>
                      <Badge variant={phase.isComplete ? "outline" : "default"} className={phase.isComplete ? "bg-green-100 text-green-700 border-green-200 mt-2" : "mt-2"}>
                        {phase.isComplete ? 'Complete' : 'In Progress'}
                      </Badge>
                    </TableCell>
                    
                    {/* Welding Column */}
                    <TableCell className="border-t border-gray-200 py-4">
                      <div className="flex flex-col gap-3">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Materials</div>
                          <StatusUpdateButton
                            jobId={job.id}
                            phaseId={phase.id}
                            statusType="material"
                            fieldPath="weldingMaterials.status"
                            currentStatus={phase.weldingMaterials.status}
                            currentEta={phase.weldingMaterials.eta}
                            options={materialStatusOptions}
                          />
                        </div>
                        
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Labor</div>
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
                      </div>
                    </TableCell>
                    
                    {/* Sewing Column */}
                    <TableCell className="border-t border-gray-200 py-4">
                      <div className="flex flex-col gap-3">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Materials</div>
                          <StatusUpdateButton
                            jobId={job.id}
                            phaseId={phase.id}
                            statusType="material"
                            fieldPath="sewingMaterials.status"
                            currentStatus={phase.sewingMaterials.status}
                            currentEta={phase.sewingMaterials.eta}
                            options={materialStatusOptions}
                          />
                        </div>
                        
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Labor</div>
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
                      </div>
                    </TableCell>
                    
                    {/* Installation Column */}
                    <TableCell className="border-t border-gray-200 py-4">
                      <div className="flex flex-col gap-3">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Materials</div>
                          <StatusUpdateButton
                            jobId={job.id}
                            phaseId={phase.id}
                            statusType="material"
                            fieldPath="installationMaterials.status"
                            currentStatus={phase.installationMaterials.status}
                            currentEta={phase.installationMaterials.eta}
                            options={materialStatusOptions}
                          />
                        </div>
                        
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Status</div>
                          <StatusUpdateButton
                            jobId={job.id}
                            phaseId={phase.id}
                            statusType="installation"
                            fieldPath="installation.status"
                            currentStatus={phase.installation.status}
                            options={installationStatusOptions}
                          />
                        </div>
                        
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Rental</div>
                          <StatusUpdateButton
                            jobId={job.id}
                            phaseId={phase.id}
                            statusType="rental"
                            fieldPath="installation.rentalEquipment.status"
                            currentStatus={phase.installation.rentalEquipment.status}
                            options={rentalEquipmentStatusOptions}
                          />
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Powder Coat Column */}
                    <TableCell className="border-t border-gray-200 py-4">
                      <div className="flex flex-col gap-3">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">PC Status</div>
                          <StatusUpdateButton
                            jobId={job.id}
                            phaseId={phase.id}
                            statusType="powderCoat"
                            fieldPath="powderCoat.status"
                            currentStatus={phase.powderCoat.status}
                            currentEta={phase.powderCoat.eta}
                            options={powderCoatStatusOptions}
                          />
                        </div>
                        
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Color</div>
                          <div className="text-center bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2 text-sm text-gray-700">
                            {phase.powderCoat.color || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Install Crew Column */}
                    <TableCell className="border-t border-gray-200 py-4">
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-x-2 w-full text-center">
                          <div>
                            <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Crew Size</div>
                            <div className="bg-gray-50 border border-gray-200 rounded-md py-1.5 text-sm text-gray-700">
                              {phase.installation.crewMembersNeeded}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase font-medium text-gray-500 mb-1.5">Hours</div>
                            <div className="bg-gray-50 border border-gray-200 rounded-md py-1.5 text-sm text-gray-700">
                              {phase.installation.crewHoursNeeded}
                            </div>
                          </div>
                        </div>
                        
                        {(phase.installation.siteReadyDate || phase.installation.installDeadline) && (
                          <div className="w-full mt-1 space-y-1.5">
                            {phase.installation.siteReadyDate && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>Site Ready: {new Date(phase.installation.siteReadyDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {phase.installation.installDeadline && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>Deadline: {new Date(phase.installation.installDeadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhaseStatusOverview;
