'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVault } from '@/hooks/useVault';
import { Globe, User, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

interface VaultConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VaultConfigModal({ open, onOpenChange }: VaultConfigModalProps) {
  const { config, saveVaultConfig } = useVault();
  const supabase = createClient();
  const [handle, setHandle] = useState('');
  const [hubUrl, setHubUrl] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'view' | 'login'>('view');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // BRIDGE: Send the session to the server to persist it in .metadachi/session.json
      if (data.session) {
        await fetch('/api/auth/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.session),
        });
      }

      setAuthMode('view');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
        
        <div className="grid gap-6 py-4">
          {/* Auth Section */}
          <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Hub Authentication
            </h3>
            
            {session ? (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                  Signed in as <span className="text-foreground font-medium">{session.user.email}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleSignOut}>
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out from Hub
                </Button>
              </div>
            ) : authMode === 'view' ? (
              <div className="space-y-3 text-center py-2">
                <p className="text-xs text-muted-foreground">
                  You must be signed in to sync your published cards to the hub.
                </p>
                <Button size="sm" className="w-full gap-2" onClick={() => setAuthMode('login')}>
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In to Community
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="h-8 text-xs"
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => setAuthMode('view')}>
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1 text-xs" onClick={handleSignIn} disabled={isAuthLoading}>
                    {isAuthLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4">
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
