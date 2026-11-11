/**
 * Lights rules: power spreading, loose ends, loop detection, and holiday twist verification.
 */
import { type Frame, mirrorSquare, segment } from '../core/mirror';
import { type Board, DIRS, E, OPP, S, STEP, type Spot, key, mirrorMask, turn } from './model';

/** Two pieces' colours can join: the same colour, or either one white/uncoloured. */
export const mix = (x: 'r' | 'b' | 'g' | undefined, y: 'r' | 'b' | 'g' | undefined): boolean =>
  !x || !y || x === y;

/** A wire between these two squares would cross a wall between two slices. */
export const wall = (b: Board, r: number, c: number, r2: number, c2: number): boolean => {
  const s = b.slice(r, c);
  const t = b.slice(r2, c2);
  return s !== undefined && t !== undefined && s !== t && s !== '*' && t !== '*';
};

/**
 * The pieces a square could be turned to (distinct), as the rules allow before the search.
 * When `blindDark` is true and the square is in `b.dark`, the player cannot see the piece
 * shape under `?`, so any valid piece mask `1..14` is allowed!
 */
export function options(
  b: Board,
  r: number,
  c: number,
  walls: boolean,
  noColours = false,
  blindDark = false,
): number[] {
  const m = b.solution[r]?.[c] ?? -1;
  if (m < 0) return [];
  const out = new Set<number>();
  const candidates: number[] = [];
  if (blindDark && b.dark.has(key(r, c))) {
    for (let mask = 1; mask <= 14; mask++) candidates.push(mask);
  } else {
    let x = m;
    for (let i = 0; i < 4; i++, x = turn(x)) candidates.push(x);
  }
  for (const x of candidates) {
    const ok = DIRS.every((d) => {
      if (!(x & d)) return true;
      const [dr, dc] = STEP[d] as Spot;
      const nr = r + dr;
      const nc = c + dc;
      return (
        b.inside(nr, nc) &&
        (noColours || mix(b.colour(nr, nc), b.colour(r, c))) &&
        !(walls && wall(b, r, c, nr, nc))
      );
    });
    if (ok) out.add(x);
  }
  return [...out];
}

/** Squares joined both ways across an edge. */
export const joined = (grid: number[][], r: number, c: number, d: number): boolean => {
  const [dr, dc] = STEP[d] as Spot;
  const here = grid[r]?.[c] ?? -1;
  const there = grid[r + dr]?.[c + dc] ?? -1;
  return here >= 0 && there >= 0 && !!(here & d) && !!(there & (OPP[d] as number));
};

export interface Lighting {
  /** Steps from the plug, for every square the power reaches. */
  dist: Map<string, number>;
  /** Which string (plug) reached each lit square. */
  string: Map<string, 'r' | 'b' | 'g'>;
  /** Wire ends that meet nothing. */
  loose: [number, number, number][];
  /** The power's gone round a loop. */
  loop: boolean;
}

export function light(b: Board, grid: number[][]): Lighting {
  const dist = new Map<string, number>();
  const string = new Map<string, 'r' | 'b' | 'g'>();
  let loop = false;

  const secondaryPlug = b.bluePlug ?? b.greenPlug;
  const secondaryTone: 'b' | 'g' = b.bluePlug ? 'b' : 'g';

  const plugs: [Spot, 'r' | 'b' | 'g'][] = secondaryPlug
    ? [
        [b.plug, 'r'],
        [secondaryPlug, secondaryTone],
      ]
    : [[b.plug, 'r']];

  for (const [plug, tone] of plugs) {
    const pKey = key(plug[0], plug[1]);
    if (dist.has(pKey)) loop = true;
    const queue: [number, number, number, number][] = [[plug[0], plug[1], 0, -1]];
    dist.set(pKey, 0);
    string.set(pKey, tone);
    while (queue.length) {
      const [r, c, n, from] = queue.shift() as [number, number, number, number];
      for (const d of DIRS) {
        if (d === from || !joined(grid, r, c, d)) continue;
        const [dr, dc] = STEP[d] as Spot;
        const k = key(r + dr, c + dc);
        if (dist.has(k)) {
          loop = true;
          continue;
        }
        dist.set(k, n + 1);
        string.set(k, tone);
        queue.push([r + dr, c + dc, n + 1, OPP[d] as number]);
      }
    }
  }

  const loose: [number, number, number][] = [];
  grid.forEach((row, r) =>
    row.forEach((m, c) => {
      if (m < 0) return;
      for (const d of DIRS) {
        if (m & d && !joined(grid, r, c, d)) loose.push([r, c, d]);
      }
    }),
  );

  return { dist, string, loose, loop };
}

/** Each slice's servings (wires in from the middle), and the wires that cross a wall between slices. */
export function servings(
  b: Board,
  grid: number[][],
): { feeds: Map<string, number>; walls: [number, number, number][] } {
  const feeds = new Map<string, number>();
  const walls: [number, number, number][] = [];
  grid.forEach((row, r) =>
    row.forEach((_, c) => {
      const s = b.slice(r, c);
      if (s === undefined) return;
      if (s !== '*' && !feeds.has(s)) feeds.set(s, 0);
      for (const d of [E, S]) {
        const [dr, dc] = STEP[d] as Spot;
        const t = b.slice(r + dr, c + dc);
        if (t === undefined || t === s || !joined(grid, r, c, d)) continue;
        if (s === '*' || t === '*') {
          const into = s === '*' ? t : s;
          feeds.set(into, (feeds.get(into) ?? 0) + 1);
        } else walls.push([r, c, d]);
      }
    }),
  );
  return { feeds, walls };
}

/** How many wires join squares along each row and each column. */
export function joinsAlong(b: Board, grid: number[][]): { rows: number[]; cols: number[] } {
  const rows = new Array<number>(b.height).fill(0);
  const cols = new Array<number>(b.width).fill(0);
  for (let r = 0; r < b.height; r++)
    for (let c = 0; c < b.width; c++) {
      if (joined(grid, r, c, E)) rows[r] = (rows[r] ?? 0) + 1;
      if (joined(grid, r, c, S)) cols[c] = (cols[c] ?? 0) + 1;
    }
  return { rows, cols };
}

/** Extract the set of joined wire segments in the grid. */
export function wiresOf(grid: number[][]): Set<string> {
  const wires = new Set<string>();
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < (grid[r]?.length ?? 0); c++) {
      const m = grid[r]?.[c] ?? -1;
      if (m < 0) continue;
      for (const d of [E, S]) {
        if (joined(grid, r, c, d)) {
          const [dr, dc] = STEP[d] as Spot;
          wires.add(segment(r, c, r + dr, c + dc));
        }
      }
    }
  }
  return wires;
}

/** True when every square inside `f` is the exact mirror reflection of its partner across `f.axis`. */
export function piecesSymmetricIn(f: Frame, grid: number[][]): boolean {
  for (let r = f.top; r <= f.bottom; r++) {
    for (let c = f.left; c <= f.right; c++) {
      const m = grid[r]?.[c] ?? -1;
      const [mr, mc] = mirrorSquare(f, r, c);
      const mm = grid[mr]?.[mc] ?? -1;
      if (m < 0 !== mm < 0) return false;
      if (m >= 0 && mm !== mirrorMask(m, f.axis)) return false;
    }
  }
  return true;
}

/** Spell the message word from the letter bulbs' distances in `grid`. */
export function spell(b: Board, grid: number[][]): string {
  const { dist } = light(b, grid);
  return b.blanks
    .map((n) => {
      const hitsAtN = b.letters.filter(([r, c]) => dist.get(key(r, c)) === n);
      if (hitsAtN.length === 0) return '_';
      const ch = hitsAtN[0]?.[2];
      if (!ch || hitsAtN.some((h) => h[2] !== ch)) return '_';
      const sameLetterOtherDist = b.letters.some(([r, c, l]) => {
        if (l !== ch) return false;
        const d = dist.get(key(r, c));
        return d !== undefined && d !== n;
      });
      return sameLetterOtherDist ? '_' : ch;
    })
    .join('');
}

export interface Rules {
  /** Ignore flags (to check they matter). */
  noFlags?: boolean;
  /** Ignore eggs (to check they matter). */
  noEggs?: boolean;
  /** Ignore the slices' crust walls (to check they matter). */
  noServings?: boolean;
  /** Ignore snowflakes (to check they matter). */
  noSnow?: boolean;
  /** Ignore letters (to check they matter). */
  noLetters?: boolean;
  /** Ignore colours (treat all pieces as white). */
  noColours?: boolean;
  /** Treat dark squares as completely unknown piece shapes (1..14) during solving. */
  blindDark?: boolean;
  /** Allow loops. */
  loops?: boolean;
}

export function solved(b: Board, grid: number[][], rules: Rules = {}): boolean {
  const { dist, string, loose, loop } = light(b, grid);

  // With colours, every red or blue piece is lit by its own string (white ones by either).
  const secondaryPlug = b.bluePlug ?? b.greenPlug;
  if (secondaryPlug && !rules.noColours) {
    for (const [k, tone] of string) {
      const [r, c] = k.split(',').map(Number) as Spot;
      const own = b.colour(r, c);
      if (own && own !== tone) return false;
    }
  }

  let count = 0;
  grid.forEach((row) => row.forEach((m) => (count += m >= 0 ? 1 : 0)));
  if (loose.length || (loop && !rules.loops) || dist.size !== count) return false;

  // Numbered eggs
  if (!rules.noEggs && b.eggs.some(([r, c, n]) => dist.get(key(r, c)) !== n)) return false;

  // Edge flags
  if (!rules.noFlags) {
    const { rows, cols } = joinsAlong(b, grid);
    if (b.rowFlags.some((f, r) => f !== null && f !== rows[r])) return false;
    if (b.colFlags.some((f, c) => f !== null && f !== cols[c])) return false;
  }

  // Slices: no wire across a crust wall (each slice's one serving follows from the walls: verify.ts)
  if (!rules.noServings && b.servings && servings(b, grid).walls.length) return false;

  // Snowflakes: inside the frame, every piece must be the exact mirror of its partner across the axis
  if (!rules.noSnow && b.frame && !piecesSymmetricIn(b.frame, grid)) return false;

  // Letters for numbers: the letter bulbs must lie at the set of distances in `b.blanks`
  // (same letter = same distance, different letters = different distances).
  if (!rules.noLetters && b.letters.length && b.blanks.length) {
    const blankSet = new Set(b.blanks);
    const letterDist = new Map<string, number>();
    const usedDists = new Set<number>();
    for (const [r, c, ch] of b.letters) {
      const d = dist.get(key(r, c));
      if (d === undefined || !blankSet.has(d)) return false;
      const prev = letterDist.get(ch);
      if (prev !== undefined && prev !== d) return false;
      if (prev === undefined && usedDists.has(d)) return false;
      letterDist.set(ch, d);
      usedDists.add(d);
    }
  }

  return true;
}
