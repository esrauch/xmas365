import { describe, expect, it } from 'vitest';
import { Budget } from '../../../src/gen/core/budget';
import {
  WORD_TWISTS,
  answers,
  eachWordOnce,
  problems,
  twistsOf,
  wellFormed,
} from '../../../src/gen/words';
import { CLAUSE_PANEL_COUNT, pairCombinations } from '../../../src/proto/puzzles/clauses/types';
import { CLAUSE_WORDS } from '../../../src/proto/puzzles/clauses/words';

describe("Clause IV (C4): Valentine's · Heartstrings (words)", () => {
  it('defines metadata and 22 panels in canonical section and twist order', () => {
    expect(CLAUSE_WORDS.clauseIndex).toBe(3);
    expect(CLAUSE_WORDS.id).toBe('C4');
    expect(CLAUSE_WORDS.genre).toBe('words');
    expect(CLAUSE_WORDS.title).toBe("Clause IV: Valentine's · Heartstrings");
    expect(CLAUSE_WORDS.genreTitle).toBe('Heartstrings');
    expect(CLAUSE_WORDS.icon).toBe('💌');
    expect(CLAUSE_WORDS.accent).toBe('#ed64a6');
    expect(CLAUSE_WORDS.twistOrder).toEqual(WORD_TWISTS);
    expect(CLAUSE_WORDS.twistMeta.map((g) => g.key)).toEqual(WORD_TWISTS);
    expect(CLAUSE_WORDS.panels).toHaveLength(CLAUSE_PANEL_COUNT);

    // Panels 0..5: intro
    for (let i = 0; i < 6; i++) {
      const item = CLAUSE_WORDS.panels[i]!;
      expect(item.section).toBe('intro');
      expect(item.twists).toEqual([WORD_TWISTS[i]]);
      expect(item.explain.length).toBeGreaterThan(20);
    }

    // Panels 6..20: duo
    const pairs = pairCombinations(WORD_TWISTS);
    expect(pairs).toHaveLength(15);
    for (let i = 0; i < 15; i++) {
      const item = CLAUSE_WORDS.panels[6 + i]!;
      expect(item.section).toBe('duo');
      expect(item.twists).toEqual(pairs[i]);
    }

    // Panel 21: all6
    const boss = CLAUSE_WORDS.panels[21]!;
    expect(boss.section).toBe('all6');
    expect(boss.twists).toEqual(WORD_TWISTS);
  });

  it('has 22 distinct board layouts (rows.join("/")) and dimensions <= 7×7', () => {
    const seen = new Set<string>();
    for (const [idx, item] of CLAUSE_WORDS.panels.entries()) {
      const { rows } = item.panel;
      expect(rows.length, `panel ${idx} height`).toBeLessThanOrEqual(7);
      for (const row of rows) {
        expect(row.length, `panel ${idx} width`).toBeLessThanOrEqual(7);
      }
      const sig = rows.join('/');
      expect(seen.has(sig), `duplicate rows at panel ${idx}: ${sig}`).toBe(false);
      seen.add(sig);
    }
    expect(seen.size).toBe(CLAUSE_PANEL_COUNT);
  });

  it('never reuses a theme word across its 22 puzzles', () => {
    const where = new Map<string, number>();
    for (const [idx, item] of CLAUSE_WORDS.panels.entries()) {
      for (const { word } of item.panel.words) {
        expect(where.has(word), `${word} in panel ${idx} and panel ${where.get(word)}`).toBe(false);
        where.set(word, idx);
      }
    }
  });

  it('verifies twistsOf, unique whole-board answer, and eachWordOnce on all 22 panels', () => {
    for (const [idx, item] of CLAUSE_WORDS.panels.entries()) {
      const p = item.panel;
      expect(wellFormed(p), `panel ${idx} (${item.name}) wellFormed`).toBe(true);
      expect(twistsOf(p), `panel ${idx} (${item.name}) twistsOf`).toEqual(item.twists);
      const found = answers(p, 2, {}, new Budget(4_000_000));
      expect(found.length, `panel ${idx} (${item.name}) answers count`).toBe(1);
      expect(
        eachWordOnce(p, {}, new Budget(4_000_000)),
        `panel ${idx} (${item.name}) eachWordOnce`,
      ).toBe(true);
    }
  });

  it('verifies all 15 duo panels pass problems(panel, 2) with []', () => {
    for (let idx = 6; idx <= 20; idx++) {
      const item = CLAUSE_WORDS.panels[idx]!;
      expect(
        problems(item.panel, 2, new Budget(4_000_000)),
        `panel ${idx} (${item.name}) problems(2)`,
      ).toEqual([]);
    }
  });

  it('verifies the all6 boss panel (index 21) has all 6 twists and passes problems(panel, 1) with []', () => {
    const boss = CLAUSE_WORDS.panels[21]!;
    expect(twistsOf(boss.panel)).toEqual(WORD_TWISTS);
    expect(problems(boss.panel, 1, new Budget(4_000_000))).toEqual([]);
  });
});
