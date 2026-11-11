/** The rules: what a set of threads (one count per link) adds up to, and whether it solves a panel. */
import { symmetricIn } from '../core/mirror';
import { type Knot, type Link, type Web, segmentsBetween } from './model';

export interface Rules {
  /** Ignore the eggs / the flags (to check they matter). */
  noEggs?: boolean;
  noFlags?: boolean;
  /** Threads may not cross (default true). */
  noCrossing?: boolean;
  /** The web must be one piece (default true). */
  connected?: boolean;
}

export function totals(web: Web, threads: number[]): number[] {
  const t = web.knots.map(() => 0);
  web.links.forEach((l, i) => {
    const n = threads[i] ?? 0;
    t[l.a] = (t[l.a] ?? 0) + n;
    t[l.b] = (t[l.b] ?? 0) + n;
  });
  return t;
}

/** How many knots each knot is joined to (not counting doubles twice). */
export function neighbours(web: Web, threads: number[]): number[] {
  const d = web.knots.map(() => 0);
  web.links.forEach((l, i) => {
    if (!threads[i]) return;
    d[l.a] = (d[l.a] ?? 0) + 1;
    d[l.b] = (d[l.b] ?? 0) + 1;
  });
  return d;
}

/** Which piece each knot is in (pieces numbered from 0). */
export function pieces(web: Web, threads: number[]): number[] {
  const piece = web.knots.map(() => -1);
  let n = 0;
  web.knots.forEach((_, start) => {
    if ((piece[start] ?? -1) >= 0) return;
    piece[start] = n;
    const stack = [start];
    while (stack.length) {
      const x = stack.pop() as number;
      for (const i of web.incident[x] ?? []) {
        if (!threads[i]) continue;
        const l = web.links[i] as Link;
        const y = l.a === x ? l.b : l.a;
        if (piece[y] === -1) {
          piece[y] = n;
          stack.push(y);
        }
      }
    }
    n++;
  });
  return piece;
}

/** The count each letter stands for, if the letters are consistent (every knot of a letter alike, letters all different). */
export function letterValues(web: Web, threads: number[]): Map<string, number> | null {
  const t = totals(web, threads);
  const values = new Map<string, number>();
  for (const [k, knot] of web.knots.entries()) {
    if (knot.clue.kind !== 'letter') continue;
    const want = web.letterCounts.get(knot.clue.letter);
    if (want !== undefined && want !== t[k]) return null;
    const v = values.get(knot.clue.letter);
    if (v === undefined) values.set(knot.clue.letter, t[k] ?? 0);
    else if (v !== t[k]) return null;
  }
  return new Set(values.values()).size === values.size ? values : null;
}

/** The message with its blanks filled from the letters' counts ('_' where no letter has that count). */
export function fillMessage(message: string, values: Map<string, number>): string {
  const byCount = new Map([...values.entries()].map(([letter, n]) => [n, letter]));
  return message.replace(/[0-9]/g, (d) => byCount.get(Number(d)) ?? '_');
}

/** Is the panel solved under every one of its rules? */
/** How many threads run along each row and each column (a double counts two). */
export function threadsAlong(web: Web, threads: number[]): { rows: number[]; cols: number[] } {
  const rows = new Array<number>(web.height).fill(0);
  const cols = new Array<number>(web.width).fill(0);
  web.links.forEach((l, i) => {
    const n = threads[i] ?? 0;
    if (!n) return;
    const a = web.knots[l.a] as Knot;
    const b = web.knots[l.b] as Knot;
    if (a.r === b.r) rows[a.r] = (rows[a.r] ?? 0) + n;
    else if (a.c === b.c) cols[a.c] = (cols[a.c] ?? 0) + n;
  });
  return { rows, cols };
}

/** Threads (joins) from a knot to every knot, along the web (-1: not reached). */
export function distances(web: Web, threads: number[], from: number): number[] {
  const d = web.knots.map(() => -1);
  d[from] = 0;
  const queue = [from];
  while (queue.length) {
    const x = queue.shift() as number;
    for (const i of web.incident[x] ?? []) {
      if (!threads[i]) continue;
      const l = web.links[i] as Link;
      const y = l.a === x ? l.b : l.a;
      if (d[y] === -1) {
        d[y] = (d[x] ?? 0) + 1;
        queue.push(y);
      }
    }
  }
  return d;
}

export function solved(web: Web, threads: number[], rules: Rules = {}): boolean {
  // Snowflakes: inside the frame, the threads are their own mirror image.
  if (web.frame && !symmetricIn(web.frame, strokes(web, threads))) return false;
  const t = totals(web, threads);
  if (web.knots.some((k, i) => (k.clue.kind === 'count' ? t[i] !== k.clue.n : (t[i] ?? 0) < 1)))
    return false;
  if (!letterValues(web, threads)) return false;
  if (rules.noCrossing !== false)
    for (const [i, cross] of web.crosses.entries())
      if (threads[i] && cross.some((j) => threads[j])) return false;
  if (web.ends) {
    const d = neighbours(web, threads);
    if (web.knots.some((_, k) => d[k] !== (web.ends?.includes(k) ? 1 : 2))) return false;
  }
  if (rules.connected !== false && new Set(pieces(web, threads)).size > 1) return false;
  if (!rules.noFlags) {
    const { rows, cols } = threadsAlong(web, threads);
    if (web.rowFlags.some((f, r) => f !== null && f !== rows[r])) return false;
    if (web.colFlags.some((f, c) => f !== null && f !== cols[c])) return false;
  }
  if (!rules.noEggs && web.home !== undefined) {
    const d = distances(web, threads, web.home);
    if (web.eggs.some(([k, n]) => d[k] !== n)) return false;
  }
  return true;
}

/** What the threads draw: the unit segments they cover (singles and doubles alike). */
export function strokes(web: Web, threads: number[]): Set<string> {
  const out = new Set<string>();
  web.links.forEach((l, i) => {
    if (!threads[i]) return;
    for (const s of segmentsBetween(web.knots[l.a] as Knot, web.knots[l.b] as Knot)) out.add(s);
  });
  return out;
}
