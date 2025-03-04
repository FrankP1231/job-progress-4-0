
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { LayoutDashboard, Search, Package, Filter, ListFilter, Plus, Calendar } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { getAllPhases, getInProgressPhases, formatDate } from '@/lib/jobUtils';
import { Phase, Job } from '@/lib/types';

interface PhaseWithJob {
  job: Job;
  phase: Phase;
}

const DashboardPage: React.FC = () => {
  const [phases, setPhases] = useState<PhaseWithJob[]>([]);
  const [filteredPhases, setFilteredPhases] = useState<PhaseWithJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'complete'>('all');

  useEffect(() => {
    // Load all phases on component mount
    loadPhases();
  }, []);

  const loadPhases = () => {
    const allPhases = getAllPhases();
    setPhases(allPhases);
    applyFilters(allPhases, searchQuery, statusFilter);
  };

  const applyFilters = (
    phaseList: PhaseWithJob[], 
    query: string, 
    status: 'all' | 'pending' | 'in-progress' | 'complete'
  ) => {
    let filtered = phaseList;
    
    // Apply search query filter
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase().trim();
      filtered = filtered.filter(({ job, phase }) => 
        job.jobNumber.toLowerCase().includes(lowercaseQuery) ||
        job.projectName.toLowerCase().includes(lowercaseQuery) ||
        job.buyer.toLowerCase().includes(lowercaseQuery) ||
        job.salesman.toLowerCase().includes(lowercaseQuery) ||
        phase.phaseName.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(({ phase }) => phase.status === status);
    }
    
    setFilteredPhases(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(phases, query, statusFilter);
  };

  const handleStatusFilterChange = (status: 'all' | 'pending' | 'in-progress' | 'complete') => {
    setStatusFilter(status);
    applyFilters(phases, searchQuery, status);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <span>Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Track and manage production progress</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button asChild variant="default">
              <Link to="/jobs/new" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>New Job</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Active Jobs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{phases.filter(p => p.phase.status !== 'complete').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-yellow-500" />
                <span>Pending Installation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {phases.filter(p => !p.phase.installation.installStartDate && p.phase.status !== 'complete').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Completed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{phases.filter(p => p.phase.status === 'complete').length}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-semibold">Production Overview</h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search jobs..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" onClick={() => handleStatusFilterChange('all')}>All Phases</TabsTrigger>
              <TabsTrigger value="pending" onClick={() => handleStatusFilterChange('pending')}>Pending</TabsTrigger>
              <TabsTrigger value="in-progress" onClick={() => handleStatusFilterChange('in-progress')}>In Progress</TabsTrigger>
              <TabsTrigger value="complete" onClick={() => handleStatusFilterChange('complete')}>Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <Card className="w-full">
                <CardContent className="p-0">
                  {filteredPhases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left p-3 font-medium">Job #</th>
                            <th className="text-left p-3 font-medium">Project</th>
                            <th className="text-left p-3 font-medium">Phase</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Buyer</th>
                            <th className="text-left p-3 font-medium">Salesman</th>
                            <th className="text-left p-3 font-medium">Deadline</th>
                            <th className="text-left p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPhases.map(({ job, phase }) => (
                            <tr key={phase.id} className="border-t hover:bg-muted/30">
                              <td className="p-3 font-medium">{job.jobNumber}</td>
                              <td className="p-3">{job.projectName}</td>
                              <td className="p-3">Phase {phase.phaseNumber}: {phase.phaseName}</td>
                              <td className="p-3">
                                <StatusBadge status={phase.status} />
                              </td>
                              <td className="p-3">{job.buyer}</td>
                              <td className="p-3">{job.salesman}</td>
                              <td className="p-3">{formatDate(phase.installation.installDeadline)}</td>
                              <td className="p-3">
                                <Button asChild variant="outline" size="sm">
                                  <Link to={`/jobs/${job.id}/phases/${phase.id}`}>
                                    View
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      {searchQuery ? 'No phases match your search criteria' : 'No phases found. Create a new job to get started.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              {/* Same content as "all" tab but filtered to pending status */}
            </TabsContent>
            
            <TabsContent value="in-progress" className="mt-0">
              {/* Same content as "all" tab but filtered to in-progress status */}
            </TabsContent>
            
            <TabsContent value="complete" className="mt-0">
              {/* Same content as "all" tab but filtered to complete status */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
