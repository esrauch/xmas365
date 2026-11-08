/**
 * Christmas: the lights run (GAME.md, "Christmas: the lights run"). Net
 * panels in four runs: the warm-up on the fairy lights, the two strays (the
 * Golden Egg brings Easter's numbered eggs on an egg-shaped board; the
 * Pumpkin Pie, Thanksgiving's fair shares on a pie cut in slices), and the
 * Christmas Tree centrepiece (red and green strings, on trees and a wreath).
 * Every panel has exactly one answer (tests/puzzles/christmas.test.ts);
 * most were found by a random search.
 */
import { type LightsPanel, mountLights } from '../netBoard';
import { run } from '../run';

export const WARMUP: LightsPanel[] = [
  { name: 'One turn', rows: ['2a8'], plug: [0, 0], start: ['258'] },
  { name: 'Corners', rows: ['44', '39'], plug: [0, 0], start: ['24', 'c3'] },
  { name: 'A branch', rows: ['2ec', '291'], plug: [1, 1] },
  { name: 'No loose ends', rows: ['6a8', '7ac', '129'], plug: [2, 1] },
  { name: 'Everything lit', rows: ['444', '3b9'], plug: [1, 0] },
  { name: 'A first string', rows: ['682c', '7aad', '7a81', '3aa8'], plug: [3, 1] },
];

export const EGG: LightsPanel[] = [
  {
    name: 'A numbered egg',
    rows: ['.2ac.', '2ead4', '6d2bd', '13e81', '.2b8.'],
    plug: [4, 2],
    eggs: [[2, 2, 8]],
  },
  {
    name: 'A clutch of eggs',
    rows: ['..2c4..', '.42bd4.', '6be83bc', '52b86c5', '3c2e939', '.3ad68.', '..2b9..'],
    plug: [6, 3],
    eggs: [
      [3, 3, 11],
      [1, 2, 14],
    ],
  },
  {
    name: 'The Golden Egg',
    rows: [
      '...2ec...',
      '..2a93c..',
      '.2eaaaf8.',
      '6ab84456c',
      '542ebb915',
      '53e9682ed',
      '3c52bea91',
      '.13e83e8.',
      '..2baa9..',
    ],
    plug: [8, 4],
    eggs: [
      [7, 4, 3],
      [3, 3, 18],
    ],
  },
];

export const PIE: LightsPanel[] = [
  {
    name: 'Two slices',
    rows: ['.42c.', '6bab8', '3ac6c', '2afd1', '.291.'],
    plug: [2, 2],
    slices: ['.BBB.', 'BBBBB', 'BB*AA', 'AAAAA', '.AAA.'],
  },
  {
    name: 'A bigger pie',
    rows: ['..684..', '.2d47c.', '46fd154', '3d1547d', '2d47fd1', '.3d151.', '..129..'],
    plug: [3, 3],
    slices: ['..BBA..', '.BBBAA.', 'BBBBAAA', 'BBB*AAA', 'BBBAAAA', '.BBAAA.', '..BAA..'],
  },
  {
    name: 'Three slices',
    rows: [
      '..6c46c..',
      '.413f978.',
      '43aed6b84',
      '7ac1512ed',
      '3c387aad5',
      '6faed4695',
      '17c117941',
      '.156c7e9.',
      '..39111..',
    ],
    plug: [4, 4],
    slices: [
      '..BBBBB..',
      '.BBBBBBB.',
      'ABBBBBBBC',
      'AAABBBCCC',
      'AAAA*CCCC',
      'AAAAACCCC',
      'AAAAACCCC',
      '.AAAACCC.',
      '..AAACC..',
    ],
  },
];

export const TREE: LightsPanel[] = [
  {
    name: 'A little tree',
    rows: ['...4...', '..6bc..', '..569..', '.693e8.', '.546bc.', '293b838'],
    plug: [5, 3],
    star: [0, 3],
  },
  {
    name: 'Frost on the branches',
    rows: ['...4...', '..2f8..', '..478..', '.6d7c4.', '.17d15.', '2a93ab8'],
    plug: [5, 3],
    frame: {
      top: 3,
      left: 1,
      bottom: 5,
      right: 4,
      axis: 'v',
    },
    star: [0, 3],
  },
  {
    name: 'A taller tree',
    rows: ['...4...', '..2bc..', '..6ad..', '.6d478.', '.17d14.', '2ad7abc', '2a93a81'],
    plug: [6, 3],
    frame: {
      top: 4,
      left: 1,
      bottom: 6,
      right: 4,
      axis: 'v',
    },
    star: [0, 3],
  },
  {
    name: 'The frosty wreath',
    rows: [
      '.442c68.',
      '6bfefbec',
      '56911295',
      '13c..685',
      '469..3e9',
      '53c442bc',
      '3efbfe81',
      '.112938.',
    ],
    plug: [7, 4],
    frame: {
      top: 0,
      left: 0,
      bottom: 7,
      right: 5,
      axis: 'h',
    },
  },
  {
    name: 'The Christmas Tree',
    rows: [
      '....4....',
      '...6d4...',
      '...155...',
      '..6ebf8..',
      '..55478..',
      '.417d144.',
      '.5693c55.',
      '2bd447bbc',
      '2ab93ba81',
    ],
    plug: [8, 4],
    frame: {
      top: 5,
      left: 1,
      bottom: 8,
      right: 6,
      axis: 'v',
    },
    star: [0, 4],
  },
];

const mountPanel: Parameters<typeof run<LightsPanel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountLights(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Tap a piece to turn it a quarter clockwise (always clockwise; four taps go all the way round). The puzzles teach the rules; open a puzzle number to jump about.';

export const fairylights = run({
  id: 'fairylights',
  title: 'The Fairy Lights',
  room: 'Christmas',
  kind: 'warm-up',
  from: 'Lights · Christmas, taught puzzle by puzzle',
  rules: `${CONTROLS} (Rules: turn the pieces so the power from the plug reaches every square, with no loose wire ends.)`,
  panels: WARMUP,
  mountPanel,
});

export const goldenegg = run({
  id: 'goldenegg',
  title: 'The Golden Egg',
  room: 'Christmas',
  kind: 'stray',
  from: 'Egg-Hunt Lights · Christmas (Easter)',
  rules: `${CONTROLS} (Twist: the power must reach each numbered egg in exactly that many steps from the plug, counting squares along the wire.)`,
  panels: EGG,
  mountPanel,
});

export const pumpkinpie = run({
  id: 'pumpkinpie',
  title: 'The Pumpkin Pie',
  room: 'Christmas',
  kind: 'stray',
  from: 'Portioned Lights · Christmas (Thanksgiving)',
  rules: `${CONTROLS} (Twist: each slice gets exactly one wire from the middle, across a dotted edge, and no wire may cross a thick crust line between two slices. Each slice shows how many wires it gets from the middle so far.)`,
  panels: PIE,
  mountPanel,
});

export const tree = run({
  id: 'tree',
  title: 'The Christmas Tree',
  room: 'Christmas',
  kind: 'centerpiece',
  from: 'Snowflake Lights · Christmas (Christmas)',
  rules: `${CONTROLS} (Twist: inside the frosty frame, pieces are mirrored across the icy line and turn together.)`,
  panels: TREE,
  mountPanel,
});
