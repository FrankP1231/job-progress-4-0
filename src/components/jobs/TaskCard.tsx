import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, Clock, AlertCircle, User, ChevronDown } from 'lucide-react';
import { Job, Task, TaskStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTasksForJob, getActiveUserForTask } from '@/lib/supabase/task-helpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateTaskStatus } from '@/lib/supabase/task-status';
import { toast } from 'sonner';

interface TaskCardProps {
  job: Job;
  maxHeight?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ job, maxHeight = "300px" }) => {
  const queryClient = useQueryClient();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  
  const { 
    data: jobTasks, 
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['jobTasks', job.id],
    queryFn: () => getTasksForJob(job.id),
    enabled: !!job.id,
    staleTime: 60000,
    gcTime: 300000
  });
  
  useEffect(() => {
    console.log('Job tasks loaded:', jobTasks?.length);
    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
    }
  }, [jobTasks, tasksError]);

  // Parse task name if it's a JSON string
  const parseTaskName = (task: Task): string => {
    if (!task.name) return '';
    
    try {
      // Check if the task name is a JSON string
      if (typeof task.name === 'string' && task.name.startsWith('{') && task.name.includes('name')) {
        const parsed = JSON.parse(task.name);
        return parsed.name || task.name;
      }
      return task.name;
    } catch (e) {
      // If parsing fails, return the original name
      return task.name;
    }
  };

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
            <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-primary" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Currently worked on by: {activeUser.firstName} {activeUser.lastName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await updateTaskStatus(taskId, newStatus);
      
      // Get job ID to invalidate job query
      if (job.id) {
        const phase = job.phases.find(p => 
          p.weldingLabor.tasks?.some(t => t.id === taskId) ||
          p.sewingLabor.tasks?.some(t => t.id === taskId) ||
          p.installation.tasks?.some(t => t.id === taskId)
        );
        
        if (phase) {
          await refreshTasksData(queryClient, job.id, phase.id);
        }
      }
      
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
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
        <ScrollArea className={`max-h-[${maxHeight}]`}>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border-b pb-3 mb-3 last:border-0 last:pb-0">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-2">
                    {getTaskIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{parseTaskName(task)}</p>
                      <div className="flex items-center gap-2">
                        <ActiveUserDisplay taskId={task.id} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              disabled={!!updatingTaskId}
                            >
                              {task.status === 'in-progress' ? 'In Progress' : 
                               task.status === 'complete' ? 'Complete' : 'Not Started'}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(task.id, 'not-started')}
                            >
                              Not Started
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(task.id, 'in-progress')}
                            >
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(task.id, 'complete')}
                            >
                              Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
