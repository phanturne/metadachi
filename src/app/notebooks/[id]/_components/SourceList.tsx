import type { Source } from "@/lib/types/notebooks";
import SourceCard from "./SourceCard";

type Props = {
  sources: Source[];
  notebookId: string;
};

export default function SourceList({ sources, notebookId }: Props) {
  if (sources.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          No sources yet. Add your first source to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sources.map((source) => (
        <SourceCard key={source.id} source={source} notebookId={notebookId} />
      ))}
    </div>
  );
}
