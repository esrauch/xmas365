import { describe, expect, it } from 'vitest';
import { Budget } from '../../../src/gen/core/budget';
import { HOP_TWISTS, parse, problems, solve, twistsOf } from '../../../src/gen/hops';
import { CLAUSE_HOPS } from '../../../src/proto/puzzles/clauses/hops';
import { CLAUSE_PANEL_COUNT, pairCombinations } from '../../../src/proto/puzzles/clauses/types';

describe('Clause V (C5): Easter · Hops (CLAUSE_HOPS)', () => {
  it('has valid clause metadata and canonical twist order', () => {
    expect(CLAUSE_HOPS.clauseIndex).toBe(4);
    expect(CLAUSE_HOPS.id).toBe('C5');
    expect(CLAUSE_HOPS.genre).toBe('hops');
    expect(CLAUSE_HOPS.title).toBe('Clause V: Easter · Hops');
    expect(CLAUSE_HOPS.genreTitle).toBe('Hops');
    expect(CLAUSE_HOPS.icon).toBe('🐰');
    expect(CLAUSE_HOPS.accent).toBe('#ecc94b');
    expect(CLAUSE_HOPS.twistOrder).toEqual(HOP_TWISTS);
    expect(CLAUSE_HOPS.twistMeta.map((g) => g.key)).toEqual(HOP_TWISTS);
    expect(CLAUSE_HOPS.panels).toHaveLength(CLAUSE_PANEL_COUNT);
  });

  it('has the exact 1 + 6 + 6 + 15 + 1 section progression and matching twistsOf(panel)', () => {
    const panels = CLAUSE_HOPS.panels;

    // 0: base
    expect(panels[0]?.section).toBe('base');
    expect(panels[0]?.twists).toEqual([]);
    expect(twistsOf(panels[0]!.panel)).toEqual([]);

    // 1..6: intro
    for (let i = 0; i < 6; i++) {
      const item = panels[1 + i]!;
      const g = HOP_TWISTS[i]!;
      expect(item.section, `intro ${i} (${item.name})`).toBe('intro');
      expect(item.twists, `intro ${i} (${item.name})`).toEqual([g]);
      expect(twistsOf(item.panel), `intro ${i} (${item.name})`).toEqual([g]);
    }

    // 7..12: solo
    for (let i = 0; i < 6; i++) {
      const item = panels[7 + i]!;
      const g = HOP_TWISTS[i]!;
      expect(item.section, `solo ${i} (${item.name})`).toBe('solo');
      expect(item.twists, `solo ${i} (${item.name})`).toEqual([g]);
      expect(twistsOf(item.panel), `solo ${i} (${item.name})`).toEqual([g]);
    }

    // 13..27: duo
    const pairs = pairCombinations(HOP_TWISTS);
    expect(pairs).toHaveLength(15);
    for (let i = 0; i < 15; i++) {
      const item = panels[13 + i]!;
      const [g1, g2] = pairs[i]!;
      expect(item.section, `duo ${i} (${item.name})`).toBe('duo');
      expect(item.twists, `duo ${i} (${item.name})`).toEqual([g1, g2]);
      expect(twistsOf(item.panel), `duo ${i} (${item.name})`).toEqual([g1, g2]);
    }

    // 28: all6
    const boss = panels[28]!;
    expect(boss.section).toBe('all6');
    expect(boss.twists).toEqual(HOP_TWISTS);
    expect(twistsOf(boss.panel)).toEqual(HOP_TWISTS);
  });

  it('has 29 distinct panels, all <= 7x7 and each with a unique solution', () => {
    const signatures = new Set<string>();
    for (const [idx, item] of CLAUSE_HOPS.panels.entries()) {
      const { panel } = item;
      const height = panel.rows.length;
      const width = panel.rows[0]?.length ?? 0;
      expect(height, `panel ${idx} (${item.name}) height`).toBeLessThanOrEqual(7);
      expect(width, `panel ${idx} (${item.name}) width`).toBeLessThanOrEqual(7);

      const sig = `${panel.rows.join('/')}${JSON.stringify(panel.given)}`;
      expect(signatures.has(sig), `duplicate signature at panel ${idx} (${item.name})`).toBe(false);
      signatures.add(sig);

      const solutions = solve(parse(panel), 2, {}, new Budget(500_000));
      expect(solutions, `panel ${idx} (${item.name}) unique solution`).toHaveLength(1);
    }
  });

  it('verifies all 6 solo and 15 duo panels pass problems(panel, 2) with []', () => {
    for (let idx = 7; idx <= 27; idx++) {
      const item = CLAUSE_HOPS.panels[idx]!;
      expect(
        problems(item.panel, 2, new Budget(500_000)),
        `panel ${idx} (${item.section}: ${item.name})`,
      ).toEqual([]);
    }
  });

  it('verifies panel 28 (all6) has all 6 twists and passes problems(panel, 1) with []', () => {
    const boss = CLAUSE_HOPS.panels[28]!;
    expect(twistsOf(boss.panel)).toEqual(HOP_TWISTS);
    expect(problems(boss.panel, 1, new Budget(500_000))).toEqual([]);
  });
});
