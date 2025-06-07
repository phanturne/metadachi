'use client';

import { signInAction } from '@/app/(auth)/actions';
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

export default function LoginPage({ searchParams }: PageProps) {
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
      <h1 className="text-center text-3xl font-semibold">Sign in</h1>
      <p className="text-center text-sm">
        Don&#39;t have an account?{' '}
        <Link className="text-primary font-medium underline" href={ROUTES.REGISTER}>
          Sign up
        </Link>
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link className="text-primary text-xs underline" href={ROUTES.FORGOT_PASSWORD}>
            Forgot Password?
          </Link>
        </div>
        <Input type="password" name="password" placeholder="Your password" required />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        {params && <FormMessage message={params} />}
      </div>
    </form>
  );
}
