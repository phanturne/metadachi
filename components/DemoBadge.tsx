'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react'; // use lucide-react eye icon

export function DemoBadge() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(process.env.NEXT_PUBLIC_DEMO_MODE === 'true');
  }, []);

  if (!isDemo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="secondary" className="px-3 py-1.5 shadow-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 backdrop-blur-sm gap-2">
        <Eye className="w-4 h-4" />
        Demo Mode
      </Badge>
    </div>
  );
}
