/**
 * Solution-first generation of Bunny hops (Numbrix) boards, routes, and twists.
 */
import { Budget } from '../core/budget';
import { type Frame, area, frames, mirrorSquare, offAxis, symmetricIn } from '../core/mirror';
import { type Rng, shuffle } from '../core/rng';
import { type Board, type Panel, type Spot, key, parse, splitRoutes } from './model';
import { trailSegments } from './rules';
import { countSolutions, solve } from './solve';

/** Words with distinct letters for each message length (3, 4, 5). */
export const EASTER_WORDS: Record<number, readonly string[]> = {
  3: ['HOP', 'JOY', 'SUN', 'DEW', 'MAY', 'BUD', 'SKY', 'OAK', 'ELM', 'BEE'],
  4: ['NEST', 'LEAP', 'HARE', 'DAWN', 'LARK', 'WARM', 'LAMB', 'PINK', 'GOLD', 'FERN'],
  5: ['TULIP', 'CHICK', 'BLOOM', 'MARCH', 'APRIL', 'FRESH', 'CLOVE', 'DAISY', 'ROBIN', 'MAPLE'],
};

/**
 * Mutate a Hamiltonian path in-place via Oberdorf's Backbite moves (prefix/suffix reversals
 * at random endpoint neighbours), breaking Warnsdorff spiral or boustrophedon bias in O(N) time.
 */
export function backbite(
  route: number[],
  hops: number[][],
  random: Rng,
  iterations: number,
  lockStart = false,
): number[] {
  const N = route.length;
  if (N < 4) return route;
  const out = [...route];
  for (let it = 0; it < iterations; it++) {
    const useHead = !lockStart && random() < 0.5;
    if (useHead) {
      const head = out[0] as number;
      const next = out[1] as number;
      const nbrs = (hops[head] ?? []).filter((u) => u !== next);
      if (!nbrs.length) continue;
      const u = nbrs[Math.floor(random() * nbrs.length)] as number;
      const k = out.indexOf(u);
      if (k >= 2) {
        // Reverse prefix out[0..k-1] so new edge (head, u) replaces (out[k-1], u)
        for (let l = 0, r = k - 1; l < r; l++, r--) {
          const tmp = out[l] as number;
          out[l] = out[r] as number;
          out[r] = tmp;
        }
      }
    } else {
      const tail = out[N - 1] as number;
      const prev = out[N - 2] as number;
      const nbrs = (hops[tail] ?? []).filter((u) => u !== prev);
      if (!nbrs.length) continue;
      const u = nbrs[Math.floor(random() * nbrs.length)] as number;
      const k = out.indexOf(u);
      if (k >= 0 && k <= N - 3) {
        // Reverse suffix out[k+1..N-1] so new edge (u, tail) replaces (u, out[k+1])
        for (let l = k + 1, r = N - 1; l < r; l++, r--) {
          const tmp = out[l] as number;
          out[l] = out[r] as number;
          out[r] = tmp;
        }
      }
    }
  }
  return out;
}

/** A random full route over the board (spot indices in order). Warnsdorff's heuristic + Backbite mutations. */
/**
 * Turn `count` lawn squares of `rows` into rocks (in place), avoiding `avoid`. Each rock must
 * leave the lawn in one piece, and every lawn square with at least two lawn neighbours except
 * at most two (a route's ends), so a tour can still exist. Returns the rocks placed (maybe fewer
 * than asked, if the board runs out of safe squares).
 */
export function placeRocks(
  rows: string[],
  count: number,
  random: Rng,
  avoid: ReadonlySet<string> = new Set(),
): Spot[] {
  const H = rows.length;
  const W = rows[0]?.length ?? 0;
  const lawn = (r: number, c: number): boolean => rows[r]?.[c] === '#';
  const set = (r: number, c: number, ch: string): void => {
    const row = rows[r] ?? '';
    rows[r] = row.slice(0, c) + ch + row.slice(c + 1);
  };
  const neighbours = (r: number, c: number): Spot[] =>
    (
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ] as Spot[]
    ).filter(([y, x]) => lawn(y, x));
  const stillTourable = (): boolean => {
    const cells: Spot[] = [];
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (lawn(r, c)) cells.push([r, c]);
    if (!cells.length) return false;
    if (cells.filter(([r, c]) => neighbours(r, c).length < 2).length > 2) return false;
    const seen = new Set([key(cells[0] as Spot)]);
    const stack = [cells[0] as Spot];
    while (stack.length) {
      const [r, c] = stack.pop() as Spot;
      for (const n of neighbours(r, c)) {
        if (!seen.has(key(n))) {
          seen.add(key(n));
          stack.push(n);
        }
      }
    }
    return seen.size === cells.length;
  };
  const candidates: Spot[] = [];
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) if (lawn(r, c) && !avoid.has(key([r, c]))) candidates.push([r, c]);
  const rocks: Spot[] = [];
  for (const [r, c] of shuffle(random, candidates)) {
    if (rocks.length >= count) break;
    set(r, c, '.');
    if (stillTourable()) rocks.push([r, c]);
    else set(r, c, '#');
  }
  return rocks;
}

export function randomRoute(b: Board, random: Rng, start?: number): number[] | null {
  const N = b.spots.length;
  for (let attempt = 0; attempt < 250; attempt++) {
    const used = new Array<boolean>(N).fill(false);
    let at = start ?? Math.floor(random() * N);
    const route = [at];
    used[at] = true;
    while (route.length < N) {
      const next = shuffle(
        random,
        (b.hops[at] ?? []).filter((j) => !used[j]),
      );
      if (!next.length) break;
      const degree = (j: number): number => (b.hops[j] ?? []).filter((k) => !used[k]).length;
      next.sort((x, y) => degree(x) - degree(y));
      at = (random() < 0.85 ? next[0] : next[Math.floor(random() * next.length)]) as number;
      route.push(at);
      used[at] = true;
    }
    if (route.length === N) {
      return backbite(route, b.hops, random, Math.min(20, Math.floor(N / 2)), start !== undefined);
    }
  }
  return null;
}

/**
 * Grow a route with a guaranteed snowflake frame (`>= 3x3`, near-square, even across axis,
 * `area < W * H`), where the strokes inside the frame mirror across the axis while the
 * outside connects them in a different order.
 */
export function randomSnowRoute(
  height: number,
  width: number,
  random: Rng,
  burrows?: [Spot, Spot][],
  customRows?: string[],
): { route: number[]; frame: Frame; b: Board } | null {
  const rows = customRows ?? Array.from({ length: height }, () => '#'.repeat(width));
  const isLawn = (r: number, c: number): boolean => rows[r]?.[c] === '#';
  const validFrames = shuffle(
    random,
    frames(width, height, 3).filter((f) => {
      const h = f.bottom - f.top + 1;
      const w = f.right - f.left + 1;
      if ((f.axis === 'v' ? w : h) % 2 !== 0) return false;
      if (area(f) >= width * height * 0.8) return false;
      if (Math.min(h, w) / Math.max(h, w) < 0.6) return false;
      for (let r = f.top; r <= f.bottom; r++) {
        for (let c = f.left; c <= f.right; c++) {
          if (!isLawn(r, c)) return false;
        }
      }
      return true;
    }),
  );
  // Prefer larger frames first
  validFrames.sort((a, b) => area(b) - area(a));

  const baseBoard = parse({
    name: 'snow-candidate',
    rows,
    given: [],
    ...(burrows?.length ? { burrows } : {}),
  });
  const N = baseBoard.spots.length;

  if (rows.some((row) => row.includes('.'))) {
    const mid = Math.floor(width / 2);
    const treeFrames = [...validFrames].sort((a, b) => area(a) - area(b));
    for (const f of treeFrames.slice(0, 4)) {
      const startCol = random() < 0.5 ? mid - 1 : mid + 1;
      if (!isLawn(1, startCol) || !isLawn(0, mid)) continue;
      const bCand = parse({
        name: 'snow-tree-candidate',
        rows,
        given: [[1, startCol, 1]],
        golden: [0, mid],
        frame: f,
        ...(burrows?.length ? { burrows } : {}),
      });
      const sols = solve(bCand, 6, {}, new Budget(25_000));
      const good = shuffle(
        random,
        sols.filter((s) => offAxis(f, trailSegments(baseBoard, s)) >= 3),
      );
      if (good[0]) {
        return { route: good[0], frame: f, b: baseBoard };
      }
    }
  }

  for (const f of validFrames.slice(0, 12)) {
    const h = f.bottom - f.top + 1;
    const w = f.right - f.left + 1;
    // Build a random Hamiltonian path covering one half of the frame, and its mirror on the other half.
    const subH = f.axis === 'v' ? h : h / 2;
    const subW = f.axis === 'v' ? w / 2 : w;
    const subCells: Spot[] = [];
    for (let r = 0; r < subH; r++) {
      for (let c = 0; c < subW; c++) {
        subCells.push([f.top + r, f.left + c]);
      }
    }
    const subSet = new Set(subCells.map(key));
    let halfSpots: Spot[] | null = null;
    const startCands = shuffle(random, subCells);
    for (const s0 of startCands.slice(0, 6)) {
      const visited = new Set<string>([key(s0)]);
      const path: Spot[] = [s0];
      while (path.length < subCells.length) {
        const [cr, cc] = path[path.length - 1] as Spot;
        const nbrs: Spot[] = shuffle(
          random,
          (
            [
              [cr - 1, cc],
              [cr + 1, cc],
              [cr, cc - 1],
              [cr, cc + 1],
            ] as Spot[]
          ).filter((s) => subSet.has(key(s)) && !visited.has(key(s))),
        );
        if (!nbrs.length) break;
        const deg = ([nr, nc]: Spot): number =>
          (
            [
              [nr - 1, nc],
              [nr + 1, nc],
              [nr, nc - 1],
              [nr, nc + 1],
            ] as Spot[]
          ).filter((s) => subSet.has(key(s)) && !visited.has(key(s))).length;
        nbrs.sort((a, b) => deg(a) - deg(b));
        const pick = nbrs[0] as Spot;
        visited.add(key(pick));
        path.push(pick);
      }
      if (path.length === subCells.length) {
        halfSpots = path;
        break;
      }
    }
    if (!halfSpots) {
      halfSpots = [];
      for (let r = 0; r < subH; r++) {
        for (let dc = 0; dc < subW; dc++) {
          const c = r % 2 === 0 ? f.left + dc : f.left + subW - 1 - dc;
          halfSpots.push([f.top + r, c]);
        }
      }
    }

    const rawLeft = halfSpots.map((s) => baseBoard.index.get(key(s)) as number);
    const subSetIdx = new Set(rawLeft);
    const subHops = baseBoard.spots.map((_, i) =>
      subSetIdx.has(i) ? (baseBoard.hops[i] ?? []).filter((j) => subSetIdx.has(j)) : [],
    );
    const leftChain = backbite(rawLeft, subHops, random, 12);
    const rightChain = leftChain.map((idx) => {
      const [r, c] = baseBoard.spots[idx] as Spot;
      const [mr, mc] = mirrorSquare(f, r, c);
      return baseBoard.index.get(key([mr, mc])) as number;
    });

    // Ensure burrows don't conflict with interior of the chains
    const chainInterior = new Set<number>([...leftChain.slice(1, -1), ...rightChain.slice(1, -1)]);
    if (baseBoard.burrows.some(([u, v]) => chainInterior.has(u) || chainInterior.has(v))) {
      continue;
    }

    const inL = leftChain[0] as number;
    const outL = leftChain[leftChain.length - 1] as number;
    const inR = rightChain[0] as number;
    const outR = rightChain[rightChain.length - 1] as number;

    // Try growing a full route where stepping onto an endpoint of leftChain or rightChain
    // traverses the whole chain at once.
    for (let attempt = 0; attempt < 120; attempt++) {
      const used = new Array<boolean>(N).fill(false);
      // Start at a spot outside the chain interiors
      const starts = shuffle(
        random,
        baseBoard.spots
          .map((_, i) => i)
          .filter(
            (i) => !chainInterior.has(i) && i !== inL && i !== outL && i !== inR && i !== outR,
          ),
      );
      const start = starts[0];
      if (start === undefined) break;

      const route = [start];
      used[start] = true;

      const advanceChain = (at: number): number | null => {
        if (at === inL || at === outL) {
          const seq = at === inL ? leftChain : [...leftChain].reverse();
          for (let k = 1; k < seq.length; k++) {
            const s = seq[k] as number;
            if (used[s]) return null;
            used[s] = true;
            route.push(s);
          }
          return seq[seq.length - 1] as number;
        }
        if (at === inR || at === outR) {
          const seq = at === inR ? rightChain : [...rightChain].reverse();
          for (let k = 1; k < seq.length; k++) {
            const s = seq[k] as number;
            if (used[s]) return null;
            used[s] = true;
            route.push(s);
          }
          return seq[seq.length - 1] as number;
        }
        return at;
      };

      let at = start;
      let ok = true;
      while (route.length < N) {
        const next = shuffle(
          random,
          (baseBoard.hops[at] ?? []).filter((j) => !used[j] && !chainInterior.has(j)),
        );
        if (!next.length) {
          ok = false;
          break;
        }
        const degree = (j: number): number =>
          (baseBoard.hops[j] ?? []).filter((k) => !used[k] && !chainInterior.has(k)).length;
        next.sort((x, y) => degree(x) - degree(y));
        const pick = (
          random() < 0.85 ? next[0] : next[Math.floor(random() * next.length)]
        ) as number;
        used[pick] = true;
        route.push(pick);
        const after = advanceChain(pick);
        if (after === null) {
          ok = false;
          break;
        }
        at = after;
      }

      if (ok && route.length === N) {
        const segs = trailSegments(baseBoard, route);
        if (symmetricIn(f, segs) && offAxis(f, segs) >= 3) {
          return { route, frame: f, b: baseBoard };
        }
      }
    }
  }
  return null;
}

/** Partition the route into `count` contiguous courses (Thanksgiving fair shares). */
export function partitionCourses(
  b: Board,
  route: number[],
  count: number,
  splitIdx?: number,
): string[] {
  const portions = Array.from({ length: b.height }, () => '.'.repeat(b.width));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const N = route.length;

  // If there are two bunnies (splitIdx), align one course boundary with splitIdx
  const cuts: number[] = [0];
  if (splitIdx !== undefined && splitIdx > 0 && splitIdx < N) {
    if (count === 2) {
      cuts.push(splitIdx, N);
    } else {
      const leftCourses = Math.max(1, Math.round((count * splitIdx) / N));
      const rightCourses = Math.max(1, count - leftCourses);
      for (let i = 1; i < leftCourses; i++) cuts.push(Math.round((splitIdx * i) / leftCourses));
      cuts.push(splitIdx);
      for (let i = 1; i < rightCourses; i++)
        cuts.push(splitIdx + Math.round(((N - splitIdx) * i) / rightCourses));
      cuts.push(N);
    }
  } else {
    for (let i = 1; i < count; i++) cuts.push(Math.round((N * i) / count));
    cuts.push(N);
  }

  for (let cIdx = 0; cIdx < cuts.length - 1; cIdx++) {
    const from = cuts[cIdx] as number;
    const to = cuts[cIdx + 1] as number;
    const ch = chars[cIdx] ?? 'A';
    for (let n = from; n < to; n++) {
      const spotIdx = route[n] as number;
      const [r, c] = b.spots[spotIdx] as Spot;
      const row = portions[r] ?? '';
      portions[r] = row.slice(0, c) + ch + row.slice(c + 1);
    }
  }

  return portions;
}

/**
 * Split `fullRoute` for Two Bunnies (Fourth of July red, white and blue) into a
 * red bunny route (from start to `splitIdx - 1`) and a blue bunny route (reversed
 * from the other end down to `splitIdx`, so the two bunnies meet head-on).
 */
export function splitTwoBunnies(
  fullRoute: number[],
  random: Rng,
): { route: number[]; splitIdx: number } {
  const N = fullRoute.length;
  const minSplit = Math.max(5, Math.floor(N * 0.45));
  const maxSplit = Math.min(N - 5, Math.ceil(N * 0.65));
  const splitIdx = minSplit + Math.floor(random() * (maxSplit - minSplit + 1));

  const redRoute = fullRoute.slice(0, splitIdx);
  const blueRoute = fullRoute.slice(splitIdx).reverse();
  return { route: [...redRoute, ...blueRoute], splitIdx };
}

/**
 * Colour spots for Two Bunnies: every white ('w') square must sit on the border
 * between the two regions, adjacent to at least one red ('r') square and at least
 * one blue ('b') square.
 */
export function colourTwoBunnies(
  b: Board,
  route: number[],
  splitIdx: number,
  random: Rng,
  protectedSpots: Set<number> = new Set(),
): { colours: string[]; meetingSpots: number[] } | null {
  const redRoute = route.slice(0, splitIdx);
  const blueRoute = route.slice(splitIdx);
  const blueSet = new Set(blueRoute);

  const col: ('r' | 'b' | 'w')[] = b.spots.map((_, i) => (blueSet.has(i) ? 'b' : 'r'));

  const locked = new Set<number>(protectedSpots);
  locked.add(redRoute[0] as number);
  locked.add(blueRoute[0] as number);
  for (let i = 0; i < b.spots.length; i++) {
    if (b.dark[i]) locked.add(i);
  }

  // Keep the meeting tips strictly 'r' and 'b' so the colour boundary fixes where they meet
  const meetingSpots: number[] = [];
  for (let k = Math.max(1, redRoute.length - 3); k < redRoute.length; k++) {
    const s = redRoute[k] as number;
    meetingSpots.push(s);
    if (k === redRoute.length - 1) locked.add(s);
  }
  for (let k = Math.max(1, blueRoute.length - 3); k < blueRoute.length; k++) {
    const s = blueRoute[k] as number;
    meetingSpots.push(s);
    if (k === blueRoute.length - 1) locked.add(s);
  }

  const validWhite = (idx: number): boolean => {
    const nbrs = b.hops[idx] ?? [];
    const hasRed = nbrs.some((j) => !b.dark[j] && col[j] === 'r');
    const hasBlue = nbrs.some((j) => !b.dark[j] && col[j] === 'b');
    return hasRed && hasBlue;
  };

  const toneConnected = (tone: 'r' | 'b'): boolean => {
    const spotsOfTone = b.spots.map((_, i) => i).filter((i) => !b.dark[i] && col[i] === tone);
    if (spotsOfTone.length <= 1) return spotsOfTone.length === 1;
    const seen = new Set<number>([spotsOfTone[0] as number]);
    const queue = [spotsOfTone[0] as number];
    while (queue.length) {
      const u = queue.shift() as number;
      for (const v of b.hops[u] ?? []) {
        if (!b.dark[v] && col[v] === tone && !seen.has(v)) {
          seen.add(v);
          queue.push(v);
        }
      }
    }
    return seen.size === spotsOfTone.length;
  };

  const trySetWhite = (i: number): boolean => {
    const prev = col[i] as 'r' | 'b';
    col[i] = 'w';
    const affected = [i, ...(b.hops[i] ?? []).filter((j) => col[j] === 'w')];
    if (affected.every(validWhite) && toneConnected(prev)) {
      return true;
    }
    col[i] = prev;
    return false;
  };

  const redCands = shuffle(
    random,
    redRoute.filter((i) => !locked.has(i)),
  );
  const blueCands = shuffle(
    random,
    blueRoute.filter((i) => !locked.has(i)),
  );

  let redWhites = 0;
  let blueWhites = 0;
  for (const i of redCands) {
    if (trySetWhite(i)) {
      redWhites++;
      break;
    }
  }
  for (const i of blueCands) {
    if (trySetWhite(i)) {
      blueWhites++;
      break;
    }
  }
  if (redWhites === 0 || blueWhites === 0) return null;

  const maxWhites = Math.max(2, Math.min(4, Math.floor(b.spots.length / 7)));
  let whiteCount = redWhites + blueWhites;
  const restCands = shuffle(
    random,
    [...redCands, ...blueCands].filter((i) => col[i] !== 'w'),
  );
  for (const i of restCands) {
    if (whiteCount >= maxWhites) break;
    if (trySetWhite(i)) whiteCount++;
  }

  const grid = Array.from({ length: b.height }, () => '.'.repeat(b.width));
  b.spots.forEach(([r, c], i) => {
    const ch = col[i] ?? 'r';
    const row = grid[r] ?? '';
    grid[r] = row.slice(0, c) + ch + row.slice(c + 1);
  });

  return { colours: grid, meetingSpots };
}

/**
 * Find a U-turn `u -> a -> b -> v` near the end of the route (where `u` and `v` are adjacent)
 * so that putting `a, b` (lawn) and 1-2 rock squares in `dark` makes the route's length
 * (given by the last egg) essential to determine which dark squares are lawn vs rock.
 */
export function findDarkUTurn(b: Board, route: number[], splitIdx?: number): number[] | null {
  const evenTwoBunnies = splitIdx !== undefined && route.length % 2 === 0;
  const endIdx = splitIdx !== undefined ? splitIdx : route.length;
  const k = evenTwoBunnies ? endIdx - 4 : endIdx - 5;
  if (k >= 1) {
    const u = route[k] as number;
    const a = route[k + 1] as number;
    const bSpot = route[k + 2] as number;
    const v = route[k + 3] as number;
    if ((b.hops[u] ?? []).includes(v)) {
      return [a, bSpot, k];
    }
  }
  return null;
}

/** Add letter eggs that spell a theme word along the first bunny's route. */
export function addLetters(
  b: Board,
  route: number[],
  random: Rng,
  letterCount: number,
  forbiddenSpots: Set<number>,
  preferSpots: number[] = [],
): { letters: [number, number, string][]; message: string; word: string; blanks: number[] } | null {
  const [red] = splitRoutes(b, route);
  const bank = EASTER_WORDS[letterCount] ?? ['HOP'];
  const word = bank[Math.floor(random() * bank.length)] ?? 'HOP';

  // Candidate steps on `red` (1-based), avoiding step 1, last step, and forbiddenSpots
  const validSteps: number[] = [];
  for (let step = 2; step < red.length; step++) {
    const spotIdx = red[step - 1] as number;
    if (forbiddenSpots.has(spotIdx)) continue;
    if (b.twoBunnies && b.colour[spotIdx] !== 'r') continue;
    validSteps.push(step);
  }
  if (validSteps.length < letterCount) return null;

  const preferSteps = preferSpots
    .map((s) => red.indexOf(s) + 1)
    .filter((step) => validSteps.includes(step));

  const chosenSteps: number[] = [];
  for (const s of shuffle(random, preferSteps)) {
    if (chosenSteps.length < letterCount && !chosenSteps.includes(s)) chosenSteps.push(s);
  }
  for (const s of shuffle(random, validSteps)) {
    if (chosenSteps.length < letterCount && !chosenSteps.includes(s)) chosenSteps.push(s);
  }
  if (chosenSteps.length < letterCount) return null;

  // Shuffle the order of chosenSteps so the blanks aren't always monotonic
  const blanks = shuffle(random, [...chosenSteps]);
  const letters: [number, number, string][] = blanks.map((step, idx) => {
    const spotIdx = red[step - 1] as number;
    const [r, c] = b.spots[spotIdx] as Spot;
    return [r, c, word[idx] as string];
  });

  return {
    letters,
    message: blanks.join(' '),
    word,
    blanks,
  };
}

/**
 * Thin numbered eggs while keeping a unique solution within a tight step budget,
 * removing eggs in `prioritySpots` first so the active twists do real work.
 */
/**
 * Add `count` spare numbered eggs back to a minimal set (`given`), to make a board easier
 * without changing its answer: each spare goes where it's farthest (in steps along its bunny's
 * route) from every egg already shown, so hints spread out. Never on letters, shadows, burrows
 * or `noEggSpots`.
 */
export function addSpareEggs(
  basePanel: Panel,
  route: number[],
  given: [number, number, number][],
  count: number,
  noEggSpots = new Set<number>(),
  splitIdx?: number,
): [number, number, number][] {
  const b = parse(basePanel);
  const [red, blue] =
    splitIdx !== undefined
      ? [route.slice(0, splitIdx), route.slice(splitIdx)]
      : splitRoutes(b, route);
  const letterSpots = new Set([...b.letterAt.keys()]);
  const shown = new Set(given.map(([r, c]) => key([r, c])));
  const out = [...given];
  const pools = [red, blue].map((path) => ({
    path,
    steps: path.flatMap((spot, n) => (shown.has(key(b.spots[spot] as Spot)) ? [n] : [])),
  }));
  for (let k = 0; k < count; k++) {
    let best: {
      score: number;
      egg: [number, number, number];
      pool: (typeof pools)[number];
      n: number;
    } | null = null;
    for (const pool of pools) {
      pool.path.forEach((spot, n) => {
        const [r, c] = b.spots[spot] as Spot;
        if (shown.has(key([r, c])) || letterSpots.has(spot) || b.dark[spot] || noEggSpots.has(spot))
          return;
        if (basePanel.colours && b.colour[spot] === 'w') return;
        const score = Math.min(Infinity, ...pool.steps.map((s) => Math.abs(s - n)));
        if (!best || score > best.score) best = { score, egg: [r, c, n + 1], pool, n };
      });
    }
    if (!best) break;
    const pick = best as { egg: [number, number, number]; pool: (typeof pools)[number]; n: number };
    out.push(pick.egg);
    shown.add(key([pick.egg[0], pick.egg[1]]));
    pick.pool.steps.push(pick.n);
  }
  return out;
}

export function minimizeEggs(
  basePanel: Panel,
  route: number[],
  random: Rng,
  preservedSpots: Set<number>,
  prioritySpots: Set<number>,
  stepBudget = 4_000,
  noEggSpots = new Set<number>(),
  splitIdx?: number,
): [number, number, number][] {
  const b = parse(basePanel);
  const [red, blue] =
    splitIdx !== undefined
      ? [route.slice(0, splitIdx), route.slice(splitIdx)]
      : splitRoutes(b, route);
  const letterSpots = new Set([...b.letterAt.keys()]);
  const darkSpots = new Set(b.spots.map((_, i) => i).filter((i) => b.dark[i]));
  const hasColours = Boolean(basePanel.colours);

  const allEggs: { spot: number; egg: [number, number, number] }[] = [];
  red.forEach((spotIdx, n) => {
    if (letterSpots.has(spotIdx) || darkSpots.has(spotIdx) || noEggSpots.has(spotIdx)) return;
    if (hasColours && b.colour[spotIdx] !== 'r') return;
    const [r, c] = b.spots[spotIdx] as Spot;
    allEggs.push({ spot: spotIdx, egg: [r, c, n + 1] });
  });
  blue.forEach((spotIdx, n) => {
    if (letterSpots.has(spotIdx) || darkSpots.has(spotIdx) || noEggSpots.has(spotIdx)) return;
    if (hasColours && b.colour[spotIdx] !== b.secondTone) return;
    const [r, c] = b.spots[spotIdx] as Spot;
    allEggs.push({ spot: spotIdx, egg: [r, c, n + 1] });
  });

  const isStraight = (spot: number): boolean => {
    for (const path of [red, blue]) {
      const idx = path.indexOf(spot);
      if (idx > 0 && idx + 1 < path.length) {
        const [r0, c0] = b.spots[path[idx - 1] as number] as Spot;
        const [r1, c1] = b.spots[spot] as Spot;
        const [r2, c2] = b.spots[path[idx + 1] as number] as Spot;
        return (r0 === r1 && r1 === r2) || (c0 === c1 && c1 === c2);
      }
    }
    return false;
  };

  let current = [...allEggs];
  const prio = shuffle(
    random,
    allEggs.filter((x) => !preservedSpots.has(x.spot) && prioritySpots.has(x.spot)),
  );
  const nonPrio = allEggs.filter((x) => !preservedSpots.has(x.spot) && !prioritySpots.has(x.spot));
  const straight = shuffle(
    random,
    nonPrio.filter((x) => isStraight(x.spot)),
  );
  const turns = shuffle(
    random,
    nonPrio.filter((x) => !isStraight(x.spot)),
  );

  for (const item of [...prio, ...straight, ...turns]) {
    const candidate = current.filter((x) => x !== item);
    const p: Panel = { ...basePanel, given: candidate.map((x) => x.egg) };
    try {
      if (countSolutions(parse(p), 2, {}, new Budget(stepBudget)) === 1) {
        current = candidate;
      }
    } catch {
      // Keep egg if removing it blows the step budget
    }
  }

  for (const item of [...current]) {
    if (preservedSpots.has(item.spot)) continue;
    const candidate = current.filter((x) => x !== item);
    const p: Panel = { ...basePanel, given: candidate.map((x) => x.egg) };
    try {
      if (countSolutions(parse(p), 2, {}, new Budget(50_000)) === 1) {
        current = candidate;
      }
    } catch {
      // Keep egg if removing it blows the step budget
    }
  }

  return current.map((x) => x.egg);
}
