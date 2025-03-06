
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, PackageCheck, Scissors, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { PhaseWithJob } from '@/hooks/useProductionPhases';

interface ReadyForInstallTabContentProps {
  readyForInstallPhases: PhaseWithJob[];
  totalInstallHours: number;
}

const ReadyForInstallTabContent: React.FC<ReadyForInstallTabContentProps> = ({ 
  readyForInstallPhases, 
  totalInstallHours 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <PackageCheck className="mr-2 h-5 w-5 text-green-500" />
          Ready for Installation
        </CardTitle>
        <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-md">
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-medium">Total Est. Hours: {totalInstallHours}</span>
        </div>
      </CardHeader>
      <CardContent>
        {readyForInstallPhases.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No phases ready for installation
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Production Status</TableHead>
                <TableHead>Install Crew</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readyForInstallPhases.map(({ phase, job }) => (
                <TableRow key={`${job.id}-${phase.id}`}>
                  <TableCell className="font-medium">
                    <Link to={`/jobs/${job.id}`} className="hover:underline">
                      {job.projectName || job.jobNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/jobs/${job.id}/phases/${phase.id}`} className="hover:underline">
                      {phase.phaseNumber}: {phase.phaseName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-3 w-3 text-blue-500" />
                        <StatusBadge status={phase.weldingLabor.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Scissors className="h-3 w-3 text-purple-500" />
                        <StatusBadge status={phase.sewingLabor.status} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {phase.installation.crewMembersNeeded} crew members
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {phase.installation.crewHoursNeeded} hrs
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/production/${job.id}`}>
                        View Details <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadyForInstallTabContent;
