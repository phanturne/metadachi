import type { SourceSummary } from "@/lib/types/notebooks";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeleteSourceButton from "./_components/DeleteSourceButton";
import ProcessButton from "./_components/ProcessButton";

type Props = {
  params: Promise<{ id: string; sourceId: string }>;
};

export default async function SourceDetailPage({ params }: Props) {
  const { id, sourceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify notebook exists and user has access
  const { data: notebook, error: notebookError } = await supabase
    .from("notebooks")
    .select("user_id, visibility")
    .eq("id", id)
    .single();

  if (notebookError || !notebook) {
    notFound();
  }

  // Check access
  if (notebook.user_id !== user?.id && notebook.visibility !== "public") {
    redirect("/notebooks");
  }

  // Fetch source
  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("*")
    .eq("id", sourceId)
    .eq("notebook_id", id)
    .single();

  if (sourceError || !source) {
    notFound();
  }

  // Fetch summary if available
  const { data: summary } = await supabase
    .from("source_summaries")
    .select("*")
    .eq("source_id", sourceId)
    .single();

  const isOwner = notebook.user_id === user?.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/notebooks/${id}`}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to notebook
        </Link>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {source.title}
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {source.source_type}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                source.status === "ready"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : source.status === "processing"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {source.status}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Created {new Date(source.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <ProcessButton
              sourceId={sourceId}
              notebookId={id}
              status={source.status}
            />
            <DeleteSourceButton notebookId={id} sourceId={sourceId} />
          </div>
        )}
      </div>

      {summary && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Summary
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {(summary as SourceSummary).summary}
          </p>
          {(summary as SourceSummary).key_points.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Key Points
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {(summary as SourceSummary).key_points.map((point, index) => (
                  <li key={`${source.id}-point-${index}`}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Content
        </h2>
        {source.content ? (
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {source.content}
            </pre>
          </div>
        ) : source.source_url ? (
          <div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              URL Source:
            </p>
            <a
              href={source.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {source.source_url}
            </a>
          </div>
        ) : source.file_path ? (
          <div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              File: {source.file_path}
            </p>
            {source.file_type && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Type: {source.file_type}
              </p>
            )}
            {source.file_size && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Size: {(source.file_size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No content available. Source is still processing.
          </p>
        )}
      </div>
    </div>
  );
}
