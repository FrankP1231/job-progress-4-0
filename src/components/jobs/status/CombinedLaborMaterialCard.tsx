
import React, { useState } from 'react';
import { Labor, Material, Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/ui/StatusBadge';
import { Clock } from 'lucide-react';
import TasksContainer from '@/components/production/TasksContainer';
import { addTasksToPhaseArea } from '@/lib/supabase/taskUtils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { refreshTasksData } from '@/lib/supabase/task-status';

interface CombinedLaborMaterialCardProps {
  title: string;
  icon: React.ReactNode;
  labor: Labor;
  material: Material;
  laborStatus?: React.ReactNode;
  materialStatus?: React.ReactNode;
  phaseId?: string;
}

const CombinedLaborMaterialCard: React.FC<CombinedLaborMaterialCardProps> = ({
  title,
  icon,
  labor,
  material,
  laborStatus,
  materialStatus,
  phaseId
}) => {
  const queryClient = useQueryClient();
  const [newTaskName, setNewTaskName] = useState('');
  
  const laborTasks = labor.tasks || [];
  const materialTasks = material.tasks || [];
  
  console.log(`${title} Labor Tasks:`, laborTasks.length);
  console.log(`${title} Material Tasks:`, materialTasks.length);
  
  const handleAddTask = async (area: string, taskName: string) => {
    if (!phaseId) return;
    
    try {
      console.log(`Adding task "${taskName}" to ${area} in phase ${phaseId}`);
      const result = await addTasksToPhaseArea(phaseId, area, [taskName]);
      toast.success('Task added successfully');
      
      console.log(`Task "${taskName}" added to ${area} in phase ${phaseId}`, result);
      
      // Use the dedicated function to refresh all related tasks data
      await refreshTasksData(queryClient, undefined, phaseId);
      
      // Also invalidate the job query to refresh the job detail page
      const jobId = await getJobIdForPhase(phaseId);
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };
  
  // Helper function to get jobId from phaseId
  const getJobIdForPhase = async (phaseId: string): Promise<string | null> => {
    try {
      const { getJobIdForPhase } = await import('@/lib/supabase/task-helpers');
      return await getJobIdForPhase(phaseId);
    } catch (error) {
      console.error('Error getting job ID for phase:', error);
      return null;
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-none">
      <CardContent className="p-0 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">Materials</h3>
            {materialStatus}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={material.status} />
            
            {material.eta && (
              <div className="text-sm text-gray-600">
                ETA: {new Date(material.eta).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {material.notes && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {material.notes}
            </div>
          )}
          
          <TasksContainer 
            tasks={materialTasks}
            phaseId={phaseId}
            area={title.toLowerCase() + 'Materials'}
            isEditing={!!phaseId}
            onAddTask={(taskName) => handleAddTask(title.toLowerCase() + 'Materials', taskName)}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">Labor</h3>
            {laborStatus}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={labor.status} />
            
            {labor.hours && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                {labor.hours} hours
              </div>
            )}
          </div>
          
          {labor.notes && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {labor.notes}
            </div>
          )}
          
          <TasksContainer 
            tasks={laborTasks}
            phaseId={phaseId}
            area={title.toLowerCase() + 'Labor'}
            isEditing={!!phaseId}
            onAddTask={(taskName) => handleAddTask(title.toLowerCase() + 'Labor', taskName)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CombinedLaborMaterialCard;
