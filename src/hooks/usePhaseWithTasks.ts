
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getPhaseById } from '@/lib/supabase/phaseUtils';
import { getTasksForPhase, addTasksToPhaseArea, updateTask, deleteTask } from '@/lib/supabase/taskUtils';
import { Phase, Task } from '@/lib/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const usePhaseWithTasks = (jobId?: string, phaseId?: string) => {
  const queryClient = useQueryClient();
  const [enhancedPhase, setEnhancedPhase] = useState<Phase | undefined>(undefined);

  // Fetch the phase
  const phaseQuery = useQuery({
    queryKey: ['phase', jobId, phaseId],
    queryFn: () => jobId && phaseId ? getPhaseById(jobId, phaseId) : Promise.resolve(undefined),
    enabled: !!jobId && !!phaseId
  });

  // Fetch the tasks
  const tasksQuery = useQuery({
    queryKey: ['tasks', phaseId],
    queryFn: () => phaseId ? getTasksForPhase(phaseId) : Promise.resolve([]),
    enabled: !!phaseId
  });

  // Group tasks by area
  useEffect(() => {
    if (phaseQuery.data && tasksQuery.data) {
      const phase = phaseQuery.data;
      const tasks = tasksQuery.data;

      const enhancedPhase: Phase = {
        ...phase,
        weldingLabor: {
          ...phase.weldingLabor,
          tasks: tasks.filter(task => task.area === 'weldingLabor')
        },
        sewingLabor: {
          ...phase.sewingLabor,
          tasks: tasks.filter(task => task.area === 'sewingLabor')
        },
        weldingMaterials: {
          ...phase.weldingMaterials,
          tasks: tasks.filter(task => task.area === 'weldingMaterials')
        },
        sewingMaterials: {
          ...phase.sewingMaterials,
          tasks: tasks.filter(task => task.area === 'sewingMaterials')
        },
        installationMaterials: {
          ...phase.installationMaterials,
          tasks: tasks.filter(task => task.area === 'installationMaterials')
        },
        powderCoat: {
          ...phase.powderCoat,
          tasks: tasks.filter(task => task.area === 'powderCoat')
        },
        installation: {
          ...phase.installation,
          tasks: tasks.filter(task => task.area === 'installation'),
          rentalEquipment: {
            ...phase.installation.rentalEquipment,
            tasks: tasks.filter(task => task.area === 'rentalEquipment')
          }
        }
      };

      setEnhancedPhase(enhancedPhase);
    }
  }, [phaseQuery.data, tasksQuery.data]);

  // Mutation to add a task
  const addTaskMutation = useMutation({
    mutationFn: async ({ area, name }: { area: string, name: string }) => {
      if (!phaseId) throw new Error('Phase ID is required');
      return addTasksToPhaseArea(phaseId, area, [name]);
    },
    onSuccess: () => {
      toast.success('Task added successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
      queryClient.invalidateQueries({ queryKey: ['phase', jobId, phaseId] });
    },
    onError: (error) => {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  });

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: (updates: { taskId: string } & Partial<Task>) => {
      const { taskId, ...updateData } = updates;
      return updateTask(taskId, updateData);
    },
    onSuccess: () => {
      toast.success('Task updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
      queryClient.invalidateQueries({ queryKey: ['phase', jobId, phaseId] });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  });

  // Mutation to delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
      queryClient.invalidateQueries({ queryKey: ['phase', jobId, phaseId] });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  });

  const addTask = (area: string, name: string) => {
    addTaskMutation.mutate({ area, name });
  };

  const updateTaskStatus = (taskId: string, isComplete: boolean) => {
    updateTaskMutation.mutate({ 
      taskId, 
      isComplete, 
      status: isComplete ? 'complete' : 'in-progress' 
    });
  };

  return {
    phase: enhancedPhase,
    tasks: tasksQuery.data || [],
    isLoading: phaseQuery.isLoading || tasksQuery.isLoading,
    error: phaseQuery.error || tasksQuery.error,
    addTask,
    updateTaskStatus,
    deleteTask: (taskId: string) => deleteTaskMutation.mutate(taskId),
    isAddingTask: addTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending
  };
};
