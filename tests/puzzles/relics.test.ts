import { describe, expect, it } from 'vitest';
import * as carving from '../../src/gen/carving';
import * as hops from '../../src/gen/hops';
import * as lights from '../../src/gen/lights';
import * as pictures from '../../src/gen/pictures';
import * as webs from '../../src/gen/webs';
import * as words from '../../src/gen/words';
import { ROOM_SPECS, STRAY_ITEMS, getRunIdentity, twistLabelFor } from '../../src/game/state';
import { ALL_CLAUSES } from '../../src/proto/puzzles/clauses/index';
import { HOLIDAY_TERMS, getGenreTwistKey } from '../../src/proto/puzzles/clauses/types';

/** Each genre's checks, for a panel of unknown shape (every room run uses its genre's Panel). */
const GENRES = {
  webs: { problems: webs.problems, twistsOf: webs.twistsOf },
  carving: { problems: carving.problems, twistsOf: carving.twistsOf },
  lights: { problems: lights.problems, twistsOf: lights.twistsOf },
  words: { problems: words.problems, twistsOf: words.twistsOf },
  hops: { problems: hops.problems, twistsOf: hops.twistsOf },
  pictures: { problems: pictures.problems, twistsOf: pictures.twistsOf },
} as unknown as Record<
  string,
  { problems: (p: unknown, margin: number) => string[]; twistsOf: (p: unknown) => string[] }
>;

/** Cells across a row: space-separated tokens, or one character each (emoji count as one). */
const rowWidth = (row: unknown): number =>
  typeof row === 'string'
    ? row.includes(' ')
      ? row.trim().split(/\s+/).length
      : Array.from(row).length
    : Array.isArray(row)
      ? row.length
      : 0;

describe('Relics (revamp-centerpieces.md)', () => {
  it('every room holds one relic from each other holiday, and its 5 home relics', () => {
    for (const room of ROOM_SPECS) {
      const homes = room.strays.map((s) => s.homeRoom).sort();
      const others = ROOM_SPECS.map((r) => r.id)
        .filter((id) => id !== room.id)
        .sort();
      expect(homes, room.id).toEqual(others);
      for (const id of room.homeRelics) expect(STRAY_ITEMS[id].homeRoom, id).toBe(room.id);
    }
  });

  it("every relic run starts with a small teaching board (≤ 5×5) that needs the relic's twist", () => {
    for (const relic of Object.values(STRAY_ITEMS)) {
      const genre = HOLIDAY_TERMS[relic.foundIn].genre;
      const first = relic.proto.panels?.[0] as { rows?: unknown[]; name?: string } | undefined;
      expect(first, relic.id).toBeDefined();
      const rows = first?.rows ?? [];
      expect(rows.length, `${relic.id} height`).toBeLessThanOrEqual(5);
      for (const row of rows) expect(rowWidth(row), `${relic.id} width`).toBeLessThanOrEqual(5);

      const checks = GENRES[genre];
      expect(checks, genre).toBeDefined();
      // The board carries exactly the relic's twist, and that twist does real work (without it,
      // more answers would fit): the generator's own verification, at margin 1.
      expect(checks?.twistsOf(first), relic.id).toEqual([getGenreTwistKey(genre, relic.homeRoom)]);
      expect(checks?.problems(first, 1), relic.id).toEqual([]);
    }
  }, 120_000);

  it('every room run is titled by its twist and genre (no names of its own)', () => {
    for (const room of ROOM_SPECS) {
      const runs = [room.warmup, room.homeTwist.proto, ...room.strays.map((s) => s.proto)];
      for (const proto of runs) expect(proto.title).toBe(getRunIdentity(proto.id)?.themedName);
      expect(room.homeTwist.title).toBe(room.homeTwist.proto.title);
    }
  });

  it("every relic's and home twist's label comes from the genre's own twist rule", () => {
    for (const relic of Object.values(STRAY_ITEMS)) {
      const genre = HOLIDAY_TERMS[relic.foundIn].genre;
      expect(relic.twistLabel).toBe(twistLabelFor(genre, relic.homeRoom));
      expect(relic.twistLabel).not.toMatch(/: [a-z]+$/); // a real rule, not a bare twist key
    }
    for (const room of ROOM_SPECS) {
      expect(room.homeTwist.twistLabel).toBe(twistLabelFor(HOLIDAY_TERMS[room.id].genre, room.id));
    }
  });

  it('no two fixed puzzles share the same base layout across room runs and contract clauses', () => {
    const lightKind = (ch: string): string => {
      const m = parseInt(ch, 16);
      const pop = (m & 1 ? 1 : 0) + (m & 2 ? 1 : 0) + (m & 4 ? 1 : 0) + (m & 8 ? 1 : 0);
      if (pop === 2) return m === 5 || m === 10 ? 'I' : 'L';
      return String(pop);
    };

    const baseLayoutKey = (genre: string, p: Record<string, unknown>): string => {
      const rows = (p.rows ?? []) as string[];
      if (genre === 'webs') {
        const coords: string[] = [];
        rows.forEach((r, ri) => {
          for (let ci = 0; ci < r.length; ci++) {
            if (r[ci] !== '.') coords.push(`${ri},${ci}`);
          }
        });
        return `webs:${rows.length}x${rows[0]?.length}:${coords.join(';')}`;
      }
      if (genre === 'carving') {
        const coords: string[] = [];
        rows.forEach((r, ri) => {
          for (let ci = 0; ci < r.length; ci++) {
            if (r[ci] !== '.' && r[ci] !== ' ') coords.push(`${ri},${ci}`);
          }
        });
        return `carving:${rows.length}x${rows[0]?.length}:${coords.join(';')}`;
      }
      if (genre === 'lights') {
        return `lights:${rows.map((r) => [...r].map(lightKind).join('')).join('/')}`;
      }
      if (genre === 'words') {
        return `words:${rows.join('/')}`;
      }
      if (genre === 'hops') {
        const given = (p.given ?? []) as [number, number, number][];
        const letters = (p.letters ?? []) as [number, number, string][];
        const rocks = (p.rocks ?? []) as [number, number][];
        const dark = (p.dark ?? []) as [number, number][];
        const clueCoords = [
          ...given.map((g) => `${g[0]},${g[1]}`),
          ...letters.map((l) => `${l[0]},${l[1]}`),
        ]
          .sort()
          .join(';');
        const rockCoords = [
          ...rocks.map((r) => `${r[0]},${r[1]}`),
          ...dark.map((d) => `${d[0]},${d[1]}`),
        ]
          .sort()
          .join(';');
        return `hops:${rows.length}x${rows[0]?.length}|clues=${clueCoords}|rocks=${rockCoords}`;
      }
      if (genre === 'pictures') {
        return `pictures:${rows.map((r) => r.replace(/[RB#]/g, '#')).join('/')}`;
      }
      return JSON.stringify(rows);
    };

    const seen = new Map<string, string>();
    for (const room of ROOM_SPECS) {
      const genre = HOLIDAY_TERMS[room.id].genre;
      const runs = [room.warmup, room.homeTwist.proto, ...room.strays.map((s) => s.proto)];
      for (const proto of runs) {
        const panels = (proto.panels ?? []) as Record<string, unknown>[];
        panels.forEach((p, idx) => {
          const key = baseLayoutKey(genre, p);
          const label = `${proto.id}[${idx}]`;
          expect(seen.get(key), `${label} duplicates ${seen.get(key)}`).toBeUndefined();
          seen.set(key, label);
        });
      }
    }

    for (const cl of ALL_CLAUSES) {
      cl.panels.forEach((item, idx) => {
        const key = baseLayoutKey(cl.genre, item.panel as unknown as Record<string, unknown>);
        const label = `${cl.id}[${idx}]`;
        expect(seen.get(key), `${label} duplicates ${seen.get(key)}`).toBeUndefined();
        seen.set(key, label);
      });
    }
  });
});
