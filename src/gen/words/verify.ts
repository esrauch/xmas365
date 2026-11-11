/**
 * The checks every generated Words panel must pass, shared by the generator
 * and the tests: the words fill the grid, and every word can be traced only one
 * way (as the player sees the board, with each word's first letter highlighted,
 * so a found word is always the right one). Unlike the other genres, a twist
 * needn't do work here: a board may lean on its twists or be sound without
 * them (`margin` is kept for the shared signature).
 */
import { Budget } from '../core/budget';
import { type Panel, isVowel, key, letterAt, placeIn, wellFormed } from './model';
import { type Without, answers, framedOptions, truthOf } from './solve';

export type WordTwist = 'dark' | 'letters' | 'colours' | 'eggs' | 'cuts' | 'snow';
export const WORD_TWISTS: readonly WordTwist[] = [
  'dark',
  'letters',
  'colours',
  'eggs',
  'cuts',
  'snow',
];

/** Which twists a panel carries. */
export function twistsOf(p: Panel): WordTwist[] {
  const on: WordTwist[] = [];
  if (p.dark?.length) on.push('dark');
  if (p.code) on.push('letters');
  if (p.bows?.length) on.push('colours');
  if (p.eggs?.length) on.push('eggs');
  if (p.walls?.length) on.push('cuts');
  if (p.frame) on.push('snow');
  return on;
}

/**
 * Does every word have exactly one way to lie, as the player traces it? Coded
 * letters count as known here (the key fills in as words are found); the
 * whole-board answer is checked with the code unknown.
 */
export function eachWordOnce(p: Panel, rules: Without = {}, budget = new Budget()): boolean {
  return framedOptions(p, { ...rules, noCode: true }, budget).every((o) => o.length === 1);
}

/** Problems with a panel (empty when it's good). */
export function problems(p: Panel, _margin: number, budget = new Budget(4_000_000)): string[] {
  const out: string[] = [];
  if (!wellFormed(p)) out.push("the words don't fill the grid");
  const found = answers(p, 2, {}, budget);
  if (found.length !== 1 || found[0]?.join('|') !== truthOf(p).join('|'))
    out.push(`${found.length} answers, not just the true one`);
  if (!eachWordOnce(p, {}, budget)) out.push('a word can be traced more than one way');
  // Twists needn't do work in Words: a board may lean on its twists or be sound
  // without them (PUZZLE_DESIGN.md, 1.2).
  // The dark: at most one per word, only on a vowel, never its first or last letter.
  for (const w of p.words) {
    const keys = w.cells.map(key);
    const dark = keys.filter((k) => (p.dark ?? []).some((d) => key(d) === k));
    if (dark.length > 1) out.push(`${w.word} has two dark letters`);
    for (const d of p.dark ?? [])
      if (keys.includes(key(d)) && !isVowel(letterAt(p, d)))
        out.push(`${w.word}'s dark letter is not a vowel`);
    if (dark.some((k) => k === keys[0] || k === keys[keys.length - 1]))
      out.push(`${w.word}'s dark letter is at an end`);
  }
  // The code: at least two letters (one alone is just a hidden given).
  if (p.code !== undefined && p.code.length < 2) out.push('only one coded letter');
  // Red, white and blue: bows in at least two colours.
  if (p.bows) {
    const tones = new Set(p.bows.map(([r, c]) => p.colours?.[r]?.[c]));
    if (tones.size < 2) out.push('the bows use only one colour');
  }
  // Egg Hunt: eggs = half the words.
  if (p.eggs?.length) {
    const want = Math.max(2, Math.floor(p.words.length / 2));
    if (p.eggs.length < want) out.push(`only ${p.eggs.length} eggs (want at least ${want})`);
    // The first letters are highlighted, so an egg says something new only from 3 on.
    for (const e of p.eggs)
      if (placeIn(p, e) < 3) out.push(`an egg shows ${placeIn(p, e)} (want 3 or more)`);
  }
  // Portions (cuts): at least 8 on easy (5×5), 15 on medium (7×7), 21 on hard (9×9),
  // and at most 2 fences per square so no letter is boxed in.
  if (p.walls?.length) {
    const H = p.rows.length;
    const minWalls = H <= 5 ? 8 : H <= 7 ? 15 : 21;
    if (p.walls.length < minWalls)
      out.push(`only ${p.walls.length} cuts (want at least ${minWalls})`);
    const cellWalls = new Map<string, number>();
    for (const [r, c, side] of p.walls) {
      const a = key([r, c]);
      const b = key(side === 'v' ? [r, c + 1] : [r + 1, c]);
      cellWalls.set(a, (cellWalls.get(a) ?? 0) + 1);
      cellWalls.set(b, (cellWalls.get(b) ?? 0) + 1);
    }
    for (const [cell, count] of cellWalls)
      if (count > 2) out.push(`square ${cell} has ${count} cuts around it (max 2)`);
  }
  return out;
}
