
import React, { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, PlusCircle, Check } from 'lucide-react';
import { toggleTaskCompletion } from '@/lib/supabase/task-status';
import { useQueryClient } from '@tanstack/react-query';
import { refreshTasksData } from '@/lib/supabase/task-status';

interface TasksContainerProps {
  tasks?: Task[];
  phaseId?: string;
  title?: string;
  area: string;
  className?: string;
  isEditing?: boolean;
  onAddTask?: (taskName: string) => void;
  onRemoveTask?: (taskIndex: number) => void;
}

const TasksContainer: React.FC<TasksContainerProps> = ({ 
  tasks = [],
  phaseId,
  title,
  area,
  className = "",
  isEditing = false,
  onAddTask,
  onRemoveTask
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const handleAddTask = () => {
    if (newTaskName.trim() && onAddTask) {
      onAddTask(newTaskName);
      setNewTaskName('');
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!phaseId) return;
    
    try {
      await toggleTaskCompletion(task.id, !task.isComplete);
      
      // Use the dedicated function to refresh all related tasks data
      refreshTasksData(queryClient, undefined, task.phaseId);
      
      console.log(`Task "${task.name}" completion toggled to ${!task.isComplete}`);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  return (
    <div className={`space-y-3 mt-2 ${className}`}>
      {title && <h3 className="text-md font-medium">{title}</h3>}
      
      {tasks.length === 0 && !isAdding && (
        <div className="text-sm text-gray-500 italic">
          No tasks defined. {isEditing && 'Add tasks to track detailed progress.'}
        </div>
      )}
      
      {tasks.map((task, index) => (
        <div key={task.id || index} className="flex items-center space-x-2 group">
          {phaseId ? (
            <Checkbox 
              id={`task-${task.id || index}`}
              checked={task.isComplete}
              onCheckedChange={() => handleToggleComplete(task)}
              className="h-4 w-4"
            />
          ) : (
            <Checkbox 
              id={`task-${index}`}
              className="h-4 w-4"
              disabled={!isEditing}
            />
          )}
          <Label 
            htmlFor={`task-${task.id || index}`} 
            className={`text-sm flex-grow ${task.isComplete ? 'line-through text-gray-500' : ''}`}
          >
            {task.name}
          </Label>
          {isEditing && onRemoveTask && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => onRemoveTask(index)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </div>
      ))}
      
      {isAdding && (
        <div className="flex items-center space-x-2">
          <Input
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Enter task name"
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            autoFocus
          />
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="p-1"
            onClick={handleAddTask}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Add</span>
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="p-1"
            onClick={() => setIsAdding(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      )}
      
      {isEditing && !isAdding && (
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          Add Task
        </Button>
      )}
    </div>
  );
};

export default TasksContainer;
