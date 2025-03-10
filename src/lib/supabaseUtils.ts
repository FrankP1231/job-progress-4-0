
// Re-export all utilities for easy importing
export * from './supabase/jobUtils';
export * from './supabase/phaseUtils';
export * from './supabase/dashboardUtils';
export * from './supabase/statusUtils';
export * from './supabase/task-helpers';
export * from './supabase/task-crud';

// Explicitly export from task-crud to avoid conflict with task-status
export {
  getTasksForPhase,
  getTasksForAllJobs,
  getTasksForPhaseArea,
  createTask,
  updateTask,
  addTasksToPhaseArea,
  addSampleTasksToPhases,
  deleteTask
} from './supabase/task-crud';

// Explicitly export from task-status
export {
  updateTaskStatus,
  deleteTask as deleteTaskStatus,
  refreshTasksData,
  calculateAreaStatus
} from './supabase/task-status';

// Export initUtils specific functions with explicit naming to avoid conflicts
export { 
  createNewPhase as initCreateNewPhase, 
  addPhaseToJob as initAddPhaseToJob 
} from './supabase/initUtils';
