'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface LibraryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  initialName: string;
  initialDescription: string;
  initialImageUrl: string | null;
}

export function LibraryEditDialog({
  open,
  onOpenChange,
  id,
  initialName,
  initialDescription,
  initialImageUrl,
}: LibraryEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription || '');
  const [imagePath, setImagePath] = useState<string | null>(initialImageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Reset form when dialog opens with initial values
  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription || '');
      setImagePath(initialImageUrl);
      setImageFile(null);
      setImageChanged(false);
    }
  }, [open, initialName, initialDescription, initialImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageChanged(true);
      // Create a preview URL for the image
      const objectUrl = URL.createObjectURL(file);
      setImagePath(objectUrl);
    }
  };

  const removeImage = () => {
    setImagePath(null);
    setImageFile(null);
    setImageChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Library name is required');
      return;
    }

    setIsLoading(true);

    try {
      // Upload image if one is selected
      let finalImagePath = imagePath;
      if (imageChanged) {
        finalImagePath = imageFile ? await uploadImage(imageFile) : null;
      }

      const response = await fetch(`/api/libraries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          imagePath: finalImagePath,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update library');
      }

      toast.success('Library updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update library');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Library</DialogTitle>
            <DialogDescription>
              Update your library information and cover image.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Research Library"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A collection of papers and notes about my research topic"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Cover Image</Label>
              {imagePath ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
                  <Image
                    src={imagePath}
                    alt="Library cover"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-md cursor-pointer bg-muted/50 hover:bg-muted transition-colors aspect-video"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload a cover image
                  </p>
                </div>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
