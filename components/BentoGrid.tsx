'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6", className)}>
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  );
}

export function BentoItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      layout
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}
