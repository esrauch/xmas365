import { describe, expect, it } from 'vitest';
import {
  type Panel,
  type Spot,
  eachWordOnce,
  find,
  key,
  letterAt,
  problems,
  spellings,
  wellFormed,
} from '../../src/gen/words';
import {
  BASKET,
  JACK,
  LOVENOTES,
  MAILBOX,
  VALENTINES_BONUS,
} from '../../src/proto/puzzles/valentines';

const all: Panel[] = [...LOVENOTES, ...JACK, ...BASKET, ...MAILBOX, ...VALENTINES_BONUS];

describe("Valentine's love-letter run", () => {
  it('story strays go 4x4, 5x5, 6x6; centerpiece goes 5x5, 6x6, 7x7; 9x9 reserved for bonus', () => {
    expect(JACK.map((p) => [p.rows.length, p.rows[0]?.length])).toEqual([
      [4, 4],
      [5, 5],
      [6, 6],
    ]);
    expect(BASKET.map((p) => [p.rows.length, p.rows[0]?.length])).toEqual([
      [4, 4],
      [5, 5],
      [6, 6],
    ]);
    expect(MAILBOX.map((p) => [p.rows.length, p.rows[0]?.length])).toEqual([
      [5, 5],
      [6, 6],
      [7, 7],
    ]);
    expect(VALENTINES_BONUS.map((p) => [p.rows.length, p.rows[0]?.length])).toEqual([[9, 9]]);
  });

  it('the words fill each grid exactly, each along touching squares', () => {
    for (const p of all) expect(wellFormed(p), p.name).toBe(true);
  });

  it('each theme word can be spelled only one way with its clues', () => {
    for (const p of all) expect(eachWordOnce(p), p.name).toBe(true);
    for (const p of [...JACK, ...BASKET, ...MAILBOX, ...VALENTINES_BONUS])
      expect(problems(p, 1), p.name).toEqual([]);
  });

  it('at most one dark letter per word, never its first or last', () => {
    for (const p of all.filter((x) => x.dark))
      for (const w of p.words) {
        const dark = w.cells.filter((c) => (p.dark ?? []).some((d) => key(d) === key(c)));
        expect(dark.length, `${p.name}: ${w.word}`).toBeLessThanOrEqual(1);
        for (const d of dark) {
          expect(key(d), `${p.name}: ${w.word} first`).not.toBe(key(w.cells[0] as Spot));
          expect(key(d), `${p.name}: ${w.word} last`).not.toBe(
            key(w.cells[w.cells.length - 1] as Spot),
          );
        }
      }
  });

  it('with dark squares read as any letter, each word still has only one path', () => {
    for (const p of all.filter((x) => x.dark))
      for (const w of p.words)
        expect(spellings(p, w.word, p.dark), `${p.name}: ${w.word}`).toHaveLength(1);
  });

  it('a word is found by its own path, and not backwards', () => {
    for (const p of all)
      p.words.forEach((w, i) => {
        expect(find(p, w.cells)).toBe(i);
        if (w.word.length > 1 && [...w.word].reverse().join('') !== w.word)
          expect(find(p, [...w.cells].reverse())).toBe(-1);
      });
  });

  it('spangrams run from one side to the other', () => {
    for (const p of all.filter((x) => x.spangram)) {
      const cells = p.words[0]?.cells ?? [];
      const rows = cells.map(([r]) => r);
      const cols = cells.map(([, c]) => c);
      const H = p.rows.length - 1;
      const W = (p.rows[0]?.length ?? 1) - 1;
      expect(
        (cols.includes(0) && cols.includes(W)) || (rows.includes(0) && rows.includes(H)),
        p.name,
      ).toBe(true);
    }
  });

  it('dark squares, eggs and codes are on the board', () => {
    for (const p of all) {
      for (const s of [...(p.dark ?? []), ...(p.eggs ?? [])])
        expect(letterAt(p, s), `${p.name} ${key(s)}`).not.toBe('');
      for (const ch of p.code ?? '') expect(p.rows.join(''), p.name).toContain(ch);
    }
  });

  it('a word counts by any path through its own squares that spells it', () => {
    // MUMMY's Ms can be visited in either order: M(0,0) U M(0,1) M Y, or M(0,1) U M(0,0) M Y.
    const p: Panel = {
      name: 'mummy',
      theme: '',
      rows: ['MM', 'UM', 'XY'],
      words: [
        {
          word: 'MUMMY',
          cells: [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [2, 1],
          ],
        },
      ],
    };
    const other: Spot[] = [
      [0, 1],
      [1, 0],
      [0, 0],
      [1, 1],
      [2, 1],
    ];
    expect(find(p, p.words[0]?.cells ?? [])).toBe(0);
    expect(find(p, other)).toBe(0);
  });
});
