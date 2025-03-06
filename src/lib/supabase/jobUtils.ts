import { supabase, Json } from "./client";
import { Job } from '../types';

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
  const jobs = (data || []).map(job => ({
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

  // Fetch phases for each job
  for (const job of jobs) {
    const { getPhasesForJob } = await import('./phaseUtils');
    job.phases = await getPhasesForJob(job.id);
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
  const { getPhasesForJob } = await import('./phaseUtils');
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
  const { getPhasesForJob } = await import('./phaseUtils');
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
