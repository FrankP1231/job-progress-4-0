
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { Job, Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskCardProps {
  job: Job;
  maxHeight?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ job, maxHeight = "300px" }) => {
  const tasks = useMemo(() => {
    const allTasks: Array<Task & { phaseName: string; phaseNumber: number }> = [];
    
    // Collect tasks from all phases
    job.phases.forEach(phase => {
      // Check all possible areas that might have tasks
      const areas = [
        'weldingMaterials', 'weldingLabor', 
        'sewingMaterials', 'sewingLabor', 
        'powderCoat', 'installation'
      ];
      
      areas.forEach(area => {
        if (phase[area]?.tasks) {
          const phaseTasks = phase[area].tasks.map(task => ({
            ...task,
            phaseName: phase.phaseName,
            phaseNumber: phase.phaseNumber
          }));
          allTasks.push(...phaseTasks);
        }
      });
    });
    
    // Filter tasks that are not completed
    return allTasks.filter(task => !task.isComplete);
  }, [job]);

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'not-started':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getAreaLabel = (area: string): string => {
    switch (area) {
      case 'weldingMaterials': return 'Welding Materials';
      case 'weldingLabor': return 'Welding Labor';
      case 'sewingMaterials': return 'Sewing Materials';
      case 'sewingLabor': return 'Sewing Labor';
      case 'powderCoat': return 'Powder Coat';
      case 'installation': return 'Installation';
      default: return area;
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No pending tasks for this project.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pending Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`h-[${maxHeight}]`}>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border-b pb-3 mb-3 last:border-0 last:pb-0">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-2">
                    {getTaskIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{task.name}</p>
                      <Badge variant={task.status === 'in-progress' ? 'secondary' : 'outline'}>
                        {task.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
                      <span>Phase {task.phaseNumber}: {task.phaseName}</span>
                      <span>•</span>
                      <span>{getAreaLabel(task.area)}</span>
                    </div>
                    {task.eta && (
                      <div className="flex items-center mt-1 text-xs">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>ETA: {format(new Date(task.eta), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {task.notes && (
                      <p className="mt-1 text-xs text-muted-foreground italic">{task.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
