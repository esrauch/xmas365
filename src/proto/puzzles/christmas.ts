/**
 * Christmas: the lights run (`revamp-centerpieces.md`). Net panels in seven
 * runs: the intro run on the fairy lights, the Christmas Tree home-twist run
 * (`snow`: mirrored frosty frame), and the five relic runs (Golden Egg,
 * Pumpkin Pie, Love Letter, Ice Pop, and Cauldron). Every panel is ≤ 7×7 and
 * has a unique solution (`tests/puzzles/christmas.test.ts`).
 */
import { type LightsPanel, mountLights } from '../netBoard';
import { run } from '../run';

export const WARMUP: LightsPanel[] = [
  {
    name: 'One turn',
    rows: ['2a8'],
    plug: [0, 0],
    start: ['258'],
    tip: 'Tap the middle wire to turn it so power reaches the end.',
  },
  {
    name: 'A branch',
    rows: ['2ec', '291'],
    plug: [1, 1],
    tip: 'Turn the corners and T-junction so every tile lights up.',
  },
  {
    name: 'No loose ends',
    rows: ['6a8', '7ac', '129'],
    plug: [2, 1],
    tip: 'Every wire end must connect to a neighbor—no dead ends pointing off or into blank sides.',
  },
  {
    name: 'Everything lit',
    rows: ['444', '3b9'],
    plug: [1, 0],
    tip: 'Power from the plug must reach every tile with no closed loops.',
  },
  {
    name: 'A first string',
    rows: ['682c', '7aad', '7a81', '3aa8'],
    plug: [3, 1],
    tip: 'Light the whole 4×4 string from the plug.',
  },
];

export const TREE: LightsPanel[] = [
  {
    name: 'Frosty pane',
    rows: ['2eae8', '6d47c', '17d15', '45545', '39391'],
    plug: [4, 2],
    frame: {
      top: 2,
      left: 0,
      bottom: 4,
      right: 3,
      axis: 'v',
    },
    tip: '❄️ Snowflake: Inside the frosty frame, mirror partners turn together.',
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
    tip: '❄️ Snowflake: Turn the mirrored lower branches to light the tree-top star.',
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
    tip: '❄️ Snowflake: Use the vertical mirror frame at the base to guide the upper boughs.',
  },
  {
    name: 'The frosty wreath',
    rows: ['6c4446c', '517fd15', '3a917a9', '2ac47ac', '447fd45', '3d1517d', '2ba9291'],
    plug: [6, 3],
    frame: {
      top: 1,
      left: 1,
      bottom: 4,
      right: 6,
      axis: 'h',
    },
    tip: '❄️ Snowflake: Tiles inside the horizontal frosty frame reflect across the icy line.',
  },
  {
    name: 'The Christmas Tree',
    rows: ['2c446ac', '6bd7bc1', '38552bc', '2e93e85', '6beeb81', '38552e8', '2a93ab8'],
    plug: [6, 3],
    frame: {
      top: 1,
      left: 1,
      bottom: 6,
      right: 4,
      axis: 'v',
    },
    tip: '❄️ Snowflake: Light the full 7×7 Christmas Tree with mirrored snowflake boughs.',
  },
];

export const EGG: LightsPanel[] = [
  {
    name: 'A numbered egg',
    rows: ['.2ac.', '2ead4', '6d2bd', '13e81', '.2b8.'],
    plug: [4, 2],
    eggs: [[2, 2, 8]],
    tip: '🥚 Egg-Hunt: Power must reach each numbered egg in that exact number of wire steps.',
  },
  {
    name: 'A clutch of eggs',
    rows: ['..2c4..', '.42bd4.', '6be83bc', '52b86c5', '3c2e939', '.3ad68.', '..2b9..'],
    plug: [6, 3],
    eggs: [
      [3, 3, 11],
      [1, 2, 14],
    ],
    tip: '🥚 Egg-Hunt: Route the wire so both eggs glow green at their exact step counts.',
  },
  {
    name: 'The Golden Egg',
    rows: ['686ac6c', '56b83d5', '392ea95', '6c69469', '53b853c', '542e96d', '13aba91'],
    plug: [6, 3],
    eggs: [
      [1, 3, 19],
      [4, 3, 20],
    ],
    tip: '🥚 Egg-Hunt: Wind the 7×7 string to hit step 19 and step 20 on the nose.',
  },
];

export const PIE: LightsPanel[] = [
  {
    name: 'Two slices',
    rows: ['.42c.', '6bab8', '3ac6c', '2afd1', '.291.'],
    plug: [2, 2],
    slices: ['.BBB.', 'BBBBB', 'BB*AA', 'AAAAA', '.AAA.'],
    tip: '🥧 Portioned: Each pie slice gets one wire from *, and no wire crosses a crust wall.',
  },
  {
    name: 'A bigger pie',
    rows: ['..684..', '.2d47c.', '46fd154', '3d1547d', '2d47fd1', '.3d151.', '..129..'],
    plug: [3, 3],
    slices: ['..BBA..', '.BBBAA.', 'BBBBAAA', 'BBB*AAA', 'BBBAAAA', '.BBAAA.', '..BAA..'],
    tip: '🥧 Portioned: Keep every wire inside its own slice once it leaves the center plug.',
  },
  {
    name: 'The Pumpkin Pie',
    rows: ['6e842ec', '13ed415', '6a917e9', '3c6ad54', '6bd413d', '3c17ead', '2b81129'],
    plug: [3, 3],
    slices: ['BBBBAAA', 'BBBBAAA', 'BBBBAAA', 'BBB*AAA', 'BBBAAAA', 'BBBAAAA', 'BBBAAAA'],
    tip: '🥧 Portioned: Feed both halves of the 7×7 pie from the center without crossing the crust.',
  },
];

export const LOVELETTER: LightsPanel[] = [
  {
    name: 'Crimson note',
    rows: ['6c2e8', '53e94', '12be9', '6e83c', '13aa9'],
    plug: [4, 2],
    letters: [
      [0, 2, 'R'],
      [1, 1, 'E'],
      [3, 2, 'D'],
    ],
    message: '10 8 3',
    word: 'RED',
    blanks: [10, 8, 3],
    tip: '💌 Love-Letter: Route the wire so letter bulbs sit at step distances that spell the word.',
  },
  {
    name: 'Frosty card',
    rows: ['6c2e8', '512bc', '7ae85', '5452d', '13ba9'],
    plug: [4, 2],
    letters: [
      [0, 4, 'I'],
      [1, 3, 'C'],
      [1, 2, 'Y'],
    ],
    message: '8 6 7',
    word: 'ICY',
    blanks: [8, 6, 7],
    tip: '💌 Love-Letter: Place I, C, and Y at wire-step distances 8, 6, and 7 from the plug.',
  },
  {
    name: 'The Love Letter',
    rows: ['42aec6c', '3ae97d1', '2eb813c', '6d2eaa9', '516b82c', '3c52ee9', '293a938'],
    plug: [6, 3],
    letters: [
      [4, 4, 'S'],
      [3, 2, 'N'],
      [6, 1, 'O'],
      [2, 1, 'W'],
    ],
    message: '5 6 24 18',
    word: 'SNOW',
    blanks: [5, 6, 24, 18],
    tip: '💌 Love-Letter: Spell SNOW across the 7×7 card at distances 5, 6, 24, and 18.',
  },
];

export const ICEPOP: LightsPanel[] = [
  {
    name: 'Two plugs',
    rows: ['2c684', '6bba9', '12eec', '2c511', '2bba8'],
    plug: [1, 1],
    bluePlug: [3, 4],
    colours: ['rrrrr', 'rrrrr', 'rbbww', 'wbbbb', 'bbbbb'],
    tip: '🎆 Patriotic: Red and Blue plugs power their own colors; white wires can join either.',
  },
  {
    name: 'Twin stripes',
    rows: ['6c6a8', '1796c', '6d451', '51794', '12ba9'],
    plug: [3, 0],
    bluePlug: [4, 1],
    colours: ['rrrrr', 'rrrwb', 'rwbbb', 'rrbbb', 'wbbbb'],
    tip: '🎆 Patriotic: Partition the white border tiles between the Red and Blue strings.',
  },
  {
    name: 'The Ice Pop',
    rows: ['6aac468', '3c2bbbc', '43c2ec1', '56d297c', '7956a95', '3817869', '2aab838'],
    plug: [1, 1],
    bluePlug: [3, 3],
    colours: ['rrrrrrr', 'rrrwrrr', 'rrrbbbr', 'rrrbbbb', 'rrrwbbb', 'rrwbbbb', 'wbbbbbb'],
    tip: '🎆 Patriotic: Light the 7×7 Ice Pop from both plugs without letting Red and Blue touch.',
  },
];

export const CAULDRON: LightsPanel[] = [
  {
    name: 'Shadow bulbs',
    rows: ['2ac44', '44579', '7bfd4', '7853d', '12b81'],
    plug: [2, 2],
    dark: [
      [3, 0],
      [1, 3],
    ],
    tip: '🎃 Spooky: A ? square hides its wire shape—deduce it from the surrounding wires.',
  },
  {
    name: 'Bubbling brew',
    rows: ['2c6a8', '6bfac', '16fc1', '69178', '3a838'],
    plug: [2, 2],
    dark: [
      [0, 1],
      [4, 3],
    ],
    tip: '🎃 Spooky: Orient every visible neighbor first to lock in both dark ? squares.',
  },
  {
    name: 'The Cauldron',
    rows: ['2ec46ec', '697b955', '56d6811', '153fc6c', '4545795', '3d39169', '292aab8'],
    plug: [3, 3],
    dark: [
      [5, 4],
      [1, 0],
      [0, 4],
    ],
    tip: '🎃 Spooky: Wire the 7×7 cauldron and deduce all three hidden ? tiles.',
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
  kind: 'intro',
  from: 'Lights · Christmas, taught puzzle by puzzle',
  rules: `${CONTROLS} (Rules: turn the pieces so the power from the plug reaches every square, with no loose wire ends.)`,
  panels: WARMUP,
  mountPanel,
});

export const tree = run({
  id: 'tree',
  title: 'The Christmas Tree',
  room: 'Christmas',
  kind: 'home',
  from: 'Snowflake Lights · Christmas (Christmas)',
  rules: `${CONTROLS} (Twist: inside the frosty frame, pieces are mirrored across the icy line and turn together.)`,
  panels: TREE,
  mountPanel,
});

export const goldenegg = run({
  id: 'goldenegg',
  title: 'The Golden Egg',
  room: 'Christmas',
  kind: 'relic',
  from: 'Egg-Hunt Lights · Christmas (Easter)',
  rules: `${CONTROLS} (Twist: the power must reach each numbered egg in exactly that many steps from the plug, counting squares along the wire.)`,
  panels: EGG,
  mountPanel,
});

export const pumpkinpie = run({
  id: 'pumpkinpie',
  title: 'The Pumpkin Pie',
  room: 'Christmas',
  kind: 'relic',
  from: 'Portioned Lights · Christmas (Thanksgiving)',
  rules: `${CONTROLS} (Twist: each slice gets exactly one wire from the middle, across a dotted edge, and no wire may cross a thick crust line between two slices. Each slice shows how many wires it gets from the middle so far.)`,
  panels: PIE,
  mountPanel,
});

export const loveletter = run({
  id: 'loveletter',
  title: 'The Love Letter',
  room: 'Christmas',
  kind: 'relic',
  from: "Love-Letter Lights · Christmas (Valentine's)",
  rules: `${CONTROLS} (Twist: each letter bulb counts wire steps from the plug, filling the numbered blanks above the board to spell a word.)`,
  panels: LOVELETTER,
  mountPanel,
});

export const icepop = run({
  id: 'icepop',
  title: 'The Ice Pop',
  room: 'Christmas',
  kind: 'relic',
  from: 'Patriotic Lights · Christmas (Fourth of July)',
  rules: `${CONTROLS} (Twist: the Red plug powers red tiles and the Blue plug powers blue tiles; white tiles can join either plug, but red and blue strings may never connect.)`,
  panels: ICEPOP,
  mountPanel,
});

export const cauldron = run({
  id: 'cauldron',
  title: 'The Cauldron',
  room: 'Christmas',
  kind: 'relic',
  from: 'Spooky Lights · Christmas (Halloween)',
  rules: `${CONTROLS} (Twist: a dark ? square hides its wire shape and turns blind; deduce how it connects from its neighbors.)`,
  panels: CAULDRON,
  mountPanel,
});
