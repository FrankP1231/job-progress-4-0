
import { supabase } from '../supabase/client';
import { Job, Task } from '../types';

export async function getTasksForJob(jobId: string): Promise<Task[]> {
  if (!jobId) {
    console.error('Job ID is required to fetch tasks');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('phase_id', (
        await supabase
          .from('phases')
          .select('id')
          .eq('job_id', jobId)
      ).data?.map(phase => phase.id))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks for job:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTasksForJob:', error);
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
