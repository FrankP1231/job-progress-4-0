
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/ui/StatusBadge';
import { Phase, MaterialStatus, LaborStatus } from '@/lib/types';

interface PhaseRowProps {
  phase: Phase;
  materialStatus: MaterialStatus;
  materialEta?: string;
  materialNotes?: string;
  laborStatus: LaborStatus;
  laborHours?: number;
  laborNotes?: string;
}

const PhaseRow: React.FC<PhaseRowProps> = ({
  phase,
  materialStatus,
  materialEta,
  materialNotes,
  laborStatus,
  laborHours,
  laborNotes
}) => {
  return (
    <TableRow key={phase.id}>
      <TableCell className="font-medium">
        <Link to={`/jobs/${phase.jobId}/phases/${phase.id}`} className="hover:underline">
          {phase.phaseNumber}: {phase.phaseName}
        </Link>
      </TableCell>
      <TableCell>
        <StatusBadge status={materialStatus as MaterialStatus} />
      </TableCell>
      <TableCell>
        <StatusBadge status={laborStatus as LaborStatus} />
      </TableCell>
      <TableCell>
        {laborHours ? (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            {laborHours} hrs
          </div>
        ) : (
          <span className="text-gray-400">Not estimated</span>
        )}
      </TableCell>
      <TableCell>
        {materialEta ? (
          new Date(materialEta).toLocaleDateString()
        ) : (
          <span className="text-gray-400">No ETA</span>
        )}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {materialNotes || laborNotes ? (
          <div className="text-sm text-gray-600">
            {materialNotes && <div className="truncate">{materialNotes}</div>}
            {laborNotes && <div className="truncate">{laborNotes}</div>}
          </div>
        ) : (
          <span className="text-gray-400">No notes</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PhaseRow;
