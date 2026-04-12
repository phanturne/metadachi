import path from 'path';

/**
 * Resolve a vault-relative markdown path to an absolute path under `vaultRoot`.
 * Rejects traversal, `.metadachi`, and non-`.md` targets.
 */
export function resolveSafeVaultMarkdownPath(vaultRoot: string, relativePath: string): string | null {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) return null;
  const segments = normalized.split('/').filter(Boolean);
  if (segments.some(s => s === '..')) return null;
  if (segments.includes('.metadachi')) return null;
  if (!normalized.endsWith('.md')) return null;

  const joined = path.join(vaultRoot, ...segments);
  const resolved = path.resolve(joined);
  const rootResolved = path.resolve(vaultRoot);
  const relToRoot = path.relative(rootResolved, resolved);
  if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) return null;
  return resolved;
}
