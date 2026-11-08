import { describe, expect, it } from 'vitest';
import { Budget } from '../../../src/gen/core/budget';
import { PICTURE_TWISTS, countSolutions, problems, twistsOf } from '../../../src/gen/pictures';
import { CLAUSE_PICTURES } from '../../../src/proto/puzzles/clauses/pictures';
import { CLAUSE_PANEL_COUNT, pairCombinations } from '../../../src/proto/puzzles/clauses/types';

describe('CLAUSE_PICTURES (Clause VI: Fourth of July · Fireworks)', () => {
  it('has the expected clause metadata and 29 puzzles', () => {
    expect(CLAUSE_PICTURES.clauseIndex).toBe(5);
    expect(CLAUSE_PICTURES.id).toBe('C6');
    expect(CLAUSE_PICTURES.genre).toBe('pictures');
    expect(CLAUSE_PICTURES.twistOrder).toEqual(PICTURE_TWISTS);
    expect(CLAUSE_PICTURES.twistMeta.map((g) => g.key)).toEqual(PICTURE_TWISTS);
    expect(CLAUSE_PICTURES.panels).toHaveLength(CLAUSE_PANEL_COUNT);
  });

  it('has matching sections and canonical twist order across all 29 panels', () => {
    const { panels, twistOrder } = CLAUSE_PICTURES;

    // 0: base
    expect(panels[0]?.section).toBe('base');
    expect(panels[0]?.twists).toEqual([]);

    // 1..6: intro
    for (let i = 0; i < 6; i++) {
      const item = panels[1 + i]!;
      expect(item.section).toBe('intro');
      expect(item.twists).toEqual([twistOrder[i]]);
    }

    // 7..12: solo
    for (let i = 0; i < 6; i++) {
      const item = panels[7 + i]!;
      expect(item.section).toBe('solo');
      expect(item.twists).toEqual([twistOrder[i]]);
    }

    // 13..27: duo
    const pairs = pairCombinations(twistOrder);
    expect(pairs).toHaveLength(15);
    for (let i = 0; i < 15; i++) {
      const item = panels[13 + i]!;
      expect(item.section).toBe('duo');
      expect(item.twists).toEqual(pairs[i]);
    }

    // 28: all6
    expect(panels[28]?.section).toBe('all6');
    expect(panels[28]?.twists).toEqual(twistOrder);

    // Every panel's actual twistsOf(panel) matches item.twists
    for (const [idx, item] of panels.entries()) {
      expect(twistsOf(item.panel), `panel ${idx} (${item.name}) twistsOf`).toEqual(item.twists);
      expect(item.tip.trim().length).toBeGreaterThan(0);
      expect(item.explain.trim().length).toBeGreaterThan(0);
    }
  });

  it('has unique solutions, dimensions <= 7×7, and distinct row grids across all 29 panels', () => {
    const seenGrids = new Set<string>();
    for (const [idx, item] of CLAUSE_PICTURES.panels.entries()) {
      const { panel } = item;
      const H = panel.rows.length;
      const W = panel.rows[0]?.length ?? 0;
      expect(H, `panel ${idx} (${item.name}) height`).toBeLessThanOrEqual(7);
      expect(W, `panel ${idx} (${item.name}) width`).toBeLessThanOrEqual(7);
      expect(
        countSolutions(panel, 2, {}, new Budget(500_000)),
        `panel ${idx} (${item.name}) unique solution`,
      ).toBe(1);

      const gridKey = panel.rows.join('/');
      expect(seenGrids.has(gridKey), `panel ${idx} (${item.name}) duplicate grid`).toBe(false);
      seenGrids.add(gridKey);
    }
  });

  it('passes full generator verification (margin=2) for all 6 solo and 15 duo panels, and margin=1 for all6', () => {
    for (let idx = 7; idx <= 27; idx++) {
      const item = CLAUSE_PICTURES.panels[idx]!;
      expect(
        problems(item.panel, 2, new Budget(500_000)),
        `panel ${idx} (${item.name}) problems(2)`,
      ).toEqual([]);
    }

    const boss = CLAUSE_PICTURES.panels[28]!;
    expect(twistsOf(boss.panel)).toEqual(PICTURE_TWISTS);
    expect(problems(boss.panel, 1, new Budget(500_000)), 'boss panel problems(1)').toEqual([]);
  });
});
