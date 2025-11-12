import type { Source } from "@/lib/types/notebooks";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "./_components/DeleteButton";
import SourceList from "./_components/SourceList";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NotebookDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notebook, error: notebookError } = await supabase
    .from("notebooks")
    .select("*")
    .eq("id", id)
    .single();

  if (notebookError || !notebook) {
    notFound();
  }

  // Check if user has access (owner or public)
  if (notebook.user_id !== user?.id && notebook.visibility !== "public") {
    redirect("/notebooks");
  }

  const { data: sources, error: sourcesError } = await supabase
    .from("sources")
    .select("*")
    .eq("notebook_id", id)
    .order("created_at", { ascending: false });

  if (sourcesError) {
    throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
  }

  const isOwner = notebook.user_id === user?.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/notebooks"
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to notebooks
        </Link>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {notebook.title}
          </h1>
          {notebook.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {notebook.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                notebook.visibility === "public"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {notebook.visibility}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Created {new Date(notebook.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/notebooks/${id}/edit`}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Edit
            </Link>
            <Link
              href={`/notebooks/${id}/sources/new`}
              className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Add Source
            </Link>
            <DeleteButton notebookId={id} />
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Sources ({sources?.length || 0})
        </h2>
        <SourceList sources={(sources as Source[]) || []} notebookId={id} />
      </div>
    </div>
  );
}
