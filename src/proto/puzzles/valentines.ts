/**
 * Valentine's: the love-letter room (revamp-centerpieces.md).
 * Heartstrings panels in seven runs:
 * - Intro: Love Notes (`lovenotes`, 5 panels, <=7x7)
 * - Home twist: The Valentine Mailbox (`mailbox`, 5 panels, <=7x7, `letters` cipher)
 * - 5 Relic runs (3 panels each, <=7x7):
 *   1. The Jack-o'-Lantern (`jack`, Halloween `dark`)
 *   2. The Bunny's Basket (`basket`, Easter `eggs`)
 *   3. The Watermelon Slice (`watermelon`, Fourth of July `colours`)
 *   4. The Wishbone (`wishbone`, Thanksgiving `cuts`)
 *   5. The Candy Cane (`candycane`, Christmas `snow`)
 */
import { type Panel } from '../../gen/words';
import { run } from '../run';
import { mountWords } from '../wordsBoard';

type StoryPanel = Panel & { tip?: string };

export const LOVENOTES: StoryPanel[] = [
  {
    name: 'One word',
    theme: 'Four letters',
    tip: '💌 Start on the ringed letter and drag through touching letters (diagonals too) to trace the theme word',
    rows: ['LV', 'OE'],
    words: [
      {
        word: 'LOVE',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ],
      },
    ],
  },
  {
    name: 'Two words',
    theme: 'Red for love',
    tip: '💌 Every word starts on a ringed letter, and every letter belongs to exactly one theme word',
    rows: ['TRA', 'EHE', 'SOR'],
    words: [
      {
        word: 'HEART',
        cells: [
          [1, 1],
          [1, 2],
          [0, 2],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'ROSE',
        cells: [
          [2, 2],
          [2, 1],
          [2, 0],
          [1, 0],
        ],
      },
    ],
  },
  {
    name: 'Three words',
    theme: "Cupid's kit",
    tip: '💌 Words can turn in any direction, including diagonals, without crossing',
    rows: ['MIWO', 'AWSR', 'IGRW', 'NABO'],
    words: [
      {
        word: 'ARROW',
        cells: [
          [3, 1],
          [2, 2],
          [1, 3],
          [0, 3],
          [0, 2],
        ],
      },
      {
        word: 'BOW',
        cells: [
          [3, 2],
          [3, 3],
          [2, 3],
        ],
      },
      {
        word: 'WINGS',
        cells: [
          [1, 1],
          [2, 0],
          [3, 0],
          [2, 1],
          [1, 2],
        ],
      },
      {
        word: 'AIM',
        cells: [
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
    ],
  },
  {
    name: 'Long and winding',
    theme: 'Be mine',
    tip: '💌 Long words wind right across the board: let the theme suggest them, then trace from the ring',
    rows: ['VACSS', 'LENAI', 'RTIRK', 'OESND', 'SHUGE'],
    words: [
      {
        word: 'VALENTINE',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
          [1, 2],
          [2, 1],
          [2, 2],
          [3, 3],
          [4, 4],
        ],
      },
      {
        word: 'ROSES',
        cells: [
          [2, 0],
          [3, 0],
          [4, 0],
          [3, 1],
          [3, 2],
        ],
      },
      {
        word: 'CARD',
        cells: [
          [0, 2],
          [1, 3],
          [2, 3],
          [3, 4],
        ],
      },
      {
        word: 'KISS',
        cells: [
          [2, 4],
          [1, 4],
          [0, 4],
          [0, 3],
        ],
      },
      {
        word: 'HUG',
        cells: [
          [4, 1],
          [4, 2],
          [4, 3],
        ],
      },
    ],
  },
  {
    name: "Cupid's kit",
    theme: "Cupid's kit",
    tip: '💌 Trace all eight theme words so every square on the 7×7 grid is covered',
    rows: ['RVIFLER', 'EULCRLU', 'QIBWOOA', 'GULEYBS', 'HLSKRES', 'TAHYAOL', 'RCERMAH'],
    words: [
      {
        word: 'QUIVER',
        cells: [
          [2, 0],
          [1, 1],
          [0, 2],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      },
      {
        word: 'FLIGHT',
        cells: [
          [0, 3],
          [1, 2],
          [2, 1],
          [3, 0],
          [4, 0],
          [5, 0],
        ],
      },
      {
        word: 'LAUREL',
        cells: [
          [1, 5],
          [2, 6],
          [1, 6],
          [0, 6],
          [0, 5],
          [0, 4],
        ],
      },
      {
        word: 'CROSSBOW',
        cells: [
          [1, 3],
          [1, 4],
          [2, 5],
          [3, 6],
          [4, 6],
          [3, 5],
          [2, 4],
          [2, 3],
        ],
      },
      {
        word: 'BULLSEYE',
        cells: [
          [2, 2],
          [3, 1],
          [3, 2],
          [4, 1],
          [4, 2],
          [3, 3],
          [3, 4],
          [4, 5],
        ],
      },
      {
        word: 'MARK',
        cells: [
          [6, 4],
          [5, 4],
          [4, 4],
          [4, 3],
        ],
      },
      {
        word: 'ARCHERY',
        cells: [
          [5, 1],
          [6, 0],
          [6, 1],
          [5, 2],
          [6, 2],
          [6, 3],
          [5, 3],
        ],
      },
      {
        word: 'HALO',
        cells: [
          [6, 6],
          [6, 5],
          [5, 6],
          [5, 5],
        ],
      },
    ],
  },
];

export const MAILBOX: StoryPanel[] = [
  {
    name: 'Secret numbers',
    theme: 'Love notes',
    tip: '💌 Coded numbers stand for hidden letters; every matching number hides the same letter',
    rows: ['ELHCA', 'DSROM', 'DUBLU', 'UEDUR', 'CVOHS'],
    words: [
      {
        word: 'CUDDLE',
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
        word: 'CRUSH',
        cells: [
          [0, 3],
          [1, 2],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'AMOUR',
        cells: [
          [0, 4],
          [1, 4],
          [1, 3],
          [2, 4],
          [3, 4],
        ],
      },
      {
        word: 'BLUSH',
        cells: [
          [2, 2],
          [2, 3],
          [3, 3],
          [4, 4],
          [4, 3],
        ],
      },
      {
        word: 'DOVE',
        cells: [
          [3, 2],
          [4, 2],
          [4, 1],
          [3, 1],
        ],
      },
    ],
    code: 'RS',
  },
  {
    name: 'Whispered code',
    theme: 'Love letters',
    tip: '💌 Find a word through a numbered square to reveal that letter everywhere on the board',
    rows: ['SCRSS', 'EELRE', 'TNOED', 'RBPCD', 'IBARA'],
    words: [
      {
        word: 'SECRET',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
          [1, 1],
          [2, 0],
        ],
      },
      {
        word: 'ADDRESS',
        cells: [
          [4, 4],
          [3, 4],
          [2, 4],
          [1, 3],
          [1, 4],
          [0, 4],
          [0, 3],
        ],
      },
      {
        word: 'PARCEL',
        cells: [
          [3, 2],
          [4, 2],
          [4, 3],
          [3, 3],
          [2, 3],
          [1, 2],
        ],
      },
      {
        word: 'RIBBON',
        cells: [
          [3, 0],
          [4, 0],
          [4, 1],
          [3, 1],
          [2, 2],
          [2, 1],
        ],
      },
    ],
    code: 'BR',
  },
  {
    name: 'Box of sweets',
    theme: 'Sweet treats',
    tip: '💌 Plain words help you deduce which letters the coded numbers stand for',
    rows: ['CEAMAO', 'RJPIOC', 'EUDNGC', 'LDCPLO', 'LOIOLL', 'YOKEPI'],
    words: [
      {
        word: 'CREAM',
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
          [2, 5],
          [1, 4],
          [1, 5],
          [0, 5],
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
          [5, 0],
        ],
      },
      {
        word: 'PUDDING',
        cells: [
          [1, 2],
          [2, 1],
          [3, 1],
          [2, 2],
          [1, 3],
          [2, 3],
          [2, 4],
        ],
      },
      {
        word: 'COOKIE',
        cells: [
          [3, 2],
          [4, 1],
          [5, 1],
          [5, 2],
          [4, 2],
          [5, 3],
        ],
      },
      {
        word: 'LOLLIPOP',
        cells: [
          [4, 5],
          [3, 5],
          [3, 4],
          [4, 4],
          [5, 5],
          [5, 4],
          [4, 3],
          [3, 3],
        ],
      },
    ],
    code: 'PD',
  },
  {
    name: 'Golden cipher',
    theme: 'Sweet treats',
    tip: '💌 Three coded letters hide across the board — crack one to unlock the next',
    rows: ['TREFOMU', 'AEFTSFF', 'TGCHRYI', 'AAMAEUN', 'NTCSRZP', 'NAEGUNI', 'IMKRAAP'],
    words: [
      {
        word: 'TART',
        cells: [
          [2, 0],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'TOFFEE',
        cells: [
          [1, 3],
          [0, 4],
          [0, 3],
          [1, 2],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'MUFFIN',
        cells: [
          [0, 5],
          [0, 6],
          [1, 6],
          [1, 5],
          [2, 6],
          [3, 6],
        ],
      },
      {
        word: 'SYRUP',
        cells: [
          [1, 4],
          [2, 5],
          [2, 4],
          [3, 5],
          [4, 6],
        ],
      },
      {
        word: 'GANACHE',
        cells: [
          [2, 1],
          [3, 0],
          [4, 0],
          [3, 1],
          [2, 2],
          [2, 3],
          [3, 4],
        ],
      },
      {
        word: 'MARZIPAN',
        cells: [
          [3, 2],
          [3, 3],
          [4, 4],
          [4, 5],
          [5, 6],
          [6, 6],
          [6, 5],
          [5, 5],
        ],
      },
      {
        word: 'MINT',
        cells: [
          [6, 1],
          [6, 0],
          [5, 0],
          [4, 1],
        ],
      },
      {
        word: 'CAKE',
        cells: [
          [4, 2],
          [5, 1],
          [6, 2],
          [5, 2],
        ],
      },
      {
        word: 'SUGAR',
        cells: [
          [4, 3],
          [5, 4],
          [5, 3],
          [6, 4],
          [6, 3],
        ],
      },
    ],
    code: 'RNF',
  },
  {
    name: 'The Valentine Mailbox',
    theme: 'Love notes',
    tip: '💌 Decode all three numbered letters to complete the Valentine Mailbox',
    rows: ['DVOTION', 'EPUELCA', 'RABTGNR', 'OENWTEI', 'MEHRUCH', 'IGIRHSE', 'SESPEIR'],
    words: [
      {
        word: 'DEVOTION',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
          [0, 6],
        ],
      },
      {
        word: 'PROMISE',
        cells: [
          [1, 1],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
          [6, 0],
          [6, 1],
        ],
      },
      {
        word: 'BEAU',
        cells: [
          [2, 2],
          [3, 1],
          [2, 1],
          [1, 2],
        ],
      },
      {
        word: 'GENTLE',
        cells: [
          [5, 1],
          [4, 1],
          [3, 2],
          [2, 3],
          [1, 4],
          [1, 3],
        ],
      },
      {
        word: 'CARING',
        cells: [
          [1, 5],
          [1, 6],
          [2, 6],
          [3, 6],
          [2, 5],
          [2, 4],
        ],
      },
      {
        word: 'WHISPER',
        cells: [
          [3, 3],
          [4, 2],
          [5, 2],
          [6, 2],
          [6, 3],
          [6, 4],
          [5, 3],
        ],
      },
      {
        word: 'TRUE',
        cells: [
          [3, 4],
          [4, 3],
          [4, 4],
          [3, 5],
        ],
      },
      {
        word: 'CHERISH',
        cells: [
          [4, 5],
          [4, 6],
          [5, 6],
          [6, 6],
          [6, 5],
          [5, 5],
          [5, 4],
        ],
      },
    ],
    code: 'GAN',
  },
];

export const JACK: StoryPanel[] = [
  {
    name: 'Candle in the dark',
    theme: 'Garden of love',
    tip: '🎃 A ? tile hides a vowel in the dark until you trace a word through it',
    rows: ['LTUSG', 'ONALA', 'DBETR', 'OUMWO', 'UQEAD'],
    words: [
      {
        word: 'LOTUS',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ],
      },
      {
        word: 'GARLAND',
        cells: [
          [0, 4],
          [1, 4],
          [2, 4],
          [1, 3],
          [1, 2],
          [1, 1],
          [2, 0],
        ],
      },
      {
        word: 'BOUQUET',
        cells: [
          [2, 1],
          [3, 0],
          [4, 0],
          [4, 1],
          [3, 1],
          [2, 2],
          [2, 3],
        ],
      },
      {
        word: 'MEADOW',
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
      [4, 0],
      [1, 4],
    ],
  },
  {
    name: 'Ghostly crushes',
    theme: 'Ghostly crushes',
    tip: '🎃 Only vowels go dark, never at a word’s ends: read the consonants around a ? to guess the word',
    rows: ['SPCAN', 'ELMED', 'LKRIL', 'CTVAS', 'IRNET'],
    words: [
      {
        word: 'SPELL',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'CANDLE',
        cells: [
          [0, 2],
          [0, 3],
          [0, 4],
          [1, 4],
          [2, 4],
          [1, 3],
        ],
      },
      {
        word: 'MIST',
        cells: [
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 4],
        ],
      },
      {
        word: 'TRICK',
        cells: [
          [3, 1],
          [4, 1],
          [4, 0],
          [3, 0],
          [2, 1],
        ],
      },
      {
        word: 'RAVEN',
        cells: [
          [2, 2],
          [3, 3],
          [3, 2],
          [4, 3],
          [4, 2],
        ],
      },
    ],
    dark: [
      [1, 0],
      [4, 0],
    ],
  },
  {
    name: "The Jack-o'-Lantern",
    theme: 'Ghostly crushes',
    tip: '🎃 Light up every dark ? square by tracing the theme words through the shadows',
    rows: ['LVEBMDA', 'OTITOKR', 'EHANSSN', 'NOPPUME', 'OMTCAKP', 'ESCNUPI', 'LTAHAEN'],
    words: [
      {
        word: 'DARKNESS',
        cells: [
          [0, 5],
          [0, 6],
          [1, 6],
          [1, 5],
          [2, 6],
          [3, 6],
          [2, 5],
          [2, 4],
        ],
      },
      {
        word: 'PUMPKIN',
        cells: [
          [3, 3],
          [3, 4],
          [3, 5],
          [4, 6],
          [4, 5],
          [5, 6],
          [6, 6],
        ],
      },
      {
        word: 'CAPE',
        cells: [
          [4, 3],
          [4, 4],
          [5, 5],
          [6, 5],
        ],
      },
      {
        word: 'LOVEBITE',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 2],
          [1, 1],
          [2, 0],
        ],
      },
      {
        word: 'HAUNT',
        cells: [
          [6, 3],
          [6, 4],
          [5, 4],
          [5, 3],
          [4, 2],
        ],
      },
      {
        word: 'CASTLE',
        cells: [
          [5, 2],
          [6, 2],
          [5, 1],
          [6, 1],
          [6, 0],
          [5, 0],
        ],
      },
      {
        word: 'PHANTOM',
        cells: [
          [3, 2],
          [2, 1],
          [2, 2],
          [2, 3],
          [1, 3],
          [1, 4],
          [0, 4],
        ],
      },
      {
        word: 'MOON',
        cells: [
          [4, 1],
          [4, 0],
          [3, 1],
          [3, 0],
        ],
      },
    ],
    dark: [
      [4, 0],
      [0, 2],
      [0, 6],
    ],
  },
];

export const BASKET: StoryPanel[] = [
  {
    name: 'Painted eggs',
    theme: 'Spring fling',
    tip: '🥚 A numbered egg gives its letter’s place in its word: 3 or more, since the ringed first letter is 1',
    rows: ['PDDLE', 'USGRA', 'SNWOI', 'AIBNH', 'RGPPO'],
    words: [
      {
        word: 'PUDDLE',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
        ],
      },
      {
        word: 'GRASS',
        cells: [
          [4, 1],
          [4, 0],
          [3, 0],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'HOPPING',
        cells: [
          [3, 4],
          [4, 4],
          [4, 3],
          [4, 2],
          [3, 1],
          [2, 1],
          [1, 2],
        ],
      },
      {
        word: 'RAINBOW',
        cells: [
          [1, 3],
          [1, 4],
          [2, 4],
          [3, 3],
          [3, 2],
          [2, 3],
          [2, 2],
        ],
      },
    ],
    eggs: [
      [3, 0],
      [3, 2],
    ],
  },
  {
    name: 'Moonlit hunt',
    theme: 'Spring fling',
    tip: '🥚 Count steps from a word’s ringed first letter so every egg lands on its number',
    rows: ['SHRBR', 'OEEZE', 'WSLIE', 'UYDFA', 'NNOFD'],
    words: [
      {
        word: 'SHOWER',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'BREEZE',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [2, 4],
          [1, 3],
          [1, 2],
        ],
      },
      {
        word: 'SUNNY',
        cells: [
          [2, 1],
          [3, 0],
          [4, 0],
          [4, 1],
          [3, 1],
        ],
      },
      {
        word: 'DAFFODIL',
        cells: [
          [4, 4],
          [3, 4],
          [4, 3],
          [3, 3],
          [4, 2],
          [3, 2],
          [2, 3],
          [2, 2],
        ],
      },
    ],
    eggs: [
      [1, 2],
      [3, 1],
    ],
  },
  {
    name: "The Bunny's Basket",
    theme: 'Love letters',
    tip: '🥚 Use the numbered eggs to pin down which way repeated letters must wind',
    rows: ['RHSEDRE', 'YINLELP', 'MGPSOTY', 'EORENRT', 'SADMPNE', 'TWSRIAE', 'ORDERPT'],
    words: [
      {
        word: 'RHYME',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
      },
      {
        word: 'SIGNED',
        cells: [
          [0, 2],
          [1, 1],
          [2, 1],
          [1, 2],
          [0, 3],
          [0, 4],
        ],
      },
      {
        word: 'REPLY',
        cells: [
          [0, 5],
          [0, 6],
          [1, 6],
          [1, 5],
          [2, 6],
        ],
      },
      {
        word: 'LETTER',
        cells: [
          [1, 3],
          [1, 4],
          [2, 5],
          [3, 6],
          [4, 6],
          [3, 5],
        ],
      },
      {
        word: 'POST',
        cells: [
          [2, 2],
          [3, 1],
          [4, 0],
          [5, 0],
        ],
      },
      {
        word: 'SONNET',
        cells: [
          [2, 3],
          [2, 4],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 6],
        ],
      },
      {
        word: 'PAPER',
        cells: [
          [6, 5],
          [5, 5],
          [4, 4],
          [3, 3],
          [3, 2],
        ],
      },
      {
        word: 'ADMIRER',
        cells: [
          [4, 1],
          [4, 2],
          [4, 3],
          [5, 4],
          [6, 4],
          [6, 3],
          [5, 3],
        ],
      },
      {
        word: 'WORDS',
        cells: [
          [5, 1],
          [6, 0],
          [6, 1],
          [6, 2],
          [5, 2],
        ],
      },
    ],
    eggs: [
      [5, 2],
      [2, 0],
      [1, 5],
      [3, 6],
    ],
  },
];

export const WATERMELON: StoryPanel[] = [
  {
    name: 'Ribbon bows',
    theme: 'Summer sparks',
    tip: '🎆 Bowed tiles show their word’s Red or Blue color; same-color words never touch orthogonally',
    rows: ['GOWPA', 'LEEDR', 'RIMOA', 'FADFR', 'PMCEE'],
    words: [
      {
        word: 'GLOW',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
        ],
      },
      {
        word: 'PARADE',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [2, 4],
          [1, 3],
          [1, 2],
        ],
      },
      {
        word: 'CAMPFIRE',
        cells: [
          [4, 2],
          [3, 1],
          [4, 1],
          [4, 0],
          [3, 0],
          [2, 1],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'FREEDOM',
        cells: [
          [3, 3],
          [3, 4],
          [4, 4],
          [4, 3],
          [3, 2],
          [2, 3],
          [2, 2],
        ],
      },
    ],
    colours: ['rrr..', 'rb...', 'bbrr.', 'bbrrr', 'bbbrr'],
    bows: [
      [2, 3],
      [1, 1],
      [0, 0],
    ],
  },
  {
    name: 'Summer serenade',
    theme: 'Date night',
    tip: '🎆 Two Red words or two Blue words cannot share an edge, while plain white words touch anything',
    rows: ['HNEBP', 'CSIKA', 'EXAMR', 'RATNE', 'ENDEU'],
    words: [
      {
        word: 'BENCH',
        cells: [
          [0, 3],
          [0, 2],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      },
      {
        word: 'PARK',
        cells: [
          [0, 4],
          [1, 4],
          [2, 4],
          [1, 3],
        ],
      },
      {
        word: 'SERENADE',
        cells: [
          [1, 1],
          [2, 0],
          [3, 0],
          [4, 0],
          [4, 1],
          [3, 1],
          [4, 2],
          [4, 3],
        ],
      },
      {
        word: 'TAXI',
        cells: [
          [3, 2],
          [2, 2],
          [2, 1],
          [1, 2],
        ],
      },
      {
        word: 'MENU',
        cells: [
          [2, 3],
          [3, 4],
          [3, 3],
          [4, 4],
        ],
      },
    ],
    colours: ['....r', '.rbrr', 'rbb.r', 'rrb..', 'rrrr.'],
    bows: [
      [0, 4],
      [3, 1],
      [2, 1],
    ],
  },
  {
    name: 'The Watermelon Slice',
    theme: 'Summer sparks',
    tip: '🎆 Keep same-color words apart and never mix Red and Blue bows in a single word',
    rows: ['ENSUNBU', 'ISREMTR', 'HMSSPMS', 'RTRKRAU', 'AALEFES', 'WBINAIS', 'LAZGLVT'],
    words: [
      {
        word: 'SHINE',
        cells: [
          [1, 1],
          [2, 0],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'SUNBURST',
        cells: [
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
          [0, 6],
          [1, 6],
          [2, 6],
          [1, 5],
        ],
      },
      {
        word: 'SUMMER',
        cells: [
          [4, 6],
          [3, 6],
          [2, 5],
          [1, 4],
          [1, 3],
          [1, 2],
        ],
      },
      {
        word: 'WARM',
        cells: [
          [5, 0],
          [4, 0],
          [3, 0],
          [2, 1],
        ],
      },
      {
        word: 'STAR',
        cells: [
          [2, 2],
          [3, 1],
          [4, 1],
          [3, 2],
        ],
      },
      {
        word: 'SPARKLE',
        cells: [
          [2, 3],
          [2, 4],
          [3, 5],
          [3, 4],
          [3, 3],
          [4, 2],
          [4, 3],
        ],
      },
      {
        word: 'FESTIVAL',
        cells: [
          [4, 4],
          [4, 5],
          [5, 6],
          [6, 6],
          [5, 5],
          [6, 5],
          [5, 4],
          [6, 4],
        ],
      },
      {
        word: 'BLAZING',
        cells: [
          [5, 1],
          [6, 0],
          [6, 1],
          [6, 2],
          [5, 2],
          [5, 3],
          [6, 3],
        ],
      },
    ],
    colours: ['..rrrrr', '..bbbrr', '.br..br', 'brr...b', 'br..rrb', 'b...rrr', '....rrr'],
    bows: [
      [2, 6],
      [1, 2],
      [4, 1],
      [5, 0],
      [3, 1],
      [3, 0],
      [6, 5],
    ],
  },
];

export const WISHBONE: StoryPanel[] = [
  {
    name: 'First fences',
    theme: 'Table for two',
    tip: '🥧 Words cannot step straight across a thick fence bar or diagonally through a fenced corner',
    rows: ['CIATS', 'NPTOO', 'NPSAH', 'ALETE', 'MONPI'],
    words: [
      {
        word: 'CINNAMON',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [4, 1],
          [4, 2],
        ],
      },
      {
        word: 'APPLEPIE',
        cells: [
          [0, 2],
          [1, 1],
          [2, 1],
          [3, 1],
          [3, 2],
          [4, 3],
          [4, 4],
          [3, 4],
        ],
      },
      {
        word: 'HOST',
        cells: [
          [2, 4],
          [1, 4],
          [0, 4],
          [0, 3],
        ],
      },
      {
        word: 'TOAST',
        cells: [
          [1, 2],
          [1, 3],
          [2, 3],
          [2, 2],
          [3, 3],
        ],
      },
    ],
    walls: [
      [2, 3, 'v'],
      [0, 3, 'h'],
      [2, 1, 'v'],
      [2, 4, 'h'],
      [1, 3, 'v'],
      [3, 3, 'v'],
      [0, 2, 'v'],
      [2, 0, 'v'],
    ],
  },
  {
    name: 'Shared dessert',
    theme: 'Table for two',
    tip: '🥧 Trace each word around the fence bars so no step crosses a wall',
    rows: ['RDNET', 'ECRGN', 'IEDTI', 'DNIAS', 'ERNFE'],
    words: [
      {
        word: 'TENDER',
        cells: [
          [0, 4],
          [0, 3],
          [0, 2],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      },
      {
        word: 'CIDER',
        cells: [
          [1, 1],
          [2, 0],
          [3, 0],
          [4, 0],
          [4, 1],
        ],
      },
      {
        word: 'DINNER',
        cells: [
          [2, 2],
          [3, 2],
          [4, 2],
          [3, 1],
          [2, 1],
          [1, 2],
        ],
      },
      {
        word: 'FEASTING',
        cells: [
          [4, 3],
          [4, 4],
          [3, 3],
          [3, 4],
          [2, 3],
          [2, 4],
          [1, 4],
          [1, 3],
        ],
      },
    ],
    walls: [
      [3, 0, 'v'],
      [1, 2, 'v'],
      [2, 2, 'v'],
      [3, 2, 'v'],
      [4, 2, 'v'],
      [0, 2, 'h'],
      [0, 4, 'h'],
      [0, 3, 'h'],
    ],
  },
  {
    name: 'The Wishbone',
    theme: 'Table for two',
    tip: '🥧 Every word bends cleanly around the fences without crossing a single bar',
    rows: ['COVEWIN', 'LNTTTEE', 'IRAWESK', 'KEPICLA', 'PMROTOB', 'AEATRCM', 'NALSEHE'],
    words: [
      {
        word: 'CLOVE',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ],
      },
      {
        word: 'WINE',
        cells: [
          [0, 4],
          [0, 5],
          [0, 6],
          [1, 6],
        ],
      },
      {
        word: 'NAPKIN',
        cells: [
          [6, 0],
          [5, 0],
          [4, 0],
          [3, 0],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'TREAT',
        cells: [
          [1, 2],
          [2, 1],
          [3, 1],
          [2, 2],
          [1, 3],
        ],
      },
      {
        word: 'BASKET',
        cells: [
          [4, 6],
          [3, 6],
          [2, 5],
          [2, 6],
          [1, 5],
          [1, 4],
        ],
      },
      {
        word: 'WELCOME',
        cells: [
          [2, 3],
          [2, 4],
          [3, 5],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 6],
        ],
      },
      {
        word: 'PITCHER',
        cells: [
          [3, 2],
          [3, 3],
          [4, 4],
          [5, 5],
          [6, 5],
          [6, 4],
          [5, 4],
        ],
      },
      {
        word: 'MEAL',
        cells: [
          [4, 1],
          [5, 1],
          [6, 1],
          [6, 2],
        ],
      },
      {
        word: 'ROAST',
        cells: [
          [4, 2],
          [4, 3],
          [5, 2],
          [6, 3],
          [5, 3],
        ],
      },
    ],
    walls: [
      [3, 1, 'h'],
      [5, 3, 'v'],
      [5, 1, 'v'],
      [0, 5, 'h'],
      [1, 4, 'h'],
      [0, 2, 'h'],
      [0, 4, 'h'],
      [0, 3, 'v'],
      [3, 2, 'h'],
      [6, 3, 'v'],
      [4, 1, 'v'],
      [5, 0, 'v'],
      [0, 3, 'h'],
      [3, 0, 'v'],
      [6, 5, 'v'],
    ],
  },
];

export const CANDYCANE: StoryPanel[] = [
  {
    name: 'Frosty pair',
    theme: 'Mistletoe kisses',
    tip: '❄️ Inside the frosty frame, words come in mirror-footprint pairs across the icy line',
    rows: ['FRRA', 'OYMW', 'STHT', 'ENOC', 'IPZY'],
    words: [
      {
        word: 'FROSTY',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [2, 1],
          [1, 1],
        ],
      },
      {
        word: 'PINE',
        cells: [
          [4, 1],
          [4, 0],
          [3, 1],
          [3, 0],
        ],
      },
      {
        word: 'WARMTH',
        cells: [
          [1, 3],
          [0, 3],
          [0, 2],
          [1, 2],
          [2, 3],
          [2, 2],
        ],
      },
      {
        word: 'COZY',
        cells: [
          [3, 3],
          [3, 2],
          [4, 2],
          [4, 3],
        ],
      },
    ],
    frame: { top: 0, bottom: 4, left: 0, right: 3, axis: 'v' },
  },
  {
    name: 'Mirror notes',
    theme: 'Mistletoe kisses',
    tip: '❄️ Each word’s set of squares mirrors another word’s squares across the icy axis',
    rows: ['LBIF', 'LETG', 'LETI', 'TSMT', 'INNE'],
    words: [
      {
        word: 'TINSEL',
        cells: [
          [3, 0],
          [4, 0],
          [4, 1],
          [3, 1],
          [2, 1],
          [2, 0],
        ],
      },
      {
        word: 'BELL',
        cells: [
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
      },
      {
        word: 'MITTEN',
        cells: [
          [3, 2],
          [2, 3],
          [2, 2],
          [3, 3],
          [4, 3],
          [4, 2],
        ],
      },
      {
        word: 'GIFT',
        cells: [
          [1, 3],
          [0, 2],
          [0, 3],
          [1, 2],
        ],
      },
    ],
    frame: { top: 0, bottom: 4, left: 0, right: 3, axis: 'v' },
  },
  {
    name: 'The Candy Cane',
    theme: 'Mistletoe kisses',
    tip: '❄️ Find a word on one half of the frosty frame to spot its twin’s footprint on the other',
    rows: ['REWSIG', 'TNIELH', 'ENAEDE', 'CMRVLB', 'TIOOSN', 'ISLLFO', 'WSHALW'],
    words: [
      {
        word: 'WINTER',
        cells: [
          [0, 2],
          [1, 2],
          [1, 1],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'WISHLIST',
        cells: [
          [6, 0],
          [5, 0],
          [6, 1],
          [6, 2],
          [5, 2],
          [4, 1],
          [5, 1],
          [4, 0],
        ],
      },
      {
        word: 'ROMANCE',
        cells: [
          [3, 2],
          [4, 2],
          [3, 1],
          [2, 2],
          [2, 1],
          [3, 0],
          [2, 0],
        ],
      },
      {
        word: 'SLEIGH',
        cells: [
          [0, 3],
          [1, 4],
          [1, 3],
          [0, 4],
          [0, 5],
          [1, 5],
        ],
      },
      {
        word: 'SNOWFALL',
        cells: [
          [4, 4],
          [4, 5],
          [5, 5],
          [6, 5],
          [5, 4],
          [6, 3],
          [6, 4],
          [5, 3],
        ],
      },
      {
        word: 'BELOVED',
        cells: [
          [3, 5],
          [2, 5],
          [3, 4],
          [4, 3],
          [3, 3],
          [2, 3],
          [2, 4],
        ],
      },
    ],
    frame: { top: 0, bottom: 6, left: 0, right: 5, axis: 'v' },
  },
];

const mountPanel: Parameters<typeof run<StoryPanel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountWords(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag through touching letters (diagonals too) to spell a word; slide back to undo a letter; let go to check it. Every word starts on a ringed letter (the ring fades once it’s found), and every letter is in exactly one theme word. The puzzles teach the rules; open a puzzle number to jump about.';

export const lovenotes = run({
  id: 'lovenotes',
  title: 'Heartstrings',
  room: "Valentine's",
  kind: 'intro',
  from: "Heartstrings · Valentine's, taught puzzle by puzzle",
  rules: CONTROLS,
  panels: LOVENOTES,
  mountPanel,
});

export const mailbox = run({
  id: 'mailbox',
  title: 'Love-Letter Heartstrings',
  room: "Valentine's",
  kind: 'home',
  from: "Love-Letter Heartstrings · Valentine's (Valentine's)",
  rules: `${CONTROLS} (Twist: some letters are written as numbers, the same number always the same letter; find a word through one and it's revealed everywhere, and in the key.)`,
  panels: MAILBOX,
  mountPanel,
});

export const jack = run({
  id: 'jack',
  title: 'Spooky Heartstrings',
  room: "Valentine's",
  kind: 'relic',
  from: "Spooky Heartstrings · Valentine's (Halloween)",
  rules: `${CONTROLS} (Twist: some vowels are in the dark, shown as ?, never at a word's ends; they light up when a word through them is found.)`,
  panels: JACK,
  mountPanel,
});

export const basket = run({
  id: 'basket',
  title: 'Egg-Hunt Heartstrings',
  room: "Valentine's",
  kind: 'relic',
  from: "Egg-Hunt Heartstrings · Valentine's (Easter)",
  rules: `${CONTROLS} (Twist: an egg on a letter gives its place in its word, always 3 or more: the ringed first letter is 1.)`,
  panels: BASKET,
  mountPanel,
});

export const watermelon = run({
  id: 'watermelon',
  title: 'Patriotic Heartstrings',
  room: "Valentine's",
  kind: 'relic',
  from: "Patriotic Heartstrings · Valentine's (Fourth of July)",
  rules: `${CONTROLS} (Twist: bowed letters show their word's red or blue color; two words of the same color never share an edge, while plain white words can touch anything.)`,
  panels: WATERMELON,
  mountPanel,
});

export const wishbone = run({
  id: 'wishbone',
  title: 'Portioned Heartstrings',
  room: "Valentine's",
  kind: 'relic',
  from: "Portioned Heartstrings · Valentine's (Thanksgiving)",
  rules: `${CONTROLS} (Twist: no word may step across a thick fence bar between squares, or diagonally through a fenced corner.)`,
  panels: WISHBONE,
  mountPanel,
});

export const candycane = run({
  id: 'candycane',
  title: 'Snowflake Heartstrings',
  room: "Valentine's",
  kind: 'relic',
  from: "Snowflake Heartstrings · Valentine's (Christmas)",
  rules: `${CONTROLS} (Twist: inside the frosty frame, words come in mirror pairs whose footprints reflect across the icy line.)`,
  panels: CANDYCANE,
  mountPanel,
});
