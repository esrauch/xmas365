/**
 * Verification for Net (Lights) panels: uniqueness, margin validation for twists,
 * and aesthetic rules.
 */
import { Budget } from '../core/budget';
import { area, offAxis } from '../core/mirror';
import { DIRS, type Panel, STEP, type Spot, key, parse } from './model';
import { type Rules, piecesSymmetricIn, servings, spell, wiresOf } from './rules';
import { countSolutions, solve } from './solve';

export type LightTwist = 'snow' | 'dark' | 'letters' | 'eggs' | 'colours' | 'slices';
export const LIGHT_TWISTS: readonly LightTwist[] = [
  'snow',
  'dark',
  'letters',
  'eggs',
  'colours',
  'slices',
];

/** The rule flag that leaves one clue-adding twist out. */
export const leaveOut: Partial<Record<LightTwist, Rules>> = {
  snow: { noSnow: true },
  letters: { noLetters: true },
  eggs: { noEggs: true },
  colours: { noColours: true },
  slices: { noServings: true },
};

/** The same panel without one twist's clues (for external callers). */
export function without(p: Panel, twist: LightTwist): Panel {
  const q: Panel = { ...p };
  if (twist === 'snow') {
    delete q.frame;
  } else if (twist === 'dark') {
    delete q.dark;
  } else if (twist === 'letters') {
    delete q.letters;
    delete q.message;
    delete q.word;
    delete q.blanks;
  } else if (twist === 'eggs') {
    delete q.eggs;
  } else if (twist === 'colours') {
    if (p.colours) {
      q.colours = p.colours.map((row) => row.replace(/[rbg]/g, 'w'));
    }
  } else if (twist === 'slices') {
    delete q.slices;
  }
  return q;
}

/** Which twists a panel carries. */
export function twistsOf(p: Panel): LightTwist[] {
  const on: LightTwist[] = [];
  if (p.frame) on.push('snow');
  if (p.dark?.length) on.push('dark');
  if (p.letters?.length) on.push('letters');
  if (p.eggs?.length) on.push('eggs');
  if (p.colours?.some((row) => /[rbg]/.test(row)) || p.bluePlug || p.greenPlug) {
    on.push('colours');
  }
  if (p.slices?.some((row) => /[A-Za-z]/.test(row))) on.push('slices');
  return on;
}

/** Problems with a panel (empty when it is good). */
export function problems(p: Panel, margin: number, budget = new Budget(500_000)): string[] {
  const out: string[] = [];
  const b = parse(p);

  // When `dark` is present, the player cannot see the piece shapes inside `?` squares,
  // so the panel must have a unique solution even with `blindDark: true`!
  const answers = solve(b, 2, { blindDark: b.dark.size > 0 }, budget);
  if (answers.length !== 1) {
    out.push(`${answers.length} answers, not 1`);
    return out;
  }

  for (const twist of twistsOf(p)) {
    const rule = leaveOut[twist];
    if (!rule) continue; // `dark` hides clues: nothing to take away
    const m = countSolutions(b, margin, rule, budget);
    if (m < margin) {
      out.push(`without ${twist}, ${m} answers (want ${margin})`);
    }
  }

  // Snowflakes: frame >= 3x3, near-square, even across mirror line, room outside, and >= 3 off-axis wires.
  if (p.frame) {
    const f = p.frame;
    const h = f.bottom - f.top + 1;
    const w = f.right - f.left + 1;
    const wires = wiresOf(b.solution);
    if (h < 3 || w < 3) out.push('the frame is smaller than 3x3');
    if (area(f) >= b.width * b.height) out.push('the frame covers the whole board');
    if (Math.min(h, w) / Math.max(h, w) < 0.6)
      out.push('the frame is too thin to read as a snowflake');
    if ((f.axis === 'v' ? w : h) % 2 !== 0)
      out.push('the mirror line runs through squares, not between them');
    if (!piecesSymmetricIn(f, b.solution)) out.push('pieces inside the frame are not mirrored');
    if (offAxis(f, wires) < 3) out.push('too few wires in the frame');
  }

  // Letters: at least two distinct letters, distances >= 2, and distances spell the target word.
  if (p.letters) {
    const distinct = new Set(p.letters.map(([, , ch]) => ch));
    if (distinct.size < 2) out.push('only one letter');
    if (p.blanks?.some((d) => d < 2)) out.push('letter bulb at trivial distance < 2');
    if (p.colours && p.letters.some(([r, c]) => p.colours?.[r]?.[c] === 'w'))
      out.push('letter bulb placed on white piece');
    if (p.word && spell(b, b.solution) !== p.word)
      out.push(`spelled ${spell(b, b.solution)}, want ${p.word}`);
  }

  // Eggs: every egg must be at distance >= 2, and no single egg may be redundant.
  if (p.eggs?.length) {
    for (const e of p.eggs) {
      if (e[2] < 2) out.push(`egg ${e[2]} at ${e[0]},${e[1]} is trivial`);
      if (p.colours && p.colours[e[0]]?.[e[1]] === 'w')
        out.push(`egg at ${e[0]},${e[1]} placed on white piece`);
      if (p.eggs.length > 1) {
        const rest = p.eggs.filter((x) => x !== e);
        if (countSolutions(parse({ ...p, eggs: rest }), 2, {}, budget) < 2)
          out.push(`egg at ${e[0]},${e[1]} is redundant`);
      }
    }
  }

  // Colours: red, blue, and white pieces all present, and every white piece borders both red and blue.
  if (p.colours) {
    const tones = new Set(p.colours.join('').replace(/\./g, ''));
    if (!tones.has('r') || (!tones.has('b') && !tones.has('g')))
      out.push('colours must include both red and blue');
    if (!tones.has('w')) out.push('colours must include white pieces');
    const secTone = tones.has('b') ? 'b' : 'g';
    for (let r = 0; r < b.height; r++) {
      for (let c = 0; c < b.width; c++) {
        if (!b.inside(r, c) || p.colours[r]?.[c] !== 'w') continue;
        let touchesRed = false;
        let touchesBlue = false;
        for (const d of DIRS) {
          const [dr, dc] = STEP[d] as Spot;
          const nr = r + dr;
          const nc = c + dc;
          if (!b.inside(nr, nc)) continue;
          const ch = p.colours[nr]?.[nc];
          if (ch === 'r') touchesRed = true;
          if (ch === secTone) touchesBlue = true;
        }
        if (!touchesRed || !touchesBlue) {
          out.push(`white piece at ${r},${c} does not border both red and blue`);
        }
      }
    }
  }

  // Slices: each slice must be a fair-share wedge reaching the outer edge of the board.
  if (p.slices) {
    const sliceSpots = new Map<string, Spot[]>();
    let total = 0;
    for (let r = 0; r < b.height; r++) {
      for (let c = 0; c < b.width; c++) {
        if (!b.inside(r, c)) continue;
        total++;
        const s = b.slice(r, c);
        if (!s || s === '*') continue;
        const list = sliceSpots.get(s) ?? [];
        list.push([r, c]);
        sliceSpots.set(s, list);
      }
    }
    const minShare = Math.floor((total - 1) / Math.max(1, sliceSpots.size * 2));
    for (const [s, spots] of sliceSpots) {
      if (spots.length < minShare) {
        out.push(`slice ${s} is too small (${spots.length} squares, want >= ${minShare})`);
      }
      const touchesEdge = spots.some(
        ([r, c]) => r === 0 || r === b.height - 1 || c === 0 || c === b.width - 1,
      );
      if (!touchesEdge) {
        out.push(`slice ${s} does not reach the outer edge of the pie`);
      }
    }
    // One serving per slice isn't a rule the player is told: the walls must make it so.
    for (const [s, n] of servings(b, b.solution).feeds)
      if (n !== 1) out.push(`slice ${s} gets ${n} wires from the middle, not 1`);
  }

  // The dark: at least 2 dark squares, never touching each other, never on a plug/egg/letter/cross.
  if (p.dark?.length) {
    if (p.dark.length < 2) out.push('fewer than 2 dark squares');
    const secPlug = b.bluePlug ?? b.greenPlug;
    const forbidden = new Set<string>([
      key(b.plug[0], b.plug[1]),
      ...(secPlug ? [key(secPlug[0], secPlug[1])] : []),
      ...b.eggs.map(([r, c]) => key(r, c)),
      ...b.letters.map(([r, c]) => key(r, c)),
    ]);
    for (let i = 0; i < p.dark.length; i++) {
      const [r1, c1] = p.dark[i] as [number, number];
      if (forbidden.has(key(r1, c1))) out.push(`dark square at ${r1},${c1} overlaps a clue/plug`);
      if ((b.solution[r1]?.[c1] ?? 0) === 15)
        out.push(`dark square at ${r1},${c1} is a 4-way cross`);
      for (let j = i + 1; j < p.dark.length; j++) {
        const [r2, c2] = p.dark[j] as [number, number];
        if (Math.abs(r1 - r2) + Math.abs(c1 - c2) <= 1)
          out.push(`dark squares ${r1},${c1} and ${r2},${c2} touch`);
      }
    }
  }

  return out;
}
