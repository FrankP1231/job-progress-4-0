
import { supabase } from './client';
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
    phaseNumber: task.phases?.phase_number,
    phaseName: task.phases?.phase_name,
    jobId: task.phases?.job_id,
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
          last_name
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

    // If no data or no profile data is returned
    if (!data || !data.profiles) {
      return null;
    }

    // Handle the profile data safely
    const profile = data.profiles as any;
    
    // Make sure we have valid profile data with required fields
    if (!profile || !profile.id) {
      return null;
    }

    return {
      userId: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name
    };
  } catch (error) {
    console.error('Error getting active user for task:', error);
    return null;
  }
}

// Get task assignees by task ID
export async function getTaskAssignees(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('task_assignments')
      .select(`
        id,
        user_id,
        assigned_at,
        profiles:user_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq('task_id', taskId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching task assignees:', error);
      return [];
    }

    // Transform data to a more usable format
    return (data || []).map(item => {
      const profile = item.profiles as any;
      
      return {
        id: item.id,
        userId: item.user_id,
        assignedAt: item.assigned_at,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || ''
      };
    });
  } catch (error) {
    console.error('Error getting task assignees:', error);
    return [];
  }
}

// Assign user to a task
export async function assignUserToTask(taskId: string, userId: string) {
  try {
    // Check if assignment already exists to avoid duplicates
    const { data: existingAssignment, error: checkError } = await supabase
      .from('task_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing assignment:', checkError);
      return false;
    }

    // If already assigned, just return true
    if (existingAssignment) {
      return true;
    }

    // Create new assignment
    const { error } = await supabase
      .from('task_assignments')
      .insert({
        task_id: taskId,
        user_id: userId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      console.error('Error assigning user to task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in assignUserToTask:', error);
    return false;
  }
}

// Remove user assignment from task
export async function removeTaskAssignment(taskId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('task_assignments')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing task assignment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeTaskAssignment:', error);
    return false;
  }
}
