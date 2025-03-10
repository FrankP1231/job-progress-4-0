
import { format, formatDistance } from 'date-fns';

/**
 * Formats the time spent between two dates
 */
export const formatTimeSpent = (startTime: string, endTime?: string | null): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  return formatDistance(start, end, { addSuffix: false });
};

/**
 * Formats a duration in seconds to a human-readable string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0 min';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};
