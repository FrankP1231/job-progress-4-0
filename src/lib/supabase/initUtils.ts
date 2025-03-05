
import { createJob } from "./jobUtils";
import { createNewPhase, addPhaseToJob } from "./phaseUtils";
import { supabase } from "./client";

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
    } catch (err) {
      console.error('Error initializing sample data:', err);
    }
  }
};
