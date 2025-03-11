
import { supabase } from '../client';
import { Task } from '../../types';
import { transformTaskData } from './task-transform';

// Export functions from task-crud directly
export { 
  getTasksForPhase,
  getTasksForPhaseArea, 
  getTasksForAllJobs 
} from '../task-crud';

// Function to get all tasks for a specific job
export const getTasksForJob = async (jobId: string): Promise<Task[]> => {
  if (!jobId) {
    console.error('Job ID is required to fetch tasks');
    return [];
  }

  try {
    // First get all phases for this job
    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select('id')
      .eq('job_id', jobId);
    
    if (phasesError || !phases || phases.length === 0) {
      console.error('Error fetching phases for job:', phasesError);
      return [];
    }
    
    // Extract phase IDs
    const phaseIds = phases.map(phase => phase.id);
    
    // Then fetch all tasks for these phases
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        phases:phase_id (
          phase_number,
          phase_name,
          job_id,
          jobs:job_id (
            job_number,
            project_name
          )
        )
      `)
      .in('phase_id', phaseIds);
    
    if (error) {
      console.error('Error fetching tasks for job:', error);
      return [];
    }
    
    // Transform to our Task interface
    return data.map(transformTaskData);
  } catch (error) {
    console.error('Error in getTasksForJob:', error);
    return [];
  }
};

export const getJobIdForPhase = async (phaseId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('phases')
      .select('job_id')
      .eq('id', phaseId)
      .single();
    
    if (error || !data) {
      console.error('Error getting job ID for phase:', error);
      return null;
    }
    
    return data.job_id;
  } catch (error) {
    console.error('Error in getJobIdForPhase:', error);
    return null;
  }
};
