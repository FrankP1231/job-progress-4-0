
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
} from '@/lib/supabase/time-tracking';

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
  const [lastRefresh, setLastRefresh] = useState(0);
  
  const refreshTimeTracking = async () => {
    const now = Date.now();
    if (now - lastRefresh < 5000 && lastRefresh !== 0) {
      return;
    }
    
    if (!user.isAuthenticated) {
      setCurrentTimeEntry(null);
      setIsClockingLoading(false);
      return;
    }
    
    try {
      setIsClockingLoading(true);
      const entry = await getCurrentTimeEntry();
      setCurrentTimeEntry(entry);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error refreshing time tracking:', error);
      toast.error('Failed to refresh time tracking status');
    } finally {
      setIsClockingLoading(false);
    }
  };
  
  useEffect(() => {
    if (user.isAuthenticated) {
      refreshTimeTracking();
    } else {
      setIsClockingLoading(false);
    }
    
    const intervalId = setInterval(() => {
      if (currentTimeEntry && !currentTimeEntry.clock_out_time) {
        const start = new Date(currentTimeEntry.clock_in_time);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
        
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        
        let timeString = '';
        if (hours > 0) {
          timeString += `${hours}h `;
        }
        timeString += `${minutes}m`;
        
        setTimeElapsed(timeString);
      }
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [user.isAuthenticated, currentTimeEntry]);
  
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
      toast.error(`Failed to clock in: ${error.message || 'Unknown error'}`);
    } finally {
      setIsClockingIn(false);
    }
  };
  
  const clockOutHandler = async (notes?: string) => {
    if (!user.isAuthenticated || !currentTimeEntry) {
      toast.error('You must be logged in and clocked in to clock out');
      return;
    }
    
    try {
      setIsClockingOut(true);
      console.log('Starting clock out process...');
      
      // Set a timeout for error handling
      let clockOutComplete = false;
      const timeoutId = setTimeout(() => {
        if (!clockOutComplete) {
          console.error('Clock out operation timed out');
          throw new Error('Clock out operation timed out. Please try again.');
        }
      }, 8000);
      
      const result = await clockOut(notes);
      clockOutComplete = true;
      clearTimeout(timeoutId);
      
      if (result) {
        console.log('Clock out successful:', result);
        toast.success('Clocked out successfully');
      }
      
      await refreshTimeTracking();
    } catch (error: any) {
      console.error('Error in clock out handler:', error);
      toast.error(`Failed to clock out: ${error.message || 'Unknown error'}`);
      throw error; // Rethrow to handle in the component
    } finally {
      setIsClockingOut(false);
    }
  };
  
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
