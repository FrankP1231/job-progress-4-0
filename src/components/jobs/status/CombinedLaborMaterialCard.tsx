
import React, { useState, useEffect } from 'react';
import { Labor, Material, Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/ui/StatusBadge';
import { Clock } from 'lucide-react';
import TasksContainer from '@/components/production/TasksContainer';
import { addTasksToPhaseArea, getTasksForPhaseArea } from '@/lib/supabaseUtils';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { refreshTasksData } from '@/lib/supabase/task-status';
import { getJobIdForPhase } from '@/lib/supabase/task-helpers';

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
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  // Fetch latest tasks directly if we have a phaseId
  const { data: materialAreaTasks } = useQuery({
    queryKey: ['tasks', phaseId, title.toLowerCase() + 'Materials'],
    queryFn: () => getTasksForPhaseArea(phaseId!, title.toLowerCase() + 'Materials'),
    enabled: !!phaseId,
    refetchInterval: 10000 // Refetch every 10 seconds
  });
  
  const { data: laborAreaTasks } = useQuery({
    queryKey: ['tasks', phaseId, title.toLowerCase() + 'Labor'],
    queryFn: () => getTasksForPhaseArea(phaseId!, title.toLowerCase() + 'Labor'),
    enabled: !!phaseId,
    refetchInterval: 10000 // Refetch every 10 seconds
  });
  
  // Use fetched tasks if available, otherwise fall back to tasks from props
  const laborTasks = laborAreaTasks || labor.tasks || [];
  const materialTasks = materialAreaTasks || material.tasks || [];
  
  useEffect(() => {
    console.log(`${title} Labor Tasks loaded:`, laborTasks.length);
    console.log(`${title} Material Tasks loaded:`, materialTasks.length);
  }, [title, laborTasks, materialTasks]);
  
  const handleAddTask = async (area: string, taskName: string, assigneeIds?: string[], hours?: number) => {
    if (!phaseId || !taskName.trim()) return;
    
    try {
      setIsAddingTask(true);
      console.log(`Adding task "${taskName}" to ${area} in phase ${phaseId}`);
      console.log('With assignees:', assigneeIds);
      
      // Prevent form submission
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Add the task with assignees if provided
      const result = await addTasksToPhaseArea(phaseId, area, [taskName], assigneeIds);
      toast.success('Task added successfully');
      
      console.log(`Task "${taskName}" added to ${area} in phase ${phaseId}`, result);
      
      // Get job ID to invalidate job query
      const jobId = await getJobIdForPhase(phaseId);
      
      // Use the dedicated function to refresh all related tasks data
      await refreshTasksData(queryClient, jobId, phaseId);
      
      // Also explicitly invalidate the current area's tasks
      queryClient.invalidateQueries({ queryKey: ['tasks', phaseId, area] });
      
      // Invalidate JobTasks query if we have a jobId
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsAddingTask(false);
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
            <StatusBadge 
              status={material.status} 
              tasks={materialTasks} 
              forceTaskStatus={true} 
            />
            
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
            onAddTask={(taskName, assigneeIds) => handleAddTask(title.toLowerCase() + 'Materials', taskName, assigneeIds)}
            isDisabled={isAddingTask}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">Labor</h3>
            {laborStatus}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge 
              status={labor.status} 
              tasks={laborTasks} 
              forceTaskStatus={true} 
            />
            
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
            onAddTask={(taskName, assigneeIds, hours) => handleAddTask(title.toLowerCase() + 'Labor', taskName, assigneeIds, hours)}
            isDisabled={isAddingTask}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CombinedLaborMaterialCard;
