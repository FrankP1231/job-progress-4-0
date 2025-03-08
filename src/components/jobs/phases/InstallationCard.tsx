
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TaskList from './TaskList';

interface TaskWithMetadata {
  name: string;
  hours?: number;
  eta?: string;
}

interface InstallationCardProps {
  installationMaterialTasks: TaskWithMetadata[];
  installationTasks: TaskWithMetadata[];
  rentalEquipmentTasks: TaskWithMetadata[];
  crewMembersNeeded: string;
  crewHoursNeeded: string;
  siteReadyDate: string;
  installDeadline: string;
  installNotes: string;
  setCrewMembersNeeded: (members: string) => void;
  setCrewHoursNeeded: (hours: string) => void;
  setSiteReadyDate: (date: string) => void;
  setInstallDeadline: (date: string) => void;
  setInstallNotes: (notes: string) => void;
  onAddTask: (area: string, task: TaskWithMetadata) => void;
  onRemoveTask: (area: string, index: number) => void;
}

const InstallationCard: React.FC<InstallationCardProps> = ({ 
  installationMaterialTasks,
  installationTasks,
  rentalEquipmentTasks,
  crewMembersNeeded,
  crewHoursNeeded,
  siteReadyDate,
  installDeadline,
  installNotes,
  setCrewMembersNeeded,
  setCrewHoursNeeded,
  setSiteReadyDate,
  setInstallDeadline,
  setInstallNotes,
  onAddTask,
  onRemoveTask
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation</CardTitle>
        <CardDescription>
          Add tasks and details for installation of this phase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Installation Materials</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for installation materials. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={installationMaterialTasks} 
              area="installationMaterials" 
              isMaterialArea={true}
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Crew Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crewMembersNeeded">Crew Members Needed</Label>
                <Input
                  id="crewMembersNeeded"
                  type="number"
                  min="1"
                  placeholder="Number of crew members"
                  value={crewMembersNeeded}
                  onChange={(e) => setCrewMembersNeeded(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crewHoursNeeded">Crew Hours Needed</Label>
                <Input
                  id="crewHoursNeeded"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="Estimated hours"
                  value={crewHoursNeeded}
                  onChange={(e) => setCrewHoursNeeded(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Schedule</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteReadyDate">Site Ready Date</Label>
                <Input
                  id="siteReadyDate"
                  type="date"
                  value={siteReadyDate}
                  onChange={(e) => setSiteReadyDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="installDeadline">Installation Deadline</Label>
                <Input
                  id="installDeadline"
                  type="date"
                  value={installDeadline}
                  onChange={(e) => setInstallDeadline(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Installation Tasks</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks for the installation process. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={installationTasks} 
              area="installation" 
              isLaborArea={true}
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Rental Equipment</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add specific tasks related to rental equipment. Status will be determined by task completion.
            </p>
            <TaskList 
              tasks={rentalEquipmentTasks} 
              area="rentalEquipment" 
              onAdd={onAddTask} 
              onRemove={onRemoveTask} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="installNotes">Additional Notes (Optional)</Label>
            <Input
              id="installNotes"
              placeholder="Any special notes about the installation"
              value={installNotes}
              onChange={(e) => setInstallNotes(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallationCard;
