import { supabase } from './client';
import { Task, TaskStatus } from '../types';

// Helper to transform task data from database to Task type
const transformTask = (task: any): Task => ({
  id: task.id,
  phaseId: task.phase_id,
  area: task.area,
  name: task.name,
  isComplete: task.is_complete,
  status: task.status as TaskStatus,
  hours: task.hours,
  eta: task.eta,
  notes: task.notes,
  createdAt: task.created_at,
  updatedAt: task.updated_at
});

export async function getTasksForPhase(phaseId: string): Promise<Task[]> {
  if (!phaseId) {
    console.error('Phase ID is required to fetch tasks');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('phase_id', phaseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks for phase:', error);
      throw error;
    }

    return (data || []).map(transformTask);
  } catch (error) {
    console.error('Error in getTasksForPhase:', error);
    return [];
  }
}

export async function getTasksForPhaseArea(phaseId: string, area: string): Promise<Task[]> {
  if (!phaseId || !area) {
    console.error('Phase ID and area are required to fetch tasks');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('phase_id', phaseId)
      .eq('area', area)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks for phase area:', error);
      throw error;
    }

    return (data || []).map(transformTask);
  } catch (error) {
    console.error('Error in getTasksForPhaseArea:', error);
    return [];
  }
}

export async function getTasksForAllJobs(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        phases:phase_id (
          id,
          phase_name,
          phase_number,
          job_id,
          jobs:job_id (
            id,
            job_number,
            project_name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }

    return (data || []).map(task => ({
      id: task.id,
      phaseId: task.phase_id,
      area: task.area,
      name: task.name,
      isComplete: task.is_complete,
      status: task.status as TaskStatus,
      hours: task.hours,
      eta: task.eta,
      notes: task.notes,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      phaseNumber: task.phases?.phase_number,
      phaseName: task.phases?.phase_name,
      jobId: task.phases?.job_id,
      jobNumber: task.phases?.jobs?.job_number,
      projectName: task.phases?.jobs?.project_name,
    }));
  } catch (error) {
    console.error('Error in getTasksForAllJobs:', error);
    return [];
  }
}

export async function addTasksToPhaseArea(phaseId: string, area: string, tasks: string[]): Promise<{ createdTasks: Record<string, any[]> }> {
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
}

export async function createTask(
  phaseId: string,
  area: string,
  name: string,
  options?: {
    status?: TaskStatus;
    hours?: number;
    eta?: string;
    notes?: string;
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

    return transformTask(data);
  } catch (error) {
    console.error('Error in createTask:', error);
    return null;
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
  if (!taskId) return false;

  try {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.phaseId !== undefined) dbUpdates.phase_id = updates.phaseId;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.isComplete !== undefined) dbUpdates.is_complete = updates.isComplete;
    if (updates.hours !== undefined) dbUpdates.hours = updates.hours;
    if (updates.eta !== undefined) dbUpdates.eta = updates.eta;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateTask:', error);
    return false;
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  if (!taskId) return false;

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTask:', error);
    return false;
  }
}

export async function addSampleTasksToPhases(): Promise<void> {
  console.log("Sample task creation has been disabled");
  return Promise.resolve();
}
