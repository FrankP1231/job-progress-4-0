import { supabase } from "../supabase/client";
import { Task, TaskStatus } from '../types';

// Define interfaces to match Supabase's nested response structure
interface JobResponse {
  id?: string;
  job_number?: string;
  project_name?: string;
}

interface PhaseResponse {
  id?: string;
  phase_name?: string;
  phase_number?: number;
  job_id?: string;
  jobs?: JobResponse;
}

interface TaskResponse {
  id: string;
  phase_id: string;
  area: string;
  name: string;
  is_complete: boolean;
  status: string;
  hours?: number;
  eta?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // The joined data from phases table
  phases?: PhaseResponse;
}

// Get job ID for a phase
export const getJobIdForPhase = async (phaseId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('phases')
    .select('job_id')
    .eq('id', phaseId)
    .single();
  
  if (error) {
    console.error('Error getting job ID for phase:', error);
    return null;
  }
  
  return data?.job_id || null;
};

// Transform task data from database to our Task type
export const transformTaskData = (task: any): Task => {
  return {
    id: task.id,
    phaseId: task.phase_id,
    area: task.area,
    name: task.name,
    isComplete: task.is_complete,
    status: task.status as TaskStatus,
    hours: task.hours,
    eta: task.eta,
    notes: task.notes,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    // Additional fields from joins
    jobId: task.job_id,
    jobNumber: task.job_number,
    projectName: task.project_name,
    phaseNumber: task.phase_number,
    phaseName: task.phase_name
  };
};

// Get all tasks with phase and job data
export const getAllTasksWithDetails = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      phases:phase_id (
        id,
        phase_name,
        phase_number,
        job_id,
        jobs:job_id (
          id,
          job_number,
          project_name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks with details:', error);
    throw error;
  }
  
  // Cast the data as our defined interface for proper typing
  const typedData = (data || []) as TaskResponse[];
  
  // Transform the data to match our Task type
  return typedData.map(task => {
    // Create properly typed default objects for phases and jobs
    const defaultPhase: PhaseResponse = {
      phase_name: 'Unknown Phase',
      phase_number: 0,
      job_id: '',
      jobs: {
        job_number: 'Unknown',
        project_name: ''
      }
    };
    
    // Get phases data with defaults
    const phases = task.phases || defaultPhase;
    
    // Get jobs data with defaults
    const jobs = phases.jobs || defaultPhase.jobs;
    
    // Create properly typed variables with safeguards
    const phaseNumber = phases.phase_number !== undefined ? Number(phases.phase_number) : 0;
    const phaseName = phases.phase_name !== undefined ? String(phases.phase_name) : 'Unknown Phase';
    const jobId = phases.job_id !== undefined ? String(phases.job_id) : '';
    const jobNumber = jobs.job_number !== undefined ? String(jobs.job_number) : 'Unknown';
    const projectName = jobs.project_name !== undefined ? String(jobs.project_name) : '';

    return {
      id: task.id,
      phaseId: task.phase_id,
      area: task.area,
      name: task.name,
      isComplete: task.is_complete,
      status: task.status as TaskStatus,
      hours: task.hours,
      eta: task.eta,
      notes: task.notes,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      
      // Additional fields with proper type assignments
      jobId: jobId,
      jobNumber: jobNumber,
      projectName: projectName,
      phaseNumber: phaseNumber,
      phaseName: phaseName
    };
  });
};

// New function to get all tasks for a specific job
export const getTasksForJob = async (jobId: string): Promise<Task[]> => {
  // First get all phases for the job
  const { data: phases, error: phasesError } = await supabase
    .from('phases')
    .select('id')
    .eq('job_id', jobId);
  
  if (phasesError) {
    console.error('Error fetching phases for job:', phasesError);
    throw phasesError;
  }
  
  if (!phases || phases.length === 0) {
    return [];
  }
  
  // Get all tasks for these phases
  const phaseIds = phases.map(phase => phase.id);
  
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      *,
      phases:phase_id (
        id,
        phase_name,
        phase_number,
        job_id
      )
    `)
    .in('phase_id', phaseIds)
    .order('created_at', { ascending: true });
  
  if (tasksError) {
    console.error('Error fetching tasks for job phases:', tasksError);
    throw tasksError;
  }
  
  // Transform the tasks data
  return (tasks || []).map(task => {
    return {
      id: task.id,
      phaseId: task.phase_id,
      area: task.area,
      name: task.name,
      isComplete: task.is_complete,
      status: task.status as TaskStatus,
      hours: task.hours,
      eta: task.eta,
      notes: task.notes,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      
      // Add phase data
      phaseName: task.phases?.phase_name || 'Unknown Phase',
      phaseNumber: task.phases?.phase_number || 0,
      jobId: task.phases?.job_id || jobId
    };
  });
};

// Function to get the active user for a task
export const getActiveUserForTask = async (taskId: string) => {
  try {
    // First check if there's an active task time entry
    const { data: timeEntry, error: timeEntryError } = await supabase
      .from('task_time_entries')
      .select('user_id')
      .eq('task_id', taskId)
      .is('end_time', null)  // not completed
      .eq('is_paused', false) // not paused
      .maybeSingle();
    
    if (timeEntryError) {
      console.error('Error fetching active time entry:', timeEntryError);
      return null;
    }
    
    if (!timeEntry) return null;
    
    // Get user profile data
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('first_name, last_name, profile_picture_url')
      .eq('id', timeEntry.user_id)
      .maybeSingle();
    
    if (userError) {
      console.error('Error fetching user profile:', userError);
      return null;
    }
    
    if (!userProfile) return null;
    
    return {
      userId: timeEntry.user_id,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      profilePictureUrl: userProfile.profile_picture_url
    };
  } catch (error) {
    console.error('Error in getActiveUserForTask:', error);
    return null;
  }
};
