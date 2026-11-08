/**
 * Fourth of July: the fireworks run (GAME.md, "Fourth of July: the fireworks
 * run"). Picture-grid (nonogram) panels in four runs: the warm-up sparklers,
 * the two strays (Cupid's Bow brings Valentine's letters for numbers; the
 * Witch's Broom, Halloween's dark clues), and the Grand Finale centrepiece in
 * colour. Hand-drawn pictures, adjusted by a search until each solves by
 * line logic alone (tests/puzzles/fourth.test.ts).
 */
import { type Panel } from '../picture';
import { mountPicture } from '../pictureBoard';
import { run } from '../run';

export const SPARKLERS: Panel[] = [
  { name: 'A full line', rows: ['#####'] },
  { name: 'A gap', rows: ['#.#', '.#.', '#.#'] },
  { name: 'Runs in order', rows: ['.#.#.', '#####', '#####', '.###.', '..#..'] },
  { name: 'Crossing clues', rows: ['..#..', '.###.', '#####', '.###.', '.#.#.'] },
  {
    name: 'A first picture',
    rows: [
      '....#...',
      '...###..',
      '...#.#..',
      '...###..',
      '...###..',
      '..#####.',
      '.##.#.##',
      '.#.###.#',
    ],
  },
];

export const BOW: Panel[] = [
  {
    name: 'Be mine',
    rows: ['...#.', '.#.##', '.###.', '#####', '..#..'],
    letters: '  ES',
    message: '4HIN3',
  },
  {
    name: "Cupid's arrow",
    rows: ['..#....', '######.', '.##....', '######.', '..##.##', '#..###.', '#..#...'],
    letters: ' OM  B',
    message: '6223',
  },
  {
    name: 'Sweethearts',
    rows: [
      '......#..',
      '#.#...#..',
      '#####.##.',
      '#..##.##.',
      '..######.',
      '...##.#..',
      '......#..',
      '..######.',
      '...###..#',
    ],
    letters: '  HTR',
    message: '3EA54',
  },
];

export const BROOM: Panel[] = [
  {
    name: 'The pumpkin',
    rows: ['...#.', '.#.##', '.###.', '#####', '..#..'],
    dark: [
      ['col', 4, 1],
      ['row', 1, 1],
    ],
  },
  {
    name: 'The broom',
    rows: ['..#..#.', '##.###.', '..##.#.', '..###.#', '.....#.', '.....#.', '.##..#.'],
    dark: [
      ['col', 4, 1],
      ['row', 2, 0],
      ['row', 3, 1],
    ],
  },
  {
    name: 'The bat',
    rows: [
      '....#....',
      '##.#.....',
      '#####....',
      '#########',
      '...####..',
      '.#####...',
      '...##....',
      '...##....',
      '...##...#',
    ],
    dark: [
      ['col', 2, 0],
      ['col', 1, 0],
      ['col', 4, 0],
      ['row', 8, 1],
    ],
  },
];

export const FINALE: Panel[] = [
  {
    name: 'The big picture',
    rows: [
      '.#.......',
      '#..#.#..#',
      '.#..##...',
      '.....#...',
      '#######..',
      '..######.',
      '.....#...',
      '...######',
      '.....##..',
    ],
  },
  {
    name: 'Red and blue',
    rows: ['..B..', 'RRBB.', '.BRRB', '...R.', '.R.B.'],
    palette: 'RB',
  },
  {
    name: 'A rocket',
    rows: ['..B....', 'RRBBRR.', '.BR....', 'BBRRBB.', '..BB.RB', 'R..BRR.', 'B..R...'],
    palette: 'RB',
  },
  {
    name: 'Starburst',
    rows: ['..RR...', '..R....', 'R.R.RB.', 'RRRRB.B', '..RB...', '.RBB...', '.B.B..B'],
    palette: 'RB',
  },
  {
    name: 'The Grand Finale',
    rows: [
      '..RR.RR..',
      '.R..RRR..',
      'RRRR.RRB.',
      '..RR.RB..',
      '..RRRBB.B',
      '..RRB....',
      '..RBBB...',
      '..BB.....',
      '.....B...',
    ],
    palette: 'RB',
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountPicture(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'The numbers by each row and column are the runs of filled squares in that line, in order. Tap a square to fill it, again to cross it out, again to clear; drag along a row or column to do a run at once. The puzzles teach the rules; open a puzzle number to jump about.';

export const sparklers = run({
  id: 'sparklers',
  title: 'Sparklers',
  room: 'Fourth of July',
  kind: 'warm-up',
  from: 'Fireworks · Fourth of July, taught puzzle by puzzle',
  rules: CONTROLS,
  panels: SPARKLERS,
  mountPanel,
});

export const bow = run({
  id: 'bow',
  title: "Cupid's Bow",
  room: 'Fourth of July',
  kind: 'stray',
  from: "Love-Letter Fireworks · Fourth of July (Valentine's)",
  rules: `${CONTROLS} (Twist: some clues are letters; the same letter is always the same number. The message's numbered blanks take the letter with that number.)`,
  panels: BOW,
  mountPanel,
});

export const broom = run({
  id: 'broom',
  title: "The Witch's Broom",
  room: 'Fourth of July',
  kind: 'stray',
  from: 'Spooky Fireworks · Fourth of July (Halloween)',
  rules: `${CONTROLS} (Twist: a ? is a clue in the dark: a run of any length.)`,
  panels: BROOM,
  mountPanel,
});

export const finale = run({
  id: 'finale',
  title: 'The Grand Finale',
  room: 'Fourth of July',
  kind: 'centerpiece',
  from: 'Patriotic Fireworks · Fourth of July (Fourth of July)',
  rules: `${CONTROLS} (Color: pick a paint from the bar. Clues come in colors; two runs of the same color need a gap between them, different colors can touch.)`,
  panels: FINALE,
  mountPanel,
});
