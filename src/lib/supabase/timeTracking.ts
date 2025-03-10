import { supabase } from '@/integrations/supabase/client';
import { format, formatDistance } from 'date-fns';
import { toast } from 'sonner';

// Type definitions
export interface TimeEntry {
  id: string;
  user_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskTimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  is_paused: boolean;
  pause_time: string | null;
  created_at: string;
  updated_at: string;
  
  // Join fields - made optional to handle partial data
  task?: {
    name: string;
    phase_id: string;
  } | null;
  phase?: {
    phase_name: string;
    job_id: string;
  } | null;
  job?: {
    job_number: string;
    project_name: string;
  } | null;
}

// User Clock In/Out Functions
export const clockIn = async (): Promise<TimeEntry | null> => {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Check if user is already clocked in
    const { data: activeSession, error: checkError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .is('clock_out_time', null)
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking active time entry:', checkError);
      throw checkError;
    }
    
    if (activeSession) {
      toast.error('You are already clocked in');
      return activeSession;
    }
    
    // No active session found, create new clock-in with user_id
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
    
    // Check for paused task time entries and resume them
    await resumePausedTaskEntries();
    
    return data;
  } catch (error: any) {
    console.error('Error during clock in:', error);
    throw error;
  }
};

export const clockOut = async (notes?: string): Promise<TimeEntry | null> => {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Get the active time entry
    const { data: activeSession, error: checkError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .is('clock_out_time', null)
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking active time entry:', checkError);
      throw checkError;
    }
    
    if (!activeSession) {
      toast.error('You are not clocked in');
      return null;
    }
    
    // Calculate duration in seconds
    const clockInTime = new Date(activeSession.clock_in_time);
    const clockOutTime = new Date();
    const durationSeconds = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 1000);
    
    // Update time entry with clock out time
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        clock_out_time: clockOutTime.toISOString(),
        duration_seconds: durationSeconds,
        notes: notes || null
      })
      .eq('id', activeSession.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
    
    // Pause any active task time entries
    await pauseActiveTaskEntries();
    
    return data;
  } catch (error: any) {
    console.error('Error during clock out:', error);
    throw error;
  }
};

export const getCurrentTimeEntry = async (): Promise<TimeEntry | null> => {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .is('clock_out_time', null)
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching current time entry:', error);
      throw error;
    }
    
    return data || null;
  } catch (error: any) {
    console.error('Error getting current time entry:', error);
    return null;
  }
};

export const getTimeEntries = async (limit: number = 10): Promise<TimeEntry[]> => {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return [];
    }
    
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('clock_in_time', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error getting time entries:', error);
    return [];
  }
};

// Task Time Tracking Functions
export const startTaskTimer = async (taskId: string): Promise<TaskTimeEntry | null> => {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }
    
    // Check if user is clocked in
    const timeEntry = await getCurrentTimeEntry();
    if (!timeEntry) {
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
};

export const pauseTaskTimer = async (taskTimeEntryId: string): Promise<TaskTimeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('task_time_entries')
      .update({
        is_paused: true,
        pause_time: new Date().toISOString()
      })
      .eq('id', taskTimeEntryId)
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
};

export const resumeTaskTimer = async (taskTimeEntryId: string): Promise<TaskTimeEntry | null> => {
  try {
    // Get the current entry to calculate duration
    const { data: currentEntry, error: fetchError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('id', taskTimeEntryId)
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
      .eq('id', taskTimeEntryId)
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
};

export const stopTaskTimer = async (taskTimeEntryId: string): Promise<TaskTimeEntry | null> => {
  try {
    // Get the current entry to calculate duration
    const { data: currentEntry, error: fetchError } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('id', taskTimeEntryId)
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
      .eq('id', taskTimeEntryId)
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
};

export const getTaskTimeEntry = async (taskId: string): Promise<TaskTimeEntry | null> => {
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
};

export const pauseActiveTaskEntries = async (): Promise<void> => {
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
};

export const resumePausedTaskEntries = async (): Promise<void> => {
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
};

// Helper functions for time formatting
export const formatTimeSpent = (startTime: string, endTime?: string | null): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  return formatDistance(start, end, { addSuffix: false });
};

export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0 min';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

export const getTaskTimeEntriesForUser = async (limit: number = 30): Promise<TaskTimeEntry[]> => {
  try {
    // Get the current user's ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return [];
    }
    
    console.log('Fetching task time entries for user:', user.id);
    
    // Fetch task time entries with proper joins
    const { data, error } = await supabase
      .from('task_time_entries')
      .select(`
        id, 
        task_id,
        user_id,
        start_time,
        end_time,
        duration_seconds,
        is_paused,
        pause_time,
        created_at,
        updated_at,
        tasks:task_id (
          name,
          phase_id,
          phases:phase_id (
            phase_name,
            job_id,
            jobs:job_id (
              job_number,
              project_name
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching task time entries:', error);
      throw error;
    }
    
    console.log('Fetched task time entries:', data);
    
    // Transform the data to match the expected TaskTimeEntry format
    const taskTimeEntries: TaskTimeEntry[] = data.map(entry => {
      const task = entry.tasks;
      const phase = task?.phases;
      const job = phase?.jobs;
      
      return {
        id: entry.id,
        task_id: entry.task_id,
        user_id: entry.user_id,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration_seconds: entry.duration_seconds,
        is_paused: entry.is_paused,
        pause_time: entry.pause_time,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        task: task ? {
          name: task.name,
          phase_id: task.phase_id
        } : null,
        phase: phase ? {
          phase_name: phase.phase_name,
          job_id: phase.job_id
        } : null,
        job: job ? {
          job_number: job.job_number,
          project_name: job.project_name
        } : null
      };
    });
    
    return taskTimeEntries;
  } catch (error: any) {
    console.error('Error getting task time entries for user:', error);
    return [];
  }
};
