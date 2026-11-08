/**
 * Webs (Halloween): Hashi (Nikoli's Hashiwokakero, Tatham's Bridges). The
 * panel format, and the web it parses into: knots, the links that could hold
 * threads between them, which links cross, and the twists' clues.
 *
 * The base rules: a knot's number is how many threads leave it; threads run
 * straight between two knots, one or two between a pair, never crossing; the
 * web hangs together as one. The twists, each optional on a panel:
 * - letters (Valentine's): a knot shows a letter, not a number; the same
 *   letter means the same count, different letters different counts; a
 *   message's blank n is the letter whose knots have n threads;
 * - the dark ('?', Halloween): any count;
 * - colours (Christmas): knots are red or green bulbs, and a thread only joins
 *   a red to a green;
 * - eggs (Easter): an egg's number is how many threads it takes to reach it
 *   from the spider's home knot;
 * - flags (Fourth of July): how many threads run along a row or column;
 * - cuts (Thanksgiving): short walls between squares that no thread may cross;
 * - snowflakes (Christmas): inside a frame, the threads are their own mirror
 *   image (singles and doubles needn't match); outside it, anything goes;
 * - home-only extras: a string (one unbranched string from plug to star),
 *   diagonals (threads may also run corner to corner).
 */
import { type Frame, inside, mirrorKey, segment } from '../core/mirror';
export type Spot = [number, number];
export type Dir = readonly [number, number];
export const ORTHO: Dir[] = [
  [0, 1],
  [1, 0],
];
export const DIAG: Dir[] = [
  [1, 1],
  [1, -1],
];

export interface Panel {
  name: string;
  tip?: string;
  /** '.' empty; a digit: a knot with that many threads; a letter: a coded count; '?': a dark knot. */
  rows: string[];
  /** Knot colours, row by row: 'r' red, 'b' blue ('g' green in older panels); '.' plain (white), which joins anything. A thread only joins different colours. */
  colours?: string[];
  /** Threads may also run diagonally. */
  diagonal?: boolean;
  /** The web is one unbranched string from the plug (first) to the star (second). */
  ends?: [Spot, Spot];
  /** A message with numbered blanks: blank n takes the letter whose knots have n threads. */
  message?: string;
  /** The spider's home knot, and numbered eggs: [row, column, threads from home]. */
  home?: Spot;
  eggs?: [number, number, number][];
  /** Edge flags: how many threads run along each row / column (null: no flag). */
  rowFlags?: (number | null)[];
  colFlags?: (number | null)[];
  /** Cuts: short walls no thread may cross. [row, column, side]: 'v' the square's right edge, 'h' its bottom edge. */
  walls?: Wall[];
  /** Snowflakes (Christmas): inside this frame the threads are their own mirror image (singles and doubles needn't match); outside it, anything goes. */
  frame?: Frame;
  /** Starting threads already spun on the board: [r1, c1, r2, c2, count]. */
  start?: [number, number, number, number, 1 | 2][];
}

/** The unit segments (between neighbouring squares) a straight thread between two squares covers. */
export function segmentsBetween(
  a: { r: number; c: number },
  b: { r: number; c: number },
): string[] {
  const out: string[] = [];
  if (a.r === b.r)
    for (let c = Math.min(a.c, b.c); c < Math.max(a.c, b.c); c++)
      out.push(segment(a.r, c, a.r, c + 1));
  else if (a.c === b.c)
    for (let r = Math.min(a.r, b.r); r < Math.max(a.r, b.r); r++)
      out.push(segment(r, a.c, r + 1, a.c));
  return out;
}

export type Wall = [number, number, 'v' | 'h'];
export const wallKey = ([r, c, side]: Wall): string => `${r},${c},${side}`;

/** The walls a straight thread between two squares would cross (diagonal threads cross none). */
export function wallsBetween(a: { r: number; c: number }, b: { r: number; c: number }): string[] {
  const out: string[] = [];
  if (a.r === b.r)
    for (let c = Math.min(a.c, b.c); c < Math.max(a.c, b.c); c++) out.push(wallKey([a.r, c, 'v']));
  else if (a.c === b.c)
    for (let r = Math.min(a.r, b.r); r < Math.max(a.r, b.r); r++) out.push(wallKey([r, a.c, 'h']));
  return out;
}

export type Clue =
  { kind: 'count'; n: number } | { kind: 'letter'; letter: string } | { kind: 'dark' };

export interface Knot {
  r: number;
  c: number;
  clue: Clue;
  colour?: 'r' | 'b' | 'g';
}

export interface Link {
  a: number;
  b: number;
  /** Unit step from a to b. */
  dir: Dir;
  /** The points the thread passes over (doubled coordinates, endpoints excluded). */
  points: string[];
}

export interface Web {
  knots: Knot[];
  links: Link[];
  /** For each link, the links it would cross. */
  crosses: number[][];
  /** For each knot, its links. */
  incident: number[][];
  width: number;
  height: number;
  /** The string's plug and star (knot indices), if the panel is a string. */
  ends?: [number, number];
  /** The home knot, and eggs as [knot, threads from home]. */
  home?: number;
  eggs: [number, number][];
  rowFlags: (number | null)[];
  colFlags: (number | null)[];
  /** The cuts, as wall keys. */
  walls: Set<string>;
  /** Snowflakes: the frame, the links over each unit segment, and the frame's segments paired with their mirror images. */
  frame?: Frame;
  segmentLinks: Map<string, number[]>;
  framePairs: [string, string][];
}

export function parse(panel: Panel): Web {
  const knots: Knot[] = [];
  const at = new Map<string, number>();
  panel.rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === '.') return;
      const clue: Clue =
        ch === '?'
          ? { kind: 'dark' }
          : /[0-9]/.test(ch)
            ? { kind: 'count', n: Number(ch) }
            : { kind: 'letter', letter: ch };
      const colour = panel.colours?.[r]?.[c];
      at.set(`${r},${c}`, knots.length);
      knots.push(
        colour === 'r' || colour === 'b' || colour === 'g'
          ? { r, c, clue, colour }
          : { r, c, clue },
      );
    }),
  );
  const height = panel.rows.length;
  const width = panel.rows[0]?.length ?? 0;
  const walls = new Set((panel.walls ?? []).map(wallKey));
  const links: Link[] = [];
  knots.forEach((k, a) => {
    for (const dir of panel.diagonal ? [...ORTHO, ...DIAG] : ORTHO) {
      let r = k.r + dir[0];
      let c = k.c + dir[1];
      let steps = 1;
      while (r >= 0 && r < height && c >= 0 && c < width && !at.has(`${r},${c}`)) {
        r += dir[0];
        c += dir[1];
        steps++;
      }
      const b = at.get(`${r},${c}`);
      if (b === undefined) continue;
      const other = knots[b] as Knot;
      if (k.colour && other.colour && k.colour === other.colour) continue;
      if (wallsBetween(k, other).some((w) => walls.has(w))) continue;
      const points: string[] = [];
      for (let t = 1; t < steps * 2; t++)
        points.push(`${2 * k.r + dir[0] * t},${2 * k.c + dir[1] * t}`);
      links.push({ a, b, dir, points });
    }
  });
  const crosses = links.map((x, i) =>
    links.flatMap((y, j) => (i !== j && x.points.some((p) => y.points.includes(p)) ? [j] : [])),
  );
  const incident = knots.map((_, k) =>
    links.flatMap((l, i) => (l.a === k || l.b === k ? [i] : [])),
  );
  const knotAt = (s: Spot): number => {
    const i = at.get(`${s[0]},${s[1]}`);
    if (i === undefined) throw new Error(`${panel.name}: no knot at ${s.join(',')}`);
    return i;
  };
  const web: Web = {
    knots,
    links,
    crosses,
    incident,
    width,
    height,
    eggs: (panel.eggs ?? []).map(([r, c, n]) => [knotAt([r, c]), n]),
    rowFlags: panel.rowFlags ?? panel.rows.map(() => null),
    colFlags: panel.colFlags ?? [...(panel.rows[0] ?? '')].map(() => null),
    walls,
    segmentLinks: new Map(),
    framePairs: [],
  };
  if (panel.ends) web.ends = [knotAt(panel.ends[0]), knotAt(panel.ends[1])];
  if (panel.home) web.home = knotAt(panel.home);
  if (panel.frame) {
    const f = panel.frame;
    web.frame = f;
    links.forEach((l, i) => {
      for (const s of segmentsBetween(knots[l.a] as Knot, knots[l.b] as Knot))
        web.segmentLinks.set(s, [...(web.segmentLinks.get(s) ?? []), i]);
    });
    // Each unit segment inside the frame, with its mirror image (once per pair; ones on the axis are their own).
    const seen = new Set<string>();
    for (let r = f.top; r <= f.bottom; r++)
      for (let c = f.left; c <= f.right; c++)
        for (const s of [segment(r, c, r, c + 1), segment(r, c, r + 1, c)]) {
          if (!inside(f, s) || seen.has(s)) continue;
          const m = mirrorKey(f, s);
          seen.add(s).add(m);
          if (m !== s) web.framePairs.push([s, m]);
        }
  }
  return web;
}

/** Replace the clue at a spot (a digit, a letter or '?'). */
export function withClue(panel: Panel, [r, c]: Spot, clue: string): Panel {
  return {
    ...panel,
    rows: panel.rows.map((row, i) => (i === r ? row.slice(0, c) + clue + row.slice(c + 1) : row)),
  };
}
