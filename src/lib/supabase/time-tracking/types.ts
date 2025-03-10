
import { supabase } from '@/integrations/supabase/client';

// Type definitions for time tracking
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
