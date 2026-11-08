/**
 * Easter: the bunny-hop run (GAME.md, "Easter: the bunny-hop run"). Numbrix
 * (Hidato with plain steps) panels in four runs: the warm-up in the hutch, the two strays (the
 * Star-Spangled Flag brings the Fourth of July's flags, as parade viewers; the
 * Cornucopia, Thanksgiving's fair shares, as courses), and the Egg Tree
 * centrepiece (tree boards, burrows, the Golden Egg on top). Every panel but
 * the free learning ones has exactly one answer (tests/puzzles/easter.test.ts);
 * most were found by a random search.
 */
import { type Panel } from '../hops';
import { mountHops } from '../hopsBoard';
import { run } from '../run';

export const HUTCH: Panel[] = [
  { name: 'One step', rows: ['##'], given: [[0, 0, 1]] },
  { name: 'A little run', rows: ['###', '..#'], given: [[0, 0, 1]] },
  { name: 'Every spot', rows: ['###', '###', '###'], given: [[0, 0, 1]], free: true },
  {
    name: 'Numbered eggs',
    rows: ['####', '####', '####'],
    given: [
      [0, 0, 1],
      [2, 1, 12],
    ],
  },
  {
    name: 'A first real hunt',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [3, 1, 1],
      [2, 2, 19],
      [1, 2, 22],
    ],
  },
];

export const FLAG: Panel[] = [
  {
    name: 'Two bunnies',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [1, 1, 1],
      [1, 0, 2],
      [0, 0, 3],
      [3, 1, 1],
      [2, 3, 4],
    ],
    colours: ['rrrrr', 'rrrww', 'rrrbb', 'bbwbb', 'bbbbb'],
  },
  {
    name: 'White lawn',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [2, 4, 1],
      [5, 5, 13],
      [2, 2, 1],
      [1, 3, 5],
      [5, 3, 25],
    ],
    colours: ['bbbbbwr', 'bbbbwrr', 'bbbbrrr', 'bbwbrrr', 'bbrrrrr', 'bbbbwrr', 'bbbbrrr'],
  },
  {
    name: 'The big parade',
    rows: [
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
    ],
    given: [
      [3, 5, 1],
      [5, 6, 6],
      [2, 6, 19],
      [1, 7, 33],
      [6, 0, 1],
      [0, 0, 27],
    ],
    colours: [
      'bbrrrrrrr',
      'bwrrrrrrr',
      'bbbrrrrrr',
      'bbbrrrrrr',
      'bbbrrrrrb',
      'bbbwwrrwb',
      'bbbbbbbbb',
      'bbbbbbbbb',
      'bbbbbbbbb',
    ],
  },
];

export const CORNUCOPIA: Panel[] = [
  {
    name: 'Two courses',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [4, 0, 1],
      [2, 2, 19],
      [3, 3, 25],
    ],
    portions: ['AAAAA', 'AAAAA', 'ABBBB', 'ABBBB', 'ABBBB'],
  },
  {
    name: 'Three courses',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [6, 6, 1],
      [2, 3, 8],
      [0, 0, 21],
      [5, 0, 42],
      [4, 0, 47],
    ],
    portions: ['BBBAAAA', 'BBBAAAA', 'BBBAAAA', 'CCBBBBA', 'CCCBBBA', 'CCCCCBA', 'CCCCCCA'],
  },
  {
    name: 'The full table',
    rows: [
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
      '#########',
    ],
    given: [
      [5, 1, 1],
      [6, 8, 9],
      [0, 2, 47],
      [3, 4, 66],
      [3, 7, 69],
    ],
    portions: [
      'CCCCCCCDD',
      'CCCCCCDDD',
      'BCCCDDDDD',
      'BBCCDDDDD',
      'BBCCDDDDD',
      'BAAAAAAAA',
      'BAAAAAAAA',
      'BAAAABBBB',
      'BBBBBBBBB',
    ],
  },
];

export const EGGTREE: Panel[] = [
  {
    name: 'The tree',
    rows: ['...#...', '..###..', '..###..', '.#####.', '.#####.', '#######', '#######'],
    given: [
      [1, 4, 1],
      [4, 4, 14],
      [6, 3, 17],
      [0, 3, 31],
    ],
    golden: [0, 3],
  },
  {
    name: 'A burrow',
    rows: ['...#...', '..###..', '..###..', '.#####.', '.#####.', '#######', '#######'],
    given: [
      [1, 4, 1],
      [5, 4, 7],
      [5, 0, 21],
      [0, 3, 31],
    ],
    burrows: [
      [
        [6, 4],
        [2, 3],
      ],
    ],
    golden: [0, 3],
  },
  {
    name: 'A taller tree',
    rows: [
      '....#....',
      '...###...',
      '...###...',
      '..#####..',
      '..#####..',
      '.#######.',
      '.#######.',
      '#########',
      '#########',
    ],
    given: [
      [1, 5, 1],
      [6, 6, 9],
      [8, 0, 25],
      [5, 1, 35],
      [4, 2, 41],
      [0, 4, 49],
    ],
    golden: [0, 4],
  },
  {
    name: 'Two pairs of burrows',
    rows: [
      '....#....',
      '...###...',
      '...###...',
      '..#####..',
      '..#####..',
      '.#######.',
      '.#######.',
      '#########',
      '#########',
    ],
    given: [
      [1, 5, 1],
      [6, 3, 15],
      [6, 4, 20],
      [6, 6, 30],
      [4, 4, 41],
      [0, 4, 49],
    ],
    burrows: [
      [
        [8, 1],
        [5, 6],
      ],
      [
        [8, 0],
        [5, 7],
      ],
    ],
    golden: [0, 4],
  },
  {
    name: 'The Egg Tree',
    rows: [
      '....#....',
      '...###...',
      '...###...',
      '..#####..',
      '..#####..',
      '.#######.',
      '.#######.',
      '#########',
      '#########',
    ],
    given: [
      [4, 6, 1],
      [8, 5, 16],
      [2, 4, 26],
      [5, 1, 34],
      [0, 4, 49],
    ],
    burrows: [
      [
        [8, 8],
        [1, 5],
      ],
      [
        [2, 3],
        [8, 1],
      ],
    ],
    golden: [0, 4],
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountHops(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag from the bunny through neighboring spots (up, down, left, right) to lay its trail; drag back to rub it out. Tap the bunny to take a hop back. Visit every spot once; a numbered egg must be that hop. The puzzles teach the rules; open a puzzle number to jump about.';

export const hutch = run({
  id: 'hutch',
  title: 'The Hutch',
  room: 'Easter',
  kind: 'warm-up',
  from: 'Hops · Easter, taught puzzle by puzzle',
  rules: CONTROLS,
  panels: HUTCH,
  mountPanel,
});

export const flag = run({
  id: 'flag',
  title: 'The Star-Spangled Flag',
  room: 'Easter',
  kind: 'stray',
  from: 'Patriotic Hops · Easter (Fourth of July)',
  rules: `${CONTROLS} (Twist: a red bunny and a blue bunny, each starting from its own 1 egg and stepping over its own color; white squares go to either.)`,
  panels: FLAG,
  mountPanel,
});

export const cornucopia = run({
  id: 'cornucopia',
  title: 'The Cornucopia',
  room: 'Easter',
  kind: 'stray',
  from: 'Portioned Hops · Easter (Thanksgiving)',
  rules: `${CONTROLS} (Twist: the board is outlined in courses; the bunny must finish each course before starting the next.)`,
  panels: CORNUCOPIA,
  mountPanel,
});

export const eggtree = run({
  id: 'eggtree',
  title: 'The Egg Tree',
  room: 'Easter',
  kind: 'centerpiece',
  from: 'Egg-Hunt Hops · Easter (Easter)',
  rules: `${CONTROLS} (Burrows: two burrows of a color are joined underground; popping down one and up the other is a hop. The last egg is the Golden Egg at the top.)`,
  panels: EGGTREE,
  mountPanel,
});
