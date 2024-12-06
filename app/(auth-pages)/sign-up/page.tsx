import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Routes } from "@/utils/constants";
import AuthLayout from "../layout";

export default function Signup({ searchParams }: { searchParams: Message }) {
  return (
    <AuthLayout>
      {"message" in searchParams ? (
        <div className="flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md">
          <FormMessage message={searchParams} />
        </div>
      ) : (
        <form className="flex flex-col gap-6 rounded-lg bg-card p-8 shadow-lg">
          <h1 className="text-center text-3xl font-semibold">Sign up</h1>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary underline"
              href={Routes.SIGN_IN}
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
            <FormMessage message={searchParams} />
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
