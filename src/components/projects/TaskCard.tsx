
import React from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Clock, AlertCircle, Tag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (task: Task) => void;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleComplete,
  className = ""
}) => {
  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(task);
    }
  };

  // Get status variant for badge
  const getStatusVariant = () => {
    switch (task.status) {
      case 'in-progress':
        return 'default';
      case 'complete':
        return 'secondary'; // Changed from 'success' to 'secondary'
      case 'not-started':
        return 'outline'; // Changed from 'secondary' to 'outline'
      default:
        return 'outline';
    }
  };

  // Get proper status display
  const getStatusDisplay = () => {
    switch (task.status) {
      case 'in-progress':
        return 'In Progress';
      case 'complete':
        return 'Complete';
      case 'not-started':
        return 'Not Started';
      default:
        return task.status;
    }
  };

  // Format area for display
  const formatArea = (area: string) => {
    switch (area) {
      case 'weldingLabor':
        return 'Welding';
      case 'sewingLabor':
        return 'Sewing';
      case 'weldingMaterials':
        return 'Welding Materials';
      case 'sewingMaterials':
        return 'Sewing Materials';
      case 'powderCoat':
        return 'Powder Coat';
      case 'installation':
        return 'Installation';
      default:
        return area;
    }
  };

  return (
    <Card className={`overflow-hidden ${className} ${task.isComplete ? 'bg-muted/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox 
              checked={task.isComplete} 
              onCheckedChange={handleToggleComplete}
              disabled={!onToggleComplete}
              className="h-5 w-5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`font-medium text-sm flex-1 ${task.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                {task.name}
              </h3>
              <Badge variant={getStatusVariant()} className="text-xs">
                {getStatusDisplay()}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {formatArea(task.area)}
              </Badge>
              
              {task.hours && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.hours} hours
                </Badge>
              )}
              
              {task.eta && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Due: {new Date(task.eta).toLocaleDateString()}
                </Badge>
              )}
            </div>
            
            {task.notes && (
              <div className="mt-2 text-xs text-muted-foreground">
                {task.notes}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
