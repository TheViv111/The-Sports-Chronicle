import React, { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LogoLoader from '@/components/common/LogoLoader';

interface ImageUploaderProps {
  name: string;
  label: string;
  placeholder: string;
  onImageUploaded?: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  name,
  label,
  placeholder,
  onImageUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { setValue, watch } = useFormContext();
  const imageUrl = watch(name);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file type
      if (!file.type.match('image.*')) {
        toast.error('Please upload an image file');
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      try {
        setIsUploading(true);

        // Generate a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `blog-images/${fileName}`;

        // Upload the file
        const { data, error: uploadError } = await supabase.storage
          .from('blog-assets')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-assets')
          .getPublicUrl(data.path);

        // Update the form field
        setValue(name, publicUrl, { shouldValidate: true });
        onImageUploaded?.(publicUrl);

        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    },
    [name, onImageUploaded, setValue]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={name}
          name={name}
          value={imageUrl || ''}
          onChange={(e) => setValue(name, e.target.value, { shouldValidate: true })}
          placeholder={placeholder}
          className="flex-1"
        />
        <div className="relative">
          <input
            type="file"
            id={`${name}-file`}
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="whitespace-nowrap"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <LogoLoader size="xs" className="mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
      {imageUrl && (
        <div className="mt-2">
          <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
