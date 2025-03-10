
import { useState } from 'react';
import { TaskWithMetadata } from '@/lib/types';

export function usePhaseFormState() {
  const [phaseName, setPhaseName] = useState('');
  const [phaseNumber, setPhaseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [weldingMaterialTasks, setWeldingMaterialTasks] = useState<TaskWithMetadata[]>([]);
  const [sewingMaterialTasks, setSewingMaterialTasks] = useState<TaskWithMetadata[]>([]);
  const [installationMaterialTasks, setInstallationMaterialTasks] = useState<TaskWithMetadata[]>([]);
  const [weldingLaborTasks, setWeldingLaborTasks] = useState<TaskWithMetadata[]>([]);
  const [sewingLaborTasks, setSewingLaborTasks] = useState<TaskWithMetadata[]>([]);
  const [powderCoatTasks, setPowderCoatTasks] = useState<TaskWithMetadata[]>([]);
  const [installationTasks, setInstallationTasks] = useState<TaskWithMetadata[]>([]);
  const [rentalEquipmentTasks, setRentalEquipmentTasks] = useState<TaskWithMetadata[]>([]);
  
  const [crewMembersNeeded, setCrewMembersNeeded] = useState('2');
  const [crewHoursNeeded, setCrewHoursNeeded] = useState('4');
  const [siteReadyDate, setSiteReadyDate] = useState('');
  const [installDeadline, setInstallDeadline] = useState('');
  const [installNotes, setInstallNotes] = useState('');
  const [powderCoatEta, setPowderCoatEta] = useState('');
  const [powderCoatNotes, setPowderCoatNotes] = useState('');
  const [powderCoatColor, setPowderCoatColor] = useState('');

  const addTaskToArea = (area: string, task: TaskWithMetadata) => {
    if (!task.name.trim()) return;
    
    switch (area) {
      case 'weldingMaterials':
        setWeldingMaterialTasks([...weldingMaterialTasks, task]);
        break;
      case 'sewingMaterials':
        setSewingMaterialTasks([...sewingMaterialTasks, task]);
        break;
      case 'installationMaterials':
        setInstallationMaterialTasks([...installationMaterialTasks, task]);
        break;
      case 'weldingLabor':
        setWeldingLaborTasks([...weldingLaborTasks, task]);
        break;
      case 'sewingLabor':
        setSewingLaborTasks([...sewingLaborTasks, task]);
        break;
      case 'powderCoat':
        setPowderCoatTasks([...powderCoatTasks, task]);
        break;
      case 'installation':
        setInstallationTasks([...installationTasks, task]);
        break;
      case 'rentalEquipment':
        setRentalEquipmentTasks([...rentalEquipmentTasks, task]);
        break;
    }
  };

  const removeTaskFromArea = (area: string, index: number) => {
    switch (area) {
      case 'weldingMaterials':
        setWeldingMaterialTasks(weldingMaterialTasks.filter((_, i) => i !== index));
        break;
      case 'sewingMaterials':
        setSewingMaterialTasks(sewingMaterialTasks.filter((_, i) => i !== index));
        break;
      case 'installationMaterials':
        setInstallationMaterialTasks(installationMaterialTasks.filter((_, i) => i !== index));
        break;
      case 'weldingLabor':
        setWeldingLaborTasks(weldingLaborTasks.filter((_, i) => i !== index));
        break;
      case 'sewingLabor':
        setSewingLaborTasks(sewingLaborTasks.filter((_, i) => i !== index));
        break;
      case 'powderCoat':
        setPowderCoatTasks(powderCoatTasks.filter((_, i) => i !== index));
        break;
      case 'installation':
        setInstallationTasks(installationTasks.filter((_, i) => i !== index));
        break;
      case 'rentalEquipment':
        setRentalEquipmentTasks(rentalEquipmentTasks.filter((_, i) => i !== index));
        break;
    }
  };

  return {
    phaseName,
    setPhaseName,
    phaseNumber,
    setPhaseNumber,
    isSubmitting,
    setIsSubmitting,
    weldingMaterialTasks,
    sewingMaterialTasks,
    installationMaterialTasks,
    weldingLaborTasks,
    sewingLaborTasks,
    powderCoatTasks,
    installationTasks,
    rentalEquipmentTasks,
    crewMembersNeeded,
    setCrewMembersNeeded,
    crewHoursNeeded,
    setCrewHoursNeeded,
    siteReadyDate,
    setSiteReadyDate,
    installDeadline,
    setInstallDeadline,
    installNotes,
    setInstallNotes,
    powderCoatEta,
    setPowderCoatEta,
    powderCoatNotes,
    setPowderCoatNotes,
    powderCoatColor,
    setPowderCoatColor,
    addTaskToArea,
    removeTaskFromArea
  };
}
