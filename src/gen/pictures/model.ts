/**
 * Picture grids (Fourth of July): Nonograms. The panel format, and the row and
 * column run clues it parses into.
 *
 * The base rules: the numbers at the end of each row and column give the runs
 * of filled squares in that line, in order, with at least one empty square
 * between two runs of the same colour.
 *
 * The six holiday twists, each optional on a panel:
 * - colours (Fourth of July, at home): runs come in red ('R') and blue ('B'),
 *   with empty squares white ('.'); two runs of the same colour need a white
 *   gap between them, while different colours can touch directly;
 * - dark (Halloween): some run clues show '?' (any run length >= 1), at most
 *   one per line and never a line's only clue;
 * - letters (Valentine's): some run lengths are written as letters (same
 *   letter = same length, different letters = different lengths), and a
 *   message's numbered blanks fill in from them;
 * - eggs (Easter): [row, col, n] marks a filled square covered by the
 *   corresponding egg-marked run clue in its row;
 * - portions (Thanksgiving): contiguous outlined portions ('A', 'B', ...),
 *   each holding the exact same number of filled squares;
 * - snow (Christmas): inside a frosty frame (with its mirror line between
 *   squares), the filled squares mirror across the icy line; outside the
 *   frame, anything goes.
 */
import type { Frame } from '../core/mirror';

export interface Panel {
  name: string;
  /** The picture, row by row: '.' empty (white), '#' filled, or a colour letter from the palette ('R', 'B'). */
  rows: string[];
  /** Colour letters, in order (default '#': one colour; 'RB': red and blue). */
  palette?: string;
  /** Hidden clues: [row or column, line, which clue in the line]. */
  dark?: ['row' | 'col', number, number][];
  /** Letters for numbers: the letter for 1 first, and so on (' ' to leave a number alone). */
  letters?: string;
  /** A message with numbered blanks (blank n is the letter for n). */
  message?: string;
  /** Eggs: [row, column, n]: that square is filled as part of the corresponding egg-marked run in its row. */
  eggs?: [number, number, number][];
  /** Fair shares: portions, a letter per square; each holds the same number of filled squares. */
  portions?: string[];
  /** Snowflakes: inside this frame, the filled squares mirror across the frame's axis. */
  frame?: Frame;
}

export interface Run {
  n: number;
  colour: number;
  /** Shown as unknown (dark, or a letter). */
  hidden?: boolean;
  /** Shown as this letter. */
  letter?: string;
}

/** A cell: -1 unknown, 0 empty, 1.. a colour. */
export type Cell = number;

export function picture(p: Panel): number[][] {
  const palette = p.palette ?? '#';
  return p.rows.map((row) => [...row].map((ch) => (ch === '.' ? 0 : palette.indexOf(ch) + 1)));
}

/** A line's runs. */
export function runsOf(line: number[]): Run[] {
  const out: Run[] = [];
  line.forEach((v, i) => {
    if (!v) return;
    if (i > 0 && line[i - 1] === v) (out[out.length - 1] as Run).n++;
    else out.push({ n: 1, colour: v });
  });
  return out;
}

/** Which run (0-based index in `runsOf(line)`) covers square `col`, or -1 if `line[col]` is not filled. */
export function runIndexAt(line: number[], col: number): number {
  if ((line[col] ?? 0) <= 0) return -1;
  let idx = -1;
  let prev = 0;
  for (let c = 0; c <= col; c++) {
    const cur = Math.max(line[c] ?? 0, 0);
    if (cur > 0 && cur !== prev) idx++;
    prev = cur;
  }
  return idx;
}

export interface Clues {
  rows: Run[][];
  cols: Run[][];
}

export function clues(p: Panel): Clues {
  const g = picture(p);
  const W = g[0]?.length ?? 0;
  const rows = g.map(runsOf);
  const cols = Array.from({ length: W }, (_, c) => runsOf(g.map((row) => row[c] ?? 0)));
  for (const [kind, line, k] of p.dark ?? []) {
    const run = (kind === 'row' ? rows : cols)[line]?.[k];
    if (run) run.hidden = true;
  }
  if (p.letters)
    for (const line of [...rows, ...cols])
      for (const run of line) {
        if (run.hidden) continue;
        const letter = p.letters[run.n - 1];
        if (letter && letter !== ' ') {
          run.letter = letter;
          run.hidden = true;
        }
      }
  return { rows, cols };
}

/** The message, its blanks filled from the letters. */
export function fillMessage(p: Panel): string {
  return (p.message ?? '').replace(/[0-9]/g, (d) => p.letters?.[Number(d) - 1] ?? '_');
}
