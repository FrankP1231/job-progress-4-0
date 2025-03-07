
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { Phase } from '@/lib/types';
import { formatDistance } from 'date-fns';
import { Link } from 'react-router-dom';
import { Wrench, Scissors, CalendarDays, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import PhaseRow from './PhaseRow';
import TasksContainer from './TasksContainer';

interface ProductionPhasesTabProps {
  phases: Phase[];
  tabType: 'welding' | 'sewing' | 'readyForInstall';
  totalHours: number;
}

const ProductionPhasesTab: React.FC<ProductionPhasesTabProps> = ({ 
  phases, 
  tabType, 
  totalHours 
}) => {
  const [expandedPhases, setExpandedPhases] = React.useState<Record<string, boolean>>({});

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            {tabType === 'welding' && <Wrench className="inline-block mr-2 h-5 w-5" />}
            {tabType === 'sewing' && <Scissors className="inline-block mr-2 h-5 w-5" />}
            {tabType === 'readyForInstall' && <CalendarDays className="inline-block mr-2 h-5 w-5" />}
            {tabType === 'welding' ? 'Welding Phases' : 
              tabType === 'sewing' ? 'Sewing Phases' : 'Ready for Installation'}
          </CardTitle>
          <Badge className="text-lg py-1 px-3" variant="outline">
            <Clock className="inline-block mr-2 h-4 w-4" />
            {totalHours} hours
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No {tabType === 'readyForInstall' ? 'phases ready for installation' : `${tabType} phases`} found
                  </TableCell>
                </TableRow>
              ) : (
                phases.map(phase => (
                  <Collapsible key={phase.id} open={expandedPhases[phase.id]} onOpenChange={() => togglePhase(phase.id)}>
                    <PhaseRow 
                      phase={phase} 
                      tabType={tabType}
                      isExpanded={expandedPhases[phase.id] || false}
                      onToggle={() => togglePhase(phase.id)}
                    />
                    <CollapsibleContent>
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="bg-muted/30 p-4 border-t">
                            {tabType === 'welding' && (
                              <TasksContainer
                                title="Welding Tasks"
                                tasks={phase.weldingLabor.tasks || []}
                                className="mb-4"
                              />
                            )}
                            {tabType === 'sewing' && (
                              <TasksContainer
                                title="Sewing Tasks"
                                tasks={phase.sewingLabor.tasks || []}
                                className="mb-4"
                              />
                            )}
                            {tabType === 'readyForInstall' && (
                              <TasksContainer
                                title="Installation Tasks"
                                tasks={phase.installation.tasks || []}
                                className="mb-4"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionPhasesTab;
