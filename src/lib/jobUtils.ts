
import { Job, Phase, PhaseStatus } from './types';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Create a new job with default values
export const createNewJob = (jobNumber: string, projectName: string, buyer: string, title: string, salesman: string): Job => {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    jobNumber,
    projectName,
    buyer,
    title,
    salesman,
    drawingsUrl: '',
    worksheetUrl: '',
    phases: [],
    createdAt: now,
    updatedAt: now,
  };
};

// Create a new phase with default values
export const createNewPhase = (jobId: string, phaseName: string, phaseNumber: number): Phase => {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    phaseName,
    phaseNumber,
    status: 'pending',
    
    weldingMaterials: {
      status: 'not-ordered',
    },
    sewingMaterials: {
      status: 'not-ordered',
    },
    weldingLabor: {
      status: 'not-needed',
    },
    sewingLabor: {
      status: 'not-needed',
    },
    installationMaterials: {
      status: 'not-ordered',
    },
    powderCoat: {
      status: 'not-needed',
    },
    
    installation: {
      crewMembersNeeded: 2,
      crewHoursNeeded: 4,
      rentalEquipment: {
        status: 'not-needed',
      },
    },
    
    createdAt: now,
    updatedAt: now,
  };
};

// Get all jobs (normally would be from an API)
export const getJobs = (): Job[] => {
  const jobsStr = localStorage.getItem('awning-jobs');
  return jobsStr ? JSON.parse(jobsStr) : [];
};

// Save all jobs (normally would be to an API)
export const saveJobs = (jobs: Job[]): void => {
  localStorage.setItem('awning-jobs', JSON.stringify(jobs));
};

// Get a specific job by ID
export const getJobById = (jobId: string): Job | undefined => {
  const jobs = getJobs();
  return jobs.find(job => job.id === jobId);
};

// Save or update a job
export const saveJob = (job: Job): void => {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  
  if (index >= 0) {
    jobs[index] = { ...job, updatedAt: new Date().toISOString() };
  } else {
    jobs.push(job);
  }
  
  saveJobs(jobs);
};

// Delete a job
export const deleteJob = (jobId: string): void => {
  const jobs = getJobs();
  const filteredJobs = jobs.filter(job => job.id !== jobId);
  saveJobs(filteredJobs);
};

// Add a phase to a job
export const addPhaseToJob = (jobId: string, phase: Phase): boolean => {
  const job = getJobById(jobId);
  
  if (!job) return false;
  
  job.phases.push(phase);
  job.updatedAt = new Date().toISOString();
  
  saveJob(job);
  return true;
};

// Update a phase in a job
export const updatePhase = (jobId: string, phase: Phase): boolean => {
  const job = getJobById(jobId);
  
  if (!job) return false;
  
  const phaseIndex = job.phases.findIndex(p => p.id === phase.id);
  
  if (phaseIndex < 0) return false;
  
  job.phases[phaseIndex] = { ...phase, updatedAt: new Date().toISOString() };
  job.updatedAt = new Date().toISOString();
  
  saveJob(job);
  return true;
};

// Delete a phase from a job
export const deletePhase = (jobId: string, phaseId: string): boolean => {
  const job = getJobById(jobId);
  
  if (!job) return false;
  
  job.phases = job.phases.filter(phase => phase.id !== phaseId);
  job.updatedAt = new Date().toISOString();
  
  saveJob(job);
  return true;
};

// Get all phases across all jobs
export const getAllPhases = (): { job: Job, phase: Phase }[] => {
  const jobs = getJobs();
  const allPhases: { job: Job, phase: Phase }[] = [];
  
  jobs.forEach(job => {
    job.phases.forEach(phase => {
      allPhases.push({ job, phase });
    });
  });
  
  return allPhases;
};

// Get all in-progress phases across all jobs
export const getInProgressPhases = (): { job: Job, phase: Phase }[] => {
  const allPhases = getAllPhases();
  return allPhases.filter(({ phase }) => phase.status !== 'complete');
};

// Format date for display
export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Not set';
  
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Generate Outlook appointment title
export const generateAppointmentTitle = (job: Job, phase: Phase): string => {
  const { phaseNumber, installation } = phase;
  const { jobNumber, projectName, buyer, salesman } = job;
  
  let title = `[Phase ${phaseNumber}]-[${jobNumber}] - ${projectName} - ${buyer} - ${salesman}`;
  
  if (installation.crewMembersNeeded) {
    title += ` - ${installation.crewMembersNeeded} crew`;
  }
  
  if (installation.siteReadyDate) {
    title += `, ${formatDate(installation.siteReadyDate)}`;
  }
  
  if (installation.installDeadline) {
    title += ` - ${formatDate(installation.installDeadline)}`;
  }
  
  return title;
};

// Calculate next business day (skip weekends)
export const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  
  // Skip weekends
  if (nextDay.getDay() === 0) { // Sunday
    nextDay.setDate(nextDay.getDate() + 1);
  } else if (nextDay.getDay() === 6) { // Saturday
    nextDay.setDate(nextDay.getDate() + 2);
  }
  
  return nextDay;
};

// Generate installation dates for a phase based on crew hours
export const generateInstallationDates = (startDate: Date, crewHours: number): Date[] => {
  const dates: Date[] = [];
  let remainingHours = crewHours;
  let currentDate = new Date(startDate);
  
  while (remainingHours > 0) {
    const hoursForDay = Math.min(remainingHours, 10); // Max 10 hours per day
    dates.push(new Date(currentDate));
    
    remainingHours -= hoursForDay;
    
    if (remainingHours > 0) {
      currentDate = getNextBusinessDay(currentDate);
    }
  }
  
  return dates;
};

// Get the status color class based on status
export const getStatusColorClass = (status: string): string => {
  switch (status) {
    case 'not-needed':
      return 'bg-status-not-needed text-gray-700';
    case 'not-ordered':
    case 'not-started':
      return 'bg-status-not-ordered text-white';
    case 'ordered':
    case 'in-progress':
    case 'estimated':
      return 'bg-status-ordered text-gray-800';
    case 'received':
    case 'complete':
      return 'bg-status-complete text-white';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

// Get a user-friendly label for status
export const getStatusLabel = (status: string): string => {
  // Convert 'not-ordered' to 'Not Ordered', etc.
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Update overall phase status based on component status
export const updatePhaseStatus = (phase: Phase): PhaseStatus => {
  // If everything is complete or not needed, phase is complete
  const isComplete = 
    (phase.weldingMaterials.status === 'received' || phase.weldingMaterials.status === 'not-needed') &&
    (phase.sewingMaterials.status === 'received' || phase.sewingMaterials.status === 'not-needed') &&
    (phase.weldingLabor.status === 'complete' || phase.weldingLabor.status === 'not-needed') &&
    (phase.sewingLabor.status === 'complete' || phase.sewingLabor.status === 'not-needed') &&
    (phase.installationMaterials.status === 'received' || phase.installationMaterials.status === 'not-needed') &&
    (phase.powderCoat.status === 'complete' || phase.powderCoat.status === 'not-needed') &&
    (phase.installation.rentalEquipment.status === 'ordered' || phase.installation.rentalEquipment.status === 'not-needed') &&
    phase.installation.installFinishDate !== undefined;

  // If everything is still just in the default state, mark as pending
  const isPending = 
    phase.weldingMaterials.status === 'not-ordered' &&
    phase.sewingMaterials.status === 'not-ordered' &&
    phase.weldingLabor.status === 'not-needed' &&
    phase.sewingLabor.status === 'not-needed' &&
    phase.installationMaterials.status === 'not-ordered' &&
    phase.powderCoat.status === 'not-needed' &&
    phase.installation.rentalEquipment.status === 'not-needed' &&
    phase.installation.installStartDate === undefined;

  return isComplete ? 'complete' : (isPending ? 'pending' : 'in-progress');
};
