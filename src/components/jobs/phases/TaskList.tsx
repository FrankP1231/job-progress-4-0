
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserSelector } from '@/components/users/UserSelector';

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
  const getWorkAreaFromTaskArea = (area: string): string | undefined => {
    if (area === 'weldingLabor' || area === 'weldingMaterials') {
      return 'welding';
    } else if (area === 'sewingLabor' || area === 'sewingMaterials') {
      return 'sewing';
    } else if (area === 'installation' || area === 'installationMaterials') {
      return 'installation';
    }
    return undefined;
  };
  
  const workArea = getWorkAreaFromTaskArea(area);
  
  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    
    const task: TaskWithMetadata = {
      name: newTaskName,
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
    <div>
      <div className="mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
              }}
            >
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent onClick={(e) => e.stopPropagation()}>
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
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="assignees">
                  {workArea 
                    ? `${workArea.charAt(0).toUpperCase() + workArea.slice(1)} Assignees (Optional)` 
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
                    e.stopPropagation();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask();
                  }}
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
