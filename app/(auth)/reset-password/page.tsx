import { FormMessage, type Message } from '@/components/form/form-message';
import { ROUTES } from '@/lib/constants';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ResetPasswordForm from './reset-password-form';

type ResetPasswordParams = Message & {
  token_hash?: string;
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) as ResetPasswordParams;
  const supabase = await createClient();

  // Check if we have a valid session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session or no token_hash in the URL, redirect to forgot password
  if (!session || !params.token_hash) {
    redirect(ROUTES.FORGOT_PASSWORD);
  }

  return (
    <>
      {'message' in params ? (
        <div className="flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md">
          <FormMessage message={params} />
        </div>
      ) : (
        <ResetPasswordForm params={params} />
      )}
    </>
  );
}
