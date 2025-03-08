import { supabase } from "./client";
import { Task, TaskStatus } from '../types';
import { logActivity } from "./activityLogUtils";
import { getJobIdForPhase, transformTaskData } from "./task-helpers";

// Update task status (now supporting in-progress status as well)
export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task> => {
  // Only mark complete if status is 'complete'
  const isComplete = status === 'complete';
  
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      is_complete: isComplete,
      status: status
    })
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
  
  // Get job ID for logging
  const jobId = await getJobIdForPhase(data.phase_id);
  
  // Log the activity
  if (jobId) {
    await logActivity({
      jobId,
      phaseId: data.phase_id,
      activityType: 'task_change',
      description: `Task "${data.name}" was marked as ${status === 'complete' ? 'complete' : status === 'in-progress' ? 'in progress' : 'not started'}`
    });
  }
  
  return transformTaskData(data);
};

// Toggle task completion status (legacy function, kept for backward compatibility)
export const toggleTaskCompletion = async (taskId: string, isComplete: boolean): Promise<Task> => {
  const status: TaskStatus = isComplete ? 'complete' : 'not-started';
  return updateTaskStatus(taskId, status);
};

// Get all tasks for all phases in a job
export const getTasksForJob = async (jobId: string): Promise<Task[]> => {
  // First get all phases for this job
  const { data: phases, error: phasesError } = await supabase
    .from('phases')
    .select('id')
    .eq('job_id', jobId);
  
  if (phasesError) {
    console.error('Error fetching phases for job:', phasesError);
    throw phasesError;
  }
  
  if (!phases || phases.length === 0) {
    return [];
  }
  
  // Get all tasks for these phases
  const phaseIds = phases.map(phase => phase.id);
  
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .in('phase_id', phaseIds)
    .order('created_at', { ascending: true });
  
  if (tasksError) {
    console.error('Error fetching tasks for job:', tasksError);
    throw tasksError;
  }
  
  // Transform the data to match our types
  return (tasks || []).map(transformTaskData);
};

// Export function to refresh all related tasks data
export const refreshTasksData = (queryClient: any, jobId?: string, phaseId?: string) => {
  if (phaseId) {
    queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
    queryClient.invalidateQueries({ queryKey: ['phase', phaseId] });
  }
  
  if (jobId) {
    queryClient.invalidateQueries({ queryKey: ['job', jobId] });
  }
  
  // Always invalidate these general queries
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
  queryClient.invalidateQueries({ queryKey: ['phases'] });
  queryClient.invalidateQueries({ queryKey: ['jobs'] });
};

// Calculate area status based on task completion
export const calculateAreaStatus = (tasks: Task[]): TaskStatus => {
  if (!tasks || tasks.length === 0) return 'not-started';
  
  const completedTasks = tasks.filter(task => task.isComplete || task.status === 'complete');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  
  if (completedTasks.length === tasks.length) {
    return 'complete';
  } else if (completedTasks.length > 0 || inProgressTasks.length > 0) {
    return 'in-progress';
  } else {
    return 'not-started';
  }
};
