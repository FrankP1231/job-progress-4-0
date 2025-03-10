
// This file is maintained for backwards compatibility
// Please use the modules in time-tracking/ for new code

import {
  // Types
  TimeEntry,
  TaskTimeEntry,
  
  // Clock functions
  clockIn,
  clockOut,
  getCurrentTimeEntry,
  getTimeEntries,
  
  // Task timer functions
  startTaskTimer,
  pauseTaskTimer,
  resumeTaskTimer,
  stopTaskTimer,
  getTaskTimeEntry,
  pauseActiveTaskEntries,
  resumePausedTaskEntries,
  getTaskTimeEntriesForUser,
  
  // Formatting utilities
  formatTimeSpent,
  formatDuration
} from './time-tracking';

// Re-export everything for backward compatibility
export {
  // Types
  TimeEntry,
  TaskTimeEntry,
  
  // Clock functions
  clockIn,
  clockOut,
  getCurrentTimeEntry,
  getTimeEntries,
  
  // Task timer functions
  startTaskTimer,
  pauseTaskTimer,
  resumeTaskTimer,
  stopTaskTimer,
  getTaskTimeEntry,
  pauseActiveTaskEntries,
  resumePausedTaskEntries,
  getTaskTimeEntriesForUser,
  
  // Formatting utilities
  formatTimeSpent,
  formatDuration
};
