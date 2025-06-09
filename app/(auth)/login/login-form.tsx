'use client';

import { signInAction } from '@/app/(auth)/actions';
import { FormMessage, type Message } from '@/components/form/form-message';
import { SubmitButton } from '@/components/form/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAnonymousAuth } from '@/hooks/use-anonymous-auth';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm({ params }: { params: Message }) {
  const { ensureAuthenticated } = useAnonymousAuth();
  const router = useRouter();

  const handleGuestLogin = async () => {
    try {
      await ensureAuthenticated();
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-foreground/60 mt-3 text-base">
          Sign in to your account or continue as guest
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Guest Login Button */}
        <button
          onClick={handleGuestLogin}
          className="bg-secondary hover:bg-secondary/90 group relative flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:shadow-md"
        >
          <div className="from-primary/20 to-primary/10 absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="relative">Continue as Guest</span>
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">Or continue with</span>
          </div>
        </div>

        {/* Login Form */}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  className="text-primary text-xs hover:underline"
                  href={ROUTES.FORGOT_PASSWORD}
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                className="h-11"
                required
              />
            </div>
          </div>

          <SubmitButton
            formAction={signInAction}
            pendingText="Signing In..."
            className="h-11 rounded-xl text-sm font-medium"
          >
            Sign in
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
