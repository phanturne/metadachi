import { z } from "zod";

export const createSourceSchema = z
  .object({
    notebook_id: z.string().uuid("Invalid notebook ID"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    source_type: z.enum(["text", "file", "url"]).default("text"),
    content: z
      .union([z.string(), z.null()])
      .transform((val) => (val === null || val === "" ? undefined : val))
      .optional(),
    source_url: z
      .union([z.string(), z.null()])
      .transform((val) => (val === null || val === "" ? undefined : val))
      .optional(),
    file_path: z
      .union([z.string(), z.null()])
      .transform((val) => (val === null || val === "" ? undefined : val))
      .optional(),
    file_type: z
      .union([z.string(), z.null()])
      .transform((val) => (val === null || val === "" ? undefined : val))
      .optional(),
    file_size: z
      .union([z.number().positive(), z.null()])
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    metadata: z
      .union([z.record(z.string(), z.unknown()), z.null()])
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.source_type === "text") {
      if (
        data.content === undefined ||
        typeof data.content !== "string" ||
        data.content.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["content"],
          message: "Content is required for text sources",
        });
      }
    }
    if (data.source_type === "url") {
      if (
        data.source_url === undefined ||
        typeof data.source_url !== "string" ||
        data.source_url.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source_url"],
          message: "URL is required for URL sources",
        });
      } else {
        // Validate URL format
        try {
          new URL(data.source_url);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["source_url"],
            message: "Invalid URL format",
          });
        }
      }
    }
    if (data.source_type === "file") {
      if (
        data.file_path === undefined ||
        typeof data.file_path !== "string" ||
        data.file_path.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["file_path"],
          message: "File path is required for file sources",
        });
      }
    }
  });

export const updateSourceSchema = createSourceSchema.partial().extend({
  notebook_id: z.string().uuid().optional(),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
