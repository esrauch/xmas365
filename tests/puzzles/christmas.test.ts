import { describe, expect, it } from 'vitest';
import { problems } from '../../src/gen/lights';
import {
  type Panel,
  countSolutions,
  light,
  parse,
  piecesSymmetricIn,
  solved,
  startGrid,
  turn,
} from '../../src/proto/lights';
import {
  CAULDRON,
  EGG,
  ICEPOP,
  LOVELETTER,
  PIE,
  TREE,
  WARMUP,
  cauldron,
  fairylights,
  goldenegg,
  icepop,
  loveletter,
  pumpkinpie,
  tree,
} from '../../src/proto/puzzles/christmas';

const count = (p: Panel, rules = {}): number => countSolutions(parse(p), 2, rules);

describe('Christmas lights run', () => {
  const twisted = [...TREE, ...EGG, ...PIE, ...LOVELETTER, ...ICEPOP, ...CAULDRON];
  const all = [...WARMUP, ...twisted];

  it('defines 7 runs (5 intro + 3 home + 5×3 relic = 23 panels) with dimensions <= 6×6', () => {
    expect(fairylights.kind).toBe('intro');
    expect(tree.kind).toBe('home');
    for (const r of [goldenegg, pumpkinpie, loveletter, icepop, cauldron]) {
      expect(r.kind).toBe('relic');
    }
    expect(WARMUP).toHaveLength(5);
    expect(TREE).toHaveLength(3);
    for (const relic of [EGG, PIE, LOVELETTER, ICEPOP, CAULDRON]) {
      expect(relic).toHaveLength(3);
    }
    expect(all).toHaveLength(23);
    for (const p of all) {
      const b = parse(p);
      expect(b.height, p.name).toBeLessThanOrEqual(6);
      expect(b.width, p.name).toBeLessThanOrEqual(6);
    }
  });

  it('every panel has exactly one answer, and the panel is that answer', () => {
    for (const p of all) {
      expect(count(p), p.name).toBe(1);
      const b = parse(p);
      expect(solved(b, b.solution), p.name).toBe(true);
    }
    for (const p of twisted) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('no panel starts solved, and snowflake zones start mirrored', () => {
    for (const p of all) {
      const b = parse(p);
      const g = startGrid(p);
      expect(solved(b, g), p.name).toBe(false);
      if (b.frame) {
        expect(piecesSymmetricIn(b.frame, b.solution), p.name).toBe(true);
        expect(piecesSymmetricIn(b.frame, g), p.name).toBe(true);
      }
    }
  });

  it('a wire pointing off the board is a loose end, and lights nothing off it', () => {
    const p = TREE[2] as Panel;
    const b = parse(p);
    for (const [r, row] of b.solution.entries())
      for (const [c, m] of row.entries()) {
        if (m < 0) continue;
        const grid = b.solution.map((x) => [...x]);
        for (let t = 0; t < 4; t++) {
          (grid[r] as number[])[c] = turn((grid[r] as number[])[c] ?? 0);
          const { dist } = light(b, grid);
          for (const k of dist.keys()) {
            const [rr, cc] = k.split(',').map(Number) as [number, number];
            expect(b.inside(rr, cc), `lit off the board at ${k}`).toBe(true);
          }
        }
      }
  });
});
