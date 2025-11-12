"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  sourceId: string;
  notebookId: string;
  status: string;
};

export default function ProcessButton({ sourceId, status }: Props) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleProcess = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/sources/${sourceId}/process`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process source");
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      alert(
        `Failed to process source: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setPending(false);
    }
  };

  if (status === "ready") {
    return (
      <button
        type="button"
        onClick={handleProcess}
        disabled={pending}
        className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {pending ? "Reprocessing..." : "Reprocess"}
      </button>
    );
  }

  if (status === "processing") {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Processing...
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        type="button"
        onClick={handleProcess}
        disabled={pending}
        className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900"
      >
        {pending ? "Retrying..." : "Retry Processing"}
      </button>
    );
  }

  return null;
}
