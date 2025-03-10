
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllJobs } from '@/lib/supabase/jobUtils';
import { getTasksForPhase } from '@/lib/supabase/taskUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Scissors, PackageCheck } from 'lucide-react';
import { useProductionPhases, PhaseWithJob } from '@/hooks/useProductionPhases';
import WeldingTabContent from './WeldingTabContent';
import SewingTabContent from './SewingTabContent';
import ReadyForInstallTabContent from './ReadyForInstallTabContent';
import { Phase, Task } from '@/lib/types';

const ProductionOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'welding' | 'sewing' | 'readyForInstall'>('welding');
  const [phaseTasks, setPhaseTasks] = useState<Record<string, Task[]>>({});
  
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: getAllJobs
  });

  const {
    weldingPhases,
    sewingPhases, 
    readyForInstallPhases,
    totalWeldingHours,
    totalSewingHours,
    totalInstallHours
  } = useProductionPhases(jobs);

  // Fetch tasks for all phases
  useEffect(() => {
    const fetchTasks = async () => {
      const allPhaseObjects = [...weldingPhases, ...sewingPhases, ...readyForInstallPhases];
      const uniquePhaseIds = Array.from(new Set(allPhaseObjects.map(phaseObj => phaseObj.phase.id)));
      
      const taskPromises = uniquePhaseIds.map(async (phaseId) => {
        try {
          const tasks = await getTasksForPhase(phaseId);
          return { phaseId, tasks };
        } catch (err) {
          console.error(`Error fetching tasks for phase ${phaseId}:`, err);
          return { phaseId, tasks: [] };
        }
      });
      
      const tasksResults = await Promise.all(taskPromises);
      const tasksMap: Record<string, Task[]> = {};
      
      tasksResults.forEach(({ phaseId, tasks }) => {
        tasksMap[phaseId] = tasks;
      });
      
      setPhaseTasks(tasksMap);
    };
    
    if (jobs && jobs.length > 0) {
      fetchTasks();
    }
  }, [jobs, weldingPhases, sewingPhases, readyForInstallPhases]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-20 border-t-primary rounded-full" />
    </div>;
  }

  if (error) {
    console.error('Error fetching jobs:', error);
    return <div className="text-red-500">Error loading jobs</div>;
  }

  // Convert PhaseWithJob objects to Phase objects
  const extractPhases = (phaseWithJobArray: PhaseWithJob[]): Phase[] => {
    return phaseWithJobArray.map(item => item.phase);
  };

  // Use tasksMap variable name consistently
  const tasksMap = phaseTasks;
  
  const enhancedWeldingPhases = enhancePhaseWithTasks(extractPhases(weldingPhases));
  const enhancedSewingPhases = enhancePhaseWithTasks(extractPhases(sewingPhases));
  const enhancedInstallPhases = enhancePhaseWithTasks(extractPhases(readyForInstallPhases));

  // Enhance phases with tasks
  const enhancePhaseWithTasks = (phases: Phase[]): Phase[] => {
    return phases.map(phase => {
      const phaseTasks = tasksMap[phase.id] || [];
      
      return {
        ...phase,
        weldingLabor: {
          ...phase.weldingLabor,
          tasks: phaseTasks.filter(task => task.area === 'weldingLabor')
        },
        sewingLabor: {
          ...phase.sewingLabor,
          tasks: phaseTasks.filter(task => task.area === 'sewingLabor')
        },
        weldingMaterials: {
          ...phase.weldingMaterials,
          tasks: phaseTasks.filter(task => task.area === 'weldingMaterials')
        },
        sewingMaterials: {
          ...phase.sewingMaterials,
          tasks: phaseTasks.filter(task => task.area === 'sewingMaterials')
        },
        installationMaterials: {
          ...phase.installationMaterials,
          tasks: phaseTasks.filter(task => task.area === 'installationMaterials')
        },
        powderCoat: {
          ...phase.powderCoat,
          tasks: phaseTasks.filter(task => task.area === 'powderCoat')
        },
        installation: {
          ...phase.installation,
          tasks: phaseTasks.filter(task => task.area === 'installation'),
          rentalEquipment: {
            ...phase.installation.rentalEquipment,
            tasks: phaseTasks.filter(task => task.area === 'rentalEquipment')
          }
        }
      };
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Overview</h1>
        {/* Sample data button removed */}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'welding' | 'sewing' | 'readyForInstall')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="welding" className="flex items-center">
            <Wrench className="mr-2 h-4 w-4" />
            Welding ({enhancedWeldingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="sewing" className="flex items-center">
            <Scissors className="mr-2 h-4 w-4" />
            Sewing ({enhancedSewingPhases.length})
          </TabsTrigger>
          <TabsTrigger value="readyForInstall" className="flex items-center">
            <PackageCheck className="mr-2 h-4 w-4" />
            Ready for Install ({enhancedInstallPhases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="welding" className="mt-6">
          <WeldingTabContent 
            weldingPhases={enhancedWeldingPhases} 
            totalWeldingHours={totalWeldingHours} 
          />
        </TabsContent>

        <TabsContent value="sewing" className="mt-6">
          <SewingTabContent 
            sewingPhases={enhancedSewingPhases} 
            totalSewingHours={totalSewingHours} 
          />
        </TabsContent>

        <TabsContent value="readyForInstall" className="mt-6">
          <ReadyForInstallTabContent 
            readyForInstallPhases={enhancedInstallPhases} 
            totalInstallHours={totalInstallHours} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionOverview;
