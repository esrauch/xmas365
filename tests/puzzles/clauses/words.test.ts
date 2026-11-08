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
  it('defines metadata and 29 panels in canonical section and gimmick order', () => {
    expect(CLAUSE_WORDS.clauseIndex).toBe(3);
    expect(CLAUSE_WORDS.id).toBe('C4');
    expect(CLAUSE_WORDS.genre).toBe('words');
    expect(CLAUSE_WORDS.title).toBe("Clause IV: Valentine's · Heartstrings");
    expect(CLAUSE_WORDS.genreTitle).toBe('Heartstrings');
    expect(CLAUSE_WORDS.icon).toBe('💌');
    expect(CLAUSE_WORDS.accent).toBe('#ed64a6');
    expect(CLAUSE_WORDS.gimmickOrder).toEqual(WORD_TWISTS);
    expect(CLAUSE_WORDS.gimmicks.map((g) => g.key)).toEqual(WORD_TWISTS);
    expect(CLAUSE_WORDS.panels).toHaveLength(CLAUSE_PANEL_COUNT);

    // Panel 0: base
    expect(CLAUSE_WORDS.panels[0]?.section).toBe('base');
    expect(CLAUSE_WORDS.panels[0]?.twists).toEqual([]);

    // Panels 1..6: intro
    for (let i = 0; i < 6; i++) {
      const item = CLAUSE_WORDS.panels[1 + i]!;
      expect(item.section).toBe('intro');
      expect(item.twists).toEqual([WORD_TWISTS[i]]);
      expect(item.explain.length).toBeGreaterThan(20);
    }

    // Panels 7..12: solo
    for (let i = 0; i < 6; i++) {
      const item = CLAUSE_WORDS.panels[7 + i]!;
      expect(item.section).toBe('solo');
      expect(item.twists).toEqual([WORD_TWISTS[i]]);
    }

    // Panels 13..27: duo
    const pairs = pairCombinations(WORD_TWISTS);
    expect(pairs).toHaveLength(15);
    for (let i = 0; i < 15; i++) {
      const item = CLAUSE_WORDS.panels[13 + i]!;
      expect(item.section).toBe('duo');
      expect(item.twists).toEqual(pairs[i]);
    }

    // Panel 28: all6
    const boss = CLAUSE_WORDS.panels[28]!;
    expect(boss.section).toBe('all6');
    expect(boss.twists).toEqual(WORD_TWISTS);
  });

  it('has 29 distinct board layouts (rows.join("/")) and dimensions <= 7×7', () => {
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
    expect(seen.size).toBe(29);
  });

  it('verifies twistsOf, unique whole-board answer, and eachWordOnce on all 29 panels', () => {
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

  it('verifies all 6 solo and 15 duo panels pass problems(panel, 2) with []', () => {
    for (let idx = 7; idx <= 27; idx++) {
      const item = CLAUSE_WORDS.panels[idx]!;
      expect(
        problems(item.panel, 2, new Budget(4_000_000)),
        `panel ${idx} (${item.name}) problems(2)`,
      ).toEqual([]);
    }
  });

  it('verifies the all6 boss panel (index 28) has all 6 twists and passes problems(panel, 1) with []', () => {
    const boss = CLAUSE_WORDS.panels[28]!;
    expect(twistsOf(boss.panel)).toEqual(WORD_TWISTS);
    expect(problems(boss.panel, 1, new Budget(4_000_000))).toEqual([]);
  });
});
