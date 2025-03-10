import React, { useState, useEffect, useCallback } from 'react';
import { useTimeTracking } from '@/context/TimeTrackingContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getTimeEntries, formatDuration, getTaskTimeEntriesForUser } from '@/lib/supabase/timeTracking';
import { format, isToday, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInSeconds, 
  addWeeks, isWithinInterval, isSameDay } from 'date-fns';
import { Clock, Timer, Calendar, ListChecks, BadgeDollarSign } from 'lucide-react';

interface TimeEntrySummary {
  id: string;
  clockIn: Date;
  clockOut: Date | null;
  duration: number | null;
  notes: string | null;
}

interface TaskTimeSummary {
  id: string;
  taskId: string;
  taskName: string;
  phaseName: string;
  jobNumber: string;
  projectName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
}

interface TimePeriodSummary {
  periodName: string;
  totalSeconds: number;
  overtimeSeconds: number;
  regularSeconds: number;
}

const TimeTrackingTab: React.FC = () => {
  const { user } = useAuth();
  const { currentTimeEntry, timeElapsed } = useTimeTracking();
  
  const [isLoading, setIsLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState<TimeEntrySummary[]>([]);
  const [taskEntries, setTaskEntries] = useState<TaskTimeSummary[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [periodSummaries, setPeriodSummaries] = useState<TimePeriodSummary[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const calculateTodayTotal = useCallback((clockEntries: TimeEntrySummary[]) => {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);
    
    let totalSeconds = 0;
    
    clockEntries.forEach(entry => {
      if (isWithinInterval(entry.clockIn, { start: startOfToday, end: endOfToday })) {
        if (entry.clockOut) {
          totalSeconds += entry.duration || 0;
        } else {
          totalSeconds += differenceInSeconds(now, entry.clockIn);
        }
      }
    });
    
    setTodayTotal(totalSeconds);
  }, []);
  
  const calculateTimePeriodSummaries = useCallback((entries: TimeEntrySummary[]) => {
    const now = new Date();
    
    const periods = [
      { name: 'Today', start: startOfDay(now), end: endOfDay(now) },
      { name: 'This Week', start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) },
      { name: 'Last Week', start: startOfWeek(addWeeks(now, -1), { weekStartsOn: 0 }), end: endOfWeek(addWeeks(now, -1), { weekStartsOn: 0 }) },
      { name: 'This Month', start: startOfMonth(now), end: endOfMonth(now) },
      { name: 'This Year', start: startOfYear(now), end: endOfYear(now) }
    ];
    
    const dayOfMonth = now.getDate();
    let payPeriodStart, payPeriodEnd;
    
    if (dayOfMonth < 15) {
      payPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      payPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 14, 23, 59, 59);
    } else {
      payPeriodStart = new Date(now.getFullYear(), now.getMonth(), 15);
      payPeriodEnd = endOfMonth(now);
    }
    
    periods.push({ name: 'Current Pay Period', start: payPeriodStart, end: payPeriodEnd });
    
    const summaries: TimePeriodSummary[] = periods.map(period => {
      let totalSeconds = 0;
      let weeklyTotals: Record<string, number> = {};
      
      entries.forEach(entry => {
        if (entry.clockIn >= period.start && entry.clockIn <= period.end) {
          const entryDuration = entry.duration || 
            (entry.clockOut ? differenceInSeconds(entry.clockOut, entry.clockIn) : 
              differenceInSeconds(new Date(), entry.clockIn));
          
          totalSeconds += entryDuration;
          
          const weekStart = format(startOfWeek(entry.clockIn, { weekStartsOn: 0 }), 'yyyy-MM-dd');
          weeklyTotals[weekStart] = (weeklyTotals[weekStart] || 0) + entryDuration;
        }
      });
      
      let secondsInWorkWeek = 40 * 60 * 60;
      let overtimeSeconds = 0;
      let regularSeconds = totalSeconds;
      
      Object.values(weeklyTotals).forEach(weekTotal => {
        if (weekTotal > secondsInWorkWeek) {
          overtimeSeconds += (weekTotal - secondsInWorkWeek);
          regularSeconds -= (weekTotal - secondsInWorkWeek);
        }
      });
      
      return {
        periodName: period.name,
        totalSeconds,
        overtimeSeconds,
        regularSeconds
      };
    });
    
    setPeriodSummaries(summaries);
  }, []);
  
  const fetchTimeTrackingData = useCallback(async (forceRefresh = false) => {
    if (!user.isAuthenticated) return;
    
    const now = new Date();
    const timeSinceLastUpdate = differenceInSeconds(now, lastUpdate);
    if (timeSinceLastUpdate < 60 && !forceRefresh && !isLoading) {
      return;
    }
    
    try {
      if (isLoading || forceRefresh) {
        setIsLoading(true);
      }
      
      const entries = await getTimeEntries(50);
      
      const formattedEntries = entries.map(entry => ({
        id: entry.id,
        clockIn: new Date(entry.clock_in_time),
        clockOut: entry.clock_out_time ? new Date(entry.clock_out_time) : null,
        duration: entry.duration_seconds,
        notes: entry.notes
      }));
      
      setTimeEntries(formattedEntries);
      
      try {
        console.log('About to fetch task time entries...');
        const taskTimeEntries = await getTaskTimeEntriesForUser(30);
        console.log('Task time entries fetched:', taskTimeEntries);
        
        const formattedTaskEntries = taskTimeEntries.map(entry => ({
          id: entry.id,
          taskId: entry.task_id,
          taskName: entry.task?.name || 'Unknown Task',
          phaseName: entry.phase?.phase_name || 'Unknown Phase',
          jobNumber: entry.job?.job_number || 'Unknown Job',
          projectName: entry.job?.project_name || 'Unknown Project',
          startTime: new Date(entry.start_time),
          endTime: entry.end_time ? new Date(entry.end_time) : null,
          duration: entry.duration_seconds
        }));
        
        console.log('Formatted task entries:', formattedTaskEntries);
        setTaskEntries(formattedTaskEntries);
      } catch (taskError) {
        console.error('Error fetching task entries:', taskError);
      }
      
      calculateTodayTotal(formattedEntries);
      calculateTimePeriodSummaries(formattedEntries);
      
      setLastUpdate(now);
    } catch (error) {
      console.error('Error fetching time tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user.isAuthenticated, isLoading, lastUpdate, calculateTodayTotal, calculateTimePeriodSummaries]);
  
  useEffect(() => {
    fetchTimeTrackingData(true);
  }, [fetchTimeTrackingData]);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTimeTrackingData(false);
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchTimeTrackingData]);
  
  useEffect(() => {
    if (currentTimeEntry) {
      fetchTimeTrackingData(true);
    }
  }, [currentTimeEntry, fetchTimeTrackingData]);
  
  const formatTimeDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  if (isLoading && timeEntries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="mt-1 flex items-center">
                  {currentTimeEntry && !currentTimeEntry.clock_out_time ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Clocked In {timeElapsed && `(${timeElapsed})`}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      Clocked Out
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Clock In Time</p>
                <p className="mt-1 font-medium">
                  {currentTimeEntry && !currentTimeEntry.clock_out_time ? (
                    format(new Date(currentTimeEntry.clock_in_time), 'h:mm a')
                  ) : (
                    '—'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="flex items-center text-lg">
              <Timer className="mr-2 h-5 w-5" />
              Today's Total
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{formatTimeDisplay(todayTotal)}</div>
              <p className="text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Time Period Summaries
          </CardTitle>
          <CardDescription>View your time tracked over different periods</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today">
            <TabsList className="grid grid-cols-6 mb-4">
              {periodSummaries.map((summary, index) => (
                <TabsTrigger key={index} value={summary.periodName.toLowerCase().replace(/\s+/g, '-')}>
                  {summary.periodName}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {periodSummaries.map((summary, index) => (
              <TabsContent key={index} value={summary.periodName.toLowerCase().replace(/\s+/g, '-')}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4 text-center">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Regular Hours</h4>
                    <div className="text-2xl font-bold">{formatTimeDisplay(summary.regularSeconds)}</div>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-center">
                      <BadgeDollarSign className="h-4 w-4 mr-1" />
                      Overtime
                    </h4>
                    <div className="text-2xl font-bold text-amber-600">{formatTimeDisplay(summary.overtimeSeconds)}</div>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-4 text-center">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Hours</h4>
                    <div className="text-2xl font-bold">{formatTimeDisplay(summary.totalSeconds)}</div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            Clock In/Out Activity
          </CardTitle>
          <CardDescription>Recent clock in and out entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No clock in/out activity found
                  </TableCell>
                </TableRow>
              ) : (
                timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {format(entry.clockIn, 'MMM d, yyyy')}
                      {isToday(entry.clockIn) && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">Today</Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(entry.clockIn, 'h:mm a')}</TableCell>
                    <TableCell>
                      {entry.clockOut ? format(entry.clockOut, 'h:mm a') : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.duration ? formatDuration(entry.duration) : (
                        timeElapsed || 'In progress'
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            Task Time Entries
          </CardTitle>
          <CardDescription>Recent time tracked on specific tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
              <span className="text-sm text-muted-foreground">Loading task entries...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No task time entries found. Try tracking time on a task.
                    </TableCell>
                  </TableRow>
                ) : (
                  taskEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {format(entry.startTime, 'MMM d, yyyy')}
                        {isToday(entry.startTime) && (
                          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">Today</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.taskName}</div>
                        <div className="text-xs text-muted-foreground">{entry.phaseName}</div>
                      </TableCell>
                      <TableCell>
                        <div>{entry.jobNumber}</div>
                        <div className="text-xs text-muted-foreground">{entry.projectName}</div>
                      </TableCell>
                      <TableCell>
                        {entry.duration ? formatDuration(entry.duration) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">In Progress</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingTab;
