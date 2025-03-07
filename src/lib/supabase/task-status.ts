
import { Task } from '../types';
import { updateTask } from './task-crud';

// Calculate area status based on tasks
export const calculateAreaStatus = (tasks: Task[]): 'not-started' | 'in-progress' | 'complete' => {
  if (tasks.length === 0) return 'not-started';
  
  const completedTasks = tasks.filter(task => task.isComplete).length;
  
  if (completedTasks === 0) return 'not-started';
  if (completedTasks === tasks.length) return 'complete';
  return 'in-progress';
};

// Mark a task as complete/incomplete
export const toggleTaskCompletion = async (taskId: string, isComplete: boolean): Promise<Task> => {
  return updateTask(taskId, { 
    isComplete, 
    status: isComplete ? 'complete' : 'in-progress' 
  });
};
