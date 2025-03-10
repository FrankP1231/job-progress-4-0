
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle, Plus, X, Clock, ChevronDown, Trash, User } from 'lucide-react';
import { updateTaskStatus, deleteTask } from '@/lib/supabase/task-status';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { refreshTasksData } from '@/lib/supabase/task-status';
import TaskTimer from '@/components/time-tracking/TaskTimer';
import { getActiveUserForTask } from '@/lib/supabase/task-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Record<string, {
    userId: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
  } | null>>({});
  const queryClient = useQueryClient();

  // Fetch active users for all tasks
  useEffect(() => {
    const fetchActiveUsers = async () => {
      const userPromises = tasks.map(async (task) => {
        const user = await getActiveUserForTask(task.id);
        return { taskId: task.id, user };
      });

      const results = await Promise.all(userPromises);
      const usersMap: Record<string, any> = {};
      
      results.forEach(({ taskId, user }) => {
        usersMap[taskId] = user;
      });

      setActiveUsers(usersMap);
    };

    if (tasks.length > 0) {
      fetchActiveUsers();
    }
  }, [tasks]);

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
      
      // Refresh active users
      const updatedUser = await getActiveUserForTask(taskId);
      setActiveUsers(prev => ({
        ...prev,
        [taskId]: updatedUser
      }));
      
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

  const handleDeleteTask = async () => {
    if (!taskToDelete || !phaseId) return;
    
    try {
      setIsDeleting(true);
      await deleteTask(taskToDelete.id);
      
      // Get jobId to invalidate job-related queries
      const { getJobIdForPhase } = await import('@/lib/supabase/task-helpers');
      const jobId = await getJobIdForPhase(phaseId);
      
      // Refresh all task-related data
      await refreshTasksData(queryClient, jobId, phaseId);
      
      // Also invalidate JobTasks query if we have a jobId
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
      }
      
      toast.success(`Task deleted successfully`);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
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

  const refreshTasks = async () => {
    if (!phaseId) return;
    
    try {
      // Get jobId to invalidate job-related queries
      const { getJobIdForPhase } = await import('@/lib/supabase/task-helpers');
      const jobId = await getJobIdForPhase(phaseId);
      
      // Refresh all task-related data
      await refreshTasksData(queryClient, jobId, phaseId);
      
      // Also invalidate JobTasks query if we have a jobId
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
      }
      
      // Refresh active users
      const updatedUsers: Record<string, any> = {};
      for (const task of tasks) {
        const updatedUser = await getActiveUserForTask(task.id);
        updatedUsers[task.id] = updatedUser;
      }
      setActiveUsers(updatedUsers);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  // Active user display component
  const ActiveUserDisplay = ({ taskId }: { taskId: string }) => {
    const activeUser = activeUsers[taskId];
    
    if (!activeUser) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Avatar className="h-6 w-6">
              {activeUser.profilePictureUrl ? (
                <AvatarImage src={activeUser.profilePictureUrl} alt={`${activeUser.firstName} ${activeUser.lastName}`} />
              ) : (
                <AvatarFallback className="text-xs">
                  {activeUser.firstName[0]}{activeUser.lastName[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>Currently worked on by: {activeUser.firstName} {activeUser.lastName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center">
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
                {activeUsers[task.id] && (
                  <div className="ml-2">
                    <ActiveUserDisplay taskId={task.id} />
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <TaskTimer 
                  task={task} 
                  refreshTasks={refreshTasks}
                  size="icon"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  onClick={() => setTaskToDelete(task)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
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

      {/* Delete Task Confirmation Dialog */}
      <Dialog open={taskToDelete !== null} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {taskToDelete && (
            <div className="py-2">
              <p className="font-medium">{taskToDelete.name}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setTaskToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 mr-2 rounded-full border-2 border-destructive-foreground border-t-transparent animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksContainer;
