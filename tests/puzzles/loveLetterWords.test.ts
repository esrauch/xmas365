import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WORD_RULES, type WordRule, wordFits } from '../../src/gen/core/words';
import type { Tier } from '../../src/gen/core/spec';
import { ROOM_SPECS } from '../../src/game/state';
import { ALL_CLAUSES } from '../../src/proto/puzzles/clauses/index';
import { HOLIDAY_TERMS } from '../../src/proto/puzzles/clauses/types';

/** The genres whose Love-Letter boards are unscrambled (the message spells a word from coded values). */
const GENRES = ['pictures', 'carving', 'webs'] as const;
type Genre = (typeof GENRES)[number];

interface Lettered {
  name?: string;
  message?: string;
  letters?: string;
  sizeLetters?: string;
}

/** The word a board's message spells, or null when it has no unscrambled message. */
function wordOf(genre: Genre, p: Lettered): string | null {
  const code = genre === 'carving' ? p.sizeLetters : p.letters;
  if (!p.message || !code) return null;
  return p.message.replace(/[0-9]/g, (d) => code[Number(d) - 1] ?? '_');
}

const fits = (word: string, rule: WordRule): boolean => wordFits(word, rule, 9);
const isGenre = (g: string): g is Genre => (GENRES as readonly string[]).includes(g);

describe('Love-Letter words (core/words.ts): teaching boards easy, main boards harder', () => {
  it('pinned panel sets suit their tier', () => {
    for (const genre of GENRES) {
      const dir = join(__dirname, '../../src/panels', genre);
      for (const file of readdirSync(dir).filter((f) => f.includes('letters'))) {
        const pinned = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
          tier: Tier;
          panels: { panel: Lettered }[];
        };
        for (const { panel } of pinned.panels) {
          const word = wordOf(genre, panel);
          if (word) expect(fits(word, WORD_RULES[pinned.tier]), `${file}: ${word}`).toBe(true);
        }
      }
    }
  });

  it("a relic run's first board is easy, and its later boards are main boards", () => {
    for (const room of ROOM_SPECS) {
      const genre = HOLIDAY_TERMS[room.id].genre;
      if (!isGenre(genre)) continue;
      for (const proto of room.strays.map((s) => s.proto)) {
        (proto.panels as Lettered[]).forEach((p, i) => {
          const word = wordOf(genre, p);
          if (!word) return;
          const rule = WORD_RULES[i === 0 ? 'easy' : 'medium'];
          expect(fits(word, rule), `${proto.id}[${i}] ${p.name}: ${word}`).toBe(true);
        });
      }
    }
  });

  // The all-six bosses are exempt (PUZZLE_DESIGN.md 2.4): Carving's and Fireworks' hold too few values.
  it("a clause's two-twist boards are main boards, and no word repeats in a clause", () => {
    for (const clause of ALL_CLAUSES) {
      if (!isGenre(clause.genre)) continue;
      const genre = clause.genre;
      const seen = new Set<string>();
      for (const item of clause.panels) {
        const word = wordOf(genre, item.panel as Lettered);
        if (!word) continue;
        expect(seen.has(word), `${clause.id} repeats ${word}`).toBe(false);
        seen.add(word);
        if (item.section === 'duo')
          expect(fits(word, WORD_RULES.medium), `${clause.id} ${item.name}: ${word}`).toBe(true);
      }
    }
  });
});
