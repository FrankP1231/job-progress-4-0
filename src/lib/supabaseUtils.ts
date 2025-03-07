
import { supabase } from "./supabase/client";
import { createJob } from "./supabase/jobUtils";
import { createNewPhase, addPhaseToJob } from "./supabase/phaseUtils";
import { getJobById } from "./supabase/jobUtils";
import { markPhaseComplete } from "./supabase/phaseUtils";
import { updateJob } from "./supabase/jobUtils";
import { addSampleTasksToPhases } from "./supabase/taskUtils";

// Re-export needed functions for components
export { getJobById, markPhaseComplete, updateJob, addSampleTasksToPhases };

// Initialize with some sample data if needed (for development)
export const initSampleData = async (): Promise<void> => {
  const { count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });
   
  if (error) {
    console.error('Error checking job count:', error);
    return;
  }
   
  if (count === 0) {
    try {
      // Create a sample job
      const sampleJob = await createJob({
        jobNumber: 'J2023-001',
        projectName: 'Downtown Cafe Awnings',
        buyer: 'Jane Smith',
        title: 'Cafe Awning Installation',
        salesman: 'Bob Johnson'
      });
       
      // Create some phases for the sample job
      const phase1 = createNewPhase(sampleJob.id, 'Front Entrance', 1);
      const phase2 = createNewPhase(sampleJob.id, 'Side Patio', 2);
       
      await addPhaseToJob(sampleJob.id, phase1);
      await addPhaseToJob(sampleJob.id, phase2);
       
      console.log('Sample data initialized successfully');
      
      // Add sample tasks after creating phases
      await addSampleTasksToPhases();
    } catch (err) {
      console.error('Error initializing sample data:', err);
    }
  }
};
