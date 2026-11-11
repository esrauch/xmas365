import { describe, expect, it } from 'vitest';
import { type Panel, countSolutions, fillMessage, parse, problems } from '../../src/gen/carving';
import {
  CANDYCORN,
  FEAST,
  HOTDOG,
  JELLYBEANS,
  LOCKET,
  STOCKING,
  WARMUP,
  breadboard,
  candycorn,
  feast,
  hotdog,
  jellybeans,
  locket,
  stocking,
} from '../../src/proto/puzzles/thanksgiving';

const count = (p: Panel, limit = 2, rules = {}): number => countSolutions(parse(p), limit, rules);

describe('Thanksgiving carving run', () => {
  const twisted = [...FEAST, ...HOTDOG, ...STOCKING, ...LOCKET, ...JELLYBEANS, ...CANDYCORN];
  const all = [...WARMUP, ...twisted];

  it('defines 7 runs (5 intro + 5 home + 5×3 relic = 25 panels) with dimensions <= 7×7', () => {
    expect(breadboard.kind).toBe('intro');
    expect(feast.kind).toBe('home');
    for (const r of [hotdog, stocking, locket, jellybeans, candycorn]) {
      expect(r.kind).toBe('relic');
    }
    expect(WARMUP).toHaveLength(5);
    expect(FEAST).toHaveLength(5);
    for (const relic of [HOTDOG, STOCKING, LOCKET, JELLYBEANS, CANDYCORN]) {
      expect(relic).toHaveLength(3);
    }
    expect(all).toHaveLength(25);
    for (const p of all) {
      const b = parse(p);
      expect(b.height, p.name).toBeLessThanOrEqual(7);
      expect(b.width, p.name).toBeLessThanOrEqual(7);
    }
  });

  it('every panel has exactly one answer and passes verification', () => {
    for (const p of all) expect(count(p), p.name).toBe(1);
    for (const p of twisted) expect(problems(p, 2), p.name).toEqual([]);
  }, 120_000);

  it('the fences matter in the Feast home-twist run', () => {
    for (const p of FEAST) {
      expect(p.walls?.length, p.name).toBeGreaterThan(0);
      const q = { ...p };
      delete q.walls;
      expect(count(q, 2), p.name).toBe(2);
    }
  });

  it('shape matters: the 4s could each be a square, but only lines fit', () => {
    expect(
      parse(WARMUP[2] as Panel)
        .cells.flat()
        .filter((c) => c.n === 4),
    ).toHaveLength(2);
  });

  it('each letter message spells a real word', () => {
    expect(LOCKET.map(fillMessage)).toEqual(['SWEET', 'CORN', 'HEART']);
  });
});
