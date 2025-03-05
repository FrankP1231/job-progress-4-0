import { supabase } from "@/integrations/supabase/client";
import { Job, Phase, Material, Labor, PowderCoat, Installation, RentalEquipment } from './types';

// Get all jobs
export const getAllJobs = async (): Promise<Job[]> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
  
  // Transform the data to match our types
  return (data || []).map(job => ({
    ...job,
    id: job.id,
    jobNumber: job.job_number,
    projectName: job.project_name,
    drawingsUrl: job.drawings_url,
    worksheetUrl: job.worksheet_url,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    phases: [] // We'll fetch phases separately
  }));
};

// Get job by ID
export const getJobById = async (id: string): Promise<Job | undefined> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return undefined;
    }
    console.error('Error fetching job:', error);
    throw error;
  }
  
  if (!data) return undefined;
  
  // Get phases for this job
  const phases = await getPhasesForJob(id);
  
  // Transform the data to match our types
  return {
    id: data.id,
    jobNumber: data.job_number,
    projectName: data.project_name,
    buyer: data.buyer,
    title: data.title,
    salesman: data.salesman,
    drawingsUrl: data.drawings_url,
    worksheetUrl: data.worksheet_url,
    phases: phases,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Get job by job number
export const getJobByNumber = async (jobNumber: string): Promise<Job | undefined> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_number', jobNumber)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return undefined;
    }
    console.error('Error fetching job:', error);
    throw error;
  }
  
  if (!data) return undefined;
  
  // Get phases for this job
  const phases = await getPhasesForJob(data.id);
  
  // Transform the data to match our types
  return {
    id: data.id,
    jobNumber: data.job_number,
    projectName: data.project_name,
    buyer: data.buyer,
    title: data.title,
    salesman: data.salesman,
    drawingsUrl: data.drawings_url,
    worksheetUrl: data.worksheet_url,
    phases: phases,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Create a new job
export const createJob = async (jobData: Partial<Job>): Promise<Job> => {
  // Check if job number already exists
  if (jobData.jobNumber) {
    const existingJob = await getJobByNumber(jobData.jobNumber);
    if (existingJob) {
      throw new Error(`Job number ${jobData.jobNumber} already exists`);
    }
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      job_number: jobData.jobNumber || '',
      project_name: jobData.projectName || '',
      buyer: jobData.buyer || '',
      title: jobData.title || '',
      salesman: jobData.salesman || '',
      drawings_url: jobData.drawingsUrl,
      worksheet_url: jobData.worksheetUrl
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating job:', error);
    throw error;
  }
  
  // Transform the data to match our types
  return {
    id: data.id,
    jobNumber: data.job_number,
    projectName: data.project_name,
    buyer: data.buyer,
    title: data.title,
    salesman: data.salesman,
    drawingsUrl: data.drawings_url,
    worksheetUrl: data.worksheet_url,
    phases: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Update a job
export const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job | undefined> => {
  // Check if job number is being changed and already exists
  if (jobData.jobNumber) {
    const currentJob = await getJobById(id);
    if (!currentJob) return undefined;
    
    if (jobData.jobNumber !== currentJob.jobNumber) {
      const existingJob = await getJobByNumber(jobData.jobNumber);
      if (existingJob && existingJob.id !== id) {
        throw new Error(`Job number ${jobData.jobNumber} already exists`);
      }
    }
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .update({
      job_number: jobData.jobNumber,
      project_name: jobData.projectName,
      buyer: jobData.buyer,
      title: jobData.title,
      salesman: jobData.salesman,
      drawings_url: jobData.drawingsUrl,
      worksheet_url: jobData.worksheetUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating job:', error);
    throw error;
  }
  
  if (!data) return undefined;
  
  // Get phases for this job
  const phases = await getPhasesForJob(id);
  
  // Transform the data to match our types
  return {
    id: data.id,
    jobNumber: data.job_number,
    projectName: data.project_name,
    buyer: data.buyer,
    title: data.title,
    salesman: data.salesman,
    drawingsUrl: data.drawings_url,
    worksheetUrl: data.worksheet_url,
    phases: phases,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Delete a job
export const deleteJob = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
  
  return true;
};

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

// Create a new phase
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
  
  const { data, error } = await supabase
    .from('phases')
    .insert({
      job_id: jobId,
      phase_name: phase.phaseName,
      phase_number: phase.phaseNumber,
      welding_materials: phase.weldingMaterials,
      sewing_materials: phase.sewingMaterials,
      welding_labor: phase.weldingLabor,
      sewing_labor: phase.sewingLabor,
      installation_materials: phase.installationMaterials,
      powder_coat: phase.powderCoat,
      installation: phase.installation,
      is_complete: phase.isComplete
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding phase:', error);
    throw error;
  }
  
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
  const result = await updatePhase(jobId, phaseId, { isComplete });
  return result !== undefined;
};

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
      installation: item.installation as unknown as Installation,
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

// Initialize with some sample data if needed (for development)
export const initSampleData = async (): Promise<void> => {
  const { count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error checking job count:', error);
    return;
  }
  
  if (count === 0) {
    try {
      // Create a sample job
      const sampleJob = await createJob({
        jobNumber: 'J2023-001',
        projectName: 'Downtown Cafe Awnings',
        buyer: 'Jane Smith',
        title: 'Cafe Awning Installation',
        salesman: 'Bob Johnson'
      });
      
      // Create some phases for the sample job
      const phase1 = createNewPhase(sampleJob.id, 'Front Entrance', 1);
      const phase2 = createNewPhase(sampleJob.id, 'Side Patio', 2);
      
      await addPhaseToJob(sampleJob.id, phase1);
      await addPhaseToJob(sampleJob.id, phase2);
      
      console.log('Sample data initialized successfully');
    } catch (err) {
      console.error('Error initializing sample data:', err);
    }
  }
};
