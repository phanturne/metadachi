'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotebookCreated?: () => void;
}

export function NotebookModal({ isOpen, onClose, onNotebookCreated }: NotebookModalProps) {
  const { user, createAnonymousAccount } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC' | 'SHARED'>('PRIVATE');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        try {
          await createAnonymousAccount();
          setIsGuest(true);
          toast.info(
            "We've created a temporary guest account to save your notebooks. Add an email to keep them forever!",
            {
              duration: 5000,
            }
          );
        } catch (error) {
          console.error('Error creating guest account:', error);
          toast.error('Failed to create guest account. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Get the current user from the auth context
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('notebooks').insert({
        title,
        description,
        visibility,
        user_id: currentUser.id,
        is_featured: false,
        featured_at: null,
      });

      if (error) throw error;

      toast.success('Notebook created successfully');
      onNotebookCreated?.();
      onClose();
      setTitle('');
      setDescription('');
      setVisibility('PRIVATE');
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error('Failed to create notebook');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Notebook</DialogTitle>
          <DialogDescription>
            Create a new notebook to organize your sources and insights.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter notebook title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter notebook description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value: 'PRIVATE' | 'PUBLIC' | 'SHARED') => setVisibility(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="SHARED">Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isGuest && (
              <div className="text-muted-foreground text-sm">
                <p>Your notebooks are saved securely with a guest account.</p>
                <p className="mt-1">
                  <a href="/auth/signup" className="text-primary hover:underline">
                    Sign up
                  </a>{' '}
                  to access them anytime.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Notebook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
