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
  CANDYCANE,
  JACK,
  LOVENOTES,
  MAILBOX,
  WATERMELON,
  WISHBONE,
  basket,
  candycane,
  jack,
  lovenotes,
  mailbox,
  watermelon,
  wishbone,
} from '../../src/proto/puzzles/valentines';

const allRuns = [lovenotes, mailbox, jack, basket, watermelon, wishbone, candycane];
const twistPanels: Panel[] = [
  ...MAILBOX,
  ...JACK,
  ...BASKET,
  ...WATERMELON,
  ...WISHBONE,
  ...CANDYCANE,
];
const all: Panel[] = [...LOVENOTES, ...twistPanels];

describe("Valentine's love-letter room (7 runs, 25 panels)", () => {
  it('has 7 runs (intro, home, and 5 relics) totaling 25 panels, all <= 7x7', () => {
    expect(allRuns).toHaveLength(7);
    expect(lovenotes.kind).toBe('intro');
    expect(mailbox.kind).toBe('home');
    for (const relic of [jack, basket, watermelon, wishbone, candycane]) {
      expect(relic.kind).toBe('relic');
    }
    expect(LOVENOTES).toHaveLength(5);
    expect(MAILBOX).toHaveLength(5);
    for (const relicPanels of [JACK, BASKET, WATERMELON, WISHBONE, CANDYCANE]) {
      expect(relicPanels).toHaveLength(3);
    }
    expect(all).toHaveLength(25);
    for (const p of all) {
      expect(p.rows.length, `${p.name} height`).toBeLessThanOrEqual(7);
      expect(p.rows[0]?.length ?? 0, `${p.name} width`).toBeLessThanOrEqual(7);
    }
  });

  it('the words fill each grid exactly, each along touching squares', () => {
    for (const p of all) expect(wellFormed(p), p.name).toBe(true);
  });

  it('each theme word can be spelled only one way with its clues, and every twist panel has a unique answer', () => {
    for (const p of all) expect(eachWordOnce(p), p.name).toBe(true);
    for (const p of twistPanels) expect(problems(p, 1), p.name).toEqual([]);
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

  it('dark squares, eggs, bows and codes are on the board', () => {
    for (const p of all) {
      for (const s of [...(p.dark ?? []), ...(p.eggs ?? []), ...(p.bows ?? [])])
        expect(letterAt(p, s), `${p.name} ${key(s)}`).not.toBe('');
      for (const ch of p.code ?? '') expect(p.rows.join(''), p.name).toContain(ch);
    }
  });

  it('a word counts by any path through its own squares that spells it', () => {
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
