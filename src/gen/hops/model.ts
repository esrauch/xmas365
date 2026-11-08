/**
 * Bunny hops (Easter): Numbrix (Hidato with plain steps). The Easter Bunny hops
 * to a neighbouring spot (up, down, left or right) and lands on every lawn spot
 * of the board exactly once; some eggs are already numbered with their place in
 * the order. Rocks (part of the base game) are squares the bunny can't hop onto:
 * they shrink the lawn, which is the generator's knob for making a board easier.
 *
 * Twists:
 * - courses (Thanksgiving fair shares): the board is outlined in portions, and
 *   the bunny must finish each portion before starting the next;
 * - colours (Fourth of July red, white and blue): a red bunny and a blue bunny,
 *   each starting from its own 1 egg and stepping over its own colour, while
 *   white (plain) squares go to either;
 * - burrows (Easter's own, at home): pairs of holes joined underground, so popping
 *   down one and up the other is a hop of its own;
 * - snowflakes (Christmas): inside a frosty frame, the trail's strokes mirror
 *   across the axis (entering and leaving in a different order, so numbers differ);
 * - letters (Valentine's letters for numbers): some eggs show letters, and the
 *   message's numbered blanks are the steps where those letters lie;
 * - the dark (Halloween): rocks in the shadows — shadowed squares are lawn or
 *   rock, and the last egg gives the route's length.
 */
import type { Frame } from '../core/mirror';

export type Spot = [number, number];
export const key = ([r, c]: Spot): string => `${r},${c}`;

export interface Panel {
  name: string;
  /** The board, row by row: '#' lawn, '.' rock / off-board. */
  rows: string[];
  /** Numbered eggs: [row, column, step] (1-based step along that bunny's route). */
  given: [number, number, number][];
  /** Any tour wins (for learning panels). */
  free?: boolean;
  /** Rocks (base game): squares inside the board the bunny can't hop onto ('.' in `rows`). */
  rocks?: Spot[];
  /** Courses (Thanksgiving fair shares): a letter per spot, row by row. */
  portions?: string[];
  /** Red, white and blue (Fourth of July): 'r' red, 'b' blue (or legacy 'g'), 'w' white (either). */
  colours?: string[];
  /** Burrows (Easter): pairs of spots joined underground. */
  burrows?: [Spot, Spot][];
  /** Snowflakes (Christmas): inside this frame, the trail strokes mirror. */
  frame?: Frame;
  /** Letters for numbers (Valentine's): [row, column, letter]. */
  letters?: [number, number, string][];
  /** The bunny's message: space-separated step numbers where its letters lie, in word order. */
  message?: string;
  /** The word spelled by the message blanks when solved. */
  word?: string;
  /** Explicit step numbers (1-based) where the message letters lie. */
  blanks?: number[];
  /** The dark (Halloween): shadowed squares (each is either lawn '#' or a hidden rock '.' in rows). */
  dark?: Spot[];
  /** The Golden Egg: the last spot. */
  golden?: Spot;
  /** Legacy parade flags: first visit number per line. */
  rowFlags?: (number | null)[];
  colFlags?: (number | null)[];
}

export interface Board {
  width: number;
  height: number;
  /** All steppable spots on the board (lawn '#' plus any shadowed rocks in `dark`). */
  spots: Spot[];
  index: Map<string, number>;
  hops: number[][];
  /** True if spot i is in the shadows (`panel.dark`). */
  dark: boolean[];
  /** True if spot i is actual lawn (`rows[r][c] === '#'`), false if it's a hidden rock in `dark`. */
  isLawn: boolean[];
  /** Total number of squares the route(s) must visit (known to the player via the board or last egg). */
  length: number;
  /** Numbered eggs: spot index -> 1-based step number on its bunny's route. */
  given: Map<number, number>;
  /** For 1-bunny boards: step number -> spot index. */
  at: Map<number, number>;
  /** Courses: portion label per spot index. */
  portion: (string | undefined)[];
  /** Colours: 'r', 'b', 'g', or 'w' per spot index. */
  colour: ('r' | 'b' | 'g' | 'w' | undefined)[];
  /** True when the panel has two bunnies (red and blue/green). */
  twoBunnies: boolean;
  /** The second bunny's colour ('b' or legacy 'g'). */
  secondTone: 'b' | 'g';
  /** Start spot index of the red (or single) bunny. */
  redStart: number | undefined;
  /** Start spot index of the blue/green bunny (when `twoBunnies` is true). */
  blueStart: number | undefined;
  /** Required route length of the red bunny (if its last egg is given). */
  redLength: number | undefined;
  /** Required route length of the blue bunny (if its last egg is given). */
  blueLength: number | undefined;
  burrows: [number, number][];
  burrow: Set<string>;
  frame?: Frame;
  letterAt: Map<number, string>;
  message: string;
  word: string;
  blanks: number[];
  rowFlags: (number | null)[];
  colFlags: (number | null)[];
}

/** A hop: one spot up, down, left or right. */
export const STEPS: Spot[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

export function parse(p: Panel): Board {
  const darkSet = new Set((p.dark ?? []).map(key));
  const spots: Spot[] = [];
  const dark: boolean[] = [];
  const isLawn: boolean[] = [];
  const colour: ('r' | 'b' | 'g' | 'w' | undefined)[] = [];

  const height = p.rows.length;
  const width = p.rows[0]?.length ?? 0;

  for (let r = 0; r < height; r++) {
    const row = p.rows[r] ?? '';
    for (let c = 0; c < width; c++) {
      const ch = row[c] ?? '.';
      const k = key([r, c]);
      const inDark = darkSet.has(k);
      if (ch === '.' && !inDark) continue;
      spots.push([r, c]);
      dark.push(inDark);
      isLawn.push(ch !== '.');
      const col = p.colours?.[r]?.[c];
      colour.push(col === 'r' || col === 'b' || col === 'g' || col === 'w' ? col : undefined);
    }
  }

  const index = new Map(spots.map((s, i) => [key(s), i]));
  const burrow = new Set<string>();
  const burrows: [number, number][] = [];

  const hops = spots.map(([r, c]) =>
    STEPS.flatMap(([dr, dc]) => {
      const j = index.get(key([r + dr, c + dc]));
      return j === undefined ? [] : [j];
    }),
  );

  for (const [a, z] of p.burrows ?? []) {
    const i = index.get(key(a));
    const j = index.get(key(z));
    if (i !== undefined && j !== undefined) {
      if (!hops[i]?.includes(j)) hops[i]?.push(j);
      if (!hops[j]?.includes(i)) hops[j]?.push(i);
      burrow.add(`${i},${j}`).add(`${j},${i}`);
      burrows.push([i, j]);
    }
  }

  const given = new Map<number, number>();
  for (const [r, c, n] of p.given) {
    const i = index.get(key([r, c]));
    if (i !== undefined) given.set(i, n);
  }

  const hasGreen = colour.includes('g');
  const secondTone: 'b' | 'g' = hasGreen ? 'g' : 'b';
  const startSpots = [...given.entries()].filter(([, n]) => n === 1).map(([i]) => i);
  const twoBunnies =
    colour.some((c) => c === 'r') && colour.some((c) => c === secondTone) && startSpots.length >= 2;

  let redStart: number | undefined;
  let blueStart: number | undefined;
  if (twoBunnies) {
    redStart = startSpots.find((i) => colour[i] === 'r') ?? startSpots[0];
    blueStart = startSpots.find((i) => colour[i] === secondTone && i !== redStart) ?? startSpots[1];
  } else {
    redStart = startSpots[0];
  }

  const at = new Map<number, number>();
  if (!twoBunnies) {
    for (const [i, n] of given) at.set(n, i);
  }

  // Route length: when `dark` is present, the last egg gives the route's length;
  // otherwise every spot is lawn and must be visited.
  const lawnCount = isLawn.filter(Boolean).length;
  let redLength: number | undefined;
  let blueLength: number | undefined;
  if (twoBunnies && darkSet.size > 0) {
    const rMax = Math.max(
      0,
      ...[...given.entries()].filter(([i]) => colour[i] === 'r').map(([, n]) => n),
    );
    const bMax = Math.max(
      0,
      ...[...given.entries()].filter(([i]) => colour[i] === secondTone).map(([, n]) => n),
    );
    if (rMax > 0) redLength = rMax;
    if (bMax > 0) blueLength = bMax;
  }
  const maxEgg = Math.max(0, ...given.values());
  const length =
    darkSet.size > 0
      ? twoBunnies && redLength !== undefined && blueLength !== undefined
        ? redLength + blueLength
        : maxEgg > 0
          ? maxEgg
          : lawnCount
      : spots.length;

  const portion = spots.map(([r, c]) => {
    const ch = p.portions?.[r]?.[c];
    return ch && ch !== '.' ? ch : undefined;
  });

  const letterAt = new Map<number, string>();
  for (const [r, c, l] of p.letters ?? []) {
    const i = index.get(key([r, c]));
    if (i !== undefined) letterAt.set(i, l);
  }

  const blanks =
    p.blanks && p.blanks.length
      ? [...p.blanks]
      : (p.message ?? '')
          .split(/\s+/)
          .filter(Boolean)
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0);

  return {
    width,
    height,
    spots,
    index,
    hops,
    dark,
    isLawn,
    length,
    given,
    at,
    portion,
    colour,
    twoBunnies,
    secondTone,
    redStart,
    blueStart,
    redLength,
    blueLength,
    burrows,
    burrow,
    ...(p.frame ? { frame: p.frame } : {}),
    letterAt,
    message: p.message ?? blanks.join(' '),
    word: p.word ?? '',
    blanks,
    rowFlags: p.rowFlags ?? p.rows.map(() => null),
    colFlags: p.colFlags ?? [...(p.rows[0] ?? '')].map(() => null),
  };
}

/** Split a combined route into [redRoute, blueRoute] when `b.twoBunnies` is true. */
export function splitRoutes(b: Board, route: number[]): [number[], number[]] {
  if (!b.twoBunnies || b.blueStart === undefined) return [route, []];
  const k = route.indexOf(b.blueStart);
  return k < 0 ? [route, []] : [route.slice(0, k), route.slice(k)];
}

/** Rectangular board rows helper. */
export const rect = (h: number, w: number): string[] =>
  Array.from({ length: h }, () => '#'.repeat(w));

export const treeRows = (h: number, w: number, spread: number): string[] => {
  const mid = Math.floor(w / 2);
  return Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) =>
      Math.abs(c - mid) <= Math.floor((r + 1) * spread) ? '#' : '.',
    ).join(''),
  );
};
