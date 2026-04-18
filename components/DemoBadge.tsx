'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVault } from '@/hooks/useVault';
import { getVaultMode } from '@/lib/vaultMode';
import { FlaskConical, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export function DemoBadge() {
  const { capabilities, resetDemoOverlay } = useVault();
  const [open, setOpen] = useState(false);

  if (getVaultMode() !== 'demo') return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="cursor-pointer"
        aria-expanded={open}
        aria-label="Open demo mode options"
      >
          <Badge
            variant="secondary"
            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            Demo Mode
          </Badge>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium">Demo mode options</p>
          <p className="mb-3 text-xs text-muted-foreground">Actions here only affect your browser-local demo data.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-1"
              onClick={() => {
                void resetDemoOverlay();
                setOpen(false);
              }}
              disabled={!capabilities.canResetOverlay}
            >
              <RotateCcw className="size-3.5" />
              Reset local overlay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
