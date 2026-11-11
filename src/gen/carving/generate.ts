/**
 * Generating carving panels: the plain puzzle, or any mix of twists, at a tier.
 *
 * Solution-first: carve the grid into random portions and put each one's
 * size on a random square, then
 * 1. hide clues (letters, the dark), and for Easter baskets lay the food and
 *    take numbers away;
 * 2. if no clue-adding twist is on, keep the panel only if it has one answer;
 * 3. otherwise list the board's answers once, and choose colour marks, cuts
 *    and a snowflake frame against that list in memory until one answer
 *    is left;
 * 4. keep it only if each twist does work by the tier's margin and the shared
 *    checks (verify.ts) pass.
 */
import { Budget, within } from '../core/budget';
import { type Tagged, chooseClues, margins } from '../core/clues';
import { type Frame, area, frames, offAxis, symmetricIn } from '../core/mirror';
import { type Rng, rng, shuffle } from '../core/rng';
import { type Made, Rejections, type Spec, type Tier, trySeeds } from '../core/spec';
import { carve, colourCarving } from './make';
import { type Cell, type Colour, type Panel, type Rect, type Wall, parse, rowsOf } from './model';
import { cutsOf, owners } from './rules';
import { solve } from './solve';
import { type CarveTwist, problems } from './verify';

export interface Shape {
  width: number;
  height: number;
  minArea: number;
  maxArea: number;
  /** With twists: without any one twist, at least this many answers fit. */
  margin: number;
  /** Sizes to put in the dark. */
  dark: number;
  /** Sizes to write as letters. */
  letters: number;
  /** Foods each portion's Easter basket gets (one of each). */
  dishes: number;
}

/** A tier is a board size; the twists make it easier or harder as they fall. */
export const SHAPES: Record<Tier, Shape> = {
  easy: { width: 5, height: 5, minArea: 2, maxArea: 6, margin: 2, dark: 1, letters: 4, dishes: 2 },
  medium: {
    width: 7,
    height: 7,
    minArea: 2,
    maxArea: 8,
    margin: 3,
    dark: 2,
    letters: 5,
    dishes: 3,
  },
  hard: { width: 9, height: 9, minArea: 2, maxArea: 9, margin: 3, dark: 3, letters: 5, dishes: 3 },
};

/** Words for the letters' messages (Valentine's at the Thanksgiving table). */
export const MESSAGES = [
  'CORN',
  'FEAST',
  'GRAVY',
  'LOVE',
  'SWEET',
  'HEART',
  'TREAT',
  'KISS',
  'WARM',
  'BAKE',
  'ROAST',
  'CIDER',
  'SPICE',
  'MAPLE',
  'HONEY',
  'COOK',
];
/** Easter baskets: every portion gets one of each (egg, carrot, chocolate), as the board shows them. */
const BASKET = ['🥚', '🥕', '🍫'];
const ANSWER_LIST = 300;

const keyOf = (rects: Rect[]): string =>
  rects
    .map((x) => `${x.r},${x.c},${x.h},${x.w}`)
    .sort()
    .join(' ');

type CarveClue =
  | { twist: 'colours'; marks: Map<string, Colour> }
  | { twist: 'cuts'; wall: Wall }
  | { twist: 'snow'; frame: Frame };

/**
 * Encode every unique letter of a word from `MESSAGES` (at most `maxLetters`
 * distinct letters) as a size on the board, so the message is all numbered
 * blanks: the player unscrambles the word first and then solves the board.
 */
function encode(
  cells: Cell[][],
  maxLetters: number,
  random: Rng,
): { sizeLetters: string; message: string } | null {
  const sizes = [
    ...new Set(cells.flat().flatMap((x) => (x.n !== undefined && x.n <= 9 ? [x.n] : []))),
  ];
  if (sizes.length < 3) return null;
  const most = Math.min(maxLetters, sizes.length);
  const words = shuffle(
    random,
    MESSAGES.filter((w) => new Set(w).size <= most && new Set(w).size >= Math.min(3, most)),
  ).sort((a, b) => new Set(b).size - new Set(a).size);
  for (const word of words) {
    const letters = [...new Set(word)];
    const values = shuffle(random, sizes).slice(0, letters.length);
    if (values.length < letters.length) continue;
    const code = new Map(values.map((v, i) => [v, letters[i] as string]));
    // Plan first, change the cells only once the word works: every letter shows on
    // at least one portion (one letter alone is just a hidden given).
    const plan = new Map<Cell, string>();
    for (const [v, letter] of code) {
      const holders = shuffle(
        random,
        cells.flat().filter((cell) => cell.n === v),
      );
      holders.forEach((cell, i) => {
        if (i === 0 || random() < 0.75) plan.set(cell, letter);
      });
    }
    if (new Set(plan.values()).size < letters.length) continue;
    for (const [cell, letter] of plan) {
      delete cell.n;
      cell.letter = letter;
    }
    const sizeLetters = Array.from({ length: 9 }, (_, i) => code.get(i + 1) ?? ' ').join('');
    const byLetter = new Map([...code].map(([v, l]) => [l, String(v)]));
    return { sizeLetters, message: [...word].map((ch) => byLetter.get(ch) as string).join('') };
  }
  return null;
}

/** One attempt at a panel from one seed (null: try the next seed). */
export function makePanel(
  spec: Spec<CarveTwist>,
  seed: number,
  why = new Rejections(),
): Made<Panel> | null {
  const on = new Set(spec.twists);
  const shape = SHAPES[spec.tier];
  const random = rng(seed * 7919 + 29);
  const budget = new Budget(500_000);
  const { width: W, height: H } = shape;
  return (
    within(() => {
      const rects = carve({
        width: W,
        height: H,
        seed,
        minArea: on.has('basket') ? Math.max(shape.minArea, shape.dishes) : shape.minArea,
        maxArea: shape.maxArea,
      });
      if (!rects) return why.no('no carving');
      const truthKey = keyOf(rects);
      const cells: Cell[][] = Array.from({ length: H }, () =>
        Array.from({ length: W }, (): Cell => ({})),
      );
      const at = (r: number, c: number): Cell => (cells[r] as Cell[])[c] as Cell;
      // Every portion's size, on a random square of it (preferring breathing room from adjacent numbers);
      // an Easter basket lays one of each food too.
      const touchesNumber = (r: number, c: number): boolean =>
        (
          [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1],
          ] as const
        ).some(([nr, nc]) => cells[nr]?.[nc]?.n !== undefined);
      for (const x of rects) {
        const squares = shuffle(
          random,
          Array.from(
            { length: x.h * x.w },
            (_, i) => [x.r + Math.floor(i / x.w), x.c + (i % x.w)] as const,
          ),
        );
        const spacedIdx = squares.findIndex(([r, c]) => !touchesNumber(r, c));
        const pickIdx = spacedIdx >= 0 ? spacedIdx : 0;
        const first = squares[pickIdx];
        const rest = squares.filter((_, idx) => idx !== pickIdx);
        if (!first) return why.no('empty portion');
        at(first[0], first[1]).n = x.h * x.w;
        if (on.has('basket')) {
          const spots = rest.slice(0, shape.dishes);
          if (spots.length < shape.dishes) return why.no('a portion too small for its basket');
          spots.forEach(([r, c], i) => (at(r, c).dish = BASKET[i] ?? '🥚'));
        }
      }
      const adding = (['colours', 'cuts', 'snow'] as const).filter((t) => on.has(t));

      // 1. Hide clues (without letters: letters are encoded after the puzzle is generated).
      let letters: { sizeLetters: string; message: string } | null = null;
      const panelOf = (): Panel => ({
        name: 'generated',
        rows: rowsOf(cells),
        ...(letters ? letters : {}),
      });
      const unique = (): boolean => solve(parse(panelOf()), 2, {}, budget).length === 1;
      const sized = shuffle(
        random,
        cells.flatMap((row, r) =>
          row.flatMap((cell, c) => (cell.n !== undefined ? [[r, c] as const] : [])),
        ),
      );
      if (on.has('dark')) {
        let done = 0;
        for (const [r, c] of sized) {
          if (done >= shape.dark) break;
          const cell = at(r, c);
          if (cell.n === undefined) continue;
          const n = cell.n;
          delete cell.n;
          cell.dark = true;
          if (!adding.length && !on.has('basket') && !unique()) {
            delete cell.dark;
            cell.n = n;
            continue;
          }
          done++;
        }
        if (!done) return why.no('nothing to darken');
      }
      // Easter baskets: take sizes away (while one answer stays, or about half if other twists will settle it).
      if (on.has('basket')) {
        let removed = 0;
        const maxRemove = on.has('letters') ? Math.ceil(rects.length / 2) : rects.length;
        const freq = new Map<number, number>();
        for (const [r, c] of sized) {
          const n = at(r, c).n;
          if (n !== undefined) freq.set(n, (freq.get(n) ?? 0) + 1);
        }
        const order = on.has('letters')
          ? [...sized].sort(
              ([r1, c1], [r2, c2]) =>
                (freq.get(at(r2, c2).n ?? 0) ?? 0) - (freq.get(at(r1, c1).n ?? 0) ?? 0),
            )
          : sized;
        for (const [r, c] of order) {
          if (removed >= maxRemove) break;
          const cell = at(r, c);
          if (cell.n === undefined) continue;
          const n = cell.n;
          delete cell.n;
          if (adding.length ? removed >= rects.length / 2 : !unique()) {
            cell.n = n;
            continue;
          }
          freq.set(n, (freq.get(n) ?? 1) - 1);
          removed++;
        }
      }
      const p = panelOf();

      // 2. Nothing to add: one answer already, or try again.
      if (!adding.length) {
        if (!unique()) return why.no('not one answer');
        if (on.has('letters')) {
          letters = encode(cells, shape.letters, random);
          if (!letters) return why.no('no message fits');
        }
        return finish(panelOf(), { plain: 1 });
      }

      // 3. List the answers once; choose the adding twists' clues against them.
      const answers = solve(parse(p), ANSWER_LIST, {}, budget);
      if (answers.length < shape.margin) return why.no('too few answers to work with');
      if (answers.length >= ANSWER_LIST) return why.no('too many answers to list');
      const ownOf = new Map<Rect[], number[][]>();
      const own = (a: Rect[]): number[][] =>
        ownOf.get(a) ?? (ownOf.set(a, owners(H, W, a)), ownOf.get(a) ?? []);
      const cutOf = new Map<Rect[], Set<string>>();
      const cuts = (a: Rect[]): Set<string> =>
        cutOf.get(a) ?? (cutOf.set(a, cutsOf(H, W, a)), cutOf.get(a) ?? new Set());
      const truth = answers.find((a) => keyOf(a) === truthKey);
      if (!truth) return why.no('the carving was lost');
      const holds = (t: Tagged<CarveClue>, a: Rect[]): boolean => {
        const c = t.clue;
        const o = own(a);
        if (c.twist === 'cuts') {
          const [r, col, side] = c.wall;
          return side === 'v' ? o[r]?.[col] !== o[r]?.[col + 1] : o[r]?.[col] !== o[r + 1]?.[col];
        }
        if (c.twist === 'snow') return symmetricIn(c.frame, cuts(a));
        // Colours: each portion holds marks of one colour, and touching portions differ.
        const tone = a.map((): Colour | null => null);
        for (const [k, colour] of c.marks) {
          const [r, col] = k.split(',').map(Number) as [number, number];
          const i = o[r]?.[col] ?? -1;
          if (tone[i] && tone[i] !== colour) return false;
          tone[i] = colour;
        }
        return a.every((x, i) =>
          a.every(
            (y, j) =>
              j <= i ||
              !tone[i] ||
              tone[i] !== tone[j] ||
              !(
                (x.r < y.r + y.h && y.r < x.r + x.h && (x.c + x.w === y.c || y.c + y.w === x.c)) ||
                (x.c < y.c + y.w && y.c < x.c + x.w && (x.r + x.h === y.r || y.r + y.h === x.r))
              ),
          ),
        );
      };
      const truthOwn = own(truth);
      const candidates: Tagged<CarveClue>[] = [];
      if (on.has('cuts'))
        for (let r = 0; r < H; r++)
          for (let c = 0; c < W; c++) {
            if (c + 1 < W && truthOwn[r]?.[c] !== truthOwn[r]?.[c + 1])
              candidates.push({ twist: 'cuts', clue: { twist: 'cuts', wall: [r, c, 'v'] } });
            if (r + 1 < H && truthOwn[r]?.[c] !== truthOwn[r + 1]?.[c])
              candidates.push({ twist: 'cuts', clue: { twist: 'cuts', wall: [r, c, 'h'] } });
          }
      // Red, white and blue: every coloured portion marked (more marks than strictly needed,
      // so the colours read as a pattern, not a few stray dots).
      const marks = new Map<string, Colour>();
      if (on.has('colours')) {
        const tints = colourCarving(truth, random);
        truth.forEach((x, i) => {
          const colour = tints[i];
          if (!colour) return;
          const squares = shuffle(
            random,
            Array.from(
              { length: x.h * x.w },
              (_, j) => `${x.r + Math.floor(j / x.w)},${x.c + (j % x.w)}`,
            ),
          );
          if (squares[0]) marks.set(squares[0], colour);
        });
      }
      // Snowflakes: the largest, squarest frames where the true cuts mirror, with room outside.
      const board = W * H;
      const frameOptions: (Frame | null)[] = on.has('snow')
        ? frames(W, H, 3)
            .filter((f) => {
              const h = f.bottom - f.top + 1;
              const w = f.right - f.left + 1;
              return (
                area(f) <= board * 0.75 &&
                Math.min(h, w) / Math.max(h, w) >= 0.6 &&
                // The mirror line runs between squares: an even count across it.
                (f.axis === 'v' ? w : h) % 2 === 0 &&
                symmetricIn(f, cuts(truth)) &&
                offAxis(f, cuts(truth)) >= 3
              );
            })
            .sort((a, b) => area(b) - area(a))
            .slice(0, 20)
        : [null];
      if (!frameOptions.length) return why.no('no frame where the cuts mirror');
      let chosen: Tagged<CarveClue>[] | null = null;
      let m = new Map<string, number>();
      let failed = '';
      for (const frame of frameOptions) {
        const fixed: Tagged<CarveClue>[] = [
          ...(on.has('colours')
            ? [{ twist: 'colours', clue: { twist: 'colours', marks } } as const]
            : []),
          ...(frame ? [{ twist: 'snow', clue: { twist: 'snow', frame } } as const] : []),
        ];
        const tried = chooseClues({ answers, fixed, candidates, holds, random });
        if (!tried) {
          failed = "the clues can't settle it";
          continue;
        }
        const tm = margins(answers, tried, holds);
        const weak = adding.find((t) => (tm.get(t) ?? 0) < shape.margin);
        if (weak) {
          failed = `${weak} doesn't do enough`;
          continue;
        }
        chosen = tried;
        m = tm;
        break;
      }
      if (!chosen) return why.no(failed);
      // 4. Encode letters if requested, then check the panel from scratch.
      if (on.has('letters')) {
        letters = encode(cells, shape.letters, random);
        if (!letters) return why.no('no message fits');
      }
      const out: Panel = { ...panelOf() };
      if (marks.size)
        out.colours = Array.from({ length: H }, (_, r) =>
          Array.from({ length: W }, (_, c) => marks.get(`${r},${c}`) ?? '.').join(''),
        );
      const walls = chosen.flatMap((c) => (c.clue.twist === 'cuts' ? [c.clue.wall] : []));
      if (walls.length) out.walls = walls;
      const snow = chosen.find((c) => c.clue.twist === 'snow');
      if (snow?.clue.twist === 'snow') out.frame = snow.clue.frame;
      return finish(out, {
        plain: answers.length,
        ...Object.fromEntries([...m].map(([t, n]) => [`without ${t}`, n])),
      });
    }) ?? null
  );

  function finish(p: Panel, stats: Record<string, number>): Made<Panel> | null {
    const bad = problems(p, shape.margin);
    if (bad.length) return why.no(`check: ${(bad[0] ?? '').replace(/[0-9,]+/g, '#')}`);
    const steps = new Budget();
    solve(parse(p), 2, {}, steps);
    return { panel: p, seed, stats: { ...stats, steps: steps.used } };
  }
}

/** Up to `count` different panels for a spec, trying seeds from `from` for at most `seconds` in all. */
export function generate(
  spec: Spec<CarveTwist>,
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
