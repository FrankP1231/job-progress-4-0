
import { supabase } from "./client";
import { Task, TaskStatus } from '../types';
import { logActivity } from "./activityLogUtils";

// Get all tasks for a phase
export const getTasksForPhase = async (phaseId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('phase_id', phaseId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  // Transform the data to match our types
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
};

// Get tasks for a specific area of a phase
export const getTasksForPhaseArea = async (phaseId: string, area: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('phase_id', phaseId)
    .eq('area', area)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching tasks for area:', error);
    throw error;
  }
  
  // Transform the data to match our types
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
};

// Create a new task
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      phase_id: task.phaseId,
      area: task.area,
      name: task.name,
      is_complete: task.isComplete,
      status: task.status,
      hours: task.hours,
      eta: task.eta,
      notes: task.notes
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  
  // Log the activity
  await logActivity({
    jobId: '', // This needs to be retrieved from phase data
    phaseId: task.phaseId,
    activityType: 'task_added',
    description: `Task "${task.name}" was added to ${task.area}`
  });
  
  // Transform the data to match our types
  return {
    id: data.id,
    phaseId: data.phase_id,
    area: data.area,
    name: data.name,
    isComplete: data.is_complete,
    status: data.status,
    hours: data.hours,
    eta: data.eta,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Update a task
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.isComplete !== undefined) updateData.is_complete = updates.isComplete;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.hours !== undefined) updateData.hours = updates.hours;
  if (updates.eta !== undefined) updateData.eta = updates.eta;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
  
  // Log the activity
  await logActivity({
    jobId: '', // This needs to be retrieved from phase data
    phaseId: data.phase_id,
    activityType: 'task_updated',
    description: `Task "${data.name}" was updated`,
    fieldName: 'task',
    previousValue: null, // Ideally, we would fetch the previous state
    newValue: updateData
  });
  
  // Transform the data to match our types
  return {
    id: data.id,
    phaseId: data.phase_id,
    area: data.area,
    name: data.name,
    isComplete: data.is_complete,
    status: data.status,
    hours: data.hours,
    eta: data.eta,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  // First, get task info for logging
  const { data: taskData } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
  
  if (taskData) {
    // Log the activity
    await logActivity({
      jobId: '', // This needs to be retrieved
      phaseId: taskData.phase_id,
      activityType: 'task_deleted',
      description: `Task "${taskData.name}" was deleted from ${taskData.area}`
    });
  }
  
  return true;
};

// Calculate area status based on tasks
export const calculateAreaStatus = (tasks: Task[]): 'not-started' | 'in-progress' | 'complete' => {
  if (tasks.length === 0) return 'not-started';
  
  const completedTasks = tasks.filter(task => task.isComplete).length;
  
  if (completedTasks === 0) return 'not-started';
  if (completedTasks === tasks.length) return 'complete';
  return 'in-progress';
};

// Mark a task as complete/incomplete
export const toggleTaskCompletion = async (taskId: string, isComplete: boolean): Promise<Task> => {
  return updateTask(taskId, { 
    isComplete, 
    status: isComplete ? 'complete' : 'in-progress' 
  });
};

// Add tasks in bulk for a phase area
export const addTasksToPhaseArea = async (
  phaseId: string, 
  area: string, 
  taskNames: string[]
): Promise<Task[]> => {
  const tasksList = taskNames
    .filter(name => name.trim()) // Filter out empty names
    .map(name => ({
      phase_id: phaseId,
      area,
      name: name.trim(),
      is_complete: false,
      status: 'not-started'
    }));
  
  if (tasksList.length === 0) return [];
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(tasksList)
    .select();
  
  if (error) {
    console.error('Error adding tasks:', error);
    throw error;
  }
  
  // Log the activity
  await logActivity({
    jobId: '', // This needs to be retrieved
    phaseId,
    activityType: 'tasks_added',
    description: `${tasksList.length} tasks were added to ${area}`
  });
  
  // Transform the data to match our types
  return (data || []).map(task => ({
    id: task.id,
    phaseId: task.phase_id,
    area: task.area,
    name: task.name,
    isComplete: task.is_complete,
    status: task.status,
    hours: task.hours,
    eta: task.eta,
    notes: task.notes,
    createdAt: task.created_at,
    updatedAt: task.updated_at
  }));
};
