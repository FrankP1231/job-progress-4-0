
import React from 'react';
import { Phase } from '@/lib/types';
import { PackageCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/ui/StatusBadge';
import { Link } from 'react-router-dom';

interface ReadyForInstallTabContentProps {
  readyForInstallPhases: Phase[];
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
                <TableHead>Phase</TableHead>
                <TableHead>Installation Materials</TableHead>
                <TableHead>Installation Status</TableHead>
                <TableHead>Crew Size</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readyForInstallPhases.map((phase) => (
                <TableRow key={phase.id}>
                  <TableCell className="font-medium">
                    <Link to={`/jobs/${phase.jobId}/phases/${phase.id}`} className="hover:underline">
                      {phase.phaseNumber}: {phase.phaseName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={phase.installationMaterials.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={phase.installation.status} />
                  </TableCell>
                  <TableCell>{phase.installation.crewMembersNeeded} crew members</TableCell>
                  <TableCell>{phase.installation.crewHoursNeeded} hours</TableCell>
                  <TableCell>
                    {phase.installation.installDeadline ? (
                      new Date(phase.installation.installDeadline).toLocaleDateString()
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
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
