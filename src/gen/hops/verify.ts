/**
 * The checks every bunny hops panel must pass, shared by the generator and
 * the tests: one answer, each twist doing work by a margin, and nothing that
 * feels pointless.
 */
import { Budget } from '../core/budget';
import { area, offAxis } from '../core/mirror';
import { type Panel, key, parse, splitRoutes } from './model';
import { type Rules, spell, trailSegments } from './rules';
import { countSolutions, solve } from './solve';

export type HopTwist = 'courses' | 'colours' | 'burrows' | 'snow' | 'letters' | 'dark';
export const HOP_TWISTS: readonly HopTwist[] = [
  'courses',
  'colours',
  'burrows',
  'snow',
  'letters',
  'dark',
];

/** The rule flag that leaves one twist out. */
export const leaveOut: Record<HopTwist, Rules> = {
  courses: { noPortions: true },
  colours: { noColours: true },
  burrows: { noBurrows: true },
  snow: { noSnow: true },
  letters: { noLetters: true },
  dark: { noDarkLength: true },
};

/** The same panel without one twist's clues (for external callers). */
export function without(p: Panel, twist: HopTwist): Panel {
  const q: Panel = { ...p };
  if (twist === 'courses') delete q.portions;
  else if (twist === 'colours') {
    if (p.colours) {
      q.colours = p.colours.map((row) => row.replace(/[rbg]/g, 'w'));
    }
  } else if (twist === 'burrows') delete q.burrows;
  else if (twist === 'snow') delete q.frame;
  else if (twist === 'letters') {
    delete q.letters;
    delete q.message;
    delete q.word;
    delete q.blanks;
  } else if (twist === 'dark') {
    delete q.dark;
  }
  return q;
}

/** Which twists a panel carries. */
export function twistsOf(p: Panel): HopTwist[] {
  const on: HopTwist[] = [];
  if (p.portions?.some((row) => /[A-Za-z]/.test(row))) on.push('courses');
  if (p.colours?.some((row) => /[rbg]/.test(row))) on.push('colours');
  if (p.burrows?.length) on.push('burrows');
  if (p.frame) on.push('snow');
  if (p.letters?.length) on.push('letters');
  if (p.dark?.length) on.push('dark');
  return on;
}

/** Problems with a panel (empty when it is good). */
export function problems(p: Panel, margin: number, budget = new Budget(2_000_000)): string[] {
  const out: string[] = [];
  const b = parse(p);
  const answers = solve(b, 2, {}, budget);
  if (answers.length !== 1) {
    out.push(`${answers.length} answers, not 1`);
    return out;
  }
  const answer = answers[0] as number[];

  for (const twist of twistsOf(p)) {
    if (twist === 'burrows') {
      // Burrows are board connections: every burrow must be traversed in the unique answer,
      // and no given or letter egg may sit directly on a burrow hole.
      const [red, blue] = splitRoutes(b, answer);
      for (const [u, v] of b.burrows) {
        const used = [red, blue].some((path) =>
          path.some(
            (x, n) => n > 0 && ((x === u && path[n - 1] === v) || (x === v && path[n - 1] === u)),
          ),
        );
        if (!used) out.push('a burrow is never used');
        for (const s of [u, v]) {
          if (b.given.has(s) || b.letterAt.has(s))
            out.push(`egg placed on burrow at ${key(b.spots[s] as [number, number])}`);
        }
      }
      continue;
    }
    const m = countSolutions(b, margin, leaveOut[twist], budget);
    if (m < margin) out.push(`without ${twist}, ${m} answers (want ${margin})`);
  }

  // Courses with two bunnies: a course is one bunny's, so each bunny's route must cross
  // at least two courses (a course that is a bunny's whole colour zone does nothing).
  if (p.portions && p.colours)
    splitRoutes(b, answer).forEach((route, i) => {
      const courses = new Set(route.map((s) => b.portion[s]).filter((x) => x !== undefined));
      if (route.length && courses.size < 2)
        out.push(`the ${i === 0 ? 'red' : 'blue'} bunny stays in one course`);
    });

  // Courses: each course portion must be a single orthogonally connected region on the board.
  if (p.portions) {
    const byCourse = new Map<string, number[]>();
    for (let i = 0; i < b.spots.length; i++) {
      if (b.dark[i] && !b.isLawn[i]) continue;
      const ch = b.portion[i];
      if (!ch) continue;
      const list = byCourse.get(ch) ?? [];
      list.push(i);
      byCourse.set(ch, list);
    }
    for (const [ch, spots] of byCourse) {
      if (spots.length <= 1) continue;
      const set = new Set(spots);
      const seen = new Set<number>([spots[0] as number]);
      const queue = [spots[0] as number];
      while (queue.length) {
        const u = queue.shift() as number;
        const [ru, cu] = b.spots[u] as [number, number];
        for (const v of spots) {
          if (seen.has(v)) continue;
          const [rv, cv] = b.spots[v] as [number, number];
          if (Math.abs(ru - rv) + Math.abs(cu - cv) === 1 && set.has(v)) {
            seen.add(v);
            queue.push(v);
          }
        }
      }
      if (seen.size !== spots.length) out.push(`course ${ch} is disconnected`);
    }
  }

  // Colours: two bunnies (red and blue), with white squares so both colours do work.
  if (p.colours) {
    if (!b.twoBunnies) out.push('colours must have two bunnies (two 1 eggs, red and blue)');
    const tones = new Set(p.colours.join('').replace(/\./g, ''));
    if (!tones.has('r') || (!tones.has('b') && !tones.has('g')))
      out.push('colours must include both red and blue');
    if (!tones.has('w')) out.push('colours must include white (plain) squares');
    for (const [i] of b.given) {
      if (b.colour[i] !== 'r' && b.colour[i] !== b.secondTone)
        out.push(`given egg on non-coloured square at ${key(b.spots[i] as [number, number])}`);
    }
    for (const [i] of b.letterAt) {
      if (b.colour[i] !== 'r' && b.colour[i] !== b.secondTone)
        out.push(`letter egg on non-coloured square at ${key(b.spots[i] as [number, number])}`);
    }
    for (let i = 0; i < b.spots.length; i++) {
      if (b.colour[i] !== 'w') continue;
      const nbrs = b.hops[i] ?? [];
      const touchesRed = nbrs.some((j) => !b.dark[j] && b.colour[j] === 'r');
      const touchesBlue = nbrs.some((j) => !b.dark[j] && b.colour[j] === b.secondTone);
      if (!touchesRed || !touchesBlue) {
        out.push(
          `white square at ${key(b.spots[i] as [number, number])} is not reachable from both red and blue`,
        );
      }
    }
    for (const tone of ['r', b.secondTone] as const) {
      const spotsOfTone = b.spots
        .map((_, i) => i)
        .filter((i) => !b.dark[i] && b.colour[i] === tone);
      if (spotsOfTone.length > 1) {
        const seen = new Set<number>([spotsOfTone[0] as number]);
        const queue = [spotsOfTone[0] as number];
        while (queue.length) {
          const u = queue.shift() as number;
          for (const v of b.hops[u] ?? []) {
            if (!b.dark[v] && b.colour[v] === tone && !seen.has(v)) {
              seen.add(v);
              queue.push(v);
            }
          }
        }
        if (seen.size !== spotsOfTone.length) {
          out.push(`${tone} squares are disconnected`);
        }
      }
    }
    const [redAns, blueAns] = splitRoutes(b, answer);
    if (!redAns.some((i) => !b.dark[i] && b.colour[i] === 'w'))
      out.push('red bunny does not visit any white square');
    if (!blueAns.some((i) => !b.dark[i] && b.colour[i] === 'w'))
      out.push('blue bunny does not visit any white square');
  }

  // Letters: at least two letter eggs, and the route spells the message word.
  if (p.letters) {
    if (p.letters.length < 2) out.push('only one letter egg');
    if (p.word && spell(b, answer) !== p.word)
      out.push(`spelled ${spell(b, answer)}, want ${p.word}`);
  }

  // Snowflakes: frame >= 3x3, near-square, even across mirror line, room outside, and >= 3 off-axis strokes.
  if (p.frame) {
    const f = p.frame;
    const h = f.bottom - f.top + 1;
    const w = f.right - f.left + 1;
    if (h < 3 || w < 3) out.push('the frame is smaller than 3x3');
    if (area(f) >= b.width * b.height) out.push('the frame covers the whole board');
    if (Math.min(h, w) / Math.max(h, w) < 0.6)
      out.push('the frame is too thin to read as a snowflake');
    if ((f.axis === 'v' ? w : h) % 2 !== 0)
      out.push('the mirror line runs through squares, not between them');
    if (offAxis(f, trailSegments(b, answer)) < 3) out.push('too few strokes in the frame');
    const halfArea = (h * w) / 2;
    let givenHalf1 = 0;
    let givenHalf2 = 0;
    for (const [i] of b.given) {
      const [r, c] = b.spots[i] as [number, number];
      if (r < f.top || r > f.bottom || c < f.left || c > f.right) continue;
      const inHalf2 = f.axis === 'v' ? c > (f.left + f.right) / 2 : r > (f.top + f.bottom) / 2;
      if (inHalf2) givenHalf2++;
      else givenHalf1++;
    }
    if (givenHalf1 >= halfArea || givenHalf2 >= halfArea)
      out.push('snowflake frame half is completely filled with given eggs');
  }

  // The dark: shadowed squares include both lawn and rock, no eggs in the dark, and the last egg gives the length.
  if (p.dark?.length) {
    const visited = new Set(answer);
    if (b.spots.some((_, i) => visited.has(i) !== b.isLawn[i]))
      out.push('answer does not match true lawn under the dark');
    const darkSpots = b.spots.map((_, i) => i).filter((i) => b.dark[i]);
    if (!darkSpots.some((i) => b.isLawn[i])) out.push('no lawn squares in the dark');
    if (!darkSpots.some((i) => !b.isLawn[i])) out.push('no rocks in the dark');
    for (const i of darkSpots) {
      if (b.given.has(i) || b.letterAt.has(i))
        out.push(`clue inside the dark at ${key(b.spots[i] as [number, number])}`);
    }
    const [red, blue] = splitRoutes(b, answer);
    const redEnd = red[red.length - 1];
    if (redEnd === undefined || b.given.get(redEnd) !== red.length)
      out.push('last egg does not give the route length');
    if (b.twoBunnies) {
      const blueEnd = blue[blue.length - 1];
      if (blueEnd === undefined || b.given.get(blueEnd) !== blue.length)
        out.push('second bunny last egg does not give its route length');
    }
  }

  return out;
}
