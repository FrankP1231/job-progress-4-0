
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TaskList from './TaskList';

interface TaskWithMetadata {
  name: string;
  hours?: number;
  eta?: string;
}

interface SewingCardProps {
  sewingMaterialTasks: TaskWithMetadata[];
  sewingLaborTasks: TaskWithMetadata[];
  onAddTask: (area: string, task: TaskWithMetadata) => void;
  onRemoveTask: (area: string, index: number) => void;
}

const SewingCard: React.FC<SewingCardProps> = ({ 
  sewingMaterialTasks, 
  sewingLaborTasks, 
  onAddTask, 
  onRemoveTask 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sewing</CardTitle>
        <CardDescription>
          Add tasks for sewing materials and labor for this phase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Materials</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for sewing materials with estimated arrival dates.
            </p>
            <TaskList 
              tasks={sewingMaterialTasks} 
              area="sewingMaterials" 
              isMaterialArea={true}
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Labor</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for sewing labor with estimated hours.
            </p>
            <TaskList 
              tasks={sewingLaborTasks} 
              area="sewingLabor" 
              isLaborArea={true}
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SewingCard;
