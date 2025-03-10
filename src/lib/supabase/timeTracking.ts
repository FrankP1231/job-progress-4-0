
// This file now re-exports from the new modular files for backward compatibility

// Re-export types
export type { TimeEntry, TaskTimeEntry } from './time-tracking/types';

// Re-export clock in/out functionality
export {
  clockIn,
  clockOut,
  getCurrentTimeEntry,
  getTimeEntries
} from './time-tracking/clock-entries';

// Re-export task timer functionality
export {
  startTaskTimer,
  pauseTaskTimer,
  resumeTaskTimer,
  stopTaskTimer,
  getTaskTimeEntry,
  pauseActiveTaskEntries,
  resumePausedTaskEntries,
  getTaskTimeEntriesForUser
} from './time-tracking/task-entries';

// Re-export formatting utilities
export {
  formatTimeSpent,
  formatDuration
} from './time-tracking/formatters';
