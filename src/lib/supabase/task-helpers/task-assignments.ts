
import { supabase } from '../client';

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
