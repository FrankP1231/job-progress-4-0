
import { supabase } from "./client";
import { Task, TaskStatus } from '../types';
import { logActivity } from "./activityLogUtils";
import { getJobIdForPhase, transformTaskData } from "./task-helpers";

// Toggle task completion status
export const toggleTaskCompletion = async (taskId: string, isComplete: boolean): Promise<Task> => {
  const status: TaskStatus = isComplete ? 'complete' : 'not-started';
  
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
      description: `Task "${data.name}" was marked as ${isComplete ? 'complete' : 'incomplete'}`
    });
  }
  
  return transformTaskData(data);
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
