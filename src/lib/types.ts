
export type MaterialStatus = 'not-needed' | 'not-ordered' | 'ordered' | 'received';
export type LaborStatus = 'not-needed' | 'estimated' | 'complete';
export type PowderCoatStatus = 'not-needed' | 'not-started' | 'in-progress' | 'complete';
export type RentalEquipmentStatus = 'not-needed' | 'not-ordered' | 'ordered';
export type InstallationStatus = 'not-started' | 'in-progress' | 'complete';

export interface Material {
  status: MaterialStatus;
  notes?: string;
  eta?: string; // ISO date string
}

export interface Labor {
  status: LaborStatus;
  notes?: string;
  hours?: number;
}

export interface PowderCoat {
  status: PowderCoatStatus;
  notes?: string;
  eta?: string; // ISO date string
  color?: string; // Add color field to the PowderCoat interface
}

export interface RentalEquipment {
  status: RentalEquipmentStatus;
  notes?: string;
  details?: string;
}

export interface Installation {
  status: InstallationStatus;
  crewMembersNeeded: number;
  crewHoursNeeded: number;
  siteReadyDate?: string; // ISO date string
  installDeadline?: string; // ISO date string
  installStartDate?: string; // ISO date string
  installFinishDate?: string; // ISO date string
  rentalEquipment: RentalEquipment;
  notes?: string;
  outlookEventId?: string;
}

export interface Phase {
  id: string;
  jobId: string;
  phaseName: string;
  phaseNumber: number;
  weldingMaterials: Material;
  sewingMaterials: Material;
  weldingLabor: Labor;
  sewingLabor: Labor;
  installationMaterials: Material;
  powderCoat: PowderCoat;
  installation: Installation;
  isComplete: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Job {
  id: string;
  jobNumber: string;
  projectName: string;
  buyer: string;
  title: string;
  salesman: string;  // Field name stays the same for database compatibility
  drawingsUrl?: string;
  worksheetUrl?: string;
  phases: Phase[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface User {
  isAuthenticated: boolean;
}
