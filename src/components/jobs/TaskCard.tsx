import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { Job, Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getTasksForJob, getActiveUserForTask } from '@/lib/supabase/task-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskCardProps {
  job: Job;
  maxHeight?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ job, maxHeight = "300px" }) => {
  const { 
    data: jobTasks, 
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['jobTasks', job.id],
    queryFn: () => getTasksForJob(job.id),
    enabled: !!job.id,
    staleTime: 60000,
    cacheTime: 300000
  });
  
  useEffect(() => {
    console.log('Job tasks loaded:', jobTasks?.length);
    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
    }
  }, [jobTasks, tasksError]);

  const tasks = useMemo(() => {
    if (!jobTasks || !job || !job.phases) {
      return [];
    }
    
    const enhancedTasks: Array<Task & { phaseName: string; phaseNumber: number }> = [];
    
    jobTasks.forEach(task => {
      const phase = job.phases.find(p => p.id === task.phaseId);
      if (phase) {
        enhancedTasks.push({
          ...task,
          phaseName: phase.phaseName,
          phaseNumber: phase.phaseNumber
        });
      }
    });
    
    const pendingTasks = enhancedTasks.filter(task => !task.isComplete);
    console.log('All pending tasks collected:', pendingTasks.length);
    return pendingTasks;
  }, [jobTasks, job]);

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
      case 'installationMaterials': return 'Installation Materials';
      default: return area;
    }
  };

  const ActiveUserDisplay = ({ taskId }: { taskId: string }) => {
    const [activeUser, setActiveUser] = useState<{
      userId: string;
      firstName: string;
      lastName: string;
      profilePictureUrl: string | null;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let isMounted = true;
      const fetchActiveUser = async () => {
        try {
          const user = await getActiveUserForTask(taskId);
          if (isMounted) {
            setActiveUser(user);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching active user:', error);
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchActiveUser();
      
      return () => { isMounted = false };
    }, [taskId]);

    if (loading) return null;
    if (!activeUser) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Avatar className="h-6 w-6">
              {activeUser.profilePictureUrl ? (
                <AvatarImage src={activeUser.profilePictureUrl} alt={`${activeUser.firstName} ${activeUser.lastName}`} />
              ) : (
                <AvatarFallback className="text-xs">
                  {activeUser.firstName[0]}{activeUser.lastName[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>Currently worked on by: {activeUser.firstName} {activeUser.lastName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (tasksLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
            <span className="text-sm text-muted-foreground">Loading tasks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
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
        <ScrollArea className={`max-h-${maxHeight}`}>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border-b pb-3 mb-3 last:border-0 last:pb-0">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-2">
                    {getTaskIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{task.name}</p>
                      <div className="flex items-center gap-2">
                        <ActiveUserDisplay taskId={task.id} />
                        <Badge variant={task.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {task.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
                      <span>Phase {task.phaseNumber}: {task.phaseName}</span>
                      <span>•</span>
                      <span>{getAreaLabel(task.area)}</span>
                    </div>
                    <div className="flex flex-wrap items-center mt-1 gap-x-3 gap-y-1">
                      {task.eta && (
                        <div className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>ETA: {format(new Date(task.eta), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {task.hours && (
                        <div className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>Est. Hours: {task.hours}</span>
                        </div>
                      )}
                    </div>
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
