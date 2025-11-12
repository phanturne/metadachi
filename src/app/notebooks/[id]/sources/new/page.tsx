import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SourceForm from "../../_components/SourceForm";
import { createSource } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewSourcePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify notebook exists and user is owner
  const { data: notebook, error: notebookError } = await supabase
    .from("notebooks")
    .select("user_id")
    .eq("id", id)
    .single();

  if (notebookError || !notebook) {
    notFound();
  }

  if (notebook.user_id !== user.id) {
    redirect(`/notebooks/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/notebooks/${id}`}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to notebook
        </Link>
      </div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Add New Source
      </h1>
      <SourceForm notebookId={id} onSubmit={createSource} />
    </div>
  );
}
