import { Task, TaskStatus } from '../../types';

// Transform raw task data from Supabase to our Task interface
export const transformTaskData = (data: any): Task => {
  if (!data) return null;
  
  // Parse the name if it's a JSON string
  let name = data.name;
  try {
    if (typeof name === 'string' && name.startsWith('{')) {
      const parsed = JSON.parse(name);
      name = parsed.name;
    }
  } catch (e) {
    // Keep original name if parsing fails
    console.error('Error parsing task name:', e);
  }
  
  return {
    id: data.id,
    phaseId: data.phase_id,
    area: data.area,
    name: name,
    isComplete: data.is_complete || data.status === 'complete',
    status: data.status as TaskStatus,
    hours: data.hours,
    eta: data.eta,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    phaseNumber: data.phases?.phase_number,
    phaseName: data.phases?.phase_name,
    jobId: data.phases?.job_id,
    jobNumber: data.phases?.jobs?.job_number,
    projectName: data.phases?.jobs?.project_name,
  };
};
