
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
    updatedAt: task.updated_at
  };
};
