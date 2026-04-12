import { cardFromRawMarkdown } from './cardFromMarkdown';
import type { Card, DemoOverlayV1, VaultConfig } from './types';

function applyPinFavorite(
  card: Card,
  overlay: DemoOverlayV1
): Card {
  const pf = overlay.pinFavoriteById[card.id];
  if (!pf) return card;
  return {
    ...card,
    pinned: pf.pinned ?? card.pinned,
    favorite: pf.favorite ?? card.favorite,
  };
}

export function mergeDemoOverlay(
  baselineCards: Card[],
  overlay: DemoOverlayV1,
  config: VaultConfig
): Card[] {
  const tomb = new Set(overlay.tombstonedIds);
  const mergedBase = baselineCards
    .filter(c => !tomb.has(c.id))
    .map(card => {
      const renamed = overlay.renamedByCardId[card.id];
      let next: Card = renamed ? { ...card, relativePath: renamed, filePath: renamed } : { ...card };

      const raw = overlay.contentByCardId[card.id];
      if (raw) {
        const parsed = cardFromRawMarkdown(raw, next.relativePath, config);
        if (parsed) {
          next = {
            ...parsed,
            id: card.id,
            filePath: next.filePath,
            relativePath: next.relativePath,
          };
        }
      }
      return applyPinFavorite(next, overlay);
    });

  const virtual: Card[] = [];
  for (const vf of overlay.virtualFiles) {
    const parsed = cardFromRawMarkdown(vf.raw, vf.relativePath, config);
    if (!parsed) continue;
    virtual.push(applyPinFavorite(parsed, overlay));
  }

  return [...mergedBase, ...virtual];
}
