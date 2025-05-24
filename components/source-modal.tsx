"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog"
import { SourceInput, SourceInput as SourceInputType } from "./source-input"

interface SourceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSourceSubmit: (source: SourceInputType) => Promise<void>
  isSubmitting?: boolean
}

export function SourceModal({
  open,
  onOpenChange,
  onSourceSubmit,
  isSubmitting = false,
}: SourceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-6 pb-4 border-b">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                Add Source
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Add a text, URL, or file to your library.
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <SourceInput
              onSourceSubmit={onSourceSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 