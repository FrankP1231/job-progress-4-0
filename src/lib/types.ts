
export type MaterialStatus = 'not-needed' | 'not-ordered' | 'ordered' | 'received';
export type LaborStatus = 'not-needed' | 'estimated' | 'complete';
export type PowderCoatStatus = 'not-needed' | 'not-started' | 'in-progress' | 'complete';
export type RentalStatus = 'not-needed' | 'not-ordered' | 'ordered';
export type PhaseStatus = 'pending' | 'in-progress' | 'complete';

export interface MaterialTracking {
  status: MaterialStatus;
  eta?: string; // ISO date string
  notes?: string;
}

export interface LaborTracking {
  status: LaborStatus;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
}

export interface PowderCoatTracking {
  status: PowderCoatStatus;
  startDate?: string; // ISO date string
  estimatedCompletionDate?: string; // ISO date string
  notes?: string;
}

export interface RentalTracking {
  status: RentalStatus;
  details?: string;
  notes?: string;
}

export interface InstallationDetails {
  crewMembersNeeded: number;
  crewHoursNeeded: number;
  siteReadyDate?: string; // ISO date string
  installDeadline?: string; // ISO date string
  installStartDate?: string; // ISO date string
  installFinishDate?: string; // ISO date string
  rentalEquipment: RentalTracking;
  notes?: string;
}

export interface Phase {
  id: string;
  phaseName: string;
  phaseNumber: number;
  status: PhaseStatus;
  
  // Production tracking
  weldingMaterials: MaterialTracking;
  sewingMaterials: MaterialTracking;
  weldingLabor: LaborTracking;
  sewingLabor: LaborTracking;
  installationMaterials: MaterialTracking;
  powderCoat: PowderCoatTracking;
  
  // Installation details
  installation: InstallationDetails;
  
  // Calendar/scheduling
  outlookEventId?: string;
  
  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Job {
  id: string;
  jobNumber: string;
  projectName: string;
  buyer: string;
  title: string; // For Outlook Calendar
  salesman: string;
  drawingsUrl?: string;
  worksheetUrl?: string;
  phases: Phase[];
  
  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
