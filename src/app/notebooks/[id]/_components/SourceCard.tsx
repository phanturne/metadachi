import type { Source } from "@/lib/types/notebooks";
import Link from "next/link";

type Props = {
  source: Source;
  notebookId: string;
};

export default function SourceCard({ source, notebookId }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "file":
        return "📄";
      case "url":
        return "🔗";
      default:
        return "📝";
    }
  };

  return (
    <Link
      href={`/notebooks/${notebookId}/sources/${source.id}`}
      className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(source.source_type)}</span>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {source.title}
            </h3>
          </div>
          {source.content && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {source.content.substring(0, 150)}
              {source.content.length > 150 ? "..." : ""}
            </p>
          )}
          {source.source_url && (
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 truncate">
              {source.source_url}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
            <span
              className={`rounded-full px-2 py-1 ${getStatusColor(source.status)}`}
            >
              {source.status}
            </span>
            <span className="capitalize">{source.source_type}</span>
            <span>{new Date(source.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
