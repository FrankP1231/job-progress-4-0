
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Trash, User } from 'lucide-react';
import { Task } from '@/lib/types';
import { parseTaskName } from '@/utils/taskUtils';

interface TaskItemProps {
  task: Task;
  onDelete: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete }) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
      <div className="flex items-center space-x-2">
        <span className="text-sm">{parseTaskName(task.name)}</span>
        
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
          onDelete(task);
        }}
        type="button"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TaskItem;
