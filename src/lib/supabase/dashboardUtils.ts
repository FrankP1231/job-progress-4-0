
import { supabase, Json } from "./client";
import { Job, Phase, Material, Labor, PowderCoat, Installation } from '../types';

// Get all in-progress phases across all jobs
export const getInProgressPhases = async (): Promise<{ job: Job, phase: Phase }[]> => {
  // Get all phases that are not complete
  const { data: phaseData, error: phaseError } = await supabase
    .from('phases')
    .select('*, jobs(*)')
    .eq('is_complete', false)
    .order('phase_number', { ascending: true });
  
  if (phaseError) {
    console.error('Error fetching in-progress phases:', phaseError);
    throw phaseError;
  }
  
  const result: { job: Job, phase: Phase }[] = [];
  
  for (const item of phaseData || []) {
    // Process installation data properly - this was causing the error
    let installation: Installation = {
      status: 'not-started',
      crewHoursNeeded: 0,
      crewMembersNeeded: 0,
      rentalEquipment: { status: 'not-needed' }
    };
    
    // Check if installation data exists and extract status properly
    if (item.installation) {
      // Fix the nested status object issue
      if (typeof item.installation === 'object') {
        if (item.installation.status && typeof item.installation.status === 'object' && 'status' in item.installation.status) {
          // Handle nested status object
          installation = {
            status: item.installation.status.status as 'not-started' | 'scheduled' | 'in-progress' | 'complete',
            crewHoursNeeded: item.installation.crewHoursNeeded || 0,
            crewMembersNeeded: item.installation.crewMembersNeeded || 0,
            rentalEquipment: item.installation.rentalEquipment || { status: 'not-needed' }
          };
        } else {
          // Handle flat status value
          installation = {
            status: (item.installation.status as string) || 'not-started',
            crewHoursNeeded: item.installation.crewHoursNeeded || 0,
            crewMembersNeeded: item.installation.crewMembersNeeded || 0,
            rentalEquipment: item.installation.rentalEquipment || { status: 'not-needed' }
          };
        }
      }
    }

    const phase: Phase = {
      id: item.id,
      jobId: item.job_id,
      phaseName: item.phase_name,
      phaseNumber: item.phase_number,
      weldingMaterials: item.welding_materials as unknown as Material,
      sewingMaterials: item.sewing_materials as unknown as Material,
      weldingLabor: item.welding_labor as unknown as Labor,
      sewingLabor: item.sewing_labor as unknown as Labor,
      installationMaterials: item.installation_materials as unknown as Material,
      powderCoat: item.powder_coat as unknown as PowderCoat,
      installation: installation,
      isComplete: item.is_complete,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
    
    const job: Job = {
      id: item.jobs.id,
      jobNumber: item.jobs.job_number,
      projectName: item.jobs.project_name,
      buyer: item.jobs.buyer,
      title: item.jobs.title,
      salesman: item.jobs.salesman,
      drawingsUrl: item.jobs.drawings_url,
      worksheetUrl: item.jobs.worksheet_url,
      phases: [], // We don't need all phases here
      createdAt: item.jobs.created_at,
      updatedAt: item.jobs.updated_at
    };
    
    result.push({ job, phase });
  }
  
  return result;
};
