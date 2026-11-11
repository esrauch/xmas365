/**
 * Christmas: the lights run (`revamp-centerpieces.md`). Lights panels in seven
 * runs: the intro run on the fairy lights, the Christmas Tree home-twist run
 * (`snow`: mirrored frosty frame), and the five relic runs (Golden Egg,
 * Pumpkin Pie, Love Letter, Ice Pop, and Cauldron). Every panel is ≤ 6×6 and
 * has a unique solution (`tests/puzzles/christmas.test.ts`).
 */
import { type LightsPanel, mountLights } from '../lightsBoard';
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
    rows: ['2e82ac', '2baead', '2eab85', '2b82ed', '2eec15', '2913a9'],
    plug: [5, 3],
    frame: {
      top: 0,
      left: 0,
      bottom: 3,
      right: 3,
      axis: 'h',
    },
    tip: '❄️ Snowflake: Inside the horizontal mirror frame, top and bottom partners rotate together.',
  },
  {
    name: 'A taller tree',
    rows: ['..4...', '.2f8..', '.2d4..', '46d7c.', '517d1.', '3a93a8'],
    plug: [5, 2],
    frame: {
      top: 3,
      left: 1,
      bottom: 5,
      right: 4,
      axis: 'v',
    },
    star: [0, 2],
    tip: '❄️ Snowflake: Use the vertical mirror frame at the base to light the tree-top star.',
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
    rows: ['6aae8', '52c54', '52b95', '7e86d', '13a91'],
    plug: [4, 2],
    eggs: [[2, 1, 13]],
    tip: '🥚 Egg-Hunt: Wind the 5×5 string so power reaches the egg in 13 wire steps.',
  },
  {
    name: 'The Golden Egg',
    rows: ['2c2eac', '6b8169', '52eabc', '7eb829', '552eac', '13ab81'],
    plug: [5, 3],
    eggs: [
      [1, 2, 9],
      [3, 3, 6],
    ],
    tip: '🥚 Egg-Hunt: Route the 6×6 string so both eggs glow green at steps 6 and 9.',
  },
];

export const PIE: LightsPanel[] = [
  {
    name: 'Two slices',
    rows: ['.42c.', '6bab8', '3ac6c', '2afd1', '.291.'],
    plug: [2, 2],
    slices: ['.BBB.', 'BBBBB', 'BB*AA', 'AAAAA', '.AAA.'],
    tip: '🥧 Portioned: No wire crosses a crust wall, so each pie slice is lit from *.',
  },
  {
    name: 'A bigger pie',
    rows: ['2c684', '47fa9', '393c4', '2ec79', '293b8'],
    plug: [2, 2],
    slices: ['BBBBB', 'BBBBB', 'BB*AA', 'AAAAA', 'AAAAA'],
    tip: '🥧 Portioned: Keep every wire inside its own slice once it leaves the center plug.',
  },
  {
    name: 'The Pumpkin Pie',
    rows: ['2e86ac', '6bad45', '544179', '3fd47c', '2d17d5', '2b8111'],
    plug: [0, 3],
    slices: ['BBB*AA', 'BBBBAA', 'BBBBAA', 'BBBAAA', 'BBBAAA', 'BBBAAA'],
    tip: '🥧 Portioned: Feed both halves of the 6×6 pie from * without crossing the crust.',
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
    rows: ['4686ac', '57ad45', '3b8179', '42ec78', '3a953c', '2aaba9'],
    plug: [5, 3],
    letters: [
      [0, 5, 'G'],
      [1, 4, 'O'],
      [0, 3, 'L'],
      [2, 2, 'D'],
    ],
    message: '9 7 11 16',
    word: 'GOLD',
    blanks: [9, 7, 11, 16],
    tip: '💌 Love-Letter: Spell GOLD across the 6×6 card at distances 9, 7, 11, and 16.',
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
    rows: ['2c46a8', '6d3d44', '178579', '452b94', '3be845', '2abab9'],
    plug: [0, 0],
    bluePlug: [3, 3],
    colours: ['rrbbbb', 'rrwbbb', 'rrwbbw', 'rwbbbr', 'rrrrrr', 'rrrrrr'],
    tip: '🎆 Patriotic: Light the 6×6 Ice Pop from both plugs without letting Red and Blue touch.',
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
    rows: ['6a86c4', '3ac53d', '46fd29', '7957e8', '3c153c', '292b81'],
    plug: [5, 3],
    dark: [
      [0, 2],
      [4, 0],
      [3, 2],
    ],
    tip: '🎃 Spooky: Wire the 6×6 cauldron and deduce all three hidden ? tiles.',
  },
];

const mountPanel: Parameters<typeof run<LightsPanel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountLights(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Tap a piece to turn it a quarter clockwise (always clockwise; four taps go all the way round). The puzzles teach the rules; open a puzzle number to jump about.';

export const fairylights = run({
  id: 'fairylights',
  title: 'Lights',
  room: 'Christmas',
  kind: 'intro',
  from: 'Lights · Christmas, taught puzzle by puzzle',
  rules: `${CONTROLS} (Rules: turn the pieces so the power from the plug reaches every square, with no loose wire ends.)`,
  panels: WARMUP,
  mountPanel,
});

export const tree = run({
  id: 'tree',
  title: 'Snowflake Lights',
  room: 'Christmas',
  kind: 'home',
  from: 'Snowflake Lights · Christmas (Christmas)',
  rules: `${CONTROLS} (Twist: inside the frosty frame, pieces are mirrored across the icy line and turn together.)`,
  panels: TREE,
  mountPanel,
});

export const goldenegg = run({
  id: 'goldenegg',
  title: 'Egg-Hunt Lights',
  room: 'Christmas',
  kind: 'relic',
  from: 'Egg-Hunt Lights · Christmas (Easter)',
  rules: `${CONTROLS} (Twist: the power must reach each numbered egg in exactly that many steps from the plug, counting squares along the wire.)`,
  panels: EGG,
  mountPanel,
});

export const pumpkinpie = run({
  id: 'pumpkinpie',
  title: 'Portioned Lights',
  room: 'Christmas',
  kind: 'relic',
  from: 'Portioned Lights · Christmas (Thanksgiving)',
  rules: `${CONTROLS} (Twist: no wire may cross a thick crust line between two slices, so each slice is lit from the middle, across its dotted edge.)`,
  panels: PIE,
  mountPanel,
});

export const loveletter = run({
  id: 'loveletter',
  title: 'Love-Letter Lights',
  room: 'Christmas',
  kind: 'relic',
  from: "Love-Letter Lights · Christmas (Valentine's)",
  rules: `${CONTROLS} (Twist: each letter bulb counts wire steps from the plug, filling the numbered blanks above the board to spell a word.)`,
  panels: LOVELETTER,
  mountPanel,
});

export const icepop = run({
  id: 'icepop',
  title: 'Patriotic Lights',
  room: 'Christmas',
  kind: 'relic',
  from: 'Patriotic Lights · Christmas (Fourth of July)',
  rules: `${CONTROLS} (Twist: the Red plug powers red tiles and the Blue plug powers blue tiles; white tiles can join either plug, but red and blue strings may never connect.)`,
  panels: ICEPOP,
  mountPanel,
});

export const cauldron = run({
  id: 'cauldron',
  title: 'Spooky Lights',
  room: 'Christmas',
  kind: 'relic',
  from: 'Spooky Lights · Christmas (Halloween)',
  rules: `${CONTROLS} (Twist: a dark ? square hides its wire shape and turns blind; deduce how it connects from its neighbors.)`,
  panels: CAULDRON,
  mountPanel,
});
