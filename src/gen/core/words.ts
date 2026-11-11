/**
 * Love-Letter words: the message a letters board spells, by how hard the board
 * is. Every unique letter of the word is a distinct value on the board, and the
 * player unscrambles the word to learn the values, so the word's variety is the
 * puzzle's: three letters unscramble at a glance, five make the player think.
 */
import type { Tier } from './spec';

export interface WordRule {
  /** Fewest and most unique letters. */
  minUnique: number;
  maxUnique: number;
  /** Fewest and most letters in all. */
  minLength: number;
  maxLength: number;
}

/**
 * Teaching boards (easy, a relic run's first board, a clause's intro reminder)
 * take an easy word; main boards (medium, a run's later boards, a clause's
 * duos) at least 4 unique letters in 5 or more; hard boards 5 unique in 5 or 6.
 */
export const WORD_RULES: Record<Tier, WordRule> = {
  easy: { minUnique: 3, maxUnique: 4, minLength: 3, maxLength: 6 },
  medium: { minUnique: 4, maxUnique: 5, minLength: 5, maxLength: 6 },
  hard: { minUnique: 5, maxUnique: 5, minLength: 5, maxLength: 6 },
};

const uniqueOf = (word: string): number => new Set(word).size;

/** Does `word` suit `rule` on a board with `available` distinct values to code? */
export function wordFits(word: string, rule: WordRule, available: number): boolean {
  const u = uniqueOf(word);
  return (
    u >= rule.minUnique &&
    u <= Math.min(rule.maxUnique, available) &&
    word.length >= rule.minLength &&
    word.length <= rule.maxLength
  );
}

/** The words of `bank` that suit `rule` on the board, most unique letters first (shuffled within). */
export function wordsFor(
  bank: readonly string[],
  rule: WordRule,
  available: number,
  shuffled: (words: string[]) => string[],
): string[] {
  return shuffled(bank.filter((w) => wordFits(w, rule, available))).sort(
    (a, b) => uniqueOf(b) - uniqueOf(a),
  );
}
