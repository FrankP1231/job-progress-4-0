
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
  
  // Join fields
  task?: {
    name: string;
    phase_id: string;
  };
  phase?: {
    phase_name: string;
    job_id: string;
  };
  job?: {
    job_number: string;
    project_name: string;
  };
}

// User Clock In/Out Functions
export const clockIn = async (): Promise<TimeEntry | null> => {
  try {
    // Check if user is already clocked in
    const { data: activeSession, error: checkError } = await supabase
      .from('time_entries')
      .select('*')
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
    
    // No active session found, create new clock-in
    const { data, error } = await supabase
      .from('time_entries')
      .insert({})
      .select()
      .single();
      
    if (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
    
    toast.success('Clocked in successfully');
    
    // Check for paused task time entries and resume them
    await resumePausedTaskEntries();
    
    return data;
  } catch (error: any) {
    console.error('Error during clock in:', error);
    toast.error('Failed to clock in: ' + error.message);
    return null;
  }
};

export const clockOut = async (notes?: string): Promise<TimeEntry | null> => {
  try {
    // Get the active time entry
    const { data: activeSession, error: checkError } = await supabase
      .from('time_entries')
      .select('*')
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
    
    toast.success('Clocked out successfully');
    
    // Pause any active task time entries
    await pauseActiveTaskEntries();
    
    return data;
  } catch (error: any) {
    console.error('Error during clock out:', error);
    toast.error('Failed to clock out: ' + error.message);
    return null;
  }
};

export const getCurrentTimeEntry = async (): Promise<TimeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
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
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
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
        is_paused: false
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error starting task timer:', error);
      throw error;
    }
    
    toast.success('Task timer started');
    return data;
  } catch (error: any) {
    console.error('Error starting task timer:', error);
    toast.error('Failed to start task timer: ' + error.message);
    return null;
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
    toast.error('Failed to pause task timer: ' + error.message);
    return null;
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
    toast.error('Failed to resume task timer: ' + error.message);
    return null;
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
    
    toast.success('Task timer stopped');
    return data;
  } catch (error: any) {
    console.error('Error stopping task timer:', error);
    toast.error('Failed to stop task timer: ' + error.message);
    return null;
  }
};

export const getTaskTimeEntry = async (taskId: string): Promise<TaskTimeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('task_time_entries')
      .select('*')
      .eq('task_id', taskId)
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
    // Find all active task entries for the current user
    const { data, error } = await supabase
      .from('task_time_entries')
      .select('*')
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
    // Find all paused task entries for the current user
    const { data, error } = await supabase
      .from('task_time_entries')
      .select('*')
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
