/**
 * Words (Valentine's): Strands (the New York Times' Strands), a grid of letters that is
 * entirely themed words. Drag through touching letters (diagonals too) to
 * spell one; every letter is in exactly one theme word, and bigger boards
 * have a spangram, a theme word that runs from one side to the other. Every
 * word's first letter is highlighted until it's found.
 *
 * The twists, each optional on a panel:
 * - red, white and blue (Fourth of July): words are coloured, only the bowed
 *   letters show their word's colour, and two words of one colour never touch
 *   (colours 'r' red and 'b' blue; plain words are white and touch anything;
 *   older panels: 'r', 'g' and 'w' plain);
 * - cuts (Thanksgiving): fences between neighbouring squares that no word
 *   steps straight across (older panels: portions, none crossed by a word,
 *   each holding the same number of words);
 * - snowflakes (Christmas): inside a frame, words come in mirror pairs: each
 *   word's squares mirror another word's, its letters in a different order;
 * - the dark (Halloween): some vowels are hidden until a word through them
 *   is found;
 * - numbered eggs (Easter): some letters carry their place in their word
 *   (3 or more: the first letter is highlighted already);
 * - letters for numbers (Valentine's own): some letters are written as
 *   numbers, the same number always the same letter, revealed everywhere
 *   when a word through one is found.
 *
 * Here: the rules, the checks the tests use (the words fill the grid, each
 * word can be spelled only one way), and the generator that lays words out.
 */
import type { Frame } from '../core/mirror';
import { rng, shuffle } from '../core/rng';

export type Spot = [number, number];

export interface Word {
  word: string;
  /** Its letters' squares, in order. */
  cells: Spot[];
}

export interface Panel {
  name: string;
  /** The theme, shown above the board. */
  theme: string;
  /** The letters, row by row. */
  rows: string[];
  /** The theme words and where they lie (the spangram first, if any). */
  words: Word[];
  /** The first word is a spangram (runs from one side of the board to the other). */
  spangram?: boolean;
  /** Squares whose letter is in the dark. */
  dark?: Spot[];
  /** Squares with a numbered egg (their place in their word). */
  eggs?: Spot[];
  /** Letters written as numbers (the first letter is 1, and so on). */
  code?: string;
  /** Red and green: each square's colour, row by row ('r', 'g', 'w' plain); a word is all one colour, and two words of a colour never touch (plain ones can). */
  colours?: string[];
  /** Fair shares: the board's portions, a letter per square; each holds the same number of words, none crossing an edge. */
  portions?: string[];
  /** Bows: the letters that show their word's colour (the rest are plain to look at). */
  bows?: Spot[];
  /** Cuts: fences between neighbouring squares that no word steps across. [row, column, side]: 'v' the square's right edge, 'h' its bottom edge. */
  walls?: [number, number, 'v' | 'h'][];
  /** Snowflakes: inside this frame, words come in mirror pairs (each word's squares mirror another's, its letters in a different order); no word crosses the frame. */
  frame?: Frame;
}

export const key = ([r, c]: Spot): string => `${r},${c}`;
export const touching = (a: Spot, b: Spot): boolean =>
  Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) === 1;

/** A fence's key: the two squares either side of it (in either order). */
export const edge = (a: Spot, b: Spot): string => [key(a), key(b)].sort().join('|');

/** The fence keys ('r,c|r,c') for a panel's walls. */
export const wallSet = (walls: Panel['walls'] = []): Set<string> =>
  new Set(walls.map(([r, c, side]) => edge([r, c], side === 'v' ? [r, c + 1] : [r + 1, c])));

/**
 * Does a fence block stepping from `a` to `b`?
 * Orthogonal steps cross the shared edge; diagonal steps pass through the shared
 * 2×2 corner, so any fence touching that corner (the 4 edges of the 2×2 square)
 * blocks the diagonal.
 */
export function stepBlocked(walls: Set<string>, a: Spot, b: Spot): boolean {
  if (!walls.size) return false;
  if (a[0] === b[0] || a[1] === b[1]) return walls.has(edge(a, b));
  const c: Spot = [a[0], b[1]];
  const d: Spot = [b[0], a[1]];
  return (
    walls.has(edge(a, c)) || walls.has(edge(a, d)) || walls.has(edge(b, c)) || walls.has(edge(b, d))
  );
}

/** The letter at a square. */
export const letterAt = (p: Panel, [r, c]: Spot): string => p.rows[r]?.[c] ?? '';

/** Vowels (the only letters the dark may hide). */
export const isVowel = (ch: string): boolean => 'AEIOU'.includes(ch.toUpperCase()) && ch !== '';

/** The word a dragged path finds (its index), if it spells a theme word over that word's own squares. */
export function find(p: Panel, path: Spot[]): number {
  const walls = wallSet(p.walls);
  if (path.some((s, i) => i > 0 && stepBlocked(walls, path[i - 1] as Spot, s))) return -1;
  // The path must spell the word over exactly its squares, in any order: with repeated
  // letters (the Ms of MUMMY) there can be more than one way through the same squares.
  const squares = path.map(key).sort().join(' ');
  const spelled = path.map((s) => letterAt(p, s)).join('');
  return p.words.findIndex(
    (w) => w.word === spelled && w.cells.map(key).sort().join(' ') === squares,
  );
}

/** Each square's place in its word (1-based), for the eggs. */
export function placeIn(p: Panel, s: Spot): number {
  for (const w of p.words) {
    const i = w.cells.findIndex((x) => key(x) === key(s));
    if (i >= 0) return i + 1;
  }
  return 0;
}

/**
 * Every way to spell `word` in the grid, as distinct sets of squares. With
 * `dark`, those squares match any letter (as they look to the player).
 */
export function spellings(p: Panel, word: string, dark: Spot[] = []): string[] {
  const wild = new Set(dark.map(key));
  const walls = wallSet(p.walls);
  const H = p.rows.length;
  const W = p.rows[0]?.length ?? 0;
  const found = new Set<string>();
  const path: Spot[] = [];
  const go = (s: Spot, i: number): void => {
    if (!wild.has(key(s)) && letterAt(p, s) !== word[i]) return;
    path.push(s);
    if (i === word.length - 1) found.add(path.map(key).sort().join(' '));
    else
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const t: Spot = [s[0] + dr, s[1] + dc];
          if (
            (dr || dc) &&
            t[0] >= 0 &&
            t[0] < H &&
            t[1] >= 0 &&
            t[1] < W &&
            !stepBlocked(walls, s, t) &&
            !path.some((x) => key(x) === key(t))
          )
            go(t, i + 1);
        }
    path.pop();
  };
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) go([r, c], 0);
  // Fair shares and red and green rule out spellings that cross a portion's edge or mix colours.
  const same = (cells: string[], grid: string[] | undefined): boolean =>
    !grid ||
    new Set(
      cells.map((k) => {
        const [r, c] = k.split(',').map(Number) as Spot;
        return grid[r]?.[c];
      }),
    ).size === 1;
  // Colours count only where the player can see them: on the bows.
  const bowColour = new Map((p.bows ?? []).map(([r, c]) => [key([r, c]), p.colours?.[r]?.[c]]));
  return [...found].filter((set) => {
    const cells = set.split(' ');
    const seen = new Set(cells.flatMap((k) => (bowColour.has(k) ? [bowColour.get(k)] : [])));
    return same(cells, p.portions) && (p.bows ? seen.size <= 1 : same(cells, p.colours));
  });
}

/** Two diagonal steps that cross each other (an X between four squares). */
const crosses = (a: Spot, b: Spot, c: Spot, d: Spot): boolean =>
  Math.abs(a[0] - b[0]) === 1 &&
  Math.abs(a[1] - b[1]) === 1 &&
  Math.abs(c[0] - d[0]) === 1 &&
  Math.abs(c[1] - d[1]) === 1 &&
  Math.min(a[0], b[0]) === Math.min(c[0], d[0]) &&
  Math.min(a[1], b[1]) === Math.min(c[1], d[1]) &&
  key(a) !== key(c) &&
  key(a) !== key(d);

/**
 * Lay the words out to fill an h×w grid exactly (null if this seed can't).
 * With `keep`, those words stay where they are and `words` fill the rest
 * (to re-lay a few words in place); the result lists the kept words first.
 */
export function layOut(
  words: string[],
  h: number,
  w: number,
  seed: number,
  spangram = false,
  keep: Word[] = [],
  /** Search steps before giving up (default: more for bigger boards). */
  searchSteps?: number,
): Panel | null {
  const random = rng(seed);
  const kept = keep.reduce((s, x) => s + x.word.length, 0);
  if (words.reduce((s, x) => s + x.length, 0) + kept !== h * w)
    throw new Error(`${words.join()} don't fill ${h}×${w}`);
  const grid: string[][] = Array.from({ length: h }, () => Array<string>(w).fill(''));
  const placed: Word[] = [];
  const steps: [Spot, Spot][] = [];
  const free = (s: Spot): boolean =>
    s[0] >= 0 && s[0] < h && s[1] >= 0 && s[1] < w && grid[s[0]]?.[s[1]] === '';
  const neighbours = (s: Spot): Spot[] => {
    const out: Spot[] = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) if (dr || dc) out.push([s[0] + dr, s[1] + dc]);
    return shuffle(random, out);
  };
  let budget = searchSteps ?? 20000 + 400 * h * w;
  // Empty squares fall into pieces; each must be fillable by some of the words left.
  const fillable = (left: string[]): boolean => {
    const seen = new Set<string>();
    const lengths = left.map((x) => x.length);
    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++) {
        if (!free([r, c]) || seen.has(key([r, c]))) continue;
        let size = 0;
        const stack: Spot[] = [[r, c]];
        seen.add(key([r, c]));
        while (stack.length) {
          const s = stack.pop() as Spot;
          size++;
          for (const t of neighbours(s))
            if (free(t) && !seen.has(key(t))) {
              seen.add(key(t));
              stack.push(t);
            }
        }
        // Can some of the lengths add up to this piece's size?
        const sums = new Set([0]);
        for (const n of lengths) for (const v of [...sums]) sums.add(v + n);
        if (!sums.has(size)) return false;
      }
    return true;
  };
  // Grow a path for `word` from `start`, through free squares, without crossing any laid step.
  const grow = (word: string, path: Spot[], done: (path: Spot[]) => boolean): boolean => {
    if (budget-- < 0) return false;
    if (path.length === word.length) return done(path);
    const last = path[path.length - 1] as Spot;
    for (const t of neighbours(last)) {
      if (!free(t) || path.some((x) => key(x) === key(t))) continue;
      if (steps.some(([a, b]) => crosses(a, b, last, t))) continue;
      if (path.some((x, i) => i > 0 && crosses(path[i - 1] as Spot, x, last, t))) continue;
      path.push(t);
      if (grow(word, path, done)) return true;
      path.pop();
    }
    return false;
  };
  const lay = (word: string, path: Spot[]): void => {
    path.forEach(([r, c], i) => ((grid[r] as string[])[c] = word[i] as string));
    path.forEach((s, i) => i > 0 && steps.push([path[i - 1] as Spot, s]));
    placed.push({ word, cells: path.map((s) => [s[0], s[1]] as Spot) });
  };
  const unlay = (path: Spot[]): void => {
    for (const [r, c] of path) (grid[r] as string[])[c] = '';
    steps.splice(steps.length - (path.length - 1), path.length - 1);
    placed.pop();
  };
  const fill = (left: string[]): boolean => {
    if (!left.length) return true;
    if (!fillable(left)) return false;
    // The first empty square starts (or ends) one of the words left.
    let first: Spot | null = null;
    for (let r = 0; r < h && !first; r++)
      for (let c = 0; c < w && !first; c++) if (free([r, c])) first = [r, c];
    const order = shuffle(
      random,
      left.map((_, i) => i),
    );
    for (const i of order) {
      const word = left[i] as string;
      for (const backwards of random() < 0.5 ? [false, true] : [true, false]) {
        const spelled = backwards ? [...word].reverse().join('') : word;
        const rest = left.filter((_, j) => j !== i);
        const ok = grow(spelled, [first as Spot], (path) => {
          const cells = backwards ? [...path].reverse() : [...path];
          lay(word, cells);
          if (fill(rest)) return true;
          unlay(cells);
          return false;
        });
        if (ok) return true;
      }
    }
    return false;
  };
  for (const k of keep) lay(k.word, k.cells);
  const fresh = placed.length;
  let ok: boolean;
  if (spangram) {
    // The spangram first: from the left side to the right (or top to bottom).
    const word = words[0] as string;
    const across = random() < 0.5 || w > h;
    const starts: Spot[] = Array.from({ length: across ? h : w }, (_, i) =>
      across ? [i, 0] : [0, i],
    );
    ok = shuffle(random, starts).some((start) =>
      grow(word, [start], (path) => {
        const last = path[path.length - 1] as Spot;
        if (across ? last[1] !== w - 1 : last[0] !== h - 1) return false;
        lay(word, [...path]);
        if (fill(words.slice(1))) return true;
        unlay([...path]);
        return false;
      }),
    );
  } else ok = fill(words);
  if (!ok) return null;
  const panel: Panel = {
    name: 'generated',
    theme: '',
    rows: grid.map((row) => row.join('')),
    words: [],
  };
  // Keep the words in the order given.
  const laid = placed.slice(fresh);
  panel.words = [...keep, ...words.map((x) => laid.find((p) => p.word === x) as Word)];
  if (spangram) panel.spangram = true;
  return panel;
}

/** The words fill the grid exactly, each laid along touching squares, spelling itself. */
export function wellFormed(p: Panel): boolean {
  const seen = new Set<string>();
  const walls = wallSet(p.walls);
  for (const w of p.words) {
    if (w.cells.map((s) => letterAt(p, s)).join('') !== w.word) return false;
    if (
      w.cells.some(
        (s, i) =>
          i > 0 &&
          (!touching(w.cells[i - 1] as Spot, s) || stepBlocked(walls, w.cells[i - 1] as Spot, s)),
      )
    )
      return false;
    for (const s of w.cells) {
      if (seen.has(key(s))) return false;
      seen.add(key(s));
    }
  }
  return seen.size === p.rows.length * (p.rows[0]?.length ?? 0);
}

/** Red and green, and fair shares, hold: each word one colour and in one portion; same-colour words never touch; every portion holds the same number of words. */
export function sharesAndColours(p: Panel): boolean {
  const colour = ([r, c]: Spot): string => p.colours?.[r]?.[c] ?? '';
  const portion = ([r, c]: Spot): string => p.portions?.[r]?.[c] ?? '';
  const owner = new Map<string, number>();
  p.words.forEach((w, i) => w.cells.forEach((s) => owner.set(key(s), i)));
  for (const [i, w] of p.words.entries()) {
    if (p.colours && new Set(w.cells.map(colour)).size !== 1) return false;
    if (p.portions && new Set(w.cells.map(portion)).size !== 1) return false;
    if (p.colours)
      for (const [r, c] of w.cells)
        for (const t of [
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1],
        ] as Spot[]) {
          const j = owner.get(key(t));
          // Plain ('w') words can touch anything.
          if (j !== undefined && j !== i && colour(t) !== 'w' && colour(t) === colour([r, c]))
            return false;
        }
  }
  if (p.portions) {
    const counts = new Map<string, number>();
    for (const w of p.words)
      counts.set(portion(w.cells[0] as Spot), (counts.get(portion(w.cells[0] as Spot)) ?? 0) + 1);
    if (new Set(counts.values()).size > 1) return false;
  }
  return true;
}

export interface Rules {
  /** Ignore the bows and colours (to check that they matter). */
  noColours?: boolean;
  /** Ignore the portions. */
  noPortions?: boolean;
}

/**
 * Whole-grid answers: up to `limit` ways to lay every word on its own squares,
 * filling the grid, with the twists the player can see: no word crosses a
 * portion's edge, no word carries bows of two colours, and two words with
 * bows of one colour never touch.
 */
export function tilings(p: Panel, limit = 2, rules: Rules = {}): string[][] {
  const plain: Panel = { name: p.name, theme: p.theme, rows: p.rows, words: p.words };
  if (p.portions && !rules.noPortions) plain.portions = p.portions;
  const options = p.words.map((w) => spellings(plain, w.word).map((s) => s.split(' ')));
  const bowColour = new Map(
    rules.noColours ? [] : (p.bows ?? []).map(([r, c]) => [key([r, c]), p.colours?.[r]?.[c] ?? '']),
  );
  const order = p.words
    .map((_, i) => i)
    .sort((a, b) => (options[a]?.length ?? 0) - (options[b]?.length ?? 0));
  const taken = new Map<string, number>();
  const tone: string[] = [];
  const pick: string[][] = [];
  const found: string[][] = [];
  const near = (k: string): string[] => {
    const [r, c] = k.split(',').map(Number) as Spot;
    return [key([r + 1, c]), key([r - 1, c]), key([r, c + 1]), key([r, c - 1])];
  };
  const go = (n: number): void => {
    if (found.length >= limit) return;
    if (n === order.length) {
      found.push(p.words.map((_, i) => [...(pick[i] ?? [])].sort().join(' ')));
      return;
    }
    const i = order[n] as number;
    for (const cells of options[i] ?? []) {
      if (cells.some((k) => taken.has(k))) continue;
      const seen = new Set(
        cells.flatMap((k) => (bowColour.has(k) ? [bowColour.get(k) as string] : [])),
      );
      if (seen.size > 1) continue;
      const mine = [...seen][0] ?? '';
      // Two words bowed the same colour can't touch (checked against words already laid).
      if (
        mine &&
        cells.some((k) =>
          near(k).some((t) => {
            const j = taken.get(t);
            return j !== undefined && tone[j] === mine;
          }),
        )
      )
        continue;
      for (const k of cells) taken.set(k, i);
      tone[i] = mine;
      pick[i] = cells;
      go(n + 1);
      for (const k of cells) taken.delete(k);
    }
  };
  go(0);
  return found;
}
