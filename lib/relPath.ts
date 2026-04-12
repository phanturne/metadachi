/** Browser-safe vault-relative path helpers (no `path` import). */

export function dirnameRel(rel: string): string {
  const i = rel.lastIndexOf('/');
  return i === -1 ? '' : rel.slice(0, i);
}

export function basenameRel(rel: string): string {
  const i = rel.lastIndexOf('/');
  return i === -1 ? rel : rel.slice(i + 1);
}

export function joinRel(dir: string, name: string): string {
  if (!dir) return name;
  return `${dir.replace(/\/+$/, '')}/${name}`;
}
