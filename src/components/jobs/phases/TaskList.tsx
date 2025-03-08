
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Clock, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface TaskWithMetadata {
  name: string;
  hours?: number;
  eta?: string;
}

interface TaskListProps {
  tasks: TaskWithMetadata[];
  area: string;
  isLaborArea?: boolean;
  isMaterialArea?: boolean;
  onAdd: (area: string, task: TaskWithMetadata) => void;
  onRemove: (area: string, index: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  area, 
  isLaborArea = false, 
  isMaterialArea = false, 
  onAdd, 
  onRemove 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [materialEta, setMaterialEta] = useState('');

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;

    const task: TaskWithMetadata = {
      name: newTaskName.trim()
    };

    if (isLaborArea && laborHours) {
      task.hours = Number(laborHours);
    }

    if (isMaterialArea && materialEta) {
      task.eta = materialEta;
    }

    onAdd(area, task);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewTaskName('');
    setLaborHours('');
    setMaterialEta('');
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {tasks.map((task, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{task.name}</span>
            
            {task.hours && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{task.hours} hours</span>
              </div>
            )}
            
            {task.eta && (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>ETA: {formatDate(task.eta)}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRemove(area, index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Task
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Enter task name"
                autoFocus
              />
            </div>
            
            {isLaborArea && (
              <div className="grid gap-2">
                <Label htmlFor="laborHours">Labor Hours</Label>
                <Input
                  id="laborHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                  placeholder="Enter estimated hours"
                />
              </div>
            )}
            
            {isMaterialArea && (
              <div className="grid gap-2">
                <Label htmlFor="materialEta">Estimated Arrival Date</Label>
                <Input
                  id="materialEta"
                  type="date"
                  value={materialEta}
                  onChange={(e) => setMaterialEta(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
