
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TaskList from './TaskList';

interface SewingCardProps {
  sewingMaterialTasks: string[];
  sewingLaborTasks: string[];
  onAddTask: (area: string, taskName: string) => void;
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
              Add specific tasks for sewing materials. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={sewingMaterialTasks} 
              area="sewingMaterials" 
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Labor</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for sewing labor. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={sewingLaborTasks} 
              area="sewingLabor" 
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
