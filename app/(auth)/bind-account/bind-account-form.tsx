'use client';

import { bindAccountAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export default function BindAccountForm({ params }: { params: Message }) {
  return (
    <div className="flex w-full max-w-md flex-col">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Bind Your Account</h1>
        <p className="text-foreground/60 mt-3 text-base">
          Add an email and password to convert your guest account to a permanent account
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Bind Account Form */}
        <form className="flex flex-col gap-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                type="password"
                name="password"
                placeholder="Create a password"
                className="h-11"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className="h-11"
                minLength={6}
                required
              />
            </div>
          </div>

          <SubmitButton
            formAction={bindAccountAction}
            pendingText="Binding Account..."
            className="h-11 rounded-xl text-sm font-medium"
          >
            Bind Account
          </SubmitButton>

          <FormMessage message={params} />
        </form>

        {/* Footer */}
        <div className="mt-auto text-center">
          <p className="text-foreground/60 text-sm">
            Don&apos;t have an account?{' '}
            <Link className="text-primary font-medium hover:underline" href={ROUTES.REGISTER}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
