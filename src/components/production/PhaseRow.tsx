
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { Phase } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJob } from '@/lib/supabase/jobUtils';

interface PhaseRowProps {
  phase: Phase;
  tabType: 'welding' | 'sewing' | 'readyForInstall';
  isExpanded: boolean;
  onToggle: () => void;
}

const PhaseRow: React.FC<PhaseRowProps> = ({ phase, tabType, isExpanded, onToggle }) => {
  // Fetch job details to display job number and customer
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', phase.jobId],
    queryFn: () => getJob(phase.jobId),
    enabled: !!phase.jobId,
  });

  // Determine status and hours based on tab type
  const getStatusAndHours = () => {
    if (tabType === 'welding') {
      return {
        status: phase.weldingLabor.status,
        hours: phase.weldingLabor.hours || 0,
      };
    } else if (tabType === 'sewing') {
      return {
        status: phase.sewingLabor.status,
        hours: phase.sewingLabor.hours || 0,
      };
    } else {
      return {
        status: phase.installation.status,
        hours: phase.installation.crewHoursNeeded || 0,
      };
    }
  };

  const { status, hours } = getStatusAndHours();

  // Get status variant for badge
  const getStatusVariant = () => {
    switch (status) {
      case 'in-progress':
        return 'default';
      case 'complete':
        return 'default';
      case 'not-started':
        return 'secondary';
      case 'estimated':
        return 'outline';
      case 'not-needed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Make status display more user-friendly
  const getDisplayStatus = () => {
    switch (status) {
      case 'in-progress':
        return 'in progress';
      case 'complete':
        return 'complete';
      case 'not-started':
        return 'not started';
      case 'estimated':
        return 'estimated';
      case 'not-needed':
        return 'not needed';
      default:
        return status;
    }
  };

  return (
    <TableRow className="group">
      <TableCell className="py-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </TableCell>
      <TableCell className="font-medium py-2">
        <Link to={`/jobs/${phase.jobId}`} className="hover:underline">
          {isLoading ? (
            <span className="text-gray-400">Loading...</span>
          ) : job ? (
            <div className="flex flex-col">
              <span className="font-medium">{job.jobNumber}</span>
              <span className="text-xs text-gray-500">{job.buyer}</span>
            </div>
          ) : (
            phase.jobId.slice(0, 8)
          )}
        </Link>
      </TableCell>
      <TableCell className="py-2">{phase.phaseName}</TableCell>
      <TableCell className="py-2">
        <Badge variant={getStatusVariant()}>
          {getDisplayStatus()}
        </Badge>
      </TableCell>
      <TableCell className="text-right py-2">{hours}</TableCell>
    </TableRow>
  );
};

export default PhaseRow;
