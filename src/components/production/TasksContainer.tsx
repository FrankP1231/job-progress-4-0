
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Clock, ChevronDown, Trash, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
}

const TasksContainer: React.FC<TasksContainerProps> = ({
  tasks = [],
  phaseId,
  area,
  isEditing = false,
  isDisabled = false
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleAddNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskName.trim() || !phaseId) return;

    try {
      const newTask = await createTask(phaseId, area, newTaskName.trim());
      
      if (newTask) {
        await queryClient.invalidateQueries({ queryKey: ['tasks', phaseId] });
        toast.success('Task added successfully');
        setNewTaskName('');
        setIsAddDialogOpen(false);
      } else {
        toast.error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
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

  return (
    <div className="space-y-2">
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
            onClick={() => setTaskToDelete(task)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 text-xs h-8"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={isDisabled}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Task
        </Button>
      )}

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Add a new task to this section. Tasks help track progress and assign work.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewTask}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="taskName"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Enter task name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setNewTaskName('');
                  setIsAddDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={taskToDelete !== null} onOpenChange={() => setTaskToDelete(null)}>
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
          
          <DialogFooter>
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
