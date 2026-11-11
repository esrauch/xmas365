/**
 * The checks every carving panel must pass, shared by the generator and the
 * tests: one answer, each clue-adding twist doing work by a margin, and
 * nothing that feels pointless.
 */
import { Budget } from '../core/budget';
import { area, offAxis } from '../core/mirror';
import { type Panel, fillMessage, parse } from './model';
import { cutsOf } from './rules';
import { countSolutions, solve } from './solve';

export type CarveTwist = 'dark' | 'letters' | 'colours' | 'cuts' | 'snow' | 'basket';
export const CARVE_TWISTS: readonly CarveTwist[] = [
  'dark',
  'letters',
  'colours',
  'cuts',
  'snow',
  'basket',
];

/** The same panel without one twist's clues (to measure what the twist does). */
export function without(p: Panel, twist: CarveTwist): Panel {
  const q: Panel = { ...p };
  if (twist === 'colours') delete q.colours;
  else if (twist === 'cuts') delete q.walls;
  else if (twist === 'snow') delete q.frame;
  else if (twist === 'letters') {
    const letters = new Set((p.sizeLetters ?? '').replace(/ /g, ''));
    q.rows = p.rows.map((row) =>
      row
        .split(' ')
        .map((t) => (letters.has(t) ? '?' : t))
        .join(' '),
    );
    delete q.sizeLetters;
    delete q.message;
  }
  return q;
}

/** Which twists a panel carries. */
export function twistsOf(p: Panel): CarveTwist[] {
  const tokens = p.rows.flatMap((row) => row.trim().split(/\s+/));
  const letters = new Set((p.sizeLetters ?? '').replace(/ /g, ''));
  const on: CarveTwist[] = [];
  if (tokens.includes('?')) on.push('dark');
  if (tokens.some((t) => letters.has(t))) on.push('letters');
  if (p.colours?.some((row) => /[rbg]/.test(row))) on.push('colours');
  if (p.walls?.length) on.push('cuts');
  if (p.frame) on.push('snow');
  if (tokens.some((t) => ['🥚', '🥕', '🍫'].includes(t))) on.push('basket');
  return on;
}

/** Problems with a panel (empty when it's good). */
export function problems(p: Panel, margin: number, budget = new Budget(3_000_000)): string[] {
  const out: string[] = [];
  const b = parse(p);
  const answers = solve(b, 2, {}, budget);
  if (answers.length !== 1) out.push(`${answers.length} answers, not 1`);
  for (const twist of twistsOf(p)) {
    if (twist === 'dark' || twist === 'basket' || twist === 'letters') continue; // hiding/coding clues, or the board itself
    const m = countSolutions(parse(without(p, twist)), margin, {}, budget);
    if (m < margin) out.push(`without ${twist}, ${m} answers (want ${margin})`);
  }
  const [answer] = answers;
  // Snowflakes: a frame that leaves room outside (the escape), near square, with real cuts off its axis.
  if (p.frame && answer) {
    const f = p.frame;
    const h = f.bottom - f.top + 1;
    const w = f.right - f.left + 1;
    if (area(f) >= b.width * b.height) out.push('the frame covers the whole board');
    if (Math.min(h, w) / Math.max(h, w) < 0.6)
      out.push('the frame is too thin to read as a snowflake');
    if (offAxis(f, cutsOf(b.height, b.width, answer)) < 3) out.push('too few cuts in the frame');
    if ((f.axis === 'v' ? w : h) % 2)
      out.push('the mirror line runs through squares, not between them');
  }
  // Letters: at least two different letters (different sizes), and the message is all blanks that fill in cleanly.
  const coded = new Set((p.sizeLetters ?? '').replace(/ /g, ''));
  const shown = new Set(
    p.rows.flatMap((row) => row.trim().split(/\s+/)).filter((t) => coded.has(t)),
  );
  if (shown.size === 1) out.push('only one letter');
  if (shown.size > 0 || p.message) {
    const filled = fillMessage(p);
    if (!filled || filled.includes('_') || /[0-9]/.test(filled))
      out.push('message blanks do not fill in cleanly');
    if (/[^0-9 ]/.test(p.message ?? '')) out.push('message has letters that are not coded');
    for (const ch of new Set(filled.replace(/ /g, ''))) {
      if (!shown.has(ch)) out.push(`letter ${ch} is not on the board`);
    }
  }
  // Red, white and blue: marks in at least two colours (one colour alone isn't the flag).
  const tones = new Set((p.colours ?? []).join('').replace(/\./g, ''));
  if (p.colours && tones.size < 2) out.push('the marks use only one colour');
  // Easter baskets (and the Feast's dishes): at least half the portions carry no number (the food does the work).
  if (b.dishes.length && answer) {
    const sized = answer.filter((x) => {
      for (let r = x.r; r < x.r + x.h; r++)
        for (let c = x.c; c < x.c + x.w; c++) {
          const cell = b.cells[r]?.[c];
          if (cell && (cell.n !== undefined || cell.letter || cell.dark)) return true;
        }
      return false;
    });
    if (sized.length > answer.length / 2) out.push('most portions still carry their size');
  }
  return out;
}
