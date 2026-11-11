/**
 * Generating picture-grid (Fireworks) panels: the plain puzzle, or any mix of
 * the six holiday twists, at easy (5×5), medium (7×7), and hard (9×9).
 */
import { Budget, within } from '../core/budget';
import { type Rng, rng, shuffle } from '../core/rng';
import { WORD_RULES, type WordRule, wordsFor } from '../core/words';
import { type Made, Rejections, type Spec, type Tier, trySeeds } from '../core/spec';
import {
  colourGrid,
  gridToRows,
  makeBaseGrid,
  makePortions,
  pickDarkClues,
  setupSnowAndSwitches,
} from './make';
import { type Panel, type Run, clues, runIndexAt } from './model';
import { countSolutions, solve } from './solve';
import { type PictureTwist, problems, without } from './verify';

export interface Shape {
  width: number;
  height: number;
  margin: number;
  dark: number;
  eggs: number;
}

export const SHAPES: Record<Tier, Shape> = {
  easy: { width: 5, height: 5, margin: 2, dark: 2, eggs: 2 },
  medium: { width: 7, height: 7, margin: 2, dark: 3, eggs: 3 },
  hard: { width: 9, height: 9, margin: 3, dark: 4, eggs: 4 },
};

/** Fireworks and summer-night words; every unique letter is a run length (`core/words.ts` picks by tier). */
export const MESSAGES = [
  // Easy: 3 or 4 unique letters.
  'BOOM',
  'ZOOM',
  'FIZZ',
  'GLOW',
  'STAR',
  'LOVE',
  'FIRE',
  'BANG',
  // Medium: 4 unique letters in 5.
  'STARS',
  'CHEER',
  'SWEET',
  'SHEEN',
  // 5 unique letters, 5 or 6 long.
  'SPARK',
  'SHINE',
  'FLAME',
  'HEART',
  'LIGHT',
  'BURST',
  'NIGHT',
  'BLAST',
  'FLASH',
  'BLAZE',
  'FLARE',
  'GLEAM',
  'GLINT',
  'SPARKS',
  'PARADE',
];

/**
 * Encode every letter of a word from `MESSAGES` (one that suits `rule`) as a
 * run length in `p`, so the message is all blanks: the player unscrambles the
 * clue letters into the word, which gives the numbers.
 */
export function encodeLetters(p: Panel, rule: WordRule, random: Rng): Panel | null {
  const c = clues(p);
  const lengths = new Set<number>();
  for (const line of [...c.rows, ...c.cols]) {
    for (const run of line) if (!run.hidden && run.n >= 1 && run.n <= 9) lengths.add(run.n);
  }
  const available = [...lengths];
  const words = wordsFor(MESSAGES, rule, available.length, (w) => shuffle(random, w));
  for (const word of words.slice(0, 8)) {
    const distinct = [...new Set(word)];
    const chosenLengths = shuffle(random, available).slice(0, distinct.length);
    const lettersArr = new Array<string>(Math.max(...chosenLengths)).fill(' ');
    const letterToDigit = new Map<string, string>();
    chosenLengths.forEach((n, idx) => {
      const ch = distinct[idx] as string;
      lettersArr[n - 1] = ch;
      letterToDigit.set(ch, String(n));
    });
    const letters = lettersArr.join('');
    const message = [...word].map((ch) => letterToDigit.get(ch) as string).join('');
    return { ...p, letters, message };
  }
  return null;
}

/**
 * Check whether `p` has clear opening footholds: at least one row or column
 * that is already complete from its side clue alone (no-X full line for
 * Patriotic `colours`, or numbers + mandatory gaps summing to line length),
 * and at least one generously sized visible run number. Letter runs count at
 * their values: the message's word gives them away.
 */
function hasOpeningFoothold(p: Panel): boolean {
  const c = clues(p);
  const H = p.rows.length;
  const W = p.rows[0]?.length ?? 0;
  const isColoured = Boolean(p.palette && p.palette.length > 1);

  const lineComplete = (runs: Run[], L: number): boolean => {
    if (runs.length === 0 || runs.some((r) => r.hidden && !r.letter)) return false;
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
    runs.filter((r) => !r.hidden || r.letter).map((r) => r.n),
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

      // Place an egg on each 'eggs' switch, then add hint eggs in other multi-run rows up to
      // shape.eggs (at most 1 egg per row). Each egg marks which run in its row covers that square.
      if (on.has('eggs')) {
        const c = clues(p);
        const eggSwitches = switches.filter((s) => s.owner === 'eggs');
        const eggs: [number, number, number][] = [];
        const usedRows = new Set<number>();
        const whichRun = (r: number, col: number): number => runIndexAt(grid[r] ?? [], col) + 1;
        for (const s of eggSwitches) {
          if ((grid[s.r]?.[s.c] ?? 0) <= 0) return why.no('egg switch corner not filled');
          // The switch's filled squares (in its two rows), each with its 1-based run index in its row.
          const spots: [number, number, number][] = [];
          for (const [r, col] of [
            [s.r, s.c],
            [s.r, s.c + 1],
            [s.r + 1, s.c],
            [s.r + 1, s.c + 1],
          ] as const) {
            if ((grid[r]?.[col] ?? 0) > 0 && (c.rows[r]?.length ?? 0) >= 2) {
              spots.push([r, col, whichRun(r, col)]);
            }
          }
          const best = spots.sort((a, b) => b[2] - a[2])[0];
          if (!best) return why.no('egg switch row has only 1 run');
          eggs.push(best);
          usedRows.add(best[0]);
        }
        if (!eggs.length) return why.no('no eggs placed');

        const candidates: [number, number, number][] = [];
        for (let r = 0; r < H; r++) {
          if (usedRows.has(r) || (c.rows[r]?.length ?? 0) < 2) continue;
          const row = grid[r] ?? [];
          const rowCandidates: [number, number, number][] = [];
          for (let col = 0; col < W; col++) {
            if ((row[col] ?? 0) > 0) {
              rowCandidates.push([r, col, whichRun(r, col)]);
            }
          }
          if (rowCandidates.length) {
            const chosen = shuffle(random, rowCandidates)[0];
            if (chosen) candidates.push(chosen);
          }
        }
        for (const cand of shuffle(random, candidates)) {
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

      // Verify unique solution before encoding letters, then assign letters to numbers on the board
      if (countSolutions(p, 2, {}, budget) !== 1) return why.no('not uniquely solvable');
      if (on.has('letters')) {
        const encoded = encodeLetters(p, WORD_RULES[spec.tier], random);
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
        if (twist === 'dark' || twist === 'colours' || twist === 'letters') continue;
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
