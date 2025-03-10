
// Re-export all utilities for easy importing
export * from './jobUtils';
export * from './phaseUtils';
export * from './dashboardUtils';
export * from './statusUtils';
export * from './task-helpers';
export * from './task-crud';
export * from './taskUtils';

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
} from './task-crud';

// Explicitly export from task-status
export {
  updateTaskStatus,
  deleteTask as deleteTaskStatus,
  refreshTasksData,
  calculateAreaStatus
} from './task-status';

// Export initUtils specific functions with explicit naming to avoid conflicts
export { 
  createNewPhase as initCreateNewPhase, 
  addPhaseToJob as initAddPhaseToJob 
} from './initUtils';
