import { supabase } from '../../supabase/client';
import { TaskTimeEntry } from './types';

/**
 * Start a task timer for the current user
 */
export async function startTaskTimer(taskId: string): Promise<TaskTimeEntry> {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Check if user is clocked in
    const { data: activeSession, error: checkTimeEntry } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .is('clock_out_time', null)
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (checkTimeEntry) {
      console.error('Error checking active time entry:', checkTimeEntry);
    }
    
    if (!activeSession) {
      toast.error('You must be clocked in to track task time');
      return null;
    }
    
    // Check if task is already being timed
    const { data: existingEntry, error: checkError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .is('end_time', null)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing task time entry:', checkError);
      throw checkError;
    }
    
    if (existingEntry) {
      if (existingEntry.is_paused) {
        // Resume the paused entry
        return await resumeTaskTimer(existingEntry.id);
      }
      
      toast.info('Task timer is already running');
      return existingEntry;
    }
    
    // Create new task time entry
    const { data, error } = await supabase
      .from('task_time_entries')
      .insert({
        task_id: taskId,
        user_id: user.id,
        is_paused: false,
        start_time: new Date().toISOString()  // Explicitly set start_time to ensure it's recorded
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error starting task timer:', error);
      throw error;
    }
    
    toast.success('Task timer started');
    console.log('Created task time entry:', data);
    return data;
  } catch (error: any) {
    console.error('Error starting task timer:', error);
    throw error;
  }
}

/**
 * Pause a task timer
 */
export async function pauseTaskTimer(entryId: string): Promise<TaskTimeEntry> {
  try {
    const { data, error } = await supabase
      .from('task_time_entries')
      .update({
        is_paused: true,
        pause_time: new Date().toISOString()
      })
      .eq('id', entryId)
      .select()
      .single();
      
    if (error) {
      console.error('Error pausing task timer:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error pausing task timer:', error);
    throw error;
  }
}

/**
 * Resume a paused task timer
 */
export async function resumeTaskTimer(entryId: string): Promise<TaskTimeEntry> {
  try {
    // Get the current entry to calculate duration
    const { data: currentEntry, error: fetchError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('id', entryId)
      .single();
      
    if (fetchError || !currentEntry) {
      console.error('Error fetching task entry to resume:', fetchError);
      throw fetchError || new Error('Task entry not found');
    }
    
    // Skip if entry is not paused
    if (!currentEntry.is_paused || !currentEntry.pause_time) {
      return currentEntry;
    }
    
    const { data, error } = await supabase
      .from('task_time_entries')
      .update({
        is_paused: false,
        pause_time: null
      })
      .eq('id', entryId)
      .select()
      .single();
      
    if (error) {
      console.error('Error resuming task timer:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error resuming task timer:', error);
    throw error;
  }
}

/**
 * Stop a task timer
 */
export async function stopTaskTimer(entryId: string): Promise<TaskTimeEntry> {
  try {
    // Get the current entry to calculate duration
    const { data: currentEntry, error: fetchError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('id', entryId)
      .single();
      
    if (fetchError || !currentEntry) {
      console.error('Error fetching task entry to stop:', fetchError);
      throw fetchError || new Error('Task entry not found');
    }
    
    // Calculate total duration
    const startTime = new Date(currentEntry.start_time);
    const endTime = new Date();
    let durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // If the entry was paused at some point, we need to adjust the duration
    if (currentEntry.is_paused && currentEntry.pause_time) {
      const pauseTime = new Date(currentEntry.pause_time);
      durationSeconds = Math.floor((pauseTime.getTime() - startTime.getTime()) / 1000);
    }
    
    const { data, error } = await supabase
      .from('task_time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        is_paused: false,
        pause_time: null
      })
      .eq('id', entryId)
      .select()
      .single();
      
    if (error) {
      console.error('Error stopping task timer:', error);
      throw error;
    }
    
    console.log('Stopped task time entry:', data);
    toast.success('Task timer stopped');
    return data;
  } catch (error: any) {
    console.error('Error stopping task timer:', error);
    throw error;
  }
}

/**
 * Get the active task time entry for a task
 */
export async function getTaskTimeEntry(taskId: string): Promise<TaskTimeEntry | null> {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return null;
    }
    
    const { data, error } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching task time entry:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error getting task time entry:', error);
    return null;
  }
}

/**
 * Pause all active task entries for the current user
 */
export async function pauseActiveTaskEntries(): Promise<void> {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return;
    }
    
    // Find all active task entries for the current user
    const { data, error } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('user_id', user.id)
      .is('end_time', null)
      .eq('is_paused', false);
      
    if (error) {
      console.error('Error fetching active task entries:', error);
      throw error;
    }
    
    // Pause each active entry
    for (const entry of (data || [])) {
      await pauseTaskTimer(entry.id);
    }
  } catch (error: any) {
    console.error('Error pausing active task entries:', error);
  }
}

/**
 * Resume all paused task entries for the current user
 */
export async function resumePausedTaskEntries(): Promise<void> {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return;
    }
    
    // Find all paused task entries for the current user
    const { data, error } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('user_id', user.id)
      .is('end_time', null)
      .eq('is_paused', true);
      
    if (error) {
      console.error('Error fetching paused task entries:', error);
      throw error;
    }
    
    // Resume each paused entry
    for (const entry of (data || [])) {
      await resumeTaskTimer(entry.id);
    }
  } catch (error: any) {
    console.error('Error resuming paused task entries:', error);
  }
}

/**
 * Get task time entries for the current user with improved caching
 */
export async function getTaskTimeEntriesForUser(limit = 10): Promise<any[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.error('No authenticated user found');
      return [];
    }

    // Use a more efficient query with proper joins
    const { data, error } = await supabase
      .from('task_time_entries')
      .select(`
        *,
        task:task_id (
          id,
          name
        ),
        phase:phases!inner (
          id,
          phase_name,
          job_id
        ),
        job:phases!inner(jobs!inner (
          id,
          job_number,
          project_name
        ))
      `)
      .eq('user_id', user.user.id)
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
}
