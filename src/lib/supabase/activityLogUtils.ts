
import { supabase } from "./client";

export type ActivityType = 
  | 'status_update'
  | 'job_update'
  | 'phase_update'
  | 'phase_added'
  | 'phase_deleted'
  | 'job_created';

export interface ActivityLog {
  id: string;
  jobId: string;
  phaseId?: string;
  activityType: ActivityType;
  description: string;
  fieldName?: string;
  previousValue?: any;
  newValue?: any;
  createdAt: string;
}

/**
 * Logs an activity in the activity_logs table
 */
export const logActivity = async ({
  jobId,
  phaseId = null,
  activityType,
  description,
  fieldName = null,
  previousValue = null,
  newValue = null
}: {
  jobId: string;
  phaseId?: string | null;
  activityType: ActivityType;
  description: string;
  fieldName?: string | null;
  previousValue?: any;
  newValue?: any;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        job_id: jobId,
        phase_id: phaseId,
        activity_type: activityType,
        description,
        field_name: fieldName,
        previous_value: previousValue ? JSON.stringify(previousValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null
      });
    
    if (error) {
      console.error('Error logging activity:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in logActivity:', error);
    return false;
  }
};

/**
 * Get all activities for a job
 */
export const getJobActivities = async (jobId: string): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching job activities:', error);
      throw error;
    }
    
    return (data || []).map(activity => ({
      id: activity.id,
      jobId: activity.job_id,
      phaseId: activity.phase_id,
      activityType: activity.activity_type as ActivityType,
      description: activity.description,
      fieldName: activity.field_name,
      previousValue: activity.previous_value,
      newValue: activity.new_value,
      createdAt: activity.created_at
    }));
  } catch (error) {
    console.error('Error in getJobActivities:', error);
    throw error;
  }
};

/**
 * Get activities for a specific phase
 */
export const getPhaseActivities = async (jobId: string, phaseId: string): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('job_id', jobId)
      .eq('phase_id', phaseId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching phase activities:', error);
      throw error;
    }
    
    return (data || []).map(activity => ({
      id: activity.id,
      jobId: activity.job_id,
      phaseId: activity.phase_id,
      activityType: activity.activity_type as ActivityType,
      description: activity.description,
      fieldName: activity.field_name,
      previousValue: activity.previous_value,
      newValue: activity.new_value,
      createdAt: activity.created_at
    }));
  } catch (error) {
    console.error('Error in getPhaseActivities:', error);
    throw error;
  }
};
