/**
 * Generating picture-grid (nonogram) panels: the plain puzzle, or any mix of
 * the six holiday twists, at easy (5×5), medium (7×7), and hard (9×9).
 */
import { Budget, within } from '../core/budget';
import { type Rng, rng, shuffle } from '../core/rng';
import { type Made, Rejections, type Spec, type Tier, trySeeds } from '../core/spec';
import {
  colourGrid,
  gridToRows,
  makeBaseGrid,
  makePortions,
  pickDarkClues,
  setupSnowAndSwitches,
} from './make';
import { type Panel, type Run, clues } from './model';
import { countSolutions, logical, solve } from './solve';
import { type PictureTwist, problems, without } from './verify';

export interface Shape {
  width: number;
  height: number;
  margin: number;
  dark: number;
  letters: number;
  eggs: number;
}

export const SHAPES: Record<Tier, Shape> = {
  easy: { width: 5, height: 5, margin: 2, dark: 2, letters: 2, eggs: 2 },
  medium: { width: 7, height: 7, margin: 2, dark: 3, letters: 3, eggs: 3 },
  hard: { width: 9, height: 9, margin: 3, dark: 4, letters: 3, eggs: 4 },
};

export const MESSAGES = [
  'SPARK',
  'SHINE',
  'GLOW',
  'FLAME',
  'STAR',
  'HEART',
  'LOVE',
  'FIRE',
  'LIGHT',
  'BOOM',
  'BURST',
  'NIGHT',
];

/**
 * Encode `count` distinct run lengths in `p` as letters from a word in
 * `MESSAGES`, verifying that replacing those letters with dark '?' clues leaves
 * at least `margin` answers while keeping 1 answer with the letter code.
 */
function encodeLetters(
  p: Panel,
  count: number,
  margin: number,
  random: Rng,
  budget: Budget,
): Panel | null {
  const c = clues(p);
  const freq = new Map<number, number>();
  for (const line of [...c.rows, ...c.cols]) {
    for (const run of line) {
      if (!run.hidden && run.n >= 1 && run.n <= 9) {
        freq.set(run.n, (freq.get(run.n) ?? 0) + 1);
      }
    }
  }
  const availableLengths = [...freq.keys()].sort((a, b) => (freq.get(a) ?? 0) - (freq.get(b) ?? 0));
  if (availableLengths.length < count) return null;

  const words = shuffle(
    random,
    MESSAGES.filter((w) => new Set(w).size >= count),
  );
  // Prefer less-frequent run lengths first so we don't hide every '1' on a 9×9 board
  const pool = availableLengths.slice(0, Math.min(availableLengths.length, count + 2));
  for (let attempt = 0; attempt < 8; attempt++) {
    const chosenLengths =
      attempt === 0 ? availableLengths.slice(0, count) : shuffle(random, pool).slice(0, count);
    const totalAffected = chosenLengths.reduce((sum, n) => sum + (freq.get(n) ?? 0), 0);
    if (totalAffected > 10) continue;
    const word = words[attempt % words.length];
    if (!word) continue;
    const distinctWordLetters = shuffle(random, [...new Set(word)]).slice(0, count);
    const maxN = Math.max(...chosenLengths);
    const lettersArr = new Array<string>(maxN).fill(' ');
    const letterToDigit = new Map<string, string>();
    chosenLengths.forEach((n, idx) => {
      const ch = distinctWordLetters[idx] as string;
      lettersArr[n - 1] = ch;
      letterToDigit.set(ch, String(n));
    });
    const letters = lettersArr.join('');
    const message = [...word].map((ch) => letterToDigit.get(ch) ?? ch).join('');
    const candidate: Panel = { ...p, letters, message };
    const subBudget = new Budget(8_000, budget.deadline);
    const ok = within(() => {
      if (countSolutions(without(candidate, 'letters'), margin, {}, subBudget) < margin)
        return false;
      if (countSolutions(candidate, 2, {}, subBudget) !== 1) return false;
      if (!onHasBoardTwist(candidate) && !logical(candidate)) return false;
      return true;
    });
    if (ok) return candidate;
  }
  return null;
}

function onHasBoardTwist(p: Panel): boolean {
  return Boolean(p.eggs?.length || p.portions?.length || p.frame);
}

/**
 * Check whether `p` has clear opening footholds: at least one row or column
 * that is already complete from its side clue alone (no-X full line for
 * Patriotic `colours`, or numbers + mandatory gaps summing to line length),
 * and at least one generously sized visible run number.
 */
function hasOpeningFoothold(p: Panel): boolean {
  const c = clues(p);
  const H = p.rows.length;
  const W = p.rows[0]?.length ?? 0;
  const isColoured = Boolean(p.palette && p.palette.length > 1);

  const lineComplete = (runs: Run[], L: number): boolean => {
    if (runs.length === 0 || runs.some((r) => r.hidden || r.letter)) return false;
    if (isColoured) {
      // Patriotic: a full line with no X (runs sum directly to L, no same-colour gaps)
      const noSameGap = runs.every((r, i) => i === 0 || runs[i - 1]?.colour !== r.colour);
      const sum = runs.reduce((s, r) => s + r.n, 0);
      if (noSameGap && sum === L) return true;
    }
    const minSpan = runs.reduce(
      (s, r, i) => s + r.n + (i > 0 && runs[i - 1]?.colour === r.colour ? 1 : 0),
      0,
    );
    return minSpan === L;
  };

  const completeCount =
    c.rows.filter((r) => lineComplete(r, W)).length +
    c.cols.filter((col) => lineComplete(col, H)).length;
  if (completeCount < 1) return false;

  const visibleNums = [...c.rows, ...c.cols].flatMap((runs) =>
    runs.filter((r) => !r.hidden && !r.letter).map((r) => r.n),
  );
  const minMaxRun = isColoured
    ? Math.max(3, Math.floor(Math.min(H, W) / 2))
    : Math.ceil(Math.min(H, W) / 2);
  return Math.max(0, ...visibleNums) >= minMaxRun;
}

/** One attempt at a picture-grid panel from one seed (null: try the next seed). */
export function makePanel(
  spec: Spec<PictureTwist>,
  seed: number,
  why = new Rejections(),
): Made<Panel> | null {
  const on = new Set(spec.twists);
  const shape = SHAPES[spec.tier];
  const random = rng(seed * 7919 + 31);
  const budget = new Budget(500_000);

  return (
    within(() => {
      const H = shape.height;
      const W = shape.width;
      const grid = makeBaseGrid(H, W, random);

      const needTwoPerTwist = shape.margin >= 3;
      const setup = setupSnowAndSwitches(
        grid,
        needTwoPerTwist,
        on.has('snow'),
        on.has('portions'),
        on.has('eggs'),
        random,
      );
      if (!setup) return why.no('could not place switches or frame');
      const { frame, switches } = setup;

      let portions: string[] | undefined;
      if (on.has('portions')) {
        const built = makePortions(grid, switches, frame, random);
        if (!built) return why.no('could not balance portions');
        portions = built;
      }

      let palette: string | undefined;
      if (on.has('colours')) {
        palette = 'RB';
        colourGrid(grid, switches, frame, random);
      }

      // Check that no row or column became completely empty after switch/portion setup
      if (grid.some((row) => row.every((v) => v <= 0))) return why.no('empty row');
      for (let col = 0; col < W; col++) {
        if (grid.every((row) => (row[col] ?? 0) <= 0)) return why.no('empty col');
      }

      let p: Panel = {
        name: 'generated',
        rows: gridToRows(grid, palette),
        ...(palette ? { palette } : {}),
        ...(frame ? { frame } : {}),
        ...(portions ? { portions } : {}),
      };

      // Place eggs on each 'eggs' switch's top-left filled corner (s.r, s.c),
      // then add hint eggs in other multi-run rows up to shape.eggs (at most 1 egg per row).
      if (on.has('eggs')) {
        const c = clues(p);
        const eggSwitches = switches.filter((s) => s.owner === 'eggs');
        const eggs: [number, number, number][] = [];
        const usedRows = new Set<number>();
        for (const s of eggSwitches) {
          if ((c.rows[s.r]?.length ?? 0) < 2) return why.no('egg switch row has only 1 run');
          const row = grid[s.r] ?? [];
          if ((row[s.c] ?? 0) <= 0) return why.no('egg switch corner not filled');
          const n = row.slice(0, s.c + 1).filter((v) => v > 0).length;
          eggs.push([s.r, s.c, n]);
          usedRows.add(s.r);
        }
        if (!eggs.length) return why.no('no eggs placed');

        const candidates: [number, number, number][] = [];
        for (let r = 0; r < H; r++) {
          if (usedRows.has(r) || (c.rows[r]?.length ?? 0) < 2) continue;
          const row = grid[r] ?? [];
          let count = 0;
          const rowCandidates: [number, number, number][] = [];
          for (let col = 0; col < W; col++) {
            if ((row[col] ?? 0) > 0) {
              count++;
              rowCandidates.push([r, col, count]);
            }
          }
          // Prefer n >= 2 when available in this row
          const preferred = rowCandidates.filter(([, , n]) => n >= 2);
          const pickFrom = preferred.length ? preferred : rowCandidates;
          if (pickFrom.length) {
            const chosen = shuffle(random, pickFrom)[0];
            if (chosen) candidates.push(chosen);
          }
        }
        // Prefer rows where chosen egg has n >= 2
        const shuffled = shuffle(random, candidates).sort(
          (a, b) => (b[2] >= 2 ? 1 : 0) - (a[2] >= 2 ? 1 : 0),
        );
        for (const cand of shuffled) {
          if (eggs.length >= shape.eggs) break;
          eggs.push(cand);
        }
        if (eggs.length < shape.eggs) return why.no('not enough rows for eggs');
        eggs.sort((a, b) => a[0] - b[0]);
        p = { ...p, eggs };
      }

      // Add dark clues if requested
      if (on.has('dark')) {
        const dark = pickDarkClues(p, shape.dark, random);
        if (!dark) return why.no('not enough multi-run lines for dark clues');
        p = { ...p, dark };
      }

      // Verify unique solution before encoding letters (or after if letters is on)
      if (!on.has('letters')) {
        if (countSolutions(p, 2, {}, budget) !== 1) return why.no('not uniquely solvable');
      } else {
        const encoded = encodeLetters(p, shape.letters, shape.margin, random, budget);
        if (!encoded) return why.no('no letter encoding fits');
        p = encoded;
      }

      if (!hasOpeningFoothold(p)) return why.no('weak opening foothold');

      const bad = problems(p, shape.margin, budget);
      if (bad.length) return why.no(`check: ${(bad[0] ?? '').replace(/[0-9,]+/g, '#')}`);

      const steps = new Budget();
      solve(p, 2, {}, steps);
      const stats: Record<string, number> = {
        steps: steps.used,
      };
      for (const twist of on) {
        if (twist === 'dark' || twist === 'colours') continue;
        stats[`without ${twist}`] = countSolutions(without(p, twist), shape.margin, {}, budget);
      }
      return { panel: p, seed, stats };
    }) ?? null
  );
}

/** Up to `count` different panels for a spec, trying seeds from `from` for at most `seconds` in all. */
export function generate(
  spec: Spec<PictureTwist>,
  count: number,
  seconds: number,
  from = 1,
  why = new Rejections(),
): Made<Panel>[] {
  const out: Made<Panel>[] = [];
  const deadline = Date.now() + seconds * 1000;
  let seed = from;
  while (out.length < count && Date.now() < deadline) {
    const left = (deadline - Date.now()) / 1000;
    const found = trySeeds(seed, left, (s) => makePanel(spec, s, why));
    if (!found) break;
    if (!out.some((m) => m.panel.rows.join('/') === found.result.panel.rows.join('/')))
      out.push(found.result);
    seed = found.seed + 1;
  }
  return out;
}
