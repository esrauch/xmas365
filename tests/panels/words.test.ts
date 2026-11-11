import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Tier } from '../../src/gen/core/spec';
import { type WordTwist, type Panel, SHAPES, problems, twistsOf } from '../../src/gen/words';

interface Pinned {
  genre: string;
  twists: WordTwist[];
  tier: Tier;
  panels: { seed: number; panel: Panel }[];
}

const dir = join(__dirname, '../../src/panels/words');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

describe('generated words panels', () => {
  it('there are some', () => expect(files.length).toBeGreaterThan(0));

  it.each(files)(
    '%s: each panel has one answer, the tier size, its twists, and twists sit on a sound board',
    (file) => {
      const pinned = JSON.parse(readFileSync(join(dir, file), 'utf8')) as Pinned;
      const { margin, width, height } = SHAPES[pinned.tier];
      expect(pinned.panels.length).toBeGreaterThan(0);
      for (const { panel } of pinned.panels) {
        const size = [panel.rows.length, panel.rows[0]?.length];
        // Snowflake boards are one column narrower (the mirror line between squares, no strip), either way round.
        if (panel.frame)
          expect(
            [
              [height, width - 1],
              [width - 1, height],
            ],
            panel.name,
          ).toContainEqual(size);
        else expect(size, panel.name).toEqual([height, width]);
        expect(new Set(twistsOf(panel)), panel.name).toEqual(new Set(pinned.twists));
        expect(problems(panel, margin), panel.name).toEqual([]);
      }
    },
  );
});
