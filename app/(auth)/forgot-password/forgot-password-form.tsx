'use client';

import { forgotPasswordAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export default function ForgotPasswordForm({ params }: { params: Message }) {
  return (
    <div className="flex w-full max-w-md flex-col">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-foreground/60 mt-3 text-base">
          Enter your email address and we&apos;ll send you a link to reset your password
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Reset Password Form */}
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
          </div>

          <SubmitButton
            formAction={forgotPasswordAction}
            className="h-11 rounded-xl text-sm font-medium"
          >
            Send Reset Link
          </SubmitButton>

          <FormMessage message={params} />
        </form>

        {/* Footer */}
        <div className="mt-auto text-center">
          <p className="text-foreground/60 text-sm">
            Remember your password?{' '}
            <Link className="text-primary font-medium hover:underline" href={ROUTES.LOGIN}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
