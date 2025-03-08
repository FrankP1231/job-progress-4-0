
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTasksForAllJobs } from '@/lib/supabase/taskUtils';
import { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Filter, 
  Link as LinkIcon, 
  Search, 
  Tag, 
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toggleTaskCompletion } from '@/lib/supabase/taskUtils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const TasksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all tasks
  const { data: allTasks, isLoading, error, refetch } = useQuery({
    queryKey: ['allTasks'],
    queryFn: getTasksForAllJobs,
    refetchInterval: 60000, // Refetch every minute
  });

  // Effect to log task data
  useEffect(() => {
    console.log('All tasks loaded:', allTasks?.length);
    if (error) {
      console.error('Error loading tasks:', error);
    }
  }, [allTasks, error]);

  const handleToggleTaskCompletion = async (task: Task) => {
    try {
      setUpdatingTaskId(task.id);
      await toggleTaskCompletion(task.id, !task.isComplete);
      
      // Refresh tasks data
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      
      // Also invalidate job and phase related queries
      if (task.phaseId) {
        queryClient.invalidateQueries({ queryKey: ['phase', task.phaseId] });
        queryClient.invalidateQueries({ queryKey: ['tasks', task.phaseId] });
        
        // Get jobId to invalidate job-related queries
        const { getJobIdForPhase } = await import('@/lib/supabase/task-helpers');
        const jobId = await getJobIdForPhase(task.phaseId);
        
        if (jobId) {
          queryClient.invalidateQueries({ queryKey: ['job', jobId] });
          queryClient.invalidateQueries({ queryKey: ['jobTasks', jobId] });
        }
      }
      
      toast.success(`Task ${task.isComplete ? 'reopened' : 'completed'}`);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Filter and sort tasks
  const filteredTasks = React.useMemo(() => {
    if (!allTasks) return [];
    
    return allTasks
      .filter(task => {
        // Filter by status
        if (statusFilter === 'complete' && !task.isComplete) return false;
        if (statusFilter === 'in-progress' && task.status !== 'in-progress') return false;
        if (statusFilter === 'not-started' && task.status !== 'not-started') return false;
        if (statusFilter === 'pending' && task.isComplete) return false;
        
        // Filter by area
        if (areaFilter !== 'all' && task.area !== areaFilter) return false;
        
        // Search in task name
        if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by completion status (incomplete first)
        if (a.isComplete !== b.isComplete) {
          return a.isComplete ? 1 : -1;
        }
        
        // Then sort by status (in-progress before not-started)
        if (a.status !== b.status) {
          if (a.status === 'in-progress') return -1;
          if (b.status === 'in-progress') return 1;
        }
        
        // Then sort by create date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allTasks, searchQuery, areaFilter, statusFilter]);

  // Group tasks by job
  const tasksByJob = React.useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    
    filteredTasks.forEach(task => {
      const jobId = task.jobId || 'unknown';
      if (!grouped[jobId]) {
        grouped[jobId] = [];
      }
      grouped[jobId].push(task);
    });
    
    return grouped;
  }, [filteredTasks]);

  const getTaskStatusIcon = (task: Task) => {
    if (updatingTaskId === task.id) {
      return <div className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />;
    }
    
    if (task.isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (task.status === 'in-progress') {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    
    return <Circle className="h-4 w-4 text-gray-400" />;
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mr-2" />
              <span>Loading tasks...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-red-500">
              Error loading tasks. Please try again later.
              <Button onClick={() => refetch()} className="ml-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tasks</CardTitle>
          <CardDescription>View and manage all tasks across projects</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex flex-row gap-2">
              <div className="w-48">
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger>
                    <Tag className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="weldingMaterials">Welding Materials</SelectItem>
                    <SelectItem value="weldingLabor">Welding Labor</SelectItem>
                    <SelectItem value="sewingMaterials">Sewing Materials</SelectItem>
                    <SelectItem value="sewingLabor">Sewing Labor</SelectItem>
                    <SelectItem value="powderCoat">Powder Coat</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="installationMaterials">Installation Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tasks count */}
          <div className="mb-4">
            <Badge variant="outline" className="text-sm">
              {filteredTasks.length} tasks found
            </Badge>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            {/* List View */}
            <TabsContent value="list">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found matching your filters.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(tasksByJob).map(([jobId, tasks]) => {
                    // Get job number and name from the first task (they all belong to same job)
                    const jobNumber = tasks[0]?.jobNumber || 'Unknown Job';
                    const projectName = tasks[0]?.projectName || '';
                    
                    return (
                      <div key={jobId} className="border rounded-lg p-4">
                        <div className="mb-3 flex items-center">
                          <h3 className="text-lg font-semibold">
                            <Link to={`/jobs/${jobId}`} className="hover:underline flex items-center">
                              {jobNumber}: {projectName}
                              <LinkIcon className="ml-1 h-3 w-3" />
                            </Link>
                          </h3>
                          <Badge className="ml-2">{tasks.length} tasks</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {tasks.map(task => (
                            <div
                              key={task.id}
                              className={`flex items-start p-3 rounded-md ${
                                task.isComplete 
                                  ? 'bg-muted/30' 
                                  : 'bg-white dark:bg-gray-800'
                              } hover:bg-muted/50 transition-colors`}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 mr-3 mt-0.5"
                                onClick={() => handleToggleTaskCompletion(task)}
                                disabled={updatingTaskId === task.id}
                              >
                                {getTaskStatusIcon(task)}
                              </Button>
                              
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <span className={`font-medium ${
                                    task.isComplete ? 'line-through text-muted-foreground' : ''
                                  }`}>
                                    {task.name}
                                  </span>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">
                                      {getAreaLabel(task.area)}
                                    </Badge>
                                    
                                    <Badge variant={
                                      task.isComplete 
                                        ? 'secondary' 
                                        : task.status === 'in-progress' 
                                          ? 'default' 
                                          : 'outline'
                                    }>
                                      {task.isComplete 
                                        ? 'Complete' 
                                        : task.status === 'in-progress' 
                                          ? 'In Progress' 
                                          : 'Not Started'}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="mt-1 text-sm text-muted-foreground">
                                  <Link to={`/jobs/${jobId}/phases/${task.phaseId}`} className="hover:underline">
                                    Phase: {task.phaseNumber} - {task.phaseName}
                                  </Link>
                                  
                                  {task.eta && (
                                    <span className="ml-4">
                                      ETA: {format(new Date(task.eta), 'MMM d, yyyy')}
                                    </span>
                                  )}
                                  
                                  {task.hours && (
                                    <span className="ml-4">
                                      Hours: {task.hours}
                                    </span>
                                  )}
                                </div>
                                
                                {task.notes && (
                                  <p className="mt-1 text-sm italic text-muted-foreground">
                                    {task.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Table View */}
            <TabsContent value="table">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found matching your filters.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Status</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>ETA</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map(task => (
                        <TableRow key={task.id} className={task.isComplete ? 'bg-muted/30' : ''}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleToggleTaskCompletion(task)}
                              disabled={updatingTaskId === task.id}
                            >
                              {getTaskStatusIcon(task)}
                            </Button>
                          </TableCell>
                          <TableCell className={task.isComplete ? 'line-through text-muted-foreground' : ''}>
                            {task.name}
                            {task.notes && (
                              <p className="text-xs italic text-muted-foreground mt-1">
                                {task.notes}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getAreaLabel(task.area)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link to={`/jobs/${task.jobId}`} className="hover:underline flex items-center">
                              {task.jobNumber}
                              <LinkIcon className="ml-1 h-3 w-3" />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link to={`/jobs/${task.jobId}/phases/${task.phaseId}`} className="hover:underline">
                              {task.phaseNumber}: {task.phaseName}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {task.eta ? format(new Date(task.eta), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleTaskCompletion(task)}
                              disabled={updatingTaskId === task.id}
                            >
                              {task.isComplete ? 'Reopen' : 'Complete'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
