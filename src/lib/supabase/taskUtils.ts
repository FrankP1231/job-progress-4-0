
// Re-export all task functions from the new modular files
export * from './task-crud';
export * from './task-helpers';

// Explicitly export from task-status to avoid duplicate exports
export {
  updateTaskStatus,
  deleteTask as deleteTaskStatus,
  refreshTasksData,
  calculateAreaStatus
} from './task-status';
