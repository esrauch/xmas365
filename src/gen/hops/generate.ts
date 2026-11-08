/**
 * Generating bunny hops panels: plain, or any mix of twists, at a tier.
 */
import { Budget, within } from '../core/budget';
import { type Frame } from '../core/mirror';
import { rng } from '../core/rng';
import { type Made, Rejections, type Spec, type Tier, trySeeds } from '../core/spec';
import {
  addLetters,
  colourTwoBunnies,
  findDarkUTurn,
  addSpareEggs,
  minimizeEggs,
  partitionCourses,
  placeRocks,
  randomRoute,
  randomSnowRoute,
  splitTwoBunnies,
} from './make';
import {
  type Board,
  type Panel,
  type Spot,
  key,
  parse,
  rect,
  splitRoutes,
  treeRows,
} from './model';
import { solve } from './solve';
import { type HopTwist, problems, twistsOf } from './verify';

export interface Shape {
  width: number;
  height: number;
  courses: number;
  letters: number;
  burrows: number;
  /** Rocks on a plain board (see ROCK_SHIFT for twists). */
  rocks: number;
  margin: number;
}

export const SHAPES: Record<Tier, Shape> = {
  easy: { width: 5, height: 5, courses: 2, letters: 3, burrows: 1, rocks: 1, margin: 2 },
  medium: { width: 7, height: 7, courses: 3, letters: 4, burrows: 1, rocks: 3, margin: 3 },
  hard: { width: 9, height: 9, courses: 4, letters: 5, burrows: 2, rocks: 5, margin: 3 },
};

/**
 * Rocks added (or taken away) per twist, per tier, to keep a twist's board about as hard as a
 * plain one: twists that make the route harder to find (burrows, the dark) get more rocks (a
 * smaller lawn), and those that make it easier (courses, two bunnies) get fewer. Measured with
 * solver steps at each tier (see the twist difficulty audit in `revamp-centerpieces.md`).
 * Snowflakes get no rocks at all (a rock inside the frame would break the mirror).
 */
export const ROCK_SHIFT: Record<Tier, Partial<Record<HopTwist, number>>> = {
  easy: { burrows: 1, dark: 1, courses: -1, colours: -1 },
  medium: { burrows: 3, dark: 2, courses: -3, colours: -3 },
  hard: { burrows: 2, dark: 2, courses: -5, colours: -5 },
};

/**
 * Spare numbered eggs given back after the minimal set, per twist and tier: the second knob,
 * for twists still harder than a plain board once rocks have done what they can (the
 * minimal-egg search otherwise takes back what a smaller lawn gives). Snowflakes rely on it
 * alone, having no rocks.
 */
export const SPARE_EGGS: Record<Tier, Partial<Record<HopTwist, number>>> = {
  easy: {},
  medium: { burrows: 1, dark: 1, snow: 2 },
  hard: { snow: 1, dark: 1 },
};

/** How many spare eggs a board of this tier and twists gets. */
export function spareEggCount(tier: Tier, twists: readonly HopTwist[]): number {
  return twists.reduce((n, t) => n + (SPARE_EGGS[tier][t] ?? 0), 0);
}

/** How many rocks a board of this tier and twists gets. */
export function rockCount(tier: Tier, twists: readonly HopTwist[]): number {
  if (twists.includes('snow')) return 0;
  const shift = twists.reduce((n, t) => n + (ROCK_SHIFT[tier][t] ?? 0), 0);
  return Math.max(0, SHAPES[tier].rocks + shift);
}

function makePanel(spec: Spec<HopTwist>, seed: number, why: Rejections): Made<Panel> | null {
  const shape = SHAPES[spec.tier];
  const twists = new Set(spec.twists);
  const margin = twists.size > 1 ? 2 : shape.margin;

  let mixedSeed = (seed * 7919 + 31) >>> 0;
  for (const t of [...spec.twists].sort()) {
    for (let i = 0; i < t.length; i++) mixedSeed = (mixedSeed * 33 + t.charCodeAt(i)) >>> 0;
  }
  const random = rng(mixedSeed);
  const isTree = spec.shape === 'tree';
  const boardH = isTree && shape.height <= 5 ? 7 : shape.height;
  const boardW = isTree && shape.width <= 5 ? 7 : shape.width;
  const rows = isTree ? treeRows(boardH, boardW, 0.5) : rect(boardH, boardW);
  const golden: Spot | undefined = isTree ? [0, Math.floor(boardW / 2)] : undefined;

  // Rocks (base game): carved before anything else is placed, so burrows, eggs and the route
  // all work around them. Tree boards keep their own silhouette and get none.
  const rocks = isTree
    ? []
    : placeRocks(
        rows,
        rockCount(spec.tier, spec.twists),
        random,
        new Set(golden ? [key(golden)] : []),
      );

  // Burrows: pick underground pairs at distance >= 2 on lawn squares (avoiding the golden egg)
  let burrowsList: [Spot, Spot][] | undefined;
  if (twists.has('burrows')) {
    burrowsList = [];
    const usedBurrowSpots = new Set<string>(golden ? [key(golden)] : []);
    for (let attempt = 0; attempt < 60 && burrowsList.length < shape.burrows; attempt++) {
      const r1 = Math.floor(random() * boardH);
      const c1 = Math.floor(random() * boardW);
      const r2 = Math.floor(random() * boardH);
      const c2 = Math.floor(random() * boardW);
      if (rows[r1]?.[c1] !== '#' || rows[r2]?.[c2] !== '#') continue;
      const k1 = key([r1, c1]);
      const k2 = key([r2, c2]);
      if (
        Math.hypot(r1 - r2, c1 - c2) >= 2.2 &&
        !usedBurrowSpots.has(k1) &&
        !usedBurrowSpots.has(k2)
      ) {
        usedBurrowSpots.add(k1).add(k2);
        burrowsList.push([
          [r1, c1],
          [r2, c2],
        ]);
      }
    }
    if (burrowsList.length < shape.burrows) return why.no('no burrows');
  }

  let baseBoard: Board;
  let route: number[] | null;
  let frame: Frame | undefined;

  const reverseForTree = !(twists.has('dark') && !twists.has('colours'));
  if (twists.has('snow')) {
    const snowRes = randomSnowRoute(boardH, boardW, random, burrowsList, rows);
    if (!snowRes) return why.no('no snowflake route');
    route = snowRes.route;
    frame = snowRes.frame;
    baseBoard = snowRes.b;
    if (golden) {
      const topIdx = baseBoard.index.get(key(golden));
      if (reverseForTree) {
        if (route[0] === topIdx) route = [...route].reverse();
        else if (route[route.length - 1] !== topIdx) return why.no('tree route did not end at top');
      } else {
        if (route[route.length - 1] === topIdx) route = [...route].reverse();
        else if (route[0] !== topIdx) return why.no('tree route did not start at top');
      }
    }
  } else {
    baseBoard = parse({
      name: 'candidate',
      rows,
      given: [],
      ...(burrowsList ? { burrows: burrowsList } : {}),
    });
    const topIdx = golden ? baseBoard.index.get(key(golden)) : undefined;
    const rawRoute = randomRoute(baseBoard, random, topIdx);
    route = rawRoute && topIdx !== undefined && reverseForTree ? [...rawRoute].reverse() : rawRoute;
  }
  if (!route) return why.no('no route');

  let splitIdx: number | undefined;
  let colours: string[] | undefined;
  if (twists.has('colours')) {
    const res = splitTwoBunnies(route, random);
    route = res.route;
    splitIdx = res.splitIdx;
  }

  // If burrows twist was requested, every burrow must be traversed inside a bunny's route
  if (burrowsList?.length) {
    const redPart = splitIdx !== undefined ? route.slice(0, splitIdx) : route;
    const bluePart = splitIdx !== undefined ? route.slice(splitIdx) : [];
    for (const [a, z] of burrowsList) {
      const i = baseBoard.index.get(key(a));
      const j = baseBoard.index.get(key(z));
      const used =
        i !== undefined &&
        j !== undefined &&
        [redPart, bluePart].some((path) =>
          path.some(
            (x, n) => n > 0 && ((x === i && path[n - 1] === j) || (x === j && path[n - 1] === i)),
          ),
        );
      if (!used) return why.no('burrow not used');
    }
  }

  // The dark: rocks in the shadows + U-turn of shadowed lawn squares before the end
  let dark: Spot[] | undefined;
  const preservedSpots = new Set<number>();
  const prioritySpots = new Set<number>();

  // Always preserve start egg(s) and golden egg
  preservedSpots.add(route[0] as number);
  if (splitIdx !== undefined) preservedSpots.add(route[splitIdx] as number);
  if (golden) {
    const topIdx = baseBoard.index.get(key(golden));
    if (topIdx !== undefined) preservedSpots.add(topIdx);
  }
  if (burrowsList?.length) {
    for (const [u, v] of baseBoard.burrows) {
      if (preservedSpots.has(u) || preservedSpots.has(v)) return why.no('start egg on burrow');
    }
  }

  if (twists.has('dark')) {
    const uturn = findDarkUTurn(baseBoard, route, splitIdx);
    if (!uturn) return why.no('no dark u-turn');
    const [aSpot, bSpot, uIdx] = uturn as [number, number, number];
    const endIdx = splitIdx !== undefined ? splitIdx : route.length;

    const rockSpot = route[endIdx - 1] as number;
    const newLastSpot = route[endIdx - 2] as number;
    if (uIdx + 3 !== endIdx - 2) return why.no('dark u-turn not at end');

    const [rr, rc] = baseBoard.spots[rockSpot] as Spot;
    const [ar, ac] = baseBoard.spots[aSpot] as Spot;
    const [br, bc] = baseBoard.spots[bSpot] as Spot;

    // Ensure rockSpot, aSpot, bSpot are not in snowflake frame or burrows
    const inSnow = (r: number, c: number): boolean =>
      frame !== undefined &&
      r >= frame.top &&
      r <= frame.bottom &&
      c >= frame.left &&
      c <= frame.right;
    const inBurrow = (s: number): boolean => baseBoard.burrows.some(([x, y]) => x === s || y === s);
    if (
      inSnow(rr, rc) ||
      inSnow(ar, ac) ||
      inSnow(br, bc) ||
      inBurrow(rockSpot) ||
      inBurrow(aSpot) ||
      inBurrow(bSpot)
    ) {
      return why.no('dark conflicts with snow or burrow');
    }

    // Carve rockSpot as '.' in rows
    const rowStr = rows[rr] ?? '';
    rows[rr] = rowStr.slice(0, rc) + '.' + rowStr.slice(rc + 1);
    dark = [
      [ar, ac],
      [br, bc],
      [rr, rc],
    ];

    // Remove rockSpot from route (and adjust splitIdx if two bunnies)
    route = [...route.slice(0, endIdx - 1), ...route.slice(endIdx)];
    if (splitIdx !== undefined) splitIdx--;

    // Rebuild baseBoard for the updated rows & route
    baseBoard = parse({
      name: 'candidate',
      rows,
      given: [],
      dark,
      ...(burrowsList ? { burrows: burrowsList } : {}),
    });

    // Prioritize removing the egg just before the U-turn (`u`) so it isn't a local giveaway,
    // while preserving the last egg (`newLastSpot`) which gives the route's length.
    prioritySpots.add(route[uIdx] as number);
    preservedSpots.add(newLastSpot);
    if (splitIdx !== undefined) {
      preservedSpots.add(route[splitIdx] as number);
      preservedSpots.add(route[route.length - 1] as number);
    }
  }

  const noEggSpots = new Set<number>();
  if (burrowsList?.length) {
    for (const [u, v] of baseBoard.burrows) {
      if (preservedSpots.has(u) || preservedSpots.has(v)) return why.no('preserved egg on burrow');
      noEggSpots.add(u);
      noEggSpots.add(v);
      for (const s of [u, v]) {
        const idx = route.indexOf(s);
        if (idx > 0) prioritySpots.add(route[idx - 1] as number);
        if (idx >= 0 && idx + 1 < route.length) prioritySpots.add(route[idx + 1] as number);
      }
    }
  }

  let portions: string[] | undefined;
  if (twists.has('courses')) {
    portions = partitionCourses(baseBoard, route, shape.courses, splitIdx);
    // Prioritize removing eggs near course boundaries
    for (let n = 1; n < route.length; n++) {
      const u = route[n - 1] as number;
      const v = route[n] as number;
      const [ru, cu] = baseBoard.spots[u] as Spot;
      const [rv, cv] = baseBoard.spots[v] as Spot;
      if (portions[ru]?.[cu] !== portions[rv]?.[cv]) {
        for (let d = -3; d <= 3; d++) {
          const idx = route[n + d];
          if (idx !== undefined) prioritySpots.add(idx);
        }
      }
    }
  }

  if (twists.has('snow') && frame) {
    // Prioritize removing all eggs in the second half of the frame (and its immediate exits)
    for (let i = 0; i < baseBoard.spots.length; i++) {
      const [r, c] = baseBoard.spots[i] as Spot;
      if (r < frame.top || r > frame.bottom || c < frame.left || c > frame.right) continue;
      const inSecondHalf =
        frame.axis === 'v'
          ? c > (frame.left + frame.right) / 2
          : r > (frame.top + frame.bottom) / 2;
      if (inSecondHalf) {
        prioritySpots.add(i);
        for (const k of baseBoard.hops[i] ?? []) prioritySpots.add(k);
      }
    }
  }

  if (twists.has('colours') && splitIdx !== undefined) {
    const colRes = colourTwoBunnies(baseBoard, route, splitIdx, random, preservedSpots);
    if (!colRes) return why.no('no border white squares');
    colours = colRes.colours;
    for (const s of colRes.meetingSpots) prioritySpots.add(s);
  }

  let letters: [number, number, string][] | undefined;
  let message: string | undefined;
  let word: string | undefined;
  let blanks: number[] | undefined;
  if (twists.has('letters')) {
    const tmpBoard = parse({
      name: 'tmp',
      rows,
      given: [
        [
          (baseBoard.spots[route[0] as number] as Spot)[0],
          (baseBoard.spots[route[0] as number] as Spot)[1],
          1,
        ],
        ...(splitIdx !== undefined
          ? [
              [
                (baseBoard.spots[route[splitIdx] as number] as Spot)[0],
                (baseBoard.spots[route[splitIdx] as number] as Spot)[1],
                1,
              ] as [number, number, number],
            ]
          : []),
      ],
      ...(colours ? { colours } : {}),
      ...(dark ? { dark } : {}),
    });
    const [red] = splitRoutes(tmpBoard, route);
    // Find a 2x2 or 3x2 curled section of `red` (not in preservedSpots or dark) where removing
    // eggs allows alternative paths unless constrained by letter steps
    const prefer: number[] = [];
    for (let k = 1; k + 3 < red.length - (twists.has('dark') ? 4 : 0); k++) {
      const u = red[k] as number;
      const a = red[k + 1] as number;
      const bSpot = red[k + 2] as number;
      const v = red[k + 3] as number;
      if (
        (baseBoard.hops[u] ?? []).includes(v) &&
        !preservedSpots.has(a) &&
        !preservedSpots.has(bSpot)
      ) {
        prefer.push(a);
        prioritySpots.add(a);
        prioritySpots.add(bSpot);
        if (red[k + 4] !== undefined) prioritySpots.add(red[k + 4] as number);
      }
    }
    const res = addLetters(
      tmpBoard,
      route,
      random,
      shape.letters,
      new Set([...preservedSpots, ...noEggSpots]),
      prefer,
    );
    if (!res) return why.no('no letters');
    letters = res.letters;
    message = res.message;
    word = res.word;
    blanks = res.blanks;
    // Also prioritize removing numbered eggs adjacent to the letter eggs so letters do work
    for (const step of blanks) {
      for (const d of [-2, -1, 1, 2]) {
        const s = red[step - 1 + d];
        if (s !== undefined) prioritySpots.add(s);
      }
    }
  }

  const candidatePanel: Panel = {
    name: `Bunny hops ${spec.tier}`,
    rows,
    given: [],
    ...(rocks.length ? { rocks } : {}),
    ...(portions ? { portions } : {}),
    ...(colours ? { colours } : {}),
    ...(burrowsList?.length ? { burrows: burrowsList } : {}),
    ...(frame ? { frame } : {}),
    ...(letters && message && word && blanks ? { letters, message, word, blanks } : {}),
    ...(dark ? { dark } : {}),
    ...(golden ? { golden } : {}),
  };

  const given = minimizeEggs(
    candidatePanel,
    route,
    random,
    preservedSpots,
    prioritySpots,
    3_500,
    noEggSpots,
    splitIdx,
  );
  candidatePanel.given = given;

  // Give back spare eggs for twists that need them, as many as still leave every twist doing
  // its work (a twist made pointless by too many eggs fails the check below).
  for (let spare = spareEggCount(spec.tier, spec.twists); spare > 0; spare--) {
    const withSpare = addSpareEggs(candidatePanel, route, given, spare, noEggSpots, splitIdx);
    const trial: Panel = { ...candidatePanel, given: withSpare };
    if (problems(trial, margin, new Budget(200_000)).length === 0) {
      candidatePanel.given = withSpare;
      break;
    }
  }

  const missing = spec.twists.filter((t) => !twistsOf(candidatePanel).includes(t));
  if (missing.length) return why.no(`${missing[0]} missing`);

  const issues = problems(candidatePanel, margin, new Budget(200_000));
  if (issues.length) return why.no(issues[0] as string);

  const steps = new Budget(200_000);
  solve(parse(candidatePanel), 2, {}, steps);

  return {
    panel: candidatePanel,
    seed,
    stats: {
      eggs: candidatePanel.given.length,
      steps: steps.used,
    },
  };
}

/** Up to `count` different panels for a spec, trying seeds from `from` for at most `seconds` in all. */
export function generate(
  spec: Spec<HopTwist>,
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
    const found = trySeeds(seed, left, (s) => within(() => makePanel(spec, s, why)));
    if (!found) break;
    out.push(found.result);
    seed = found.seed + 1;
  }
  return out;
}
