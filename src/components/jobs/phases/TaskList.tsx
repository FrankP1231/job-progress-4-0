
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Clock, Calendar, Trash, User, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';

interface TaskWithMetadata {
  name: string;
  hours?: number;
  eta?: string;
  assigneeIds?: string[];
}

interface TaskAssignee {
  id: string;
  firstName: string;
  lastName: string;
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [materialEta, setMaterialEta] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<TaskAssignee[]>([]);

  // Fetch available users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      if (isLaborArea && isDialogOpen) {
        try {
          // Fetch users that could be assigned to tasks
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .order('first_name', { ascending: true });

          if (error) {
            console.error('Error fetching users:', error);
            return;
          }

          setAvailableUsers(
            data.map((user) => ({
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name
            }))
          );
        } catch (error) {
          console.error('Error in fetchUsers:', error);
        }
      }
    };

    fetchUsers();
  }, [isLaborArea, isDialogOpen]);

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;

    const task: TaskWithMetadata = {
      name: newTaskName.trim()
    };

    if (isLaborArea) {
      if (laborHours) {
        task.hours = Number(laborHours);
      }
      
      if (selectedAssignees.length > 0) {
        task.assigneeIds = selectedAssignees;
      }
    }

    if (isMaterialArea && materialEta) {
      task.eta = materialEta;
    }

    onAdd(area, task);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = (index: number) => {
    onRemove(area, index);
    setIsDeleteDialogOpen(null);
  };

  const resetForm = () => {
    setNewTaskName('');
    setLaborHours('');
    setMaterialEta('');
    setSelectedAssignees([]);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleAssigneeChange = (userId: string) => {
    setSelectedAssignees((prev) => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
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

            {task.assigneeIds && task.assigneeIds.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>{task.assigneeIds.length} assigned</span>
              </div>
            )}
          </div>
          
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
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

      {/* Add Task Dialog */}
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
              <>
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
                
                <div className="grid gap-2">
                  <Label htmlFor="assignees">Assign To</Label>
                  <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                    {availableUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No users available</p>
                    ) : (
                      availableUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            className="rounded"
                            checked={selectedAssignees.includes(user.id)}
                            onChange={() => handleAssigneeChange(user.id)}
                          />
                          <label htmlFor={`user-${user.id}`} className="text-sm">
                            {user.firstName} {user.lastName}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen !== null} onOpenChange={() => setIsDeleteDialogOpen(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            {isDeleteDialogOpen !== null && tasks[isDeleteDialogOpen] && (
              <p className="font-semibold mt-2">"{tasks[isDeleteDialogOpen].name}"</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => isDeleteDialogOpen !== null && handleConfirmDelete(isDeleteDialogOpen)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
