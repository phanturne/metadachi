import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import NotebookForm from "../../_components/NotebookForm";
import { updateNotebook } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditNotebookPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notebook, error: notebookError } = await supabase
    .from("notebooks")
    .select("*")
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
        Edit Notebook
      </h1>
      <NotebookForm
        notebook={notebook}
        notebookId={id}
        onSubmit={updateNotebook}
      />
    </div>
  );
}
