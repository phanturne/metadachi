import { signInAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ROUTES } from '@/utils/constants';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) as Message;
  return (
    <form className="flex flex-col gap-6 rounded-lg bg-card p-8 shadow-lg">
      <h1 className="text-center text-3xl font-semibold">Sign in</h1>
      <p className="text-center text-sm">
        Don&#39;t have an account?{' '}
        <Link
          className="font-medium text-primary underline"
          href={ROUTES.REGISTER}
        >
          Sign up
        </Link>
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-primary underline"
            href={ROUTES.FORGOT_PASSWORD}
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={params} />
      </div>
    </form>
  );
}
