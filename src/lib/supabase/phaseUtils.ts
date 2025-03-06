import { supabase, Json } from "./client";
import { Phase, Material, Labor, PowderCoat, Installation } from '../types';
import { logActivity } from "./activityLogUtils";

// Get all phases for a job
export const getPhasesForJob = async (jobId: string): Promise<Phase[]> => {
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('job_id', jobId)
    .order('phase_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching phases:', error);
    throw error;
  }
  
  // Transform the data to match our types with proper type assertions
  return (data || []).map(phase => ({
    id: phase.id,
    jobId: phase.job_id,
    phaseName: phase.phase_name,
    phaseNumber: phase.phase_number,
    weldingMaterials: phase.welding_materials as unknown as Material,
    sewingMaterials: phase.sewing_materials as unknown as Material,
    weldingLabor: phase.welding_labor as unknown as Labor,
    sewingLabor: phase.sewing_labor as unknown as Labor,
    installationMaterials: phase.installation_materials as unknown as Material,
    powderCoat: phase.powder_coat as unknown as PowderCoat,
    installation: phase.installation as unknown as Installation,
    isComplete: phase.is_complete,
    createdAt: phase.created_at,
    updatedAt: phase.updated_at
  }));
};

// Get phase by ID
export const getPhaseById = async (jobId: string, phaseId: string): Promise<Phase | undefined> => {
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('id', phaseId)
    .eq('job_id', jobId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return undefined;
    }
    console.error('Error fetching phase:', error);
    throw error;
  }
  
  if (!data) return undefined;
  
  // Transform the data to match our types with proper type assertions
  return {
    id: data.id,
    jobId: data.job_id,
    phaseName: data.phase_name,
    phaseNumber: data.phase_number,
    weldingMaterials: data.welding_materials as unknown as Material,
    sewingMaterials: data.sewing_materials as unknown as Material,
    weldingLabor: data.welding_labor as unknown as Labor,
    sewingLabor: data.sewing_labor as unknown as Labor,
    installationMaterials: data.installation_materials as unknown as Material,
    powderCoat: data.powder_coat as unknown as PowderCoat,
    installation: data.installation as unknown as Installation,
    isComplete: data.is_complete,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Create a new phase object (not saved to the database yet)
export const createNewPhase = (jobId: string, phaseName: string, phaseNumber: number): Phase => {
  const timestamp = new Date().toISOString();
  
  return {
    id: '', // This will be replaced when the phase is saved to the database
    jobId,
    phaseName,
    phaseNumber,
    weldingMaterials: { status: 'not-ordered' },
    sewingMaterials: { status: 'not-ordered' },
    weldingLabor: { status: 'not-needed' },
    sewingLabor: { status: 'not-needed' },
    installationMaterials: { status: 'not-ordered' },
    powderCoat: { status: 'not-needed' },
    installation: {
      status: 'not-started',
      crewMembersNeeded: 2,
      crewHoursNeeded: 4,
      rentalEquipment: { status: 'not-needed' }
    },
    isComplete: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

// Add a phase to a job
export const addPhaseToJob = async (jobId: string, phase: Phase): Promise<boolean> => {
  // Check if phase number already exists for this job
  const existingPhases = await getPhasesForJob(jobId);
  if (existingPhases.some(p => p.phaseNumber === phase.phaseNumber)) {
    throw new Error(`Phase number ${phase.phaseNumber} already exists for this job`);
  }
  
  // Define the data structure explicitly to match the database schema
  // Use type assertion to convert our custom types to Json for Supabase
  const phaseData = {
    job_id: jobId,
    phase_name: phase.phaseName,
    phase_number: phase.phaseNumber,
    welding_materials: phase.weldingMaterials as unknown as Json,
    sewing_materials: phase.sewingMaterials as unknown as Json,
    welding_labor: phase.weldingLabor as unknown as Json,
    sewing_labor: phase.sewingLabor as unknown as Json,
    installation_materials: phase.installationMaterials as unknown as Json,
    powder_coat: phase.powderCoat as unknown as Json,
    installation: phase.installation as unknown as Json,
    is_complete: phase.isComplete
  };
  
  const { data, error } = await supabase
    .from('phases')
    .insert(phaseData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding phase:', error);
    throw error;
  }
  
  // Log the activity
  await logActivity({
    jobId,
    phaseId: data.id,
    activityType: 'phase_added',
    description: `Phase ${phase.phaseNumber}: ${phase.phaseName} was added to the job`
  });
  
  // Update the job's updated_at timestamp
  await supabase
    .from('jobs')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', jobId);
  
  return true;
};

// Update a phase
export const updatePhase = async (jobId: string, phaseId: string, phaseData: Partial<Phase>): Promise<Phase | undefined> => {
  // Check if phase number is being changed and already exists
  if (phaseData.phaseNumber !== undefined) {
    const currentPhase = await getPhaseById(jobId, phaseId);
    if (!currentPhase) return undefined;
    
    if (phaseData.phaseNumber !== currentPhase.phaseNumber) {
      const existingPhases = await getPhasesForJob(jobId);
      if (existingPhases.some(p => p.phaseNumber === phaseData.phaseNumber && p.id !== phaseId)) {
        throw new Error(`Phase number ${phaseData.phaseNumber} already exists for this job`);
      }
    }
  }
  
  const updateData: any = {};
  
  // Check if we're updating installation status to 'complete'
  let shouldMarkPhaseComplete = false;
  if (phaseData.installation?.status === 'complete') {
    shouldMarkPhaseComplete = true;
  }
  
  if (phaseData.phaseName !== undefined) updateData.phase_name = phaseData.phaseName;
  if (phaseData.phaseNumber !== undefined) updateData.phase_number = phaseData.phaseNumber;
  if (phaseData.weldingMaterials !== undefined) updateData.welding_materials = phaseData.weldingMaterials;
  if (phaseData.sewingMaterials !== undefined) updateData.sewing_materials = phaseData.sewingMaterials;
  if (phaseData.weldingLabor !== undefined) updateData.welding_labor = phaseData.weldingLabor;
  if (phaseData.sewingLabor !== undefined) updateData.sewing_labor = phaseData.sewingLabor;
  if (phaseData.installationMaterials !== undefined) updateData.installation_materials = phaseData.installationMaterials;
  if (phaseData.powderCoat !== undefined) updateData.powder_coat = phaseData.powderCoat;
  if (phaseData.installation !== undefined) updateData.installation = phaseData.installation;
  if (phaseData.isComplete !== undefined) updateData.is_complete = phaseData.isComplete;
  
  // Auto-mark phase as complete when installation is complete
  if (shouldMarkPhaseComplete) {
    updateData.is_complete = true;
  }
  
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('phases')
    .update(updateData)
    .eq('id', phaseId)
    .eq('job_id', jobId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating phase:', error);
    throw error;
  }
  
  if (!data) return undefined;
  
  // Update the job's updated_at timestamp
  await supabase
    .from('jobs')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', jobId);
  
  // Transform the data to match our types with proper type assertions
  return {
    id: data.id,
    jobId: data.job_id,
    phaseName: data.phase_name,
    phaseNumber: data.phase_number,
    weldingMaterials: data.welding_materials as unknown as Material,
    sewingMaterials: data.sewing_materials as unknown as Material,
    weldingLabor: data.welding_labor as unknown as Labor,
    sewingLabor: data.sewing_labor as unknown as Labor,
    installationMaterials: data.installation_materials as unknown as Material,
    powderCoat: data.powder_coat as unknown as PowderCoat,
    installation: data.installation as unknown as Installation,
    isComplete: data.is_complete,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Delete a phase
export const deletePhase = async (jobId: string, phaseId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('phases')
    .delete()
    .eq('id', phaseId)
    .eq('job_id', jobId);
  
  if (error) {
    console.error('Error deleting phase:', error);
    throw error;
  }
  
  // Update the job's updated_at timestamp
  await supabase
    .from('jobs')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', jobId);
  
  return true;
};

// Mark a phase as complete
export const markPhaseComplete = async (jobId: string, phaseId: string, isComplete: boolean = true): Promise<boolean> => {
  const currentPhase = await getPhaseById(jobId, phaseId);
  const result = await updatePhase(jobId, phaseId, { isComplete });
  
  // Log the activity
  if (result && currentPhase) {
    await logActivity({
      jobId,
      phaseId,
      activityType: 'phase_update',
      description: isComplete 
        ? `Phase ${currentPhase.phaseNumber}: ${currentPhase.phaseName} was marked as complete` 
        : `Phase ${currentPhase.phaseNumber}: ${currentPhase.phaseName} was marked as incomplete`,
      previousValue: { isComplete: currentPhase.isComplete },
      newValue: { isComplete }
    });
  }
  
  return result !== undefined;
};
