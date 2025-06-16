import { cn } from '@/lib/utils';
import * as React from 'react';

const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('inline-flex', className)} {...props} />
  )
);
ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup };
