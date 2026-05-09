/**
 * Simplified Flashcard System
 * Uses manual familiarity levels instead of spaced repetition scheduling
 */

export type FamiliarityLevel = 'new' | 'learning' | 'mastered'

export enum ReviewResponse {
  Again = 'again',
  Hard = 'hard',
  Good = 'good',
  Easy = 'easy',
}

export const FAMILIARITY_LABELS: Record<FamiliarityLevel, string> = {
  new: 'New',
  learning: 'Learning',
  mastered: 'Mastered',
}