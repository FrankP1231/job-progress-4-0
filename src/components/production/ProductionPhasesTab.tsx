
import React from 'react';
import { Wrench, Scissors, Clock } from 'lucide-react';
import { Phase } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PhaseRow from './PhaseRow';

interface ProductionPhasesTabProps {
  phases: Phase[];
  tabType: 'welding' | 'sewing';
  totalHours: number;
}

const ProductionPhasesTab: React.FC<ProductionPhasesTabProps> = ({ 
  phases, 
  tabType,
  totalHours 
}) => {
  const isWelding = tabType === 'welding';
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          {isWelding ? (
            <Wrench className="mr-2 h-5 w-5 text-blue-500" />
          ) : (
            <Scissors className="mr-2 h-5 w-5 text-purple-500" />
          )}
          {isWelding ? 'Welding Production' : 'Sewing Production'}
        </CardTitle>
        <div className={`flex items-center ${isWelding ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'} px-3 py-1 rounded-md`}>
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-medium">Total Est. Hours: {totalHours}</span>
        </div>
      </CardHeader>
      <CardContent>
        {phases.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No phases with {isWelding ? 'welding' : 'sewing'} tasks found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phase</TableHead>
                <TableHead>Materials Status</TableHead>
                <TableHead>Labor Status</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Material ETA</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phases
                .sort((a, b) => a.phaseNumber - b.phaseNumber)
                .map((phase) => (
                  <PhaseRow 
                    key={phase.id} 
                    phase={phase} 
                    materialStatus={isWelding ? phase.weldingMaterials.status : phase.sewingMaterials.status}
                    materialEta={isWelding ? phase.weldingMaterials.eta : phase.sewingMaterials.eta}
                    materialNotes={isWelding ? phase.weldingMaterials.notes : phase.sewingMaterials.notes}
                    laborStatus={isWelding ? phase.weldingLabor.status : phase.sewingLabor.status}
                    laborHours={isWelding ? phase.weldingLabor.hours : phase.sewingLabor.hours}
                    laborNotes={isWelding ? phase.weldingLabor.notes : phase.sewingLabor.notes}
                  />
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionPhasesTab;
