'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVault } from '@/hooks/useVault';
import { Globe, User } from 'lucide-react';

interface VaultConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VaultConfigModal({ open, onOpenChange }: VaultConfigModalProps) {
  const { config, saveVaultConfig } = useVault();
  const [handle, setHandle] = useState('');
  const [hubUrl, setHubUrl] = useState('');

  useEffect(() => {
    if (config) {
      setHandle(config.authorHandle || '');
      setHubUrl(config.hubUrl || 'https://hub.metadachi.com');
    }
  }, [config, open]);

  const handleSave = () => {
    if (!config) return;
    saveVaultConfig({
      ...config,
      authorHandle: handle,
      hubUrl: hubUrl,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Community Settings</DialogTitle>
          <DialogDescription>
            Configure your community profile and where your published cards are synced.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="handle" className="text-sm font-medium leading-none flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Author Handle
            </label>
            <Input
              id="handle"
              placeholder="@username"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
            <p className="text-[0.7rem] text-muted-foreground">
              Your unique username on the Metadachi Hub.
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="hubUrl" className="text-sm font-medium leading-none flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Hub URL
            </label>
            <Input
              id="hubUrl"
              placeholder="https://hub.metadachi.com"
              value={hubUrl}
              onChange={(e) => setHubUrl(e.target.value)}
            />
            <p className="text-[0.7rem] text-muted-foreground">
              The central platform where your notes are published.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
