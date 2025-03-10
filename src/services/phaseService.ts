
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNewPhase, addPhaseToJob } from '@/lib/supabase';
import { Phase, InstallationStatus, PowderCoatStatus, RentalEquipmentStatus } from '@/lib/types';
import { toast } from 'sonner';
import { assignUserToTask } from '@/lib/supabase/task-helpers';

interface AddPhaseOptions {
  jobId: string;
  phaseName: string;
  phaseNumber: string;
  crewMembersNeeded: string;
  crewHoursNeeded: string;
  siteReadyDate: string;
  installDeadline: string;
  installNotes: string;
  powderCoatEta: string;
  powderCoatNotes: string;
  powderCoatColor: string;
  pendingTasks: Record<string, any[]>;
  onSuccess: () => void;
  onError: (error: any) => void;
}

export function useAddPhaseMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      jobId,
      phaseName,
      phaseNumber,
      crewMembersNeeded,
      crewHoursNeeded,
      siteReadyDate,
      installDeadline,
      installNotes,
      powderCoatEta,
      powderCoatNotes,
      powderCoatColor,
      pendingTasks
    }: AddPhaseOptions) => {
      if (!jobId) throw new Error('Job ID is required');
      if (!phaseName.trim()) throw new Error('Please enter a phase name');
      if (!phaseNumber.trim() || isNaN(Number(phaseNumber)) || Number(phaseNumber) <= 0) {
        throw new Error('Please enter a valid phase number');
      }
      
      const newPhase = createNewPhase(jobId, phaseName, Number(phaseNumber));
      
      newPhase.installation = {
        status: 'not-started' as InstallationStatus,
        crewMembersNeeded: Number(crewMembersNeeded),
        crewHoursNeeded: Number(crewHoursNeeded),
        siteReadyDate: siteReadyDate || undefined,
        installDeadline: installDeadline || undefined,
        notes: installNotes || undefined,
        rentalEquipment: {
          status: 'not-needed' as RentalEquipmentStatus
        }
      };
      
      if (powderCoatEta || powderCoatNotes || powderCoatColor) {
        newPhase.powderCoat = {
          status: 'not-started' as PowderCoatStatus,
          eta: powderCoatEta || undefined,
          notes: powderCoatNotes || undefined,
          color: powderCoatColor || undefined
        };
      }
      
      const result = await addPhaseToJob(jobId, newPhase, pendingTasks);
      
      if (!result || typeof result !== 'object' || !('createdTasks' in result)) {
        throw new Error('Failed to add phase');
      }
      
      const createdTasks = result.createdTasks;
      if (typeof createdTasks === 'object') {
        const assignmentPromises: Promise<boolean>[] = [];
        
        Object.keys(createdTasks).forEach(area => {
          const tasks = createdTasks[area];
          if (!Array.isArray(tasks)) return;
          
          tasks.forEach((task, index) => {
            const originalTaskData = pendingTasks[area]?.[index];
            
            if (originalTaskData?._assigneeIds && originalTaskData._assigneeIds.length > 0) {
              for (const userId of originalTaskData._assigneeIds) {
                assignmentPromises.push(assignUserToTask(task.id, userId));
              }
            }
          });
        });
        
        if (assignmentPromises.length > 0) {
          await Promise.all(assignmentPromises);
        }
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success('Phase added successfully');
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['inProgressPhases'] });
      variables.onSuccess();
    },
    onError: (error: any, variables) => {
      let errorMessage = 'Failed to add phase';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      variables.onError(error);
    }
  });
}
