/**
 * Clause III (`C3`): Christmas · Fairy Lights (`lights`) — 29-panel Merger Contract gauntlet.
 *
 * - Panel 0 (`base`, 1 panel): Plain base game with no gimmicks.
 * - Panels 1–6 (`intro`, 6 panels): Trivial teaching boards (one per gimmick in `LIGHT_TWISTS`).
 * - Panels 7–12 (`solo`, 6 panels): Nontrivial single-gimmick puzzles (`easy` 5×5).
 * - Panels 13–27 (`duo`, 15 panels): All 15 two-gimmick combinations (`<= 7×7`).
 * - Panel 28 (`all6`, 1 panel): Boss puzzle combining all 6 gimmicks at once (`6×7`).
 */

import type { Panel as LightPanel } from '../../../gen/lights';
import type { ClauseDef, ClausePanelItem, TwistMeta } from './types';

export type { LightPanel };

export const LIGHT_TWIST_ORDER = ['snow', 'dark', 'letters', 'eggs', 'colours', 'slices'] as const;

export const LIGHT_TWISTS_META: readonly TwistMeta[] = [
  {
    key: 'snow',
    icon: '❄️',
    label: 'Snowflake',
    rule: 'Inside the frosty frame, mirrored tiles have mirrored wire shapes and rotate together.',
  },
  {
    key: 'dark',
    icon: '🎃',
    label: 'Spooky',
    rule: 'A ? tile hides its wire shape—deduce which neighbors it connects to from the surrounding wires.',
  },
  {
    key: 'letters',
    icon: '💌',
    label: 'Love-Letter',
    rule: 'Letter bulbs sit at wire-step distances from the plug that fill the numbered blanks to spell the secret word.',
  },
  {
    key: 'eggs',
    icon: '🥚',
    label: 'Egg-Hunt',
    rule: 'Power must reach each numbered egg in that exact number of wire-steps from its plug.',
  },
  {
    key: 'colours',
    icon: '🎆',
    label: 'Patriotic',
    rule: 'Two plugs (Red and Blue) each power their own color; white wires can connect to either plug without mixing.',
  },
  {
    key: 'slices',
    icon: '🥧',
    label: 'Portioned',
    rule: 'Each pie slice gets exactly one wire from the center *, and no wire may cross a crust wall between slices.',
  },
];

const PANELS: readonly ClausePanelItem<LightPanel>[] = [
  // =========================================================================
  // 0: Base Game (1 panel)
  // =========================================================================
  {
    name: 'Warm Tinsel',
    section: 'base',
    twists: [],
    tip: '🎄 Power every tile from the plug with no loose ends or loops',
    explain:
      'Turn the wire tiles so power from the plug reaches every square on the board with no loose ends and no closed loops.',
    panel: {
      name: 'Warm Tinsel',
      rows: ['682c', '7aad', '7a81', '3aa8'],
      plug: [3, 1],
    },
  },

  // =========================================================================
  // 1–6: Trivial Gimmick Re-Explanations (`intro`, 6 panels)
  // =========================================================================
  {
    name: 'Frosty Mirror',
    section: 'intro',
    twists: ['snow'],
    tip: '❄️ Inside the frosty frame, mirror partners rotate together',
    explain:
      'Inside the frosty frame, tiles across the icy dashed line have mirrored wire shapes and turn together whenever you tap either partner.',
    panel: {
      name: 'Frosty Mirror',
      rows: ['682c', '7aad', '3c69', '2938'],
      plug: [3, 1],
      frame: { top: 0, left: 0, bottom: 2, right: 3, axis: 'v' },
    },
  },
  {
    name: 'Shadow Bulbs',
    section: 'intro',
    twists: ['dark'],
    tip: '🎃 ? tiles hide their wire shape—deduce them from neighbors',
    explain:
      'A ? tile hides its wire shape in the dark and turns blind; orient the visible surrounding tiles first so their wire ends reveal how each ? tile must connect.',
    panel: {
      name: 'Shadow Bulbs',
      rows: ['6a8', '7ac', '129'],
      plug: [2, 1],
      dark: [
        [0, 0],
        [2, 2],
      ],
    },
  },
  {
    name: 'Love Note',
    section: 'intro',
    twists: ['letters'],
    tip: '💌 Letter bulbs sit at wire-step distances that spell the word',
    explain:
      'Count wire steps from the plug to each letter bulb: each numbered blank above the board takes the letter at that exact step distance to spell the secret word.',
    panel: {
      name: 'Love Note',
      rows: ['6ac', '785', '129'],
      plug: [2, 1],
      letters: [
        [1, 2, 'G'],
        [0, 1, 'O'],
      ],
      message: '2 4',
      word: 'GO',
      blanks: [2, 4],
    },
  },
  {
    name: 'Counting Steps',
    section: 'intro',
    twists: ['eggs'],
    tip: '🥚 Reach each numbered egg in that exact step count',
    explain:
      'Power from the plug must reach each numbered egg in that exact number of wire-steps along the string (the egg glows green when its step count matches).',
    panel: {
      name: 'Counting Steps',
      rows: ['2ac', '685', '3a9'],
      plug: [2, 1],
      eggs: [[0, 1, 4]],
    },
  },
  {
    name: 'Two Plugs',
    section: 'intro',
    twists: ['colours'],
    tip: '🎆 Red and Blue plugs power their own colors; white joins either',
    explain:
      'The Red plug powers red tiles and the Blue plug powers blue tiles; white tiles can belong to either string, but the red and blue strings may never touch.',
    panel: {
      name: 'Two Plugs',
      rows: ['6a8', '3a8', '2a8'],
      plug: [1, 0],
      bluePlug: [2, 2],
      colours: ['rrr', 'rrw', 'bbb'],
    },
  },
  {
    name: 'Fair Slices',
    section: 'intro',
    twists: ['slices'],
    tip: '🥧 One wire from * into each slice; no crossing crust walls',
    explain:
      'Each pie slice must receive exactly one wire from the center * across its dotted edge, and no wire may cross a thick crust line between two slices.',
    panel: {
      name: 'Fair Slices',
      rows: ['6a8', '3c4', '2b9'],
      plug: [1, 1],
      slices: ['BBB', 'B*A', 'AAA'],
    },
  },

  // =========================================================================
  // 7–12: Nontrivial Single-Gimmick (`solo`, 6 panels)
  // =========================================================================
  {
    name: 'Icy Windowpane',
    section: 'solo',
    twists: ['snow'],
    tip: '❄️ Frosty frame mirrors wires across the vertical axis',
    explain:
      'Use the frosty frame’s mirror symmetry across the vertical ice line to lock the lower-left tiles in sync with their partners.',
    panel: {
      name: 'Icy Windowpane',
      rows: ['2eae8', '6d47c', '17d15', '45545', '39391'],
      plug: [4, 2],
      frame: { top: 2, left: 0, bottom: 4, right: 3, axis: 'v' },
    },
  },
  {
    name: 'Attic Fuse',
    section: 'solo',
    twists: ['dark'],
    tip: '🎃 Deduce both ? tiles from their surrounding wire ends',
    explain:
      'Wire every visible tile first so the open ends pointing into the two ? squares uniquely determine their hidden connections.',
    panel: {
      name: 'Attic Fuse',
      rows: ['2ac44', '44579', '7bfd4', '7853d', '12b81'],
      plug: [2, 2],
      dark: [
        [3, 0],
        [1, 3],
      ],
    },
  },
  {
    name: 'Crimson Telegram',
    section: 'solo',
    twists: ['letters'],
    tip: '💌 Spell RED at wire-step distances 10, 8, and 3',
    explain:
      'Route the light string from the plug so the R, E, and D bulbs sit at wire-step distances 10, 8, and 3 to spell RED.',
    panel: {
      name: 'Crimson Telegram',
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
    },
  },
  {
    name: 'Third Hop Egg',
    section: 'solo',
    twists: ['eggs'],
    tip: '🥚 Reach the numbered egg in exactly 3 wire-steps',
    explain:
      'Choose the branch orientation near the plug that reaches the numbered egg in exactly 3 steps without stranding any corner.',
    panel: {
      name: 'Third Hop Egg',
      rows: ['4686c', '7b815', '52ec5', '3ad39', '2aba8'],
      plug: [4, 2],
      eggs: [[2, 1, 3]],
    },
  },
  {
    name: 'Patriot Cord',
    section: 'solo',
    twists: ['colours'],
    tip: '🎆 Partition the white border tiles between Red and Blue plugs',
    explain:
      'Decide which white border tiles belong to the Red plug and which belong to the Blue plug so every square is lit without mixing colors.',
    panel: {
      name: 'Patriot Cord',
      rows: ['2c684', '6bba9', '12eec', '2c511', '2bba8'],
      plug: [1, 1],
      bluePlug: [3, 4],
      colours: ['rrrrr', 'rrrrr', 'rbbww', 'wbbbb', 'bbbbb'],
    },
  },
  {
    name: 'Holiday Tart',
    section: 'solo',
    twists: ['slices'],
    tip: '🥧 Feed each slice once from * and respect the crust wall',
    explain:
      'Send one wire from the center * into the top slice and one into the bottom slice while keeping all wires from crossing the crust wall.',
    panel: {
      name: 'Holiday Tart',
      rows: ['6ac44', '16bb9', '2baec', '2ee95', '29129'],
      plug: [2, 2],
      slices: ['BBBBB', 'BBBBB', 'BB*AA', 'AAAAA', 'AAAAA'],
    },
  },

  // =========================================================================
  // 13–27: All 15 Two-Gimmick Combinations (`duo`, 15 panels)
  // =========================================================================
  // 13: snow + dark
  {
    name: 'Black Ice',
    section: 'duo',
    twists: ['snow', 'dark'],
    tip: '❄️ Mirror inside frame · 🎃 ? tiles turn blind',
    explain:
      'Combine frosty mirror symmetry in the lower-right frame with neighbor-wire deduction to solve the two dark ? squares.',
    panel: {
      name: 'Black Ice',
      rows: ['46ae8', '7d47c', '517d1', '52d78', '12938'],
      plug: [4, 2],
      frame: { top: 2, left: 1, bottom: 4, right: 4, axis: 'v' },
      dark: [
        [4, 0],
        [0, 3],
      ],
    },
  },
  // 14: snow + letters
  {
    name: 'Glacier Post',
    section: 'duo',
    twists: ['snow', 'letters'],
    tip: '❄️ Mirror inside frame · 💌 Spell GOLD at 21, 13, 11, 9',
    explain:
      'Inside the frosty frame, wires mirror across the ice line; use both the mirror constraint and the letter bulb distances to spell GOLD.',
    panel: {
      name: 'Glacier Post',
      rows: ['446c6c4', '579553d', '57c116d', '553c695', '5547d45', '53d117d', '3a92a91'],
      plug: [6, 3],
      frame: { top: 0, left: 1, bottom: 4, right: 6, axis: 'v' },
      letters: [
        [4, 2, 'G'],
        [2, 4, 'O'],
        [0, 4, 'L'],
        [3, 5, 'D'],
      ],
      message: '21 13 11 9',
      word: 'GOLD',
      blanks: [21, 13, 11, 9],
    },
  },
  // 15: snow + eggs
  {
    name: 'Frosted Nest',
    section: 'duo',
    twists: ['snow', 'eggs'],
    tip: '❄️ Mirror inside frame · 🥚 Egg at step distance 9',
    explain:
      'Keep the wires inside the frosty frame mirrored across the horizontal ice line while reaching the numbered egg in exactly 9 steps.',
    panel: {
      name: 'Frosted Nest',
      rows: ['6ac6ae8', '547d2b8', '1393e84', '46c6b85', '517d2ed', '3a93ad1', '2aaaab8'],
      plug: [6, 3],
      frame: { top: 0, left: 0, bottom: 5, right: 4, axis: 'h' },
      eggs: [[3, 5, 9]],
    },
  },
  // 16: snow + colours
  {
    name: 'Frozen Sparks',
    section: 'duo',
    twists: ['snow', 'colours'],
    tip: '❄️ Mirror inside frame · 🎆 Separate Red and Blue plugs',
    explain:
      'Mirror the Red string inside the upper-left frosty frame while keeping the Red and Blue strings strictly separated across the right border.',
    panel: {
      name: 'Frozen Sparks',
      rows: ['682c46c', '3c693d1', '47d447c', '3d17d15', '2ba9129'],
      plug: [4, 2],
      bluePlug: [4, 6],
      frame: { top: 0, left: 0, bottom: 2, right: 3, axis: 'v' },
      colours: ['rrrrwbb', 'rrrrbbb', 'rrrrrbb', 'rrrrrbb', 'rrrrrbb'],
    },
  },
  // 17: snow + slices
  {
    name: 'Frosty Slice',
    section: 'duo',
    twists: ['snow', 'slices'],
    tip: '❄️ Mirror inside frame · 🥧 One wire per slice from *',
    explain:
      'Feed each pie slice with a single wire from * while respecting both the crust boundary on the right and the frosty mirror frame on the left.',
    panel: {
      name: 'Frosty Slice',
      rows: ['682c46c', '3c693d1', '47d447c', '3d17d15', '2ba93a9'],
      plug: [4, 5],
      frame: { top: 0, left: 0, bottom: 2, right: 3, axis: 'v' },
      slices: ['BBBBAAA', 'BBBBAAA', 'BBBBBAA', 'BBBBBAA', 'BBBBB*A'],
    },
  },
  // 18: dark + letters
  {
    name: 'Whispered Note',
    section: 'duo',
    twists: ['dark', 'letters'],
    tip: '🎃 ? tiles turn blind · 💌 Spell RED at 8, 11, 12',
    explain:
      'Use the step distances 8, 11, and 12 to spell RED and deduce how the wires must pass through the two hidden ? tiles.',
    panel: {
      name: 'Whispered Note',
      rows: ['46aac', '3b86d', '42e95', '7c529', '13ba8'],
      plug: [4, 2],
      letters: [
        [0, 2, 'R'],
        [1, 2, 'E'],
        [0, 0, 'D'],
      ],
      message: '8 11 12',
      word: 'RED',
      blanks: [8, 11, 12],
      dark: [
        [2, 3],
        [1, 4],
      ],
    },
  },
  // 19: dark + eggs
  {
    name: 'Night Clutch',
    section: 'duo',
    twists: ['dark', 'eggs'],
    tip: '🎃 ? tiles turn blind · 🥚 Egg at step distance 12',
    explain:
      'Reach the center egg in 12 wire-steps from the plug while deducing the two shadowed ? tiles from their neighbors.',
    panel: {
      name: 'Night Clutch',
      rows: ['6ec2c', '553c5', '512b9', '3ae84', '2aba9'],
      plug: [4, 2],
      eggs: [[2, 2, 12]],
      dark: [
        [0, 4],
        [0, 1],
      ],
    },
  },
  // 20: dark + colours
  {
    name: 'Twilight Flare',
    section: 'duo',
    twists: ['dark', 'colours'],
    tip: '🎃 ? tiles turn blind · 🎆 Red and Blue strings never mix',
    explain:
      'Route the Red and Blue plugs through their matching colors and white border tiles to expose the only valid orientation for both ? squares.',
    panel: {
      name: 'Twilight Flare',
      rows: ['46ac4', '512b9', '56e84', '517a9', '3aba8'],
      plug: [0, 2],
      bluePlug: [2, 4],
      colours: ['wrrrr', 'brrwr', 'bbwbb', 'bbbbb', 'bbbbb'],
      dark: [
        [3, 0],
        [2, 3],
      ],
    },
  },
  // 21: dark + slices
  {
    name: 'Shadow Wedge',
    section: 'duo',
    twists: ['dark', 'slices'],
    tip: '🎃 ? tiles turn blind · 🥧 One wire per slice from *',
    explain:
      'Crust walls between slices block cross-slice wires, pinning down the neighbors of the two dark ? tiles.',
    panel: {
      name: 'Shadow Wedge',
      rows: ['2c468', '6b93c', '3ec2d', '2d7ed', '29111'],
      plug: [2, 2],
      slices: ['BBBAA', 'BBBAA', 'BB*AA', 'BBAAA', 'BBAAA'],
      dark: [
        [1, 1],
        [0, 4],
      ],
    },
  },
  // 22: letters + eggs
  {
    name: 'Coded Clutch',
    section: 'duo',
    twists: ['letters', 'eggs'],
    tip: '💌 Spell ICY at 10, 20, 11 · 🥚 Egg at step distance 21',
    explain:
      'Both the numbered egg at 21 steps and the letter bulbs spelling ICY at 10, 20, and 11 steps measure wire distance from the plug.',
    panel: {
      name: 'Coded Clutch',
      rows: ['46aaac4', '3d6a83d', '6b96aed', '542b855', '7b82e95', '52ec569', '3813938'],
      plug: [6, 3],
      eggs: [[4, 2, 21]],
      letters: [
        [3, 4, 'I'],
        [1, 4, 'C'],
        [0, 4, 'Y'],
      ],
      message: '10 20 11',
      word: 'ICY',
      blanks: [10, 20, 11],
    },
  },
  // 23: letters + colours
  {
    name: 'Starlight Courier',
    section: 'duo',
    twists: ['letters', 'colours'],
    tip: '💌 Spell YULE at 8, 7, 11, 10 · 🎆 Separate Red & Blue strings',
    explain:
      'Each letter bulb counts steps from whichever colored plug powers it; split the white border tiles so the bulbs spell YULE.',
    panel: {
      name: 'Starlight Courier',
      rows: ['46ac6a8', '3b87fc4', '46c1555', '3d12979', '6b82c7c', '52ec555', '3a93911'],
      plug: [4, 1],
      bluePlug: [1, 4],
      colours: ['bbbbbbb', 'wbbbbbb', 'rrwbbbb', 'rrrbwbb', 'rrrwrbb', 'rrrrrbb', 'rrrrrbb'],
      letters: [
        [6, 3, 'Y'],
        [5, 1, 'U'],
        [4, 4, 'L'],
        [5, 4, 'E'],
      ],
      message: '8 7 11 10',
      word: 'YULE',
      blanks: [8, 7, 11, 10],
    },
  },
  // 24: letters + slices
  {
    name: 'Baked Cipher',
    section: 'duo',
    twists: ['letters', 'slices'],
    tip: '💌 Spell FIR at 6, 10, 9 · 🥧 One wire per slice from *',
    explain:
      'Send exactly one wire into each pie slice from * and choose the internal branch order that places F, I, and R at distances 6, 10, and 9.',
    panel: {
      name: 'Baked Cipher',
      rows: ['6ac2c', '52bc5', '3e855', '6d6bd', '11381'],
      plug: [2, 3],
      slices: ['BBBAA', 'BBBBA', 'BBB*A', 'BBAAA', 'BBAAA'],
      letters: [
        [1, 0, 'F'],
        [3, 0, 'I'],
        [2, 2, 'R'],
      ],
      message: '6 10 9',
      word: 'FIR',
      blanks: [6, 10, 9],
    },
  },
  // 25: eggs + colours
  {
    name: 'Painted Egg',
    section: 'duo',
    twists: ['eggs', 'colours'],
    tip: '🥚 Egg at step distance 7 · 🎆 Red and Blue strings never mix',
    explain:
      'Power the blue egg in exactly 7 steps from the Blue plug while keeping the Red and Blue strings separate across the white tiles.',
    panel: {
      name: 'Painted Egg',
      rows: ['44684', '3d3e9', '6b838', '52e84', '3aba9'],
      plug: [1, 4],
      bluePlug: [2, 1],
      colours: ['bbwrr', 'bbrrr', 'bbwwr', 'bbbbb', 'bbbbb'],
      eggs: [[3, 1, 7]],
    },
  },
  // 26: eggs + slices
  {
    name: 'Custard Egg',
    section: 'duo',
    twists: ['eggs', 'slices'],
    tip: '🥚 Egg at step distance 9 · 🥧 One wire per slice from *',
    explain:
      'Keep each pie slice fed by a single wire from * and orient the left slice’s inner loop so the egg is reached in 9 steps.',
    panel: {
      name: 'Custard Egg',
      rows: ['44684', '3d3ed', '6b855', '52e95', '3a929'],
      plug: [2, 3],
      slices: ['BBAAA', 'BBAAA', 'BBB*A', 'BBBBA', 'BBBAA'],
      eggs: [[2, 2, 9]],
    },
  },
  // 27: colours + slices
  {
    name: 'Bicentennial Pie',
    section: 'duo',
    twists: ['colours', 'slices'],
    tip: '🎆 Separate Red & Blue strings · 🥧 One wire per slice from *',
    explain:
      'Respect both the pie crust walls between slices and the color boundary between the Red and Blue plugs.',
    panel: {
      name: 'Bicentennial Pie',
      rows: ['46ac6ac', '552d145', '7b812f9', '52eaaf8', '52d4694', '7c17fe9', '1381138'],
      plug: [0, 3],
      slices: ['BBBBAAA', 'BBBBAAA', 'BBBBAAA', 'BBB*AAA', 'BBBAAAA', 'BBBAAAA', 'BBBAAAA'],
      bluePlug: [2, 5],
      colours: ['rrrrbbb', 'rrrrbbb', 'rrwrwbb', 'wbbbbbb', 'rbbbbbb', 'rrbbbbb', 'rrrwbbb'],
    },
  },

  // =========================================================================
  // 28: All 6 Twists Combined (`all6`, 1 boss puzzle)
  // =========================================================================
  {
    name: 'Clause III: Master Tree',
    section: 'all6',
    twists: ['snow', 'dark', 'letters', 'eggs', 'colours', 'slices'],
    tip: '❄️ Snowflake · 🎃 Spooky · 💌 Love-Letter · 🥚 Egg-Hunt · 🎆 Patriotic · 🥧 Portioned',
    explain:
      'All six Lights twists at once: feed both slices from *, keep the frosty frame mirrored, separate the Red and Blue strings, hit the egg in 5 steps, spell JOY at 5-4-7, and deduce both ? tiles.',
    panel: {
      name: 'Clause III: Master Tree',
      rows: ['682c46c', '3c693d1', '47d447c', '3d17d15', '2ba93a9', '2aaaaa8'],
      plug: [4, 5],
      bluePlug: [5, 3],
      frame: { top: 0, left: 0, bottom: 2, right: 3, axis: 'v' },
      slices: ['BBBBAAA', 'BBBBAAA', 'BBBBBAA', 'BBBBBAA', 'BBBBB*A', 'BBBBBBB'],
      colours: ['rrrrrrr', 'rrrrrrr', 'rrrrrrr', 'rrrrrrr', 'rrrrrrr', 'wbbbbbw'],
      eggs: [[1, 5, 5]],
      letters: [
        [4, 2, 'J'],
        [2, 5, 'O'],
        [0, 6, 'Y'],
      ],
      message: '5 4 7',
      word: 'JOY',
      blanks: [5, 4, 7],
      dark: [
        [3, 0],
        [5, 2],
      ],
    },
  },
];

export const CLAUSE_LIGHTS: ClauseDef<LightPanel> = {
  clauseIndex: 2,
  id: 'C3',
  genre: 'lights',
  title: 'Clause III: Christmas · Lights',
  genreTitle: 'Lights',
  icon: '🎄',
  accent: '#2f855a',
  twistOrder: LIGHT_TWIST_ORDER,
  twistMeta: LIGHT_TWISTS_META,
  panels: PANELS,
};
