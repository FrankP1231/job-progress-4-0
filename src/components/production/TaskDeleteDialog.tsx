
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/lib/types';
import { parseTaskName } from '@/utils/taskUtils';

interface TaskDeleteDialogProps {
  taskToDelete: Task | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

const TaskDeleteDialog: React.FC<TaskDeleteDialogProps> = ({
  taskToDelete,
  isDeleting,
  onClose,
  onConfirmDelete
}) => {
  return (
    <Dialog 
      open={taskToDelete !== null} 
      modal={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent 
        className="sm:max-w-[425px]" 
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {taskToDelete && (
          <div className="py-2">
            <p className="font-medium">{parseTaskName(taskToDelete.name)}</p>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClose();
            }}
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onConfirmDelete();
            }}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 rounded-full border-2 border-destructive-foreground border-t-transparent animate-spin" />
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDeleteDialog;
