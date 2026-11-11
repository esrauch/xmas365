/**
 * Picture-grid rules: checking lines, whole grids, numbered eggs, fair-share
 * portions, and snowflake mirror frames.
 */
import { type Frame, mirrorSquare } from '../core/mirror';
import { type Panel, type Run, clues, picture, runIndexAt, runsOf } from './model';

/** Does a grid (0 empty / crossed, 1.. colours) match the panel's picture? */
export function matches(p: Panel, grid: number[][]): boolean {
  const want = picture(p);
  return grid.every((row, r) => row.every((v, c) => Math.max(v, 0) === want[r]?.[c]));
}

/**
 * Does a line (as filled so far) satisfy its clues? When a line has a hidden
 * clue ('?' or a letter), its length is unknown from the clue alone, so the
 * line only counts as done once every non-filled square in the line is crossed
 * out (no empty 0 squares remain).
 */
export function lineDone(runs: Run[], line: number[]): boolean {
  const have = runsOf(line.map((v) => Math.max(v, 0)));
  if (
    have.length !== runs.length ||
    !have.every((h, i) => h.colour === runs[i]?.colour && (runs[i]?.hidden || h.n === runs[i]?.n))
  ) {
    return false;
  }
  if (runs.some((r) => r.hidden)) {
    return line.every((v) => v !== 0);
  }
  return true;
}

/**
 * Do the eggs hold for a grid (each egg's square is filled as part of the
 * corresponding egg-marked run of its row)?
 */
export function eggsHold(p: Panel, grid: number[][]): boolean {
  const sol = picture(p);
  return (p.eggs ?? []).every(([r, c]) => {
    const row = grid[r] ?? [];
    const solRow = sol[r] ?? [];
    if ((row[c] ?? 0) <= 0 || (row[c] ?? 0) !== (solRow[c] ?? 0)) return false;
    const wantRun = runIndexAt(solRow, c);
    return wantRun >= 0 && runIndexAt(row, c) === wantRun;
  });
}

/**
 * Does `grid` satisfy every row clue, column clue, and active holiday twist of `p`?
 */
export function gridSolved(p: Panel, grid: number[][]): boolean {
  const c = clues(p);
  const H = c.rows.length;
  const W = c.cols.length;
  if (grid.length !== H) return false;
  const letterToVal = new Map<string, number>();
  const valToLetter = new Map<number, string>();
  const lineMatches = (runs: Run[], line: number[]): boolean => {
    const have = runsOf(line.map((v) => Math.max(v, 0)));
    if (have.length !== runs.length) return false;
    for (let i = 0; i < runs.length; i++) {
      const h = have[i] as Run;
      const want = runs[i] as Run;
      if (h.colour !== want.colour) return false;
      if (!want.hidden && h.n !== want.n) return false;
      if (want.letter) {
        if (p.letters) {
          const codeVal = p.letters.indexOf(want.letter) + 1;
          if (codeVal > 0 && h.n !== codeVal) return false;
        }
        const prevV = letterToVal.get(want.letter);
        if (prevV !== undefined && prevV !== h.n) return false;
        const prevL = valToLetter.get(h.n);
        if (prevL !== undefined && prevL !== want.letter) return false;
        letterToVal.set(want.letter, h.n);
        valToLetter.set(h.n, want.letter);
      }
    }
    return true;
  };
  for (let r = 0; r < H; r++) {
    if (!lineMatches(c.rows[r] ?? [], grid[r] ?? [])) return false;
  }
  for (let col = 0; col < W; col++) {
    const colLine = grid.map((row) => row[col] ?? 0);
    if (!lineMatches(c.cols[col] ?? [], colLine)) return false;
  }
  if (p.eggs?.length && !eggsHold(p, grid)) return false;
  if (p.frame && !frameSymmetric(p.frame, grid)) return false;
  if (p.portions) {
    const share = [...portionCounts(p, picture(p)).values()][0] ?? 0;
    if ([...portionCounts(p, grid).values()].some((v) => v !== share)) return false;
  }
  return true;
}

/** Filled squares in each portion. */
export function portionCounts(p: Panel, grid: number[][]): Map<string, number> {
  const counts = new Map<string, number>();
  grid.forEach((row, r) =>
    row.forEach((v, c) => {
      const k = p.portions?.[r]?.[c];
      if (k === undefined) return;
      counts.set(k, (counts.get(k) ?? 0) + (v > 0 ? 1 : 0));
    }),
  );
  return counts;
}

/**
 * Inside the snowflake frame, do the filled squares mirror across the frame's
 * axis? (Works in one colour or with red/blue paints: a square inside the
 * frame has the same paint as its mirror square.)
 */
export function frameSymmetric(f: Frame, grid: number[][]): boolean {
  for (let r = f.top; r <= f.bottom; r++) {
    for (let c = f.left; c <= f.right; c++) {
      const [mr, mc] = mirrorSquare(f, r, c);
      const a = Math.max(grid[r]?.[c] ?? 0, 0);
      const b = Math.max(grid[mr]?.[mc] ?? 0, 0);
      if (a !== b) return false;
    }
  }
  return true;
}
