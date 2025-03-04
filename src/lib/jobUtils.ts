
import { Job, Phase } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock database - in a real app, this would be replaced with an actual database
const JOBS_STORAGE_KEY = 'awning_jobs';

// Load jobs from localStorage
export const loadJobs = (): Job[] => {
  const jobsJson = localStorage.getItem(JOBS_STORAGE_KEY);
  if (!jobsJson) return [];
  
  try {
    return JSON.parse(jobsJson);
  } catch (e) {
    console.error('Failed to parse jobs from localStorage:', e);
    return [];
  }
};

// Save jobs to localStorage
export const saveJobs = (jobs: Job[]): void => {
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
};

// Get all jobs
export const getAllJobs = (): Job[] => {
  return loadJobs();
};

// Get job by ID
export const getJobById = (id: string): Job | undefined => {
  const jobs = loadJobs();
  return jobs.find(job => job.id === id);
};

// Get job by job number
export const getJobByNumber = (jobNumber: string): Job | undefined => {
  const jobs = loadJobs();
  return jobs.find(job => job.jobNumber === jobNumber);
};

// Create a new job
export const createJob = (jobData: Partial<Job>): Job => {
  const jobs = loadJobs();
  
  // Check if job number already exists
  if (jobData.jobNumber && jobs.some(job => job.jobNumber === jobData.jobNumber)) {
    throw new Error(`Job number ${jobData.jobNumber} already exists`);
  }
  
  const timestamp = new Date().toISOString();
  
  const newJob: Job = {
    id: uuidv4(),
    jobNumber: jobData.jobNumber || '',
    projectName: jobData.projectName || '',
    buyer: jobData.buyer || '',
    title: jobData.title || '',
    salesman: jobData.salesman || '',
    drawingsUrl: jobData.drawingsUrl,
    worksheetUrl: jobData.worksheetUrl,
    phases: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  jobs.push(newJob);
  saveJobs(jobs);
  
  return newJob;
};

// Update a job
export const updateJob = (id: string, jobData: Partial<Job>): Job | undefined => {
  const jobs = loadJobs();
  const jobIndex = jobs.findIndex(job => job.id === id);
  
  if (jobIndex === -1) return undefined;
  
  // Check if job number is being changed and already exists
  if (jobData.jobNumber && 
      jobData.jobNumber !== jobs[jobIndex].jobNumber &&
      jobs.some((job, idx) => idx !== jobIndex && job.jobNumber === jobData.jobNumber)) {
    throw new Error(`Job number ${jobData.jobNumber} already exists`);
  }
  
  const updatedJob = {
    ...jobs[jobIndex],
    ...jobData,
    updatedAt: new Date().toISOString()
  };
  
  jobs[jobIndex] = updatedJob;
  saveJobs(jobs);
  
  return updatedJob;
};

// Delete a job
export const deleteJob = (id: string): boolean => {
  const jobs = loadJobs();
  const filteredJobs = jobs.filter(job => job.id !== id);
  
  if (filteredJobs.length === jobs.length) return false;
  
  saveJobs(filteredJobs);
  return true;
};

// Create a new phase
export const createNewPhase = (jobId: string, phaseName: string, phaseNumber: number): Phase => {
  const timestamp = new Date().toISOString();
  
  return {
    id: uuidv4(),
    jobId,
    phaseName,
    phaseNumber,
    weldingMaterials: { status: 'not-ordered' },
    sewingMaterials: { status: 'not-ordered' },
    weldingLabor: { status: 'not-needed' },
    sewingLabor: { status: 'not-needed' },
    installationMaterials: { status: 'not-ordered' },
    powderCoat: { status: 'not-needed' },
    installation: {
      crewMembersNeeded: 2,
      crewHoursNeeded: 4,
      rentalEquipment: { status: 'not-needed' }
    },
    isComplete: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

// Add a phase to a job
export const addPhaseToJob = (jobId: string, phase: Phase): boolean => {
  const jobs = loadJobs();
  const jobIndex = jobs.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) return false;
  
  // Check if phase number already exists
  if (jobs[jobIndex].phases.some(p => p.phaseNumber === phase.phaseNumber)) {
    throw new Error(`Phase number ${phase.phaseNumber} already exists for this job`);
  }
  
  jobs[jobIndex].phases.push(phase);
  jobs[jobIndex].updatedAt = new Date().toISOString();
  
  saveJobs(jobs);
  return true;
};

// Update a phase
export const updatePhase = (jobId: string, phaseId: string, phaseData: Partial<Phase>): Phase | undefined => {
  const jobs = loadJobs();
  const jobIndex = jobs.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) return undefined;
  
  const phaseIndex = jobs[jobIndex].phases.findIndex(phase => phase.id === phaseId);
  
  if (phaseIndex === -1) return undefined;
  
  // Check if phase number is being changed and already exists
  if (phaseData.phaseNumber && 
      phaseData.phaseNumber !== jobs[jobIndex].phases[phaseIndex].phaseNumber &&
      jobs[jobIndex].phases.some((p, idx) => idx !== phaseIndex && p.phaseNumber === phaseData.phaseNumber)) {
    throw new Error(`Phase number ${phaseData.phaseNumber} already exists for this job`);
  }
  
  const updatedPhase = {
    ...jobs[jobIndex].phases[phaseIndex],
    ...phaseData,
    updatedAt: new Date().toISOString()
  };
  
  jobs[jobIndex].phases[phaseIndex] = updatedPhase;
  jobs[jobIndex].updatedAt = new Date().toISOString();
  
  saveJobs(jobs);
  
  return updatedPhase;
};

// Delete a phase
export const deletePhase = (jobId: string, phaseId: string): boolean => {
  const jobs = loadJobs();
  const jobIndex = jobs.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) return false;
  
  const filteredPhases = jobs[jobIndex].phases.filter(phase => phase.id !== phaseId);
  
  if (filteredPhases.length === jobs[jobIndex].phases.length) return false;
  
  jobs[jobIndex].phases = filteredPhases;
  jobs[jobIndex].updatedAt = new Date().toISOString();
  
  saveJobs(jobs);
  return true;
};

// Get all phases for a job
export const getPhasesForJob = (jobId: string): Phase[] => {
  const job = getJobById(jobId);
  return job ? job.phases : [];
};

// Get phase by ID
export const getPhaseById = (jobId: string, phaseId: string): Phase | undefined => {
  const job = getJobById(jobId);
  return job ? job.phases.find(phase => phase.id === phaseId) : undefined;
};

// Get all in-progress phases across all jobs
export const getInProgressPhases = (): { job: Job, phase: Phase }[] => {
  const jobs = loadJobs();
  const inProgressPhases: { job: Job, phase: Phase }[] = [];
  
  jobs.forEach(job => {
    job.phases.forEach(phase => {
      if (!phase.isComplete) {
        inProgressPhases.push({ job, phase });
      }
    });
  });
  
  return inProgressPhases;
};

// Mark a phase as complete
export const markPhaseComplete = (jobId: string, phaseId: string, isComplete: boolean = true): boolean => {
  return updatePhase(jobId, phaseId, { isComplete }) !== undefined;
};

// Utility to create Outlook calendar appointment title
export const createOutlookTitle = (job: Job, phase: Phase): string => {
  return `[Phase ${phase.phaseNumber}]-[${job.jobNumber}] - ${job.projectName} - ${job.buyer} - ${job.salesman} - [Crew: ${phase.installation.crewMembersNeeded}], ${phase.installation.siteReadyDate ? new Date(phase.installation.siteReadyDate).toLocaleDateString() : 'N/A'} - ${phase.installation.installDeadline ? new Date(phase.installation.installDeadline).toLocaleDateString() : 'N/A'}`;
};

// Calculate appointment dates based on crew hours needed
export const calculateAppointmentDates = (phase: Phase): { startDate: Date, endDate: Date }[] => {
  if (!phase.installation.installStartDate) {
    throw new Error('Installation start date is required');
  }
  
  const startDate = new Date(phase.installation.installStartDate);
  const hoursNeeded = phase.installation.crewHoursNeeded;
  const appointments: { startDate: Date, endDate: Date }[] = [];
  
  let remainingHours = hoursNeeded;
  let currentDate = new Date(startDate);
  
  while (remainingHours > 0) {
    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    const hoursForToday = Math.min(remainingHours, 10);
    
    const startDateTime = new Date(currentDate);
    const endDateTime = new Date(currentDate);
    endDateTime.setHours(endDateTime.getHours() + hoursForToday);
    
    appointments.push({
      startDate: startDateTime,
      endDate: endDateTime
    });
    
    remainingHours -= hoursForToday;
    
    if (remainingHours > 0) {
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return appointments;
};

// Initialize with some sample data if needed (for development)
export const initSampleData = (): void => {
  if (loadJobs().length === 0) {
    const sampleJob = createJob({
      jobNumber: 'J2023-001',
      projectName: 'Downtown Cafe Awnings',
      buyer: 'Jane Smith',
      title: 'Cafe Awning Installation',
      salesman: 'Bob Johnson'
    });
    
    const phase1 = createNewPhase(sampleJob.id, 'Front Entrance', 1);
    const phase2 = createNewPhase(sampleJob.id, 'Side Patio', 2);
    
    addPhaseToJob(sampleJob.id, phase1);
    addPhaseToJob(sampleJob.id, phase2);
  }
};
