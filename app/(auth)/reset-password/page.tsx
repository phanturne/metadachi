import { resetPasswordAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) as Message;
  return (
    <form className="flex w-full max-w-md flex-col gap-2 p-4 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-foreground/60 text-sm">Please enter your new password below.</p>
      <Label htmlFor="password">New password</Label>
      <Input type="password" name="password" placeholder="New password" required />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input type="password" name="confirmPassword" placeholder="Confirm password" required />
      <SubmitButton formAction={resetPasswordAction}>Reset password</SubmitButton>
      <FormMessage message={params} />
    </form>
  );
}
