'use client';

import { Loader } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

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
        <span className="absolute right-4 animate-spin">
          <Loader />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending ? pendingText : 'Submit form'}
      </output>
    </Button>
  );
}
