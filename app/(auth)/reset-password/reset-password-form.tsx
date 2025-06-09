'use client';

import { resetPasswordAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ResetPasswordParams = Message & {
  token_hash?: string;
};

export default function ResetPasswordForm({ params }: { params: ResetPasswordParams }) {
  return (
    <div className="flex w-full max-w-md flex-col">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-foreground/60 mt-3 text-base">Please enter your new password below</p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Reset Password Form */}
        <form className="flex flex-col gap-5">
          <input type="hidden" name="token_hash" value={params.token_hash} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New password
              </Label>
              <Input
                type="password"
                name="password"
                placeholder="Enter new password"
                className="h-11"
                minLength={6}
                required
              />
              <p className="text-muted-foreground text-xs">Must be at least 6 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                className="h-11"
                minLength={6}
                required
              />
            </div>
          </div>

          <SubmitButton
            formAction={resetPasswordAction}
            className="h-11 rounded-xl text-sm font-medium"
          >
            Reset Password
          </SubmitButton>

          <FormMessage message={params} />
        </form>
      </div>
    </div>
  );
}
