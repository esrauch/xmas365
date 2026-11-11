/**
 * A solver for Words panels with every twist on, as the player sees them:
 * - the dark: a dark square could be any letter;
 * - the code: a number stands for one letter, the same everywhere, and
 *   different numbers for different letters;
 * - eggs: an egg's number is its square's place in its word;
 * - portions: no word crosses a portion's edge;
 * - bows: a word shows at most one colour, and two words bowed with one colour
 *   never touch;
 * - starts (every panel): each word's first letter is highlighted, so a word
 *   starts on a highlighted square and never runs through another.
 * It lists each word's options (the squares it could cover, and what that
 * says about the code), then lays every word down, filling the grid.
 */
import { Budget } from '../core/budget';
import { type Frame, inFrame, mirrorSquare } from '../core/mirror';
import { type Panel, type Spot, edge, key, letterAt, placeIn, stepBlocked, wallSet } from './model';

export { edge };

export interface Without {
  /** Leave a twist out (to measure what it does). */
  noDark?: boolean;
  noCode?: boolean;
  noEggs?: boolean;
  noPortions?: boolean;
  noBows?: boolean;
  noSnow?: boolean;
  noWalls?: boolean;
  /** Leave out the highlighted first letters (to measure what they do). */
  noStarts?: boolean;
}

/** One way a word could lie: its squares (sorted keys), and the code letters it needs. */
export interface Option {
  cells: string[];
  /** Code number → letter, from the coded squares this way covers. */
  code: Map<number, string>;
}

interface Look {
  wild: Set<string>;
  number: Map<string, number>;
  egg: Map<string, number>;
  portion: (k: string) => string;
  bow: Map<string, string>;
  frame: Frame | undefined;
  /** Fences, as the two squares' keys joined ('r,c|r,c', sorted). */
  walls: Set<string>;
  /** The highlighted first letters (null: not shown). */
  starts: Set<string> | null;
}

function look(p: Panel, rules: Without): Look {
  const number = new Map<string, number>();
  const code = rules.noCode ? '' : (p.code ?? '');
  if (code)
    p.rows.forEach((row, r) =>
      [...row].forEach((ch, c) => {
        const n = code.indexOf(ch);
        if (n >= 0) number.set(key([r, c]), n + 1);
      }),
    );
  return {
    wild: new Set(rules.noDark ? [] : (p.dark ?? []).map(key)),
    number,
    egg: new Map(rules.noEggs ? [] : (p.eggs ?? []).map((s) => [key(s), placeIn(p, s)])),
    portion: (k) => {
      if (rules.noPortions || !p.portions) return '';
      const [r, c] = k.split(',').map(Number) as Spot;
      return p.portions[r]?.[c] ?? '';
    },
    bow: new Map(
      rules.noBows ? [] : (p.bows ?? []).map(([r, c]) => [key([r, c]), p.colours?.[r]?.[c] ?? '']),
    ),
    frame: rules.noSnow ? undefined : p.frame,
    walls: rules.noWalls ? new Set() : wallSet(p.walls),
    starts: rules.noStarts ? null : new Set(p.words.flatMap((w) => (w.cells[0] ? [key(w.cells[0])] : []))),
  };
}

/** Every way `word` could lie on the board, as the player sees it. */
export function options(
  p: Panel,
  word: string,
  rules: Without = {},
  budget = new Budget(),
): Option[] {
  const seen = look(p, rules);
  const H = p.rows.length;
  const W = p.rows[0]?.length ?? 0;
  const out = new Map<string, Option>();
  const path: Spot[] = [];
  const go = (s: Spot, i: number): void => {
    budget.tick();
    const k = key(s);
    const n = seen.number.get(k);
    // A coded square shows a number (any letter, settled by the code); a dark one, anything.
    if (n === undefined && !seen.wild.has(k) && letterAt(p, s) !== word[i]) return;
    // Starts: the first letter on a highlighted square, and no other letter on one.
    if (seen.starts && seen.starts.has(k) !== (i === 0)) return;
    const egg = seen.egg.get(k);
    if (egg !== undefined && egg !== i + 1) return;
    if (path.length && seen.portion(k) !== seen.portion(key(path[0] as Spot))) return;
    // Cuts: no step across a fence or diagonally through its corner.
    if (path.length && stepBlocked(seen.walls, path[path.length - 1] as Spot, s)) return;
    // Snowflakes: no word crosses the frame's edge.
    if (path.length && seen.frame) {
      const f = seen.frame;
      const first = path[0] as Spot;
      if (inFrame(f, s[0], s[1]) !== inFrame(f, first[0], first[1])) return;
    }
    path.push(s);
    if (i === word.length - 1) {
      const cells = path.map(key);
      const code = new Map<number, string>();
      let fine = true;
      cells.forEach((c, j) => {
        const m = seen.number.get(c);
        if (m === undefined) return;
        const letter = word[j] as string;
        if (code.has(m) && code.get(m) !== letter) fine = false;
        code.set(m, letter);
      });
      const tones = new Set(cells.flatMap((c) => (seen.bow.has(c) ? [seen.bow.get(c)] : [])));
      if (fine && tones.size <= 1) {
        const sorted = [...cells].sort();
        const id = `${sorted.join(' ')}|${[...code].sort().join(';')}`;
        out.set(id, { cells: sorted, code });
      }
    } else
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const t: Spot = [s[0] + dr, s[1] + dc];
          if (
            (dr || dc) &&
            t[0] >= 0 &&
            t[0] < H &&
            t[1] >= 0 &&
            t[1] < W &&
            !path.some((x) => key(x) === key(t))
          )
            go(t, i + 1);
        }
    path.pop();
  };
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) go([r, c], 0);
  return [...out.values()];
}

/** Whole-board answers: up to `limit` ways to lay every word, filling the grid (each answer: each word's squares). */
export function answers(
  p: Panel,
  limit = 2,
  rules: Without = {},
  budget = new Budget(),
): string[][] {
  const seen = look(p, rules);
  const opts = framedOptions(p, rules, budget);
  const order = p.words
    .map((_, i) => i)
    .sort((a, b) => (opts[a]?.length ?? 0) - (opts[b]?.length ?? 0));
  const taken = new Map<string, number>();
  const tone: string[] = [];
  const pick: string[][] = [];
  const letterOf = new Map<number, string>();
  const numberOf = new Map<string, number>();
  const found: string[][] = [];
  const near = (k: string): string[] => {
    const [r, c] = k.split(',').map(Number) as Spot;
    return [key([r + 1, c]), key([r - 1, c]), key([r, c + 1]), key([r, c - 1])];
  };
  const go = (n: number): void => {
    budget.tick();
    if (found.length >= limit) return;
    if (n === order.length) {
      // Snowflakes: every word inside the frame has its mirror image laid too.
      if (seen.frame) {
        const laid = new Set(pick.map((cells) => cells.join(' ')));
        const f = seen.frame;
        if (pick.some((cells) => inside(f, cells) && !laid.has(mirrored(f, cells)))) return;
      }
      found.push(p.words.map((_, i) => (pick[i] ?? []).join(' ')));
      return;
    }
    const i = order[n] as number;
    for (const o of opts[i] ?? []) {
      if (o.cells.some((k) => taken.has(k))) continue;
      // The code is one-to-one across the whole board.
      const added: number[] = [];
      let fine = true;
      for (const [m, letter] of o.code) {
        const had = letterOf.get(m);
        if (had !== undefined) {
          if (had !== letter) fine = false;
          continue;
        }
        if (numberOf.has(letter)) fine = false;
        else {
          letterOf.set(m, letter);
          numberOf.set(letter, m);
          added.push(m);
        }
      }
      const mine = o.cells.map((k) => seen.bow.get(k)).find((t) => t !== undefined) ?? '';
      if (
        fine &&
        mine &&
        o.cells.some((k) =>
          near(k).some((t) => {
            const j = taken.get(t);
            return j !== undefined && tone[j] === mine;
          }),
        )
      )
        fine = false;
      if (fine) {
        for (const k of o.cells) taken.set(k, i);
        tone[i] = mine;
        pick[i] = o.cells;
        // Forward-check that every remaining word still has at least one non-overlapping option
        let viable = true;
        for (let m = n + 1; m < order.length; m++) {
          const j = order[m] as number;
          if (!(opts[j] ?? []).some((opt) => !opt.cells.some((k) => taken.has(k)))) {
            viable = false;
            break;
          }
        }
        if (viable) go(n + 1);
        for (const k of o.cells) taken.delete(k);
      }
      for (const m of added) {
        numberOf.delete(letterOf.get(m) as string);
        letterOf.delete(m);
      }
    }
  };
  go(0);
  return found;
}

/** The true answer, in the same form as `answers`. */
export const truthOf = (p: Panel): string[] =>
  p.words.map((w) => w.cells.map(key).sort().join(' '));

const inside = (f: Frame, cells: string[]): boolean =>
  cells.every((k) => {
    const [r, c] = k.split(',').map(Number) as Spot;
    return inFrame(f, r, c);
  });

/** A word's squares, mirrored in the frame (sorted keys, joined). */
const mirrored = (f: Frame, cells: string[]): string =>
  cells
    .map((k) => {
      const [r, c] = k.split(',').map(Number) as Spot;
      return key(mirrorSquare(f, r, c));
    })
    .sort()
    .join(' ');

/**
 * Every word's options, with snowflakes taken into account: a way to lie inside
 * the frame counts only if another word of the same length could lie on its
 * mirror image (which settles most of the board before any search).
 */
export function framedOptions(p: Panel, rules: Without = {}, budget = new Budget()): Option[][] {
  const all = p.words.map((w) => options(p, w.word, rules, budget));
  const f = rules.noSnow ? undefined : p.frame;
  if (!f) return all;
  for (let pass = 0; pass < 4; pass++) {
    const shapes = all.map((o) => new Set(o.map((x) => x.cells.join(' '))));
    for (const [i, o] of all.entries()) {
      const len = p.words[i]?.word.length ?? 0;
      all[i] = o.filter(
        (x) =>
          !inside(f, x.cells) ||
          shapes.some(
            (set, j) => j !== i && p.words[j]?.word.length === len && set.has(mirrored(f, x.cells)),
          ),
      );
    }
  }
  return all;
}
