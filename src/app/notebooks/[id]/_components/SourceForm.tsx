"use client";

import type { Source } from "@/lib/types/notebooks";
import { useState } from "react";

type Props = {
  notebookId: string;
  source?: Source;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
};

export default function SourceForm({
  notebookId,
  source,
  onSubmit,
  onCancel,
}: Props) {
  const [pending, setPending] = useState(false);
  const [sourceType, setSourceType] = useState<"text" | "file" | "url">(
    (source?.source_type as "text" | "file" | "url") || "text",
  );

  return (
    <form
      action={async (formData: FormData) => {
        formData.set("notebook_id", notebookId);
        setPending(true);
        try {
          await onSubmit(formData);
        } finally {
          setPending(false);
        }
      }}
      className="space-y-6"
    >
      <input type="hidden" name="notebook_id" value={notebookId} />

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
          defaultValue={source?.title}
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Enter source title"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="source_type"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Source Type *
        </label>
        <select
          id="source_type"
          name="source_type"
          value={sourceType}
          onChange={(e) =>
            setSourceType(e.target.value as "text" | "file" | "url")
          }
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="text">Text</option>
          <option value="file">File</option>
          <option value="url">URL</option>
        </select>
      </div>

      {sourceType === "text" && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="content"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            rows={8}
            required={sourceType === "text"}
            defaultValue={source?.content || ""}
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Enter source content"
          />
        </div>
      )}

      {sourceType === "url" && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="source_url"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            URL *
          </label>
          <input
            id="source_url"
            name="source_url"
            type="url"
            required={sourceType === "url"}
            defaultValue={source?.source_url || ""}
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="https://example.com"
          />
        </div>
      )}

      {sourceType === "file" && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="file"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            File *
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required={sourceType === "file"}
            className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            File upload will be handled separately via storage API
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Saving..." : source ? "Update Source" : "Create Source"}
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
