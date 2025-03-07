
import React, { useState } from 'react';
import { Wrench, Scissors, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Phase, Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PhaseRow from './PhaseRow';
import TasksContainer from './TasksContainer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  
  const togglePhaseExpanded = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };
  
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
                <TableHead className="w-12"></TableHead>
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
                .map((phase) => {
                  const materialField = isWelding ? phase.weldingMaterials : phase.sewingMaterials;
                  const laborField = isWelding ? phase.weldingLabor : phase.sewingLabor;
                  const materialTasks = materialField.tasks || [];
                  const laborTasks = laborField.tasks || [];
                  const hasTasks = materialTasks.length > 0 || laborTasks.length > 0;
                  const isExpanded = expandedPhases[phase.id] || false;
                  
                  return (
                    <React.Fragment key={phase.id}>
                      <TableRow 
                        className={`${hasTasks ? 'cursor-pointer hover:bg-gray-50' : ''} ${isExpanded ? 'bg-gray-50' : ''}`}
                        onClick={() => hasTasks && togglePhaseExpanded(phase.id)}
                      >
                        <TableCell className="p-2 w-12">
                          {hasTasks && (
                            isExpanded ? 
                              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {phase.phaseNumber}: {phase.phaseName}
                        </TableCell>
                        <TableCell>
                          <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div className="cursor-default">
                              <PhaseRow 
                                phase={phase} 
                                materialStatus={isWelding ? phase.weldingMaterials.status : phase.sewingMaterials.status}
                                materialEta={isWelding ? phase.weldingMaterials.eta : phase.sewingMaterials.eta}
                                materialNotes={isWelding ? phase.weldingMaterials.notes : phase.sewingMaterials.notes}
                                laborStatus={isWelding ? phase.weldingLabor.status : phase.sewingLabor.status}
                                laborHours={isWelding ? phase.weldingLabor.hours : phase.sewingLabor.hours}
                                laborNotes={isWelding ? phase.weldingLabor.notes : phase.sewingLabor.notes}
                                hideLabor={true}
                                hideHours={true}
                                hideEta={true}
                                hideNotes={true}
                              />
                            </div>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div className="cursor-default">
                              <PhaseRow 
                                phase={phase} 
                                materialStatus={isWelding ? phase.weldingMaterials.status : phase.sewingMaterials.status}
                                materialEta={isWelding ? phase.weldingMaterials.eta : phase.sewingMaterials.eta}
                                materialNotes={isWelding ? phase.weldingMaterials.notes : phase.sewingMaterials.notes}
                                laborStatus={isWelding ? phase.weldingLabor.status : phase.sewingLabor.status}
                                laborHours={isWelding ? phase.weldingLabor.hours : phase.sewingLabor.hours}
                                laborNotes={isWelding ? phase.weldingLabor.notes : phase.sewingLabor.notes}
                                hideMaterial={true}
                                hideHours={true}
                                hideEta={true}
                                hideNotes={true}
                              />
                            </div>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          {laborField.hours ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-500" />
                              {laborField.hours} hrs
                            </div>
                          ) : (
                            <span className="text-gray-400">Not estimated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {materialField.eta ? (
                            new Date(materialField.eta).toLocaleDateString()
                          ) : (
                            <span className="text-gray-400">No ETA</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {materialField.notes || laborField.notes ? (
                            <div className="text-sm text-gray-600">
                              {materialField.notes && <div className="truncate">{materialField.notes}</div>}
                              {laborField.notes && <div className="truncate">{laborField.notes}</div>}
                            </div>
                          ) : (
                            <span className="text-gray-400">No notes</span>
                          )}
                        </TableCell>
                      </TableRow>
                      {hasTasks && (
                        <TableRow className={isExpanded ? 'bg-gray-50' : 'hidden'}>
                          <TableCell colSpan={7} className="p-0">
                            <Collapsible open={isExpanded}>
                              <CollapsibleContent>
                                <div className="p-4 space-y-4">
                                  {materialTasks.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">
                                        {isWelding ? 'Welding Materials Tasks' : 'Sewing Materials Tasks'}
                                      </h4>
                                      <TasksContainer
                                        tasks={materialTasks}
                                        phaseId={phase.id}
                                        area={isWelding ? 'weldingMaterials' : 'sewingMaterials'}
                                      />
                                    </div>
                                  )}
                                  
                                  {laborTasks.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">
                                        {isWelding ? 'Welding Labor Tasks' : 'Sewing Labor Tasks'}
                                      </h4>
                                      <TasksContainer
                                        tasks={laborTasks}
                                        phaseId={phase.id}
                                        area={isWelding ? 'weldingLabor' : 'sewingLabor'}
                                      />
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionPhasesTab;
