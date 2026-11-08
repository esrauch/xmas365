/**
 * Shared types and helpers for the 6 Clauses of the XMAS365™ Merger Contract.
 *
 * Each clause (`C1`–`C6`) is a 29-panel gauntlet of a single puzzle genre:
 * - Panel 0 (`base`, 1 panel): Plain base game with no gimmicks.
 * - Panels 1–6 (`intro`, 6 panels): Trivial teaching boards (one per gimmick in
 *   canonical order) that re-explain how that gimmick works in this genre.
 * - Panels 7–12 (`solo`, 6 panels): Nontrivial single-gimmick puzzles (`easy`/`medium`).
 * - Panels 13–27 (`duo`, 15 panels): All 15 two-gimmick combinations (`0 <= i < j < 6`).
 * - Panel 28 (`all6`, 1 panel): Boss puzzle combining all 6 gimmicks at once.
 */

export type ClauseGenre = 'webs' | 'carving' | 'lights' | 'words' | 'hops' | 'pictures';

export type ClauseId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type ClauseSection = 'base' | 'intro' | 'solo' | 'duo' | 'all6';

export const CLAUSE_PANEL_COUNT = 29;

export const CLAUSE_GENRES: readonly ClauseGenre[] = [
  'webs',
  'carving',
  'lights',
  'words',
  'hops',
  'pictures',
] as const;

export interface GimmickMeta {
  /** Gimmick key in this genre's `TWISTS` array (e.g., `'dark'`, `'snow'`). */
  key: string;
  /** Holiday icon emoji. */
  icon: string;
  /** Short holiday gimmick badge label (e.g., `'Spooky'`, `'Love Letters'`). */
  label: string;
  /** Concise 1-sentence explanation of how this gimmick works in this genre. */
  rule: string;
}

export interface ClausePanelItem<P = unknown> {
  /** Display name of the panel. */
  name: string;
  /** Stage within the 29-panel clause gauntlet. */
  section: ClauseSection;
  /** Active gimmick keys on this panel (in canonical `gimmickOrder`). */
  twists: readonly string[];
  /** Concise header micro-rule pill. */
  tip: string;
  /** 1–2 sentence explanation shown in the Gimmick Banner above the board. */
  explain: string;
  /** Underlying genre `Panel` definition. */
  panel: P;
}

export interface ClauseDef<P = unknown> {
  /** 0-based index (`0..5`). */
  clauseIndex: number;
  /** Contract clause identifier (`'C1'..'C6'`). */
  id: ClauseId;
  /** Puzzle genre key. */
  genre: ClauseGenre;
  /** Display title (e.g., `'Clause I: Halloween · Spiderwebs'`). */
  title: string;
  /** Short genre name (e.g., `'Spiderwebs'`). */
  genreTitle: string;
  /** Holiday icon emoji. */
  icon: string;
  /** Primary accent color hex. */
  accent: string;
  /** Canonical order of the 6 gimmicks in this genre. */
  gimmickOrder: readonly string[];
  /** Metadata for each of the 6 gimmicks in `gimmickOrder`. */
  gimmicks: readonly GimmickMeta[];
  /** Exactly 29 panels: 1 base + 6 intro + 6 solo + 15 duo + 1 all6. */
  panels: readonly ClausePanelItem<P>[];
}

/**
 * Return all $\binom{n}{2}$ pairs `[items[i], items[j]]` with `0 <= i < j < items.length`
 * in deterministic lexicographic index order.
 */
export function pairCombinations<T>(items: readonly T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    if (a === undefined) continue;
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      if (b === undefined) continue;
      pairs.push([a, b]);
    }
  }
  return pairs;
}
