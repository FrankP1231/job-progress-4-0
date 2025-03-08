
import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onDelete: () => Promise<void> | void;
  triggerClassName?: string;
  isDeleting?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  title,
  description,
  onDelete,
  triggerClassName,
  isDeleting = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleDelete = async () => {
    await onDelete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 text-destructive hover:bg-destructive/10 ${triggerClassName}`}
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
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

export default DeleteConfirmDialog;
