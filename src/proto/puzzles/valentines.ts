/**
 * Valentine's: the love-letter room (revamp-centerpieces.md).
 * Heartstrings (Strands) panels in seven runs:
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
import { mountStrands } from '../strandsBoard';

type StoryPanel = Panel & { tip?: string };

export const LOVENOTES: StoryPanel[] = [
  {
    name: 'One word',
    theme: 'Four letters',
    tip: '💌 Drag through touching letters (diagonals too) to trace the theme word',
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
    tip: '💌 Every letter on the board belongs to exactly one theme word',
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
    name: 'Side to side',
    theme: 'Be mine',
    tip: '💌 A spangram runs all the way from one side of the board to the opposite side',
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
    spangram: true,
  },
  {
    name: "Cupid's kit",
    theme: "Cupid's kit",
    tip: '💌 Trace all nine theme words so every square on the 7×7 grid is covered',
    rows: ['GNTGOAR', 'IETLDOR', 'RGAQUIW', 'TRCCLEV', 'SHKRSOR', 'EBALNAU', 'RUMADSD'],
    words: [
      {
        word: 'STRING',
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
        word: 'TARGET',
        cells: [
          [1, 2],
          [2, 2],
          [3, 1],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'GOLD',
        cells: [
          [0, 3],
          [0, 4],
          [1, 3],
          [1, 4],
        ],
      },
      {
        word: 'ARROW',
        cells: [
          [0, 5],
          [0, 6],
          [1, 6],
          [1, 5],
          [2, 6],
        ],
      },
      {
        word: 'QUIVER',
        cells: [
          [2, 3],
          [2, 4],
          [2, 5],
          [3, 6],
          [3, 5],
          [4, 6],
        ],
      },
      {
        word: 'CHERUB',
        cells: [
          [3, 2],
          [4, 1],
          [5, 0],
          [6, 0],
          [6, 1],
          [5, 1],
        ],
      },
      {
        word: 'CLOUD',
        cells: [
          [3, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 6],
        ],
      },
      {
        word: 'MARK',
        cells: [
          [6, 2],
          [5, 2],
          [4, 3],
          [4, 2],
        ],
      },
      {
        word: 'SANDALS',
        cells: [
          [6, 5],
          [5, 5],
          [5, 4],
          [6, 4],
          [6, 3],
          [5, 3],
          [4, 4],
        ],
      },
    ],
  },
];

export const MAILBOX: StoryPanel[] = [
  {
    name: 'Secret numbers',
    theme: "Cupid's kit",
    tip: '💌 Coded numbers stand for hidden letters; every matching number hides the same letter',
    rows: ['THBHA', 'GUCPR', 'IRLHS', 'LEOAS', 'FHCUD'],
    words: [
      {
        word: 'FLIGHT',
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
        word: 'CHERUB',
        cells: [
          [4, 2],
          [4, 1],
          [3, 1],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'HARP',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [1, 3],
        ],
      },
      {
        word: 'CLOUD',
        cells: [
          [1, 2],
          [2, 2],
          [3, 2],
          [4, 3],
          [4, 4],
        ],
      },
      {
        word: 'SASH',
        cells: [
          [3, 4],
          [3, 3],
          [2, 4],
          [2, 3],
        ],
      },
    ],
    code: 'CL',
  },
  {
    name: 'Whispered code',
    theme: 'Love notes',
    tip: '💌 Find a word through a numbered square to reveal that letter everywhere on the board',
    rows: ['CHEUC', 'ALDGN', 'RDLRI', 'MKSOA', 'ISEVC'],
    words: [
      {
        word: 'CHARM',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
      },
      {
        word: 'CUDDLE',
        cells: [
          [0, 4],
          [0, 3],
          [1, 2],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'CARING',
        cells: [
          [4, 4],
          [3, 4],
          [2, 3],
          [2, 4],
          [1, 4],
          [1, 3],
        ],
      },
      {
        word: 'LOVE',
        cells: [
          [2, 2],
          [3, 3],
          [4, 3],
          [4, 2],
        ],
      },
      {
        word: 'KISS',
        cells: [
          [3, 1],
          [4, 0],
          [4, 1],
          [3, 2],
        ],
      },
    ],
    code: 'EL',
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
    theme: "Cupid's kit",
    tip: '💌 Three coded letters hide across the board — crack one to unlock the next',
    rows: ['GNTGOAR', 'IETLDOR', 'RGAQUIW', 'TRCCLEV', 'SHKRSOR', 'EBALNAU', 'RUMADSD'],
    words: [
      {
        word: 'STRING',
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
        word: 'TARGET',
        cells: [
          [1, 2],
          [2, 2],
          [3, 1],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'GOLD',
        cells: [
          [0, 3],
          [0, 4],
          [1, 3],
          [1, 4],
        ],
      },
      {
        word: 'ARROW',
        cells: [
          [0, 5],
          [0, 6],
          [1, 6],
          [1, 5],
          [2, 6],
        ],
      },
      {
        word: 'QUIVER',
        cells: [
          [2, 3],
          [2, 4],
          [2, 5],
          [3, 6],
          [3, 5],
          [4, 6],
        ],
      },
      {
        word: 'CHERUB',
        cells: [
          [3, 2],
          [4, 1],
          [5, 0],
          [6, 0],
          [6, 1],
          [5, 1],
        ],
      },
      {
        word: 'CLOUD',
        cells: [
          [3, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 6],
        ],
      },
      {
        word: 'MARK',
        cells: [
          [6, 2],
          [5, 2],
          [4, 3],
          [4, 2],
        ],
      },
      {
        word: 'SANDALS',
        cells: [
          [6, 5],
          [5, 5],
          [5, 4],
          [6, 4],
          [6, 3],
          [5, 3],
          [4, 4],
        ],
      },
    ],
    code: 'CLE',
  },
  {
    name: 'The Valentine Mailbox',
    theme: 'Love notes',
    tip: '💌 Decode all three numbered letters to complete the Valentine Mailbox',
    rows: ['CHEEGRE', 'ALNDAND', 'RTNILRE', 'MGYENOT', 'CHTRKIH', 'HSAHSTU', 'ERIESRE'],
    words: [
      {
        word: 'CHARM',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
      },
      {
        word: 'GENTLE',
        cells: [
          [0, 4],
          [0, 3],
          [1, 2],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'TENDER',
        cells: [
          [3, 6],
          [2, 6],
          [1, 5],
          [1, 6],
          [0, 6],
          [0, 5],
        ],
      },
      {
        word: 'DARLING',
        cells: [
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 4],
          [2, 3],
          [2, 2],
          [3, 1],
        ],
      },
      {
        word: 'CHERISH',
        cells: [
          [4, 0],
          [5, 0],
          [6, 0],
          [6, 1],
          [6, 2],
          [5, 1],
          [4, 1],
        ],
      },
      {
        word: 'KISS',
        cells: [
          [4, 4],
          [4, 5],
          [5, 4],
          [6, 4],
        ],
      },
      {
        word: 'TRUE',
        cells: [
          [5, 5],
          [6, 5],
          [5, 6],
          [6, 6],
        ],
      },
      {
        word: 'HONEY',
        cells: [
          [4, 6],
          [3, 5],
          [3, 4],
          [3, 3],
          [3, 2],
        ],
      },
      {
        word: 'HEART',
        cells: [
          [5, 3],
          [6, 3],
          [5, 2],
          [4, 3],
          [4, 2],
        ],
      },
    ],
    code: 'GTA',
  },
];

export const JACK: StoryPanel[] = [
  {
    name: 'Candle in the dark',
    theme: "Cupid's kit",
    tip: '🎃 A ? tile hides its letter in the dark until you trace a valid word through it',
    rows: ['THBHA', 'GUCPR', 'IRLHS', 'LEOAS', 'FHCUD'],
    words: [
      {
        word: 'FLIGHT',
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
        word: 'CHERUB',
        cells: [
          [4, 2],
          [4, 1],
          [3, 1],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'HARP',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [1, 3],
        ],
      },
      {
        word: 'CLOUD',
        cells: [
          [1, 2],
          [2, 2],
          [3, 2],
          [4, 3],
          [4, 4],
        ],
      },
      {
        word: 'SASH',
        cells: [
          [3, 4],
          [3, 3],
          [2, 4],
          [2, 3],
        ],
      },
    ],
    dark: [[0, 4]],
  },
  {
    name: 'Ghostly crushes',
    theme: 'Ghostly crushes',
    tip: '🎃 Dark letters are never a word’s first or last letter — use the visible ends to guide you',
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
    rows: ['TRSHCAP', 'IKANIKE', 'CDSOPUP', 'OBITULM', 'WDETENM', 'HCMYPSA', 'ARKOOET'],
    words: [
      {
        word: 'TRICK',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'SHADOW',
        cells: [
          [0, 2],
          [0, 3],
          [1, 2],
          [2, 1],
          [3, 0],
          [4, 0],
        ],
      },
      {
        word: 'CAPE',
        cells: [
          [0, 4],
          [0, 5],
          [0, 6],
          [1, 6],
        ],
      },
      {
        word: 'PUMPKIN',
        cells: [
          [2, 4],
          [2, 5],
          [3, 6],
          [2, 6],
          [1, 5],
          [1, 4],
          [1, 3],
        ],
      },
      {
        word: 'SOULMATE',
        cells: [
          [2, 2],
          [2, 3],
          [3, 4],
          [3, 5],
          [4, 6],
          [5, 6],
          [6, 6],
          [6, 5],
        ],
      },
      {
        word: 'BITTEN',
        cells: [
          [3, 1],
          [3, 2],
          [3, 3],
          [4, 3],
          [4, 4],
          [4, 5],
        ],
      },
      {
        word: 'CHARMED',
        cells: [
          [5, 1],
          [5, 0],
          [6, 0],
          [6, 1],
          [5, 2],
          [4, 2],
          [4, 1],
        ],
      },
      {
        word: 'SPOOKY',
        cells: [
          [5, 5],
          [5, 4],
          [6, 4],
          [6, 3],
          [6, 2],
          [5, 3],
        ],
      },
    ],
    dark: [
      [2, 6],
      [6, 2],
      [1, 0],
    ],
  },
];

export const BASKET: StoryPanel[] = [
  {
    name: 'Painted eggs',
    theme: 'Garden of love',
    tip: '🥚 A numbered egg on a letter gives its exact 1-based place in its word',
    rows: ['GNSLO', 'IPNST', 'RESRU', 'MBLAO', 'OOVTH'],
    words: [
      {
        word: 'SPRING',
        cells: [
          [0, 2],
          [1, 1],
          [2, 0],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'LOTUS',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [2, 4],
          [1, 3],
        ],
      },
      {
        word: 'THORN',
        cells: [
          [4, 3],
          [4, 4],
          [3, 4],
          [2, 3],
          [1, 2],
        ],
      },
      {
        word: 'VASE',
        cells: [
          [4, 2],
          [3, 3],
          [2, 2],
          [2, 1],
        ],
      },
      {
        word: 'BLOOM',
        cells: [
          [3, 1],
          [3, 2],
          [4, 1],
          [4, 0],
          [3, 0],
        ],
      },
    ],
    eggs: [
      [2, 4],
      [2, 2],
    ],
  },
  {
    name: 'Moonlit hunt',
    theme: 'Ghostly crushes',
    tip: '🥚 Count steps from the start of a word so every egg lands on its number',
    rows: ['MSTRA', 'INSEV', 'IPLLN', 'GEBTE', 'HTITN'],
    words: [
      {
        word: 'MIST',
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 2],
        ],
      },
      {
        word: 'RAVEN',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [1, 3],
          [2, 4],
        ],
      },
      {
        word: 'NIGHT',
        cells: [
          [1, 1],
          [2, 0],
          [3, 0],
          [4, 0],
          [4, 1],
        ],
      },
      {
        word: 'SPELL',
        cells: [
          [1, 2],
          [2, 1],
          [3, 1],
          [2, 2],
          [2, 3],
        ],
      },
      {
        word: 'BITTEN',
        cells: [
          [3, 2],
          [4, 2],
          [3, 3],
          [4, 3],
          [3, 4],
          [4, 4],
        ],
      },
    ],
    eggs: [
      [1, 0],
      [2, 4],
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
    theme: "Cupid's kit",
    tip: '🎆 Bowed tiles show their word’s Red or Blue color; same-color words never touch orthogonally',
    rows: ['DOGFL', 'LTAGI', 'ORBUH', 'HRRCT', 'SOWEH'],
    words: [
      {
        word: 'GOLD',
        cells: [
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
          [0, 4],
          [1, 4],
          [1, 3],
          [2, 4],
          [3, 4],
        ],
      },
      {
        word: 'SHOT',
        cells: [
          [4, 0],
          [3, 0],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'ARROW',
        cells: [
          [1, 2],
          [2, 1],
          [3, 1],
          [4, 1],
          [4, 2],
        ],
      },
      {
        word: 'CHERUB',
        cells: [
          [3, 3],
          [4, 4],
          [4, 3],
          [3, 2],
          [2, 3],
          [2, 2],
        ],
      },
    ],
    colours: ['.....', '.br..', 'brbb.', 'brbb.', 'brrbb'],
    bows: [
      [1, 1],
      [4, 1],
      [3, 2],
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
    theme: 'Love notes',
    tip: '🎆 Keep same-color words apart and never mix Red and Blue bows in a single word',
    rows: ['CHEEGRE', 'ALNPRND', 'RTSIMOE', 'MEHSULT', 'PNFEDEB', 'AOLMAKS', 'SSIARIS'],
    words: [
      {
        word: 'CHARM',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
      },
      {
        word: 'GENTLE',
        cells: [
          [0, 4],
          [0, 3],
          [1, 2],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'TENDER',
        cells: [
          [3, 6],
          [2, 6],
          [1, 5],
          [1, 6],
          [0, 6],
          [0, 5],
        ],
      },
      {
        word: 'PROMISE',
        cells: [
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 4],
          [2, 3],
          [2, 2],
          [3, 1],
        ],
      },
      {
        word: 'BLUSH',
        cells: [
          [4, 6],
          [3, 5],
          [3, 4],
          [3, 3],
          [3, 2],
        ],
      },
      {
        word: 'PASSION',
        cells: [
          [4, 0],
          [5, 0],
          [6, 0],
          [6, 1],
          [6, 2],
          [5, 1],
          [4, 1],
        ],
      },
      {
        word: 'FLAME',
        cells: [
          [4, 2],
          [5, 2],
          [6, 3],
          [5, 3],
          [4, 3],
        ],
      },
      {
        word: 'DEAR',
        cells: [
          [4, 4],
          [4, 5],
          [5, 4],
          [6, 4],
        ],
      },
      {
        word: 'KISS',
        cells: [
          [5, 5],
          [6, 5],
          [5, 6],
          [6, 6],
        ],
      },
    ],
    colours: ['rr...rr', 'r..bbrr', 'r.bbbbr', 'rb....r', '..rrbb.', '..rrbrr', '...rbrr'],
    bows: [
      [0, 0],
      [0, 5],
      [1, 3],
      [4, 3],
      [5, 4],
      [6, 5],
    ],
  },
];

export const WISHBONE: StoryPanel[] = [
  {
    name: 'First fences',
    theme: "Cupid's kit",
    tip: '🥧 Words cannot step straight across a thick fence bar or diagonally through a fenced corner',
    rows: ['THLDA', 'GEHTR', 'IREHS', 'LUAAS', 'FALRT'],
    words: [
      {
        word: 'FLIGHT',
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
        word: 'LAUREL',
        cells: [
          [4, 2],
          [4, 1],
          [3, 1],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'DART',
        cells: [
          [0, 3],
          [0, 4],
          [1, 4],
          [1, 3],
        ],
      },
      {
        word: 'HEART',
        cells: [
          [1, 2],
          [2, 2],
          [3, 2],
          [4, 3],
          [4, 4],
        ],
      },
      {
        word: 'SASH',
        cells: [
          [3, 4],
          [3, 3],
          [2, 4],
          [2, 3],
        ],
      },
    ],
    walls: [
      [2, 2, 'v'],
      [3, 0, 'v'],
      [3, 1, 'v'],
      [1, 3, 'h'],
      [2, 0, 'v'],
      [3, 4, 'h'],
      [1, 2, 'v'],
      [4, 0, 'v'],
    ],
  },
  {
    name: 'Shared dessert',
    theme: 'Sweet treats',
    tip: '🥧 Trace each word around the fence bars so no step crosses a wall',
    rows: ['EACTE', 'KTFRB', 'RGDUO', 'AEMFS', 'TUFIN'],
    words: [
      {
        word: 'CAKE',
        cells: [
          [0, 2],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      },
      {
        word: 'SORBET',
        cells: [
          [3, 4],
          [2, 4],
          [1, 3],
          [1, 4],
          [0, 4],
          [0, 3],
        ],
      },
      {
        word: 'TART',
        cells: [
          [4, 0],
          [3, 0],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'FUDGE',
        cells: [
          [1, 2],
          [2, 3],
          [2, 2],
          [2, 1],
          [3, 1],
        ],
      },
      {
        word: 'MUFFIN',
        cells: [
          [3, 2],
          [4, 1],
          [4, 2],
          [3, 3],
          [4, 3],
          [4, 4],
        ],
      },
    ],
    walls: [
      [2, 2, 'h'],
      [2, 3, 'h'],
      [3, 4, 'h'],
      [3, 0, 'v'],
      [3, 3, 'v'],
      [0, 2, 'h'],
      [1, 1, 'v'],
      [4, 0, 'v'],
    ],
  },
  {
    name: 'The Wishbone',
    theme: 'Love notes',
    tip: '🥧 Every word bends cleanly around the fences without crossing a single bar',
    rows: ['CHEUCGN', 'ALDPRRI', 'RDSIMOA', 'MEYENOC', 'PNCHDEH', 'AORSATU', 'SSIURRE'],
    words: [
      {
        word: 'CHARM',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
      },
      {
        word: 'CUDDLE',
        cells: [
          [0, 4],
          [0, 3],
          [1, 2],
          [2, 1],
          [1, 1],
          [0, 2],
        ],
      },
      {
        word: 'CARING',
        cells: [
          [3, 6],
          [2, 6],
          [1, 5],
          [1, 6],
          [0, 6],
          [0, 5],
        ],
      },
      {
        word: 'PROMISE',
        cells: [
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 4],
          [2, 3],
          [2, 2],
          [3, 1],
        ],
      },
      {
        word: 'HONEY',
        cells: [
          [4, 6],
          [3, 5],
          [3, 4],
          [3, 3],
          [3, 2],
        ],
      },
      {
        word: 'PASSION',
        cells: [
          [4, 0],
          [5, 0],
          [6, 0],
          [6, 1],
          [6, 2],
          [5, 1],
          [4, 1],
        ],
      },
      {
        word: 'CRUSH',
        cells: [
          [4, 2],
          [5, 2],
          [6, 3],
          [5, 3],
          [4, 3],
        ],
      },
      {
        word: 'DEAR',
        cells: [
          [4, 4],
          [4, 5],
          [5, 4],
          [6, 4],
        ],
      },
      {
        word: 'TRUE',
        cells: [
          [5, 5],
          [6, 5],
          [5, 6],
          [6, 6],
        ],
      },
    ],
    walls: [
      [6, 4, 'v'],
      [4, 6, 'h'],
      [2, 3, 'h'],
      [2, 4, 'h'],
      [2, 5, 'h'],
      [3, 3, 'h'],
      [3, 4, 'h'],
      [0, 4, 'h'],
      [5, 3, 'v'],
      [4, 3, 'v'],
      [3, 0, 'v'],
      [6, 3, 'v'],
      [3, 1, 'h'],
      [2, 0, 'v'],
      [3, 0, 'h'],
    ],
  },
];

export const CANDYCANE: StoryPanel[] = [
  {
    name: 'Frosty pair',
    theme: "Cupid's kit",
    tip: '❄️ Inside the frosty frame, words come in mirror-footprint pairs across the icy line',
    rows: ['DASH', 'RTAS', 'CHLR', 'UEEU', 'BRLA'],
    words: [
      {
        word: 'CHERUB',
        cells: [
          [2, 0],
          [2, 1],
          [3, 1],
          [4, 1],
          [3, 0],
          [4, 0],
        ],
      },
      {
        word: 'DART',
        cells: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ],
      },
      {
        word: 'LAUREL',
        cells: [
          [4, 2],
          [4, 3],
          [3, 3],
          [2, 3],
          [3, 2],
          [2, 2],
        ],
      },
      {
        word: 'SASH',
        cells: [
          [0, 2],
          [1, 2],
          [1, 3],
          [0, 3],
        ],
      },
    ],
    frame: { top: 0, bottom: 4, left: 0, right: 3, axis: 'v' },
  },
  {
    name: 'Mirror notes',
    theme: 'Love notes',
    tip: '❄️ Each word’s set of squares mirrors another word’s squares across the icy axis',
    rows: ['EMLE', 'AFAG', 'MLNY', 'RCEH', 'AHON'],
    words: [
      {
        word: 'FLAME',
        cells: [
          [1, 1],
          [2, 1],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'CHARM',
        cells: [
          [3, 1],
          [4, 1],
          [4, 0],
          [3, 0],
          [2, 0],
        ],
      },
      {
        word: 'ANGEL',
        cells: [
          [1, 2],
          [2, 2],
          [1, 3],
          [0, 3],
          [0, 2],
        ],
      },
      {
        word: 'HONEY',
        cells: [
          [3, 3],
          [4, 2],
          [4, 3],
          [3, 2],
          [2, 3],
        ],
      },
    ],
    frame: { top: 0, bottom: 4, left: 0, right: 3, axis: 'v' },
  },
  {
    name: 'The Candy Cane',
    theme: 'Sweet treats',
    tip: '❄️ Find a word on one half of the frosty frame to spot its twin’s footprint on the other',
    rows: ['TIMCKE', 'ENUCAA', 'GDFOCO', 'RTRLET', 'WEUMTR', 'AFFAEA', 'ELFRAC'],
    words: [
      {
        word: 'MINT',
        cells: [
          [0, 2],
          [0, 1],
          [1, 1],
          [0, 0],
        ],
      },
      {
        word: 'WAFER',
        cells: [
          [4, 0],
          [5, 0],
          [5, 1],
          [4, 1],
          [3, 0],
        ],
      },
      {
        word: 'FUDGE',
        cells: [
          [2, 2],
          [1, 2],
          [2, 1],
          [2, 0],
          [1, 0],
        ],
      },
      {
        word: 'TRUFFLE',
        cells: [
          [3, 1],
          [3, 2],
          [4, 2],
          [5, 2],
          [6, 2],
          [6, 1],
          [6, 0],
        ],
      },
      {
        word: 'CAKE',
        cells: [
          [0, 3],
          [1, 4],
          [0, 4],
          [0, 5],
        ],
      },
      {
        word: 'TREAT',
        cells: [
          [3, 5],
          [4, 5],
          [5, 4],
          [5, 5],
          [4, 4],
        ],
      },
      {
        word: 'COCOA',
        cells: [
          [1, 3],
          [2, 3],
          [2, 4],
          [2, 5],
          [1, 5],
        ],
      },
      {
        word: 'CARAMEL',
        cells: [
          [6, 5],
          [6, 4],
          [6, 3],
          [5, 3],
          [4, 3],
          [3, 4],
          [3, 3],
        ],
      },
    ],
    frame: { top: 0, bottom: 6, left: 0, right: 5, axis: 'v' },
  },
];

const mountPanel: Parameters<typeof run<StoryPanel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountStrands(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag through touching letters (diagonals too) to spell a word; slide back to undo a letter; let go to check it. Every letter is in exactly one theme word. The puzzles teach the rules; open a puzzle number to jump about.';

export const lovenotes = run({
  id: 'lovenotes',
  title: 'Heartstrings',
  room: "Valentine's",
  kind: 'intro',
  from: "Heartstrings · Valentine's, taught puzzle by puzzle",
  rules: `${CONTROLS} (A spangram, on bigger boards, runs from one side of the board to the other.)`,
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
  rules: `${CONTROLS} (Twist: some letters are in the dark, shown as ?; they light up when a word through them is found.)`,
  panels: JACK,
  mountPanel,
});

export const basket = run({
  id: 'basket',
  title: 'Egg-Hunt Heartstrings',
  room: "Valentine's",
  kind: 'relic',
  from: "Egg-Hunt Heartstrings · Valentine's (Easter)",
  rules: `${CONTROLS} (Twist: an egg on a letter gives its place in its word; an egg marked 1 starts a word.)`,
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
