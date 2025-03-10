
import { supabase } from '../supabase/client';
import { Job, Task, TaskStatus } from '../types';

export async function getTasksForJob(jobId: string): Promise<Task[]> {
  if (!jobId) {
    console.error('Job ID is required to fetch tasks');
    return [];
  }

  try {
    // Optimize by using a direct join instead of multiple queries
    const { data, error } = await supabase
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
      .eq('phases.job_id', jobId)
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

// Get all tasks with details (used in tasks page) - Optimized for better performance
export async function getAllTasksWithDetails(): Promise<Task[]> {
  try {
    // Optimize by selecting only needed fields and using more efficient join
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        phase_id,
        area,
        name,
        is_complete,
        status,
        hours,
        eta,
        notes,
        created_at,
        updated_at,
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
      .order('created_at', { ascending: false })
      .limit(500); // Add reasonable limit for better performance
      
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

// Optimized query for active user on a task
export async function getActiveUserForTask(taskId: string) {
  try {
    // Use a more efficient join query
    const { data, error } = await supabase
      .from('task_time_entries')
      .select(`
        user_id,
        profiles:user_id (
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .eq('task_id', taskId)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active task time entry:', error);
      return null;
    }

    if (!data || !data.profiles) {
      return null;
    }

    // Fix the type issue by properly checking if profiles exists and has the right properties
    const profile = data.profiles;
    if (!profile) {
      return null;
    }

    return {
      userId: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      profilePictureUrl: profile.profile_picture_url
    };
  } catch (error) {
    console.error('Error getting active user for task:', error);
    return null;
  }
}
