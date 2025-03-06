
import React from 'react';
import { TableRow } from '@/components/ui/table';
import { Phase, MaterialStatus, LaborStatus, PowderCoatStatus, RentalEquipmentStatus, InstallationStatus } from '@/lib/types';
import PhaseInfoColumn from './columns/PhaseInfoColumn';
import WeldingSewingColumn from './columns/WeldingSewingColumn';
import InstallationColumn from './columns/InstallationColumn';
import PowderCoatColumn from './columns/PowderCoatColumn';
import InstallCrewColumn from './columns/InstallCrewColumn';

interface PhaseStatusRowProps {
  phase: Phase;
  materialStatusOptions: { value: MaterialStatus; label: string }[];
  laborStatusOptions: { value: LaborStatus; label: string }[];
  powderCoatStatusOptions: { value: PowderCoatStatus; label: string }[];
  rentalEquipmentStatusOptions: { value: RentalEquipmentStatus; label: string }[];
  installationStatusOptions: { value: InstallationStatus; label: string }[];
}

const PhaseStatusRow: React.FC<PhaseStatusRowProps> = ({
  phase,
  materialStatusOptions,
  laborStatusOptions,
  powderCoatStatusOptions,
  rentalEquipmentStatusOptions,
  installationStatusOptions
}) => {
  return (
    <TableRow 
      key={phase.id} 
      className={phase.isComplete ? "bg-gray-50/50" : "hover:bg-gray-50/30 transition-colors"}
    >
      <PhaseInfoColumn 
        phaseNumber={phase.phaseNumber} 
        phaseName={phase.phaseName} 
        isComplete={phase.isComplete} 
      />
      
      <WeldingSewingColumn 
        jobId={phase.jobId}
        phaseId={phase.id}
        materialFieldPath="weldingMaterials.status"
        materialStatus={phase.weldingMaterials.status}
        materialEta={phase.weldingMaterials.eta}
        laborFieldPath="weldingLabor.status"
        laborStatus={phase.weldingLabor.status}
        laborHours={phase.weldingLabor.hours}
        materialStatusOptions={materialStatusOptions}
        laborStatusOptions={laborStatusOptions}
      />
      
      <WeldingSewingColumn 
        jobId={phase.jobId}
        phaseId={phase.id}
        materialFieldPath="sewingMaterials.status"
        materialStatus={phase.sewingMaterials.status}
        materialEta={phase.sewingMaterials.eta}
        laborFieldPath="sewingLabor.status"
        laborStatus={phase.sewingLabor.status}
        laborHours={phase.sewingLabor.hours}
        materialStatusOptions={materialStatusOptions}
        laborStatusOptions={laborStatusOptions}
      />
      
      <InstallationColumn 
        jobId={phase.jobId}
        phaseId={phase.id}
        materialStatus={phase.installationMaterials.status}
        materialEta={phase.installationMaterials.eta}
        installationStatus={phase.installation.status}
        rentalStatus={phase.installation.rentalEquipment.status}
        materialStatusOptions={materialStatusOptions}
        installationStatusOptions={installationStatusOptions}
        rentalEquipmentStatusOptions={rentalEquipmentStatusOptions}
      />
      
      <PowderCoatColumn 
        jobId={phase.jobId}
        phaseId={phase.id}
        status={phase.powderCoat.status}
        eta={phase.powderCoat.eta}
        color={phase.powderCoat.color}
        options={powderCoatStatusOptions}
      />
      
      <InstallCrewColumn 
        jobId={phase.jobId}
        phaseId={phase.id}
        installation={phase.installation}
        rentalStatus={phase.installation.rentalEquipment.status}
        rentalEquipmentStatusOptions={rentalEquipmentStatusOptions}
      />
    </TableRow>
  );
};

export default PhaseStatusRow;
