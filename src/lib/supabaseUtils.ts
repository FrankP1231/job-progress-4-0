
// Re-export all utilities for easy importing
export * from './supabase/jobUtils';
export * from './supabase/phaseUtils';
export * from './supabase/dashboardUtils';
export * from './supabase/statusUtils';
export * from './supabase/task-helpers';
export * from './supabase/task-crud';
export * from './supabase/taskUtils';

// Export initUtils specific functions with explicit naming to avoid conflicts
export { 
  createNewPhase as initCreateNewPhase, 
  addPhaseToJob as initAddPhaseToJob 
} from './supabase/initUtils';

// Add a sample data initialization function
export const initSampleData = async (): Promise<void> => {
  try {
    console.log('Initializing sample data if needed...');
    // This could call various initialization functions
    const { addSampleTasksToPhases } = await import('./supabase/task-crud');
    await addSampleTasksToPhases();
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};
