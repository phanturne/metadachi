'use client';

import { signUpAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function RegisterPage({ searchParams }: PageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [params, setParams] = useState<Message | null>(null);

  useEffect(() => {
    // Handle async searchParams
    searchParams.then(resolvedParams => {
      setParams(resolvedParams as Message);
    });
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      router.push(ROUTES.HOME);
    }
  }, [user, router]);

  return (
    <form className="bg-card flex flex-col gap-6 rounded-lg p-8 shadow-lg">
      <h1 className="text-center text-3xl font-semibold">Sign up</h1>
      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link className="text-primary font-medium underline" href={ROUTES.LOGIN}>
          Sign in
        </Link>
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <Label htmlFor="password">Password</Label>
        <Input type="password" name="password" placeholder="Your password" minLength={6} required />
        <SubmitButton formAction={signUpAction} pendingText="Signing up...">
          Sign up
        </SubmitButton>
        {params && <FormMessage message={params} />}
      </div>
    </form>
  );
}
