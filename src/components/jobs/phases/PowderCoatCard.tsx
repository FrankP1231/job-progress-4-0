
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TaskList from './TaskList';

interface PowderCoatCardProps {
  powderCoatTasks: string[];
  powderCoatEta: string;
  powderCoatNotes: string;
  powderCoatColor: string;
  setPowderCoatEta: (eta: string) => void;
  setPowderCoatNotes: (notes: string) => void;
  setPowderCoatColor: (color: string) => void;
  onAddTask: (area: string, taskName: string) => void;
  onRemoveTask: (area: string, index: number) => void;
}

const PowderCoatCard: React.FC<PowderCoatCardProps> = ({ 
  powderCoatTasks, 
  powderCoatEta, 
  powderCoatNotes, 
  powderCoatColor,
  setPowderCoatEta,
  setPowderCoatNotes,
  setPowderCoatColor,
  onAddTask, 
  onRemoveTask 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Powder Coat</CardTitle>
        <CardDescription>
          Add tasks and details for powder coating this phase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="powderCoatEta">Expected Completion Date (Optional)</Label>
            <Input
              id="powderCoatEta"
              type="date"
              value={powderCoatEta}
              onChange={(e) => setPowderCoatEta(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="powderCoatColor">Color (Optional)</Label>
            <Input
              id="powderCoatColor"
              placeholder="Color name or code"
              value={powderCoatColor}
              onChange={(e) => setPowderCoatColor(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="powderCoatNotes">Notes (Optional)</Label>
            <Input
              id="powderCoatNotes"
              placeholder="Any special notes about powder coating"
              value={powderCoatNotes}
              onChange={(e) => setPowderCoatNotes(e.target.value)}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Tasks</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for powder coating. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={powderCoatTasks} 
              area="powderCoat" 
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowderCoatCard;
