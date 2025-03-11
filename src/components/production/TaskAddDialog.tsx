
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserSelector } from '@/components/users/UserSelector';
import { WorkArea } from '@/lib/types';

interface TaskAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (taskName: string, assigneeIds?: string[], hours?: number) => Promise<void>;
  isAddingTask: boolean;
  isDisabled: boolean;
  isLaborArea: boolean;
  workArea?: WorkArea;
}

const TaskAddDialog: React.FC<TaskAddDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddTask,
  isAddingTask,
  isDisabled,
  isLaborArea,
  workArea
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setNewTaskName('');
      setLaborHours('');
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const handleAddNewTask = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newTaskName.trim()) return;

    try {
      const hours = laborHours ? parseFloat(laborHours) : undefined;
      await onAddTask(
        newTaskName.trim(),
        selectedUsers.length > 0 ? selectedUsers : undefined,
        hours
      );
      
      setNewTaskName('');
      setLaborHours('');
      setSelectedUsers([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleAddNewTask:', error);
    }
  };

  return (
    <Dialog 
      open={isOpen}
      modal={true}
      onOpenChange={(open) => {
        if (!open) {
          setNewTaskName('');
          setLaborHours('');
          setSelectedUsers([]);
        }
        onOpenChange(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 text-xs h-8"
          disabled={isDisabled || isAddingTask}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.nativeEvent) {
              e.nativeEvent.stopImmediatePropagation();
              e.nativeEvent.preventDefault();
            }
            onOpenChange(true);
          }}
          type="button"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Task
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-[425px]" 
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Add a new task to this section. Tasks help track progress and assign work.
          </DialogDescription>
        </DialogHeader>
        
        <div 
          className="grid gap-4 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid gap-2">
            <Input
              id="taskName"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter task name"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <label htmlFor="assignees" className="text-sm font-medium">
              {workArea 
                ? `${workArea.charAt(0).toUpperCase() + workArea.slice(1)} Assignees (Optional)` 
                : 'Assignees (Optional)'}
            </label>
            <UserSelector 
              selectedUserIds={selectedUsers}
              onSelectionChange={(ids) => {
                console.log('Selection changed to:', ids);
                setSelectedUsers(ids);
              }}
              workArea={workArea}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.nativeEvent) {
                e.nativeEvent.stopImmediatePropagation();
              }
              setNewTaskName('');
              setLaborHours('');
              setSelectedUsers([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            disabled={isAddingTask || !newTaskName.trim()}
            onClick={(e) => {
              e.preventDefault(); 
              e.stopPropagation();
              if (e.nativeEvent) {
                e.nativeEvent.stopImmediatePropagation();
              }
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
  );
};

export default TaskAddDialog;
