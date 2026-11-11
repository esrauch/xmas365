/**
 * Picture-grid solver: line-by-line intersection propagation (with optional
 * snowflake mirror propagation), cryptarithm letter-value checking, and
 * row-by-row backtracking search with incremental column, portion, egg, and
 * snowflake pruning.
 */
import { Budget, OverBudget } from '../core/budget';
import { type Frame, mirrorSquare } from '../core/mirror';
import {
  type Cell,
  type Clues,
  type Panel,
  type Run,
  clues,
  picture,
  runIndexAt,
  runsOf,
} from './model';
import { eggsHold, frameSymmetric, portionCounts } from './rules';

export { OverBudget };

export interface Twists {
  noEggs?: boolean;
  noPortions?: boolean;
  noSnow?: boolean;
  noLetters?: boolean;
  /** Give up (OverBudget) after this many steps. */
  budget?: number;
}

/** Every arrangement of a line's runs that fits what's known (each a full line). */
export function arrangements(runs: Run[], known: Cell[], cap = 20000): number[][] | null {
  const L = known.length;
  const out: number[][] = [];
  const line = new Array<number>(L).fill(0);
  let overflow = false;
  const fits = (from: number, to: number, v: number): boolean => {
    for (let i = from; i < to; i++) {
      const k = known[i] ?? -1;
      if (k !== -1 && k !== v) return false;
    }
    return true;
  };
  const go = (r: number, at: number): void => {
    if (overflow) return;
    if (r === runs.length) {
      if (!fits(at, L, 0)) return;
      for (let i = at; i < L; i++) line[i] = 0;
      out.push([...line]);
      if (out.length > cap) overflow = true;
      return;
    }
    const run = runs[r] as Run;
    const next = runs[r + 1];
    // A run of the same colour next needs a gap; a different colour can touch.
    const gap = next !== undefined && next.colour === run.colour ? 1 : 0;
    for (let start = at; start < L; start++) {
      if (!fits(at, start, 0)) break; // squares skipped before the run are empty
      const lengths = run.hidden ? Array.from({ length: L - start }, (_, i) => i + 1) : [run.n];
      for (const n of lengths) {
        const end = start + n;
        if (end > L) break;
        if (!fits(start, end, run.colour)) continue;
        if (end < L && (known[end] ?? -1) === run.colour) continue; // it would run on
        if (gap && (end >= L || !fits(end, end + 1, 0))) continue;
        for (let i = at; i < start; i++) line[i] = 0;
        for (let i = start; i < end; i++) line[i] = run.colour;
        if (gap) line[end] = 0;
        go(r + 1, end + gap);
      }
    }
  };
  go(0, 0);
  return overflow ? null : out;
}

/**
 * Solve line by line: repeatedly fill any square every arrangement of its row
 * or column agrees on (and mirror settled squares inside `frame` when given).
 * Returns the grid (with -1 where logic stopped), or null if a line can have
 * no arrangement at all.
 */
export function solveLines(c: Clues, frame?: Frame): number[][] | null {
  const H = c.rows.length;
  const W = c.cols.length;
  const grid: number[][] = Array.from({ length: H }, () => new Array<number>(W).fill(-1));

  const setCell = (r: number, col: number, val: number): boolean => {
    const cur = grid[r]?.[col] ?? -1;
    if (cur !== -1) return cur === val;
    (grid[r] as number[])[col] = val;
    if (frame && r >= frame.top && r <= frame.bottom && col >= frame.left && col <= frame.right) {
      const [mr, mc] = mirrorSquare(frame, r, col);
      const mcur = grid[mr]?.[mc] ?? -1;
      if (mcur !== -1 && mcur !== val) return false;
      (grid[mr] as number[])[mc] = val;
    }
    return true;
  };

  for (let changed = true; changed;) {
    changed = false;
    for (const [kind, lines] of [
      ['row', c.rows],
      ['col', c.cols],
    ] as const)
      for (const [i, runs] of lines.entries()) {
        const known = kind === 'row' ? (grid[i] as number[]) : grid.map((row) => row[i] ?? -1);
        if (!known.includes(-1)) {
          if (!arrangements(runs, known, 1)?.length) return null;
          continue;
        }
        const all = arrangements(runs, known);
        if (all === null) continue; // too many to list yet: come back when more is known
        if (!all.length) return null;
        for (let j = 0; j < known.length; j++) {
          if (known[j] !== -1) continue;
          const first = (all[0] as number[])[j] as number;
          if (all.every((a) => a[j] === first)) {
            const r = kind === 'row' ? i : j;
            const col = kind === 'row' ? j : i;
            if (!setCell(r, col, first)) return null;
            changed = true;
          }
        }
      }
  }
  return grid;
}

/** The clues as the solver sees them with the letters' values known (dark clues stay hidden). */
function withLetters(c: Clues, value: (letter: string) => number): Clues {
  const set = (runs: Run[]): Run[] =>
    runs.map((r) => (r.letter ? { n: value(r.letter), colour: r.colour } : r));
  return { rows: c.rows.map(set), cols: c.cols.map(set) };
}

const sameGrid = (g: number[][] | null, want: number[][]): boolean =>
  !!g && g.every((row, r) => row.every((v, c) => v === want[r]?.[c]));

/**
 * Can the panel be solved by line logic alone, to exactly its picture? With
 * letters, as a player would: the message spells out a word, so unscrambling
 * the clue letters gives their values, and those values solve it line by line.
 */
export function logical(p: Panel): boolean {
  const c = clues(p);
  const want = picture(p);
  if (!p.letters) return sameGrid(solveLines(c, p.frame), want);
  return sameGrid(
    solveLines(
      withLetters(c, (l) => (p.letters?.indexOf(l) ?? -1) + 1),
      p.frame,
    ),
    want,
  );
}

/** Logic's best grid for a panel (letters at their true values), for the search. */
export function logicSolve(p: Panel): number[][] | null {
  const c = clues(p);
  return solveLines(
    p.letters ? withLetters(c, (l) => (p.letters?.indexOf(l) ?? -1) + 1) : c,
    p.frame,
  );
}

/**
 * Check that a line's actual runs assign consistent, distinct values to any
 * letter clues on that line, updating `letterToVal` and `valToLetter`.
 */
function bindLineLetters(
  clueRuns: Run[],
  line: number[],
  letterToVal: Map<string, number>,
  valToLetter: Map<number, string>,
): boolean {
  const actual = runsOf(line);
  if (actual.length !== clueRuns.length) return false;
  for (let i = 0; i < clueRuns.length; i++) {
    const cr = clueRuns[i] as Run;
    const ar = actual[i] as Run;
    if (cr.colour !== ar.colour) return false;
    if (!cr.hidden && cr.n !== ar.n) return false;
    if (cr.letter) {
      const prevV = letterToVal.get(cr.letter);
      if (prevV !== undefined && prevV !== ar.n) return false;
      const prevL = valToLetter.get(ar.n);
      if (prevL !== undefined && prevL !== cr.letter) return false;
      letterToVal.set(cr.letter, ar.n);
      valToLetter.set(ar.n, cr.letter);
    }
  }
  return true;
}

/** Up to `limit` pictures that fit the clues (and the twists not switched off). */
export function pictures(
  p: Panel,
  limit = 2,
  twists: Twists = {},
  budgetObj?: Budget,
): number[][][] {
  const c = clues(p);
  const H = c.rows.length;
  const W = c.cols.length;
  const frame = !twists.noSnow ? p.frame : undefined;
  const checkLetters = !twists.noLetters && Boolean(p.letters);
  const grid: number[][] = Array.from({ length: H }, () => new Array<number>(W).fill(-1));

  // Line logic first: every square it settles narrows each row's arrangements before the search.
  const known = solveLines(c, frame);
  if (!known) return [];
  // Seed known cells from eggs if eggs are active.
  if (!twists.noEggs && p.eggs?.length) {
    for (const [er, ec] of p.eggs) {
      const k = known[er]?.[ec] ?? -1;
      if (k === 0) return [];
    }
  }

  let steps = 0;
  const stepCap = twists.budget ?? Infinity;

  const sol = picture(p);
  const rowsOptions = c.rows.map((runs, r) => {
    const all = arrangements(runs, known[r] ?? new Array<number>(W).fill(-1), 200000) ?? [];
    return all.filter((line) => {
      if (!twists.noEggs && p.eggs?.length) {
        const rowEggs = p.eggs.filter(([er]) => er === r);
        const solRow = sol[r] ?? [];
        for (const [, ec] of rowEggs) {
          if ((line[ec] ?? 0) <= 0 || (line[ec] ?? 0) !== (solRow[ec] ?? 0)) return false;
          if (runIndexAt(line, ec) !== runIndexAt(solRow, ec)) return false;
        }
      }
      if (frame && frame.axis === 'v' && r >= frame.top && r <= frame.bottom) {
        for (let col = frame.left; col <= frame.right; col++) {
          const mc = frame.left + frame.right - col;
          if ((line[col] ?? 0) !== (line[mc] ?? 0)) return false;
        }
      }
      if (checkLetters) {
        const l2v = new Map<string, number>();
        const v2l = new Map<number, string>();
        if (!bindLineLetters(runs, line, l2v, v2l)) return false;
      }
      return true;
    });
  });

  const portions = !twists.noPortions && p.portions;
  let target = -1;
  const remInPortion: Map<string, number>[] = [];
  if (portions && p.portions) {
    const counts = portionCounts(p, picture(p));
    target = [...counts.values()][0] ?? 0;
    // Precompute how many cells of each portion exist in rows > r for lower-bound pruning.
    for (let r = 0; r < H; r++) {
      const rem = new Map<string, number>();
      for (let rr = r + 1; rr < H; rr++) {
        for (let cc = 0; cc < W; cc++) {
          const k = p.portions[rr]?.[cc];
          if (k !== undefined) rem.set(k, (rem.get(k) ?? 0) + 1);
        }
      }
      remInPortion.push(rem);
    }
  }

  const found: number[][][] = [];
  const go = (r: number, l2v: Map<string, number>, v2l: Map<number, string>): void => {
    if (found.length >= limit) return;
    if (r === H) {
      if (portions && ![...portionCounts(p, grid).values()].every((v) => v === target)) return;
      if (frame && !frameSymmetric(frame, grid)) return;
      if (checkLetters) {
        const colL2v = new Map(l2v);
        const colV2l = new Map(v2l);
        for (let col = 0; col < W; col++) {
          const colLine = grid.map((row) => row[col] ?? 0);
          if (!bindLineLetters(c.cols[col] ?? [], colLine, colL2v, colV2l)) return;
        }
      }
      if (!twists.noEggs && !eggsHold(p, grid)) return;
      found.push(grid.map((row) => [...row]));
      return;
    }
    for (const line of rowsOptions[r] ?? []) {
      budgetObj?.tick();
      if (++steps > stepCap) throw new OverBudget();

      // Horizontal snowflake axis: if mirror row mr < r is already placed, match inside frame.
      if (frame && frame.axis === 'h' && r >= frame.top && r <= frame.bottom) {
        const mr = frame.top + frame.bottom - r;
        if (mr < r) {
          let symOk = true;
          for (let col = frame.left; col <= frame.right; col++) {
            if ((line[col] ?? 0) !== (grid[mr]?.[col] ?? 0)) {
              symOk = false;
              break;
            }
          }
          if (!symOk) continue;
        }
      }

      let nextL2v = l2v;
      let nextV2l = v2l;
      if (checkLetters) {
        nextL2v = new Map(l2v);
        nextV2l = new Map(v2l);
        if (!bindLineLetters(c.rows[r] ?? [], line, nextL2v, nextV2l)) continue;
      }

      grid[r] = line;

      if (portions) {
        const counts = portionCounts(
          p,
          grid.map((row, rr) => (rr <= r ? row : row.map(() => 0))),
        );
        const rem = remInPortion[r];
        let portionOk = true;
        for (const [k, v] of counts) {
          if (v > target || v + (rem?.get(k) ?? 0) < target) {
            portionOk = false;
            break;
          }
        }
        if (!portionOk) continue;
      }

      // Every column must still be possible with the rows so far.
      const ok = c.cols.every((runs, col) => {
        const colKnown = grid.map((row, rr) =>
          rr <= r ? (row[col] ?? 0) : (known[rr]?.[col] ?? -1),
        );
        const a = arrangements(runs, colKnown, 1);
        return a === null || a.length > 0;
      });
      if (ok) go(r + 1, nextL2v, nextV2l);
    }
    grid[r] = new Array<number>(W).fill(-1);
  };
  go(0, new Map(), new Map());
  return found;
}

export const solve = pictures;

/**
 * Count the pictures (up to `limit`) that match every clue and active twist.
 */
export const countPictures = (p: Panel, limit = 2, twists: Twists = {}, budget?: Budget): number =>
  pictures(p, limit, twists, budget).length;

export const countSolutions = countPictures;

/**
 * For a red-white-blue panel (`palette: 'RB'`), count how many combinations of
 * (Red picture, Blue picture) would fit if Red and Blue clues were solved
 * independently without cross-colour ordering and mutual exclusion. When this
 * is >= margin, neither colour can be solved without the other colour's help.
 */
export function countIndependentColours(p: Panel, limit = 3, budget?: Budget): number {
  if (!p.palette || p.palette.length < 2) return 1;
  const redRows = p.rows.map((row) => [...row].map((ch) => (ch === 'R' ? '#' : '.')).join(''));
  const blueRows = p.rows.map((row) => [...row].map((ch) => (ch === 'B' ? '#' : '.')).join(''));
  const redCount = countPictures({ name: 'red', rows: redRows }, limit, {}, budget);
  if (redCount >= limit) return redCount;
  const blueCount = countPictures({ name: 'blue', rows: blueRows }, limit, {}, budget);
  return Math.min(limit, redCount * blueCount);
}
