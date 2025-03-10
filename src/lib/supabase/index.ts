
// Re-export all utilities for easy importing
export * from './jobUtils';
export * from './phaseUtils';
export * from './dashboardUtils';
export * from './statusUtils';
export * from './task-helpers';
export * from './taskUtils';

// Import supabase from the correct location
import { supabase } from "@/integrations/supabase/client";

// Export task-crud without those functions that are overridden in taskUtils
export {
  addSampleTasksToPhases
} from './task-crud';

// Export initUtils specific functions with explicit naming to avoid conflicts
export { 
  createNewPhase as initCreateNewPhase, 
  addPhaseToJob as initAddPhaseToJob,
  initSampleData
} from './initUtils';

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .order('first_name');
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  // Map the profile data to match the expected structure in the UserSelector component
  return data.map(profile => ({
    id: profile.id,
    email: profile.email || '',
    name: `${profile.first_name} ${profile.last_name}`.trim()
  })) || [];
};
