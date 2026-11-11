/**
 * Thanksgiving: the carving run (`revamp-centerpieces.md`). Carving panels in
 * seven runs: the intro run on the bread board, the Feast home-twist run
 * (`cuts`: fences no portion may cross), and the five relic runs (Hot Dog,
 * Stocking, Heart Locket, Jelly Bean Jar, and Candy Corn). Every panel is
 * ≤ 7×7 and has a unique solution (`tests/puzzles/thanksgiving.test.ts`).
 */
import { type Panel } from '../../gen/carving';
import { run } from '../run';
import { mountCarving } from '../carvingBoard';

export const WARMUP: Panel[] = [
  {
    name: 'One portion',
    rows: ['4 .', '. .'],
    tip: 'Drag across all four squares to carve one rectangle of size 4.',
  },
  {
    name: 'Size counts',
    rows: ['. 4 .', '. . 2'],
    tip: 'Each rectangle holds one number equal to its area (width × height).',
  },
  {
    name: 'Shape matters',
    rows: ['4 . . .', '4 . . .'],
    tip: 'A 4 can be 2×2 or 1×4—pick the shapes that cover every square.',
  },
  {
    name: 'Every square',
    rows: ['6 . . 1', '. . . .', '. . . 2', '. 6 . 1'],
    tip: 'Tap an empty square with a 1 to carve a single-square portion.',
  },
  {
    name: 'A first board',
    rows: ['3 2 . . .', '. . . . .', '. . . . 6', '. . 8 2 .', '2 . . 2 .'],
    tip: 'Carve the whole 5×5 bread board into non-overlapping rectangles.',
  },
];

export const FEAST: Panel[] = [
  {
    name: 'First cuts',
    rows: ['3 . . . 4', '. . . 2 .', '. . 6 . .', '2 . 4 2 .', '. . . . 2'],
    walls: [[0, 0, 'v']],
    tip: '🥧 Portioned: No carved rectangle may cross a thick fence line.',
  },
  {
    name: 'Side dishes',
    rows: ['. . 2 . .', '. 4 . . 4', '. 2 2 . .', '2 . . 3 .', '2 . 2 . 2'],
    walls: [[2, 0, 'h']],
    tip: '🥧 Portioned: Use the fence boundary to orient the surrounding portions.',
  },
  {
    name: 'Table divider',
    rows: ['. . 6 . .', '. 4 . . .', '. . . . .', '4 . 6 . .', '. 5 . . .'],
    walls: [[1, 0, 'h']],
    tip: '🥧 Portioned: The horizontal fence forces the top-left 4 to stretch right.',
  },
  {
    name: 'Carving around fences',
    rows: [
      '4 . 2 . . . .',
      '. 2 . . . . 8',
      '. . . 6 . . .',
      '. . . . . . .',
      '. 6 . 3 . . 3',
      '2 . . . 6 . .',
      '. 3 . 2 . 2 .',
    ],
    walls: [
      [4, 1, 'h'],
      [0, 1, 'h'],
    ],
    tip: '🥧 Portioned: Carve the 7×7 table without crossing either horizontal fence.',
  },
  {
    name: 'The Feast',
    rows: [
      '. 6 . . . . .',
      '. . . . . 2 2',
      '. 8 . . . . .',
      '3 . . . . . 2',
      '. . 3 . 6 2 3',
      '. 3 . 4 . 2 .',
      '3 . . . . . .',
    ],
    walls: [
      [4, 1, 'v'],
      [5, 0, 'h'],
    ],
    tip: '🥧 Portioned: Respect every fence line to serve the full Thanksgiving Feast.',
  },
];

export const HOTDOG: Panel[] = [
  {
    name: 'Red, white and blue',
    rows: ['. . 2 . .', '. 6 . . 4', '. . . 6 .', '. . . . .', '. 4 . 3 .'],
    colours: ['..rb.', 'b....', '.....', '.....', '.r.b.'],
    tip: '🎆 Patriotic: Same-colored rectangles may never share an edge.',
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
    tip: '🎆 Patriotic: Plain white portions can touch anything; red-red and blue-blue cannot touch.',
  },
  {
    name: 'The cookout',
    rows: [
      '. . . 8 . . 6',
      '. . . . . . .',
      '. . 3 . 2 2 .',
      '2 . 3 . . . .',
      '. . . . 3 . 4',
      '. 4 . 6 . . .',
      '2 . . . . . 4',
    ],
    colours: ['......b', '.......', '.r....r', '..b....', '.......', 'b...rb.', 'r......'],
    tip: '🎆 Patriotic: Keep same-colored portions separated across the 7×7 grill.',
  },
];

export const STOCKING: Panel[] = [
  {
    name: 'A frosty window',
    rows: ['. . . 3 .', '6 . . . 2', '. . . . .', '. 2 . . 3', '2 . 5 2 .'],
    frame: {
      top: 1,
      left: 1,
      bottom: 4,
      right: 3,
      axis: 'h',
    },
    tip: '❄️ Snowflake: Inside the frosty frame, cuts between portions mirror across the icy line.',
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
    tip: '❄️ Snowflake: Any cut drawn on one side of the frame’s axis needs a matching cut opposite.',
  },
  {
    name: 'A full stocking',
    rows: [
      '. . 4 . 7 . .',
      '. 6 . . . . .',
      '. . 2 . . . .',
      '. . . 2 . . 8',
      '. . 6 . . 4 .',
      '8 . . . . . .',
      '. . . . . . 2',
    ],
    frame: {
      top: 2,
      left: 2,
      bottom: 5,
      right: 6,
      axis: 'h',
    },
    tip: '❄️ Snowflake: Mirror the cuts inside the frosty frame to pack the 7×7 stocking.',
  },
];

export const LOCKET: Panel[] = [
  {
    name: 'Sweet treat',
    rows: ['S . . W .', '. . . . .', '6 . W E .', '. . . . .', '. . 2 . T'],
    sizeLetters: ' WET S   ',
    message: '62334',
    tip: '💌 Love-Letter: Same letter = same rectangle area; different letters = different areas.',
  },
  {
    name: 'Stuffing',
    rows: ['. . F . .', '. T T . .', '. . U . T', 'S . . T T', '. . F . .'],
    sizeLetters: ' TFUS    ',
    message: '52433',
    tip: '💌 Love-Letter: The numbered blanks spell a word: unscramble the clue letters into it to learn each letter’s area.',
  },
  {
    name: 'The Heart Locket',
    rows: [
      '. . . . . A .',
      '. . . . R T 3',
      'E . H . . . .',
      'A . . . . . .',
      '. E . . E . .',
      '. . A T . . .',
      '. . . . 3 . .',
    ],
    sizeLetters: ' AT HE R ',
    message: '56283',
    tip: '💌 Love-Letter: Unscramble the letters on the 7×7 platter into the message first, then carve the board knowing their areas.',
  },
];

export const JELLYBEANS: Panel[] = [
  {
    name: 'Fair shares',
    rows: ['. 🥕 6 . .', '🥚 . 🥕 🥚 .', '🥚 . 🥚 . 🥕', '4 🥕 . . .', '. . . 🥚 🥕'],
    tip: '🥚 Egg-Hunt: Every carved rectangle must contain one 🥚 and one 🥕.',
  },
  {
    name: 'Spring platter',
    rows: ['. 🥚 🥕 4 🥕', '. . . . 🥚', '🥚 3 🥕 🥕 .', '. . . 🥚 🥚', '. 🥕 🥚 . 🥕'],
    tip: '🥚 Egg-Hunt: Even unnumbered portions must collect one of each treat!',
  },
  {
    name: 'The Jelly Bean Jar',
    rows: [
      '🥚 . 🍫 . 🥕 7 .',
      '. . 🍫 🥕 🥕 . 🍫',
      '. 🥚 . 🥚 . 🥕 .',
      '🍫 . 🍫 🥕 🥚 . 🥚',
      '🥚 🥕 . 🥚 🍫 . .',
      '🥕 . 🥚 . 🥕 🍫 .',
      '. 🍫 🥚 . 🥕 🍫 .',
    ],
    tip: '🥚 Egg-Hunt: Give every portion on the 7×7 board one 🥚, one 🥕, and one 🍫.',
  },
];

export const CANDYCORN: Panel[] = [
  {
    name: 'Hidden portion',
    rows: ['. . 2 . 3', '4 . . 3 .', '. ? . . .', '. . 3 . .', '. . 2 . 2'],
    tip: '🎃 Spooky: A ? clue stands for a rectangle of any area.',
  },
  {
    name: 'Shadow platter',
    rows: ['. 3 . . .', '3 . . . 3', '. 6 . . .', '2 . . . ?', '2 . 4 . .'],
    tip: '🎃 Spooky: Carve the numbered rectangles first to see what space the ? portion must fill.',
  },
  {
    name: 'The Candy Corn',
    rows: [
      '. . . . . . .',
      '. . 6 . . 8 .',
      '. . . . . . 6',
      '. 6 . . . . .',
      '. . 2 ? . ? .',
      '. 4 . . . 2 .',
      '. . . . . . 7',
    ],
    tip: '🎃 Spooky: Deduce the areas of both ? portions on the 7×7 harvest table.',
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountCarving(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag from one square to another to carve the rectangle between them (it replaces any portions in its way); tap a portion to lift it off; tap an empty square for a one-square portion. The puzzles teach the rules; open a puzzle number to jump about.';

export const breadboard = run({
  id: 'breadboard',
  title: 'Carving',
  room: 'Thanksgiving',
  kind: 'intro',
  from: 'Carving · Thanksgiving, taught puzzle by puzzle',
  rules: `${CONTROLS} (Rules: carve the board into rectangles; each holds exactly one number, and the number is its size.)`,
  panels: WARMUP,
  mountPanel,
});

export const feast = run({
  id: 'feast',
  title: 'Portioned Carving',
  room: 'Thanksgiving',
  kind: 'home',
  from: 'Portioned Carving · Thanksgiving (Thanksgiving)',
  rules: `${CONTROLS} (Twist: a portion may not cross a thick fence line between two squares.)`,
  panels: FEAST,
  mountPanel,
});

export const hotdog = run({
  id: 'hotdog',
  title: 'Patriotic Carving',
  room: 'Thanksgiving',
  kind: 'relic',
  from: 'Patriotic Carving · Thanksgiving (Fourth of July)',
  rules: `${CONTROLS} (Twist: a portion takes the color of its red or blue mark; two portions of the same color may not share an edge, while plain portions can touch anything.)`,
  panels: HOTDOG,
  mountPanel,
});

export const stocking = run({
  id: 'stocking',
  title: 'Snowflake Carving',
  room: 'Thanksgiving',
  kind: 'relic',
  from: 'Snowflake Carving · Thanksgiving (Christmas)',
  rules: `${CONTROLS} (Twist: inside the frosty frame, the cuts between portions mirror across the icy line.)`,
  panels: STOCKING,
  mountPanel,
});

export const locket = run({
  id: 'locket',
  title: 'Love-Letter Carving',
  room: 'Thanksgiving',
  kind: 'relic',
  from: "Love-Letter Carving · Thanksgiving (Valentine's)",
  rules: `${CONTROLS} (Twist: portions with the same letter must have the same area, and different letters must have different areas. The message's numbered blanks spell a word with the letter for each area, so unscramble the letters to learn their areas.)`,
  panels: LOCKET,
  mountPanel,
});

export const jellybeans = run({
  id: 'jellybeans',
  title: 'Egg-Hunt Carving',
  room: 'Thanksgiving',
  kind: 'relic',
  from: 'Egg-Hunt Carving · Thanksgiving (Easter)',
  rules: `${CONTROLS} (Twist: every carved portion must contain one of each food item on the board, even if a portion has no number.)`,
  panels: JELLYBEANS,
  mountPanel,
});

export const candycorn = run({
  id: 'candycorn',
  title: 'Spooky Carving',
  room: 'Thanksgiving',
  kind: 'relic',
  from: 'Spooky Carving · Thanksgiving (Halloween)',
  rules: `${CONTROLS} (Twist: a dark ? clue stands for a portion of any area.)`,
  panels: CANDYCORN,
  mountPanel,
});
