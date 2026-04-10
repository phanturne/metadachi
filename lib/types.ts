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
  filePath: string;
}

export interface VaultFile {
  path: string;
  meta: CardMeta;
  rawContent: string;
}
