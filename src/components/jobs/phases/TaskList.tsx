
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface TaskListProps {
  tasks: string[];
  area: string;
  onAdd: (area: string, taskName: string) => void;
  onRemove: (area: string, index: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, area, onAdd, onRemove }) => {
  return (
    <div className="space-y-2 mt-2">
      {tasks.map((task, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
          <span className="text-sm">{task}</span>
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
          onClick={() => {
            const taskName = prompt('Enter task name:');
            if (taskName) onAdd(area, taskName);
          }}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Task
        </Button>
      </div>
    </div>
  );
};

export default TaskList;
