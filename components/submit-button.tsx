'use client';

import { useFormStatus } from 'react-dom';
import { LoaderIcon } from '@/components/icons';
import { Button } from './ui/button';
import type { ComponentProps } from 'react';

export function SubmitButton({
  children,
  pendingText = 'Submitting...',
  ...props
}: ComponentProps<typeof Button> & {
  children: React.ReactNode;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending}
      disabled={pending}
      {...props}
      className="relative"
    >
      {pending ? pendingText : children}

      {pending && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending ? pendingText : 'Submit form'}
      </output>
    </Button>
  );
}
