
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInProgressPhases, getAllJobs } from '@/lib/supabase';
import { Job, Phase } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList,
  Plus,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const DashboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch in-progress phases
  const { 
    data: inProgressPhases = [], 
    isLoading: isLoadingPhases,
    error: phasesError
  } = useQuery({
    queryKey: ['inProgressPhases'],
    queryFn: getInProgressPhases
  });

  // Fetch all jobs
  const { 
    data: jobs = [], 
    isLoading: isLoadingJobs,
    error: jobsError
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: getAllJobs
  });

  const isLoading = isLoadingPhases || isLoadingJobs;
  
  // Handle errors
  useEffect(() => {
    if (phasesError) {
      console.error('Error loading phases:', phasesError);
    }
    if (jobsError) {
      console.error('Error loading jobs:', jobsError);
    }
  }, [phasesError, jobsError]);

  const filteredPhases = inProgressPhases.filter(({ job, phase }) => {
    // Apply search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      job.jobNumber.toLowerCase().includes(searchLower) ||
      job.projectName.toLowerCase().includes(searchLower) ||
      job.buyer.toLowerCase().includes(searchLower) ||
      job.salesman.toLowerCase().includes(searchLower) ||
      phase.phaseName.toLowerCase().includes(searchLower);
    
    // Apply status filter if selected
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'welding-materials-needed') {
        matchesStatus = phase.weldingMaterials.status === 'not-ordered';
      } else if (statusFilter === 'sewing-materials-needed') {
        matchesStatus = phase.sewingMaterials.status === 'not-ordered';
      } else if (statusFilter === 'installation-materials-needed') {
        matchesStatus = phase.installationMaterials.status === 'not-ordered';
      } else if (statusFilter === 'welding-in-progress') {
        matchesStatus = phase.weldingLabor.status === 'estimated';
      } else if (statusFilter === 'sewing-in-progress') {
        matchesStatus = phase.sewingLabor.status === 'estimated';
      } else if (statusFilter === 'powder-coat-needed') {
        matchesStatus = phase.powderCoat.status === 'not-started' || phase.powderCoat.status === 'in-progress';
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage all job phases in progress
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/jobs/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              New Job
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline" className="gap-1">
              <ClipboardList className="h-4 w-4" />
              All Jobs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              All jobs in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressPhases.length}</div>
            <p className="text-xs text-muted-foreground">
              Phases still in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Materials Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inProgressPhases.filter(({ phase }) => 
                phase.weldingMaterials.status === 'not-ordered' || 
                phase.sewingMaterials.status === 'not-ordered' ||
                phase.installationMaterials.status === 'not-ordered'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Phases with materials not yet ordered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ready for Install
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inProgressPhases.filter(({ phase }) => 
                (phase.weldingMaterials.status === 'received' || phase.weldingMaterials.status === 'not-needed') && 
                (phase.sewingMaterials.status === 'received' || phase.sewingMaterials.status === 'not-needed') &&
                (phase.weldingLabor.status === 'complete' || phase.weldingLabor.status === 'not-needed') &&
                (phase.sewingLabor.status === 'complete' || phase.sewingLabor.status === 'not-needed') &&
                (phase.powderCoat.status === 'complete' || phase.powderCoat.status === 'not-needed') &&
                (phase.installationMaterials.status === 'received' || phase.installationMaterials.status === 'not-needed')
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Phases ready for installation
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="in-progress">In Progress Phases</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Installs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phases In Progress</CardTitle>
              <CardDescription>
                View and manage all phases currently in progress
              </CardDescription>
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search jobs or phases..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                
                {showFilters && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select 
                      value={statusFilter} 
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[250px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Phases</SelectItem>
                        <SelectItem value="welding-materials-needed">Welding Materials Needed</SelectItem>
                        <SelectItem value="sewing-materials-needed">Sewing Materials Needed</SelectItem>
                        <SelectItem value="installation-materials-needed">Installation Materials Needed</SelectItem>
                        <SelectItem value="welding-in-progress">Welding In Progress</SelectItem>
                        <SelectItem value="sewing-in-progress">Sewing In Progress</SelectItem>
                        <SelectItem value="powder-coat-needed">Powder Coat In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              ) : filteredPhases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job #</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead className="hidden md:table-cell">Materials</TableHead>
                      <TableHead className="hidden lg:table-cell">Labor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPhases.map(({ job, phase }) => (
                      <TableRow key={phase.id}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary font-medium hover:text-primary/80"
                            asChild
                          >
                            <Link to={`/jobs/${job.id}`}>{job.jobNumber}</Link>
                          </Button>
                        </TableCell>
                        <TableCell>{job.projectName}</TableCell>
                        <TableCell>
                          Phase {phase.phaseNumber}: {phase.phaseName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Welding:</span>
                              <StatusBadge status={phase.weldingMaterials.status} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Sewing:</span>
                              <StatusBadge status={phase.sewingMaterials.status} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Welding:</span>
                              <StatusBadge status={phase.weldingLabor.status} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Sewing:</span>
                              <StatusBadge status={phase.sewingLabor.status} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No phases match your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Installations</CardTitle>
              <CardDescription>
                View scheduled installations for the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Calendar integration features coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
