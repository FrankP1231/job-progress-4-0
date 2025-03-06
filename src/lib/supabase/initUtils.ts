
import { supabase } from "./client";
import { v4 as uuidv4 } from 'uuid';
import { Phase } from '../types';

export const createNewPhase = (
  jobId: string, 
  phaseName: string, 
  phaseNumber: number
): Partial<Phase> => {
  const phaseId = uuidv4();
  const now = new Date().toISOString();
  
  return {
    id: phaseId,
    jobId: jobId,
    phaseName: phaseName,
    phaseNumber: phaseNumber,
    weldingMaterials: {
      status: 'not-ordered'
    },
    sewingMaterials: {
      status: 'not-ordered'
    },
    installationMaterials: {
      status: 'not-ordered'
    },
    weldingLabor: {
      status: 'not-needed'
    },
    sewingLabor: {
      status: 'not-needed'
    },
    powderCoat: {
      status: 'not-needed'
    },
    installation: {
      status: 'not-started', // Add the missing status property
      crewMembersNeeded: 2,
      crewHoursNeeded: 4,
      rentalEquipment: {
        status: 'not-needed'
      }
    },
    isComplete: false,
    createdAt: now,
    updatedAt: now
  };
};

export const addPhaseToJob = async (jobId: string, phase: Partial<Phase>): Promise<Phase> => {
  // Prepare the phase data for insertion into the database
  const phaseData = {
    id: phase.id,
    job_id: jobId,
    phase_name: phase.phaseName,
    phase_number: phase.phaseNumber,
    welding_materials: phase.weldingMaterials,
    sewing_materials: phase.sewingMaterials,
    installation_materials: phase.installationMaterials,
    welding_labor: phase.weldingLabor,
    sewing_labor: phase.sewingLabor,
    powder_coat: phase.powderCoat,
    installation: phase.installation,
    is_complete: phase.isComplete || false,
    created_at: phase.createdAt || new Date().toISOString(),
    updated_at: phase.updatedAt || new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('phases')
    .insert(phaseData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding phase to job:', error);
    throw error;
  }
  
  // Transform the data to match our Phase type
  return {
    id: data.id,
    jobId: data.job_id,
    phaseName: data.phase_name,
    phaseNumber: data.phase_number,
    weldingMaterials: data.welding_materials,
    sewingMaterials: data.sewing_materials,
    installationMaterials: data.installation_materials,
    weldingLabor: data.welding_labor,
    sewingLabor: data.sewing_labor,
    powderCoat: data.powder_coat,
    installation: data.installation,
    isComplete: data.is_complete,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
