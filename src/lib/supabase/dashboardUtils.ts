import { supabase, Json } from "./client";
import { Job, Phase, Material, Labor, PowderCoat, Installation, InstallationStatus, RentalEquipmentStatus } from '../types';

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
      try {
        const installData = item.installation as Record<string, any>;
        
        // Handle potential nested status object
        let statusValue: InstallationStatus = 'not-started';
        if (installData.status) {
          if (typeof installData.status === 'object' && installData.status !== null && 'status' in installData.status) {
            // Get status from nested object
            const nestedStatus = installData.status.status;
            // Make sure it's a valid InstallationStatus
            statusValue = validateInstallationStatus(nestedStatus);
          } else if (typeof installData.status === 'string') {
            // Direct string status
            statusValue = validateInstallationStatus(installData.status);
          }
        }
        
        installation = {
          status: statusValue,
          crewHoursNeeded: Number(installData.crewHoursNeeded) || 0,
          crewMembersNeeded: Number(installData.crewMembersNeeded) || 0,
          rentalEquipment: {
            status: validateRentalStatus(installData.rentalEquipment?.status || 'not-needed')
          }
        };
      } catch (error) {
        console.error('Error processing installation data:', error);
        // Keep default values in case of error
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

// Helper function to validate installation status
function validateInstallationStatus(status: any): InstallationStatus {
  const validValues: InstallationStatus[] = ['not-started', 'in-progress', 'complete'];
  return validValues.includes(status as InstallationStatus) 
    ? (status as InstallationStatus) 
    : 'not-started';
}

// Helper function to validate rental equipment status
function validateRentalStatus(status: any): RentalEquipmentStatus {
  const validValues: RentalEquipmentStatus[] = ['not-needed', 'not-ordered', 'ordered'];
  return validValues.includes(status as RentalEquipmentStatus)
    ? (status as RentalEquipmentStatus)
    : 'not-needed';
}
