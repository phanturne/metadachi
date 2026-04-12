import { CardType, VaultConfig } from './types';

export function inferCardType(
  relativePath: string,
  content: string,
  frontmatter: Record<string, unknown>,
  config: VaultConfig
): CardType {
  if (frontmatter.type && typeof frontmatter.type === 'string') {
    return frontmatter.type;
  }
  if (config.types) {
    for (const t of config.types) {
      if (
        t.inferFromPath &&
        (relativePath.startsWith(t.inferFromPath) || relativePath.includes('/' + t.inferFromPath))
      ) {
        return t.id;
      }
      if (t.inferFromContent && content.includes(t.inferFromContent)) {
        return t.id;
      }
    }
  }
  return 'default';
}
