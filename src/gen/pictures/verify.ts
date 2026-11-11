/**
 * The checks every picture-grid panel must pass, shared by the generator and
 * the tests: one answer (matching the panel's picture), each twist doing work
 * by a margin, and nothing that feels pointless.
 */
import { Budget } from '../core/budget';
import { area } from '../core/mirror';
import { type Panel, clues, fillMessage, picture } from './model';
import { eggsHold, frameSymmetric, matches, portionCounts } from './rules';
import { countIndependentColours, countSolutions, logical, solve } from './solve';

export type PictureTwist = 'dark' | 'letters' | 'colours' | 'eggs' | 'portions' | 'snow';
export const PICTURE_TWISTS: readonly PictureTwist[] = [
  'dark',
  'letters',
  'colours',
  'eggs',
  'portions',
  'snow',
];

/** Which twists a panel carries. */
export function twistsOf(p: Panel): PictureTwist[] {
  const on: PictureTwist[] = [];
  if (p.dark?.length) on.push('dark');
  if (p.letters && p.letters.trim().length > 0) on.push('letters');
  if (p.palette && p.palette.length > 1) on.push('colours');
  if (p.eggs?.length) on.push('eggs');
  if (p.portions?.length) on.push('portions');
  if (p.frame) on.push('snow');
  return on;
}

/** The same panel without one twist's clues (to measure what the twist does). */
export function without(p: Panel, twist: PictureTwist): Panel {
  const q: Panel = { ...p };
  if (twist === 'eggs') {
    delete q.eggs;
  } else if (twist === 'portions') {
    delete q.portions;
  } else if (twist === 'snow') {
    delete q.frame;
  } else if (twist === 'letters') {
    // Replace every letter clue with a dark ('?') clue so we measure what the
    // letter identities (same letter = same number) contribute beyond '?'.
    const c = clues(p);
    const extraDark: ['row' | 'col', number, number][] = [...(p.dark ?? [])];
    const hasDark = new Set(extraDark.map(([k, l, i]) => `${k},${l},${i}`));
    c.rows.forEach((runs, r) =>
      runs.forEach((run, k) => {
        if (run.letter && !hasDark.has(`row,${r},${k}`)) extraDark.push(['row', r, k]);
      }),
    );
    c.cols.forEach((runs, col) =>
      runs.forEach((run, k) => {
        if (run.letter && !hasDark.has(`col,${col},${k}`)) extraDark.push(['col', col, k]);
      }),
    );
    q.dark = extraDark;
    delete q.letters;
    delete q.message;
  }
  return q;
}

/** Check whether every portion in `portions` is 4-connected. */
function portionsConnected(portions: string[]): boolean {
  const H = portions.length;
  const W = portions[0]?.length ?? 0;
  const byLabel = new Map<string, [number, number][]>();
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const ch = portions[r]?.[c];
      if (!ch) continue;
      const list = byLabel.get(ch) ?? [];
      list.push([r, c]);
      byLabel.set(ch, list);
    }
  }
  if (byLabel.size < 2) return false;
  for (const [label, cells] of byLabel) {
    const start = cells[0];
    if (!start) continue;
    const seen = new Set<string>([`${start[0]},${start[1]}`]);
    const queue: [number, number][] = [start];
    while (queue.length) {
      const [r, c] = queue.shift() as [number, number];
      for (const [nr, nc] of [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ] as const) {
        if (nr >= 0 && nr < H && nc >= 0 && nc < W && portions[nr]?.[nc] === label) {
          const k = `${nr},${nc}`;
          if (!seen.has(k)) {
            seen.add(k);
            queue.push([nr, nc]);
          }
        }
      }
    }
    if (seen.size !== cells.length) return false;
  }
  return true;
}

/** Problems with a panel (empty when it's good). */
export function problems(p: Panel, margin: number, budget = new Budget(2_000_000)): string[] {
  const out: string[] = [];
  const H = p.rows.length;
  const W = p.rows[0]?.length ?? 0;
  const grid = picture(p);
  const c = clues(p);

  // No completely empty rows or columns.
  if (c.rows.some((r) => r.length === 0)) out.push('a row is completely empty');
  if (c.cols.some((col) => col.length === 0)) out.push('a column is completely empty');

  const answers = solve(p, 2, {}, budget);
  if (answers.length !== 1) out.push(`${answers.length} answers, not 1`);
  else if (answers[0] && !matches(p, answers[0])) out.push('the one answer does not match rows');

  const on = twistsOf(p);
  const hasBoardTwist = on.includes('eggs') || on.includes('portions') || on.includes('snow');
  if (!hasBoardTwist && !logical(p)) {
    out.push('cannot be solved by line logic alone');
  }

  for (const twist of on) {
    if (twist === 'dark' || twist === 'letters') continue; // hiding clues or unscrambled word: checked structurally below
    if (twist === 'colours') {
      const indep = countIndependentColours(p, margin, budget);
      if (indep < margin) out.push(`colours independent count ${indep} (want at least ${margin})`);
      continue;
    }
    const m = countSolutions(without(p, twist), margin, {}, budget);
    if (m < margin) out.push(`without ${twist}, ${m} answers (want ${margin})`);
  }

  // Dark: at least 2 dark clues, at most one per line, never a line's only clue.
  if (p.dark?.length) {
    if (p.dark.length < 2) out.push('fewer than 2 dark clues');
    const seenLines = new Set<string>();
    for (const [kind, line, k] of p.dark) {
      const lineKey = `${kind}:${line}`;
      if (seenLines.has(lineKey)) out.push(`two dark clues on ${lineKey}`);
      seenLines.add(lineKey);
      const runs = (kind === 'row' ? c.rows : c.cols)[line] ?? [];
      if (runs.length <= 1) out.push(`dark clue on ${lineKey} is the line's only clue`);
      if (k < 0 || k >= runs.length) out.push(`dark clue index ${k} out of range on ${lineKey}`);
    }
  }

  // Letters: at least 2 distinct letters shown in clues, and the message is all blanks that fill in cleanly.
  if (p.letters && p.letters.trim().length > 0) {
    const shown = new Set<string>();
    for (const line of [...c.rows, ...c.cols]) {
      for (const run of line) if (run.letter) shown.add(run.letter);
    }
    if (shown.size < 2) out.push('fewer than 2 distinct letters shown in clues');
    const filled = fillMessage(p);
    if (!filled || filled.includes('_') || /[0-9]/.test(filled))
      out.push('message blanks do not fill in cleanly');
    if (/[^0-9 ]/.test(p.message ?? '')) out.push('message has letters that are not coded');
  }

  // Colours: both R and B present and balanced, and at least one touching R/B pair in a row or column.
  if (p.palette && p.palette.length > 1) {
    const flat = [...p.rows.join('')];
    const rCount = flat.filter((ch) => ch === 'R').length;
    const bCount = flat.filter((ch) => ch === 'B').length;
    const totalFilled = rCount + bCount;
    if (rCount < 2 || bCount < 2) out.push('both red and blue must appear');
    if (totalFilled > 0 && (rCount / totalFilled < 0.2 || bCount / totalFilled < 0.2))
      out.push('red and blue are too imbalanced');
    const colStrings = Array.from({ length: W }, (_, col) =>
      p.rows.map((row) => row[col] ?? '.').join(''),
    );
    const hasTouching = [...p.rows, ...colStrings].some(
      (line) => line.includes('RB') || line.includes('BR'),
    );
    if (!hasTouching) out.push('no red and blue runs touch without a gap');
  }

  // Eggs: must hold in the true picture, at least 2 eggs, at most 1 egg per row, and on multi-run rows.
  if (p.eggs?.length) {
    if (!eggsHold(p, grid)) out.push('an egg does not match the picture');
    if (p.eggs.length < 2) out.push('fewer than 2 eggs');
    const eggRows = new Set(p.eggs.map(([r]) => r));
    if (eggRows.size !== p.eggs.length) out.push('multiple eggs in the same row');
    for (const [r] of p.eggs) {
      if ((c.rows[r]?.length ?? 0) < 2) out.push(`egg row ${r} has fewer than 2 runs`);
    }
  }

  // Portions: contiguous, at least 2 portions, equal non-zero filled share in every portion.
  if (p.portions?.length) {
    if (!portionsConnected(p.portions)) out.push('portions are not contiguous');
    const counts = [...portionCounts(p, grid).values()];
    const first = counts[0] ?? 0;
    if (first < 2 || !counts.every((v) => v === first))
      out.push('portions do not have equal filled shares');
  }

  // Snowflakes: near-square frame leaving room outside, even span across mirror line, symmetric inside, differing line clues across axis.
  if (p.frame) {
    const f = p.frame;
    const fh = f.bottom - f.top + 1;
    const fw = f.right - f.left + 1;
    if (area(f) >= H * W) out.push('the frame covers the whole board');
    if (Math.min(fh, fw) / Math.max(fh, fw) < 0.6)
      out.push('the frame is too thin to read as a snowflake');
    if ((f.axis === 'v' ? fw : fh) % 2 !== 0)
      out.push('the mirror line runs through squares, not between them');
    if (!frameSymmetric(f, grid)) out.push('the picture is not symmetric inside the frame');
    let filledInFrame = 0;
    for (let r = f.top; r <= f.bottom; r++)
      for (let col = f.left; col <= f.right; col++) if ((grid[r]?.[col] ?? 0) > 0) filledInFrame++;
    if (filledInFrame < 4) out.push('too few filled squares inside the frame');
  }

  return out;
}
