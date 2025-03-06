
import { useMemo } from 'react';
import { Job, Phase } from '@/lib/types';

type PhaseWithJob = { phase: Phase, job: Job };

export function useProductionPhases(jobs: Job[] | undefined) {
  const productionJobs = useMemo(() => {
    return jobs?.filter(job => 
      job.phases.some(phase => 
        phase.weldingLabor.status !== 'not-needed' || 
        phase.sewingLabor.status !== 'not-needed'
      )
    ) || [];
  }, [jobs]);

  const weldingPhases = useMemo<PhaseWithJob[]>(() => {
    const phases: PhaseWithJob[] = [];
    productionJobs.forEach(job => {
      job.phases.forEach(phase => {
        if (phase.weldingLabor.status !== 'not-needed') {
          phases.push({ phase, job });
        }
      });
    });
    return phases;
  }, [productionJobs]);

  const sewingPhases = useMemo<PhaseWithJob[]>(() => {
    const phases: PhaseWithJob[] = [];
    productionJobs.forEach(job => {
      job.phases.forEach(phase => {
        if (phase.sewingLabor.status !== 'not-needed') {
          phases.push({ phase, job });
        }
      });
    });
    return phases;
  }, [productionJobs]);

  const readyForInstallPhases = useMemo<PhaseWithJob[]>(() => {
    const phases: PhaseWithJob[] = [];
    productionJobs.forEach(job => {
      job.phases.forEach(phase => {
        const isWeldingComplete = phase.weldingLabor.status === 'complete' || phase.weldingLabor.status === 'not-needed';
        const isSewingComplete = phase.sewingLabor.status === 'complete' || phase.sewingLabor.status === 'not-needed';
        const isPowderCoatComplete = phase.powderCoat.status === 'complete' || phase.powderCoat.status === 'not-needed';
        
        const areWeldingMaterialsReceived = phase.weldingMaterials.status === 'received' || phase.weldingMaterials.status === 'not-needed';
        const areSewingMaterialsReceived = phase.sewingMaterials.status === 'received' || phase.sewingMaterials.status === 'not-needed';
        const areInstallMaterialsReceived = phase.installationMaterials.status === 'received' || phase.installationMaterials.status === 'not-needed';
        
        if (isWeldingComplete && isSewingComplete && isPowderCoatComplete && 
            areWeldingMaterialsReceived && areSewingMaterialsReceived && areInstallMaterialsReceived && 
            phase.installation.status !== 'complete') {
          phases.push({ phase, job });
        }
      });
    });
    return phases;
  }, [productionJobs]);

  const totalWeldingHours = useMemo(() => {
    return weldingPhases.reduce((total, { phase }) => {
      return total + (phase.weldingLabor.hours || 0);
    }, 0);
  }, [weldingPhases]);

  const totalSewingHours = useMemo(() => {
    return sewingPhases.reduce((total, { phase }) => {
      return total + (phase.sewingLabor.hours || 0);
    }, 0);
  }, [sewingPhases]);
  
  const totalInstallHours = useMemo(() => {
    return readyForInstallPhases.reduce((total, { phase }) => {
      return total + (phase.installation.crewHoursNeeded || 0);
    }, 0);
  }, [readyForInstallPhases]);

  return {
    productionJobs,
    weldingPhases,
    sewingPhases,
    readyForInstallPhases,
    totalWeldingHours,
    totalSewingHours,
    totalInstallHours
  };
}

export type { PhaseWithJob };
