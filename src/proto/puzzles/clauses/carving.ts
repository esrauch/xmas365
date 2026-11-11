/**
 * Clause II (`C2`): Thanksgiving · Table Carving (`carving`).
 *
 * 22-panel clause gauntlet:
 * - Panels 0–5 (`intro`, 6 panels): Trivial teaching boards (one per twist).
 * - Panels 6–20 (`duo`, 15 panels): All 15 two-twist combinations (`easy`).
 * - Panel 21 (`all6`, 1 panel): Boss puzzle combining all 6 twists at once.
 */
import { CARVE_TWISTS, type Panel as CarvePanel } from '../../../gen/carving';
import type { ClauseDef, ClausePanelItem, TwistMeta } from './types';

export type { CarvePanel };

export const CARVING_TWIST_ORDER = [...CARVE_TWISTS] as const;

export const CARVING_TWISTS: readonly TwistMeta[] = [
  {
    key: 'dark',
    icon: '🎃',
    label: 'Spooky',
    rule: 'A ? clue stands for a rectangle of any area.',
  },
  {
    key: 'letters',
    icon: '💌',
    label: 'Love-Letter',
    rule: 'Same letter = same rectangle area; different letters = different areas. The message blanks spell a word: unscramble it to learn the areas.',
  },
  {
    key: 'colours',
    icon: '🎆',
    label: 'Patriotic',
    rule: 'Each rectangle takes its clue’s red or blue color; same-color rectangles cannot share an edge.',
  },
  {
    key: 'cuts',
    icon: '🥧',
    label: 'Portioned',
    rule: 'Rectangles cannot cross a thick fence line between squares.',
  },
  {
    key: 'snow',
    icon: '❄️',
    label: 'Snowflake',
    rule: 'Inside the frosty frame, cut lines between rectangles mirror across the icy line.',
  },
  {
    key: 'basket',
    icon: '🥚',
    label: 'Egg-Hunt',
    rule: 'Every rectangle must contain one of each food item (🥚, 🥕, 🍫) on the board.',
  },
];

const PANELS: readonly ClausePanelItem<CarvePanel>[] = [
  // ── Indices 0–5: Intro (trivial teaching boards, 1 per twist) ─────────────
  {
    name: 'Mystery Portion',
    section: 'intro',
    twists: ['dark'],
    tip: '🎃 Spooky: A ? clue stands for a rectangle of any area.',
    explain:
      'A ? clue acts like a hidden number: its rectangle still holds exactly one clue, but can have whatever area fits the rest of the board.',
    panel: {
      name: 'Mystery Portion',
      rows: ['3 . .', '? . .', '3 . .'],
    },
  },
  {
    name: 'Coded Menu',
    section: 'intro',
    twists: ['letters'],
    tip: '💌 Love Letters: Same letter = same area; different letters = different areas.',
    explain:
      'Letters replace some area numbers. The numbered message blanks above the board spell a word: unscramble the letters into it to learn each letter’s area.',
    panel: {
      name: 'Coded Menu',
      rows: ['K . .', '. K .', 'S . I'],
      sizeLetters: 'ISK      ',
      message: '3122',
    },
  },
  {
    name: 'Table Linens',
    section: 'intro',
    twists: ['colours'],
    tip: '🎆 Red, White & Blue: Same-color rectangles cannot share an edge.',
    explain:
      'A rectangle takes the red or blue color of its marked square (unmarked rectangles stay plain white). Two red rectangles or two blue rectangles may never share an edge.',
    panel: {
      name: 'Table Linens',
      rows: ['3 . .', '. 3 .', '. . 3'],
      colours: ['r..', '..r', '.b.'],
    },
  },
  {
    name: 'Carving Fence',
    section: 'intro',
    twists: ['cuts'],
    tip: '🥧 Portions: Rectangles cannot cross a thick fence line.',
    explain:
      'Thick brown fence lines between adjacent squares are pre-carved boundaries: no rectangle is allowed to straddle a fence.',
    panel: {
      name: 'Carving Fence',
      rows: ['. 3 .', '3 . .', '. . 3'],
      walls: [[0, 1, 'h']],
    },
  },
  {
    name: 'Frosty Pane',
    section: 'intro',
    twists: ['snow'],
    tip: '❄️ Snowflakes: Cut lines inside the frosty frame mirror across the icy line.',
    explain:
      'Inside the dashed blue frosty frame, every cut line between rectangles must have a matching mirror-image cut across the snowflake axis.',
    panel: {
      name: 'Frosty Pane',
      rows: ['. 2 . 4', '2 . . .', '. . 4 .', '2 . 2 .'],
      frame: { top: 0, left: 0, bottom: 3, right: 2, axis: 'h' },
    },
  },
  {
    name: 'Fair Shares',
    section: 'intro',
    twists: ['basket'],
    tip: '🥚 Easter Baskets: Every rectangle must contain one of each food item.',
    explain:
      'Every carved rectangle must collect an equal share of the basket items on the board (one 🥚 and one 🥕 here), even if a rectangle has no area number at all.',
    panel: {
      name: 'Fair Shares',
      rows: ['🥚 . 🥕', '🥚 🥕 .', '🥕 3 🥚'],
    },
  },

  // ── Indices 6–20: Duo (all 15 two-twist combinations) ─────────────────────
  {
    name: 'Secret Recipe',
    section: 'duo',
    twists: ['dark', 'letters'],
    tip: '🎃 Spooky + 💌 Love Letters: Any-area ? clues meet coded letter areas.',
    explain:
      'Unscramble C, O, and K into the message to learn their areas, while the ? rectangle can take any area at all.',
    panel: {
      name: 'Secret Recipe',
      rows: ['K . . ? .', '. . O . .', '2 . . . .', '. . . C .', '2 . K . O'],
      sizeLetters: ' O K C   ',
      message: '6224',
    },
  },
  {
    name: 'Twilight Pennants',
    section: 'duo',
    twists: ['dark', 'colours'],
    tip: '🎃 Spooky + 🎆 Red, White & Blue: Hidden area with color-clash rules.',
    explain:
      'Work out the ? portion’s footprint while making sure no two red or two blue portions share an edge.',
    panel: {
      name: 'Twilight Pennants',
      rows: ['. 4 . 2 .', '. . . . 2', '. . 5 . .', '. ? . . .', '3 . . 6 .'],
      colours: ['r...b', '...r.', '...b.', '.....', 'b....'],
    },
  },
  {
    name: 'Shadow Fence',
    section: 'duo',
    twists: ['dark', 'cuts'],
    tip: '🎃 Spooky + 🥧 Portions: A ? clue bounded by a thick fence.',
    explain: 'Neither numbered portions nor the ? portion may cross the fence line.',
    panel: {
      name: 'Shadow Fence',
      rows: ['. . . 2 .', '. . 6 . 2', '? . . . .', '. . . 4 .', '5 . . . .'],
      walls: [[0, 3, 'v']],
    },
  },
  {
    name: 'Midnight Frost',
    section: 'duo',
    twists: ['dark', 'snow'],
    tip: '🎃 Spooky + ❄️ Snowflakes: Hidden area and mirrored cuts inside the frame.',
    explain:
      'Symmetry inside the frosty frame constrains how the ? portion in the corner can expand.',
    panel: {
      name: 'Midnight Frost',
      rows: ['. . 3 . .', '. . . 2 .', '. 6 2 . .', '6 . . 2 .', '. . . . ?'],
      frame: { top: 1, left: 2, bottom: 4, right: 4, axis: 'h' },
    },
  },
  {
    name: 'Mystery Basket',
    section: 'duo',
    twists: ['dark', 'basket'],
    tip: '🎃 Spooky + 🥚 Easter Baskets: Every portion needs one 🥚 and one 🥕.',
    explain:
      'Each rectangle—whether numbered, marked ?, or unnumbered—must collect one 🥚 and one 🥕.',
    panel: {
      name: 'Mystery Basket',
      rows: ['. . 6 🥕 .', '. 🥚 🥕 ? 🥚', '. 🥕 🥚 🥕 🥚', '🥚 🥕 3 . .', '. . 🥕 . 🥚'],
    },
  },
  {
    name: 'Ribboned Notes',
    section: 'duo',
    twists: ['letters', 'colours'],
    tip: '💌 Love Letters + 🎆 Red, White & Blue: Coded areas and non-touching colors.',
    explain:
      'Unscramble the clue letters into SWEET to learn their areas and separate same-colored portions.',
    panel: {
      name: 'Ribboned Notes',
      rows: ['W . . . E', '. T . . .', 'E . . S .', '. . . . E', 'E . . 4 .'],
      sizeLetters: ' ETW S   ',
      message: '64223',
      colours: ['...b.', '.....', 'r....', '..r..', '...b.'],
    },
  },
  {
    name: 'Carved Initials',
    section: 'duo',
    twists: ['letters', 'cuts'],
    tip: '💌 Love Letters + 🥧 Portions: Letter areas stopped by a fence.',
    explain:
      'Unscramble the letters into KISS to learn their areas while respecting the fence boundaries.',
    panel: {
      name: 'Carved Initials',
      rows: ['. . K . .', '. 4 . . S', 'I . S . .', '. 2 . S .', '2 . . . 2'],
      sizeLetters: ' ISK     ',
      message: '4233',
      walls: [
        [1, 3, 'h'],
        [1, 1, 'v'],
        [2, 1, 'h'],
        [3, 0, 'h'],
      ],
    },
  },
  {
    name: 'Winter Postcard',
    section: 'duo',
    twists: ['letters', 'snow'],
    tip: '💌 Love Letters + ❄️ Snowflakes: Coded areas with mirrored frame cuts.',
    explain:
      'Unscramble the letters into TREAT to learn their areas while mirroring cuts inside the frosty frame.',
    panel: {
      name: 'Winter Postcard',
      rows: ['. . . T .', 'R . . . .', '. . . 2 .', '2 . A . E', '. A . . .'],
      sizeLetters: ' T AER   ',
      message: '26542',
      frame: { top: 0, left: 1, bottom: 3, right: 4, axis: 'h' },
    },
  },
  {
    name: 'Sweet Parcel',
    section: 'duo',
    twists: ['letters', 'basket'],
    tip: '💌 Love Letters + 🥚 Easter Baskets: Coded areas and fair shares of 🥚 and 🥕.',
    explain:
      'Every rectangle needs one 🥚 and one 🥕 while C, O, and K take the areas from unscrambling COOK.',
    panel: {
      name: 'Sweet Parcel',
      rows: ['. . . K 🥕', '. 🥚 🥕 . 🥚', '🥕 . . 🥚 .', '🥚 . 🥕 . 🥚', '🥕 🥚 O 🥕 C'],
      sizeLetters: '  OC K   ',
      message: '4336',
    },
  },
  {
    name: 'Striped Divider',
    section: 'duo',
    twists: ['colours', 'cuts'],
    tip: '🎆 Red, White & Blue + 🥧 Portions: Keep same colors apart and respect the fence.',
    explain: 'Combine the fence boundary with red/blue adjacency rules to carve the table.',
    panel: {
      name: 'Striped Divider',
      rows: ['. . 2 . 3', '. 2 . 2 .', '. . . . .', '5 . 6 . .', '. 3 . . 2'],
      colours: ['r.br.', '....b', '.....', '....r', '..b..'],
      walls: [[0, 1, 'v']],
    },
  },
  {
    name: 'Glacier Banner',
    section: 'duo',
    twists: ['colours', 'snow'],
    tip: '🎆 Red, White & Blue + ❄️ Snowflakes: Non-touching colors and mirrored cuts.',
    explain:
      'Mirror the cuts inside the frosty frame while preventing red-red or blue-blue edge clashes.',
    panel: {
      name: 'Glacier Banner',
      rows: ['. . . 6 .', '. 4 . . 3', '2 . . . .', '. 4 . . 2', '2 . . 2 .'],
      colours: ['..b..', '.r...', '....r', '.r...', '...b.'],
      frame: { top: 2, left: 0, bottom: 4, right: 3, axis: 'v' },
    },
  },
  {
    name: 'Painted Baskets',
    section: 'duo',
    twists: ['colours', 'basket'],
    tip: '🎆 Red, White & Blue + 🥚 Easter Baskets: Fair shares without color clashes.',
    explain:
      'Every portion collects one 🥚 and one 🥕, and portions of the same color cannot touch.',
    panel: {
      name: 'Painted Baskets',
      rows: ['🥚 🥕 4 . 5', '. 🥚 🥕 . .', '🥕 🥚 . . .', '🥚 . . 🥕 🥚', '3 🥕 . 🥚 🥕'],
      colours: ['..b..', '..r..', '.....', '.....', '..b.r'],
    },
  },
  {
    name: 'Ice Partition',
    section: 'duo',
    twists: ['cuts', 'snow'],
    tip: '🥧 Portions + ❄️ Snowflakes: A fence inside the frosty mirror frame.',
    explain:
      'A fence line forces a cut, and inside the frosty frame that cut must mirror across the axis.',
    panel: {
      name: 'Ice Partition',
      rows: ['. . . 2 .', '. 6 . . .', '. . 2 . .', '. 2 . 2 4', '3 . 4 . .'],
      walls: [[2, 2, 'v']],
      frame: { top: 2, left: 1, bottom: 4, right: 4, axis: 'v' },
    },
  },
  {
    name: 'Fenced Picnic',
    section: 'duo',
    twists: ['cuts', 'basket'],
    tip: '🥧 Portions + 🥚 Easter Baskets: Share 🥚 and 🥕 without crossing the fence.',
    explain: 'Pair every 🥚 with a 🥕 while keeping the fence line as a portion boundary.',
    panel: {
      name: 'Fenced Picnic',
      rows: ['4 🥚 . 🥕 🥕', '🥚 . 🥕 . .', '. . 🥚 . .', '🥕 . . 6 🥚', '🥕 . . 🥚 .'],
      walls: [[4, 3, 'v']],
    },
  },
  {
    name: 'Frosted Basket',
    section: 'duo',
    twists: ['snow', 'basket'],
    tip: '❄️ Snowflakes + 🥚 Easter Baskets: Mirrored cuts and one 🥚 + 🥕 per portion.',
    explain:
      'Every portion needs one 🥚 and one 🥕, and cuts inside the frosty frame must mirror across the vertical line.',
    panel: {
      name: 'Frosted Basket',
      rows: ['🥕 🥚 . . 🥚', '🥚 . . 🥕 .', '🥕 4 🥚 6 🥕', '🥕 🥚 . . .', '. . 🥕 3 🥚'],
      frame: { top: 0, left: 0, bottom: 2, right: 3, axis: 'v' },
    },
  },

  // ── Index 28: All 6 Twists Boss ─────────────────────────────────────────
  {
    name: 'The Grand Carving',
    section: 'all6',
    twists: [...CARVING_TWIST_ORDER],
    tip: '🎃 + 💌 + 🎆 + 🥧 + ❄️ + 🥚: All six holiday twists on one 6×6 table!',
    explain:
      'Every portion collects one 🥚 and one 🥕, respects the fences, separates matching colors, mirrors cuts inside the frosty frame, and decodes COOK and ?.',
    panel: {
      name: 'The Grand Carving',
      rows: [
        '🥚 . . 🥚 🥚 🥚',
        '. 🥕 C . 🥕 .',
        '🥕 🥚 🥚 🥕 ? 🥕',
        '. . . O . 🥕',
        '🥕 . 🥕 . . 🥚',
        '🥚 . . K 🥚 🥕',
      ],
      colours: ['b..rbr', '......', '......', '......', 'r.....', '...b..'],
      sizeLetters: '  K OC   ',
      message: '6553',
      walls: [
        [0, 2, 'v'],
        [1, 2, 'h'],
      ],
      frame: {
        top: 2,
        left: 0,
        bottom: 5,
        right: 2,
        axis: 'h',
      },
    },
  },
];

export const CLAUSE_CARVING: ClauseDef<CarvePanel> = {
  clauseIndex: 1,
  id: 'C2',
  genre: 'carving',
  title: 'Clause II: Thanksgiving · Carving',
  genreTitle: 'Carving',
  icon: '🦃',
  accent: '#8c4a20',
  twistOrder: CARVING_TWIST_ORDER,
  twistMeta: CARVING_TWISTS,
  panels: PANELS,
};
