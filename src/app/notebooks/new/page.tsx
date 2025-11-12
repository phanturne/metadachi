import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NotebookForm from "../_components/NotebookForm";
import { createNotebook } from "../actions";

export default async function NewNotebookPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Create New Notebook
      </h1>
      <NotebookForm onSubmit={createNotebook} />
    </div>
  );
}
