
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Calendar, Users } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Installation } from '@/lib/types';

interface InstallationCardProps {
  installation: Installation;
  materials: { status: string; eta?: string; notes?: string; };
}

const InstallationCard: React.FC<InstallationCardProps> = ({ installation, materials }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-4 w-4" />
          <span>Installation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Crew Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Crew Size</span>
              <div className="flex items-center mt-1">
                <Users className="h-4 w-4 mr-2" />
                <span>{installation.crewMembersNeeded} members</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Hours Needed</span>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{installation.crewHoursNeeded} hours</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Materials</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={materials.status} />
            </div>
            {materials.eta && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ETA</span>
                <span className="text-sm">{new Date(materials.eta).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Schedule</h3>
          <div className="space-y-2">
            {installation.siteReadyDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Site Ready</span>
                <span className="text-sm">{new Date(installation.siteReadyDate).toLocaleDateString()}</span>
              </div>
            )}
            {installation.installStartDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Start Date</span>
                <span className="text-sm">{new Date(installation.installStartDate).toLocaleDateString()}</span>
              </div>
            )}
            {installation.installFinishDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">End Date</span>
                <span className="text-sm">{new Date(installation.installFinishDate).toLocaleDateString()}</span>
              </div>
            )}
            {installation.installDeadline && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deadline</span>
                <span className="text-sm">{new Date(installation.installDeadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {installation.notes && (
          <div>
            <span className="text-sm text-muted-foreground">Notes</span>
            <p className="text-sm mt-1">{installation.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstallationCard;
