/**
 * Fourth of July: the fireworks room (revamp-centerpieces.md).
 * Fireworks (picture grid) panels in seven runs, each a set of
 * recognizable pictures:
 * - Intro (`sparklers`, 5 panels, <=7x7): line, sparkle, cone, rocket, burst
 * - Home twist (`finale`, 5 panels, <=7x7, `colours`): building to the flag
 * - 5 Relic runs (3 panels each, <=7x7):
 *   1. `bow` (Valentine's `letters`): hearts and a love letter
 *   2. `broom` (Halloween `dark`): jack-o'-lantern, ghost, bat
 *   3. `chocobunny` (Easter `eggs`): chick, carrot, chocolate bunny
 *   4. `harvestcorn` (Thanksgiving `portions`): leaf, pie, corn cob
 *   5. `snowglobe` (Christmas `snow`): tree, snowman, snow globe
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
    name: 'A sparkle',
    tip: '🎆 Multiple numbers in a line mean separate runs with at least one empty square between them',
    rows: ['#.#', '.#.', '#.#'],
  },
  {
    name: 'An ice cream cone',
    tip: '🎆 Start with full lines (5) and large runs to cross out squares that must stay empty',
    rows: ['.###.', '#####', '#####', '.#.#.', '..#..'],
  },
  {
    name: 'A rocket',
    tip: '🎆 Use row and column clues together to pin down every filled square',
    rows: ['..#..', '.###.', '.###.', '.###.', '#.#.#'],
  },
  {
    name: 'A burst',
    tip: '🎆 Overlap long runs in the 7×7 grid and work outward from the certain squares',
    rows: ['...#...', '.#.#.#.', '..###..', '###.###', '..###..', '.#.#.#.', '...#...'],
  },
];

export const FINALE: StoryPanel[] = [
  {
    name: 'Rocket pop',
    tip: '🎆 Two runs of the same color need a white gap; Red and Blue runs can touch directly!',
    rows: ['.RRR.', 'RRRRB', 'BBBBB', '.BBB.', '..B..'],
    palette: 'RB',
  },
  {
    name: 'Two-tone star',
    tip: '🎆 Pick Red or Blue paint from the bar to fill each colored clue run in order',
    rows: ['..R..', 'RRBBB', '.RRB.', '.R.B.', 'R...B'],
    palette: 'RB',
  },
  {
    name: 'A rocket',
    tip: '🎆 Adjacent Red and Blue runs need no empty square between them',
    rows: ['...R...', '..RRR..', '.RRBRR.', '.RRRRR.', '.BBRBB.', 'BBRRRBB', 'BB.R.BB'],
    palette: 'RB',
  },
  {
    name: "Uncle Sam's hat",
    tip: '🎆 Match each row and column’s Red and Blue run counts to finish the hat',
    rows: ['.R.R.RB', '.R.R.R.', '.BBBBB.', 'RRRRRRR'],
    palette: 'RB',
  },
  {
    name: 'Old Glory',
    tip: '🎆 Weave Red and Blue runs across the 7×7 sky to raise the flag',
    rows: ['BBBBRRR', 'B.BB...', 'BBBBRRR', 'BBBB...', 'BRRRRRR', 'B......', 'BR.RRR.'],
    palette: 'RB',
  },
];

export const BOW: StoryPanel[] = [
  {
    name: 'A heart',
    tip: '💌 Letter clues stand for run lengths; same letter = same length, different letters = different lengths',
    rows: ['.#.#.', '#####', '#####', '.###.', '..#..'],
    letters: 'O EVL',
    message: '5143',
  },
  {
    name: 'A love letter',
    tip: '💌 The numbered blanks spell a word: unscramble the clue letters into it to learn each letter’s length',
    rows: ['#######', '##...##', '#.#.#.#', '#..#..#', '#######'],
    letters: 'HC  R E',
    message: '21775',
  },
  {
    name: 'Heart on fire',
    tip: '💌 Unscramble the letters into the message first, then solve the picture with the numbers it gives',
    rows: ['......#', '.##.##.', '#######', '#######', '.#####.', '.####..', '#..#...'],
    letters: 'AZ EL B',
    message: '75124',
  },
];

export const BROOM: StoryPanel[] = [
  {
    name: "Jack-o'-lantern",
    tip: '🎃 A ? clue in a row or column stands for a filled run of any length (1 or more)',
    rows: ['..#..', '.###.', '#.#.#', '#####', '.###.'],
    dark: [
      ['col', 1, 0],
      ['col', 3, 1],
    ],
  },
  {
    name: 'A ghost',
    tip: '🎃 Use the numbered lines crossing a ? run to pin down where it starts and ends',
    rows: ['.###.', '#.#.#', '#####', '#####', '#.#.#'],
    dark: [
      ['col', 1, 0],
      ['row', 4, 0],
    ],
  },
  {
    name: 'A bat',
    tip: '🎃 Cross out all remaining empty squares on a ? line to mark that line complete',
    rows: ['..#.#..', '#.###.#', '#######', '##.#.##', '#..#..#'],
    dark: [
      ['row', 1, 2],
      ['row', 3, 2],
      ['row', 4, 0],
    ],
  },
];

export const CHOCOBUNNY: StoryPanel[] = [
  {
    name: 'A chick',
    tip: '🥚 An egg on a row clue marks which run in that row covers the egg square in the grid',
    rows: ['.##..', '#.#..', '###.#', '.####', '.###.'],
    eggs: [
      [1, 2, 2],
      [2, 1, 2],
    ],
  },
  {
    name: 'A carrot',
    tip: '🥚 Each egg square in the grid is filled as part of the row clue number marked with an egg',
    rows: ['#.#..', '.#...', '#.##.', '..###', '...##'],
    eggs: [
      [0, 2, 2],
      [2, 3, 3],
    ],
  },
  {
    name: 'The chocolate bunny',
    tip: '🥚 Match each egg square in the grid to the egg-marked run clue in its row',
    rows: ['.#...#.', '.#...#.', '..###..', '.#.#.#.', '..#.#..', '.#####.', '##...##'],
    eggs: [
      [0, 5, 2],
      [4, 4, 2],
      [6, 1, 2],
    ],
  },
];

export const HARVESTCORN: StoryPanel[] = [
  {
    name: 'A leaf',
    tip: '🥧 Every outlined portion on the grid contains the exact same number of filled squares',
    rows: ['...##', '..###', '.###.', '###..', '#....'],
    portions: ['BBAAA', 'BBAAA', 'BBBAA', 'BBBBA', 'BBBBA'],
  },
  {
    name: 'A slice of pie',
    tip: '🥧 Add up all row clues and divide by the number of portions to know how many filled squares each portion holds',
    rows: ['#...#', '##...', '#.#..', '##.#.', '#####'],
    portions: ['BBBBB', 'BBABB', 'BBABB', 'AAAAB', 'AAABB'],
  },
  {
    name: 'The harvest corn',
    tip: '🥧 Balance the filled squares across both portions to finish the 7×7 grid',
    rows: ['..###..', '.#.#.#.', '.##.##.', '.#.#.#.', '.##.##.', '#.###.#', '##...##'],
    portions: ['AAAAAAA', 'BAAAABB', 'BBAAAAB', 'BBAAAAB', 'BBAAAAB', 'BBBBBAB', 'BBBBBBB'],
  },
];

export const SNOWGLOBE: StoryPanel[] = [
  {
    name: 'A tree',
    tip: '❄️ Inside the frosty frame, filled and empty squares mirror across the icy line',
    rows: ['..#.#', '####.', '.##..', '####.', '.##.#'],
    frame: { top: 1, bottom: 4, left: 0, right: 3, axis: 'v' },
  },
  {
    name: 'A snowman',
    tip: '❄️ Every filled square inside the frosty frame reflects to its twin across the axis',
    rows: ['..##..#', '.####..', '..##..#', '.####..', '######.', '.######'],
    frame: { top: 0, bottom: 4, left: 0, right: 5, axis: 'v' },
  },
  {
    name: 'The snow globe',
    tip: '❄️ Use symmetry inside the frosty frame alongside the row and column clues',
    rows: ['...#...', '.####..', '#.##.#.', '#.##.#.', '.####.#', '######.', '......#'],
    frame: { top: 1, bottom: 6, left: 0, right: 5, axis: 'v' },
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
  rules: `${CONTROLS} (Twist: an egg on a row clue marks which run in that row covers the egg square in the grid.)`,
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
