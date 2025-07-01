import { FormMessage, type Message } from '@/components/form/form-message';
import BindAccountForm from './bind-account-form';

export default async function BindAccountPage({
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
        <BindAccountForm params={params} />
      )}
    </>
  );
}
