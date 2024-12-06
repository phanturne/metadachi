import AuthLayout from "../layout";
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Routes } from "@/utils/constants";
import Link from "next/link";

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <AuthLayout>
      <form className="flex flex-col gap-6">
        <div>
          <h1 className="text-center text-3xl font-semibold">Reset Password</h1>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link className="text-primary underline" href={Routes.SIGN_IN}>
              Sign in
            </Link>
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </AuthLayout>
  );
}
