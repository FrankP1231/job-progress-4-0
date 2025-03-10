
import { supabase } from './client';
import { Task, TaskStatus } from '../types';
import { 
  updateTask as updateTaskFunction,
  deleteTask as deleteTaskFunction,
  addTasksToPhaseArea as addTasksToPhaseAreaFunction
} from './task-crud';

// Export functions from task-crud directly, no need to import them first
export { 
  getTasksForPhase,
  getTasksForPhaseArea, 
  getTasksForAllJobs 
} from './task-crud';

// Re-export renamed functions
export const updateTask = updateTaskFunction;
export const deleteTask = deleteTaskFunction;

// Transform raw task data from Supabase to our Task interface
export const transformTaskData = (data: any): Task => {
  if (!data) return null;
  
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
};

// Function to get all tasks for a specific job
export const getTasksForJob = async (jobId: string): Promise<Task[]> => {
  if (!jobId) {
    console.error('Job ID is required to fetch tasks');
    return [];
  }

  try {
    // First get all phases for this job
    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select('id')
      .eq('job_id', jobId);
    
    if (phasesError || !phases || phases.length === 0) {
      console.error('Error fetching phases for job:', phasesError);
      return [];
    }
    
    // Extract phase IDs
    const phaseIds = phases.map(phase => phase.id);
    
    // Then fetch all tasks for these phases
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('phase_id', phaseIds);
    
    if (error) {
      console.error('Error fetching tasks for job:', error);
      return [];
    }
    
    // Transform to our Task interface
    return data.map(transformTaskData);
  } catch (error) {
    console.error('Error in getTasksForJob:', error);
    return [];
  }
};

// Function to get active user for a task
export const getActiveUserForTask = async (taskId: string): Promise<{
  userId: string;
  firstName: string;
  lastName: string;
} | null> => {
  if (!taskId) {
    console.error('Task ID is required to get active user');
    return null;
  }

  try {
    // Query task_assignments to get assigned user
    const { data, error } = await supabase
      .from('task_assignments')
      .select('user_id')
      .eq('task_id', taskId)
      .single();
    
    if (error || !data) {
      // No assignment found, not an error
      return null;
    }
    
    // Get user details from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('id', data.user_id)
      .single();
    
    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }
    
    return {
      userId: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name
    };
  } catch (error) {
    console.error('Error in getActiveUserForTask:', error);
    return null;
  }
};

export const assignUserToTask = async (taskId: string, userId: string): Promise<boolean> => {
  if (!taskId || !userId) {
    console.error('Task ID and User ID are required for task assignment');
    return false;
  }

  try {
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    // Check if assignment already exists
    const { data: existingAssignment, error: checkError } = await supabase
      .from('task_assignments')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing assignment:', checkError);
    }
    
    // If assignment already exists, don't duplicate it
    if (existingAssignment) {
      console.log('User already assigned to this task');
      return true;
    }
    
    // Insert new assignment
    const { error } = await supabase
      .from('task_assignments')
      .insert({
        task_id: taskId,
        user_id: userId,
        assigned_by: currentUser?.id
      });

    if (error) {
      console.error('Error assigning user to task:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in assignUserToTask:', error);
    return false;
  }
};

export const getJobIdForPhase = async (phaseId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('phases')
      .select('job_id')
      .eq('id', phaseId)
      .single();
    
    if (error || !data) {
      console.error('Error getting job ID for phase:', error);
      return null;
    }
    
    return data.job_id;
  } catch (error) {
    console.error('Error in getJobIdForPhase:', error);
    return null;
  }
};

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
    console.log(`Creating task "${name}" in area ${area} with options:`, options);
    
    // Sanitize task name - ensure it's a simple string, not a JSON object
    let sanitizedName = name;
    
    // If the name is already a JSON string that contains a name property, extract it
    if (name.startsWith('{') && name.includes('name')) {
      try {
        const parsed = JSON.parse(name);
        sanitizedName = parsed.name || name;
      } catch (e) {
        // If parsing fails, keep the original name
        sanitizedName = name;
      }
    }

    const taskData = {
      phase_id: phaseId,
      area,
      name: sanitizedName,
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
      console.log(`Assigning ${options.assigneeIds.length} users to task ${data.id}`);
      
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      for (const userId of options.assigneeIds) {
        console.log(`Creating assignment for user ${userId}`);
        
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
    return transformTaskData(data);
  } catch (error) {
    console.error('Error in createTask:', error);
    return null;
  }
}
