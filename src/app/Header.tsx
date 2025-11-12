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
      <nav className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link href="/notebooks" className="hover:underline">
              Notebooks
            </Link>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <Link href="/logout" className="hover:underline">
              Logout
            </Link>
          </>
        ) : (
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
