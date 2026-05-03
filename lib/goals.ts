import { Card } from '@/lib/types';

export type GoalStatus = 'todo' | 'doing' | 'done';
export type GoalPriority = 'low' | 'med' | 'high';

export interface NorthStarContent {
  statement: string;
  horizon?: string;
}

export interface GoalItem {
  title: string;
  status: GoalStatus;
  priority?: GoalPriority;
}

export interface GoalsContent {
  sourceCard: Card;
  northStar: NorthStarContent;
  goals: GoalItem[];
}

const SOURCE_FILE_REGEX = /(^|\/)(goals|north-star)\.md$/i;
const SOURCE_TAGS = new Set(['goals', 'north-star', 'northstar']);

function isGoalsSource(card: Card): boolean {
  if (card.type.toLowerCase() === 'goals') return true;
  if (SOURCE_FILE_REGEX.test(card.relativePath)) return true;
  return card.tags.some((tag) => SOURCE_TAGS.has(tag.toLowerCase()));
}

function normalizeStatus(value: unknown): GoalStatus {
  if (typeof value !== 'string') return 'todo';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'done' || normalized === 'completed') return 'done';
  if (normalized === 'doing' || normalized === 'in_progress' || normalized === 'in-progress') return 'doing';
  return 'todo';
}

function normalizePriority(value: unknown): GoalPriority | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  if (normalized === 'med' || normalized === 'medium') return 'med';
  return undefined;
}

function normalizeGoalItem(raw: unknown): GoalItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Record<string, unknown>;
  const title = typeof entry.title === 'string' ? entry.title.trim() : '';
  if (!title) return null;

  const status = normalizeStatus(entry.status);
  return {
    title,
    status,
    priority: normalizePriority(entry.priority),
  };
}

function parseStructuredGoalsPayload(raw: string): { northStar: NorthStarContent; goals: GoalItem[] } | null {
  const codeBlockRegex = /```(?:goals-v1|json)\s*([\s\S]*?)```/gi;
  const matches = raw.matchAll(codeBlockRegex);

  for (const match of matches) {
    const payloadText = match[1]?.trim();
    if (!payloadText) continue;

    try {
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      if (payload.schema !== 'metadachi-goals-v1') continue;

      let northStar: NorthStarContent = { statement: '' };
      if (typeof payload.northStar === 'string') {
        northStar = { statement: payload.northStar.trim() };
      } else {
        const rawNorthStar = (payload.northStar ?? {}) as Record<string, unknown>;
        northStar = {
          statement: typeof rawNorthStar.statement === 'string' ? rawNorthStar.statement.trim() : '',
          horizon: typeof rawNorthStar.horizon === 'string' ? rawNorthStar.horizon.trim() : undefined,
        };
      }

      const goals = Array.isArray(payload.goals)
        ? payload.goals
            .map((goal) => normalizeGoalItem(goal))
            .filter((goal): goal is GoalItem => Boolean(goal))
        : [];

      return { northStar, goals };
    } catch {
      // Ignore invalid JSON blocks and keep looking for a valid structured payload.
    }
  }

  return null;
}

export function extractGoalsContent(cards: Card[]): GoalsContent | null {
  const sourceCard = cards.find(isGoalsSource);
  if (!sourceCard) return null;

  const structured = parseStructuredGoalsPayload(sourceCard.rawContent);
  if (!structured) return null;
  const parsed = structured;
  const hasNorthStar = Boolean(parsed.northStar.statement);
  if (!hasNorthStar && parsed.goals.length === 0) return null;

  return { sourceCard, northStar: parsed.northStar, goals: parsed.goals };
}
