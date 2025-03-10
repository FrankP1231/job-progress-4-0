
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Clock, ChevronDown, Trash, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { createTask } from '@/lib/supabase/taskUtils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Task } from '@/lib/types';

interface TasksContainerProps {
  tasks: Task[];
  phaseId?: string;
  area: string;
  isEditing?: boolean;
  isDisabled?: boolean;
  title?: string;
  className?: string;
  onAddTask?: (taskName: string) => Promise<void>;
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
  const [newTaskName, setNewTaskName] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const queryClient = useQueryClient();

  // Determine if this is a labor area
  const isLaborArea = area === 'weldingLabor' || area === 'sewingLabor';

  const handleAddNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!newTaskName.trim()) return;

    try {
      setIsAddingTask(true);
      
      if (onAddTask) {
        await onAddTask(newTaskName.trim());
      } 
      else if (phaseId) {
        const taskData = {
          name: newTaskName.trim(),
          hours: isLaborArea && laborHours ? Number(laborHours) : undefined
        };

        const newTask = await createTask(phaseId, area, taskData.name, {
          hours: taskData.hours
        });
        
        if (newTask) {
          await queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
          toast.success('Task added successfully');
        } else {
          toast.error('Failed to add task');
        }
      }
      
      setNewTaskName('');
      setLaborHours('');
      setIsAddDialogOpen(false);
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
      const { deleteTask } = await import('@/lib/supabase/taskUtils');
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

  // This safely stops event propagation to prevent form submission in parent components
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {title && <h3 className="font-medium text-sm mb-2">{title}</h3>}
      
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{task.name}</span>
            
            {task.hours && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{task.hours} hours</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setTaskToDelete(task);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      {isEditing && (
        <Dialog 
          open={isAddDialogOpen}
          modal={true} // Force modal behavior
          onOpenChange={(open) => {
            if (!open) {
              // Use setTimeout to ensure this runs after any clicks are processed
              setTimeout(() => {
                setIsAddDialogOpen(false);
                setNewTaskName('');
                setLaborHours('');
              }, 0);
            } else {
              setIsAddDialogOpen(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs h-8"
              disabled={isDisabled || isAddingTask}
              onClick={(e) => {
                // Completely prevent event bubbling and default behavior
                e.stopPropagation();
                e.preventDefault();
                setIsAddDialogOpen(true);
              }}
              type="button" // Explicitly set type to button to prevent form submission
            >
              <Plus className="h-3 w-3 mr-1" /> Add Task
            </Button>
          </DialogTrigger>
          
          <DialogContent 
            className="sm:max-w-[425px]" 
            onPointerDownOutside={(e) => {
              // Critical: Prevent pointer events from reaching parent forms
              e.preventDefault();
              e.stopPropagation();
            }}
            onEscapeKeyDown={(e) => {
              // Prevent escape key from submitting parent forms
              e.preventDefault();
              e.stopPropagation();
            }}
            onInteractOutside={(e) => {
              // Prevent any interaction outside from closing and bubbling
              e.preventDefault();
              e.stopPropagation();
            }}
            onOpenAutoFocus={(e) => {
              // Prevent autofocus from triggering anything in parent forms
              e.preventDefault();
            }}
            onClick={(e) => {
              // Stop click events from bubbling to parent forms
              e.stopPropagation();
            }}
          >
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a new task to this section. Tasks help track progress and assign work.
              </DialogDescription>
            </DialogHeader>
            
            {/* Isolated task form that doesn't propagate events to parent forms */}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="taskName"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Enter task name"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {isLaborArea && (
                <div className="grid gap-2">
                  <label htmlFor="laborHours" className="text-sm font-medium">
                    Estimated Hours
                  </label>
                  <Input
                    id="laborHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(e.target.value)}
                    placeholder="Enter estimated hours"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNewTaskName('');
                  setLaborHours('');
                  setIsAddDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" // Important: Not submit type
                disabled={isAddingTask || !newTaskName.trim()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddNewTask(e);
                }}
              >
                {isAddingTask ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Adding...
                  </span>
                ) : (
                  'Add Task'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog 
        open={taskToDelete !== null} 
        modal={true}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
      >
        <DialogContent 
          className="sm:max-w-[425px]" 
          onClick={handleDialogClick}
          onPointerDownOutside={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
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
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setTaskToDelete(null);
              }}
              disabled={isDeleting}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteTask();
              }}
              disabled={isDeleting}
              type="button"
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
