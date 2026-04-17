export type CardType = string;

export interface TypeConfig {
  id: string;
  label: string;
  inferFromPath?: string;
  inferFromContent?: string;
}

export interface VaultConfig {
  types?: TypeConfig[];
  filterBarOrder?: string[];
}

export interface CardMeta {
  id: string;
  type: CardType;
  title: string;
  created: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
}

export interface Card extends CardMeta {
  rawContent: string;
  /** Absolute path on the server; demo-only virtual cards may use vault-relative path only. */
  filePath: string;
  /** Path relative to vault root (used for tree layout and client-side parsing). */
  relativePath: string;
}

/** Browser-only overlay for demo mode; never sent to the server. */
export interface DemoOverlayV1 {
  schemaVersion: 1;
  pinFavoriteById: Record<string, { pinned?: boolean; favorite?: boolean }>;
  /** Full markdown including frontmatter, keyed by card id. */
  contentByCardId: Record<string, string>;
  virtualFiles: Array<{ relativePath: string; raw: string }>;
  tombstonedIds: string[];
  /** Demo-only: map stable card id → new vault-relative path (rename/move UI). */
  renamedByCardId: Record<string, string>;
}

export interface VaultFile {
  path: string;
  meta: CardMeta;
  rawContent: string;
}
