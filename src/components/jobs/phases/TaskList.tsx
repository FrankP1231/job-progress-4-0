
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserSelector } from '@/components/users/UserSelector';
import { WorkArea } from '@/lib/types';

interface TaskWithMetadata {
  name: string;
  hours?: number;
  eta?: string;
  assigneeIds?: string[];
}

interface TaskListProps {
  tasks: TaskWithMetadata[];
  area: string;
  isMaterialArea?: boolean;
  isLaborArea?: boolean;
  onAdd: (area: string, task: TaskWithMetadata) => void;
  onRemove: (area: string, index: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  area, 
  isMaterialArea, 
  isLaborArea, 
  onAdd, 
  onRemove 
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskHours, setNewTaskHours] = useState('');
  const [newTaskEta, setNewTaskEta] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Map area to work area for user filtering
  const getWorkAreaFromTaskArea = (area: string): WorkArea | undefined => {
    if (area === 'weldingLabor' || area === 'weldingMaterials') {
      return 'Welding';
    } else if (area === 'sewingLabor' || area === 'sewingMaterials') {
      return 'Sewing';
    } else if (area === 'installation' || area === 'installationMaterials') {
      return 'Installation';
    } else if (area === 'rentalEquipment') {
      return 'Installation'; // Rental equipment is typically for installation
    } else if (area === 'powderCoat') {
      return 'Welding'; // PowderCoat is typically managed by welding team
    }
    return undefined;
  };
  
  const workArea = getWorkAreaFromTaskArea(area);
  
  const handleAddTask = (e: React.MouseEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    e.stopPropagation();
    
    if (!newTaskName.trim()) return;
    
    const task: TaskWithMetadata = {
      name: newTaskName.trim(),
      ...(isLaborArea && newTaskHours ? { hours: parseFloat(newTaskHours) } : {}),
      ...(isMaterialArea && newTaskEta ? { eta: newTaskEta } : {}),
      ...(selectedUsers.length > 0 ? { assigneeIds: selectedUsers } : {})
    };
    
    onAdd(area, task);
    setNewTaskName('');
    setNewTaskHours('');
    setNewTaskEta('');
    setSelectedUsers([]);
    setIsDialogOpen(false);
  };
  
  return (
    <div className="space-y-2">
      <div className="mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent 
            onClick={(e) => e.stopPropagation()}
            onPointerDownOutside={(e) => {
              // Prevent clicking outside from submitting the form
              e.preventDefault();
              e.stopPropagation();
            }}
            onEscapeKeyDown={(e) => {
              // Prevent the Escape key from submitting the form
              e.preventDefault();
              e.stopPropagation();
            }}
            onInteractOutside={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="taskName">Task Name</Label>
                <Input
                  id="taskName"
                  placeholder="Enter task name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting the form
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
              
              {isLaborArea && (
                <div className="space-y-2">
                  <Label htmlFor="taskHours">Estimated Hours</Label>
                  <Input
                    id="taskHours"
                    type="number"
                    min="0.25"
                    step="0.25"
                    placeholder="Enter estimated hours"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      // Prevent Enter key from submitting the form
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
              )}
              
              {isMaterialArea && (
                <div className="space-y-2">
                  <Label htmlFor="taskEta">Expected Arrival Date</Label>
                  <Input
                    id="taskEta"
                    type="date"
                    value={newTaskEta}
                    onChange={(e) => setNewTaskEta(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      // Prevent Enter key from submitting the form
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="assignees">
                  {workArea 
                    ? `${workArea} Assignees (Optional)` 
                    : 'Assignees (Optional)'}
                </Label>
                <UserSelector 
                  selectedUserIds={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  workArea={workArea}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddTask}
                  disabled={!newTaskName.trim()}
                >
                  Add Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
            >
              <div>
                <p className="font-medium">{task.name}</p>
                {task.hours && (
                  <p className="text-sm text-muted-foreground">
                    Estimated: {task.hours} hours
                  </p>
                )}
                {task.eta && (
                  <p className="text-sm text-muted-foreground">
                    ETA: {new Date(task.eta).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(area, index);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-2">No tasks added yet.</p>
      )}
    </div>
  );
};

export default TaskList;
