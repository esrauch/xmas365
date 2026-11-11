/**
 * Generating webs panels: the plain puzzle, or any mix of twists, at a tier.
 *
 * Solution-first: grow a random web, number every knot, then
 * 1. hide clues (the dark, letters), which makes room for more answers;
 * 2. if no clue-adding twist is on, keep the panel only if it has one answer;
 * 3. otherwise list the board's answers once, and choose eggs, cuts (and
 *    colours) against that list in memory until one answer is left;
 * 4. keep it only if each twist does work by the tier's margin, and the
 *    shared checks (verify.ts) pass.
 */
import { Budget, within } from '../core/budget';
import { type Tagged, chooseClues, margins } from '../core/clues';
import { type Frame, symmetricIn } from '../core/mirror';
import { type Rng, rng, shuffle } from '../core/rng';
import { type Made, Rejections, type Spec, type Tier, trySeeds } from '../core/spec';
import { WORD_RULES, type WordRule, wordsFor } from '../core/words';
import { colourWeb, makeMirroredWeb, makeWeb, wholeBoard } from './make';
import { type Panel, type Wall, type Web, parse, wallsBetween } from './model';
import { distances, strokes } from './rules';
import { solve } from './solve';
import { type WebTwist, problems, reach } from './verify';

export interface Shape {
  width: number;
  height: number;
  knots: number;
  /** Chance of an extra thread between knots that can see each other: plain, and with twists (loops make room for them). */
  extra: { plain: number; twisted: number };
  doubles: number;
  /** With twists: without any one twist, at least this many answers fit. */
  margin: number;
  /** Knots to put in the dark. */
  dark: number;
}

/** A tier is a board size; the twists make it easier or harder as they fall. */
export const SHAPES: Record<Tier, Shape> = {
  easy: {
    width: 5,
    height: 5,
    knots: 7,
    extra: { plain: 0.3, twisted: 0.5 },
    doubles: 0.35,
    margin: 2,
    dark: 2,
  },
  medium: {
    width: 7,
    height: 7,
    knots: 13,
    extra: { plain: 0.4, twisted: 0.5 },
    doubles: 0.35,
    margin: 3,
    dark: 3,
  },
  hard: {
    width: 9,
    height: 9,
    knots: 22,
    extra: { plain: 0.45, twisted: 0.55 },
    doubles: 0.35,
    margin: 3,
    dark: 5,
  },
};

/** Valentine's-in-the-spider's-room words; every unique letter is a thread count (`core/words.ts` picks by tier). */
export const MESSAGES = [
  // Easy: 3 or 4 unique letters.
  'MOON',
  'KISS',
  'LOVE',
  'GLOW',
  'DARK',
  'FANG',
  'BOO',
  // Medium: 4 unique letters in 5.
  'SWEET',
  'TREAT',
  'SPELL',
  'SPOOK',
  'BROOM',
  'SKULL',
  // 5 unique letters, 5 or 6 long.
  'HEART',
  'CANDY',
  'TRICK',
  'NIGHT',
  'GHOST',
  'MAGIC',
  'CHARM',
  'WITCH',
  'RAVEN',
  'CRYPT',
  'HAUNT',
  'GHOUL',
  'FANGS',
  'CREEPY',
];

const ANSWER_LIST = 300;

const linkKey = (web: Web, i: number): string => {
  const l = web.links[i];
  const a = l && web.knots[l.a];
  const b = l && web.knots[l.b];
  return a && b ? `${a.r},${a.c}-${b.r},${b.c}` : '';
};

/** Threads on one web's links, carried over to another web of the same knots. */
function remap(from: Web, threads: number[], to: Web): number[] {
  const m = new Map(threads.map((n, i) => [linkKey(from, i), n]));
  return to.links.map((_, i) => m.get(linkKey(to, i)) ?? 0);
}

/** Put some knots in the dark; with `whileUnique`, only while the panel keeps one answer. */
function darken(
  p: Panel,
  count: number,
  random: Rng,
  budget: Budget,
  whileUnique: boolean,
): Panel | null {
  let q = p;
  let done = 0;
  const knots = shuffle(
    random,
    p.rows.flatMap((row, r) =>
      [...row].flatMap((ch, c) => (/[0-9]/.test(ch) ? [[r, c] as const] : [])),
    ),
  );
  for (const [r, c] of knots) {
    if (done >= count) break;
    const next: Panel = {
      ...q,
      rows: q.rows.map((row, i) => (i === r ? row.slice(0, c) + '?' + row.slice(c + 1) : row)),
    };
    if (whileUnique && solve(parse(next), 2, {}, budget).length !== 1) continue;
    q = next;
    done++;
  }
  return done ? q : null;
}

/** Pick a word that suits `rule` and assign each of its unique letters to a distinct visible number on the board. */
function encode(p: Panel, rule: WordRule, random: Rng): Panel | null {
  const shown = [
    ...new Set(
      p.rows.flatMap((row) => [...row].flatMap((ch) => (/[1-9]/.test(ch) ? [Number(ch)] : []))),
    ),
  ];
  for (const word of wordsFor(MESSAGES, rule, shown.length, (w) => shuffle(random, w))) {
    const letters = [...new Set(word)];
    const values = shuffle(random, shown).slice(0, letters.length);
    const code = new Map(values.map((v, i) => [v, letters[i] as string]));
    const rows = p.rows.map((row) =>
      [...row].map((ch) => (/[1-9]/.test(ch) ? (code.get(Number(ch)) ?? ch) : ch)).join(''),
    );
    const used = new Set(rows.join('').match(/[A-Z]/g) ?? []);
    if (used.size !== letters.length) continue;
    const byLetter = new Map([...code].map(([v, l]) => [l, String(v)]));
    const message = [...word].map((ch) => byLetter.get(ch) ?? ch).join('');
    if (/[^0-9 ]/.test(message)) continue;
    const letterStr = Array.from({ length: 9 }, (_, i) => code.get(i + 1) ?? ' ').join('');
    return { ...p, rows, letters: letterStr, message };
  }
  return null;
}

type WebClue =
  | { twist: 'colours' }
  | { twist: 'eggs'; knot: number; n: number }
  | { twist: 'cuts'; wall: string }
  | { twist: 'snow'; frame: Frame };

/** One attempt at a panel from one seed (null: try the next seed). */
export function makePanel(
  spec: Spec<WebTwist>,
  seed: number,
  why = new Rejections(),
): Made<Panel> | null {
  const on = new Set(spec.twists);
  const shape = SHAPES[spec.tier];
  const random = rng(seed * 7919 + 17);
  const budget = new Budget(600_000);
  return (
    within(() => {
      // Each extra clue-adding twist needs more answers to work on: more knots and loops (the board stays the tier's size).
      const extraTwists = Math.max(
        0,
        (['colours', 'eggs', 'cuts', 'snow'] as const).filter((t) => on.has(t)).length - 1,
      );
      const growing = {
        ...shape,
        knots: shape.knots + 3 * extraTwists,
        extra: Math.min(
          0.8,
          (on.size ? shape.extra.twisted : shape.extra.plain) + 0.15 * extraTwists,
        ),
        seed,
      };
      // Snowflakes on Webs cover the whole board: grow half, reflect it.
      const axis: 'v' | 'h' = random() < 0.5 ? 'v' : 'h';
      const made = on.has('snow') ? makeMirroredWeb({ ...growing, axis }) : makeWeb(growing);
      if (!made) return why.no('no web grown');
      // A tier is one size: the web must reach every edge of its board.
      const full = crop(made.panel);
      if (full.rows.length !== shape.height || (full.rows[0]?.length ?? 0) !== shape.width)
        return why.no("the web doesn't fill the board");
      // Red and green: colour the grown web along its threads (most knots coloured, a few plain).
      if (on.has('colours')) {
        made.panel.colours = colourWeb(parse(made.panel), made.threads, random);
        const plain = made.panel.rows.join('').replace(/\./g, '').length;
        const tinted = made.panel.colours.join('').replace(/\./g, '').length;
        if (tinted < plain * 0.7) return why.no('too few knots coloured');
      }
      // The grown web (no colours: its threads are numbered on it), and the coloured one (for what can reach what).
      const grown = parse({ name: 'grown', rows: made.panel.rows });
      const coloured = parse(made.panel);
      const adding = (['colours', 'eggs', 'cuts', 'snow'] as const).filter((t) => on.has(t));

      // 1. Hide clues (dark).
      let p: Panel = { name: 'generated', rows: made.panel.rows };
      if (on.has('dark')) {
        const q = darken(p, shape.dark, random, budget, !adding.length);
        if (!q) return why.no('nothing to darken');
        p = q;
      }
      const web = parse(p);
      const truth = remap(grown, made.threads, web);

      // 2. Nothing to add: one answer already, or try again.
      if (!adding.length) {
        if (solve(web, 2, {}, budget).length !== 1) return why.no('not one answer');
        if (on.has('letters')) {
          const q = encode(p, WORD_RULES[spec.tier], random);
          if (!q) return why.no('no message fits');
          p = q;
        }
        return finish(p, shape.margin, { plain: 1 });
      }

      // 3. List the answers once; choose the adding twists' clues against them.
      const answers = solve(web, ANSWER_LIST, {}, budget);
      if (answers.length < shape.margin) return why.no('too few answers to work with');
      if (answers.length >= ANSWER_LIST) return why.no('too many answers to list');
      const same = (a: number[]): boolean => a.every((v, i) => v === truth[i]);
      const colour = (k: number): string | undefined =>
        made.panel.colours?.[web.knots[k]?.r ?? -1]?.[web.knots[k]?.c ?? -1];
      const home = on.has('eggs')
        ? (shuffle(
            random,
            web.knots.map((_, i) => i),
          )[0] ?? 0)
        : 0;
      const distOf = new Map<number[], number[]>();
      const dist = (a: number[]): number[] =>
        distOf.get(a) ?? (distOf.set(a, distances(web, a, home)), distOf.get(a) ?? []);
      const holds = (t: Tagged<WebClue>, a: number[]): boolean => {
        const c = t.clue;
        if (c.twist === 'colours')
          return web.links.every((l, i) => {
            // Plain knots join anything; two bulbs of one colour never.
            const x = colour(l.a);
            return !a[i] || x === undefined || x === '.' || x !== colour(l.b);
          });
        if (c.twist === 'eggs') return dist(a)[c.knot] === c.n;
        if (c.twist === 'cuts') return (across.get(c.wall) ?? []).every((i) => !a[i]);
        return symmetricIn(c.frame, drawn(a));
      };
      // Snowflakes: what each answer draws (memoised).
      const drawnOf = new Map<number[], Set<string>>();
      const drawn = (a: number[]): Set<string> =>
        drawnOf.get(a) ?? (drawnOf.set(a, strokes(web, a)), drawnOf.get(a) ?? new Set());
      // Cuts: which links would cross each wall (placed at the middle of the gap between knots).
      const across = new Map<string, number[]>();
      web.links.forEach((l, i) => {
        const a = web.knots[l.a];
        const b = web.knots[l.b];
        if (a && b) {
          const ws = wallsBetween(a, b);
          const mid = ws[Math.floor(ws.length / 2)];
          if (mid) across.set(mid, [...(across.get(mid) ?? []), i]);
        }
      });
      const candidates: Tagged<WebClue>[] = [];
      if (on.has('cuts'))
        // A wall goes only where the answer's threads don't cross (and some other thread could).
        for (const [wall, links] of across)
          if (links.every((i) => !truth[i]))
            candidates.push({ twist: 'cuts', clue: { twist: 'cuts', wall } });
      if (on.has('eggs')) {
        // Only eggs that refute the obvious path: more threads than the fewest links that could reach them.
        const near = reach(coloured, home);
        dist(truth).forEach((n, k) => {
          if (k !== home && n >= 2 && n > (near[k] ?? 0))
            candidates.push({ twist: 'eggs', clue: { twist: 'eggs', knot: k, n } });
        });
      }
      // Snowflakes: on Webs, the whole board is the frame (the joins mirror; singles and doubles don't).
      const frameOptions: (Frame | null)[] = on.has('snow')
        ? [wholeBoard(shape.width, shape.height, axis)]
        : [null];
      if (!frameOptions.length) return why.no('no frame where the web mirrors');
      let chosen: Tagged<WebClue>[] | null = null;
      let m = new Map<string, number>();
      let failed = '';
      for (const frame of frameOptions) {
        const fixed: Tagged<WebClue>[] = [
          ...(on.has('colours') ? [{ twist: 'colours', clue: { twist: 'colours' } } as const] : []),
          ...(frame ? [{ twist: 'snow', clue: { twist: 'snow', frame } } as const] : []),
        ];
        const tried = chooseClues({ answers, fixed, candidates, holds, random });
        if (!tried) {
          failed = "the clues can't settle it";
          continue;
        }
        const left = answers.filter((a) => tried.every((c) => holds(c, a)));
        if (left.length !== 1 || !left[0] || !same(left[0])) {
          failed = 'settled on the wrong answer';
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

      // 4. The panel, checked again from scratch.
      let out: Panel = { ...p };
      if (on.has('colours') && made.panel.colours) out.colours = made.panel.colours;
      const snow = chosen.find((c) => c.clue.twist === 'snow');
      if (snow?.clue.twist === 'snow') out.frame = snow.clue.frame;
      const eggs = chosen.flatMap((c) => (c.clue.twist === 'eggs' ? [c.clue] : []));
      if (eggs.length) {
        const h = web.knots[home];
        if (h) out.home = [h.r, h.c];
        out.eggs = eggs.flatMap((e) => {
          const k = web.knots[e.knot];
          return k ? [[k.r, k.c, e.n] as [number, number, number]] : [];
        });
      }
      const walls = chosen.flatMap((c) => (c.clue.twist === 'cuts' ? [c.clue.wall] : []));
      if (walls.length)
        out.walls = walls.map((w) => {
          const [r, c, side] = w.split(',');
          return [Number(r), Number(c), side === 'v' ? 'v' : 'h'] as Wall;
        });
      if (on.has('letters')) {
        const q = encode(out, WORD_RULES[spec.tier], random);
        if (!q) return why.no('no message fits');
        out = q;
      }
      return finish(out, shape.margin, {
        plain: answers.length,
        ...Object.fromEntries([...m].map(([t, n]) => [`without ${t}`, n])),
      });
    }) ?? null
  );

  function finish(raw: Panel, margin: number, stats: Record<string, number>): Made<Panel> | null {
    const p = crop(raw);
    const bad = problems(p, margin);
    if (bad.length) return why.no(`check: ${(bad[0] ?? '').replace(/[0-9,]+/g, '#')}`);
    const steps = new Budget();
    solve(parse(p), 2, {}, steps);
    return { panel: p, seed, stats: { ...stats, steps: steps.used } };
  }
}

/** Trim empty rows and columns from the board's edges (and every clue with them). */
export function crop(p: Panel): Panel {
  const knot = (ch: string | undefined): boolean => ch !== undefined && ch !== '.';
  const rows = p.rows.map((_, r) => r).filter((r) => [...(p.rows[r] ?? '')].some(knot));
  const cols = [...(p.rows[0] ?? '')]
    .map((_, c) => c)
    .filter((c) => p.rows.some((row) => knot(row[c])));
  const top = rows[0] ?? 0;
  const bottom = rows[rows.length - 1] ?? p.rows.length - 1;
  const left = cols[0] ?? 0;
  const right = cols[cols.length - 1] ?? (p.rows[0]?.length ?? 1) - 1;
  const cut = (grid: string[]): string[] =>
    grid.slice(top, bottom + 1).map((row) => row.slice(left, right + 1));
  const q: Panel = { ...p, rows: cut(p.rows) };
  if (p.colours) q.colours = cut(p.colours);
  if (p.home) q.home = [p.home[0] - top, p.home[1] - left];
  if (p.eggs) q.eggs = p.eggs.map(([r, c, n]) => [r - top, c - left, n]);
  if (p.ends)
    q.ends = [
      [p.ends[0][0] - top, p.ends[0][1] - left],
      [p.ends[1][0] - top, p.ends[1][1] - left],
    ];
  if (p.rowFlags) q.rowFlags = p.rowFlags.slice(top, bottom + 1);
  if (p.colFlags) q.colFlags = p.colFlags.slice(left, right + 1);
  if (p.walls) q.walls = p.walls.map(([r, c, side]) => [r - top, c - left, side]);
  if (p.frame)
    q.frame = {
      ...p.frame,
      top: p.frame.top - top,
      bottom: p.frame.bottom - top,
      left: p.frame.left - left,
      right: p.frame.right - left,
    };
  return q;
}

/** Up to `count` different panels for a spec, trying seeds from `from` for at most `seconds` in all. */
export function generate(
  spec: Spec<WebTwist>,
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
