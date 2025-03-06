
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Scissors } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { PhaseWithJob } from '@/hooks/useProductionPhases';

interface SewingTabContentProps {
  sewingPhases: PhaseWithJob[];
  totalSewingHours: number;
}

const SewingTabContent: React.FC<SewingTabContentProps> = ({ sewingPhases, totalSewingHours }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Scissors className="mr-2 h-5 w-5 text-purple-500" />
          Sewing Tasks
        </CardTitle>
        <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-md">
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-medium">Total Est. Hours: {totalSewingHours}</span>
        </div>
      </CardHeader>
      <CardContent>
        {sewingPhases.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No sewing tasks found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Materials Status</TableHead>
                <TableHead>Labor Status</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sewingPhases.map(({ phase, job }) => (
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
                    <StatusBadge status={phase.sewingMaterials.status} />
                    {phase.sewingMaterials.eta && (
                      <div className="text-xs text-gray-500 mt-1">
                        ETA: {new Date(phase.sewingMaterials.eta).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={phase.sewingLabor.status} />
                    {phase.sewingLabor.hours && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {phase.sewingLabor.hours} hrs
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {phase.sewingLabor.hours ? (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        {phase.sewingLabor.hours} hrs
                      </div>
                    ) : (
                      <span className="text-gray-400">Not estimated</span>
                    )}
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

export default SewingTabContent;
