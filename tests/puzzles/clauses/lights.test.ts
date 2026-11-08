import { describe, expect, it } from 'vitest';
import { Budget } from '../../../src/gen/core/budget';
import { LIGHT_TWISTS, parse, problems, solve, twistsOf } from '../../../src/gen/lights';
import { CLAUSE_LIGHTS } from '../../../src/proto/puzzles/clauses/lights';
import { CLAUSE_PANEL_COUNT, pairCombinations } from '../../../src/proto/puzzles/clauses/types';

describe('Clause III (C3): Christmas · Lights (29-puzzle gauntlet)', () => {
  it('exports valid clause metadata and canonical twist order', () => {
    expect(CLAUSE_LIGHTS.clauseIndex).toBe(2);
    expect(CLAUSE_LIGHTS.id).toBe('C3');
    expect(CLAUSE_LIGHTS.genre).toBe('lights');
    expect(CLAUSE_LIGHTS.title).toBe('Clause III: Christmas · Lights');
    expect(CLAUSE_LIGHTS.genreTitle).toBe('Lights');
    expect(CLAUSE_LIGHTS.twistOrder).toEqual(LIGHT_TWISTS);
    expect(CLAUSE_LIGHTS.twistMeta.map((g) => g.key)).toEqual(LIGHT_TWISTS);
    expect(CLAUSE_LIGHTS.panels).toHaveLength(CLAUSE_PANEL_COUNT);
  });

  it('orders sections and twist combinations deterministically across all 29 panels', () => {
    const panels = CLAUSE_LIGHTS.panels;

    // 0: base
    expect(panels[0]?.section).toBe('base');
    expect(panels[0]?.twists).toEqual([]);

    // 1..6: intro
    for (let i = 0; i < 6; i++) {
      const item = panels[1 + i]!;
      expect(item.section, item.name).toBe('intro');
      expect(item.twists, item.name).toEqual([LIGHT_TWISTS[i]!]);
    }

    // 7..12: solo
    for (let i = 0; i < 6; i++) {
      const item = panels[7 + i]!;
      expect(item.section, item.name).toBe('solo');
      expect(item.twists, item.name).toEqual([LIGHT_TWISTS[i]!]);
    }

    // 13..27: duo (15 pairs)
    const pairs = pairCombinations(LIGHT_TWISTS);
    expect(pairs).toHaveLength(15);
    for (let i = 0; i < 15; i++) {
      const item = panels[13 + i]!;
      expect(item.section, item.name).toBe('duo');
      expect(item.twists, item.name).toEqual(pairs[i]!);
    }

    // 28: all6
    const boss = panels[28]!;
    expect(boss.section).toBe('all6');
    expect(boss.twists).toEqual(LIGHT_TWISTS);

    // Every panel's actual twistsOf(panel) matches item.twists
    for (const [idx, item] of panels.entries()) {
      expect(twistsOf(item.panel), `panel ${idx} (${item.name}) twistsOf`).toEqual(item.twists);
      expect(item.tip.length, `panel ${idx} tip`).toBeGreaterThan(0);
      expect(item.explain.length, `panel ${idx} explain`).toBeGreaterThan(0);
    }
  });

  it('has 29 distinct board layouts all <= 7x7 with a unique solution', () => {
    const seenLayouts = new Set<string>();

    for (const [idx, item] of CLAUSE_LIGHTS.panels.entries()) {
      const b = parse(item.panel);
      expect(b.height, `panel ${idx} (${item.name}) height`).toBeLessThanOrEqual(7);
      expect(b.width, `panel ${idx} (${item.name}) width`).toBeLessThanOrEqual(7);

      const layoutKey = item.panel.rows.join('/');
      expect(seenLayouts.has(layoutKey), `duplicate layout on panel ${idx} (${item.name})`).toBe(
        false,
      );
      seenLayouts.add(layoutKey);

      const answers = solve(b, 2, { blindDark: item.twists.includes('dark') }, new Budget(500_000));
      expect(answers.length, `panel ${idx} (${item.name}) unique solution`).toBe(1);
    }
  }, 60_000);

  it('verifies all 6 solo and 15 duo panels with margin >= 2, and all6 with margin >= 1', () => {
    for (let i = 7; i <= 27; i++) {
      const item = CLAUSE_LIGHTS.panels[i]!;
      expect(problems(item.panel, 2, new Budget(500_000)), `panel ${i} (${item.name})`).toEqual([]);
    }

    const boss = CLAUSE_LIGHTS.panels[28]!;
    expect(twistsOf(boss.panel)).toEqual(LIGHT_TWISTS);
    expect(problems(boss.panel, 1, new Budget(500_000)), `panel 28 (${boss.name})`).toEqual([]);
  }, 60_000);
});
