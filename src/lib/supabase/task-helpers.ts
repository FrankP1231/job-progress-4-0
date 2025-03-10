
import { supabase } from '../supabase/client';
import { Job, Task, TaskStatus } from '../types';

export async function getTasksForJob(jobId: string): Promise<Task[]> {
  if (!jobId) {
    console.error('Job ID is required to fetch tasks');
    return [];
  }

  try {
    // First, get all phase IDs for this job
    const { data: phaseData, error: phaseError } = await supabase
      .from('phases')
      .select('id')
      .eq('job_id', jobId);
      
    if (phaseError) {
      console.error('Error fetching phases for job:', phaseError);
      return [];
    }
    
    // Extract phase IDs from the result
    const phaseIds = phaseData.map(phase => phase.id);
    
    if (phaseIds.length === 0) {
      console.log('No phases found for job:', jobId);
      return [];
    }
    
    // Now fetch tasks for these phases using 'in' operator
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('phase_id', phaseIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks for job:', error);
      throw error;
    }

    return (data as any[] || []).map(transformTaskData);
  } catch (error) {
    console.error('Error in getTasksForJob:', error);
    return [];
  }
}

// Transform task data from database to match our Task type
export function transformTaskData(task: any): Task {
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
    // These might be null if not joined with other tables
    phaseNumber: task.phase_number,
    phaseName: task.phase_name,
    jobId: task.job_id,
    jobNumber: task.job_number,
    projectName: task.project_name,
  };
}

// Get job ID for a phase
export async function getJobIdForPhase(phaseId: string): Promise<string | null> {
  if (!phaseId) return null;
  
  try {
    const { data, error } = await supabase
      .from('phases')
      .select('job_id')
      .eq('id', phaseId)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting job ID for phase:', error);
      return null;
    }
    
    return data?.job_id || null;
  } catch (error) {
    console.error('Error in getJobIdForPhase:', error);
    return null;
  }
}

// Get all tasks with details (used in tasks page)
export async function getAllTasksWithDetails(): Promise<Task[]> {
  try {
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
    
    return (data || []).map((task: any) => ({
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
      // These come from the joined tables
      phaseNumber: task.phases?.phase_number,
      phaseName: task.phases?.phase_name,
      jobId: task.phases?.job_id,
      jobNumber: task.phases?.jobs?.job_number,
      projectName: task.phases?.jobs?.project_name,
    }));
  } catch (error) {
    console.error('Error in getAllTasksWithDetails:', error);
    return [];
  }
}

export async function getActiveUserForTask(taskId: string) {
  try {
    // First, get the active task time entry for this task
    const { data: taskTimeEntry, error: taskError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (taskError) {
      console.error('Error fetching active task time entry:', taskError);
      return null;
    }

    if (!taskTimeEntry) {
      // No active time entry found
      return null;
    }

    // Get the user details
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('userId:id, firstName:first_name, lastName:last_name, profilePictureUrl:profile_picture_url')
      .eq('id', taskTimeEntry.user_id)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error getting active user for task:', error);
    return null;
  }
}
