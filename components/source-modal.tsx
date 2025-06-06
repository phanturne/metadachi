'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { SourceInput, SourceInput as SourceInputType } from './source-input';

interface SourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceSubmit: (source: SourceInputType) => Promise<void>;
  isSubmitting?: boolean;
}

export function SourceModal({
  open,
  onOpenChange,
  onSourceSubmit,
  isSubmitting = false,
}: SourceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[600px]">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b p-6 pb-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">Add Source</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Add a text, URL, or file to your library.
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <SourceInput onSourceSubmit={onSourceSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
