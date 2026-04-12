/**
 * Stable id from a vault-relative path (preferred) or any path string.
 * Normalizes `\\` to `/` first so Windows `path.relative` output matches POSIX-style paths.
 * Must match `lib/vault.ts` parseFile (when frontmatter has no `id`) and `lib/cardFromMarkdown.ts`.
 */
export function generateIdFromPath(pathStr: string): string {
  const posix = pathStr.replace(/\\/g, '/');
  return posix.replace(/[^a-zA-Z0-9]/g, '_');
}
