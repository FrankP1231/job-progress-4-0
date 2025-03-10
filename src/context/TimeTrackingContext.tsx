
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { 
  clockIn, 
  clockOut, 
  getCurrentTimeEntry, 
  TimeEntry, 
  TaskTimeEntry, 
  getTaskTimeEntry 
} from '@/lib/supabase/timeTracking';

interface TimeTrackingContextType {
  isClockingIn: boolean;
  isClockingOut: boolean;
  isClockingLoading: boolean;
  currentTimeEntry: TimeEntry | null;
  clockInHandler: () => Promise<void>;
  clockOutHandler: (notes?: string) => Promise<void>;
  timeElapsed: string;
  getActiveTaskTimeEntry: (taskId: string) => Promise<TaskTimeEntry | null>;
  refreshTimeTracking: () => Promise<void>;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [isClockingLoading, setIsClockingLoading] = useState(true);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [timeElapsed, setTimeElapsed] = useState('0 seconds');
  
  // Function to refresh time tracking data
  const refreshTimeTracking = async () => {
    if (!user.isAuthenticated) {
      setCurrentTimeEntry(null);
      setIsClockingLoading(false);
      return;
    }
    
    try {
      setIsClockingLoading(true);
      const entry = await getCurrentTimeEntry();
      setCurrentTimeEntry(entry);
    } catch (error) {
      console.error('Error refreshing time tracking:', error);
    } finally {
      setIsClockingLoading(false);
    }
  };
  
  // Load initial time entry and set up interval to update time elapsed
  useEffect(() => {
    if (user.isAuthenticated) {
      refreshTimeTracking();
    } else {
      setIsClockingLoading(false);
    }
    
    // Set up interval to update time elapsed
    const intervalId = setInterval(() => {
      if (currentTimeEntry && !currentTimeEntry.clock_out_time) {
        const start = new Date(currentTimeEntry.clock_in_time);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
        
        // Format the elapsed time
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;
        
        let timeString = '';
        if (hours > 0) {
          timeString += `${hours}h `;
        }
        if (hours > 0 || minutes > 0) {
          timeString += `${minutes}m `;
        }
        timeString += `${seconds}s`;
        
        setTimeElapsed(timeString);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [user.isAuthenticated, currentTimeEntry]);
  
  // Clock in handler
  const clockInHandler = async () => {
    if (!user.isAuthenticated) {
      toast.error('You must be logged in to clock in');
      return;
    }
    
    try {
      setIsClockingIn(true);
      const entry = await clockIn();
      
      if (entry) {
        setCurrentTimeEntry(entry);
        toast.success('Clocked in successfully');
      }
    } catch (error: any) {
      console.error('Error in clock in handler:', error);
      toast.error(`Failed to clock in: ${error.message}`);
    } finally {
      setIsClockingIn(false);
    }
  };
  
  // Clock out handler
  const clockOutHandler = async (notes?: string) => {
    if (!user.isAuthenticated || !currentTimeEntry) {
      toast.error('You must be logged in and clocked in to clock out');
      return;
    }
    
    try {
      setIsClockingOut(true);
      const result = await clockOut(notes);
      
      if (result) {
        toast.success('Clocked out successfully');
      }
      
      await refreshTimeTracking();
    } catch (error: any) {
      console.error('Error in clock out handler:', error);
      toast.error(`Failed to clock out: ${error.message}`);
    } finally {
      setIsClockingOut(false);
    }
  };
  
  // Get active task time entry
  const getActiveTaskTimeEntry = async (taskId: string): Promise<TaskTimeEntry | null> => {
    if (!user.isAuthenticated) return null;
    return await getTaskTimeEntry(taskId);
  };
  
  return (
    <TimeTrackingContext.Provider
      value={{
        isClockingIn,
        isClockingOut,
        isClockingLoading,
        currentTimeEntry,
        clockInHandler,
        clockOutHandler,
        timeElapsed,
        getActiveTaskTimeEntry,
        refreshTimeTracking
      }}
    >
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = (): TimeTrackingContextType => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};
