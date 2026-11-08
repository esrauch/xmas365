/**
 * Thanksgiving: the carving run (GAME.md, "Thanksgiving: the carving run").
 * Shikaku panels in four runs: the warm-up on the bread board, the two
 * strays (the Hot Dog brings the Fourth of July's flags, here on skewers; the
 * Stocking, Christmas's red and green), and the Feast centrepiece (fair
 * shares: every portion gets one of each dish). Every panel has exactly
 * one answer (tests/puzzles/thanksgiving.test.ts); most were found by a
 * random search.
 */
import { run } from '../run';
import { type Panel } from '../../gen/carving';
import { mountCarving } from '../shikakuBoard';

export const WARMUP: Panel[] = [
  { name: 'One portion', rows: ['4 .', '. .'] },
  { name: 'Size counts', rows: ['. 4 .', '. . 2'] },
  { name: 'Shape matters', rows: ['4 . . .', '4 . . .'] },
  { name: 'Every square', rows: ['6 . . 1', '. . . .', '. . . 2', '. 6 . 1'] },
  {
    name: 'A first board',
    rows: ['3 2 . . .', '. . . . .', '. . . . 6', '. . 8 2 .', '2 . . 2 .'],
  },
];

export const HOTDOG: Panel[] = [
  {
    name: 'Red, white and blue',
    rows: ['. . 2 . .', '. 6 . . 4', '. . . 6 .', '. . . . .', '. 4 . 3 .'],
    colours: ['..rb.', 'b....', '.....', '.....', '.r.b.'],
  },
  {
    name: 'Stripes',
    rows: [
      '. . 2 . . 3 .',
      '. 4 . . . . .',
      '. . . . 8 . .',
      '. 4 . . . . 6',
      '4 . 6 . . 2 .',
      '. . . 8 . . .',
      '. 2 . . . . .',
    ],
    colours: ['b......', '....r..', 'r.....b', '.......', '...b...', '.......', '.br....'],
  },
  {
    name: 'The cookout',
    rows: [
      '. 3 . . . . . . .',
      '2 . . . 6 . 4 . 7',
      '. . . . . . . . .',
      '6 . . . 5 . . 6 .',
      '. . . . . 2 . . .',
      '. . . . . . . . .',
      '. 6 . . . 9 . . .',
      '. . 8 . . . . . .',
      '. 2 . 9 . . 4 . 2',
    ],
    colours: [
      '...r.....',
      '.r....b..',
      'b.......r',
      '.....r...',
      '.........',
      '..b......',
      '.........',
      '.........',
      'r...b....',
    ],
  },
];

export const STOCKING: Panel[] = [
  {
    name: 'A frosty window',
    rows: ['. . 2 . .', '. 6 . . 4', '. . . 6 .', '. . . . .', '. 4 . 3 .'],
    frame: {
      top: 1,
      left: 0,
      bottom: 4,
      right: 2,
      axis: 'h',
    },
  },
  {
    name: 'Mirror cuts',
    rows: [
      '6 . . . . . 2',
      '. . . 6 . . .',
      '. . 3 . . 5 .',
      '8 . . . 2 . 4',
      '. . . . . . .',
      '. . 2 . 2 . .',
      '2 . . 3 2 . 2',
    ],
    frame: {
      top: 2,
      left: 2,
      bottom: 4,
      right: 5,
      axis: 'v',
    },
  },
  {
    name: 'A full stocking',
    rows: [
      '. 3 . . . . . . .',
      '2 . . . 6 . 4 . 7',
      '. . . . . . . . .',
      '6 . . . 5 . . 6 .',
      '. . . . . 2 . . .',
      '. . . . . . . . .',
      '. 6 . . . 9 . . .',
      '. . 8 . . . . . .',
      '. 2 . 9 . . 4 . 2',
    ],
    frame: {
      top: 2,
      left: 0,
      bottom: 7,
      right: 3,
      axis: 'v',
    },
  },
];

export const FEAST: Panel[] = [
  {
    name: 'The big carve',
    rows: [
      '3 . 2 . 6 . .',
      '. . . . . . .',
      '. 4 . . . . 7',
      '. . . . . . .',
      '. . 8 . . . .',
      '2 . . 6 . 7 .',
      '. . . . 4 . .',
    ],
  },
  {
    name: 'First cuts',
    rows: ['. . 2 . .', '. 6 . . 4', '. . . 6 .', '. . . . .', '. 4 . 3 .'],
    walls: [[1, 4, 'h']],
  },
  {
    name: 'Carving around fences',
    rows: [
      '. . 2 . . 3 .',
      '. 4 . . . . .',
      '. . . . 8 . .',
      '. 4 . . . . 6',
      '4 . 6 . . 2 .',
      '. . . 8 . . .',
      '. 2 . . . . .',
    ],
    walls: [
      [4, 5, 'v'],
      [5, 0, 'v'],
    ],
  },
  {
    name: 'Across the table',
    rows: [
      '. . . 7 . . .',
      '. . . . . . 4',
      '. 8 . . 2 . .',
      '. . . 5 . . .',
      '. . 3 . . . .',
      '. 8 . 2 . . 4',
      '. . 2 . 2 2 .',
    ],
    walls: [[5, 2, 'h']],
  },
  {
    name: 'The Feast',
    rows: [
      '. 3 . . . . . . .',
      '2 . . . 6 . 4 . 7',
      '. . . . . . . . .',
      '6 . . . 5 . . 6 .',
      '. . . . . 2 . . .',
      '. . . . . . . . .',
      '. 6 . . . 9 . . .',
      '. . 8 . . . . . .',
      '. 2 . 9 . . 4 . 2',
    ],
    walls: [
      [1, 0, 'h'],
      [6, 0, 'v'],
    ],
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountCarving(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag from one square to another to carve the rectangle between them (it replaces any portions in its way); tap a portion to lift it off; tap an empty square for a one-square portion. The puzzles teach the rules; open a puzzle number to jump about.';

export const breadboard = run({
  id: 'breadboard',
  title: 'The Bread Board',
  room: 'Thanksgiving',
  kind: 'warm-up',
  from: 'Carving · Thanksgiving, taught puzzle by puzzle',
  rules: `${CONTROLS} (Rules: carve the board into rectangles; each holds exactly one number, and the number is its size.)`,
  panels: WARMUP,
  mountPanel,
});

export const hotdog = run({
  id: 'hotdog',
  title: 'The Hot Dog',
  room: 'Thanksgiving',
  kind: 'stray',
  from: 'Patriotic Carving · Thanksgiving (Fourth of July)',
  rules: `${CONTROLS} (Twist: a portion takes the color of its red or blue mark; two portions of the same color may not share an edge, while plain portions can touch anything.)`,
  panels: HOTDOG,
  mountPanel,
});

export const stocking = run({
  id: 'stocking',
  title: 'The Stocking',
  room: 'Thanksgiving',
  kind: 'stray',
  from: 'Snowflake Carving · Thanksgiving (Christmas)',
  rules: `${CONTROLS} (Twist: inside the frosty frame, the cuts between portions mirror across the icy line.)`,
  panels: STOCKING,
  mountPanel,
});

export const feast = run({
  id: 'feast',
  title: 'The Feast',
  room: 'Thanksgiving',
  kind: 'centerpiece',
  from: 'Portioned Carving · Thanksgiving (Thanksgiving)',
  rules: `${CONTROLS} (Twist: a portion may not cross a thick fence line between two squares.)`,
  panels: FEAST,
  mountPanel,
});
