import type { Card, DemoOverlayV1 } from './types';
import { serializeCardToMarkdown } from './serializeCardMarkdown';

export function getDemoEditorSource(card: Card, overlay: DemoOverlayV1): string {
  if (card.relativePath.startsWith('__demo__/')) {
    const vf = overlay.virtualFiles.find(v => v.relativePath === card.relativePath);
    if (vf) return vf.raw;
  }
  const override = overlay.contentByCardId[card.id];
  if (override) return override;
  return serializeCardToMarkdown(card);
}
