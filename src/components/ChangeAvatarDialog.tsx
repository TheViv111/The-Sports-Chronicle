import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Loader2, UploadCloud, Link as LinkIcon, Save } from 'lucide-react';
import imageCompression from 'browser-image-compression'; // Import the image compression library

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/contexts/TranslationContext';

interface ChangeAvatarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentAvatarUrl: string | null;
  onAvatarChange: (newUrl: string) => void;
}

const urlSchema = z.object({
  avatarUrl: z.string().url({ message: "Please enter a valid URL." }).min(1, { message: "URL cannot be empty." }),
});

const ChangeAvatarDialog: React.FC<ChangeAvatarDialogProps> = ({
  isOpen,
  onClose,
  userId,
  currentAvatarUrl,
  onAvatarChange,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url' | null>(null); // 'file' or 'url'

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      avatarUrl: currentAvatarUrl || '',
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!userId) {
      toast.error("Authentication required to upload avatar.");
      return;
    }
    if (acceptedFiles.length === 0) {
      toast.error("No file selected.");
      return;
    }

    const originalFile = acceptedFiles[0];
    const fileExt = originalFile.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    try {
      // Image compression options
      const options = {
        maxSizeMB: 0.2, // Max file size in MB
        maxWidthOrHeight: 256, // Max width or height in pixels
        useWebWorker: true,
        fileType: 'image/webp', // Convert to webp for better compression
      };

      const compressedFile = await imageCompression(originalFile, options);
      console.log('Original file size:', originalFile.size / 1024 / 1024, 'MB');
      console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, { // Upload the compressed file
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/webp', // Set content type for webp
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onAvatarChange(publicUrl);
      toast.success("Avatar uploaded successfully!");
      onClose();
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
      toast.error("Failed to upload avatar.", {
        description: error.message || "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }, [userId, onAvatarChange, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'], // Add webp to accepted types
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const onSubmitUrl = async (values: z.infer<typeof urlSchema>) => {
    if (!userId) {
      toast.error("Authentication required to update avatar.");
      return;
    }
    setUploading(true);
    try {
      onAvatarChange(values.avatarUrl);
      toast.success("Avatar URL updated successfully!");
      onClose();
    } catch (error: any) {
      console.error('Error updating avatar URL:', error.message);
      toast.error("Failed to update avatar URL.", {
        description: error.message || "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUploadMethod(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Avatar</DialogTitle>
          <DialogDescription>
            Update your profile picture.
          </DialogDescription>
        </DialogHeader>

        {!uploadMethod ? (
          <div className="grid gap-4 py-4">
            <Button onClick={() => setUploadMethod('file')} className="w-full">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload from Device
            </Button>
            <Button onClick={() => setUploadMethod('url')} variant="outline" className="w-full">
              <LinkIcon className="mr-2 h-4 w-4" /> Upload from URL
            </Button>
          </div>
        ) : uploadMethod === 'file' ? (
          <div className="grid gap-4 py-4">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
              {uploading ? (
                <div className="flex items-center text-primary">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </div>
              ) : isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                (JPG, PNG, GIF, WEBP up to 0.2MB, resized to 256x256)
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUrl)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} disabled={uploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setUploadMethod(null)} disabled={uploading}>
                  Back
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save URL
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        
        {uploadMethod && uploadMethod === 'file' && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUploadMethod(null)} disabled={uploading}>
              Back
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAvatarDialog;