/**
 * Clause VI (`C6`): Fourth of July · Fireworks (`pictures`).
 *
 * 22-panel gauntlet covering 6 teaching intros, all 15 two-twist pairs,
 * and the 6-twist finale.
 */

import type { Panel as PicturePanel } from '../../../gen/pictures';
import type { ClauseDef } from './types';

export type { PicturePanel };

export const CLAUSE_PICTURES: ClauseDef<PicturePanel> = {
  clauseIndex: 5,
  id: 'C6',
  genre: 'pictures',
  title: 'Clause VI: Fourth of July · Fireworks',
  genreTitle: 'Fireworks',
  icon: '🎆',
  accent: '#2b6cb0',
  twistOrder: ['dark', 'letters', 'colours', 'eggs', 'portions', 'snow'],
  twistMeta: [
    {
      key: 'dark',
      icon: '🎃',
      label: 'Spooky',
      rule: 'A ? clue in a row or column stands for a filled run of any length (1 or more).',
    },
    {
      key: 'letters',
      icon: '💌',
      label: 'Love-Letter',
      rule: 'Letter clues stand for run lengths; same letter = same length, different letters = different lengths. The message blanks spell a word: unscramble it to learn the lengths.',
    },
    {
      key: 'colours',
      icon: '🎆',
      label: 'Patriotic',
      rule: 'Squares and clues are Red or Blue; same-color runs need an empty gap between them, while Red and Blue runs can touch directly!',
    },
    {
      key: 'eggs',
      icon: '🥚',
      label: 'Egg-Hunt',
      rule: 'An egg on a row clue marks which run in that row covers the egg square in the grid.',
    },
    {
      key: 'portions',
      icon: '🥧',
      label: 'Portioned',
      rule: 'Every outlined region on the grid contains the exact same number of filled squares.',
    },
    {
      key: 'snow',
      icon: '❄️',
      label: 'Snowflake',
      rule: 'Inside the frosty frame, filled squares mirror across the icy line.',
    },
  ],
  panels: [
    // 0..5: Intro (teaching boards)
    {
      name: 'Candlelight Spark',
      section: 'intro',
      twists: ['dark'],
      tip: '🎃 Spooky: ? is a filled run of any length (1 or more).',
      explain:
        'In Fireworks, a ? clue stands for a single contiguous run of 1 or more filled squares — use the crossing rows and columns to pin down its true length.',
      panel: {
        name: 'Candlelight Spark',
        rows: ['#.##', '.###', '####', '#.#.'],
        dark: [
          ['row', 0, 1],
          ['col', 0, 1],
        ],
      },
    },
    {
      name: 'Secret Sparkler',
      section: 'intro',
      twists: ['letters'],
      tip: '💌 Love Letters: Equal letters mean equal run lengths; distinct letters differ.',
      explain:
        'In Fireworks, letter clues replace run lengths: every matching letter has the exact same length, different letters have different lengths, and the numbered message blanks spell a word, so unscrambling the letters into it gives each length.',
      panel: {
        name: 'Secret Sparkler',
        rows: ['..#.', '.###', '####', '.#.#'],
        letters: 'M ZO',
        message: '3441',
      },
    },
    {
      name: 'Twin Flares',
      section: 'intro',
      twists: ['colours'],
      tip: '🎆 Red, White & Blue: Same-color runs need a gap; Red and Blue runs can touch!',
      explain:
        'In Fireworks, clues are colored Red or Blue: two runs of the same color still require an empty white square between them, but a Red run and a Blue run can touch side by side.',
      panel: {
        name: 'Twin Flares',
        rows: ['.RR.', 'RRBB', '.BB.', '..R.'],
        palette: 'RB',
      },
    },
    {
      name: 'Nest of Sparks',
      section: 'intro',
      twists: ['eggs'],
      tip: '🥚 Egg Hunt: An egg on a row clue marks which run in that row covers the egg square.',
      explain:
        'In Fireworks, a square marked with an egg must be filled as part of the corresponding run in its row whose clue number has an egg icon.',
      panel: {
        name: 'Nest of Sparks',
        rows: ['#..#', '.##.', '#.#.', '.###'],
        eggs: [
          [0, 3, 2],
          [2, 2, 2],
        ],
      },
    },
    {
      name: 'Shared Glow',
      section: 'intro',
      twists: ['portions'],
      tip: '🥧 Portions: Every outlined region holds the exact same count of filled squares.',
      explain:
        'In Fireworks, the dashed boundaries divide the grid into regions that must each contain the exact same total number of filled squares.',
      panel: {
        name: 'Shared Glow',
        rows: ['##..', '.#.#', '.##.', '#..#'],
        portions: ['AAAA', 'AAAA', 'BBBB', 'BBBB'],
      },
    },
    {
      name: 'Frosted Pinwheel',
      section: 'intro',
      twists: ['snow'],
      tip: '❄️ Snowflakes: Filled squares inside the frosty frame mirror across its axis.',
      explain:
        'In Fireworks, every square inside the frosty blue frame reflects across the icy centerline — filling or clearing one side immediately determines its mirror twin.',
      panel: {
        name: 'Frosted Pinwheel',
        rows: ['.##.', '#..#', '.##.', '...#'],
        frame: { top: 0, bottom: 2, left: 0, right: 3, axis: 'v' },
      },
    },

    // 6..20: Duo (all 15 pairs in pairCombinations(twistOrder) order)
    {
      name: 'Midnight Billet',
      section: 'duo',
      twists: ['dark', 'letters'],
      tip: '🎃 Spooky + 💌 Love Letters: ? is any length; letters share fixed lengths.',
      explain:
        'Combine ? mystery runs with coded letter runs: same letters must share the same run length, while ? clues can take any length that fits.',
      panel: {
        name: 'Midnight Billet',
        rows: ['.####', '.####', '.###.', '#####', '##.##'],
        dark: [
          ['col', 4, 1],
          ['row', 4, 0],
        ],
        letters: ' SWTE',
        message: '23554',
      },
    },
    {
      name: 'Phantom Flare',
      section: 'duo',
      twists: ['dark', 'colours'],
      tip: '🎃 Spooky + 🎆 Red, White & Blue: Colored ? clues have known color, unknown length.',
      explain:
        'A colored ? clue tells you whether the run is Red or Blue while hiding how long it is; remember that Red and Blue runs can touch without a gap.',
      panel: {
        name: 'Phantom Flare',
        rows: ['RRRR.', 'RRRRB', 'RRRBB', '..BB.', 'R.B..'],
        palette: 'RB',
        dark: [
          ['col', 0, 0],
          ['row', 1, 1],
        ],
      },
    },
    {
      name: 'Moonlit Nest',
      section: 'duo',
      twists: ['dark', 'eggs'],
      tip: '🎃 Spooky + 🥚 Egg Hunt: Use the egg-marked row runs to pin down ? clues.',
      explain:
        'Each egg square belongs to the egg-marked run clue in its row, helping resolve the lengths of hidden ? clues.',
      panel: {
        name: 'Moonlit Nest',
        rows: ['.#...', '#.#..', '...#.', '.#..#', '..##.'],
        eggs: [
          [1, 2, 2],
          [3, 4, 2],
        ],
        dark: [
          ['col', 2, 1],
          ['col', 1, 0],
        ],
      },
    },
    {
      name: 'Twilight Banquet',
      section: 'duo',
      twists: ['dark', 'portions'],
      tip: '🎃 Spooky + 🥧 Portions: Equal region shares settle the mystery runs.',
      explain:
        'Every outlined portion holds the exact same number of filled squares, giving you the extra count needed to resolve the ? clues.',
      panel: {
        name: 'Twilight Banquet',
        rows: ['####.', '###..', '##.#.', '##..#', '.#...'],
        portions: ['AAAAB', 'ABBAB', 'ABAAB', 'BBBBB', 'BBBBB'],
        dark: [
          ['row', 3, 0],
          ['row', 2, 0],
        ],
      },
    },
    {
      name: 'Ghost Flurry',
      section: 'duo',
      twists: ['dark', 'snow'],
      tip: '🎃 Spooky + ❄️ Snowflakes: Symmetry inside the frame reflects ? runs.',
      explain:
        'Mirroring squares across the frosty frame’s axis locks in cells that disambiguate the hidden ? run clues.',
      panel: {
        name: 'Ghost Flurry',
        rows: ['...#.##', '......#', '..##..#', '#....##', '.#..#.#', '..###.#', '.######'],
        frame: { top: 1, bottom: 4, left: 0, right: 5, axis: 'v' },
        dark: [
          ['row', 3, 0],
          ['row', 2, 1],
          ['col', 2, 0],
        ],
      },
    },
    {
      name: 'Crimson Verse',
      section: 'duo',
      twists: ['letters', 'colours'],
      tip: '💌 Love Letters + 🎆 Red, White & Blue: Colored letters encode run lengths.',
      explain:
        'Each letter stands for a specific run length regardless of whether the run is Red or Blue, while Red and Blue runs may touch directly.',
      panel: {
        name: 'Crimson Verse',
        rows: ['.RR..', 'RRR..', 'RRR.B', 'RRBB.', 'R....'],
        palette: 'RB',
        letters: 'HRCE',
        message: '31442',
      },
    },
    {
      name: 'Painted Ribbon',
      section: 'duo',
      twists: ['letters', 'eggs'],
      tip: '💌 Love Letters + 🥚 Egg Hunt: Egg-marked runs help decode the letter lengths.',
      explain:
        'Use the egg squares and their matching egg-marked row clues together with the letter clues so every coded run length agrees.',
      panel: {
        name: 'Painted Ribbon',
        rows: ['.#...', '.#...', '###..', '##.#.', '##..#'],
        eggs: [
          [3, 3, 3],
          [4, 4, 3],
        ],
        letters: 'HNE S',
        message: '51332',
      },
    },
    {
      name: 'Sweet Shares',
      section: 'duo',
      twists: ['letters', 'portions'],
      tip: '💌 Love Letters + 🥧 Portions: Equal portion totals and letter lengths work together.',
      explain:
        'Deduce the letter values and balance the filled squares equally between the outlined portions to complete the picture.',
      panel: {
        name: 'Sweet Shares',
        rows: ['.####', '##.##', '###..', '.#.#.', '....#'],
        portions: ['AABBB', 'AAABB', 'AAAAB', 'ABAAB', 'BBBBB'],
        letters: 'ASTR',
        message: '23142',
      },
    },
    {
      name: 'Icy Valentine',
      section: 'duo',
      twists: ['letters', 'snow'],
      tip: '💌 Love Letters + ❄️ Snowflakes: Frame symmetry constrains the letter runs.',
      explain:
        'Filled squares inside the frosty frame mirror across its centerline, helping you work out the exact value of each letter clue.',
      panel: {
        name: 'Icy Valentine',
        rows: ['.#...##', '..##..#', '..##..#', '#....##', '.#..#.#', '..###.#', '..#####'],
        frame: { top: 1, bottom: 4, left: 0, right: 5, axis: 'v' },
        letters: 'TIL G H',
        message: '32571',
      },
    },
    {
      name: 'Festive Basket',
      section: 'duo',
      twists: ['colours', 'eggs'],
      tip: '🎆 Red, White & Blue + 🥚 Egg Hunt: Each egg square belongs to its row’s egg-marked colored run.',
      explain:
        'An egg square in the grid must be filled with the color and run of the egg-marked clue in its row, while Red and Blue runs can touch directly.',
      panel: {
        name: 'Festive Basket',
        rows: ['.R.B.', '....B', '..R..', '.BRRB', 'RRBB.'],
        palette: 'RB',
        eggs: [
          [0, 3, 2],
          [4, 2, 3],
        ],
      },
    },
    {
      name: 'Bicentennial Pie',
      section: 'duo',
      twists: ['colours', 'portions'],
      tip: '🎆 Red, White & Blue + 🥧 Portions: Portions count Red and Blue squares combined.',
      explain:
        'Every outlined portion must hold the same total number of filled squares (Red plus Blue combined), while different-colored runs can touch directly.',
      panel: {
        name: 'Bicentennial Pie',
        rows: ['B..B.', 'B...B', 'BBB..', 'B.R..', 'BRRRR'],
        palette: 'RB',
        portions: ['AAAAB', 'AAABB', 'AABBB', 'ABBBB', 'ABBBB'],
      },
    },
    {
      name: 'Glacier Rocket',
      section: 'duo',
      twists: ['colours', 'snow'],
      tip: '🎆 Red, White & Blue + ❄️ Snowflakes: Color and fill mirror inside the frame.',
      explain:
        'Inside the frosty frame, squares mirror both their position and their color (Red or Blue) across the icy centerline.',
      panel: {
        name: 'Glacier Rocket',
        rows: ['.BB..', '....B', 'R..RR', '.RR.R', '..R..'],
        palette: 'RB',
        frame: { top: 0, bottom: 3, left: 0, right: 3, axis: 'v' },
      },
    },
    {
      name: 'Harvest Clutch',
      section: 'duo',
      twists: ['eggs', 'portions'],
      tip: '🥚 Egg Hunt + 🥧 Portions: Match egg-marked row runs and equal region shares.',
      explain:
        'Cover each egg square with its row’s egg-marked run while balancing filled-square totals equally across the outlined portions.',
      panel: {
        name: 'Harvest Clutch',
        rows: ['##.#.', '....#', '#....', '.#.##', '..##.'],
        portions: ['AAAAA', 'AAAAA', 'ABBBB', 'BBBBB', 'BBBBB'],
        eggs: [
          [0, 3, 3],
          [3, 4, 3],
        ],
      },
    },
    {
      name: 'Frosted Clutch',
      section: 'duo',
      twists: ['eggs', 'snow'],
      tip: '🥚 Egg Hunt + ❄️ Snowflakes: Mirror inside the frame and cover each egg square with its marked run.',
      explain:
        'Reflect filled squares across the frosty frame’s axis while covering each egg square with the egg-marked run clue in its row.',
      panel: {
        name: 'Frosted Clutch',
        rows: ['.##..#', '....#.', '#..#..', '.##...', '.#..#.', '#.#..#'],
        frame: { top: 0, bottom: 3, left: 0, right: 3, axis: 'v' },
        eggs: [
          [0, 5, 3],
          [4, 4, 2],
        ],
      },
    },
    {
      name: 'Frosted Shares',
      section: 'duo',
      twists: ['portions', 'snow'],
      tip: '🥧 Portions + ❄️ Snowflakes: Symmetric frame and equal region shares.',
      explain:
        'Mirror squares across the frosty frame’s axis and balance the total filled squares equally between the two outlined portions.',
      panel: {
        name: 'Frosted Shares',
        rows: ['.##...', '....#.', '#..#..', '.##...', '.#..#.', '#.#..#'],
        frame: { top: 0, bottom: 3, left: 0, right: 3, axis: 'v' },
        portions: ['AAAAAA', 'AAAAAA', 'BAAAAB', 'BBAAAB', 'BBBBAB', 'BBBBBB'],
      },
    },

    // 28: All 6 twists boss
    {
      name: 'The Grand Merger Finale',
      section: 'all6',
      twists: ['dark', 'letters', 'colours', 'eggs', 'portions', 'snow'],
      tip: '🎃💌🎆🥚🥧❄️ All 6 Twists: Every holiday clause fires at once!',
      explain:
        'The Clause VI Boss! ? clues, coded letter lengths, touching Red & Blue runs, egg-marked row runs, equal-share portions, and the frosty mirror frame all combine in one grand display.',
      panel: {
        name: 'The Grand Merger Finale',
        rows: ['.RR..B', '....R.', 'B..B.R', '.BB...', '.R..B.', 'BR...B'],
        palette: 'RB',
        frame: { top: 0, bottom: 3, left: 0, right: 3, axis: 'v' },
        portions: ['AAAAAA', 'AAAAAA', 'AAAAAB', 'AABBBB', 'BBBBBB', 'BBBBBB'],
        eggs: [
          [0, 5, 3],
          [4, 4, 2],
        ],
        dark: [
          ['row', 2, 1],
          ['col', 5, 1],
        ],
        letters: 'PO',
        message: '121',
      },
    },
  ],
};
