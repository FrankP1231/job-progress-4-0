
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
import { WorkArea } from "@/lib/types";

/**
 * Gets all users from the database, optionally filtered by work area
 * @param workArea Optional WorkArea to filter users by 
 * @returns Array of user objects with id, email, name, and workArea
 */
export const getAllUsers = async (workArea?: WorkArea) => {
  try {
    console.log(`Getting users with workArea filter: ${workArea || 'none'}`);
    
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
    
    if (!data || data.length === 0) {
      console.log(`No users found${workArea ? ` for work area: ${workArea}` : ''}`);
    } else {
      console.log(`Found ${data.length} users${workArea ? ` for work area: ${workArea}` : ''}`);
    }
    
    // Map the profile data to match the expected structure in the UserSelector component
    return data.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: `${profile.first_name} ${profile.last_name}`.trim(),
      workArea: profile.work_area as WorkArea
    })) || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};
