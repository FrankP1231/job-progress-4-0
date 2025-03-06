
import React from 'react';
import { Job } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Check, Wrench, Scissors, Package, Palette, Truck 
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
    <Card>
      <CardHeader>
        <CardTitle>Phase Status Overview</CardTitle>
        <CardDescription>
          Production and installation status for all phases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold text-primary">Phase</TableHead>
                <TableHead className="text-center font-semibold text-primary">
                  <div className="flex items-center justify-center">
                    <Wrench className="mr-1.5 h-4 w-4" />
                    <span>Welding</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-primary">
                  <div className="flex items-center justify-center">
                    <Scissors className="mr-1.5 h-4 w-4" />
                    <span>Sewing</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-primary">
                  <div className="flex items-center justify-center">
                    <Package className="mr-1.5 h-4 w-4" />
                    <span>Installation</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-primary">
                  <div className="flex items-center justify-center">
                    <Palette className="mr-1.5 h-4 w-4" />
                    <span>Powder Coat</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-primary">
                  <div className="flex items-center justify-center">
                    <Truck className="mr-1.5 h-4 w-4" />
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
                    className={phase.isComplete ? "bg-muted/20" : "hover:bg-muted/10 transition-colors"}
                  >
                    <TableCell className="font-medium">
                      <div className="font-medium">
                        Phase {phase.phaseNumber}: {phase.phaseName}
                      </div>
                      <Badge variant={phase.isComplete ? "outline" : "default"} className={phase.isComplete ? "bg-status-complete text-white mt-1" : "mt-1"}>
                        {phase.isComplete ? 'Complete' : 'In Progress'}
                      </Badge>
                    </TableCell>
                    
                    {/* Welding Column */}
                    <TableCell>
                      <div className="flex flex-col items-center gap-2 p-0.5">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Materials</div>
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
                        
                        <div className="w-full mt-1">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Labor</div>
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
                    <TableCell>
                      <div className="flex flex-col items-center gap-2 p-0.5">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Materials</div>
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
                        
                        <div className="w-full mt-1">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Labor</div>
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
                    <TableCell>
                      <div className="flex flex-col items-center gap-2 p-0.5">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Materials</div>
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
                        
                        <div className="w-full mt-1">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Status</div>
                          <StatusUpdateButton
                            jobId={job.id}
                            phaseId={phase.id}
                            statusType="installation"
                            fieldPath="installation.status"
                            currentStatus={phase.installation.status}
                            options={installationStatusOptions}
                          />
                        </div>
                        
                        <div className="w-full mt-1">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Rental</div>
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
                    <TableCell>
                      <div className="flex flex-col items-center gap-2 p-0.5">
                        <div className="w-full">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">PC Status</div>
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
                        
                        <div className="w-full mt-1">
                          <div className="text-xs uppercase font-medium text-muted-foreground mb-1 text-center">Color</div>
                          <div className="text-center bg-muted/20 rounded-md py-1 px-2 text-sm">
                            {phase.powderCoat.color || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Install Crew Column */}
                    <TableCell>
                      <div className="flex flex-col items-center gap-1 p-0.5">
                        <div className="grid grid-cols-2 gap-x-2 w-full text-center">
                          <div>
                            <div className="text-xs uppercase font-medium text-muted-foreground mb-1">Crew Size</div>
                            <div className="bg-muted/20 rounded-md py-1 text-sm">
                              {phase.installation.crewMembersNeeded}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase font-medium text-muted-foreground mb-1">Hours</div>
                            <div className="bg-muted/20 rounded-md py-1 text-sm">
                              {phase.installation.crewHoursNeeded}
                            </div>
                          </div>
                        </div>
                        
                        {(phase.installation.siteReadyDate || phase.installation.installDeadline) && (
                          <div className="w-full mt-2 space-y-1">
                            {phase.installation.siteReadyDate && (
                              <div className="flex items-center justify-center gap-1 text-xs">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>Site Ready: {new Date(phase.installation.siteReadyDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {phase.installation.installDeadline && (
                              <div className="flex items-center justify-center gap-1 text-xs">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
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
