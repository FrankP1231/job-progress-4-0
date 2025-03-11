
import { supabase } from '../client';
import { Task, TaskStatus } from '../../types';
import { transformTaskData } from './task-transform';

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
    console.log(`Adding tasks to area ${area} with assignees:`, assigneeIds);
    
    // Ensure task names are strings, not JSON objects
    const sanitizedTasks = tasks.map(task => {
      // If task appears to be a JSON string or object, extract the name property
      if (typeof task === 'string' && task.startsWith('{') && task.includes('name')) {
        try {
          const parsed = JSON.parse(task);
          return parsed.name || task;
        } catch (e) {
          return task;
        }
      }
      return task;
    });

    const tasksToInsert = sanitizedTasks.map(task => ({
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
      console.log(`Creating assignments for ${data.length} tasks to ${assigneeIds.length} users`);
      
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      for (const task of data) {
        for (const userId of assigneeIds) {
          console.log(`Assigning task ${task.id} to user ${userId}`);
          
          const { error: assignmentError } = await supabase
            .from('task_assignments')
            .insert({
              task_id: task.id,
              user_id: userId,
              assigned_by: currentUser?.id
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

// Add a helper to create a single task with proper metadata
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
    console.log(`Creating task "${name}" in area ${area} with options:`, options);
    
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
      .select(`
        *,
        phases:phase_id (
          phase_number,
          phase_name,
          job_id,
          jobs:job_id (
            job_number,
            project_name
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    // If assigneeIds are provided, create task assignments
    if (options?.assigneeIds?.length) {
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

    return transformTaskData(data);
  } catch (error) {
    console.error('Error in createTask:', error);
    return null;
  }
}
