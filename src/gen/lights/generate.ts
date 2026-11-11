/**
 * Lights generator: plain panels, or any mix of holiday twists, at a tier.
 */
import { Budget, within } from '../core/budget';
import { rng } from '../core/rng';
import { type Made, Rejections, type Spec, type Tier, trySeeds } from '../core/spec';
import {
  addDark,
  addEggs,
  addLetters,
  colourTree,
  makePieSlices,
  randomSnowTree,
  randomTree,
} from './make';
import {
  type Panel,
  type Shape,
  type Spot,
  ovalShape,
  parse,
  rectangle,
  ringShape,
  treeShape,
} from './model';
import { solve } from './solve';
import { type LightTwist, problems, twistsOf } from './verify';

export interface TierShape {
  width: number;
  height: number;
  eggs: number;
  letters: number;
  slices: number;
  dark: number;
  margin: number;
}

export const SHAPES: Record<Tier, TierShape> = {
  easy: { width: 5, height: 5, eggs: 1, letters: 3, slices: 2, dark: 2, margin: 2 },
  medium: { width: 6, height: 6, eggs: 2, letters: 4, slices: 2, dark: 3, margin: 3 },
  hard: { width: 7, height: 7, eggs: 2, letters: 5, slices: 3, dark: 4, margin: 3 },
};

function buildBoardShape(tierShape: TierShape, kind: Spec<LightTwist>['shape'] = 'rect'): Shape {
  const { height: H, width: W } = tierShape;
  if (kind === 'tree') return H <= 5 ? treeShape(6, 7, 0.5) : treeShape(H, W, 0.5);
  if (kind === 'egg') return ovalShape(H, W, H <= 5 ? 1 : 1.25);
  if (kind === 'pie') return ovalShape(H, W, 1);
  if (kind === 'wreath') {
    if (H <= 5) return ringShape(7, 7, 0.015, 0.32);
    return ringShape(8, 8, 0.03, 0.32);
  }
  return rectangle(H, W);
}

function makePanel(spec: Spec<LightTwist>, seed: number, why: Rejections): Made<Panel> | null {
  const shape = SHAPES[spec.tier];
  const twists = new Set(spec.twists);
  const margin = twists.size > 1 ? 2 : shape.margin;

  let mixedSeed = (seed * 7919 + 53) >>> 0;
  for (const t of [...spec.twists].sort()) {
    for (let i = 0; i < t.length; i++) mixedSeed = (mixedSeed * 33 + t.charCodeAt(i)) >>> 0;
  }
  const random = rng(mixedSeed);

  return within(() => {
    const boardShape = buildBoardShape(shape, spec.shape);
    const H = boardShape.length;
    const W = boardShape[0]?.length ?? shape.width;
    const hasEggsOrLetters = twists.has('eggs') || twists.has('letters');
    const needCycles =
      !twists.has('snow') && (hasEggsOrLetters || twists.has('colours'))
        ? margin >= 3
          ? 2
          : 1
        : 0;
    const straddleCycles =
      !twists.has('snow') && twists.has('slices')
        ? hasEggsOrLetters
          ? 1
          : margin >= 3
            ? 2
            : 1
        : 0;

    const pie = twists.has('slices')
      ? makePieSlices(H, W, shape.slices, random, hasEggsOrLetters, boardShape)
      : undefined;
    const mid = Math.floor(W / 2);
    const rawPlug: Spot = pie ? pie.plug : [H - 1, mid];
    const plug: Spot =
      boardShape[rawPlug[0]]?.[rawPlug[1]] === '#'
        ? rawPlug
        : ([boardShape.findIndex((row) => row[mid] === '#'), mid] as Spot);
    const plugDegree = pie ? shape.slices : undefined;

    const p = twists.has('snow')
      ? randomSnowTree(boardShape, plug, random, margin >= 3 ? 2 : 1)
      : randomTree(
          boardShape,
          plug,
          random,
          'branching',
          needCycles,
          plugDegree,
          pie?.slices,
          straddleCycles,
        );
    if (!p) return why.no('failed to build spanning tree');

    let candidate: Panel = {
      ...p,
      ...(spec.shape === 'tree' ? { star: [0, mid] as Spot } : {}),
    };
    const b0 = parse(candidate);
    const sols = solve(b0, margin + 4, { noSnow: true, noServings: true }, new Budget(35_000));

    // If no clue-adding twists, the plain puzzle must already have a unique solution
    const clueTwists = ['snow', 'letters', 'eggs', 'colours', 'slices'] as const;
    const hasClueTwist = clueTwists.some((t) => twists.has(t));
    if (!hasClueTwist) {
      if (sols.length !== 1) return why.no(`plain panel had ${sols.length} answers, want 1`);
    }

    // Fourth of July colours: split tree into red and blue strings with white pieces
    if (twists.has('colours')) {
      const wantAmbiguity = twists.has('eggs') || twists.has('letters');
      const coloured = colourTree(candidate, random, margin, wantAmbiguity, sols);
      if (!coloured) return why.no('could not partition tree into colours');
      candidate = coloured;
    }

    // Thanksgiving fair shares / slices
    let sliceEliminated: number[][][] = [];
    if (twists.has('slices')) {
      const wantMoreAfter = twists.has('eggs') || twists.has('letters');
      if (sols.length < (wantMoreAfter ? margin + 1 : margin)) {
        return why.no(`too few alternative answers (${sols.length}) for slices`);
      }
    }

    // Easter numbered eggs
    if (twists.has('eggs')) {
      const baseSols = solve(parse(candidate), margin + 4, {}, new Budget(35_000));
      if (baseSols.length < margin) {
        return why.no(`too few alternative answers (${baseSols.length}) for eggs`);
      }
      if (twists.has('slices') && baseSols.length >= sols.length) {
        return why.no('slices did not eliminate any solution before eggs');
      }
      const eggs = addEggs(candidate, baseSols.slice(1), shape.eggs, random);
      if (!eggs) return why.no('could not place eggs');
      candidate.eggs = eggs;
    }

    // Valentine's letters for numbers
    if (twists.has('letters')) {
      const baseSols = solve(parse(candidate), margin + 4, {}, new Budget(35_000));
      if (baseSols.length < margin) {
        return why.no(`too few alternative answers (${baseSols.length}) for letters`);
      }
      if (twists.has('slices')) {
        const baseKeys = new Set(baseSols.map((g) => JSON.stringify(g)));
        sliceEliminated = sols.filter((g) => !baseKeys.has(JSON.stringify(g)));
        if (sliceEliminated.length === 0) {
          return why.no('slices did not eliminate any solution before letters');
        }
      }
      const l = addLetters(candidate, baseSols.slice(1), shape.letters, random, sliceEliminated);
      if (!l) return why.no('could not place letter bulbs');
      candidate.letters = l.letters;
      candidate.message = l.message;
      candidate.word = l.word;
      candidate.blanks = l.blanks;
    }

    // Halloween dark: hide non-adjacent pieces while keeping solution unique under blindDark
    if (twists.has('dark')) {
      const dark = addDark(candidate, shape.dark, random);
      if (!dark) return why.no('could not place dark squares');
      candidate.dark = dark;
    }

    const missing = spec.twists.filter((t) => !twistsOf(candidate).includes(t));
    if (missing.length) return why.no(`${missing[0]} left no clue`);

    const bad = problems(candidate, margin, new Budget(80_000));
    if (bad.length) return why.no(bad[0] ?? 'validation failed');

    const budget = new Budget(80_000);
    const answers = solve(
      parse(candidate),
      2,
      { blindDark: Boolean(candidate.dark?.length) },
      budget,
    );
    if (answers.length !== 1) return why.no(`panel has ${answers.length} answers, want 1`);

    return {
      panel: candidate,
      seed,
      stats: { steps: budget.used },
    };
  });
}

/** Generate panels meeting a spec, up to count panels. */
export function generate(
  spec: Spec<LightTwist>,
  count = 1,
  seconds = 10,
  seed = 1,
  why = new Rejections(),
): Made<Panel>[] {
  const deadline = Date.now() + seconds * 1000;
  const out: Made<Panel>[] = [];
  let s = seed;

  while (out.length < count && Date.now() < deadline) {
    const left = (deadline - Date.now()) / 1000;
    const found = trySeeds(s, left, (curSeed) => within(() => makePanel(spec, curSeed, why)));
    if (!found) break;
    out.push(found.result);
    s = found.seed + 1;
  }

  return out;
}
