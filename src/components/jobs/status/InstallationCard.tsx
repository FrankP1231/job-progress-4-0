
import React from 'react';
import { Package, Calendar, Truck } from 'lucide-react';
import { Installation, Material, RentalEquipment } from '@/lib/types';

interface InstallationCardProps {
  installation: Installation;
  materials: Material;
  rental?: React.ReactNode; // Pass in status update button
  materialStatus?: React.ReactNode; // Add materialStatus prop for the materials status button
}

const InstallationCard: React.FC<InstallationCardProps> = ({ 
  installation, 
  materials,
  rental,
  materialStatus
}) => {
  return (
    <div className="space-y-6">
      {/* Materials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Materials</h3>
          {materialStatus}
        </div>
        
        {materials.eta && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ETA</span>
            <span className="text-sm">{new Date(materials.eta).toLocaleDateString()}</span>
          </div>
        )}
        
        {materials.notes && (
          <div>
            <span className="text-sm text-muted-foreground">Notes</span>
            <p className="text-sm mt-1">{materials.notes}</p>
          </div>
        )}
      </div>
      
      {/* Rental Equipment Section */}
      <div className="pt-6 border-t space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Rental Equipment</h3>
          {rental}
        </div>
        
        {installation.rentalEquipment.details && (
          <div>
            <span className="text-sm text-muted-foreground">Details</span>
            <p className="text-sm mt-1">{installation.rentalEquipment.details}</p>
          </div>
        )}
        
        {installation.rentalEquipment.notes && (
          <div>
            <span className="text-sm text-muted-foreground">Notes</span>
            <p className="text-sm mt-1">{installation.rentalEquipment.notes}</p>
          </div>
        )}
      </div>
      
      {/* Installation Details Section */}
      <div className="pt-6 border-t">
        <h3 className="text-sm font-medium mb-4">Installation Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Crew Size</span>
              <span className="text-sm">{installation.crewMembersNeeded} members</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hours Needed</span>
              <span className="text-sm">{installation.crewHoursNeeded} hours</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {installation.siteReadyDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Site Ready</span>
                </div>
                <span className="text-sm">{new Date(installation.siteReadyDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {installation.installDeadline && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Deadline</span>
                </div>
                <span className="text-sm">{new Date(installation.installDeadline).toLocaleDateString()}</span>
              </div>
            )}
            
            {installation.installStartDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Start Date</span>
                </div>
                <span className="text-sm">{new Date(installation.installStartDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {installation.installFinishDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Finish Date</span>
                </div>
                <span className="text-sm">{new Date(installation.installFinishDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {installation.notes && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Installation Notes</span>
            <p className="text-sm mt-1">{installation.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallationCard;
