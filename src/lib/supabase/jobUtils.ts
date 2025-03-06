import { supabase, Json } from "./client";
import { Job, Phase, Material, Labor, PowderCoat, Installation } from '../types';
import { logActivity } from "./activityLogUtils";

// Get all jobs (with their phases)
export const getAllJobs = async (): Promise<Job[]> => {
  // Fetch all jobs
  const { data: jobsData, error: jobsError } = await supabase
    .from('jobs')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (jobsError) {
    console.error('Error fetching jobs:', jobsError);
    throw jobsError;
  }
  
  // Transform jobs data
  const jobs: Job[] = (jobsData || []).map(job => ({
    id: job.id,
    jobNumber: job.job_number,
    projectName: job.project_name,
    buyer: job.buyer,
    title: job.title,
    salesman: job.salesman,
    drawingsUrl: job.drawings_url,
    worksheetUrl: job.worksheet_url,
    phases: [], // Will be populated later
    createdAt: job.created_at,
    updatedAt: job.updated_at
  }));
  
  // Fetch phases for all jobs
  if (jobs.length > 0) {
    const jobIds = jobs.map(job => job.id);
    
    const { data: phasesData, error: phasesError } = await supabase
      .from('phases')
      .select('*')
      .in('job_id', jobIds)
      .order('phase_number', { ascending: true });
    
    if (phasesError) {
      console.error('Error fetching phases:', phasesError);
      throw phasesError;
    }
    
    // Group phases by job_id
    const phasesByJobId: { [key: string]: Phase[] } = {};
    
    (phasesData || []).forEach(phase => {
      if (!phasesByJobId[phase.job_id]) {
        phasesByJobId[phase.job_id] = [];
      }
      
      phasesByJobId[phase.job_id].push({
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
      });
    });
    
    // Assign phases to jobs
    jobs.forEach(job => {
      job.phases = phasesByJobId[job.id] || [];
    });
  }
  
  return jobs;
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
  const { getPhasesForJob } = await import('./phaseUtils');
  const phases = await getPhasesForJob(id);
  
  // Transform the data to match our types
  return {
    id: data.id,
    jobNumber: data.job_number,
    projectName: data.project_name,
    buyer: data.buyer,
    title: data.title,
    salesman: data.salesman, // Field name stays the same for database compatibility
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
  const { getPhasesForJob } = await import('./phaseUtils');
  const phases = await getPhasesForJob(data.id);
  
  // Transform the data to match our types
  return {
    id: data.id,
    jobNumber: data.job_number,
    projectName: data.project_name,
    buyer: data.buyer,
    title: data.title,
    salesman: data.salesman, // Field name stays the same for database compatibility
    drawingsUrl: data.drawings_url,
    worksheetUrl: data.worksheet_url,
    phases: phases,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Search jobs
export const searchJobs = async (query: string): Promise<Job[]> => {
  if (!query.trim()) return [];
  
  const searchTerm = `%${query.trim().toLowerCase()}%`;
  
  // Search in job_number, project_name, buyer, title, and salesman fields
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .or(`job_number.ilike.${searchTerm},project_name.ilike.${searchTerm},buyer.ilike.${searchTerm},title.ilike.${searchTerm},salesman.ilike.${searchTerm}`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
  
  // Transform the data to match our types
  const jobs = (data || []).map(job => ({
    ...job,
    id: job.id,
    jobNumber: job.job_number,
    projectName: job.project_name,
    drawingsUrl: job.drawings_url,
    worksheetUrl: job.worksheet_url,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    phases: [] // We don't need to fetch phases for search results
  }));
  
  return jobs;
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
      salesman: jobData.salesman || '', // Field name stays the same for database compatibility
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
    salesman: data.salesman, // Field name stays the same for database compatibility
    drawingsUrl: data.drawings_url,
    worksheetUrl: data.worksheet_url,
    phases: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Update a job
export const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job | undefined> => {
  try {
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
      
      // Log the changes for activity tracking
      const changes: string[] = [];
      if (jobData.jobNumber !== currentJob.jobNumber) changes.push(`Job Number: ${currentJob.jobNumber} → ${jobData.jobNumber}`);
      if (jobData.projectName !== currentJob.projectName) changes.push(`Project Name: ${currentJob.projectName} → ${jobData.projectName}`);
      if (jobData.buyer !== currentJob.buyer) changes.push(`Buyer: ${currentJob.buyer} → ${jobData.buyer}`);
      if (jobData.salesman !== currentJob.salesman) changes.push(`Project Manager: ${currentJob.salesman} → ${jobData.salesman}`);
      
      // For URLs, only log if they've changed and aren't empty
      if (jobData.drawingsUrl !== currentJob.drawingsUrl) {
        if (!currentJob.drawingsUrl && jobData.drawingsUrl) {
          changes.push("Drawings URL added");
        } else if (currentJob.drawingsUrl && !jobData.drawingsUrl) {
          changes.push("Drawings URL removed");
        } else if (currentJob.drawingsUrl && jobData.drawingsUrl) {
          changes.push("Drawings URL updated");
        }
      }
      
      if (jobData.worksheetUrl !== currentJob.worksheetUrl) {
        if (!currentJob.worksheetUrl && jobData.worksheetUrl) {
          changes.push("Worksheet URL added");
        } else if (currentJob.worksheetUrl && !jobData.worksheetUrl) {
          changes.push("Worksheet URL removed");
        } else if (currentJob.worksheetUrl && jobData.worksheetUrl) {
          changes.push("Worksheet URL updated");
        }
      }
      
      // Only log activity if there are actual changes
      if (changes.length > 0) {
        await logActivity({
          jobId: id,
          activityType: 'job_update',
          description: `Job details updated: ${changes.join(", ")}`,
          previousValue: {
            jobNumber: currentJob.jobNumber,
            projectName: currentJob.projectName,
            buyer: currentJob.buyer,
            salesman: currentJob.salesman,
            drawingsUrl: currentJob.drawingsUrl,
            worksheetUrl: currentJob.worksheetUrl
          },
          newValue: jobData
        });
      }
    }
  } catch (error) {
    console.error('Error preparing job update:', error);
    throw error;
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .update({
      job_number: jobData.jobNumber,
      project_name: jobData.projectName,
      buyer: jobData.buyer,
      title: jobData.title,
      salesman: jobData.salesman, // Field name stays the same for database compatibility
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
  const { getPhasesForJob } = await import('./phaseUtils');
  const phases = await getPhasesForJob(id);
  
  // Transform the data to match our types
  return {
    id: data.id,
    jobNumber: data.job_number,
    projectName: data.project_name,
    buyer: data.buyer,
    title: data.title,
    salesman: data.salesman, // Field name stays the same for database compatibility
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
