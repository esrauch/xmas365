import { describe, expect, it } from 'vitest';
import { Budget } from '../../../src/gen/core/budget';
import { WEB_TWISTS, parse as fromPanel, problems, solve, twistsOf } from '../../../src/gen/webs';
import { CLAUSE_PANEL_COUNT, pairCombinations } from '../../../src/proto/puzzles/clauses/types';
import { CLAUSE_WEBS } from '../../../src/proto/puzzles/clauses/webs';

describe('CLAUSE_WEBS (Clause I: Halloween · Web)', () => {
  it('has the expected clause metadata and 29 puzzles', () => {
    expect(CLAUSE_WEBS.clauseIndex).toBe(0);
    expect(CLAUSE_WEBS.id).toBe('C1');
    expect(CLAUSE_WEBS.genre).toBe('webs');
    expect(CLAUSE_WEBS.title).toBe('Clause I: Halloween · Web');
    expect(CLAUSE_WEBS.genreTitle).toBe('Web');
    expect(CLAUSE_WEBS.twistOrder).toEqual(WEB_TWISTS);
    expect(CLAUSE_WEBS.twistMeta.map((g) => g.key)).toEqual(WEB_TWISTS);
    expect(CLAUSE_WEBS.panels).toHaveLength(CLAUSE_PANEL_COUNT);
  });

  it('orders sections and twists canonically across all 29 panels', () => {
    const panels = CLAUSE_WEBS.panels;

    // 0: base
    expect(panels[0]?.section).toBe('base');
    expect(panels[0]?.twists).toEqual([]);

    // 1..6: intro
    for (let i = 0; i < 6; i++) {
      const item = panels[1 + i];
      expect(item?.section).toBe('intro');
      expect(item?.twists).toEqual([WEB_TWISTS[i]]);
    }

    // 7..12: solo
    for (let i = 0; i < 6; i++) {
      const item = panels[7 + i];
      expect(item?.section).toBe('solo');
      expect(item?.twists).toEqual([WEB_TWISTS[i]]);
    }

    // 13..27: duo
    const pairs = pairCombinations(WEB_TWISTS);
    expect(pairs).toHaveLength(15);
    for (let i = 0; i < 15; i++) {
      const item = panels[13 + i];
      expect(item?.section).toBe('duo');
      expect(item?.twists).toEqual(pairs[i]);
    }

    // 28: all6
    expect(panels[28]?.section).toBe('all6');
    expect(panels[28]?.twists).toEqual(WEB_TWISTS);
  });

  it('has distinct rows.join("/") strings across all 29 panels', () => {
    const seen = new Set<string>();
    for (const item of CLAUSE_WEBS.panels) {
      const key = item.panel.rows.join('/');
      expect(seen.has(key), `duplicate rows on panel "${item.name}": ${key}`).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(CLAUSE_PANEL_COUNT);
  });

  it('uses 5x5 boards for intro reminder panels and 7x7 boards for base, solo, duo, and all6, with a unique solution', () => {
    for (const [idx, item] of CLAUSE_WEBS.panels.entries()) {
      const h = item.panel.rows.length;
      const w = item.panel.rows[0]?.length ?? 0;
      const expectedSize = item.section === 'intro' ? 5 : 7;
      expect(h, `panel ${idx} (${item.name}) height`).toBe(expectedSize);
      expect(w, `panel ${idx} (${item.name}) width`).toBe(expectedSize);
      expect(twistsOf(item.panel), `panel ${idx} (${item.name}) twistsOf`).toEqual(item.twists);

      const web = fromPanel(item.panel);
      const solutions = solve(web, 2, {}, new Budget(500_000));
      expect(solutions, `panel ${idx} (${item.name}) unique solution`).toHaveLength(1);
    }
  });

  it('passes problems(panel, 2) on all intro, solo, and duo panels, and problems(panel, 1) on all6', () => {
    for (const [idx, item] of CLAUSE_WEBS.panels.entries()) {
      if (item.section === 'solo' || item.section === 'duo' || item.section === 'intro') {
        expect(
          problems(item.panel, 2, new Budget(500_000)),
          `panel ${idx} (${item.name}, ${item.section}) problems(2)`,
        ).toEqual([]);
      } else if (item.section === 'all6') {
        expect(twistsOf(item.panel)).toEqual(WEB_TWISTS);
        expect(
          problems(item.panel, 1, new Budget(500_000)),
          `panel ${idx} (${item.name}, all6) problems(1)`,
        ).toEqual([]);
      }
    }
  });
});
