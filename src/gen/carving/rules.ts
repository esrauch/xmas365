/** The rules: what's wrong with a portion, and whether a carving solves a panel. */
import { segment, symmetricIn } from '../core/mirror';
import { type Board, type Colour, type Rect, cellsOf, touching } from './model';

export type Problem = 'two numbers' | 'no number' | 'wrong size' | 'dishes' | 'two colours' | 'cut';

/** What's wrong with a portion on its own (null if nothing). */
export function problem(b: Board, x: Rect): Problem | null {
  const inside = cellsOf(b, x);
  // A coded or dark size counts as the portion's number, of a size worked out later.
  const sized = inside.filter((cell) => cell.n !== undefined || cell.letter || cell.dark);
  const numbers = inside.flatMap((cell) => (cell.n === undefined ? [] : [cell.n]));
  if (sized.length > 1) return 'two numbers';
  if (sized.length === 0 && !b.numberless) return 'no number';
  if (numbers.length === 1 && numbers[0] !== x.h * x.w) return 'wrong size';
  if (b.dishes.length) {
    const here = inside.flatMap((cell) => (cell.dish ? [cell.dish] : [])).sort();
    if (here.join() !== b.dishes.join()) return 'dishes';
  }
  if (new Set(inside.flatMap((cell) => (cell.colour ? [cell.colour] : []))).size > 1)
    return 'two colours';
  // Cuts: no fence inside a portion.
  if (b.walls.size)
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) {
        if (c + 1 < x.c + x.w && b.walls.has(`${r},${c},v`)) return 'cut';
        if (r + 1 < x.r + x.h && b.walls.has(`${r},${c},h`)) return 'cut';
      }
  return null;
}

export const colourOf = (b: Board, x: Rect): Colour | undefined =>
  cellsOf(b, x).find((cell) => cell.colour)?.colour;

/** Pairs of same-coloured portions that touch. */
export function colourClashes(b: Board, rects: Rect[]): [number, number][] {
  const out: [number, number][] = [];
  rects.forEach((a, i) =>
    rects.forEach((x, j) => {
      if (i < j && touching(a, x)) {
        const ca = colourOf(b, a);
        if (ca && ca === colourOf(b, x)) out.push([i, j]);
      }
    }),
  );
  return out;
}

/** How many portions each row and each column runs through (the retired flag skewers). */
export function lineCounts(b: Board, rects: Rect[]): { rows: number[]; cols: number[] } {
  return {
    rows: Array.from(
      { length: b.height },
      (_, r) => rects.filter((x) => x.r <= r && r < x.r + x.h).length,
    ),
    cols: Array.from(
      { length: b.width },
      (_, c) => rects.filter((x) => x.c <= c && c < x.c + x.w).length,
    ),
  };
}

export function covers(b: Board, rects: Rect[]): boolean {
  const seen = new Set<string>();
  for (const x of rects)
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) {
        if (seen.has(`${r},${c}`)) return false;
        seen.add(`${r},${c}`);
      }
  return seen.size === b.height * b.width;
}

/** The size each letter stands for, if consistent with the word's numbers (and distinct). */
export function letterSizes(b: Board, rects: Rect[]): Map<string, number> | null {
  const sizes = new Map<string, number>();
  for (const x of rects) {
    const letter = cellsOf(b, x).find((cell) => cell.letter)?.letter;
    if (!letter) continue;
    const want = b.letterSize.get(letter);
    if (want !== undefined && want !== x.h * x.w) return null;
    const had = sizes.get(letter);
    if (had !== undefined && had !== x.h * x.w) return null;
    sizes.set(letter, x.h * x.w);
  }
  return new Set(sizes.values()).size === sizes.size ? sizes : null;
}

/** Which portion each square is in. */
export function owners(height: number, width: number, rects: Rect[]): number[][] {
  const own = Array.from({ length: height }, () => Array<number>(width).fill(-1));
  rects.forEach((x, i) => {
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) (own[r] as number[])[c] = i;
  });
  return own;
}

/** What a carving draws: the cuts between neighbouring squares in different portions. */
export function cutsOf(height: number, width: number, rects: Rect[]): Set<string> {
  const own = owners(height, width, rects);
  const out = new Set<string>();
  for (let r = 0; r < height; r++)
    for (let c = 0; c < width; c++) {
      const me = own[r]?.[c];
      if (c + 1 < width && own[r]?.[c + 1] !== me) out.add(segment(r, c, r, c + 1));
      if (r + 1 < height && own[r + 1]?.[c] !== me) out.add(segment(r, c, r + 1, c));
    }
  return out;
}

export function solved(b: Board, rects: Rect[]): boolean {
  if (!covers(b, rects) || rects.some((x) => problem(b, x))) return false;
  if (!letterSizes(b, rects)) return false;
  if (colourClashes(b, rects).length) return false;
  if (b.frame && !symmetricIn(b.frame, cutsOf(b.height, b.width, rects))) return false;
  const { rows, cols } = lineCounts(b, rects);
  return (
    b.rowMarks.every((m, r) => m === null || m === rows[r]) &&
    b.colMarks.every((m, c) => m === null || m === cols[c])
  );
}
