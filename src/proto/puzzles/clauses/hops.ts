/**
 * Clause V (`C5`): Easter · Bunny Hops (`hops`) — 22-panel contract gauntlet.
 *
 * Progression:
 * - Panels 0–5 (`intro`, 6 panels): Compact teaching boards (`<= 4×4`) introducing each twist in `HOP_TWISTS` order.
 * - Panels 6–20 (`duo`, 15 panels): All 15 two-twist combinations (`medium` 5×5).
 * - Panel 21 (`all6`, 1 panel): Boss puzzle combining all 6 twists at once (`hard` 6×6).
 */

import type { Panel as HopPanel } from '../../hops';
import type { ClauseDef, ClausePanelItem, TwistMeta } from './types';

export type { HopPanel };

export const HOPS_TWIST_ORDER = [
  'courses',
  'colours',
  'burrows',
  'snow',
  'letters',
  'dark',
] as const;

export const HOPS_TWISTS: readonly TwistMeta[] = [
  {
    key: 'courses',
    icon: '🥧',
    label: 'Portioned',
    rule: 'Once a bunny enters an outlined lawn course, it must visit every square in that course before hopping out.',
  },
  {
    key: 'colours',
    icon: '🎆',
    label: 'Patriotic',
    rule: 'Two bunnies (Red and Blue) each start at their own 1 egg and hop on their own color; white squares can be visited by either bunny.',
  },
  {
    key: 'burrows',
    icon: '🥚',
    label: 'Egg-Hunt',
    rule: 'Matching burrow holes connect underground as a single hop between their two squares.',
  },
  {
    key: 'snow',
    icon: '❄️',
    label: 'Snowflake',
    rule: 'Inside the frosty frame, every hop inside the frame mirrors across the icy line.',
  },
  {
    key: 'letters',
    icon: '💌',
    label: 'Love-Letter',
    rule: 'Letter eggs must be visited on the hop numbers in the blanks to spell the secret word.',
  },
  {
    key: 'dark',
    icon: '🎃',
    label: 'Spooky',
    rule: 'Shadowed (?) squares hide whether they are lawn or rock; the final numbered egg tells you how many squares the bunny visits in total.',
  },
];

const PANELS: readonly ClausePanelItem<HopPanel>[] = [
  // ── 0–5: Intro (compact teaching panels, one per twist) ─────────────────────
  {
    name: 'First Course',
    section: 'intro',
    twists: ['courses'],
    tip: '🥧 Portions: Finish every square in an outlined lawn course before hopping into the next.',
    explain:
      'Thick amber walls divide the lawn into courses. Once the bunny enters a course, it must visit every square in that course in one unbroken stretch before hopping out.',
    panel: {
      name: 'First Course',
      rows: ['###', '###', '###'],
      given: [
        [0, 0, 1],
        [2, 2, 9],
      ],
      portions: ['AAA', 'AAA', 'BBB'],
    },
  },
  {
    name: 'Two Bunnies, One Lawn',
    section: 'intro',
    twists: ['colours'],
    tip: '🎆 Red, White & Blue: Red hops on red/white; Blue hops on blue/white.',
    explain:
      'Two bunnies share the board! Each bunny starts at its own 1 egg and hops across its own color, while plain white squares on the border can be visited by either bunny.',
    panel: {
      name: 'Two Bunnies, One Lawn',
      rows: ['####', '####', '####'],
      given: [
        [0, 2, 1],
        [2, 0, 7],
        [0, 3, 1],
        [2, 3, 5],
      ],
      colours: ['rrrb', 'rwbb', 'rrwb'],
    },
  },
  {
    name: 'Down the Rabbit Hole',
    section: 'intro',
    twists: ['burrows'],
    tip: '🥚 Burrows: Matching burrow holes connect underground as a single hop.',
    explain:
      'Matching burrow holes are connected by a tunnel underneath the lawn. Hopping onto one burrow hole lets the bunny pop right out of its partner on the next step, and every burrow must be used.',
    panel: {
      name: 'Down the Rabbit Hole',
      rows: ['###', '###', '###'],
      given: [
        [0, 0, 1],
        [0, 1, 2],
        [1, 2, 7],
        [1, 0, 9],
      ],
      burrows: [
        [
          [0, 2],
          [2, 0],
        ],
      ],
    },
  },
  {
    name: 'Frosty Mirror',
    section: 'intro',
    twists: ['snow'],
    tip: '❄️ Snowflakes: Every trail segment inside the frosty frame mirrors across the icy axis.',
    explain:
      'Inside the dashed frosty frame, the bunny trail must be symmetric across the icy mirror line: every hop drawn inside one half of the frame must also appear in the mirrored half.',
    panel: {
      name: 'Frosty Mirror',
      rows: ['####', '####', '####', '####'],
      given: [
        [3, 0, 1],
        [0, 0, 4],
        [3, 3, 16],
      ],
      frame: { top: 0, left: 0, bottom: 2, right: 3, axis: 'v' },
    },
  },
  {
    name: 'Egg Mail',
    section: 'intro',
    twists: ['letters'],
    tip: '💌 Love Letters: Land on letter eggs at the exact hop numbers shown in the message blanks.',
    explain:
      'Some eggs carry letters instead of numbers. The numbered blanks above the board tell you which hop steps must land on letter eggs to spell out the secret word.',
    panel: {
      name: 'Egg Mail',
      rows: ['###', '###', '###'],
      given: [
        [0, 0, 1],
        [1, 2, 4],
      ],
      letters: [
        [0, 2, 'H'],
        [1, 1, 'O'],
        [2, 0, 'P'],
      ],
      message: '3 5 7',
      word: 'HOP',
      blanks: [3, 5, 7],
    },
  },
  {
    name: 'Shadow Lawn',
    section: 'intro',
    twists: ['dark'],
    tip: '🎃 Spooky: Shadowed (?) squares may be lawn or rock; the last egg gives the total route length.',
    explain:
      'Shadowed (?) squares hide whether they are steppable lawn or impassable rocks. Use the final numbered egg to see how many squares the bunny visits in total.',
    panel: {
      name: 'Shadow Lawn',
      rows: ['###', '###', '.##'],
      given: [
        [0, 2, 1],
        [0, 0, 3],
        [1, 2, 8],
      ],
      dark: [
        [1, 0],
        [2, 0],
      ],
    },
  },

  // ── 6–20: Duo (all 15 two-twist combinations in pairCombinations order) ────
  {
    name: 'Picnic Parade',
    section: 'duo',
    twists: ['courses', 'colours'],
    tip: '🥧 Portions + 🎆 Red, White & Blue: Both bunnies must respect course walls and color zones.',
    explain:
      'Combine Portions and Red, White & Blue: each bunny hops on its own color (or white) while finishing each outlined course in one unbroken visit.',
    panel: {
      name: 'Picnic Parade',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [
        [0, 2, 1],
        [0, 4, 3],
        [1, 3, 7],
        [1, 1, 1],
      ],
      portions: ['BBAAA', 'BBAAA', 'BBAAA', 'BBAAB', 'BBBBB'],
      colours: ['bbrrr', 'bbrrr', 'bwrrw', 'bwrrb', 'bbbbb'],
    },
  },
  {
    name: 'Under the Hedge',
    section: 'duo',
    twists: ['courses', 'burrows'],
    tip: '🥧 Portions + 🥚 Burrows: Finish each course contiguously; burrows tunnel between squares.',
    explain:
      'Combine Portions and Burrows: complete every square in a course before leaving it, using the underground burrow tunnel as a single hop.',
    panel: {
      name: 'Under the Hedge',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [
        [4, 1, 1],
        [0, 4, 7],
        [2, 1, 20],
      ],
      portions: ['BBBAA', 'BBBAA', 'BBBBA', 'AABBA', 'AAAAA'],
      burrows: [
        [
          [4, 0],
          [1, 3],
        ],
      ],
    },
  },
  {
    name: 'Frozen Portions',
    section: 'duo',
    twists: ['courses', 'snow'],
    tip: '🥧 Portions + ❄️ Snowflakes: Finish each course in one visit while mirroring inside the frame.',
    explain:
      'Combine Portions and Snowflakes: keep each lawn course contiguous along the route while mirroring every hop inside the frosty frame.',
    panel: {
      name: 'Frozen Portions',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [[4, 0, 1]],
      portions: ['AAABB', 'AAABB', 'AABBB', 'AABBB', 'AAABB'],
      frame: { top: 1, left: 1, bottom: 4, right: 4, axis: 'v' },
    },
  },
  {
    name: 'Table Placecards',
    section: 'duo',
    twists: ['courses', 'letters'],
    tip: '🥧 Portions + 💌 Love Letters: Complete each course before leaving and hit letter eggs on step.',
    explain:
      'Combine Portions and Love Letters: finish each outlined course before crossing out of it, landing on the letter eggs at steps 21, 17, and 13.',
    panel: {
      name: 'Table Placecards',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [[0, 4, 1]],
      portions: ['ABBBA', 'ABBBA', 'ABBBA', 'ABBBA', 'AAAAA'],
      letters: [
        [0, 2, 'J'],
        [3, 1, 'O'],
        [0, 0, 'Y'],
      ],
      message: '21 17 13',
      word: 'JOY',
      blanks: [21, 17, 13],
    },
  },
  {
    name: 'Twilight Banquet',
    section: 'duo',
    twists: ['courses', 'dark'],
    tip: '🥧 Portions + 🎃 Spooky: Finish each course in one stretch and deduce the shadowed squares.',
    explain:
      'Combine Portions and Spooky: each course must be completed before moving on, and the final 24 egg reveals how many shadowed (?) squares are lawn.',
    panel: {
      name: 'Twilight Banquet',
      rows: ['##.##', '#####', '#####', '#####', '#####'],
      given: [
        [3, 1, 1],
        [4, 4, 5],
        [0, 1, 24],
      ],
      portions: ['BB.BB', 'BBBBB', 'AABBB', 'AAAAA', 'AAAAA'],
      dark: [
        [1, 0],
        [0, 0],
        [0, 2],
      ],
    },
  },
  {
    name: 'Twin Warrens',
    section: 'duo',
    twists: ['colours', 'burrows'],
    tip: '🎆 Red, White & Blue + 🥚 Burrows: Guide both bunnies across their colors and through the burrow.',
    explain:
      'Combine Red, White & Blue and Burrows: two bunnies hop over their own colors and white squares while using the underground burrow connection.',
    panel: {
      name: 'Twin Warrens',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [
        [4, 4, 1],
        [3, 2, 8],
        [1, 2, 1],
        [1, 3, 7],
      ],
      colours: ['bbbbb', 'bwbbb', 'brwbb', 'rrrwb', 'rrrrr'],
      burrows: [
        [
          [1, 1],
          [2, 4],
        ],
      ],
    },
  },
  {
    name: 'Winter Parade',
    section: 'duo',
    twists: ['colours', 'snow'],
    tip: '🎆 Red, White & Blue + ❄️ Snowflakes: Two bunnies mirror each other inside the frosty frame.',
    explain:
      'Combine Red, White & Blue and Snowflakes: Red and Blue hop on their own colors (and white) while their combined surface strokes inside the frosty frame mirror across the axis.',
    panel: {
      name: 'Winter Parade',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [
        [2, 0, 1],
        [0, 4, 1],
      ],
      colours: ['rrwbb', 'rrwbb', 'rrrwb', 'brrbb', 'bbbbb'],
      frame: { top: 0, left: 1, bottom: 3, right: 4, axis: 'v' },
    },
  },
  {
    name: 'Pen Pals',
    section: 'duo',
    twists: ['colours', 'letters'],
    tip: '🎆 Red, White & Blue + 💌 Love Letters: Red spells the word while both bunnies cover their colors.',
    explain:
      'Combine Red, White & Blue and Love Letters: the Red bunny visits the letter eggs on the message blank steps while Blue covers the blue lawn.',
    panel: {
      name: 'Pen Pals',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [
        [4, 2, 1],
        [2, 0, 9],
        [1, 3, 1],
        [4, 3, 4],
      ],
      colours: ['rwbbb', 'rrbbb', 'rrwbb', 'rrrwb', 'rrrbb'],
      letters: [
        [4, 0, 'J'],
        [0, 0, 'O'],
        [3, 2, 'Y'],
      ],
      message: '3 11 6',
      word: 'JOY',
      blanks: [3, 11, 6],
    },
  },
  {
    name: 'Midnight Fireworks',
    section: 'duo',
    twists: ['colours', 'dark'],
    tip: '🎆 Red, White & Blue + 🎃 Spooky: Two bunnies, each with a final egg fixing its route length.',
    explain:
      'Combine Red, White & Blue and Spooky: each bunny has its own final numbered egg (12 and 12) telling you how many squares that bunny visits across the shadowed lawn.',
    panel: {
      name: 'Midnight Fireworks',
      rows: ['##.##', '#####', '#####', '#####', '#####'],
      given: [
        [4, 4, 1],
        [0, 3, 12],
        [3, 1, 1],
        [1, 2, 12],
      ],
      colours: ['bbrrr', 'bbbrr', 'bbwrr', 'bbwrr', 'bwrrr'],
      dark: [
        [1, 4],
        [0, 4],
        [0, 2],
      ],
    },
  },
  {
    name: 'Snowy Warren',
    section: 'duo',
    twists: ['burrows', 'snow'],
    tip: '🥚 Burrows + ❄️ Snowflakes: Surface strokes inside the frame mirror; burrows tunnel underground.',
    explain:
      'Combine Burrows and Snowflakes: surface hops inside the frosty frame mirror across the line, while underground burrow hops bypass the surface.',
    panel: {
      name: 'Snowy Warren',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [
        [4, 0, 1],
        [0, 4, 9],
        [1, 1, 17],
      ],
      burrows: [
        [
          [2, 3],
          [4, 4],
        ],
      ],
      frame: { top: 1, left: 1, bottom: 4, right: 3, axis: 'h' },
    },
  },
  {
    name: 'Underground Post',
    section: 'duo',
    twists: ['burrows', 'letters'],
    tip: '🥚 Burrows + 💌 Love Letters: Hop through the burrow to hit every letter egg on step.',
    explain:
      'Combine Burrows and Love Letters: use the underground burrow shortcut so the bunny lands on the letter eggs at steps 9, 4, and 16.',
    panel: {
      name: 'Underground Post',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [
        [4, 2, 1],
        [1, 3, 25],
      ],
      burrows: [
        [
          [3, 2],
          [4, 0],
        ],
      ],
      letters: [
        [0, 0, 'M'],
        [4, 1, 'A'],
        [4, 3, 'Y'],
      ],
      message: '9 4 16',
      word: 'MAY',
      blanks: [9, 4, 16],
    },
  },
  {
    name: 'Shadow Tunnel',
    section: 'duo',
    twists: ['burrows', 'dark'],
    tip: '🥚 Burrows + 🎃 Spooky: Traverse the burrow and use the final egg to navigate the dark.',
    explain:
      'Combine Burrows and Spooky: hop through the underground burrow and use the final 24 egg to tell which shadowed (?) squares are lawn vs rock.',
    panel: {
      name: 'Shadow Tunnel',
      rows: ['#####', '#####', '##.##', '#####', '#####'],
      given: [
        [3, 1, 1],
        [2, 1, 20],
        [1, 2, 24],
      ],
      burrows: [
        [
          [0, 0],
          [3, 0],
        ],
      ],
      dark: [
        [0, 1],
        [0, 2],
        [2, 2],
      ],
    },
  },
  {
    name: 'Frosted Postcard',
    section: 'duo',
    twists: ['snow', 'letters'],
    tip: '❄️ Snowflakes + 💌 Love Letters: Mirror hops inside the frame and land on letters at the blank steps.',
    explain:
      'Combine Snowflakes and Love Letters: mirror the bunny trail inside the frosty frame while landing on the letter eggs at steps 17, 12, and 22.',
    panel: {
      name: 'Frosted Postcard',
      rows: ['#####', '#####', '#####', '#####', '#####'],
      given: [[0, 0, 1]],
      frame: { top: 0, left: 1, bottom: 3, right: 4, axis: 'v' },
      letters: [
        [4, 4, 'D'],
        [3, 0, 'E'],
        [0, 3, 'W'],
      ],
      message: '17 12 22',
      word: 'DEW',
      blanks: [17, 12, 22],
    },
  },
  {
    name: 'Frosty Shadows',
    section: 'duo',
    twists: ['snow', 'dark'],
    tip: '❄️ Snowflakes + 🎃 Spooky: Mirror inside the frosty frame and deduce the shadowed top row.',
    explain:
      'Combine Snowflakes and Spooky: mirror every hop inside the frosty frame while using the final 24 egg to avoid the hidden rock in the dark.',
    panel: {
      name: 'Frosty Shadows',
      rows: ['.####', '#####', '#####', '#####', '#####'],
      given: [
        [0, 4, 1],
        [1, 2, 18],
        [0, 1, 24],
      ],
      frame: { top: 1, left: 0, bottom: 4, right: 3, axis: 'h' },
      dark: [
        [0, 0],
        [0, 2],
        [0, 3],
      ],
    },
  },
  {
    name: 'Whispered Note',
    section: 'duo',
    twists: ['letters', 'dark'],
    tip: '💌 Love Letters + 🎃 Spooky: Hit the letter eggs on step and deduce which dark square is rock.',
    explain:
      'Combine Love Letters and Spooky: land on the letter eggs at steps 17, 8, and 6 while using the final 24 egg to navigate the shadowed corner.',
    panel: {
      name: 'Whispered Note',
      rows: ['#####', '#####', '#####', '#####', '##.##'],
      given: [
        [1, 3, 1],
        [4, 1, 24],
      ],
      letters: [
        [4, 4, 'B'],
        [0, 1, 'U'],
        [1, 2, 'D'],
      ],
      message: '17 8 6',
      word: 'BUD',
      blanks: [17, 8, 6],
      dark: [
        [3, 0],
        [4, 0],
        [4, 2],
      ],
    },
  },

  // ── 28: All 6 Twists Boss Puzzle ───────────────────────────────────────────
  {
    name: 'The Grand Easter Merger',
    section: 'all6',
    twists: ['courses', 'colours', 'burrows', 'snow', 'letters', 'dark'],
    tip: '🥧🎆🥚❄️💌🎃 All 6 Twists: Portioned, Patriotic, Egg-Hunt, Snowflake, Love-Letter & Spooky!',
    explain:
      'All six holiday clauses unite! Guide the Red and Blue bunnies through their courses and colors, hop underground through the burrow, mirror inside the frosty frame, spell HOP on steps 7-10-14, and navigate the shadowed lawn.',
    panel: {
      name: 'The Grand Easter Merger',
      rows: ['.#####', '######', '######', '######', '######', '######'],
      given: [
        [5, 0, 1],
        [0, 3, 18],
        [5, 5, 1],
        [1, 3, 17],
      ],
      portions: ['.AAABB', 'AAABBB', 'AAABBB', 'AAABBB', 'AAABBB', 'AAABBB'],
      colours: ['.rrrbb', 'rrrbbb', 'rrrwbb', 'rrrbbb', 'rrrbbb', 'rrwbbb'],
      burrows: [
        [
          [1, 0],
          [0, 1],
        ],
      ],
      frame: { top: 2, left: 1, bottom: 5, right: 4, axis: 'v' },
      letters: [
        [1, 1, 'H'],
        [4, 1, 'O'],
        [3, 2, 'P'],
      ],
      message: '7 10 14',
      word: 'HOP',
      blanks: [7, 10, 14],
      dark: [
        [0, 0],
        [2, 0],
        [3, 0],
      ],
    },
  },
];

export const CLAUSE_HOPS: ClauseDef<HopPanel> = {
  clauseIndex: 4,
  id: 'C5',
  genre: 'hops',
  title: 'Clause V: Easter · Hops',
  genreTitle: 'Hops',
  icon: '🐰',
  accent: '#ecc94b',
  twistOrder: HOPS_TWIST_ORDER,
  twistMeta: HOPS_TWISTS,
  panels: PANELS,
};
