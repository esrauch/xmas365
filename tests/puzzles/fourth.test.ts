import { describe, expect, it } from 'vitest';
import { problems } from '../../src/gen/pictures';
import { type Panel, clues, fillMessage, lineDone, logical } from '../../src/proto/picture';
import {
  BOW,
  BROOM,
  CHOCOBUNNY,
  FINALE,
  HARVESTCORN,
  SNOWGLOBE,
  SPARKLERS,
  bow,
  broom,
  chocobunny,
  finale,
  harvestcorn,
  snowglobe,
  sparklers,
} from '../../src/proto/puzzles/fourth';

const allRuns = [sparklers, finale, bow, broom, chocobunny, harvestcorn, snowglobe];
const twistPanels: Panel[] = [
  ...FINALE,
  ...BOW,
  ...BROOM,
  ...CHOCOBUNNY,
  ...HARVESTCORN,
  ...SNOWGLOBE,
];
const all: Panel[] = [...SPARKLERS, ...twistPanels];

describe('Fourth of July fireworks room (7 runs, 25 panels)', () => {
  it('has 7 runs (intro, home, and 5 relics) totaling 25 panels, all <= 7x7', () => {
    expect(allRuns).toHaveLength(7);
    expect(sparklers.kind).toBe('intro');
    expect(finale.kind).toBe('home');
    for (const relic of [bow, broom, chocobunny, harvestcorn, snowglobe]) {
      expect(relic.kind).toBe('relic');
    }
    expect(SPARKLERS).toHaveLength(5);
    expect(FINALE).toHaveLength(5);
    for (const relicPanels of [BOW, BROOM, CHOCOBUNNY, HARVESTCORN, SNOWGLOBE]) {
      expect(relicPanels).toHaveLength(3);
    }
    expect(all).toHaveLength(25);
    for (const p of all) {
      expect(p.rows.length, `${p.name} height`).toBeLessThanOrEqual(7);
      expect(p.rows[0]?.length ?? 0, `${p.name} width`).toBeLessThanOrEqual(7);
    }
  });

  it('every picture has a unique solution, line-clue panels solve by line logic alone, and twist panels pass verification', () => {
    for (const p of [...SPARKLERS, ...FINALE, ...BOW, ...BROOM, ...SNOWGLOBE]) {
      expect(logical(p), p.name).toBe(true);
    }
    for (const p of twistPanels) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('dark clues: at most one per line, never a line’s only clue', () => {
    for (const p of BROOM) {
      expect(p.dark?.length ?? 0, p.name).toBeGreaterThan(0);
      const c = clues(p);
      const seen = new Set<string>();
      for (const [kind, line] of p.dark ?? []) {
        expect(seen.has(`${kind}${line}`), `${p.name} ${kind} ${line}`).toBe(false);
        seen.add(`${kind}${line}`);
        expect((kind === 'row' ? c.rows : c.cols)[line]?.length ?? 0).toBeGreaterThan(1);
      }
    }
  });

  it('each letter message spells a real phrase', () => {
    expect(BOW.map(fillMessage)).toEqual(['LOVE', 'STAR', 'LIGHT']);
  });

  it('lineDone waits for dark (?) lines to have no empty squares left', () => {
    const plainRuns = [
      { n: 2, colour: 1 },
      { n: 1, colour: 1 },
    ];
    expect(lineDone(plainRuns, [1, 1, 0, 1, 0])).toBe(true);

    const darkRuns = [
      { n: 2, colour: 1 },
      { n: 3, colour: 1, hidden: true },
    ];
    // With open empty squares (0), a dark clue's run could still grow, so the line is not done yet.
    expect(lineDone(darkRuns, [1, 1, 0, 1, 0, 0])).toBe(false);
    // Once all non-filled squares are crossed out (-2), the dark line is done.
    expect(lineDone(darkRuns, [1, 1, -2, 1, 1, -2])).toBe(true);
  });
});
