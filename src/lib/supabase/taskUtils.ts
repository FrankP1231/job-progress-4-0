
import { supabase } from './client';
import { Task, TaskStatus } from '../types';
import { 
  getTasksForPhase, 
  getTasksForPhaseArea, 
  getTasksForAllJobs, 
  updateTask as updateTaskData,
  deleteTask as deleteTaskRecord,
  addTasksToPhaseArea as addTasksToArea
} from './task-crud';

// Re-export functions from task-crud
export const getTasksForPhase = getTasksForPhase;
export const getTasksForPhaseArea = getTasksForPhaseArea;
export const getTasksForAllJobs = getTasksForAllJobs;
export const updateTask = updateTaskData;
export const deleteTask = deleteTaskRecord;

// Re-implement addTasksToPhaseArea with support for assignees
export async function addTasksToPhaseArea(
  phaseId: string, 
  area: string, 
  tasks: string[], 
  assigneeIds?: string[]
): Promise<{ createdTasks: Record<string, any[]> }> {
  if (!phaseId || !area || !tasks.length) {
    throw new Error('Phase ID, area, and tasks are required');
  }

  try {
    const tasksToInsert = tasks.map(task => ({
      phase_id: phaseId,
      area,
      name: task,
      status: 'not-started' as TaskStatus
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Error adding tasks to phase area:', error);
      throw error;
    }

    // If assigneeIds are provided, create task assignments
    if (assigneeIds && assigneeIds.length > 0 && data) {
      for (const task of data) {
        for (const userId of assigneeIds) {
          const { error: assignmentError } = await supabase
            .from('task_assignments')
            .insert({
              task_id: task.id,
              user_id: userId,
              assigned_by: (await supabase.auth.getUser()).data.user?.id
            });

          if (assignmentError) {
            console.error('Error assigning user to task:', assignmentError);
          }
        }
      }
    }

    return { createdTasks: { [area]: data || [] } };
  } catch (error) {
    console.error('Error in addTasksToPhaseArea:', error);
    throw error;
  }
}

// Add a helper to create a single task
export async function createTask(
  phaseId: string,
  area: string,
  name: string,
  options?: {
    status?: TaskStatus;
    hours?: number;
    eta?: string;
    notes?: string;
    assigneeIds?: string[];
  }
): Promise<Task | null> {
  if (!phaseId || !area || !name) {
    console.error('Phase ID, area, and name are required to create a task');
    return null;
  }

  try {
    const taskData = {
      phase_id: phaseId,
      area,
      name,
      status: options?.status || 'not-started',
      hours: options?.hours,
      eta: options?.eta,
      notes: options?.notes
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    // If assigneeIds are provided, create task assignments
    if (options?.assigneeIds && options.assigneeIds.length > 0) {
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      for (const userId of options.assigneeIds) {
        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert({
            task_id: data.id,
            user_id: userId,
            assigned_by: currentUser?.id
          });

        if (assignmentError) {
          console.error('Error assigning user to task:', assignmentError);
        }
      }
    }

    // Map the response to our Task interface
    return {
      id: data.id,
      phaseId: data.phase_id,
      area: data.area,
      name: data.name,
      isComplete: data.is_complete,
      status: data.status as TaskStatus,
      hours: data.hours,
      eta: data.eta,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in createTask:', error);
    return null;
  }
}
