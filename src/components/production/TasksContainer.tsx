
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Task, WorkArea } from '@/lib/types';
import { createTask, deleteTask } from '@/lib/supabase/task-helpers';
import TaskItem from './TaskItem';
import TaskAddDialog from './TaskAddDialog';
import TaskDeleteDialog from './TaskDeleteDialog';

interface TasksContainerProps {
  tasks: Task[];
  phaseId?: string;
  area: string;
  isEditing?: boolean;
  isDisabled?: boolean;
  title?: string;
  className?: string;
  onAddTask?: (taskName: string, assigneeIds?: string[], hours?: number) => Promise<void>;
}

const TasksContainer: React.FC<TasksContainerProps> = ({
  tasks = [],
  phaseId,
  area,
  isEditing = false,
  isDisabled = false,
  title,
  className,
  onAddTask
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const queryClient = useQueryClient();

  // Determine if this is a labor area
  const isLaborArea = area.endsWith('Labor');
  
  // Map area to work area for user filtering
  const getWorkAreaFromTaskArea = (area: string): WorkArea | undefined => {
    if (area.startsWith('welding')) {
      return 'Welding';
    } else if (area.startsWith('sewing')) {
      return 'Sewing';
    } else if (area.startsWith('installation')) {
      return 'Installation';
    } else if (area === 'rentalEquipment') {
      return 'Installation'; // Rental equipment is typically for installation
    } else if (area === 'powderCoat') {
      return 'Welding'; // PowderCoat is typically managed by welding team
    }
    return undefined;
  };
  
  const workArea = getWorkAreaFromTaskArea(area);

  const handleAddNewTask = async (
    taskName: string, 
    assigneeIds?: string[], 
    hours?: number
  ): Promise<void> => {
    if (!taskName.trim()) return;

    try {
      setIsAddingTask(true);
      console.log('Selected users for task:', assigneeIds);
      
      if (onAddTask) {
        await onAddTask(taskName.trim(), assigneeIds, hours);
      } 
      else if (phaseId) {
        const newTask = await createTask(phaseId, area, taskName.trim(), {
          hours,
          assigneeIds: assigneeIds?.length > 0 ? assigneeIds : undefined
        });
        
        if (newTask) {
          await queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
          toast.success('Task added successfully');
        } else {
          toast.error('Failed to add task');
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete || !phaseId) return;
    
    try {
      setIsDeleting(true);
      await deleteTask(taskToDelete.id);
      
      await queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  return (
    <div 
      className={`space-y-2 ${className || ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {title && <h3 className="font-medium text-sm mb-2">{title}</h3>}
      
      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onDelete={setTaskToDelete} 
        />
      ))}
      
      {isEditing && (
        <TaskAddDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddTask={handleAddNewTask}
          isAddingTask={isAddingTask}
          isDisabled={isDisabled}
          isLaborArea={isLaborArea}
          workArea={workArea}
        />
      )}

      <TaskDeleteDialog
        taskToDelete={taskToDelete}
        isDeleting={isDeleting}
        onClose={() => setTaskToDelete(null)}
        onConfirmDelete={handleDeleteTask}
      />
    </div>
  );
};

export default TasksContainer;
