
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Export time tracking utilities
import { 
  clockIn, 
  clockOut, 
  getCurrentTimeEntry, 
  getTimeEntries,
  startTaskTimer, 
  pauseTaskTimer, 
  resumeTaskTimer, 
  stopTaskTimer,
  formatTimeSpent,
  formatDuration,
  type TimeEntry,
  type TaskTimeEntry
} from '@/lib/supabase/timeTracking';

// Export all time tracking related functions
export {
  clockIn,
  clockOut,
  getCurrentTimeEntry,
  getTimeEntries,
  startTaskTimer,
  pauseTaskTimer,
  resumeTaskTimer,
  stopTaskTimer,
  formatTimeSpent,
  formatDuration
};

// Export types
export type { TimeEntry, TaskTimeEntry };

// Export the supabase client for use in other modules
export { supabase };
export type { Json };
