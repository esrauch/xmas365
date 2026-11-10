/**
 * Easter: the bunny-hop room (revamp-centerpieces.md).
 * Bunny Hops (Numbrix) panels in seven runs:
 * - Intro: The Hutch (`hutch`, 5 panels, <=4x4)
 * - Home twist: The Egg Tree (`eggtree`, 5 panels, <=6x6, `burrows`)
 * - 5 Relic runs (3 panels each, 4x4 / 5x5 / 6x6):
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
    tip: '🥚 Grey rocks are off-limits; a numbered egg must be visited on that exact hop number',
    rows: ['####', '##.#', '.###'],
    rocks: [
      [1, 2],
      [2, 0],
    ],
    given: [
      [1, 0, 1],
      [2, 3, 5],
    ],
  },
  {
    name: 'A first real hunt',
    tip: '🥚 Plan one trail around the rock that visits all 15 lawn squares and hits each numbered egg on step',
    rows: ['###.', '####', '####', '####'],
    rocks: [[0, 3]],
    given: [
      [1, 3, 1],
      [1, 1, 7],
      [3, 1, 15],
    ],
  },
];

export const EGGTREE: StoryPanel[] = [
  {
    name: 'First burrow',
    tip: '🥚 Matching burrow holes connect underground as a single hop between their two squares',
    rows: ['####', '####', '####', '##.#'],
    rocks: [[3, 2]],
    given: [[2, 0, 1]],
    burrows: [
      [
        [1, 1],
        [2, 3],
      ],
    ],
  },
  {
    name: 'Down the warren',
    tip: '🥚 Pop down one burrow hole and up its partner to cross the lawn in a single hop',
    rows: ['####', '####', '####', '.###'],
    rocks: [[3, 0]],
    given: [
      [0, 0, 1],
      [2, 2, 9],
      [0, 1, 14],
    ],
    burrows: [
      [
        [1, 2],
        [3, 3],
      ],
    ],
  },
  {
    name: 'A burrow in the tree',
    tip: '🥚 Use the underground burrow to reach the Golden Egg at the top of the tree on step 17',
    rows: ['..#..', '.###.', '.###.', '#####', '#####'],
    given: [
      [3, 3, 1],
      [3, 1, 9],
      [0, 2, 17],
    ],
    burrows: [
      [
        [2, 3],
        [1, 1],
      ],
    ],
    golden: [0, 2],
  },
  {
    name: 'Deep warren',
    tip: '🥚 Every burrow tunnel must be traversed along the bunny’s route; grey rocks are off-limits',
    rows: ['#####', '#####', '.#.##', '#####', '#####'],
    rocks: [
      [2, 0],
      [2, 2],
    ],
    given: [
      [2, 1, 1],
      [1, 3, 10],
      [0, 1, 15],
      [0, 4, 22],
    ],
    burrows: [
      [
        [4, 3],
        [0, 2],
      ],
    ],
  },
  {
    name: 'The Egg Tree',
    tip: '🥚 Hop through the underground tunnel to visit all 32 lawn squares in order',
    rows: ['#..###', '######', '######', '######', '#.#.##', '######'],
    rocks: [
      [0, 1],
      [0, 2],
      [4, 1],
      [4, 3],
    ],
    given: [
      [0, 0, 1],
      [2, 3, 16],
      [3, 5, 32],
    ],
    burrows: [
      [
        [5, 3],
        [1, 5],
      ],
    ],
  },
];

export const FLAG: StoryPanel[] = [
  {
    name: 'Red and blue',
    tip: '🎆 Red and Blue bunnies each start at their own 1 egg and hop over their own color; white is shared',
    rows: ['####', '####', '####', '####'],
    given: [
      [2, 1, 1],
      [1, 3, 1],
    ],
    colours: ['bbbb', 'bwbb', 'wrbr', 'rrrr'],
  },
  {
    name: 'Two bunnies',
    tip: '🎆 Together the two bunnies must visit every square on the board, sharing the white border squares',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [1, 1, 1],
      [3, 4, 14],
      [2, 2, 1],
      [4, 1, 6],
      [4, 2, 9],
    ],
    colours: ['rrrrr', 'wrrrr', 'bwbwr', 'bbbrr', 'bbbrr'],
  },
  {
    name: 'The Star-Spangled Flag',
    tip: '🎆 Decide which bunny claims each white square so both trails fill the 6×6 lawn',
    rows: ['######', '######', '######', '######', '######', '######'],
    given: [
      [3, 3, 1],
      [4, 2, 3],
      [3, 4, 6],
      [3, 5, 7],
      [0, 1, 1],
      [0, 4, 10],
    ],
    colours: ['bbbbbb', 'bbwwwb', 'wrrrrb', 'rrrrrr', 'rrrrrr', 'rrrrrr'],
  },
];

export const CORNUCOPIA: StoryPanel[] = [
  {
    name: 'First course',
    tip: '🥧 Finish every square in an outlined course before hopping across the border into the next',
    rows: ['####', '####', '####', '####'],
    given: [
      [0, 0, 1],
      [2, 2, 13],
      [2, 3, 14],
    ],
    portions: ['AABB', 'AABB', 'AABB', 'AABB'],
  },
  {
    name: 'Two courses',
    tip: '🥧 Once the bunny enters a course, it cannot leave until every square in that course is visited',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [1, 1, 1],
      [2, 3, 18],
    ],
    portions: ['BBBBB', 'BABBB', 'BABBA', 'AAAAA', 'AAAAA'],
  },
  {
    name: 'The Cornucopia',
    tip: '🥧 Sweep through all three courses in unbroken stretches from start to finish',
    rows: ['######', '######', '######', '######', '######', '######'],
    given: [
      [5, 2, 1],
      [4, 2, 6],
      [5, 4, 29],
      [5, 3, 36],
    ],
    portions: ['ABBBBB', 'ABBBBB', 'ABBCCC', 'AAACCC', 'AAACCC', 'AAACCC'],
  },
];

export const ROSE: StoryPanel[] = [
  {
    name: 'Secret hop',
    tip: '💌 Letter eggs must be visited on the hop numbers shown in the message blanks to spell a word',
    rows: ['####', '####', '####', '#.##'],
    rocks: [[3, 1]],
    given: [[2, 3, 1]],
    letters: [
      [0, 0, 'D'],
      [1, 3, 'E'],
      [1, 1, 'W'],
    ],
    message: '10 6 12',
    word: 'DEW',
    blanks: [10, 6, 12],
  },
  {
    name: 'Morning dew',
    tip: '💌 Use the word spelled by the letter eggs to deduce which hop lands on each letter',
    rows: ['#####', '#####', '#####', '#####', '####.'],
    rocks: [[4, 4]],
    given: [
      [2, 1, 1],
      [2, 2, 24],
    ],
    letters: [
      [3, 1, 'J'],
      [2, 3, 'O'],
      [4, 0, 'Y'],
    ],
    message: '10 17 8',
    word: 'JOY',
    blanks: [10, 17, 8],
  },
  {
    name: 'The Single Rose',
    tip: '💌 Hit all four letter eggs on their numbered steps to spell the secret word',
    rows: ['######', '######', '######', '######', '#.##.#', '######'],
    rocks: [
      [4, 1],
      [4, 4],
    ],
    given: [[4, 2, 1]],
    letters: [
      [1, 2, 'F'],
      [1, 3, 'E'],
      [0, 4, 'R'],
      [3, 4, 'N'],
    ],
    message: '8 17 19 4',
    word: 'FERN',
    blanks: [8, 17, 19, 4],
  },
];

export const GHOST: StoryPanel[] = [
  {
    name: 'Hidden rock',
    tip: '🎃 Shadowed (?) squares hide whether they are lawn or rock; the last egg gives the total route length',
    rows: ['..##', '####', '####', '####'],
    rocks: [[0, 1]],
    given: [
      [3, 3, 1],
      [3, 0, 10],
      [1, 0, 14],
    ],
    dark: [
      [2, 1],
      [1, 1],
      [0, 0],
    ],
  },
  {
    name: 'Shadows on the lawn',
    tip: '🎃 Count steps to the final egg (22) to tell which shadowed squares are lawn and which is a rock',
    rows: ['.####', '.####', '#####', '#####', '####.'],
    rocks: [
      [1, 0],
      [4, 4],
    ],
    given: [
      [3, 1, 1],
      [2, 4, 9],
      [2, 0, 17],
      [0, 1, 22],
    ],
    dark: [
      [1, 2],
      [0, 2],
      [0, 0],
    ],
  },
  {
    name: 'The Bedsheet Ghost',
    tip: '🎃 Step through the shadowed squares, dodge the hidden rock and the grey ones, and land on 32 at the end',
    rows: ['######', '######', '####.#', '######', '#.####', '####..'],
    rocks: [
      [4, 1],
      [5, 4],
      [5, 5],
    ],
    given: [
      [4, 2, 1],
      [0, 1, 10],
      [5, 3, 21],
      [1, 4, 32],
    ],
    dark: [
      [0, 5],
      [0, 4],
      [2, 4],
    ],
  },
];

export const GINGERBREAD: StoryPanel[] = [
  {
    name: 'Frosty trail',
    tip: '❄️ Inside the frosty frame, every hop stroke mirrors across the icy line',
    rows: ['####', '####', '####', '####'],
    given: [
      [3, 2, 1],
      [0, 0, 12],
    ],
    frame: { top: 0, left: 0, bottom: 2, right: 3, axis: 'v' },
  },
  {
    name: 'Mirror hops',
    tip: '❄️ The trail segments inside the frosty frame reflect across the axis, even when visited in a different order',
    rows: ['#####', '#####', '#####', '#####', '#####'],
    given: [
      [0, 2, 1],
      [0, 0, 13],
      [4, 4, 25],
    ],
    frame: { top: 1, left: 1, bottom: 4, right: 4, axis: 'h' },
  },
  {
    name: 'The Gingerbread Man',
    tip: '❄️ Mirror your hops across the icy line inside the 4×6 frosty frame',
    rows: ['######', '######', '######', '######', '######', '######'],
    given: [
      [5, 0, 1],
      [4, 5, 7],
      [3, 1, 14],
      [1, 2, 27],
      [0, 4, 32],
    ],
    frame: { top: 1, left: 0, bottom: 4, right: 5, axis: 'h' },
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
