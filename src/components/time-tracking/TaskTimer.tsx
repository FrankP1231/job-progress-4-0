
import React, { useState, useEffect } from 'react';
import { useTimeTracking } from '@/context/TimeTrackingContext';
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, CheckCircle, StopCircle } from 'lucide-react';
import { 
  TaskTimeEntry, 
  startTaskTimer, 
  pauseTaskTimer, 
  resumeTaskTimer, 
  stopTaskTimer, 
  formatTimeSpent 
} from '@/lib/supabase/time-tracking';
import { Task, TaskStatus } from '@/lib/types';
import { updateTaskStatus } from '@/lib/supabase/task-status';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TaskTimerProps {
  task: Task;
  refreshTasks?: () => Promise<void>;
  showLabel?: boolean;
  size?: "sm" | "icon";
  className?: string;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ 
  task, 
  refreshTasks, 
  showLabel = false,
  size = "sm",
  className = ""
}) => {
  const { currentTimeEntry, getActiveTaskTimeEntry, refreshTimeTracking } = useTimeTracking();
  const [taskTimeEntry, setTaskTimeEntry] = useState<TaskTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<string>('');
  const queryClient = useQueryClient();
  
  // Check if user is clocked in
  const isUserClockedIn = !!currentTimeEntry && !currentTimeEntry.clock_out_time;
  
  // Load the active task time entry
  const fetchTaskTimeEntry = async () => {
    if (!task.id) return;
    
    try {
      const entry = await getActiveTaskTimeEntry(task.id);
      setTaskTimeEntry(entry);
    } catch (error) {
      console.error('Error fetching task time entry:', error);
    }
  };
  
  // Initial load of task time entry
  useEffect(() => {
    fetchTaskTimeEntry();
  }, [task.id]);
  
  // Update time elapsed
  useEffect(() => {
    if (!taskTimeEntry) {
      setTimeElapsed('');
      return;
    }
    
    // If the task is completed, don't update time
    if (taskTimeEntry.end_time) {
      setTimeElapsed(formatTimeSpent(taskTimeEntry.start_time, taskTimeEntry.end_time));
      return;
    }
    
    // If the task is paused, show time until pause
    if (taskTimeEntry.is_paused && taskTimeEntry.pause_time) {
      setTimeElapsed(formatTimeSpent(taskTimeEntry.start_time, taskTimeEntry.pause_time));
      return;
    }
    
    // Active timer, update every second
    const intervalId = setInterval(() => {
      setTimeElapsed(formatTimeSpent(taskTimeEntry.start_time));
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [taskTimeEntry]);
  
  // Start timing the task
  const handleStartTask = async () => {
    if (!isUserClockedIn) {
      toast.error('You must be clocked in to track task time');
      return;
    }
    
    if (task.status === 'complete') {
      toast.error('Cannot track time for a completed task');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Mark task as in-progress if it's not already
      if (task.status !== 'in-progress') {
        await updateTaskStatus(task.id, 'in-progress');
      }
      
      // Start the timer
      const entry = await startTaskTimer(task.id);
      setTaskTimeEntry(entry);
      
      // Refresh task data
      if (refreshTasks) {
        await refreshTasks();
      } else {
        await queryClient.invalidateQueries({ queryKey: ['jobTasks', task.jobId] });
      }
    } catch (error) {
      console.error('Error starting task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Pause the task timer
  const handlePauseTask = async () => {
    if (!taskTimeEntry) return;
    
    try {
      setIsLoading(true);
      const updated = await pauseTaskTimer(taskTimeEntry.id);
      setTaskTimeEntry(updated);
    } catch (error) {
      console.error('Error pausing task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resume the task timer
  const handleResumeTask = async () => {
    if (!taskTimeEntry || !isUserClockedIn) {
      if (!isUserClockedIn) {
        toast.error('You must be clocked in to resume the task');
      }
      return;
    }
    
    try {
      setIsLoading(true);
      const updated = await resumeTaskTimer(taskTimeEntry.id);
      setTaskTimeEntry(updated);
    } catch (error) {
      console.error('Error resuming task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Complete the task
  const handleCompleteTask = async () => {
    if (!taskTimeEntry) return;
    
    try {
      setIsLoading(true);
      
      // Stop the timer
      await stopTaskTimer(taskTimeEntry.id);
      
      // Mark task as complete
      await updateTaskStatus(task.id, 'complete');
      
      // Refresh task data
      if (refreshTasks) {
        await refreshTasks();
      } else {
        await queryClient.invalidateQueries({ queryKey: ['jobTasks', task.jobId] });
      }
      
      // Refresh local state
      await fetchTaskTimeEntry();
      await refreshTimeTracking();
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine the button to show based on the state
  if (taskTimeEntry) {
    // Task timer exists
    
    if (taskTimeEntry.end_time || task.status === 'complete') {
      // Task is completed
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          {showLabel && <span className="text-xs text-muted-foreground">Completed</span>}
          <Button
            variant="ghost"
            size={size}
            className="text-green-500 hover:bg-green-50 hover:text-green-600"
            disabled
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    if (taskTimeEntry.is_paused) {
      // Task is paused
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          {showLabel && timeElapsed && (
            <span className="text-xs text-muted-foreground">Paused: {timeElapsed}</span>
          )}
          <Button
            variant="ghost"
            size={size}
            className="text-amber-500 hover:bg-amber-50 hover:text-amber-600"
            onClick={handleResumeTask}
            disabled={isLoading || !isUserClockedIn}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size={size}
            className="text-green-500 hover:bg-green-50 hover:text-green-600"
            onClick={handleCompleteTask}
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    // Task is active
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && timeElapsed && (
          <span className="text-xs">Working: {timeElapsed}</span>
        )}
        <Button
          variant="ghost"
          size={size}
          className="text-amber-500 hover:bg-amber-50 hover:text-amber-600"
          onClick={handlePauseTask}
          disabled={isLoading}
        >
          <Pause className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size={size}
          className="text-green-500 hover:bg-green-50 hover:text-green-600"
          onClick={handleCompleteTask}
          disabled={isLoading}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  // No task timer exists yet
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-xs text-muted-foreground">Track time</span>}
      <Button
        variant="ghost"
        size={size}
        className="text-blue-500 hover:bg-blue-50 hover:text-blue-600"
        onClick={handleStartTask}
        disabled={isLoading || task.status === 'complete' || !isUserClockedIn}
      >
        {isLoading ? (
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default TaskTimer;
