import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b">
      <Link href="/" className="font-medium">
        Metadachi
      </Link>
      <nav className="text-sm">
        {user ? (
          <Link href="/logout" className="underline">
            Logout
          </Link>
        ) : (
          <Link href="/login" className="underline">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
