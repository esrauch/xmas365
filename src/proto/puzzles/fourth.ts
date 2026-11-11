/**
 * Fourth of July: the fireworks room (revamp-centerpieces.md).
 * Fireworks (Picture-grid / Nonogram) panels in seven runs:
 * - Intro: Sparklers (`sparklers`, 5 panels, <=7x7)
 * - Home twist: The Grand Finale (`finale`, 5 panels, <=7x7, `colours`)
 * - 5 Relic runs (3 panels each, <=7x7):
 *   1. Cupid's Bow (`bow`, Valentine's `letters`)
 *   2. The Witch's Broom (`broom`, Halloween `dark`)
 *   3. The Chocolate Bunny (`chocobunny`, Easter `eggs`)
 *   4. The Harvest Corn (`harvestcorn`, Thanksgiving `portions`)
 *   5. The Snow Globe (`snowglobe`, Christmas `snow`)
 */
import { type Panel } from '../picture';
import { mountPicture } from '../pictureBoard';
import { run } from '../run';

type StoryPanel = Panel & { tip?: string };

export const SPARKLERS: StoryPanel[] = [
  {
    name: 'A full line',
    tip: '🎆 A number gives the length of a contiguous run of filled squares in that row or column',
    rows: ['#####'],
  },
  {
    name: 'A gap',
    tip: '🎆 Multiple numbers in a line mean separate runs with at least one empty square between them',
    rows: ['#.#', '.#.', '#.#'],
  },
  {
    name: 'Runs in order',
    tip: '🎆 Start with full lines (5) and large runs to cross out squares that must stay empty',
    rows: ['.#.#.', '#####', '#####', '.###.', '..#..'],
  },
  {
    name: 'Crossing clues',
    tip: '🎆 Use row and column clues together to pin down every filled square',
    rows: ['..#..', '.###.', '#####', '.###.', '.#.#.'],
  },
  {
    name: 'A first picture',
    tip: '🎆 Overlap long runs in the 7×7 grid and work outward from the certain squares',
    rows: ['.#.....', '#.#.#..', '...###.', '#####.#', '#.####.', '..###.#', '....##.'],
  },
];

export const FINALE: StoryPanel[] = [
  {
    name: 'Red and blue',
    tip: '🎆 Two runs of the same color need a white gap; Red and Blue runs can touch directly!',
    rows: ['..B..', 'RRRBB', '.BRRB', '..R..', '.R.B.'],
    palette: 'RB',
  },
  {
    name: 'Two-tone flare',
    tip: '🎆 Pick Red or Blue paint from the bar to fill each colored clue run in order',
    rows: ['.RR..', 'RRRBB', 'RRBBB', '.RBB.', '..B..'],
    palette: 'RB',
  },
  {
    name: 'A rocket',
    tip: '🎆 Adjacent Red and Blue runs need no empty square between them',
    rows: ['...R...', '..RRR..', '.RRBRR.', '.RRRRR.', '.BBRBB.', 'BBRRRBB', 'BB.R.BB'],
    palette: 'RB',
  },
  {
    name: 'Starburst',
    tip: '🎆 Match each row and column’s Red and Blue run counts to light the starburst',
    rows: ['..BBR..', '.BBRBB.', 'RRBBBRR', 'RRRBRRR', 'RRBBBRR', '.BBBRB.', '..RBB..'],
    palette: 'RB',
  },
  {
    name: 'The Grand Finale',
    tip: '🎆 Weave Red and Blue runs across the 7×7 sky to complete the Grand Finale',
    rows: ['.RRBBB.', 'RRRBBBB', 'RRBBRBB', '.BBBBRR', 'BBRRRRR', 'BBBRRRR', '.BB.RR.'],
    palette: 'RB',
  },
];

export const BOW: StoryPanel[] = [
  {
    name: 'Be mine',
    tip: '💌 Letter clues stand for run lengths; same letter = same length, different letters = different lengths',
    rows: ['...#.', '.#.##', '.###.', '#####', '..#..'],
    letters: 'O EVL',
    message: '5143',
  },
  {
    name: 'Sweethearts',
    tip: '💌 The numbered blanks spell a word: unscramble the clue letters into it to learn each letter’s length',
    rows: ['####.', '..###', '####.', '###..', '.#...'],
    letters: 'RTAS',
    message: '4231',
  },
  {
    name: "Cupid's arrow",
    tip: '💌 Unscramble the letters into the message first, then solve the picture with the numbers it gives',
    rows: ['..#....', '######.', '.##....', '######.', '..##.##', '#..###.', '#..#...'],
    letters: 'TIL HG',
    message: '32651',
  },
];

export const BROOM: StoryPanel[] = [
  {
    name: 'The pumpkin',
    tip: '🎃 A ? clue in a row or column stands for a filled run of any length (1 or more)',
    rows: ['#####', '.###.', '#.###', '.###.', '.###.'],
    dark: [
      ['row', 2, 1],
      ['col', 4, 1],
    ],
  },
  {
    name: 'Night flight',
    tip: '🎃 Use the numbered lines crossing a ? run to pin down where it starts and ends',
    rows: ['#..#.', '..##.', '##.##', '.##.#', '...#.'],
    dark: [
      ['row', 3, 1],
      ['col', 0, 0],
    ],
  },
  {
    name: 'The broom',
    tip: '🎃 Cross out all remaining empty squares on a ? line to mark that line complete',
    rows: ['..#..#.', '##.###.', '..##.#.', '..###.#', '.....#.', '.....#.', '.##..#.'],
    dark: [
      ['col', 4, 1],
      ['row', 2, 0],
      ['row', 3, 1],
    ],
  },
];

export const CHOCOBUNNY: StoryPanel[] = [
  {
    name: 'Hidden eggs',
    tip: '🥚 A square with a numbered egg is filled and is that exact nth filled square from the left in its row',
    rows: ['#..#.', '##..#', '##...', '.##..', '.###.'],
    eggs: [
      [0, 3, 2],
      [1, 1, 2],
    ],
  },
  {
    name: 'Cocoa ears',
    tip: '🥚 Count filled squares from the left edge of the row so each egg lands on its number',
    rows: ['....#', '..#..', '.##..', '##.#.', '.#..#'],
    eggs: [
      [3, 3, 3],
      [4, 4, 2],
    ],
  },
  {
    name: 'The Chocolate Bunny',
    tip: '🥚 An egg counts filled squares from the left of its row: a 3 means two filled squares come before it',
    rows: ['...#...', '#####..', '#####..', '#.#####', '###..##', '.#.#...', '##..#.#'],
    eggs: [
      [3, 2, 2],
      [4, 5, 4],
      [6, 4, 3],
    ],
  },
];

export const HARVESTCORN: StoryPanel[] = [
  {
    name: 'Equal shares',
    tip: '🥧 Every outlined portion on the grid contains the exact same number of filled squares',
    rows: ['###.#', '.#...', '##.#.', '....#', '.#...'],
    portions: ['AAAAB', 'ABAAB', 'ABAAB', 'ABBBB', 'BBBBB'],
  },
  {
    name: 'Golden kernels',
    tip: '🥧 Add up all row clues and divide by the number of portions to know how many filled squares each portion holds',
    rows: ['...#.', '.#..#', '.##..', '#####', '..##.'],
    portions: ['AAAAB', 'AAABB', 'AAABB', 'ABABB', 'BBBBB'],
  },
  {
    name: 'The Harvest Corn',
    tip: '🥧 Balance the filled squares across both portions to finish the 7×7 grid',
    rows: ['.#.....', '#.#.#..', '...###.', '#####.#', '..####.', '#..##.#', '.#..##.'],
    portions: ['AAAAAAB', 'AAAAABB', 'AAAAABB', 'AAABBBB', 'AAAABBB', 'ABBBBBB', 'BBBBBBB'],
  },
];

export const SNOWGLOBE: StoryPanel[] = [
  {
    name: 'Frosty glass',
    tip: '❄️ Inside the frosty frame, filled and empty squares mirror across the icy line',
    rows: ['#..#.', '....#', '#..#.', '.##.#', '..#..'],
    frame: { top: 0, bottom: 3, left: 0, right: 3, axis: 'v' },
  },
  {
    name: 'Summer flurry',
    tip: '❄️ Every filled square inside the frosty frame reflects to its twin across the axis',
    rows: ['####.', '....#', '#..#.', '.##..', '..#..'],
    frame: { top: 0, bottom: 3, left: 0, right: 3, axis: 'v' },
  },
  {
    name: 'The Snow Globe',
    tip: '❄️ Use symmetry inside the frosty frame alongside the row and column clues',
    rows: ['..#..#.', '##..##.', '..##...', '#....##', '.#..#..', '...####', '#######'],
    frame: { top: 1, bottom: 4, left: 0, right: 5, axis: 'v' },
  },
];

const mountPanel: Parameters<typeof run<StoryPanel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountPicture(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'The numbers by each row and column are the runs of filled squares in that line, in order. Tap a square to fill it, again to cross it out, again to clear; drag along a row or column to do a run at once. The puzzles teach the rules; open a puzzle number to jump about.';

export const sparklers = run({
  id: 'sparklers',
  title: 'Fireworks',
  room: 'Fourth of July',
  kind: 'intro',
  from: 'Fireworks · Fourth of July, taught puzzle by puzzle',
  rules: CONTROLS,
  panels: SPARKLERS,
  mountPanel,
});

export const finale = run({
  id: 'finale',
  title: 'Patriotic Fireworks',
  room: 'Fourth of July',
  kind: 'home',
  from: 'Patriotic Fireworks · Fourth of July (Fourth of July)',
  rules: `${CONTROLS} (Color: pick a paint from the bar. Clues come in colors; two runs of the same color need a gap between them, different colors can touch.)`,
  panels: FINALE,
  mountPanel,
});

export const bow = run({
  id: 'bow',
  title: 'Love-Letter Fireworks',
  room: 'Fourth of July',
  kind: 'relic',
  from: "Love-Letter Fireworks · Fourth of July (Valentine's)",
  rules: `${CONTROLS} (Twist: clues are letters; the same letter is always the same number. The message's numbered blanks spell a word with the letter for each number, so unscramble the letters to learn their numbers.)`,
  panels: BOW,
  mountPanel,
});

export const broom = run({
  id: 'broom',
  title: 'Spooky Fireworks',
  room: 'Fourth of July',
  kind: 'relic',
  from: 'Spooky Fireworks · Fourth of July (Halloween)',
  rules: `${CONTROLS} (Twist: a ? is a clue in the dark: a run of any length.)`,
  panels: BROOM,
  mountPanel,
});

export const chocobunny = run({
  id: 'chocobunny',
  title: 'Egg-Hunt Fireworks',
  room: 'Fourth of July',
  kind: 'relic',
  from: 'Egg-Hunt Fireworks · Fourth of July (Easter)',
  rules: `${CONTROLS} (Twist: a numbered egg sits on a filled square that is that exact nth filled square in its row counting from the left.)`,
  panels: CHOCOBUNNY,
  mountPanel,
});

export const harvestcorn = run({
  id: 'harvestcorn',
  title: 'Portioned Fireworks',
  room: 'Fourth of July',
  kind: 'relic',
  from: 'Portioned Fireworks · Fourth of July (Thanksgiving)',
  rules: `${CONTROLS} (Twist: every outlined portion on the board holds the exact same number of filled squares.)`,
  panels: HARVESTCORN,
  mountPanel,
});

export const snowglobe = run({
  id: 'snowglobe',
  title: 'Snowflake Fireworks',
  room: 'Fourth of July',
  kind: 'relic',
  from: 'Snowflake Fireworks · Fourth of July (Christmas)',
  rules: `${CONTROLS} (Twist: inside the frosty frame, filled squares mirror across the icy line.)`,
  panels: SNOWGLOBE,
  mountPanel,
});
