import { describe, expect, it } from 'vitest';
import { type Panel, countSolutions, parse, problems } from '../../src/gen/webs';
import {
  CHICK,
  CHOCOLATES,
  GRAVYBOAT,
  MESSAGES,
  PICNIC,
  SPIDER,
  STAR,
  WARMUP,
  chick,
  chocolates,
  cobwebs,
  gravyboat,
  message,
  picnic,
  starlights,
  web,
} from '../../src/proto/puzzles/halloween';

const count = (p: Panel, limit = 2): number => countSolutions(parse(p), limit);

describe('Halloween web run', () => {
  const twisted = [...SPIDER, ...CHOCOLATES, ...STAR, ...CHICK, ...PICNIC, ...GRAVYBOAT];
  const all = [...WARMUP, ...twisted];

  it('defines 7 runs (5 intro + 5 home + 5×3 relic = 25 panels) with dimensions <= 7×7', () => {
    expect(cobwebs.kind).toBe('intro');
    expect(web.kind).toBe('home');
    for (const r of [chocolates, starlights, chick, picnic, gravyboat]) {
      expect(r.kind).toBe('relic');
    }
    expect(WARMUP).toHaveLength(5);
    expect(SPIDER).toHaveLength(5);
    for (const relic of [CHOCOLATES, STAR, CHICK, PICNIC, GRAVYBOAT]) {
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

  it('each warm-up panel needs the rule it teaches', () => {
    const [, , crossing, oneWeb] = WARMUP as [Panel, Panel, Panel, Panel, Panel];
    expect(countSolutions(parse(crossing), 2, { noCrossing: false })).toBe(2);
    expect(countSolutions(parse(oneWeb), 2, { connected: false })).toBe(2);
  });

  it('each message fills in from its web', () => {
    CHOCOLATES.forEach((p, i) => expect(message(p), p.name).toBe(MESSAGES[i]));
  });
});
