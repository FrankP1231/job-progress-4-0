
import { supabase } from "./client";
import { Task, TaskStatus } from '../types';
import { logActivity } from "./activityLogUtils";
import { getJobIdForPhase, transformTaskData, getAllTasksWithDetails } from "./task-helpers";

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
  return (data || []).map(transformTaskData);
};

// Get all tasks for all jobs
export const getTasksForAllJobs = async (): Promise<Task[]> => {
  try {
    return await getAllTasksWithDetails();
  } catch (error) {
    console.error('Error in getTasksForAllJobs:', error);
    throw error;
  }
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
  return (data || []).map(transformTaskData);
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
  
  // Get job ID for logging
  const jobId = await getJobIdForPhase(task.phaseId);
  
  // Log the activity
  if (jobId) {
    await logActivity({
      jobId,
      phaseId: task.phaseId,
      activityType: 'task_change',
      description: `Task "${task.name}" was added to ${task.area}`
    });
  }
  
  return transformTaskData(data);
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
  
  // Get job ID for logging
  const jobId = await getJobIdForPhase(data.phase_id);
  
  // Log the activity
  if (jobId) {
    await logActivity({
      jobId,
      phaseId: data.phase_id,
      activityType: 'task_change',
      description: `Task "${data.name}" was updated`,
      fieldName: 'task',
      previousValue: null, // Ideally, we would fetch the previous state
      newValue: updateData
    });
  }
  
  return transformTaskData(data);
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
    // Get job ID for logging
    const jobId = await getJobIdForPhase(taskData.phase_id);
    
    // Log the activity
    if (jobId) {
      await logActivity({
        jobId,
        phaseId: taskData.phase_id,
        activityType: 'task_change',
        description: `Task "${taskData.name}" was deleted from ${taskData.area}`
      });
    }
  }
  
  return true;
};

// Add tasks in bulk for a phase area
export const addTasksToPhaseArea = async (
  phaseId: string, 
  area: string, 
  taskNames: string[] | Array<{name: string, hours?: number, eta?: string}>
): Promise<Task[]> => {
  const tasksList = taskNames
    .map(task => {
      const taskName = typeof task === 'string' ? task : task.name;
      const taskHours = typeof task === 'object' ? task.hours : undefined;
      const taskEta = typeof task === 'object' ? task.eta : undefined;
      
      if (!taskName.trim()) return null;
      
      return {
        phase_id: phaseId,
        area,
        name: taskName.trim(),
        is_complete: false,
        status: 'not-started' as TaskStatus,
        hours: taskHours,
        eta: taskEta
      };
    })
    .filter((task): task is Exclude<typeof task, null> => task !== null);
  
  if (tasksList.length === 0) return [];
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(tasksList)
    .select();
  
  if (error) {
    console.error('Error adding tasks:', error);
    throw error;
  }
  
  // Get job ID for logging
  const jobId = await getJobIdForPhase(phaseId);
  
  // Log the activity
  if (jobId) {
    await logActivity({
      jobId,
      phaseId,
      activityType: 'task_change',
      description: `${tasksList.length} tasks were added to ${area}`
    });
  }
  
  // Transform the data to match our types
  return (data || []).map(transformTaskData);
};

// Add sample tasks for testing (new function)
export const addSampleTasksToPhases = async (): Promise<void> => {
  // Get all phases to add tasks to
  const { data: phases, error } = await supabase
    .from('phases')
    .select('id, phase_name, job_id')
    .order('created_at', { ascending: true })
    .limit(10);
  
  if (error) {
    console.error('Error fetching phases for sample data:', error);
    throw error;
  }
  
  if (!phases || phases.length === 0) {
    console.log('No phases found to add sample tasks to');
    return;
  }
  
  // Tasks for each area
  const weldingMaterialsTasks = [
    'Order steel tubing',
    'Order angle brackets',
    'Source fasteners',
    'Verify material specifications',
    'Check inventory for reusable parts'
  ];
  
  const weldingLaborTasks = [
    'Cut steel to specifications',
    'Weld frame assembly',
    'Grind welds',
    'Quality check all welds',
    'Prepare for powder coating'
  ];
  
  const sewingMaterialsTasks = [
    'Order fabric material',
    'Source thread and zippers',
    'Order grommets and hardware',
    'Verify material colors',
    'Check inventory for extra materials'
  ];
  
  const sewingLaborTasks = [
    'Cut fabric according to pattern',
    'Sew seams and edges',
    'Install grommets',
    'Add reinforcements',
    'Quality check stitching'
  ];
  
  const powderCoatTasks = [
    'Prepare surface for coating',
    'Apply primer',
    'Apply powder coat',
    'Inspect finish',
    'Pack for shipping'
  ];
  
  const installationTasks = [
    'Schedule installation crew',
    'Coordinate with client',
    'Verify site measurements',
    'Prepare installation tools',
    'Final walkthrough with client'
  ];
  
  // Process each phase
  for (const phase of phases) {
    try {
      console.log(`Adding sample tasks to phase: ${phase.phase_name}`);
      
      // Check if tasks already exist for this phase
      const existingTasks = await getTasksForPhase(phase.id);
      if (existingTasks.length > 0) {
        console.log(`Phase ${phase.phase_name} already has ${existingTasks.length} tasks, skipping...`);
        continue;
      }
      
      // Add tasks with different completion statuses
      const addTasksWithStatus = async (area: string, tasks: string[]) => {
        const tasksList = tasks.map((name, index) => ({
          phase_id: phase.id,
          area,
          name,
          is_complete: index < 2, // First two tasks are complete
          status: index < 2 ? 'complete' as TaskStatus : 
                 index === 2 ? 'in-progress' as TaskStatus : 
                 'not-started' as TaskStatus,
          hours: area.includes('Labor') ? 2 + (index % 3) : undefined, // Add hours for labor tasks
          eta: area.includes('Materials') ? new Date(Date.now() + (7 + index) * 24 * 60 * 60 * 1000).toISOString() : undefined, // Add ETA for material tasks
          notes: index % 3 === 0 ? `Priority task for ${area}` : undefined // Add notes to some tasks
        }));
        
        await supabase.from('tasks').insert(tasksList);
      };
      
      // Add different task types to each phase
      await addTasksWithStatus('weldingMaterials', weldingMaterialsTasks);
      await addTasksWithStatus('weldingLabor', weldingLaborTasks);
      await addTasksWithStatus('sewingMaterials', sewingMaterialsTasks);
      await addTasksWithStatus('sewingLabor', sewingLaborTasks);
      await addTasksWithStatus('powderCoat', powderCoatTasks);
      await addTasksWithStatus('installation', installationTasks);
      
      console.log(`Successfully added sample tasks to phase: ${phase.phase_name}`);
      
      // Log the activity
      await logActivity({
        jobId: phase.job_id,
        phaseId: phase.id,
        activityType: 'task_change',
        description: `Sample tasks were added to phase ${phase.phase_name} for testing`
      });
    } catch (err) {
      console.error(`Error adding sample tasks to phase ${phase.phase_name}:`, err);
    }
  }
  
  console.log('Sample task creation complete');
};
