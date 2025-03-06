
import { supabase } from "./client";
import { logActivity } from "./activityLogUtils";

// Map JavaScript camelCase field paths to database snake_case column names
const fieldPathToColumnMap: Record<string, string> = {
  'weldingMaterials': 'welding_materials',
  'weldingLabor': 'welding_labor',
  'sewingMaterials': 'sewing_materials',
  'sewingLabor': 'sewing_labor',
  'installationMaterials': 'installation_materials',
  'powderCoat': 'powder_coat',
  'installation': 'installation',
  'installation.rentalEquipment': 'installation.rental_equipment'
};

// Update a phase's status field
export const updatePhaseStatus = async (
  jobId: string, 
  phaseId: string, 
  fieldPath: string, 
  updateData: Record<string, any>
): Promise<boolean> => {
  try {
    // First, get the current phase data
    const { data: currentPhase, error: fetchError } = await supabase
      .from('phases')
      .select('*')
      .eq('id', phaseId)
      .eq('job_id', jobId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching phase for status update:', fetchError);
      throw fetchError;
    }
    
    if (!currentPhase) {
      throw new Error('Phase not found');
    }
    
    // Parse the field path to access the nested JSON field
    const pathSegments = fieldPath.split('.');
    
    // Get the database column name for the first segment
    const baseFieldName = pathSegments[0];
    const dbColumnName = fieldPathToColumnMap[baseFieldName] || baseFieldName;
    
    // Deep clone the current field value to avoid mutating the original
    // Handle potentially undefined values safely
    const updatedField = currentPhase[dbColumnName] ? 
      JSON.parse(JSON.stringify(currentPhase[dbColumnName])) : {};
    
    // Store the current value before updates for logging
    const previousValue = JSON.parse(JSON.stringify(updatedField));
    
    // Apply updates to the specific field
    if (pathSegments.length === 1) {
      // Direct update to the full object
      Object.assign(updatedField, updateData);
    } else {
      // Nested update (e.g., 'installation.rentalEquipment')
      let target = updatedField;
      
      // Navigate to the nested object, except the last segment
      for (let i = 1; i < pathSegments.length - 1; i++) {
        const segment = pathSegments[i];
        // Handle snake_case conversion for nested objects
        const dbSegment = segment === 'rentalEquipment' ? 'rental_equipment' : segment;
        
        if (!target[dbSegment]) {
          target[dbSegment] = {};
        }
        target = target[dbSegment];
      }
      
      // Update the nested property
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Convert the last segment if needed
      const dbLastSegment = lastSegment === 'rentalEquipment' ? 'rental_equipment' : lastSegment;
      
      if (!target[dbLastSegment]) {
        target[dbLastSegment] = {};
      }
      Object.assign(target[dbLastSegment], updateData);
    }
    
    // Check if installation status is being set to complete
    let isComplete = currentPhase.is_complete;
    if (fieldPath === 'installation.status' && updateData.status === 'complete') {
      isComplete = true;
      
      // Get phase details for better logging
      const { data: phaseDetails } = await supabase
        .from('phases')
        .select('phase_name, phase_number')
        .eq('id', phaseId)
        .single();
      
      if (phaseDetails) {
        // Log the phase completion separately
        await logActivity({
          jobId,
          phaseId,
          activityType: 'phase_update',
          description: `Phase ${phaseDetails.phase_number}: ${phaseDetails.phase_name} was automatically marked as complete because installation was completed`,
          previousValue: { isComplete: currentPhase.is_complete },
          newValue: { isComplete: true }
        });
      }
    }
    
    // Update the phase with the modified field
    const { error: updateError } = await supabase
      .from('phases')
      .update({
        [dbColumnName]: updatedField,
        is_complete: isComplete,
        updated_at: new Date().toISOString()
      })
      .eq('id', phaseId)
      .eq('job_id', jobId);
    
    if (updateError) {
      console.error('Error updating phase status:', updateError);
      throw updateError;
    }
    
    // Update the job's updated_at timestamp
    await supabase
      .from('jobs')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', jobId);
    
    return true;
  } catch (error) {
    console.error('Error in updatePhaseStatus:', error);
    throw error;
  }
};
