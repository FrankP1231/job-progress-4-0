
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { Phase } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PhaseRowProps {
  phase: Phase;
  tabType: 'welding' | 'sewing' | 'readyForInstall';
  isExpanded: boolean;
  onToggle: () => void;
}

const PhaseRow: React.FC<PhaseRowProps> = ({ phase, tabType, isExpanded, onToggle }) => {
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
        return 'warning';
      case 'complete':
        return 'success';
      case 'waiting':
        return 'secondary';
      default:
        return 'outline';
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
          {phase.jobId.slice(0, 8)}
        </Link>
      </TableCell>
      <TableCell className="py-2">{phase.phaseName}</TableCell>
      <TableCell className="py-2">
        <Badge variant={getStatusVariant()}>
          {status.replace('-', ' ')}
        </Badge>
      </TableCell>
      <TableCell className="text-right py-2">{hours}</TableCell>
    </TableRow>
  );
};

export default PhaseRow;
