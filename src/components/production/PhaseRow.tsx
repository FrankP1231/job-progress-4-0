
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
  hideMaterial?: boolean;
  hideLabor?: boolean;
  hideHours?: boolean;
  hideEta?: boolean;
  hideNotes?: boolean;
}

const PhaseRow: React.FC<PhaseRowProps> = ({
  phase,
  materialStatus,
  materialEta,
  materialNotes,
  laborStatus,
  laborHours,
  laborNotes,
  hideMaterial = false,
  hideLabor = false,
  hideHours = false,
  hideEta = false,
  hideNotes = false
}) => {
  // Only render the content that is requested
  return (
    <>
      {!hideMaterial && (
        <StatusBadge status={materialStatus as MaterialStatus} />
      )}
      
      {!hideLabor && (
        <StatusBadge status={laborStatus as LaborStatus} />
      )}
      
      {!hideHours && (
        laborHours ? (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            {laborHours} hrs
          </div>
        ) : (
          <span className="text-gray-400">Not estimated</span>
        )
      )}
      
      {!hideEta && (
        materialEta ? (
          new Date(materialEta).toLocaleDateString()
        ) : (
          <span className="text-gray-400">No ETA</span>
        )
      )}
      
      {!hideNotes && (
        materialNotes || laborNotes ? (
          <div className="text-sm text-gray-600">
            {materialNotes && <div className="truncate">{materialNotes}</div>}
            {laborNotes && <div className="truncate">{laborNotes}</div>}
          </div>
        ) : (
          <span className="text-gray-400">No notes</span>
        )
      )}
    </>
  );
};

export default PhaseRow;
