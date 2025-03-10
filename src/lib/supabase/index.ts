
// Re-export all utilities for easy importing
export * from './jobUtils';
export * from './phaseUtils';
export * from './dashboardUtils';
export * from './statusUtils';
export * from './task-status';

// Import and re-export from task-helpers explicitly to avoid conflicts
import {
  getTasksForPhase,
  getTasksForPhaseArea,
  getTasksForAllJobs,
  getTasksForJob,
  getActiveUserForTask,
  assignUserToTask,
  getJobIdForPhase,
  transformTaskData
} from './task-helpers';

export {
  getTasksForPhase,
  getTasksForPhaseArea,
  getTasksForAllJobs,
  getTasksForJob,
  getActiveUserForTask,
  assignUserToTask,
  getJobIdForPhase,
  transformTaskData
};

// Import task-crud functions that don't conflict with task-helpers
export {
  addSampleTasksToPhases
} from './task-crud';

// Import taskUtils functions that don't conflict with task-helpers
import {
  updateTask,
  deleteTask,
  addTasksToPhaseArea,
  createTask
} from './task-helpers';

export {
  updateTask,
  deleteTask,
  addTasksToPhaseArea,
  createTask
};

// Export initUtils specific functions with explicit naming to avoid conflicts
export { 
  createNewPhase as initCreateNewPhase, 
  addPhaseToJob as initAddPhaseToJob,
  initSampleData
} from './initUtils';

// Import supabase from the correct location
import { supabase } from "@/integrations/supabase/client";

export const getAllUsers = async (workArea?: string) => {
  try {
    let query = supabase
      .from('profiles')
      .select('id, email, first_name, last_name, work_area')
      .order('first_name');
      
    // If a specific work area is provided, filter by it
    if (workArea) {
      query = query.eq('work_area', workArea);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    // Map the profile data to match the expected structure in the UserSelector component
    return data.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: `${profile.first_name} ${profile.last_name}`.trim(),
      workArea: profile.work_area
    })) || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};
