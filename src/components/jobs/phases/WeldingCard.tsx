
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TaskList from './TaskList';

interface WeldingCardProps {
  weldingMaterialTasks: string[];
  weldingLaborTasks: string[];
  onAddTask: (area: string, taskName: string) => void;
  onRemoveTask: (area: string, index: number) => void;
}

const WeldingCard: React.FC<WeldingCardProps> = ({ 
  weldingMaterialTasks, 
  weldingLaborTasks, 
  onAddTask, 
  onRemoveTask 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welding</CardTitle>
        <CardDescription>
          Add tasks for welding materials and labor for this phase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Materials</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for welding materials. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={weldingMaterialTasks} 
              area="weldingMaterials" 
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Labor</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for welding labor. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={weldingLaborTasks} 
              area="weldingLabor" 
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeldingCard;
