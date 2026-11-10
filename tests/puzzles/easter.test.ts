import { describe, expect, it } from 'vitest';
import { problems } from '../../src/gen/hops';
import { type Panel, countSolutions, key, parse, solve } from '../../src/proto/hops';
import {
  CORNUCOPIA,
  EGGTREE,
  FLAG,
  GHOST,
  GINGERBREAD,
  HUTCH,
  ROSE,
  cornucopia,
  eggtree,
  flag,
  ghost,
  gingerbread,
  hutch,
  rose,
} from '../../src/proto/puzzles/easter';

const count = (p: Panel, rules = {}): number => countSolutions(parse(p), 2, rules);

describe('Easter bunny-hop room (7 runs, 25 panels)', () => {
  const allRuns = [hutch, eggtree, flag, cornucopia, rose, ghost, gingerbread];
  const twistPanels: Panel[] = [
    ...EGGTREE,
    ...FLAG,
    ...CORNUCOPIA,
    ...ROSE,
    ...GHOST,
    ...GINGERBREAD,
  ];
  const all: Panel[] = [...HUTCH, ...twistPanels];

  it('has 7 runs (intro, home, and 5 relics) totaling 25 panels, all <= 6x6', () => {
    expect(allRuns).toHaveLength(7);
    expect(hutch.kind).toBe('intro');
    expect(eggtree.kind).toBe('home');
    for (const relic of [flag, cornucopia, rose, ghost, gingerbread]) {
      expect(relic.kind).toBe('relic');
    }
    expect(HUTCH).toHaveLength(5);
    expect(EGGTREE).toHaveLength(5);
    for (const relicPanels of [FLAG, CORNUCOPIA, ROSE, GHOST, GINGERBREAD]) {
      expect(relicPanels).toHaveLength(3);
    }
    expect(all).toHaveLength(25);
    for (const p of all) {
      expect(p.rows.length, `${p.name} height`).toBeLessThanOrEqual(6);
      expect(p.rows[0]?.length ?? 0, `${p.name} width`).toBeLessThanOrEqual(6);
    }
  });

  it('every panel has exactly one answer (free panels: at least one) and passes twist verification', () => {
    for (const p of all) {
      if (p.free) expect(count(p), p.name).toBeGreaterThan(0);
      else expect(count(p), p.name).toBe(1);
    }
    for (const p of twistPanels) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('every twist does real work', () => {
    for (const p of FLAG) expect(count(p, { noColours: true }), p.name).toBe(2);
    for (const p of CORNUCOPIA) expect(count(p, { noPortions: true }), p.name).toBe(2);
    for (const p of ROSE) expect(count(p, { noLetters: true }), p.name).toBe(2);
    for (const p of GHOST) expect(count(p, { noDarkLength: true }), p.name).toBe(2);
    for (const p of GINGERBREAD) expect(count(p, { noSnow: true }), p.name).toBe(2);
  }, 120_000);

  it('every burrow is used, and the Golden Egg (when present) is the last hop', () => {
    for (const p of EGGTREE) {
      expect(p.burrows?.length ?? 0, p.name).toBeGreaterThan(0);
      const b = parse(p);
      const route = solve(b, 1)[0] ?? [];
      for (const [a, z] of p.burrows ?? []) {
        const i = b.index.get(key(a)) as number;
        const j = b.index.get(key(z)) as number;
        const used = route.some(
          (x, n) => n > 0 && ((x === i && route[n - 1] === j) || (x === j && route[n - 1] === i)),
        );
        expect(used, `${p.name}: burrow ${key(a)}`).toBe(true);
      }
      if (p.golden) expect(route[route.length - 1], p.name).toBe(b.index.get(key(p.golden)));
    }
  }, 120_000);
});
