'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  columns?: number;
}

export function BentoGrid({ children, className, columns = 3 }: BentoGridProps) {
  return (
    <div
      className={cn('grid gap-6', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

export function BentoItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={cn("h-full", className)}>
      {children}
    </motion.div>
  );
}
