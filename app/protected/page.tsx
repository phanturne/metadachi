import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Routes } from "@/utils/constants";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(Routes.SIGN_IN);
  }

  return (
    <div className="flex items-center gap-3 rounded-md bg-accent p-3 px-5 text-sm text-foreground">
      <InfoIcon size="16" strokeWidth={2} />
      This is a protected page that you can only see as an authenticated user
    </div>
  );
}
