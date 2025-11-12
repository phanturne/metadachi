"use client";

import type { Notebook } from "@/lib/types/notebooks";
import { useState } from "react";

type Props = {
  notebook?: Notebook;
  notebookId?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
};

export default function NotebookForm({
  notebook,
  notebookId,
  onSubmit,
  onCancel,
}: Props) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData: FormData) => {
        if (notebookId) {
          formData.set("notebook_id", notebookId);
        }
        setPending(true);
        try {
          await onSubmit(formData);
        } finally {
          setPending(false);
        }
      }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="title"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={notebook?.title}
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Enter notebook title"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={notebook?.description || ""}
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Enter notebook description"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="visibility"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Visibility
        </label>
        <select
          id="visibility"
          name="visibility"
          defaultValue={notebook?.visibility || "private"}
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending
            ? "Saving..."
            : notebook
              ? "Update Notebook"
              : "Create Notebook"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
