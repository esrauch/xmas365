/**
 * Shared types, canonical terminology, and helpers for the 6 Clauses of the
 * XMAS365™ Merger Contract and the 6×6 Holiday Base × Twist system.
 *
 * Each clause (`C1`–`C6`) is a 22-puzzle Run of a single Base:
 * - Puzzles 0–5 (`intro`, 6 puzzles): Reminder puzzles (one per twist in
 *   canonical order) that re-explain how that twist works in this Base.
 * - Puzzles 6–20 (`duo`, 15 puzzles): All 15 Double Twist combinations (`0 <= i < j < 6`).
 * - Puzzle 21 (`all6`, 1 puzzle): Finale puzzle combining all 6 twists at once.
 */

export type ClauseGenre = 'webs' | 'carving' | 'lights' | 'words' | 'hops' | 'pictures';

export type HolidayId =
  'halloween' | 'thanksgiving' | 'christmas' | 'valentines' | 'easter' | 'fourth';

export type ClauseId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type ClauseSection = 'base' | 'intro' | 'solo' | 'duo' | 'all6';

export const CLAUSE_PANEL_COUNT = 22;

export const CLAUSE_GENRES: readonly ClauseGenre[] = [
  'webs',
  'carving',
  'lights',
  'words',
  'hops',
  'pictures',
] as const;

export interface HolidayTermSpec {
  id: HolidayId;
  /** Display holiday name (e.g., `'Halloween'`, `"Valentine's"`). */
  holiday: string;
  /** Holiday icon emoji. */
  icon: string;
  /** Internal generator key (`'webs'`, `'carving'`, etc.). */
  genre: ClauseGenre;
  /** Canonical themed Base name (`'Web'`, `'Carving'`, `'Lights'`, `'Heartstrings'`, `'Hops'`, `'Fireworks'`). */
  baseName: string;
  /** Canonical Twist adjective (`'Spooky'`, `'Portioned'`, `'Snowflake'`, `'Love-Letter'`, `'Egg-Hunt'`, `'Patriotic'`). */
  twistAdjective: string;
}

export const HOLIDAY_TERMS: Record<HolidayId, HolidayTermSpec> = {
  halloween: {
    id: 'halloween',
    holiday: 'Halloween',
    icon: '🎃',
    genre: 'webs',
    baseName: 'Web',
    twistAdjective: 'Spooky',
  },
  thanksgiving: {
    id: 'thanksgiving',
    holiday: 'Thanksgiving',
    icon: '🦃',
    genre: 'carving',
    baseName: 'Carving',
    twistAdjective: 'Portioned',
  },
  christmas: {
    id: 'christmas',
    holiday: 'Christmas',
    icon: '🎄',
    genre: 'lights',
    baseName: 'Lights',
    twistAdjective: 'Snowflake',
  },
  valentines: {
    id: 'valentines',
    holiday: "Valentine's",
    icon: '💌',
    genre: 'words',
    baseName: 'Heartstrings',
    twistAdjective: 'Love-Letter',
  },
  easter: {
    id: 'easter',
    holiday: 'Easter',
    icon: '🐰',
    genre: 'hops',
    baseName: 'Hops',
    twistAdjective: 'Egg-Hunt',
  },
  fourth: {
    id: 'fourth',
    holiday: 'Fourth of July',
    icon: '🎆',
    genre: 'pictures',
    baseName: 'Fireworks',
    twistAdjective: 'Patriotic',
  },
};

export const GENRE_TO_HOLIDAY: Record<ClauseGenre, HolidayId> = {
  webs: 'halloween',
  carving: 'thanksgiving',
  lights: 'christmas',
  words: 'valentines',
  hops: 'easter',
  pictures: 'fourth',
};

/** Map any generator twist key (e.g. `'dark'`, `'letters'`, `'cuts'`, `'slices'`) or `HolidayId` to its `HolidayId`. */
export function twistKeyToHoliday(key: string): HolidayId | undefined {
  if (key in HOLIDAY_TERMS) return key as HolidayId;
  switch (key) {
    case 'dark':
      return 'halloween';
    case 'cuts':
    case 'slices':
    case 'courses':
    case 'portions':
      return 'thanksgiving';
    case 'snow':
      return 'christmas';
    case 'letters':
      return 'valentines';
    case 'eggs':
    case 'basket':
    case 'burrows':
      return 'easter';
    case 'colours':
      return 'fourth';
    default:
      return undefined;
  }
}

/** Map a `(genre, twistHoliday)` pair to that genre's generator twist key. */
export function getGenreTwistKey(genre: ClauseGenre, twistHoliday: HolidayId): string {
  switch (twistHoliday) {
    case 'halloween':
      return 'dark';
    case 'thanksgiving':
      if (genre === 'lights') return 'slices';
      if (genre === 'hops') return 'courses';
      if (genre === 'pictures') return 'portions';
      return 'cuts';
    case 'christmas':
      return 'snow';
    case 'valentines':
      return 'letters';
    case 'easter':
      if (genre === 'carving') return 'basket';
      if (genre === 'hops') return 'burrows';
      return 'eggs';
    case 'fourth':
      return 'colours';
  }
}

export interface PuzzleIdentity {
  baseName: string;
  baseHoliday: string;
  /** Themed name: e.g. `"Web"`, `"Spooky Web"`, `"Love-Letter Portioned Web"`. */
  themedName: string;
  /** Holiday formula: e.g. `"Halloween"`, `"Halloween (Valentine's, Thanksgiving)"`. */
  holidayFormula: string;
  /** Combined dual display: e.g. `"Love-Letter Portioned Web · Halloween (Valentine's, Thanksgiving)"`. */
  dualLabel: string;
}

/**
 * Compute the canonical Dual Display (`themedName`, `holidayFormula`, and `dualLabel`)
 * for any Base (`ClauseGenre` or `HolidayId`) and list of active twist keys / `HolidayId`s.
 */
export function formatPuzzleIdentity(
  base: ClauseGenre | HolidayId,
  twists: readonly string[] = [],
): PuzzleIdentity {
  const baseHolidayId: HolidayId =
    base in HOLIDAY_TERMS ? (base as HolidayId) : GENRE_TO_HOLIDAY[base as ClauseGenre];
  const baseSpec = HOLIDAY_TERMS[baseHolidayId];

  const twistSpecs: HolidayTermSpec[] = [];
  for (const key of twists) {
    const hId = twistKeyToHoliday(key);
    if (hId) {
      twistSpecs.push(HOLIDAY_TERMS[hId]);
    }
  }

  const themedName =
    twistSpecs.length === 0
      ? baseSpec.baseName
      : `${twistSpecs.map((t) => t.twistAdjective).join(' ')} ${baseSpec.baseName}`;

  const holidayFormula =
    twistSpecs.length === 0
      ? baseSpec.holiday
      : `${baseSpec.holiday} (${twistSpecs.map((t) => t.holiday).join(', ')})`;

  return {
    baseName: baseSpec.baseName,
    baseHoliday: baseSpec.holiday,
    themedName,
    holidayFormula,
    dualLabel: `${themedName} · ${holidayFormula}`,
  };
}

export interface TwistMeta {
  /** Twist key in this Base's `TWISTS` array (e.g., `'dark'`, `'snow'`). */
  key: string;
  /** Holiday icon emoji. */
  icon: string;
  /** Canonical Twist adjective label (e.g., `'Spooky'`, `'Love-Letter'`, `'Portioned'`). */
  label: string;
  /** Concise 1-sentence explanation of how this Twist works in this Base. */
  rule: string;
}

export interface ClausePanelItem<P = unknown> {
  /** Display flavor name of the puzzle. */
  name: string;
  /** Stage within the 22-puzzle Clause Run. */
  section: ClauseSection;
  /** Active twist keys on this puzzle (in canonical `twistOrder`). */
  twists: readonly string[];
  /** Concise header micro-rule pill. */
  tip: string;
  /** 1–2 sentence explanation shown on Stage 2 Twist Reminder puzzles. */
  explain: string;
  /** Underlying genre `Panel` definition. */
  panel: P;
}

export interface ClauseDef<P = unknown> {
  /** 0-based index (`0..5`). */
  clauseIndex: number;
  /** Contract clause identifier (`'C1'..'C6'`). */
  id: ClauseId;
  /** Puzzle Base genre key. */
  genre: ClauseGenre;
  /** Display title (e.g., `'Clause I: Halloween · Web'`). */
  title: string;
  /** Canonical Base name (e.g., `'Web'`). */
  genreTitle: string;
  /** Holiday icon emoji. */
  icon: string;
  /** Primary accent color hex. */
  accent: string;
  /** Canonical order of the 6 twists in this Base. */
  twistOrder: readonly string[];
  /** Metadata for each of the 6 twists in `twistOrder`. */
  twistMeta: readonly TwistMeta[];
  /** Exactly 22 puzzles: 6 rule reminders + 15 two-twist pairs + 1 all-twist boss. */
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
