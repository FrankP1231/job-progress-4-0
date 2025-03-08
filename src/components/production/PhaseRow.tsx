import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { Phase } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobById } from '@/lib/supabase/jobUtils';
import { calculateAreaStatus } from '@/lib/supabase/task-status';
import StatusBadge from '@/components/ui/StatusBadge';

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
    queryFn: () => getJobById(phase.jobId),
    enabled: !!phase.jobId,
  });

  // Determine tasks and status based on tab type
  const getTasksAndStatus = () => {
    if (tabType === 'welding') {
      const tasks = phase.weldingLabor.tasks || [];
      
      return {
        status: phase.weldingLabor.status,
        hours: phase.weldingLabor.hours || 0,
        tasks: tasks
      };
    } else if (tabType === 'sewing') {
      const tasks = phase.sewingLabor.tasks || [];
      
      return {
        status: phase.sewingLabor.status,
        hours: phase.sewingLabor.hours || 0,
        tasks: tasks
      };
    } else {
      const tasks = phase.installation.tasks || [];
      
      return {
        status: phase.installation.status,
        hours: phase.installation.crewHoursNeeded || 0,
        tasks: tasks
      };
    }
  };

  const { status, hours, tasks } = getTasksAndStatus();

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
        <StatusBadge status={status} tasks={tasks} />
      </TableCell>
      <TableCell className="text-right py-2">{hours}</TableCell>
    </TableRow>
  );
};

export default PhaseRow;
