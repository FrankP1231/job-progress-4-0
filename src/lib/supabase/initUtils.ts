
import { supabase } from "./client";
import { v4 as uuidv4 } from 'uuid';
import { Phase } from '../types';
import { Json } from './client';

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
      status: 'not-started',
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
  // Convert our typed objects to Json for Supabase
  const phaseData = {
    id: phase.id,
    job_id: jobId,
    phase_name: phase.phaseName,
    phase_number: phase.phaseNumber,
    welding_materials: phase.weldingMaterials as unknown as Json,
    sewing_materials: phase.sewingMaterials as unknown as Json,
    installation_materials: phase.installationMaterials as unknown as Json,
    welding_labor: phase.weldingLabor as unknown as Json,
    sewing_labor: phase.sewingLabor as unknown as Json,
    powder_coat: phase.powderCoat as unknown as Json,
    installation: phase.installation as unknown as Json,
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
  
  // Transform the data from Supabase to match our Phase type with proper type assertions
  return {
    id: data.id,
    jobId: data.job_id,
    phaseName: data.phase_name,
    phaseNumber: data.phase_number,
    weldingMaterials: data.welding_materials as unknown as Phase['weldingMaterials'],
    sewingMaterials: data.sewing_materials as unknown as Phase['sewingMaterials'],
    installationMaterials: data.installation_materials as unknown as Phase['installationMaterials'],
    weldingLabor: data.welding_labor as unknown as Phase['weldingLabor'],
    sewingLabor: data.sewing_labor as unknown as Phase['sewingLabor'],
    powderCoat: data.powder_coat as unknown as Phase['powderCoat'],
    installation: data.installation as unknown as Phase['installation'],
    isComplete: data.is_complete,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
