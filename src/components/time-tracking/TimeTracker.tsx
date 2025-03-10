
import React, { useState } from 'react';
import { useTimeTracking } from '@/context/TimeTrackingContext';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogIn, LogOut, Clock, Timer } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const TimeTracker: React.FC = () => {
  const { user } = useAuth();
  const { 
    isClockingIn, 
    isClockingOut, 
    isClockingLoading, 
    currentTimeEntry, 
    clockInHandler, 
    clockOutHandler,
    refreshTimeTracking
  } = useTimeTracking();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
  // If user is not authenticated, don't show anything
  if (!user.isAuthenticated) {
    return null;
  }
  
  const handleClockIn = async () => {
    await clockInHandler();
    // Add a refresh after a short delay to ensure we get the updated status
    setTimeout(() => {
      refreshTimeTracking();
    }, 1000);
  };
  
  const handleOpenClockOutDialog = () => {
    setIsDialogOpen(true);
  };
  
  const handleClockOut = async () => {
    await clockOutHandler(notes);
    setNotes('');
    setIsDialogOpen(false);
    // Add a refresh after a short delay
    setTimeout(() => {
      refreshTimeTracking();
    }, 1000);
  };
  
  const handleCancelClockOut = () => {
    setNotes('');
    setIsDialogOpen(false);
  };
  
  if (isClockingLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <div className="h-4 w-4 rounded-full border-2 border-foreground/30 border-t-transparent animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }
  
  if (currentTimeEntry && !currentTimeEntry.clock_out_time) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenClockOutDialog}
                disabled={isClockingOut}
                className="border-amber-500 text-amber-500 hover:text-amber-600 hover:bg-amber-50 gap-2"
              >
                {isClockingOut ? (
                  <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                ) : (
                  <Timer className="h-4 w-4" />
                )}
                <span>Clocked In</span>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p>Clocked in at {format(new Date(currentTimeEntry.clock_in_time), 'h:mm a')}</p>
                <p className="text-xs text-muted-foreground">Click to clock out</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clock Out</DialogTitle>
              <DialogDescription>
                You've been clocked in since {format(new Date(currentTimeEntry.clock_in_time), 'h:mm a')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="What did you work on?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelClockOut}>
                Cancel
              </Button>
              <Button onClick={handleClockOut} variant="default">
                Clock Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClockIn}
            disabled={isClockingIn}
            className="gap-2"
          >
            {isClockingIn ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary/50 border-t-transparent animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <LogIn className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clock In</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TimeTracker;
