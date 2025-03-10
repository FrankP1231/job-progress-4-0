import { supabase } from './client';
import { Task, TaskStatus } from '../types';
import { toast } from 'sonner';

export const updateTaskStatus = async (taskId: string, isComplete: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ is_complete: isComplete })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } else {
      toast.success('Task status updated successfully');
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    toast.error('Failed to update task status');
  }
};

export const getTasksForPhaseArea = async (phaseId: string, area: string): Promise<Task[]> => {
  try {
    if (!phaseId || !area) {
      console.warn('Phase ID or area is missing. Returning empty array.');
      return [];
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('phase_id', phaseId)
      .eq('area', area);

    if (error) {
      console.error('Error fetching tasks for phase area:', error);
      toast.error('Failed to fetch tasks for phase area');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tasks for phase area:', error);
    toast.error('Failed to fetch tasks for phase area');
    return [];
  }
};

export const getTasksForPhase = async (phaseId: string): Promise<Task[]> => {
  try {
    if (!phaseId) {
      console.warn('Phase ID is missing. Returning empty array.');
      return [];
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('phase_id', phaseId);

    if (error) {
      console.error('Error fetching tasks for phase:', error);
      toast.error('Failed to fetch tasks for phase');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tasks for phase:', error);
    toast.error('Failed to fetch tasks for phase');
    return [];
  }
};

export const getTasksForAllJobs = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');

    if (error) {
      console.error('Error fetching tasks for all jobs:', error);
      toast.error('Failed to fetch tasks for all jobs');
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tasks for all jobs:', error);
    toast.error('Failed to fetch tasks for all jobs');
    return [];
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } else {
      toast.success('Task updated successfully');
    }
  } catch (error) {
    console.error('Error updating task:', error);
    toast.error('Failed to update task');
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } else {
      toast.success('Task deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    toast.error('Failed to delete task');
  }
};

export const addTasksToPhaseArea = async (phaseId: string, area: string, tasks: string[]): Promise<{ createdTasks: Record<string, any[]> }> => {
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

    return { createdTasks: { [area]: data || [] } };
  } catch (error) {
    console.error('Error in addTasksToPhaseArea:', error);
    throw error;
  }
};

// Disable the sample task generation
export const addSampleTasksToPhases = async (): Promise<void> => {
  console.log("Sample task creation has been disabled");
  return Promise.resolve();
};
