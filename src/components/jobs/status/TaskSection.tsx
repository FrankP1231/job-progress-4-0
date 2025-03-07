
import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, X } from 'lucide-react';
import TasksContainer from '@/components/production/TasksContainer';

interface TaskSectionProps {
  title: string;
  area: string;
  tasks: Task[];
  pendingTasks: string[];
  onAddPendingTask: (area: string, name: string) => void;
  onRemovePendingTask: (area: string, index: number) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  area,
  tasks,
  pendingTasks,
  onAddPendingTask,
  onRemovePendingTask
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      onAddPendingTask(area, newTaskName.trim());
      setNewTaskName('');
      setIsAdding(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title} Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            {pendingTasks.length === 0 && !isAdding ? (
              <div className="text-sm text-muted-foreground italic">
                No tasks added yet. Add tasks to track detailed progress.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((taskName, index) => (
                  <div key={index} className="flex items-center group">
                    <Input 
                      className="flex-1 mr-2 bg-gray-50" 
                      value={taskName} 
                      readOnly 
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onRemovePendingTask(area, index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {isAdding ? (
              <div className="flex items-center mt-3">
                <Input
                  placeholder="Enter task name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="flex-1 mr-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={handleAddTask}
                  >
                    Add
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIsAdding(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskSection;
