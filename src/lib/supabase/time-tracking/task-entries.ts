
// Implementation may vary based on your actual file structure

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TaskTimeEntry } from './types';

/**
 * Starts a timer for a specific task
 */
export const startTaskTimer = async (taskId: string, taskName: string): Promise<TaskTimeEntry | null> => {
  try {
    if (!taskId) {
      throw new Error('Task ID is required to start timer');
    }
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Check if there's already an active timer for this task
    const { data: activeEntry, error: checkError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .is('end_time', null)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking active task entry:', checkError);
      throw checkError;
    }
    
    if (activeEntry) {
      toast.warning('You already have an active timer for this task');
      return activeEntry;
    }
    
    // Get task details for assignment requirements
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('phase_id, name')
      .eq('id', taskId)
      .single();
      
    if (taskError) {
      console.error('Error getting task details:', taskError);
      throw taskError;
    }
    
    // Before starting the timer, check if the user is assigned to this task
    // If not, try to add them as an assignee (self-assignment)
    const { data: assignmentCheck, error: assignmentCheckError } = await supabase
      .from('task_assignees')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (assignmentCheckError) {
      console.log('Error checking assignment, but continuing:', assignmentCheckError);
      // Continue despite the error, don't block the user from starting the timer
    }
    
    // If user is not assigned, assign them (allow self-assignment)
    if (!assignmentCheck) {
      try {
        await supabase
          .from('task_assignees')
          .insert({
            task_id: taskId,
            user_id: user.id,
            role: 'Worker'
          });
      } catch (assignError) {
        console.error('Failed to auto-assign user to task, continuing with timer:', assignError);
        // Don't block timer start if assignment fails
      }
    }
    
    // No active session found, create new task timer
    const { data, error } = await supabase
      .from('task_time_entries')
      .insert({
        task_id: taskId,
        user_id: user.id,
        phase_id: taskData.phase_id,
        task_name: taskData.name || taskName
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error starting task timer:', error);
      throw error;
    }
    
    toast.success('Timer started for task');
    return data;
  } catch (error: any) {
    console.error('Error starting task timer:', error);
    toast.error(`Failed to start timer: ${error.message}`);
    throw error;
  }
};

/**
 * Pauses an active timer for a specific task
 */
export const pauseTaskTimer = async (taskId: string): Promise<TaskTimeEntry | null> => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Get the active task entry
    const { data: activeEntry, error: checkError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .is('end_time', null)
      .single();
      
    if (checkError) {
      console.error('Error checking active task entry:', checkError);
      throw checkError;
    }
    
    if (!activeEntry) {
      toast.error('No active timer found for this task');
      return null;
    }
    
    // Calculate duration in seconds
    const startTime = new Date(activeEntry.start_time);
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Update task entry with pause time
    const { data, error } = await supabase
      .from('task_time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        is_paused: true
      })
      .eq('id', activeEntry.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error pausing task timer:', error);
      throw error;
    }
    
    toast.success('Timer paused');
    return data;
  } catch (error: any) {
    console.error('Error pausing task timer:', error);
    toast.error(`Failed to pause timer: ${error.message}`);
    throw error;
  }
};

/**
 * Resumes a paused timer for a specific task
 */
export const resumeTaskTimer = async (taskId: string): Promise<TaskTimeEntry | null> => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Check if there's already an active timer for this task
    const { data: activeEntry, error: checkActiveError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .is('end_time', null)
      .maybeSingle();
      
    if (checkActiveError) {
      console.error('Error checking active task entry:', checkActiveError);
      throw checkActiveError;
    }
    
    if (activeEntry) {
      toast.warning('There is already an active timer for this task');
      return activeEntry;
    }
    
    // Get task details for reference
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('phase_id, name')
      .eq('id', taskId)
      .single();
      
    if (taskError) {
      console.error('Error getting task details:', taskError);
      throw taskError;
    }
    
    // Create a new entry for this task (resume)
    const { data, error } = await supabase
      .from('task_time_entries')
      .insert({
        task_id: taskId,
        user_id: user.id,
        phase_id: taskData.phase_id,
        task_name: taskData.name,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error resuming task timer:', error);
      throw error;
    }
    
    toast.success('Timer resumed');
    return data;
  } catch (error: any) {
    console.error('Error resuming task timer:', error);
    toast.error(`Failed to resume timer: ${error.message}`);
    throw error;
  }
};

/**
 * Stops a timer for a specific task (complete)
 */
export const stopTaskTimer = async (taskId: string, notes?: string): Promise<TaskTimeEntry | null> => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Get the active task entry
    const { data: activeEntry, error: checkError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .is('end_time', null)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking active task entry:', checkError);
      throw checkError;
    }
    
    if (!activeEntry) {
      toast.error('No active timer found for this task');
      return null;
    }
    
    // Calculate duration in seconds
    const startTime = new Date(activeEntry.start_time);
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Update task entry with stop time
    const { data, error } = await supabase
      .from('task_time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        is_paused: false,
        notes: notes
      })
      .eq('id', activeEntry.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error stopping task timer:', error);
      throw error;
    }
    
    toast.success('Timer stopped');
    return data;
  } catch (error: any) {
    console.error('Error stopping task timer:', error);
    toast.error(`Failed to stop timer: ${error.message}`);
    throw error;
  }
};

/**
 * Get active task time entry (if any) for a specific task and user
 */
export const getTaskTimeEntry = async (taskId: string): Promise<TaskTimeEntry | null> => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return null;
    }
    
    // Get active task time entry
    const { data, error } = await supabase
      .from('task_time_entries')
      .select(`
        *,
        phases:phase_id(*),
        jobs:phases->jobs(*),
        task:task_id(*)
      `)
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .maybeSingle();
      
    if (error) {
      console.error('Error getting task time entry:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getTaskTimeEntry:', error);
    return null;
  }
};

/**
 * Pause all active task time entries for the current user
 * Called when clocking out
 */
export const pauseActiveTaskEntries = async (): Promise<void> => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return;
    }
    
    // Find all active task time entries
    const { data: activeEntries, error: entriesError } = await supabase
      .from('task_time_entries')
      .select('id, start_time')
      .eq('user_id', user.id)
      .is('end_time', null);
      
    if (entriesError) {
      console.error('Error finding active task entries:', entriesError);
      return;
    }
    
    if (!activeEntries || activeEntries.length === 0) {
      console.log('No active task entries to pause');
      return;
    }
    
    // Update each entry with current time
    for (const entry of activeEntries) {
      const startTime = new Date(entry.start_time);
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      await supabase
        .from('task_time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds,
          is_paused: true
        })
        .eq('id', entry.id);
    }
    
    console.log(`Paused ${activeEntries.length} active task entries`);
  } catch (error) {
    console.error('Error pausing active task entries:', error);
  }
};

/**
 * Resume all paused task time entries for the current user
 * Called when clocking in
 */
export const resumePausedTaskEntries = async (): Promise<void> => {
  try {
    // Currently this feature is disabled - we don't auto resume tasks
    // When clocking in, the user will need to manually start their tasks again
    
    // This functionality could be re-enabled in the future if needed
    
    return;
  } catch (error) {
    console.error('Error resuming paused task entries:', error);
  }
};

/**
 * Get the most recent task time entries for a user
 */
export const getTaskTimeEntriesForUser = async (limit: number = 10): Promise<any[]> => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return [];
    }
    
    // Get task time entries with task and job details
    const { data, error } = await supabase
      .from('task_time_entries')
      .select(`
        id,
        start_time,
        end_time,
        duration_seconds,
        is_paused,
        notes,
        task_id,
        user_id,
        phase_id,
        task_name,
        task:task_id(name),
        phase:phase_id(phase_name),
        job:phase_id->phases!phases_job_id_fkey(job_number, project_name)
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching task time entries:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getTaskTimeEntriesForUser:', error);
    return [];
  }
};
