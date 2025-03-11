import { supabase } from './client';
import { Task, TaskStatus } from '../types';
import { transformTaskData } from './task-helpers';
import { useQueryClient } from '@tanstack/react-query';
import { logActivity } from './activityLogUtils';

// Function to calculate status based on tasks
export const calculateAreaStatus = (tasks: Task[] = []): TaskStatus => {
  if (!tasks || tasks.length === 0) {
    return 'not-needed';
  }
  
  const completeTasks = tasks.filter(task => task.isComplete || task.status === 'complete');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  
  if (completeTasks.length === tasks.length) {
    return 'complete';
  } else if (completeTasks.length > 0 || inProgressTasks.length > 0) {
    return 'in-progress';
  } else {
    return 'not-started';
  }
};

// Function to update a task's status
export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task> => {
  // First, get the current task data for the activity log
  const { data: existingTask } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  // Update the task status
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      status,
      is_complete: status === 'complete'
    })
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
  
  if (existingTask) {
    try {
      // Get job ID for logging
      const { data: phaseData } = await supabase
        .from('phases')
        .select('job_id')
        .eq('id', existingTask.phase_id)
        .single();
      
      if (phaseData) {
        // Log the status change activity
        await logActivity({
          jobId: phaseData.job_id,
          phaseId: existingTask.phase_id,
          activityType: 'task_change',
          description: `Task "${existingTask.name}" status changed from ${existingTask.status} to ${status}`,
          fieldName: 'status',
          previousValue: existingTask.status,
          newValue: status
        });
      }
    } catch (logError) {
      console.error('Error logging task status change:', logError);
      // Continue despite logging error
    }
  }
  
  return transformTaskData(data);
};

// Function to delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  // First, get the task data for reference before deleting
  const { data: taskData } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  // Delete the task
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
  
  if (taskData) {
    try {
      // Get job ID for logging
      const { data: phaseData } = await supabase
        .from('phases')
        .select('job_id')
        .eq('id', taskData.phase_id)
        .single();
      
      if (phaseData) {
        // Log the deletion activity
        await logActivity({
          jobId: phaseData.job_id,
          phaseId: taskData.phase_id,
          activityType: 'task_change',
          description: `Task "${taskData.name}" was deleted from ${taskData.area}`,
        });
      }
    } catch (logError) {
      console.error('Error logging task deletion:', logError);
      // Continue despite logging error
    }
  }
};

// Helper function to refresh all relevant task-related queries
export const refreshTasksData = async (
  queryClient: ReturnType<typeof useQueryClient>,
  jobId?: string, 
  phaseId?: string
) => {
  // Invalidate task queries
  if (phaseId) {
    queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
    queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
    queryClient.invalidateQueries({ queryKey: ['allTasks'] });
    
    // If we have a phase, invalidate the phase query
    queryClient.invalidateQueries({ queryKey: ['phase', jobId, phaseId] });
  }
  
  // If we have a job ID, invalidate the job query
  if (jobId) {
    queryClient.invalidateQueries({ queryKey: ['job', jobId] });
  }
  
  // Always invalidate these queries
  queryClient.invalidateQueries({ queryKey: ['productionPhases'] });
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
};
