/**
 * Clause IV (`C4`): Valentine's · Heartstrings (`words`)
 * 22-panel Merger Contract gauntlet:
 * - Indices 0–5 (`intro`): 6 compact teaching panels re-explaining each twist.
 * - Indices 6–20 (`duo`): All 15 two-twist combinations (`margin >= 2`).
 * - Index 21 (`all6`): 1 boss panel combining all 6 twists at once.
 */
import type { Panel as WordPanel } from '../../../gen/words';
import type { ClauseDef } from './types';

export const CLAUSE_WORDS: ClauseDef<WordPanel> = {
  clauseIndex: 3,
  id: 'C4',
  genre: 'words',
  title: "Clause IV: Valentine's · Heartstrings",
  genreTitle: 'Heartstrings',
  icon: '💌',
  accent: '#ed64a6',
  twistOrder: ['dark', 'letters', 'colours', 'eggs', 'cuts', 'snow'],
  twistMeta: [
    {
      key: 'dark',
      icon: '🎃',
      label: 'Spooky',
      rule: 'A ? tile hides its letter in the dark until you trace a valid word through it.',
    },
    {
      key: 'letters',
      icon: '💌',
      label: 'Love-Letter',
      rule: 'Numbered tiles (1, 2, …) stand for coded letters; every matching number hides the same letter.',
    },
    {
      key: 'colours',
      icon: '🎆',
      label: 'Patriotic',
      rule: 'Bowed tiles reveal their word’s Red or Blue color; two words of the same color can never touch orthogonally.',
    },
    {
      key: 'eggs',
      icon: '🥚',
      label: 'Egg-Hunt',
      rule: 'A numbered egg tile must be that exact 1-based letter position in its word.',
    },
    {
      key: 'cuts',
      icon: '🥧',
      label: 'Portioned',
      rule: 'A word path cannot step across a thick fence bar or diagonally through a fenced corner.',
    },
    {
      key: 'snow',
      icon: '❄️',
      label: 'Snowflake',
      rule: 'Inside the frosty frame, words come in mirror-footprint pairs across the icy line.',
    },
  ],
  panels: [
    {
      name: 'Intro 1: Spooky',
      section: 'intro',
      twists: ['dark'],
      tip: '🎃 ? tiles hide their letter in the dark',
      explain:
        '🎃 Spooky in Heartstrings: A ? tile hides its letter in the dark—use the surrounding letters and theme to trace a valid word right through it!',
      panel: {
        name: 'Candlelight Note',
        theme: 'Table for two',
        rows: ['ENNA', 'IHTP', 'DRMK', 'AWNI'],
        words: [
          {
            word: 'DINE',
            cells: [
              [2, 0],
              [1, 0],
              [0, 1],
              [0, 0],
            ],
          },
          {
            word: 'NAPKIN',
            cells: [
              [0, 2],
              [0, 3],
              [1, 3],
              [2, 3],
              [3, 3],
              [3, 2],
            ],
          },
          {
            word: 'WARMTH',
            cells: [
              [3, 1],
              [3, 0],
              [2, 1],
              [2, 2],
              [1, 2],
              [1, 1],
            ],
          },
        ],
        dark: [
          [3, 0],
          [1, 0],
        ],
      },
    },
    {
      name: 'Intro 2: Love Letters',
      section: 'intro',
      twists: ['letters'],
      tip: '💌 Matching numbers stand for the same secret letter',
      explain:
        '💌 Love Letters in Heartstrings: Numbered tiles (1, 2, …) form a board-wide cipher where every matching number hides the exact same letter.',
      panel: {
        name: 'Secret Cipher',
        theme: 'Garden of love',
        rows: ['LLAC', 'IGST', 'NPHO', 'IRRN'],
        words: [
          {
            word: 'LILAC',
            cells: [
              [0, 0],
              [1, 0],
              [0, 1],
              [0, 2],
              [0, 3],
            ],
          },
          {
            word: 'SPRING',
            cells: [
              [1, 2],
              [2, 1],
              [3, 1],
              [3, 0],
              [2, 0],
              [1, 1],
            ],
          },
          {
            word: 'THORN',
            cells: [
              [1, 3],
              [2, 2],
              [2, 3],
              [3, 2],
              [3, 3],
            ],
          },
        ],
        code: 'IR',
      },
    },
    {
      name: 'Intro 3: Red, White & Blue',
      section: 'intro',
      twists: ['colours'],
      tip: '🎆 Same-color words (Red or Blue) never touch orthogonally',
      explain:
        '🎆 Red, White & Blue in Heartstrings: Bowed tiles reveal whether their word is Red or Blue; a word never mixes colors, and two words of the same color cannot touch orthogonally.',
      panel: {
        name: 'Ribbon Bows',
        theme: 'Sweetheart pair',
        rows: ['KIRO', 'SSES'],
        words: [
          {
            word: 'KISS',
            cells: [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
            ],
          },
          {
            word: 'ROSE',
            cells: [
              [0, 2],
              [0, 3],
              [1, 3],
              [1, 2],
            ],
          },
        ],
        colours: ['rrbb', 'rrbb'],
        bows: [
          [0, 0],
          [1, 1],
          [0, 2],
          [1, 2],
        ],
      },
    },
    {
      name: 'Intro 4: Egg Hunt',
      section: 'intro',
      twists: ['eggs'],
      tip: '🥚 Numbered egg = that exact 1-based letter position in its word',
      explain:
        '🥚 Egg Hunt in Heartstrings: A numbered egg tile must be visited at that exact 1-based letter index when tracing its word.',
      panel: {
        name: 'Numbered Eggs',
        theme: 'Sweet treats',
        rows: ['BER', 'ACR', 'EKY'],
        words: [
          {
            word: 'BERRY',
            cells: [
              [0, 0],
              [0, 1],
              [0, 2],
              [1, 2],
              [2, 2],
            ],
          },
          {
            word: 'CAKE',
            cells: [
              [1, 1],
              [1, 0],
              [2, 1],
              [2, 0],
            ],
          },
        ],
        eggs: [
          [0, 2],
          [2, 0],
        ],
      },
    },
    {
      name: 'Intro 5: Portions',
      section: 'intro',
      twists: ['cuts'],
      tip: '🥧 Words cannot cross thick fence bars or fenced corners',
      explain:
        '🥧 Portions in Heartstrings: Thick fence bars divide neighboring tiles; a word path can never step straight across a fence or diagonally through a fenced corner.',
      panel: {
        name: 'Fenced Portions',
        theme: 'Love notes',
        rows: ['CHA', 'OVR', 'DEM'],
        words: [
          {
            word: 'CHARM',
            cells: [
              [0, 0],
              [0, 1],
              [0, 2],
              [1, 2],
              [2, 2],
            ],
          },
          {
            word: 'DOVE',
            cells: [
              [2, 0],
              [1, 0],
              [1, 1],
              [2, 1],
            ],
          },
        ],
        walls: [
          [0, 0, 'h'],
          [0, 1, 'h'],
          [1, 1, 'v'],
          [2, 1, 'v'],
        ],
      },
    },
    {
      name: 'Intro 6: Snowflakes',
      section: 'intro',
      twists: ['snow'],
      tip: '❄️ Words inside the frosty frame come in mirror-footprint pairs',
      explain:
        '❄️ Snowflakes in Heartstrings: Inside the frosty frame, every word’s tile footprint mirrors a partner word’s footprint across the icy line (spelled in a different order), and no word crosses the frame.',
      panel: {
        name: 'Mirror Snowflakes',
        theme: 'Love notes',
        rows: ['LORD', 'EVAE'],
        words: [
          {
            word: 'LOVE',
            cells: [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
            ],
          },
          {
            word: 'DEAR',
            cells: [
              [0, 3],
              [1, 3],
              [1, 2],
              [0, 2],
            ],
          },
        ],
        frame: {
          top: 0,
          bottom: 1,
          left: 0,
          right: 3,
          axis: 'v',
        },
      },
    },
    {
      name: 'Combo: Spooky + Love Letters',
      section: 'duo',
      twists: ['dark', 'letters'],
      tip: '🎃 Spooky + 💌 Love Letters',
      explain:
        '🎃 Spooky (A ? tile hides its letter in the dark until you trace a valid word through it.) combined with 💌 Love Letters (Numbered tiles (1, 2, …) stand for coded letters; every matching number hides the same letter.)',
      panel: {
        name: 'Spooky + Love Letters',
        theme: 'Sweet treats',
        rows: ['EKUCW', 'APLLO', 'CAGPY', 'MNUCD', 'IDDAN'],
        words: [
          {
            word: 'CUPCAKE',
            cells: [
              [0, 3],
              [0, 2],
              [1, 1],
              [2, 0],
              [1, 0],
              [0, 1],
              [0, 0],
            ],
          },
          {
            word: 'MALLOW',
            cells: [
              [3, 0],
              [2, 1],
              [1, 2],
              [1, 3],
              [1, 4],
              [0, 4],
            ],
          },
          {
            word: 'PUDDING',
            cells: [
              [2, 3],
              [3, 2],
              [4, 2],
              [4, 1],
              [4, 0],
              [3, 1],
              [2, 2],
            ],
          },
          {
            word: 'CANDY',
            cells: [
              [3, 3],
              [4, 3],
              [4, 4],
              [3, 4],
              [2, 4],
            ],
          },
        ],
        dark: [
          [0, 1],
          [1, 4],
        ],
        code: 'CA',
      },
    },
    {
      name: 'Combo: Spooky + Red, White & Blue',
      section: 'duo',
      twists: ['dark', 'colours'],
      tip: '🎃 Spooky + 🎆 Red, White & Blue',
      explain:
        '🎃 Spooky (A ? tile hides its letter in the dark until you trace a valid word through it.) combined with 🎆 Red, White & Blue (Bowed tiles reveal their word’s Red or Blue color; two words of the same color can never touch orthogonally.)',
      panel: {
        name: 'Spooky + Red, White & Blue',
        theme: 'Mistletoe kisses',
        rows: ['ORENT', 'NMARE', 'AODNI', 'CERWS', 'OCEON'],
        words: [
          {
            word: 'ORNAMENT',
            cells: [
              [0, 0],
              [0, 1],
              [1, 0],
              [2, 0],
              [1, 1],
              [0, 2],
              [0, 3],
              [0, 4],
            ],
          },
          {
            word: 'COCOA',
            cells: [
              [4, 1],
              [4, 0],
              [3, 0],
              [2, 1],
              [1, 2],
            ],
          },
          {
            word: 'REINDEER',
            cells: [
              [1, 3],
              [1, 4],
              [2, 4],
              [2, 3],
              [2, 2],
              [3, 1],
              [4, 2],
              [3, 2],
            ],
          },
          {
            word: 'SNOW',
            cells: [
              [3, 4],
              [4, 4],
              [4, 3],
              [3, 3],
            ],
          },
        ],
        colours: ['rrrrr', 'rrb..', 'rb...', 'b..bb', 'bb.bb'],
        bows: [
          [0, 2],
          [2, 1],
          [1, 2],
          [2, 0],
          [4, 4],
        ],
        dark: [
          [4, 4],
          [0, 1],
        ],
      },
    },
    {
      name: 'Combo: Spooky + Egg Hunt',
      section: 'duo',
      twists: ['dark', 'eggs'],
      tip: '🎃 Spooky + 🥚 Egg Hunt',
      explain:
        '🎃 Spooky (A ? tile hides its letter in the dark until you trace a valid word through it.) combined with 🥚 Egg Hunt (A numbered egg tile must be that exact 1-based letter position in its word.)',
      panel: {
        name: 'Spooky + Egg Hunt',
        theme: 'Mistletoe kisses',
        rows: ['TSRNC', 'IOATE', 'LMGIF', 'HWEGO', 'SIGGN'],
        words: [
          {
            word: 'WISHLIST',
            cells: [
              [3, 1],
              [4, 1],
              [4, 0],
              [3, 0],
              [2, 0],
              [1, 0],
              [0, 1],
              [0, 0],
            ],
          },
          {
            word: 'ROMANCE',
            cells: [
              [0, 2],
              [1, 1],
              [2, 1],
              [1, 2],
              [0, 3],
              [0, 4],
              [1, 4],
            ],
          },
          {
            word: 'GIFT',
            cells: [
              [2, 2],
              [2, 3],
              [2, 4],
              [1, 3],
            ],
          },
          {
            word: 'EGGNOG',
            cells: [
              [3, 2],
              [4, 2],
              [4, 3],
              [4, 4],
              [3, 4],
              [3, 3],
            ],
          },
        ],
        dark: [
          [3, 0],
          [0, 3],
        ],
        eggs: [
          [3, 3],
          [1, 4],
        ],
      },
    },
    {
      name: 'Combo: Spooky + Portions',
      section: 'duo',
      twists: ['dark', 'cuts'],
      tip: '🎃 Spooky + 🥧 Portions',
      explain:
        '🎃 Spooky (A ? tile hides its letter in the dark until you trace a valid word through it.) combined with 🥧 Portions (A word path cannot step across a thick fence bar or diagonally through a fenced corner.)',
      panel: {
        name: 'Spooky + Portions',
        theme: 'Sweet treats',
        rows: ['FDGEA', 'UJCOO', 'EEOTC', 'LEFTR', 'LYFAT'],
        words: [
          {
            word: 'FUDGE',
            cells: [
              [0, 0],
              [1, 0],
              [0, 1],
              [0, 2],
              [0, 3],
            ],
          },
          {
            word: 'COCOA',
            cells: [
              [1, 2],
              [1, 3],
              [2, 4],
              [1, 4],
              [0, 4],
            ],
          },
          {
            word: 'JELLY',
            cells: [
              [1, 1],
              [2, 0],
              [3, 0],
              [4, 0],
              [4, 1],
            ],
          },
          {
            word: 'TOFFEE',
            cells: [
              [2, 3],
              [2, 2],
              [3, 2],
              [4, 2],
              [3, 1],
              [2, 1],
            ],
          },
          {
            word: 'TART',
            cells: [
              [4, 4],
              [4, 3],
              [3, 4],
              [3, 3],
            ],
          },
        ],
        dark: [
          [0, 1],
          [1, 4],
        ],
        walls: [
          [2, 3, 'h'],
          [3, 0, 'v'],
          [1, 2, 'h'],
          [1, 1, 'v'],
          [4, 2, 'v'],
          [3, 2, 'v'],
          [2, 4, 'h'],
          [0, 3, 'h'],
        ],
      },
    },
    {
      name: 'Combo: Spooky + Snowflakes',
      section: 'duo',
      twists: ['dark', 'snow'],
      tip: '🎃 Spooky + ❄️ Snowflakes',
      explain:
        '🎃 Spooky (A ? tile hides its letter in the dark until you trace a valid word through it.) combined with ❄️ Snowflakes (Inside the frosty frame, words come in mirror-footprint pairs across the icy line.)',
      panel: {
        name: 'Spooky + Snowflakes',
        theme: 'Garden of love',
        rows: ['GANG', 'DRPI', 'NERS', 'FAIL', 'ELYL'],
        words: [
          {
            word: 'GARDEN',
            cells: [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
              [2, 1],
              [2, 0],
            ],
          },
          {
            word: 'LEAF',
            cells: [
              [4, 1],
              [4, 0],
              [3, 1],
              [3, 0],
            ],
          },
          {
            word: 'SPRING',
            cells: [
              [2, 3],
              [1, 2],
              [2, 2],
              [1, 3],
              [0, 2],
              [0, 3],
            ],
          },
          {
            word: 'LILY',
            cells: [
              [4, 3],
              [3, 2],
              [3, 3],
              [4, 2],
            ],
          },
        ],
        frame: {
          top: 0,
          bottom: 4,
          left: 0,
          right: 3,
          axis: 'v',
        },
        dark: [
          [4, 0],
          [3, 3],
        ],
      },
    },
    {
      name: 'Combo: Love Letters + Red, White & Blue',
      section: 'duo',
      twists: ['letters', 'colours'],
      tip: '💌 Love Letters + 🎆 Red, White & Blue',
      explain:
        '💌 Love Letters (Numbered tiles (1, 2, …) stand for coded letters; every matching number hides the same letter.) combined with 🎆 Red, White & Blue (Bowed tiles reveal their word’s Red or Blue color; two words of the same color can never touch orthogonally.)',
      panel: {
        name: 'Love Letters + Red, White & Blue',
        theme: 'Sweet treats',
        rows: ['EKUCT', 'APUGA', 'CODCT', 'NRUTA', 'ATSRE'],
        words: [
          {
            word: 'CUPCAKE',
            cells: [
              [0, 3],
              [0, 2],
              [1, 1],
              [2, 0],
              [1, 0],
              [0, 1],
              [0, 0],
            ],
          },
          {
            word: 'NOUGAT',
            cells: [
              [3, 0],
              [2, 1],
              [1, 2],
              [1, 3],
              [1, 4],
              [0, 4],
            ],
          },
          {
            word: 'CUSTARD',
            cells: [
              [2, 3],
              [3, 2],
              [4, 2],
              [4, 1],
              [4, 0],
              [3, 1],
              [2, 2],
            ],
          },
          {
            word: 'TREAT',
            cells: [
              [3, 3],
              [4, 3],
              [4, 4],
              [3, 4],
              [2, 4],
            ],
          },
        ],
        colours: ['bbbbr', 'bbrrr', 'br..b', 'r..bb', '...bb'],
        bows: [
          [1, 2],
          [0, 0],
          [2, 4],
        ],
        code: 'UE',
      },
    },
    {
      name: 'Combo: Love Letters + Egg Hunt',
      section: 'duo',
      twists: ['letters', 'eggs'],
      tip: '💌 Love Letters + 🥚 Egg Hunt',
      explain:
        '💌 Love Letters (Numbered tiles (1, 2, …) stand for coded letters; every matching number hides the same letter.) combined with 🥚 Egg Hunt (A numbered egg tile must be that exact 1-based letter position in its word.)',
      panel: {
        name: 'Love Letters + Egg Hunt',
        theme: 'Love letters',
        rows: ['ADERA', 'DTSTE', 'ROAMD', 'ENERP', 'SSSEV'],
        words: [
          {
            word: 'ADDRESS',
            cells: [
              [0, 0],
              [0, 1],
              [1, 0],
              [2, 0],
              [3, 0],
              [4, 0],
              [4, 1],
            ],
          },
          {
            word: 'NOTE',
            cells: [
              [3, 1],
              [2, 1],
              [1, 1],
              [0, 2],
            ],
          },
          {
            word: 'DEAR',
            cells: [
              [2, 4],
              [1, 4],
              [0, 4],
              [0, 3],
            ],
          },
          {
            word: 'STAMP',
            cells: [
              [1, 2],
              [1, 3],
              [2, 2],
              [2, 3],
              [3, 4],
            ],
          },
          {
            word: 'VERSE',
            cells: [
              [4, 4],
              [4, 3],
              [3, 3],
              [4, 2],
              [3, 2],
            ],
          },
        ],
        code: 'TR',
        eggs: [
          [4, 1],
          [1, 1],
        ],
      },
    },
    {
      name: 'Combo: Love Letters + Portions',
      section: 'duo',
      twists: ['letters', 'cuts'],
      tip: '💌 Love Letters + 🥧 Portions',
      explain:
        '💌 Love Letters (Numbered tiles (1, 2, …) stand for coded letters; every matching number hides the same letter.) combined with 🥧 Portions (A word path cannot step across a thick fence bar or diagonally through a fenced corner.)',
      panel: {
        name: 'Love Letters + Portions',
        theme: 'Love letters',
        rows: ['MIERA', 'STRHE', 'SOYMD', 'INERE', 'VESEV'],
        words: [
          {
            word: 'MISSIVE',
            cells: [
              [0, 0],
              [0, 1],
              [1, 0],
              [2, 0],
              [3, 0],
              [4, 0],
              [4, 1],
            ],
          },
          {
            word: 'NOTE',
            cells: [
              [3, 1],
              [2, 1],
              [1, 1],
              [0, 2],
            ],
          },
          {
            word: 'DEAR',
            cells: [
              [2, 4],
              [1, 4],
              [0, 4],
              [0, 3],
            ],
          },
          {
            word: 'RHYME',
            cells: [
              [1, 2],
              [1, 3],
              [2, 2],
              [2, 3],
              [3, 4],
            ],
          },
          {
            word: 'VERSE',
            cells: [
              [4, 4],
              [4, 3],
              [3, 3],
              [4, 2],
              [3, 2],
            ],
          },
        ],
        code: 'SR',
        walls: [
          [3, 4, 'h'],
          [4, 1, 'v'],
          [2, 2, 'h'],
          [0, 3, 'h'],
          [1, 3, 'v'],
          [2, 1, 'v'],
          [3, 1, 'v'],
          [3, 1, 'h'],
        ],
      },
    },
    {
      name: 'Combo: Love Letters + Snowflakes',
      section: 'duo',
      twists: ['letters', 'snow'],
      tip: '💌 Love Letters + ❄️ Snowflakes',
      explain:
        '💌 Love Letters (Numbered tiles (1, 2, …) stand for coded letters; every matching number hides the same letter.) combined with ❄️ Snowflakes (Inside the frosty frame, words come in mirror-footprint pairs across the icy line.)',
      panel: {
        name: 'Love Letters + Snowflakes',
        theme: 'Love notes',
        rows: ['EUOD', 'RTVE', 'ECER', 'LUDT', 'DDNE'],
        words: [
          {
            word: 'CUDDLE',
            cells: [
              [2, 1],
              [3, 1],
              [4, 1],
              [4, 0],
              [3, 0],
              [2, 0],
            ],
          },
          {
            word: 'TRUE',
            cells: [
              [1, 1],
              [1, 0],
              [0, 1],
              [0, 0],
            ],
          },
          {
            word: 'TENDER',
            cells: [
              [3, 3],
              [4, 3],
              [4, 2],
              [3, 2],
              [2, 2],
              [2, 3],
            ],
          },
          {
            word: 'DOVE',
            cells: [
              [0, 3],
              [0, 2],
              [1, 2],
              [1, 3],
            ],
          },
        ],
        frame: {
          top: 0,
          bottom: 4,
          left: 0,
          right: 3,
          axis: 'v',
        },
        code: 'RT',
      },
    },
    {
      name: 'Combo: Red, White & Blue + Egg Hunt',
      section: 'duo',
      twists: ['colours', 'eggs'],
      tip: '🎆 Red, White & Blue + 🥚 Egg Hunt',
      explain:
        '🎆 Red, White & Blue (Bowed tiles reveal their word’s Red or Blue color; two words of the same color can never touch orthogonally.) combined with 🥚 Egg Hunt (A numbered egg tile must be that exact 1-based letter position in its word.)',
      panel: {
        name: 'Red, White & Blue + Egg Hunt',
        theme: 'Table for two',
        rows: ['RHCDI', 'ETAPN', 'ISUPE', 'PPPIL', 'EREPE'],
        words: [
          {
            word: 'PITCHER',
            cells: [
              [3, 0],
              [2, 0],
              [1, 1],
              [0, 2],
              [0, 1],
              [1, 0],
              [0, 0],
            ],
          },
          {
            word: 'DINE',
            cells: [
              [0, 3],
              [0, 4],
              [1, 4],
              [2, 4],
            ],
          },
          {
            word: 'APPLEPIE',
            cells: [
              [1, 2],
              [1, 3],
              [2, 3],
              [3, 4],
              [4, 4],
              [4, 3],
              [3, 3],
              [4, 2],
            ],
          },
          {
            word: 'SUPPER',
            cells: [
              [2, 1],
              [2, 2],
              [3, 2],
              [3, 1],
              [4, 0],
              [4, 1],
            ],
          },
        ],
        colours: ['...bb', '..rrb', '.bbrb', '.bbrr', 'bbrrr'],
        bows: [
          [4, 3],
          [2, 4],
          [4, 2],
          [3, 2],
        ],
        eggs: [
          [3, 1],
          [2, 0],
        ],
      },
    },
    {
      name: 'Combo: Red, White & Blue + Portions',
      section: 'duo',
      twists: ['colours', 'cuts'],
      tip: '🎆 Red, White & Blue + 🥧 Portions',
      explain:
        '🎆 Red, White & Blue (Bowed tiles reveal their word’s Red or Blue color; two words of the same color can never touch orthogonally.) combined with 🥧 Portions (A word path cannot step across a thick fence bar or diagonally through a fenced corner.)',
      panel: {
        name: 'Red, White & Blue + Portions',
        theme: 'Love letters',
        rows: ['DEKRE', 'NEVET', 'GESRT', 'IPKEE', 'SSAEL'],
        words: [
          {
            word: 'SIGNED',
            cells: [
              [4, 0],
              [3, 0],
              [2, 0],
              [1, 0],
              [0, 1],
              [0, 0],
            ],
          },
          {
            word: 'KEEPSAKE',
            cells: [
              [0, 2],
              [1, 1],
              [2, 1],
              [3, 1],
              [4, 1],
              [4, 2],
              [3, 2],
              [4, 3],
            ],
          },
          {
            word: 'LETTER',
            cells: [
              [4, 4],
              [3, 4],
              [2, 4],
              [1, 4],
              [0, 4],
              [0, 3],
            ],
          },
          {
            word: 'VERSE',
            cells: [
              [1, 2],
              [1, 3],
              [2, 3],
              [2, 2],
              [3, 3],
            ],
          },
        ],
        colours: ['rrb..', 'rbrr.', 'rbrr.', 'rbbr.', 'rbbb.'],
        bows: [
          [4, 0],
          [1, 1],
          [1, 0],
          [4, 1],
          [3, 3],
        ],
        walls: [
          [2, 1, 'v'],
          [3, 3, 'v'],
          [1, 3, 'v'],
          [0, 2, 'v'],
          [2, 3, 'v'],
          [4, 3, 'v'],
          [0, 3, 'h'],
          [2, 0, 'v'],
        ],
      },
    },
    {
      name: 'Combo: Red, White & Blue + Snowflakes',
      section: 'duo',
      twists: ['colours', 'snow'],
      tip: '🎆 Red, White & Blue + ❄️ Snowflakes',
      explain:
        '🎆 Red, White & Blue (Bowed tiles reveal their word’s Red or Blue color; two words of the same color can never touch orthogonally.) combined with ❄️ Snowflakes (Inside the frosty frame, words come in mirror-footprint pairs across the icy line.)',
      panel: {
        name: 'Red, White & Blue + Snowflakes',
        theme: 'Spring fling',
        rows: ['SNNU', 'UNNB', 'YYYS', 'SISG', 'DARA'],
        words: [
          {
            word: 'SUNNY',
            cells: [
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
              [2, 1],
            ],
          },
          {
            word: 'DAISY',
            cells: [
              [4, 0],
              [4, 1],
              [3, 1],
              [3, 0],
              [2, 0],
            ],
          },
          {
            word: 'BUNNY',
            cells: [
              [1, 3],
              [0, 3],
              [0, 2],
              [1, 2],
              [2, 2],
            ],
          },
          {
            word: 'GRASS',
            cells: [
              [3, 3],
              [4, 2],
              [4, 3],
              [3, 2],
              [2, 3],
            ],
          },
        ],
        frame: {
          top: 0,
          bottom: 4,
          left: 0,
          right: 3,
          axis: 'v',
        },
        colours: ['rrbb', 'rrbb', 'brbr', 'bbrr', 'bbrr'],
        bows: [
          [1, 1],
          [2, 2],
          [0, 1],
          [1, 2],
          [1, 3],
          [2, 1],
          [3, 0],
          [3, 2],
        ],
      },
    },
    {
      name: 'Combo: Egg Hunt + Portions',
      section: 'duo',
      twists: ['eggs', 'cuts'],
      tip: '🥚 Egg Hunt + 🥧 Portions',
      explain:
        '🥚 Egg Hunt (A numbered egg tile must be that exact 1-based letter position in its word.) combined with 🥧 Portions (A word path cannot step across a thick fence bar or diagonally through a fenced corner.)',
      panel: {
        name: 'Egg Hunt + Portions',
        theme: 'Love notes',
        rows: ['LOED', 'EVAR', 'OERO', 'RSPE', 'TALE'],
        words: [
          {
            word: 'LOVE',
            cells: [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
            ],
          },
          {
            word: 'DEAR',
            cells: [
              [0, 3],
              [0, 2],
              [1, 2],
              [1, 3],
            ],
          },
          {
            word: 'EROS',
            cells: [
              [2, 1],
              [3, 0],
              [2, 0],
              [3, 1],
            ],
          },
          {
            word: 'ROPE',
            cells: [
              [2, 2],
              [2, 3],
              [3, 2],
              [3, 3],
            ],
          },
          {
            word: 'TALE',
            cells: [
              [4, 0],
              [4, 1],
              [4, 2],
              [4, 3],
            ],
          },
        ],
        eggs: [
          [2, 1],
          [2, 2],
        ],
        walls: [
          [0, 1, 'v'],
          [1, 1, 'v'],
          [1, 0, 'h'],
          [1, 3, 'h'],
          [2, 1, 'v'],
          [3, 1, 'v'],
          [3, 0, 'h'],
          [3, 3, 'h'],
        ],
      },
    },
    {
      name: 'Combo: Egg Hunt + Snowflakes',
      section: 'duo',
      twists: ['eggs', 'snow'],
      tip: '🥚 Egg Hunt + ❄️ Snowflakes',
      explain:
        '🥚 Egg Hunt (A numbered egg tile must be that exact 1-based letter position in its word.) combined with ❄️ Snowflakes (Inside the frosty frame, words come in mirror-footprint pairs across the icy line.)',
      panel: {
        name: 'Egg Hunt + Snowflakes',
        theme: 'Date night',
        rows: ['SASA', 'RTOT', 'ESTM', 'LAEO', 'BTVI'],
        words: [
          {
            word: 'TABLE',
            cells: [
              [4, 1],
              [3, 1],
              [4, 0],
              [3, 0],
              [2, 0],
            ],
          },
          {
            word: 'STARS',
            cells: [
              [2, 1],
              [1, 1],
              [0, 1],
              [1, 0],
              [0, 0],
            ],
          },
          {
            word: 'MOVIE',
            cells: [
              [2, 3],
              [3, 3],
              [4, 2],
              [4, 3],
              [3, 2],
            ],
          },
          {
            word: 'TOAST',
            cells: [
              [2, 2],
              [1, 2],
              [0, 3],
              [0, 2],
              [1, 3],
            ],
          },
        ],
        frame: {
          top: 0,
          bottom: 4,
          left: 0,
          right: 3,
          axis: 'v',
        },
        eggs: [
          [2, 1],
          [1, 3],
        ],
      },
    },
    {
      name: 'Combo: Portions + Snowflakes',
      section: 'duo',
      twists: ['cuts', 'snow'],
      tip: '🥧 Portions + ❄️ Snowflakes',
      explain:
        '🥧 Portions (A word path cannot step across a thick fence bar or diagonally through a fenced corner.) combined with ❄️ Snowflakes (Inside the frosty frame, words come in mirror-footprint pairs across the icy line.)',
      panel: {
        name: 'Portions + Snowflakes',
        theme: 'Love notes',
        rows: ['LOED', 'EVAR', 'OERO', 'RSPE', 'NOTE'],
        words: [
          {
            word: 'LOVE',
            cells: [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
            ],
          },
          {
            word: 'DEAR',
            cells: [
              [0, 3],
              [0, 2],
              [1, 2],
              [1, 3],
            ],
          },
          {
            word: 'ROSE',
            cells: [
              [3, 0],
              [2, 0],
              [3, 1],
              [2, 1],
            ],
          },
          {
            word: 'ROPE',
            cells: [
              [2, 2],
              [2, 3],
              [3, 2],
              [3, 3],
            ],
          },
          {
            word: 'NOTE',
            cells: [
              [4, 0],
              [4, 1],
              [4, 2],
              [4, 3],
            ],
          },
        ],
        frame: {
          top: 0,
          bottom: 1,
          left: 0,
          right: 3,
          axis: 'v',
        },
        walls: [
          [0, 1, 'v'],
          [1, 1, 'v'],
          [1, 0, 'h'],
          [1, 3, 'h'],
          [2, 1, 'v'],
          [3, 1, 'v'],
          [3, 0, 'h'],
          [3, 3, 'h'],
        ],
      },
    },
    {
      name: 'Boss: All 6 Twists Combined',
      section: 'all6',
      twists: ['dark', 'letters', 'colours', 'eggs', 'cuts', 'snow'],
      tip: '🎃 Spooky · 💌 Love-Letter · 🎆 Patriotic · 🥚 Egg-Hunt · 🥧 Portioned · ❄️ Snowflake',
      explain:
        'Final Clause IV Boss: All 6 holiday twists active at once—dark ? tiles, numbered cipher tiles, Red/Blue bows, numbered egg positions, fence cuts, and frosty mirror-footprint pairs!',
      panel: {
        name: 'Clause IV Finale: Full Heartstrings',
        theme: 'Love notes',
        rows: ['LOKS', 'EVIS', 'OECA', 'RSRE', 'DOVE'],
        words: [
          {
            word: 'LOVE',
            cells: [
              [0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
            ],
          },
          {
            word: 'KISS',
            cells: [
              [0, 2],
              [1, 2],
              [0, 3],
              [1, 3],
            ],
          },
          {
            word: 'ROSE',
            cells: [
              [3, 0],
              [2, 0],
              [3, 1],
              [2, 1],
            ],
          },
          {
            word: 'CARE',
            cells: [
              [2, 2],
              [2, 3],
              [3, 2],
              [3, 3],
            ],
          },
          {
            word: 'DOVE',
            cells: [
              [4, 0],
              [4, 1],
              [4, 2],
              [4, 3],
            ],
          },
        ],
        frame: {
          top: 0,
          bottom: 1,
          left: 0,
          right: 3,
          axis: 'v',
        },
        dark: [[3, 2]],
        code: 'KS',
        colours: ['bbrr', 'bbrr', 'rrww', 'rrww', 'bbbb'],
        bows: [
          [3, 0],
          [4, 1],
        ],
        eggs: [
          [3, 2],
          [1, 2],
        ],
        walls: [
          [0, 1, 'v'],
          [1, 1, 'v'],
          [1, 0, 'h'],
          [1, 2, 'h'],
          [1, 3, 'h'],
          [2, 1, 'v'],
          [3, 1, 'v'],
          [3, 3, 'h'],
        ],
      },
    },
  ],
};
