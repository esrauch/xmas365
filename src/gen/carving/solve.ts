/** A solver that finds a panel's answers (up to a limit, within a budget): portions laid row by row. */
import { Budget } from '../core/budget';
import { symmetricIn } from '../core/mirror';
import { type Board, type Rect, cellsOf, touching } from './model';
import { colourOf, cutsOf, letterSizes, problem } from './rules';

export interface Rules {
  /** Ignore the colours (to check that they matter). */
  noColours?: boolean;
  /** Ignore the (retired) flags. */
  noMarks?: boolean;
}

/** Find up to `limit` answers (each a list of portions). */
export function solve(
  board: Board,
  limit = 2,
  rules: Rules = {},
  budget: Budget = new Budget(),
): Rect[][] {
  const b: Board = rules.noColours
    ? { ...board, cells: board.cells.map((row) => row.map(({ colour: _, ...cell }) => cell)) }
    : board;
  const rowMarks = rules.noMarks ? b.rowMarks.map(() => null) : b.rowMarks;
  const colMarks = rules.noMarks ? b.colMarks.map(() => null) : b.colMarks;
  const H = b.height;
  const W = b.width;
  const taken: boolean[][] = Array.from({ length: H }, () => Array<boolean>(W).fill(false));
  const placed: Rect[] = [];
  const found: Rect[][] = [];
  const rowCount = Array<number>(H).fill(0);
  const colCount = Array<number>(W).fill(0);
  // Every valid portion with its top-left at each cell, ignoring overlaps.
  const options: Rect[][][] = Array.from({ length: H }, (_, r) =>
    Array.from({ length: W }, (_, c) => {
      const out: Rect[] = [];
      for (let h = 1; r + h <= H; h++)
        for (let w = 1; c + w <= W; w++) {
          const x = { r, c, h, w };
          if (!problem(b, x) && letterSizes(b, [x])) out.push(x);
        }
      return out;
    }),
  );

  // Clue cells (numbers, letters, or dark '?') must each be covered by a valid portion
  // containing no other clue. Precompute each clue's candidate portions and iteratively
  // eliminate portions from other clues that overlap a clue's mandatory core intersection.
  const clues: { r: number; c: number; rects: Rect[] }[] = [];
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      const cell = b.cells[r]?.[c];
      if (cell && (cell.n !== undefined || cell.letter !== undefined || cell.dark)) {
        clues.push({ r, c, rects: [] });
      }
    }

  const covers = (x: Rect, r: number, c: number): boolean =>
    r >= x.r && r < x.r + x.h && c >= x.c && c < x.c + x.w;

  const rebuildClues = (): void => {
    for (const cl of clues) cl.rects = [];
    for (let r = 0; r < H; r++)
      for (let c = 0; c < W; c++)
        for (const x of options[r]?.[c] ?? [])
          for (const cl of clues) if (covers(x, cl.r, cl.c)) cl.rects.push(x);
  };
  rebuildClues();

  for (let changed = true; changed;) {
    changed = false;
    for (const cl of clues) {
      if (cl.rects.length === 0) return [];
      let top = 0;
      let bottom = H - 1;
      let left = 0;
      let right = W - 1;
      for (const x of cl.rects) {
        if (x.r > top) top = x.r;
        if (x.r + x.h - 1 < bottom) bottom = x.r + x.h - 1;
        if (x.c > left) left = x.c;
        if (x.c + x.w - 1 < right) right = x.c + x.w - 1;
      }
      if (top > bottom || left > right) continue;
      for (let r = 0; r < H; r++)
        for (let c = 0; c < W; c++) {
          const list = options[r]?.[c];
          if (!list?.length) continue;
          const kept = list.filter((y) => {
            if (covers(y, cl.r, cl.c)) return true;
            const overlapsCore =
              y.r <= bottom && y.r + y.h - 1 >= top && y.c <= right && y.c + y.w - 1 >= left;
            return !overlapsCore;
          });
          if (kept.length < list.length) {
            (options[r] as Rect[][])[c] = kept;
            changed = true;
          }
        }
    }
    if (changed) rebuildClues();
  }

  const fits = (x: Rect): boolean => {
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) if (taken[r]?.[c]) return false;
    return true;
  };
  const cluesViable = (): boolean => {
    for (const cl of clues) {
      if (taken[cl.r]?.[cl.c]) continue;
      if (!cl.rects.some(fits)) return false;
    }
    return true;
  };
  const mark = (x: Rect, v: boolean): void => {
    for (let r = x.r; r < x.r + x.h; r++)
      for (let c = x.c; c < x.c + x.w; c++) (taken[r] as boolean[])[c] = v;
    const d = v ? 1 : -1;
    for (let r = x.r; r < x.r + x.h; r++) rowCount[r] = (rowCount[r] ?? 0) + d;
    for (let c = x.c; c < x.c + x.w; c++) colCount[c] = (colCount[c] ?? 0) + d;
  };
  const go = (from: number): void => {
    budget.tick();
    if (found.length >= limit) return;
    let at = from;
    while (at < H * W && taken[Math.floor(at / W)]?.[at % W]) at++;
    // Rows above the first open cell are finished: their marks must be met.
    const doneRows = Math.floor(at / W);
    for (let r = Math.floor(from / W); r < Math.min(doneRows, H); r++) {
      const m = rowMarks[r];
      if (m !== null && m !== undefined && rowCount[r] !== m) return;
    }
    if (at === H * W) {
      if (!colMarks.every((m, c) => m === null || m === colCount[c])) return;
      if (b.frame && !symmetricIn(b.frame, cutsOf(H, W, placed))) return;
      found.push([...placed]);
      return;
    }
    if (!cluesViable()) return;
    const r0 = Math.floor(at / W);
    const c0 = at % W;
    for (const x of options[r0]?.[c0] ?? []) {
      if (!fits(x)) continue;
      const colour = colourOf(b, x);
      if (colour && placed.some((y) => touching(x, y) && colourOf(b, y) === colour)) continue;
      if (cellsOf(b, x).some((cell) => cell.letter) && !letterSizes(b, [...placed, x])) continue;
      mark(x, true);
      const over =
        rowMarks.some((m, r) => m !== null && (rowCount[r] ?? 0) > m) ||
        colMarks.some((m, c) => m !== null && (colCount[c] ?? 0) > m);
      if (!over) {
        placed.push(x);
        go(at);
        placed.pop();
      }
      mark(x, false);
    }
  };
  go(0);
  return found;
}

export const countSolutions = (
  b: Board,
  limit = 2,
  rules: Rules = {},
  budget: Budget = new Budget(),
): number => solve(b, limit, rules, budget).length;
