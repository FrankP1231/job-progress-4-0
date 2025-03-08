
import React, { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle, Plus, X, Clock, ChevronDown } from 'lucide-react';
import { updateTaskStatus } from '@/lib/supabase/task-status';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { refreshTasksData } from '@/lib/supabase/task-status';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TasksContainerProps {
  title?: string;
  tasks: Task[];
  phaseId?: string;
  area?: string;
  isEditing?: boolean;
  onAddTask?: (taskName: string) => void;
  className?: string;
  isDisabled?: boolean;
}

const TasksContainer: React.FC<TasksContainerProps> = ({
  title,
  tasks = [],
  phaseId,
  area,
  isEditing = false,
  onAddTask,
  className = '',
  isDisabled = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!phaseId) return;
    
    try {
      setUpdatingTaskId(taskId);
      await updateTaskStatus(taskId, newStatus);
      
      // Get jobId to invalidate job-related queries
      const { getJobIdForPhase } = await import('@/lib/supabase/task-helpers');
      const jobId = await getJobIdForPhase(phaseId);
      
      // Refresh all task-related data
      await refreshTasksData(queryClient, jobId, phaseId);
      
      // Also invalidate JobTasks query if we have a jobId
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
      }
      
      const statusMessage = newStatus === 'complete' 
        ? 'completed' 
        : newStatus === 'in-progress' 
          ? 'marked as in progress' 
          : 'reopened';
          
      toast.success(`Task ${statusMessage}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Legacy toggle function for compatibility
  const handleToggleTaskCompletion = async (taskId: string, isComplete: boolean) => {
    const newStatus: TaskStatus = isComplete ? 'not-started' : 'complete';
    await handleUpdateTaskStatus(taskId, newStatus);
  };

  const handleAddNewTask = () => {
    if (!newTaskName.trim() || !onAddTask) return;
    
    onAddTask(newTaskName);
    setNewTaskName('');
    setIsAdding(false);
  };

  const getTaskStatusIcon = (task: Task) => {
    if (updatingTaskId === task.id) {
      return <div className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />;
    }
    
    if (task.isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (task.status === 'in-progress') {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center text-sm py-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center w-5 h-5 mr-2 rounded-full focus:outline-none"
                    disabled={updatingTaskId === task.id}
                  >
                    {getTaskStatusIcon(task)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  <DropdownMenuItem 
                    onClick={() => handleUpdateTaskStatus(task.id, 'not-started')}
                    className="flex items-center"
                  >
                    <Circle className="mr-2 h-4 w-4 text-gray-400" />
                    Not Started
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                    className="flex items-center"
                  >
                    <Clock className="mr-2 h-4 w-4 text-amber-500" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleUpdateTaskStatus(task.id, 'complete')}
                    className="flex items-center"
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Complete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className={task.isComplete ? 'line-through text-gray-400' : ''}>
                {task.name}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 italic">No tasks yet</div>
        )}
        
        {isEditing && (
          isAdding ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Task name"
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewTask()}
                autoFocus
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8"
                onClick={handleAddNewTask}
                disabled={isDisabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskName('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs h-8"
              onClick={() => setIsAdding(true)}
              disabled={isDisabled}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Task
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default TasksContainer;
