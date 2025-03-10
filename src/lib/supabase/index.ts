
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

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .order('first_name');
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  // Map the profile data to match the expected structure in the UserSelector component
  return data.map(profile => ({
    id: profile.id,
    email: profile.email || '',
    name: `${profile.first_name} ${profile.last_name}`.trim()
  })) || [];
};
