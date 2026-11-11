/**
 * The checks every webs panel must pass, shared by the generator (before it
 * keeps a panel) and the tests (on every pinned panel): one answer, each
 * twist doing work by a margin, and nothing that feels pointless.
 */
import { Budget } from '../core/budget';
import { mirrorSquare, offAxis } from '../core/mirror';
import { type Panel, type Web, parse } from './model';
import { fillMessage, letterValues, strokes } from './rules';
import { countSolutions, solve } from './solve';

export type WebTwist = 'dark' | 'letters' | 'colours' | 'eggs' | 'cuts' | 'snow';
export const WEB_TWISTS: readonly WebTwist[] = [
  'dark',
  'letters',
  'colours',
  'eggs',
  'cuts',
  'snow',
];

/** The fewest links from a knot to every knot, over every link a thread could use (-1: unreachable). */
export function reach(web: Web, from: number): number[] {
  const d = web.knots.map(() => -1);
  d[from] = 0;
  const queue = [from];
  while (queue.length) {
    const x = queue.shift() as number;
    for (const i of web.incident[x] ?? []) {
      const l = web.links[i];
      if (!l) continue;
      const y = l.a === x ? l.b : l.a;
      if (d[y] === -1) {
        d[y] = (d[x] ?? 0) + 1;
        queue.push(y);
      }
    }
  }
  return d;
}

/** The same panel without one twist's clues (to measure what the twist does). */
export function without(p: Panel, twist: WebTwist): Panel {
  const q: Panel = { ...p };
  if (twist === 'eggs') {
    delete q.eggs;
    delete q.home;
  } else if (twist === 'colours') delete q.colours;
  else if (twist === 'cuts') delete q.walls;
  else if (twist === 'snow') delete q.frame;
  else if (twist === 'letters') {
    q.rows = p.rows.map((row) => row.replace(/[A-Z]/g, '?'));
    delete q.letters;
    delete q.message;
  }
  return q;
}

/** Which twists a panel carries. */
export function twistsOf(p: Panel): WebTwist[] {
  const on: WebTwist[] = [];
  if (p.rows.some((r) => r.includes('?'))) on.push('dark');
  if (p.rows.some((r) => /[A-Z]/.test(r))) on.push('letters');
  if (p.colours) on.push('colours');
  if (p.eggs?.length) on.push('eggs');
  if (p.walls?.length) on.push('cuts');
  if (p.frame) on.push('snow');
  return on;
}

/**
 * Problems with a panel (empty when it's good). `margin`: without any one
 * twist that adds clues (eggs, cuts, colours, snowflakes, letters read as dark), at
 * least this many answers fit.
 */
export function problems(p: Panel, margin: number, budget = new Budget(2_000_000)): string[] {
  const out: string[] = [];
  const web = parse(p);
  const n = countSolutions(web, 2, {}, budget);
  if (n !== 1) out.push(`${n} answers, not 1`);
  for (const twist of twistsOf(p)) {
    if (twist === 'dark' || twist === 'letters') continue; // hiding clues or unscrambled word: nothing to take away
    const m = countSolutions(parse(without(p, twist)), margin, {}, budget);
    if (m < margin) out.push(`without ${twist}, ${m} answers (want ${margin})`);
  }
  // Letters: every unique letter of the message appears on the board, and no letters are pre-revealed in message.
  const shown = new Set(p.rows.join('').match(/[A-Z]/g) ?? []);
  if (shown.size === 1) out.push('only one letter');
  if (shown.size > 0) {
    const [answer] = solve(web, 1, {}, budget);
    const values = answer ? letterValues(web, answer) : null;
    const filled = values && p.message ? fillMessage(p.message, values) : '';
    if (!filled || filled.includes('_') || !/[A-Z]/.test(filled))
      out.push('message blanks do not fill in cleanly');
    if (/[^0-9 ]/.test(p.message ?? '')) out.push('message has uncoded letters');
    for (const ch of filled) {
      if (/[A-Z]/.test(ch) && !shown.has(ch)) out.push(`letter ${ch} is not on the board`);
    }
  }
  // Snowflakes (whole board on Webs): the knots sit in mirror image, the answer draws
  // enough off the axis, and the numbers mustn't simply mirror too (or one half solves the other).
  if (p.frame) {
    const f = p.frame;
    const at = new Set(web.knots.map((k) => `${k.r},${k.c}`));
    if (web.knots.some((k) => !at.has(mirrorSquare(f, k.r, k.c).join(','))))
      out.push('the knots are not in mirror image');
    const [answer] = solve(web, 1, {}, budget);
    if (answer && offAxis(f, strokes(web, answer)) < 3) out.push('too little drawn off the axis');
    const pairs = web.knots.flatMap((k) => {
      const [mr, mc] = mirrorSquare(f, k.r, k.c);
      const m = p.rows[mr]?.[mc] ?? '';
      const n = p.rows[k.r]?.[k.c] ?? '';
      return (mr < k.r || (mr === k.r && mc < k.c)) && /[0-9A-Z]/.test(m) && /[0-9A-Z]/.test(n)
        ? [m !== n]
        : [];
    });
    if (pairs.length && pairs.filter(Boolean).length < pairs.length / 3)
      out.push('the mirror knots mostly show the same numbers');
  }
  // Eggs must refute the obvious path: an egg's number is more than the fewest links that could reach it.
  if (web.home !== undefined) {
    const near = reach(web, web.home);
    for (const [k, egg] of web.eggs) {
      const knot = web.knots[k];
      if (egg < 2) out.push(`egg ${egg} at ${knot?.r},${knot?.c} is trivial`);
      else if (egg <= (near[k] ?? 0))
        out.push(`egg ${egg} at ${knot?.r},${knot?.c} only confirms the shortest path`);
    }
  }
  return out;
}
