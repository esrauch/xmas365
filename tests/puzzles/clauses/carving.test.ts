import { describe, expect, it } from 'vitest';
import { CARVE_TWISTS, parse, problems, solve, twistsOf } from '../../../src/gen/carving';
import { Budget } from '../../../src/gen/core/budget';
import { CLAUSE_CARVING } from '../../../src/proto/puzzles/clauses/carving';
import { CLAUSE_PANEL_COUNT, pairCombinations } from '../../../src/proto/puzzles/clauses/types';

describe('Clause II (C2): Thanksgiving · Carving', () => {
  it('has canonical metadata and 22 puzzles', () => {
    expect(CLAUSE_CARVING.clauseIndex).toBe(1);
    expect(CLAUSE_CARVING.id).toBe('C2');
    expect(CLAUSE_CARVING.genre).toBe('carving');
    expect(CLAUSE_CARVING.title).toBe('Clause II: Thanksgiving · Carving');
    expect(CLAUSE_CARVING.genreTitle).toBe('Carving');
    expect(CLAUSE_CARVING.twistOrder).toEqual(CARVE_TWISTS);
    expect(CLAUSE_CARVING.twistMeta.map((g) => g.key)).toEqual(CARVE_TWISTS);
    expect(CLAUSE_CARVING.panels).toHaveLength(CLAUSE_PANEL_COUNT);
  });

  it('matches section layout and twist progression across all 22 panels', () => {
    const panels = CLAUSE_CARVING.panels;

    // 0..5: intro
    for (let i = 0; i < 6; i++) {
      const item = panels[i]!;
      expect(item.section).toBe('intro');
      expect(item.twists).toEqual([CARVE_TWISTS[i]]);
    }

    // 6..20: duo
    const pairs = pairCombinations(CARVE_TWISTS);
    expect(pairs).toHaveLength(15);
    for (let i = 0; i < 15; i++) {
      const item = panels[6 + i]!;
      expect(item.section).toBe('duo');
      expect(item.twists).toEqual(pairs[i]);
    }

    // 21: all6
    expect(panels[21]?.section).toBe('all6');
    expect(panels[21]?.twists).toEqual(CARVE_TWISTS);

    // Every panel's twistsOf(panel) matches item.twists
    for (const [idx, item] of panels.entries()) {
      expect(twistsOf(item.panel), `panel ${idx} (${item.name}) twists`).toEqual(item.twists);
      expect(item.tip.length, `panel ${idx} tip`).toBeGreaterThan(0);
      expect(item.explain.length, `panel ${idx} explain`).toBeGreaterThan(0);
    }
  });

  it('has distinct rows.join("/") strings, dimensions <= 7x7, and a unique solution for all 22 panels', () => {
    const seen = new Set<string>();
    for (const [idx, item] of CLAUSE_CARVING.panels.entries()) {
      const key = item.panel.rows.join('/');
      expect(seen.has(key), `duplicate rows at index ${idx} (${item.name})`).toBe(false);
      seen.add(key);

      const board = parse(item.panel);
      expect(board.height, `panel ${idx} height`).toBeLessThanOrEqual(7);
      expect(board.width, `panel ${idx} width`).toBeLessThanOrEqual(7);

      const solutions = solve(board, 2, {}, new Budget(500_000));
      expect(solutions, `panel ${idx} (${item.name}) unique solution`).toHaveLength(1);
    }
    expect(seen.size).toBe(CLAUSE_PANEL_COUNT);
  });

  it('passes problems(panel, 2) on all 15 duo panels, and problems(panel, 1) on all6', () => {
    for (let idx = 6; idx <= 20; idx++) {
      const item = CLAUSE_CARVING.panels[idx]!;
      expect(
        problems(item.panel, 2, new Budget(500_000)),
        `panel ${idx} (${item.name}) problems(2)`,
      ).toEqual([]);
    }

    const boss = CLAUSE_CARVING.panels[21]!;
    expect(twistsOf(boss.panel)).toEqual(CARVE_TWISTS);
    expect(problems(boss.panel, 1, new Budget(500_000)), 'boss panel problems(1)').toEqual([]);
  });
});
