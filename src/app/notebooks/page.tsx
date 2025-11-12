import type { Notebook } from "@/lib/types/notebooks";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import NotebookCard from "./_components/NotebookCard";

export default async function NotebooksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notebooks, error } = await supabase
    .from("notebooks")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch notebooks: ${error.message}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Notebooks
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your notebooks and sources
          </p>
        </div>
        <Link
          href="/notebooks/new"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          New Notebook
        </Link>
      </div>

      {notebooks && notebooks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notebooks.map((notebook) => (
            <NotebookCard key={notebook.id} notebook={notebook as Notebook} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No notebooks yet. Create your first notebook to get started.
          </p>
          <Link
            href="/notebooks/new"
            className="mt-4 inline-block rounded bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Create Notebook
          </Link>
        </div>
      )}
    </div>
  );
}
