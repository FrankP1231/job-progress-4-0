
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhaseInfoCardProps {
  phaseName: string;
  setPhaseName: (name: string) => void;
  phaseNumber: string;
  setPhaseNumber: (number: string) => void;
}

const PhaseInfoCard: React.FC<PhaseInfoCardProps> = ({ 
  phaseName, 
  setPhaseName, 
  phaseNumber, 
  setPhaseNumber 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase Information</CardTitle>
        <CardDescription>
          Enter the basic information for this phase of the project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phaseName">Phase Name</Label>
            <Input
              id="phaseName"
              placeholder="e.g., Front Entrance Awning"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phaseNumber">Phase Number</Label>
            <Input
              id="phaseNumber"
              type="number"
              min="1"
              step="1"
              placeholder="e.g., 1"
              value={phaseNumber}
              onChange={(e) => setPhaseNumber(e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhaseInfoCard;
