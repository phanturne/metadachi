"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteNotebook } from "../../actions";

type Props = {
  notebookId: string;
};

export default function DeleteButton({ notebookId }: Props) {
  const [pending, setPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setPending(true);
    try {
      await deleteNotebook(notebookId);
      router.push("/notebooks");
    } catch (error) {
      alert(
        `Failed to delete notebook: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setPending(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Deleting..." : "Confirm Delete"}
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          disabled={pending}
          className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900"
    >
      Delete
    </button>
  );
}
