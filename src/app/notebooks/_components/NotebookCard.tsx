import type { Notebook } from "@/lib/types/notebooks";
import Link from "next/link";

type Props = {
  notebook: Notebook;
};

export default function NotebookCard({ notebook }: Props) {
  return (
    <Link
      href={`/notebooks/${notebook.id}`}
      className="block rounded-lg border border-gray-200 p-6 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {notebook.title}
          </h3>
          {notebook.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {notebook.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <span
              className={`rounded-full px-2 py-1 ${
                notebook.visibility === "public"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {notebook.visibility}
            </span>
            <span>{new Date(notebook.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
