import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus } from '@/lib/types';
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
      updatedAt: task.updated_at
    }));
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
      updatedAt: task.updated_at
    }));
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
      updatedAt: task.updated_at
    }));
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

export const addSampleTasksToPhases = async (): Promise<void> => {
  console.log("Sample task creation has been disabled");
  return Promise.resolve();
};

export const getJobById = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, phases(*)')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job by ID:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    const job = {
      id: data.id,
      jobNumber: data.job_number,
      projectName: data.project_name,
      buyer: data.buyer,
      title: data.title,
      salesman: data.salesman,
      drawingsUrl: data.drawings_url,
      worksheetUrl: data.worksheet_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      phases: (data.phases || []).map((phase: any) => ({
        id: phase.id,
        jobId: phase.job_id,
        phaseName: phase.phase_name,
        phaseNumber: phase.phase_number,
        weldingMaterials: phase.welding_materials,
        sewingMaterials: phase.sewing_materials,
        weldingLabor: phase.welding_labor,
        sewingLabor: phase.sewing_labor,
        installationMaterials: phase.installation_materials,
        powderCoat: phase.powder_coat,
        installation: phase.installation,
        isComplete: phase.is_complete,
        createdAt: phase.created_at,
        updatedAt: phase.updated_at
      }))
    };

    return job;
  } catch (error) {
    console.error('Error in getJobById:', error);
    throw error;
  }
};

export const markPhaseComplete = async (jobId: string, phaseId: string, isComplete: boolean) => {
  try {
    const { error } = await supabase
      .from('phases')
      .update({ is_complete: isComplete })
      .eq('id', phaseId)
      .eq('job_id', jobId);

    if (error) {
      console.error('Error updating phase completion status:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in markPhaseComplete:', error);
    throw error;
  }
};

export const initSampleData = async (): Promise<void> => {
  console.log("Sample data initialization has been disabled in supabaseUtils");
  return Promise.resolve();
};
