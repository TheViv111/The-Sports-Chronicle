import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ViewAvatarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
}

const ViewAvatarDialog: React.FC<ViewAvatarDialogProps> = ({ isOpen, onClose, avatarUrl }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 border-none bg-transparent shadow-none">
        <DialogHeader className="absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>
        </DialogHeader>
        <div className="relative w-full h-full flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 bg-muted rounded-lg text-muted-foreground">
              No avatar to display.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAvatarDialog;