
import { supabase } from '../supabase/client';
import { Task, TaskStatus } from '../types';

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

    return data as Task[];
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

    return data as Task[];
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

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
  if (!taskId) return false;

  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
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
  try {
    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select('id');

    if (phasesError) throw phasesError;

    if (!phases?.length) {
      console.log('No phases found to add sample tasks to');
      return;
    }

    const sampleTasks = [
      { area: 'weldingLabor', name: 'Cut materials' },
      { area: 'weldingLabor', name: 'Weld frame' },
      { area: 'sewingLabor', name: 'Cut fabric' },
      { area: 'sewingLabor', name: 'Sew panels' },
      { area: 'installation', name: 'Install frame' },
      { area: 'installation', name: 'Install fabric' }
    ];

    for (const phase of phases) {
      const tasksToInsert = sampleTasks.map(task => ({
        phase_id: phase.id,
        area: task.area,
        name: task.name,
        status: 'not-started' as TaskStatus
      }));

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (insertError) {
        console.error(`Error adding sample tasks to phase ${phase.id}:`, insertError);
      }
    }
  } catch (error) {
    console.error('Error in addSampleTasksToPhases:', error);
  }
}
