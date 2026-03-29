export type CardType = 'recipe' | 'meeting' | 'note' | 'reference' | 'default';

export interface CardMeta {
  id: string;
  type: CardType;
  title: string;
  created: string;
  tags: string[];
  pinned: boolean;
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
