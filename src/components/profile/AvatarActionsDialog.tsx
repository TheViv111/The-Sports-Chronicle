import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, UploadCloud } from 'lucide-react';

interface AvatarActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onView: () => void;
  onChange: () => void;
}

const AvatarActionsDialog: React.FC<AvatarActionsDialogProps> = ({ isOpen, onClose, onView, onChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avatar Options</DialogTitle>
          <DialogDescription>
            What would you like to do with your avatar?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={() => { onView(); onClose(); }} className="w-full">
            <Image className="mr-2 h-4 w-4" /> View Picture
          </Button>
          <Button onClick={() => { onChange(); onClose(); }} variant="outline" className="w-full">
            <UploadCloud className="mr-2 h-4 w-4" /> Change Picture
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarActionsDialog;