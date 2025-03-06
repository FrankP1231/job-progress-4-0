
import React, { useState } from 'react';
import { Palette, Edit, Check } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { PowderCoat } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updatePhase } from '@/lib/supabase/phaseUtils';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

interface PowderCoatCardProps {
  powderCoat: PowderCoat;
  hideStatus?: boolean;
}

const PowderCoatCard: React.FC<PowderCoatCardProps> = ({ 
  powderCoat,
  hideStatus = false
}) => {
  const { jobId, phaseId } = useParams<{ jobId: string, phaseId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [color, setColor] = useState(powderCoat.color || '');

  const handleSaveColor = async () => {
    if (!jobId || !phaseId) return;
    
    try {
      await updatePhase(jobId, phaseId, {
        powderCoat: {
          ...powderCoat,
          color
        }
      });
      
      setIsEditing(false);
      toast.success('Color updated successfully');
    } catch (error) {
      console.error('Error updating color:', error);
      toast.error('Failed to update color');
    }
  };

  return (
    <div className="space-y-4">
      {!hideStatus && powderCoat.status !== undefined && (
        <div className="flex items-center justify-between">
          <Label htmlFor="status" className="text-sm text-muted-foreground">PC Status</Label>
          <StatusBadge status={powderCoat.status} />
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="color" className="text-sm text-muted-foreground">Color</Label>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-8 text-sm"
              maxLength={30}
              placeholder="Enter color"
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8" 
              onClick={handleSaveColor}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm">{powderCoat.color || 'Not specified'}</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {powderCoat.eta && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Expected Completion</span>
          <span className="text-sm">{new Date(powderCoat.eta).toLocaleDateString()}</span>
        </div>
      )}
      
      {powderCoat.notes && (
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">Notes</span>
          <p className="text-sm mt-1">{powderCoat.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PowderCoatCard;
