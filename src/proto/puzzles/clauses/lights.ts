/**
 * Clause III (`C3`): Christmas · Fairy Lights (`lights`) — 22-panel Merger Contract gauntlet.
 *
 * - Panels 0–5 (`intro`, 6 panels): Trivial teaching boards (one per twist in `LIGHT_TWISTS`).
 * - Panels 6–20 (`duo`, 15 panels): All 15 two-twist combinations (`<= 6×6`).
 * - Panel 21 (`all6`, 1 panel): Boss puzzle combining all 6 twists at once (`6×6`).
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
    rule: 'No wire may cross a crust wall between pie slices, so each slice is lit from the center *.',
  },
];

const PANELS: readonly ClausePanelItem<LightPanel>[] = [
  // =========================================================================
  // 0–5: Trivial Twist Re-Explanations (`intro`, 6 panels)
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
      rows: ['2eac4', '47815', '7baa9', '7c42c', '13ba9'],
      plug: [4, 2],
      dark: [
        [3, 4],
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
    tip: '🥧 No wire crosses a crust wall; each slice is lit from *',
    explain:
      'No wire may cross a thick crust line between two slices, so each pie slice is lit from the center * across its dotted edge.',
    panel: {
      name: 'Fair Slices',
      rows: ['6a8', '3c4', '2b9'],
      plug: [1, 1],
      slices: ['BBB', 'B*A', 'AAA'],
    },
  },

  // =========================================================================
  // 6–20: All 15 Two-Twist Combinations (`duo`, 15 panels)
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
    tip: '❄️ Mirror inside frame · 💌 Spell GLOW at 7, 10, 16, 8',
    explain:
      'Inside the frosty frame, wires mirror across the ice line; use both the mirror constraint and the letter bulb distances to spell GLOW.',
    panel: {
      name: 'Glacier Post',
      rows: ['2ea868', '6d447c', '517d15', '5693c5', '3fc6f9', '291138'],
      plug: [5, 3],
      frame: { top: 2, left: 0, bottom: 5, right: 5, axis: 'v' },
      letters: [
        [3, 2, 'G'],
        [5, 1, 'L'],
        [0, 0, 'O'],
        [2, 4, 'W'],
      ],
      message: '7 10 16 8',
      word: 'GLOW',
      blanks: [7, 10, 16, 8],
    },
  },
  // 15: snow + eggs
  {
    name: 'Frosted Nest',
    section: 'duo',
    twists: ['snow', 'eggs'],
    tip: '❄️ Mirror inside frame · 🥚 Egg at step distance 7',
    explain:
      'Keep the wires inside the frosty frame mirrored across the horizontal ice line while reaching the numbered egg in exactly 7 steps.',
    panel: {
      name: 'Frosted Nest',
      rows: ['6aeaec', '12bc15', '2e8529', '6b852c', '52e945', '3abab9'],
      plug: [5, 3],
      frame: { top: 0, left: 2, bottom: 5, right: 5, axis: 'h' },
      eggs: [[3, 2, 7]],
    },
  },
  // 16: snow + colours
  {
    name: 'Frozen Sparks',
    section: 'duo',
    twists: ['snow', 'colours'],
    tip: '❄️ Mirror inside frame · 🎆 Separate Red and Blue plugs',
    explain:
      'Mirror the Red string inside the upper frosty frame while keeping the Red and Blue strings strictly separated across the lower border.',
    panel: {
      name: 'Frozen Sparks',
      rows: ['2c4468', '2fbbf8', '2f82f8', '2d447c', '417d11', '3a93a8'],
      plug: [1, 1],
      bluePlug: [4, 3],
      frame: { top: 0, left: 1, bottom: 3, right: 4, axis: 'v' },
      colours: ['rrrrrr', 'rrrrrr', 'rrwrrr', 'rrbwrr', 'bwbbwr', 'bbbbbb'],
    },
  },
  // 17: snow + slices
  {
    name: 'Frosty Slice',
    section: 'duo',
    twists: ['snow', 'slices'],
    tip: '❄️ Mirror inside frame · 🥧 No wire crosses a crust wall',
    explain:
      'Feed each pie slice with a single wire from * while respecting both the crust boundary on the right and the frosty mirror frame at the bottom.',
    panel: {
      name: 'Frosty Slice',
      rows: ['46a844', '7d447d', '517d15', '545545', '79553d', '3a93a9'],
      plug: [5, 4],
      frame: { top: 2, left: 0, bottom: 5, right: 5, axis: 'v' },
      slices: ['BBBBAA', 'BBBBAA', 'BBBBAA', 'BBBBAA', 'BBBBAA', 'BBBB*A'],
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
    tip: '🎃 ? tiles turn blind · 🥧 No wire crosses a crust wall',
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
    tip: '💌 Spell WAX at 4, 6, 5 · 🥚 Egg at step distance 3',
    explain:
      'Both the numbered egg at 3 steps and the letter bulbs spelling WAX at 4, 6, and 5 steps measure wire distance from the plug.',
    panel: {
      name: 'Coded Clutch',
      rows: ['44468', '53d7c', '52bd1', '3e854', '2bab9'],
      plug: [4, 2],
      eggs: [[3, 2, 3]],
      letters: [
        [2, 2, 'W'],
        [2, 4, 'A'],
        [1, 2, 'X'],
      ],
      message: '4 6 5',
      word: 'WAX',
      blanks: [4, 6, 5],
    },
  },
  // 23: letters + colours
  {
    name: 'Starlight Courier',
    section: 'duo',
    twists: ['letters', 'colours'],
    tip: '💌 Spell YULE at 8, 4, 6, 3 · 🎆 Separate Red & Blue strings',
    explain:
      'Each letter bulb counts steps from whichever colored plug powers it; split the white border tiles so the bulbs spell YULE.',
    panel: {
      name: 'Starlight Courier',
      rows: ['6a86a8', '3ac568', '42b954', '3e82bd', '6bae85', '382ba9'],
      plug: [2, 3],
      bluePlug: [4, 2],
      colours: ['rrrrwr', 'rrrrbb', 'brwrwb', 'bwbbbb', 'bbbbbb', 'bbbbbb'],
      letters: [
        [3, 3, 'Y'],
        [5, 1, 'U'],
        [0, 1, 'L'],
        [5, 2, 'E'],
      ],
      message: '8 4 6 3',
      word: 'YULE',
      blanks: [8, 4, 6, 3],
    },
  },
  // 24: letters + slices
  {
    name: 'Baked Cipher',
    section: 'duo',
    twists: ['letters', 'slices'],
    tip: '💌 Spell FIR at 6, 10, 9 · 🥧 No wire crosses a crust wall',
    explain:
      'Keep every wire inside its pie slice and choose the internal branch order that places F, I, and R at distances 6, 10, and 9.',
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
    tip: '🥚 Egg at step distance 9 · 🥧 No wire crosses a crust wall',
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
    tip: '🎆 Separate Red & Blue strings · 🥧 No wire crosses a crust wall',
    explain:
      'Respect both the pie crust walls between slices and the color boundary between the Red and Blue plugs.',
    panel: {
      name: 'Bicentennial Pie',
      rows: ['42c6ac', '52bd45', '7e8179', '57c2f8', '551478', '1383b8'],
      plug: [3, 2],
      slices: ['BBB*AA', 'BBBBAA', 'BBBBAA', 'BBBAAA', 'BBBAAA', 'BBBAAA'],
      bluePlug: [2, 5],
      colours: ['wbbbbb', 'rbbbbb', 'rwwbbb', 'rrrbbb', 'rrwbbb', 'rrrbbb'],
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
      'All six Lights twists at once: feed both slices from *, keep the frosty frame mirrored, separate the Red and Blue strings, hit the egg in 3 steps, spell JOY at 8-2-5, and deduce both ? tiles.',
    panel: {
      name: 'Clause III: Master Tree',
      rows: ['42a844', '79447d', '517d15', '545545', '79553d', '3a93a9'],
      plug: [5, 4],
      bluePlug: [0, 2],
      frame: { top: 2, left: 0, bottom: 5, right: 5, axis: 'v' },
      slices: ['BBBBAA', 'BBBBAA', 'BBBBAA', 'BBBBAA', 'BBBBAA', 'BBBB*A'],
      colours: ['rbbwrr', 'rrrrrr', 'rrrrrr', 'rrrrrr', 'rrrrrr', 'rrrrrr'],
      eggs: [[3, 5, 3]],
      letters: [
        [5, 2, 'J'],
        [4, 5, 'O'],
        [1, 5, 'Y'],
      ],
      message: '8 2 5',
      word: 'JOY',
      blanks: [8, 2, 5],
      dark: [
        [2, 3],
        [2, 1],
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
