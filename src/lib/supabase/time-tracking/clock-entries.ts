
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TimeEntry } from './types';
import { pauseActiveTaskEntries, resumePausedTaskEntries } from './task-entries';

/**
 * Clocks in the current user
 */
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

/**
 * Clocks out the current user
 */
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

/**
 * Retrieves the current user's active time entry (if any)
 */
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

/**
 * Gets the time entries for the current user
 */
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
