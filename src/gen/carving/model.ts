/**
 * Carving (Thanksgiving): Shikaku (Nikoli; Tatham's Rectangles). The panel
 * format, and the board it parses into.
 *
 * The base rules: divide the grid into rectangles (portions); each holds
 * exactly one number, and the number is its size. The twists, each optional:
 * - letters (Valentine's): some sizes are letters (same letter, same size;
 *   different letters, different sizes); a message's blanks fill in from them;
 * - the dark ('?', Halloween): a portion's size is hidden;
 * - red, white and blue (Fourth of July): a portion takes the colour of its
 *   marks, and two portions of one colour never share an edge (plain ones
 *   touch anything);
 * - cuts (Thanksgiving): a fence on a square's edge that no portion straddles;
 * - Easter baskets (Easter, in Carving): food on the board (egg, carrot,
 *   chocolate), and every portion gets exactly one of each (portions may then
 *   hold no number); the Feast's Thanksgiving dishes work the same way;
 * - snowflakes (Christmas): inside a frame, the cuts between portions are
 *   their own mirror image; outside it, anything goes.
 * Older panels also use flag skewers (a row's or column's flag: how many
 * portions its skewer goes through), a retired twist.
 */
import type { Frame } from '../core/mirror';

export type Colour = 'r' | 'b' | 'g';
export type Wall = [number, number, 'v' | 'h'];

export interface Panel {
  name: string;
  tip?: string;
  /** Rows of space-separated tokens: '.' empty, a number (its portion's size), '?' a size in the dark, a size letter, or food: a dish (T turkey, P pie, C cranberries, in the Feast) or an Easter basket's 🥚 🥕 🍫. */
  rows: string[];
  /** Colour marks, row by row: 'r' red, 'b' blue ('g' green in older panels), '.' none (plain portions are white). */
  colours?: string[];
  /** Retired: flags on skewers, how many portions each row's / column's skewer goes through. */
  rowMarks?: (number | null)[];
  colMarks?: (number | null)[];
  /** What each portion's fair share is, as dish letters (default: one of each dish on the board). */
  share?: string;
  /** Letters for sizes: the letter for size 1 first, and so on (' ' for none). */
  sizeLetters?: string;
  /** A message: a digit n is the letter for size n; other letters show as they are. */
  message?: string;
  /** Cuts: fences no portion straddles. [row, column, side]: 'v' the square's right edge, 'h' its bottom edge. */
  walls?: Wall[];
  /** Snowflakes: inside this frame, the cuts mirror. */
  frame?: Frame;
}

export interface Cell {
  n?: number;
  /** A coded size (same letter, same size; different letters, different sizes). */
  letter?: string;
  /** A size in the dark (any). */
  dark?: boolean;
  dish?: string;
  colour?: Colour;
}

export interface Board {
  height: number;
  width: number;
  cells: Cell[][];
  /** Each portion's fair share of dishes, sorted (empty: no dishes). */
  dishes: string[];
  /** Portions may hold no number (when there are flags or dishes). */
  numberless: boolean;
  /** The size each coded letter stands for (from sizeLetters). */
  letterSize: Map<string, number>;
  rowMarks: (number | null)[];
  colMarks: (number | null)[];
  /** Cut keys ("r,c,v" / "r,c,h"). */
  walls: Set<string>;
  frame?: Frame;
}

export interface Rect {
  r: number;
  c: number;
  h: number;
  w: number;
}

export const wallKey = ([r, c, side]: Wall): string => `${r},${c},${side}`;

/** The message with its numbered blanks filled from `sizeLetters`. */
export function fillMessage(panel: Panel): string {
  if (!panel.message) return '';
  return [...panel.message]
    .map((ch) =>
      /[0-9]/.test(ch) ? (panel.sizeLetters?.[Number(ch) - 1] ?? '_').replace(' ', '_') : ch,
    )
    .join('');
}

export function parse(panel: Panel): Board {
  const letterSize = new Map<string, number>();
  [...(panel.sizeLetters ?? '')].forEach((ch, i) => {
    if (ch !== ' ') letterSize.set(ch, i + 1);
  });
  const cells = panel.rows.map((row, r) =>
    row
      .trim()
      .split(/\s+/)
      .map((t, c): Cell => {
        const cell: Cell = {};
        if (/^[0-9]+$/.test(t)) cell.n = Number(t);
        else if (t === '?') cell.dark = true;
        else if (panel.sizeLetters?.includes(t)) cell.letter = t;
        else if (t !== '.') cell.dish = t;
        const colour = panel.colours?.[r]?.[c];
        if (colour === 'r' || colour === 'b' || colour === 'g') cell.colour = colour;
        return cell;
      }),
  );
  const height = cells.length;
  const width = cells[0]?.length ?? 0;
  const dishes = panel.share
    ? [...panel.share].sort()
    : [...new Set(cells.flat().flatMap((x) => (x.dish ? [x.dish] : [])))].sort();
  const rowMarks = panel.rowMarks ?? Array<null>(height).fill(null);
  const colMarks = panel.colMarks ?? Array<null>(width).fill(null);
  const marked = [...rowMarks, ...colMarks].some((m) => m !== null);
  const board: Board = {
    height,
    width,
    cells,
    dishes,
    numberless: dishes.length > 0 || marked,
    letterSize,
    rowMarks,
    colMarks,
    walls: new Set((panel.walls ?? []).map(wallKey)),
  };
  if (panel.frame) board.frame = panel.frame;
  return board;
}

export const cellsOf = (b: Board, x: Rect): Cell[] => {
  const out: Cell[] = [];
  for (let r = x.r; r < x.r + x.h; r++)
    for (let c = x.c; c < x.c + x.w; c++) out.push(b.cells[r]?.[c] ?? {});
  return out;
};

/** Do two portions share an edge? */
export const touching = (a: Rect, x: Rect): boolean => {
  const rows = a.r < x.r + x.h && x.r < a.r + a.h;
  const cols = a.c < x.c + x.w && x.c < a.c + a.w;
  return (
    (rows && (a.c + a.w === x.c || x.c + x.w === a.c)) ||
    (cols && (a.r + a.h === x.r || x.r + x.h === a.r))
  );
};

/** Write a board back out as a panel's rows. */
export function rowsOf(cells: Cell[][]): string[] {
  return cells.map((row) =>
    row
      .map((cell) =>
        cell.n !== undefined ? String(cell.n) : cell.dark ? '?' : (cell.letter ?? cell.dish ?? '.'),
      )
      .join(' '),
  );
}

export function coloursOf(cells: Cell[][]): string[] {
  return cells.map((row) => row.map((cell) => cell.colour ?? '.').join(''));
}
