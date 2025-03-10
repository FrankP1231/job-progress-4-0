
/**
 * Parses a task name, handling cases where it might be a JSON string
 */
export const parseTaskName = (taskName: string | undefined): string => {
  if (!taskName) return '';
  
  try {
    // Check if the task name is a JSON string
    if (taskName.startsWith('{') && taskName.includes('name')) {
      const parsed = JSON.parse(taskName);
      return parsed.name || taskName;
    }
    return taskName;
  } catch (e) {
    // If parsing fails, return the original name
    return taskName;
  }
};
