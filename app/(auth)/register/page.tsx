import { signUpAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ROUTES } from '@/utils/constants';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) as Message;
  return (
    <>
      {'message' in params ? (
        <div className="flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md">
          <FormMessage message={params} />
        </div>
      ) : (
        <form className="flex flex-col gap-6 rounded-lg bg-card p-8 shadow-lg">
          <h1 className="text-center text-3xl font-semibold">Sign up</h1>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link
              className="font-medium text-primary underline"
              href={ROUTES.LOGIN}
            >
              Sign in
            </Link>
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="you@example.com" required />
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
            />
            <SubmitButton formAction={signUpAction} pendingText="Signing up...">
              Sign up
            </SubmitButton>
            <FormMessage message={params} />
          </div>
        </form>
      )}
    </>
  );
}
