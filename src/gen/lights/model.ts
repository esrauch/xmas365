/**
 * Net (Simon Tatham's Net) and Christmas lights: the panel model and parsing.
 *
 * Every square on the board holds a piece of the light string; turn the
 * pieces so the power reaches every square from the plug, with no loose
 * ends and no loops.
 *
 * Holiday twists:
 * - snowflakes (Christmas at home): inside a frosty frame, wires mirror across the axis;
 * - the dark (Halloween): pieces stay dark (?) and turn blind until solved;
 * - letters for numbers (Valentine's): letter bulbs whose distances fill numbered message blanks;
 * - numbered eggs (Easter): power reaches each egg in its step count from the plug;
 * - red, white and blue (Fourth of July): red string from red plug, blue string from blue plug,
 *   white pieces can belong to either;
 * - slices (Thanksgiving): pie slices around the middle, no wires crossing slice walls (the walls
 *   leave each slice exactly one wire in from the middle).
 */
import { type Frame, inFrame, mirrorSquare } from '../core/mirror';
import { rng } from '../core/rng';

export type Spot = [number, number];

export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;
export const DIRS = [N, E, S, W] as const;
export const STEP: Record<number, Spot> = {
  [N]: [-1, 0],
  [E]: [0, 1],
  [S]: [1, 0],
  [W]: [0, -1],
};
export const OPP: Record<number, number> = {
  [N]: S,
  [E]: W,
  [S]: N,
  [W]: E,
};

/** Turn a piece a quarter clockwise. */
export const turn = (m: number): number => ((m << 1) | (m >> 3)) & 15;

/** Reflect a piece mask across a vertical ('v': swap E/W) or horizontal ('h': swap N/S) axis. */
export const mirrorMask = (m: number, axis: 'v' | 'h'): number =>
  axis === 'v'
    ? (m & (N | S)) | (m & E ? W : 0) | (m & W ? E : 0)
    : (m & (E | W)) | (m & N ? S : 0) | (m & S ? N : 0);

export interface Panel {
  name: string;
  tip?: string;
  /** The solved pieces, row by row: '.' off the board, else hex digit of wire ends (1 N, 2 E, 4 S, 8 W). */
  rows: string[];
  /** Where power comes in (the red string's plug, with colours). */
  plug: Spot;
  /** Blue string's plug (Fourth of July colours). */
  bluePlug?: Spot;
  /** Legacy green string plug (for backward compatibility). */
  greenPlug?: Spot;
  /** Colours, row by row: 'r', 'b' (or legacy 'g'), 'w' white (either string). */
  colours?: string[];
  /** Numbered eggs: [row, column, steps from plug]. */
  eggs?: [number, number, number][];
  /** Pie slices, row by row: a letter per slice, '*' middle with plug. */
  slices?: string[];
  /** Snowflakes (Christmas): inside this frame, wires mirror across axis. */
  frame?: Frame;
  /** Letters for numbers (Valentine's): [row, column, letter]. */
  letters?: [number, number, string][];
  /** Space-separated distances from the plug where the message's letters lie. */
  message?: string;
  /** The word spelled by the letter bulbs at `blanks` distances. */
  word?: string;
  /** Step distances from the plug for each blank in the message. */
  blanks?: number[];
  /** The dark (Halloween): pieces hidden until solved (never touching each other). */
  dark?: Spot[];
  /** Starting pieces, row by row (default: turned at random from panel name). */
  start?: string[];
  /** Optional star position (decoration). */
  star?: Spot;
  /** Legacy edge flags (null: no flag). */
  rowFlags?: (number | null)[];
  colFlags?: (number | null)[];
}

export interface Board {
  height: number;
  width: number;
  /** Solved pieces (-1 off the board). */
  solution: number[][];
  inside: (r: number, c: number) => boolean;
  plug: Spot;
  bluePlug?: Spot;
  greenPlug?: Spot;
  colour: (r: number, c: number) => 'r' | 'b' | 'g' | undefined;
  eggs: [number, number, number][];
  slices?: string[];
  slice: (r: number, c: number) => string | undefined;
  servings: boolean;
  frame?: Frame;
  letters: [number, number, string][];
  message: string;
  word: string;
  blanks: number[];
  dark: Set<string>;
  rowFlags: (number | null)[];
  colFlags: (number | null)[];
}

export const key = (r: number, c: number): string => `${r},${c}`;

export function parse(panel: Panel): Board {
  const solution = panel.rows.map((row) =>
    [...row].map((ch) => (ch === '.' ? -1 : parseInt(ch, 16))),
  );
  const height = solution.length;
  const width = solution[0]?.length ?? 0;
  const inside = (r: number, c: number): boolean => (solution[r]?.[c] ?? -1) >= 0;

  const colour = (r: number, c: number): 'r' | 'b' | 'g' | undefined => {
    const ch = panel.colours?.[r]?.[c];
    return ch === 'r' || ch === 'b' || ch === 'g' ? ch : undefined;
  };

  const dark = new Set((panel.dark ?? []).map(([r, c]) => key(r, c)));
  const letters = panel.letters ?? [];
  const blanks =
    panel.blanks && panel.blanks.length
      ? [...panel.blanks]
      : (panel.message ?? '')
          .split(/\s+/)
          .filter(Boolean)
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0);

  const secondaryPlug = panel.bluePlug ?? panel.greenPlug;

  return {
    height,
    width,
    solution,
    inside,
    plug: panel.plug,
    colour,
    eggs: panel.eggs ?? [],
    servings: panel.slices !== undefined,
    slice: (r, c) => {
      const ch = panel.slices?.[r]?.[c];
      return ch && ch !== '.' ? ch : undefined;
    },
    letters,
    message: panel.message ?? blanks.join(' '),
    word: panel.word ?? '',
    blanks,
    dark,
    rowFlags: panel.rowFlags ?? panel.rows.map(() => null),
    colFlags: panel.colFlags ?? [...(panel.rows[0] ?? '')].map(() => null),
    ...(panel.bluePlug ? { bluePlug: panel.bluePlug } : {}),
    ...(panel.greenPlug || (!panel.bluePlug && secondaryPlug) ? { greenPlug: secondaryPlug } : {}),
    ...(panel.slices ? { slices: panel.slices } : {}),
    ...(panel.frame ? { frame: panel.frame } : {}),
  };
}

/** The starting pieces: each turned at random (seeded by the panel's name). */
export function startGrid(panel: Panel): number[][] {
  const b = parse(panel);
  if (panel.start)
    return panel.start.map((row) => [...row].map((ch) => (ch === '.' ? -1 : parseInt(ch, 16))));
  let seed = 7;
  for (const ch of panel.name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const random = rng(seed);
  const out = b.solution.map((row) =>
    row.map((m) => {
      if (m < 0) return m;
      let x = m;
      for (let t = 1 + Math.floor(random() * 3); t > 0; t--) x = turn(x);
      return x;
    }),
  );
  // Inside a snowflake frame, mirrored pairs start mirrored so coupled turns stay in sync.
  if (b.frame) {
    const f = b.frame;
    for (let r = f.top; r <= f.bottom; r++) {
      for (let c = f.left; c <= f.right; c++) {
        if (!inFrame(f, r, c) || (out[r]?.[c] ?? -1) < 0) continue;
        const [mr, mc] = mirrorSquare(f, r, c);
        if (r > mr || (r === mr && c > mc)) {
          const mm = out[mr]?.[mc] ?? -1;
          if (mm >= 0) (out[r] as number[])[c] = mirrorMask(mm, f.axis);
        }
      }
    }
  }
  return out;
}

/** A board shape, row by row ('#' a square, '.' none). */
export type Shape = string[];

export const rectangle = (h: number, w: number): Shape =>
  Array.from({ length: h }, () => '#'.repeat(w));

/** A Christmas tree: a triangle widening downwards, a star square on top. */
export const treeShape = (h: number, w: number, spread = 0.5): Shape => {
  const mid = Math.floor(w / 2);
  return Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) =>
      Math.abs(c - mid) <= Math.floor((r + 1) * spread) ? '#' : '.',
    ).join(''),
  );
};

/** An oval (an egg, or a round pie when h = w). */
export const ovalShape = (h: number, w: number, top = 1): Shape =>
  Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) => {
      const y = (r + 0.5) / h - 0.5;
      const x = (c + 0.5) / w - 0.5;
      const squeeze = 1 + (top - 1) * Math.max(0, -y * 2);
      return (x * squeeze) ** 2 + y ** 2 <= 0.26 ? '#' : '.';
    }).join(''),
  );

/** A wreath: a ring of squares round a hole. */
export const ringShape = (h: number, w: number, hole = 0.08, outer = 0.26): Shape =>
  Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) => {
      const y = (r + 0.5) / h - 0.5;
      const x = (c + 0.5) / w - 0.5;
      const d = x * x + y * y;
      return d <= outer && d >= hole ? '#' : '.';
    }).join(''),
  );
