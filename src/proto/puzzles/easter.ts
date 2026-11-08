/**
 * Easter: the bunny-hop room (revamp-centerpieces.md).
 * Bunny Hops (Numbrix) panels in seven runs:
 * - Intro: The Hutch (`hutch`, 5 panels, <=7x7)
 * - Home twist: The Egg Tree (`eggtree`, 5 panels, <=7x7, `burrows`)
 * - 5 Relic runs (3 panels each, <=7x7):
 *   1. The Star-Spangled Flag (`flag`, Fourth of July `colours`)
 *   2. The Cornucopia (`cornucopia`, Thanksgiving `courses`)
 *   3. The Single Rose (`rose`, Valentine's `letters`)
 *   4. The Bedsheet Ghost (`ghost`, Halloween `dark`)
 *   5. The Gingerbread Man (`gingerbread`, Christmas `snow`)
 */
import { type Panel } from '../hops';
import { mountHops } from '../hopsBoard';
import { run } from '../run';

type StoryPanel = Panel & { tip?: string };

export const HUTCH: StoryPanel[] = [
  {
    name: 'One step',
    tip: '🥚 Drag from the bunny to the neighboring spot to lay its trail',
    rows: ['##'],
    given: [[0, 0, 1]],
  },
  {
    name: 'A little run',
    tip: '🥚 Hop up, down, left, or right through every lawn square in order',
    rows: ['###', '..#'],
    given: [[0, 0, 1]],
  },
  {
    name: 'Every spot',
    tip: '🥚 Visit every lawn square on the board exactly once',
    rows: ['###', '###', '###'],
    given: [[0, 0, 1]],
    free: true,
  },
  {
    name: 'Numbered eggs',
    tip: '🥚 A numbered egg must be visited on that exact hop number',
    rows: ['####', '####', '####'],
    given: [
      [0, 0, 1],
      [2, 1, 12],
    ],
  },
  {
    name: 'A first real hunt',
    tip: '🥚 Plan a single trail that visits all 25 squares and hits each numbered egg on step',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [3, 1, 1],
      [2, 2, 19],
      [1, 2, 22],
    ],
  },
];

export const EGGTREE: StoryPanel[] = [
  {
    name: 'First burrow',
    tip: '🥚 Matching burrow holes connect underground as a single hop between their two squares',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [4, 2, 1],
      [0, 1, 14],
      [1, 1, 23],
      [2, 1, 24],
    ],
    burrows: [
      [
        [4, 0],
        [2, 3],
      ],
    ],
  },
  {
    name: 'Down the warren',
    tip: '🥚 Pop down one burrow hole and up its partner to cross the lawn in a single hop',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [0, 2, 1],
      [2, 2, 17],
      [4, 1, 22],
      [4, 0, 25],
    ],
    burrows: [
      [
        [3, 2],
        [2, 0],
      ],
    ],
  },
  {
    name: 'A burrow in the tree',
    tip: '🥚 Use the underground burrow to reach the Golden Egg at the top of the tree on step 31',
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
    name: 'Deep warren',
    tip: '🥚 Every burrow tunnel must be traversed along the bunny’s route',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [6, 3, 1],
      [6, 6, 6],
      [1, 5, 16],
      [5, 0, 26],
      [2, 3, 34],
      [2, 0, 49],
    ],
    burrows: [
      [
        [6, 0],
        [4, 4],
      ],
    ],
  },
  {
    name: 'The Egg Tree',
    tip: '🥚 Hop through the underground tunnel to visit all 49 squares in order',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [6, 0, 1],
      [4, 6, 9],
      [0, 3, 16],
      [1, 2, 24],
      [4, 0, 34],
      [4, 1, 37],
      [5, 4, 41],
    ],
    burrows: [
      [
        [5, 1],
        [1, 1],
      ],
    ],
  },
];

export const FLAG: StoryPanel[] = [
  {
    name: 'Red and blue',
    tip: '🎆 Red and Blue bunnies each start at their own 1 egg and hop over their own color; white is shared',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [2, 2, 1],
      [0, 0, 5],
      [4, 2, 1],
    ],
    colours: ['rrrrb', 'rrrbb', 'wrrbb', 'bwwbb', 'bbbbb'],
  },
  {
    name: 'Two bunnies',
    tip: '🎆 Together the two bunnies must visit every square on the board, sharing the white border squares',
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
    name: 'The Star-Spangled Flag',
    tip: '🎆 Decide which bunny claims each white square so both trails fill the 7×7 lawn',
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
];

export const CORNUCOPIA: StoryPanel[] = [
  {
    name: 'First course',
    tip: '🥧 Finish every square in an outlined course before hopping across the border into the next',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [2, 4, 1],
      [0, 4, 25],
    ],
    portions: ['AABBB', 'AABBB', 'ABBBA', 'ABBBA', 'AAAAA'],
  },
  {
    name: 'Two courses',
    tip: '🥧 Once the bunny enters a course, it cannot leave until every square in that course is visited',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [4, 0, 1],
      [2, 2, 19],
      [3, 3, 25],
    ],
    portions: ['AAAAA', 'AAAAA', 'ABBBB', 'ABBBB', 'ABBBB'],
  },
  {
    name: 'The Cornucopia',
    tip: '🥧 Sweep through all three courses in unbroken stretches from start to finish',
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
];

export const ROSE: StoryPanel[] = [
  {
    name: 'Secret hop',
    tip: '💌 Letter eggs must be visited on the hop numbers shown in the message blanks to spell a word',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [0, 4, 1],
      [2, 1, 14],
      [4, 2, 21],
    ],
    letters: [
      [1, 4, 'H'],
      [4, 4, 'O'],
      [0, 0, 'P'],
    ],
    message: '10 23 5',
    word: 'HOP',
    blanks: [10, 23, 5],
  },
  {
    name: 'Morning dew',
    tip: '💌 Use the word spelled by the letter eggs to deduce which hop lands on each letter',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [[2, 2, 1]],
    letters: [
      [3, 1, 'D'],
      [1, 1, 'E'],
      [4, 4, 'W'],
    ],
    message: '23 19 5',
    word: 'DEW',
    blanks: [23, 19, 5],
  },
  {
    name: 'The Single Rose',
    tip: '💌 Hit all four letter eggs on their numbered steps to spell the secret word',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [2, 0, 1],
      [0, 5, 8],
      [4, 6, 21],
      [4, 0, 49],
    ],
    letters: [
      [6, 0, 'P'],
      [6, 4, 'I'],
      [1, 5, 'N'],
      [1, 1, 'K'],
    ],
    message: '43 27 15 35',
    word: 'PINK',
    blanks: [43, 27, 15, 35],
  },
];

export const GHOST: StoryPanel[] = [
  {
    name: 'Hidden rock',
    tip: '🎃 Shadowed (?) squares hide whether they are lawn or rock; the last egg gives the total route length',
    rows: ['####.', '#####', '#####', '#####', '#####'],
    given: [
      [2, 0, 1],
      [4, 2, 11],
      [2, 2, 13],
      [3, 3, 15],
      [0, 3, 24],
    ],
    dark: [
      [1, 2],
      [0, 2],
      [0, 4],
    ],
  },
  {
    name: 'Shadows on the lawn',
    tip: '🎃 Count steps to the final egg (24) to tell which shadowed squares are lawn and which is a rock',
    rows: ['#####', '#####', '.####', '#####', '#####'],
    given: [
      [4, 2, 1],
      [4, 3, 2],
      [2, 3, 8],
      [3, 0, 24],
    ],
    dark: [
      [4, 1],
      [4, 0],
      [2, 0],
    ],
  },
  {
    name: 'The Bedsheet Ghost',
    tip: '🎃 Step through the shadowed lawn squares and dodge the hidden rock to land on 48 at the end',
    rows: ['#######', '###.###', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [5, 1, 1],
      [1, 0, 8],
      [0, 0, 9],
      [4, 3, 20],
      [6, 4, 23],
      [1, 5, 37],
      [0, 3, 40],
      [2, 3, 48],
    ],
    dark: [
      [3, 4],
      [2, 4],
      [1, 3],
    ],
  },
];

export const GINGERBREAD: StoryPanel[] = [
  {
    name: 'Frosty trail',
    tip: '❄️ Inside the frosty frame, every hop stroke mirrors across the icy line',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [0, 4, 1],
      [1, 2, 10],
      [2, 0, 25],
    ],
    frame: { top: 1, left: 1, bottom: 4, right: 4, axis: 'h' },
  },
  {
    name: 'Mirror hops',
    tip: '❄️ The trail segments inside the frosty frame reflect across the axis, even when visited in a different order',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [0, 4, 1],
      [1, 2, 18],
      [0, 0, 25],
    ],
    frame: { top: 1, left: 0, bottom: 4, right: 3, axis: 'h' },
  },
  {
    name: 'The Gingerbread Man',
    tip: '❄️ Mirror your hops across the icy line inside the 6×6 frosty frame',
    rows: ['#######', '#######', '#######', '#######', '#######', '#######', '#######'],
    given: [
      [2, 6, 1],
      [3, 6, 2],
      [6, 3, 12],
      [2, 1, 28],
      [1, 1, 33],
    ],
    frame: { top: 1, left: 0, bottom: 6, right: 5, axis: 'h' },
  },
];

const mountPanel: Parameters<typeof run<StoryPanel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountHops(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag from the bunny through neighboring spots (up, down, left, right) to lay its trail; drag back to rub it out. Tap the bunny to take a hop back. Visit every spot once; a numbered egg must be that hop. The puzzles teach the rules; open a puzzle number to jump about.';

export const hutch = run({
  id: 'hutch',
  title: 'The Hutch',
  room: 'Easter',
  kind: 'intro',
  from: 'Hops · Easter, taught puzzle by puzzle',
  rules: CONTROLS,
  panels: HUTCH,
  mountPanel,
});

export const eggtree = run({
  id: 'eggtree',
  title: 'The Egg Tree',
  room: 'Easter',
  kind: 'home',
  from: 'Egg-Hunt Hops · Easter (Easter)',
  rules: `${CONTROLS} (Burrows: two burrows of a color are joined underground; popping down one and up the other is a hop. The last egg is the Golden Egg at the top.)`,
  panels: EGGTREE,
  mountPanel,
});

export const flag = run({
  id: 'flag',
  title: 'The Star-Spangled Flag',
  room: 'Easter',
  kind: 'relic',
  from: 'Patriotic Hops · Easter (Fourth of July)',
  rules: `${CONTROLS} (Twist: a red bunny and a blue bunny, each starting from its own 1 egg and stepping over its own color; white squares go to either.)`,
  panels: FLAG,
  mountPanel,
});

export const cornucopia = run({
  id: 'cornucopia',
  title: 'The Cornucopia',
  room: 'Easter',
  kind: 'relic',
  from: 'Portioned Hops · Easter (Thanksgiving)',
  rules: `${CONTROLS} (Twist: the board is outlined in courses; the bunny must finish each course before starting the next.)`,
  panels: CORNUCOPIA,
  mountPanel,
});

export const rose = run({
  id: 'rose',
  title: 'The Single Rose',
  room: 'Easter',
  kind: 'relic',
  from: "Love-Letter Hops · Easter (Valentine's)",
  rules: `${CONTROLS} (Twist: letter eggs must be visited on the hop numbers shown in the message blanks to spell a secret word.)`,
  panels: ROSE,
  mountPanel,
});

export const ghost = run({
  id: 'ghost',
  title: 'The Bedsheet Ghost',
  room: 'Easter',
  kind: 'relic',
  from: 'Spooky Hops · Easter (Halloween)',
  rules: `${CONTROLS} (Twist: shadowed ? squares hide whether they are lawn or rock; the last numbered egg gives the route's total length.)`,
  panels: GHOST,
  mountPanel,
});

export const gingerbread = run({
  id: 'gingerbread',
  title: 'The Gingerbread Man',
  room: 'Easter',
  kind: 'relic',
  from: 'Snowflake Hops · Easter (Christmas)',
  rules: `${CONTROLS} (Twist: inside the frosty frame, the trail's strokes mirror across the icy line.)`,
  panels: GINGERBREAD,
  mountPanel,
});
