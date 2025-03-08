
import { supabase } from "./client";
import { Task, TaskStatus } from '../types';

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
  
  // Transform and enhance task data
  return (data || []).map(task => {
    const phase = task.phases || {};
    const job = phase.jobs || {};
    
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
      jobId: job.id || phase.job_id,
      jobNumber: job.job_number || 'Unknown',
      projectName: job.project_name || '',
      phaseNumber: phase.phase_number || 0,
      phaseName: phase.phase_name || 'Unknown Phase'
    };
  });
};
