// Re-export all utilities for easy importing
export * from './jobUtils';
export * from './phaseUtils';
export * from './dashboardUtils';
export * from './statusUtils';
export * from './task-status';

// Re-export all task helpers
export * from './task-helpers';

// Export initUtils specific functions with explicit naming to avoid conflicts
export { 
  createNewPhase as initCreateNewPhase, 
  addPhaseToJob as initAddPhaseToJob,
  initSampleData
} from './initUtils';

// Import supabase from the correct location
import { supabase } from "@/integrations/supabase/client";
import { WorkArea } from "@/lib/types";

/**
 * Gets all users from the database, optionally filtered by work area
 * @param workArea Optional WorkArea to filter users by 
 * @returns Array of user objects with id, email, name, and workArea
 */
export const getAllUsers = async (workArea?: WorkArea) => {
  try {
    console.log(`Getting users with workArea filter:`, workArea);
    
    if (workArea) {
      // Validate workArea is one of the valid enum values
      const validWorkAreas: WorkArea[] = ['Front Office', 'Sewing', 'Welding', 'Installation'];
      if (!validWorkAreas.includes(workArea)) {
        console.error(`Invalid work area filter: "${workArea}". Valid values are: ${validWorkAreas.join(', ')}`);
        return [];
      }
    }
    
    let query = supabase
      .from('profiles')
      .select('id, email, first_name, last_name, work_area')
      .order('first_name');
      
    // If a specific work area is provided, filter by it
    if (workArea) {
      query = query.eq('work_area', workArea);
      console.log(`Filtering users by work_area: "${workArea}"`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No users found${workArea ? ` for work area: ${workArea}` : ''}`);
      return [];
    } else {
      console.log(`Found ${data.length} users${workArea ? ` for work area: ${workArea}` : ''}`);
      console.log('Sample user data:', data[0]);
    }
    
    // Map the profile data to match the expected structure in the UserSelector component
    const mappedUsers = data.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      workArea: profile.work_area as WorkArea
    })) || [];
    
    console.log(`Mapped ${mappedUsers.length} users`);
    return mappedUsers;
  } catch (error) {
    console.error('Unexpected error in getAllUsers:', error);
    return [];
  }
};
