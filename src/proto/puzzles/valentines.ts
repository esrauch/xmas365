/**
 * Valentine's: the love-letter run (GAME.md, "Valentine's: the love-letter
 * run"). Strands panels in four runs: the warm-up love notes, the two strays
 * (the Jack-o'-Lantern brings Halloween's dark; the Bunny's Basket, Easter's
 * numbered eggs), and the Valentine Mailbox centrepiece (letters written as
 * numbers). The words were laid out by a random search so they fill each
 * grid and each can be spelled only one way (tests/puzzles/valentines.test.ts).
 */
import { run } from '../run';
import { type Panel } from '../../gen/words';
import { mountStrands } from '../strandsBoard';

export const LOVENOTES: Panel[] = [
  {
    name: 'One word',
    theme: 'Four letters',
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
];

export const JACK: Panel[] = [
  {
    name: 'generated',
    theme: 'Sweet treats',
    rows: ['ESTA', 'SOUG', 'UNEA', 'OMKC'],
    words: [
      {
        word: 'MOUSSE',
        cells: [
          [3, 1],
          [3, 0],
          [2, 0],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'NOUGAT',
        cells: [
          [2, 1],
          [1, 1],
          [1, 2],
          [1, 3],
          [0, 3],
          [0, 2],
        ],
      },
      {
        word: 'CAKE',
        cells: [
          [3, 3],
          [2, 3],
          [3, 2],
          [2, 2],
        ],
      },
    ],
    dark: [
      [3, 0],
      [2, 3],
    ],
  },
  {
    name: 'generated',
    theme: 'Ghostly crushes',
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
    name: 'generated',
    theme: 'Garden of love',
    rows: ['SRINGY', 'PTREOS', 'NDGAVP', 'ABELRD', 'LBYILE', 'UESADN'],
    words: [
      {
        word: 'SPRING',
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
        word: 'POSY',
        cells: [
          [2, 5],
          [1, 4],
          [1, 5],
          [0, 5],
        ],
      },
      {
        word: 'VERDANT',
        cells: [
          [2, 4],
          [1, 3],
          [1, 2],
          [2, 1],
          [3, 0],
          [2, 0],
          [1, 1],
        ],
      },
      {
        word: 'GARDEN',
        cells: [
          [2, 2],
          [2, 3],
          [3, 4],
          [3, 5],
          [4, 5],
          [5, 5],
        ],
      },
      {
        word: 'BLUEBELL',
        cells: [
          [3, 1],
          [4, 0],
          [5, 0],
          [5, 1],
          [4, 1],
          [3, 2],
          [3, 3],
          [4, 4],
        ],
      },
      {
        word: 'DAISY',
        cells: [
          [5, 4],
          [5, 3],
          [4, 3],
          [5, 2],
          [4, 2],
        ],
      },
    ],
    dark: [
      [4, 5],
      [1, 5],
      [5, 2],
    ],
  },
];

export const BASKET: Panel[] = [
  {
    name: 'generated',
    theme: 'Mistletoe kisses',
    rows: ['YLEM', 'LREB', 'OYRF', 'HTSO'],
    words: [
      {
        word: 'HOLLY',
        cells: [
          [3, 0],
          [2, 0],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      },
      {
        word: 'EMBER',
        cells: [
          [0, 2],
          [0, 3],
          [1, 3],
          [1, 2],
          [1, 1],
        ],
      },
      {
        word: 'FROSTY',
        cells: [
          [2, 3],
          [2, 2],
          [3, 3],
          [3, 2],
          [3, 1],
          [2, 1],
        ],
      },
    ],
    eggs: [
      [0, 0],
      [2, 2],
    ],
  },
  {
    name: 'generated',
    theme: 'Garden of love',
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
    name: 'generated',
    theme: 'Table for two',
    rows: ['DTSAPP', 'EAEIPL', 'OLAYVE', 'RERERA', 'MNPPDG', 'IKMUCI'],
    words: [
      {
        word: 'ROASTED',
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
        word: 'APPLEPIE',
        cells: [
          [0, 3],
          [0, 4],
          [0, 5],
          [1, 5],
          [2, 5],
          [1, 4],
          [1, 3],
          [1, 2],
        ],
      },
      {
        word: 'MEAL',
        cells: [
          [4, 0],
          [3, 1],
          [2, 2],
          [2, 1],
        ],
      },
      {
        word: 'GRAVY',
        cells: [
          [4, 5],
          [3, 4],
          [3, 5],
          [2, 4],
          [2, 3],
        ],
      },
      {
        word: 'CIDER',
        cells: [
          [5, 4],
          [5, 5],
          [4, 4],
          [3, 3],
          [3, 2],
        ],
      },
      {
        word: 'PUMPKIN',
        cells: [
          [4, 3],
          [5, 3],
          [5, 2],
          [4, 2],
          [5, 1],
          [5, 0],
          [4, 1],
        ],
      },
    ],
    eggs: [
      [4, 4],
      [0, 4],
      [3, 4],
    ],
  },
];

export const MAILBOX: Panel[] = [
  {
    name: 'generated',
    theme: "Cupid's kit",
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
    name: 'generated',
    theme: 'Sweet treats',
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
    name: 'generated',
    theme: 'Love notes',
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

/** 9×9 Heartstrings panels reserved for optional bonus levels. */
export const VALENTINES_BONUS: Panel[] = [
  {
    name: 'generated',
    theme: 'Sweet treats',
    rows: [
      'EFFURTTOF',
      'LICYCWLEF',
      'NIREHOLAE',
      'GARTTPDSM',
      'CORAUDNIY',
      'OCEGSOGPR',
      'YEUEBRJEU',
      'NMRPTMINL',
      'OHDOUFFYL',
    ],
    words: [
      {
        word: 'TRUFFLE',
        cells: [
          [0, 5],
          [0, 4],
          [0, 3],
          [0, 2],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      },
      {
        word: 'TOFFEE',
        cells: [
          [0, 6],
          [0, 7],
          [0, 8],
          [1, 8],
          [1, 7],
          [2, 8],
        ],
      },
      {
        word: 'GUMDROP',
        cells: [
          [5, 3],
          [6, 2],
          [7, 1],
          [8, 2],
          [7, 2],
          [8, 3],
          [7, 3],
        ],
      },
      {
        word: 'JELLY',
        cells: [
          [6, 6],
          [6, 7],
          [7, 8],
          [8, 8],
          [8, 7],
        ],
      },
      {
        word: 'MUFFIN',
        cells: [
          [7, 5],
          [8, 4],
          [8, 5],
          [8, 6],
          [7, 6],
          [7, 7],
        ],
      },
      {
        word: 'SYRUP',
        cells: [
          [3, 7],
          [4, 8],
          [5, 8],
          [6, 8],
          [5, 7],
        ],
      },
      {
        word: 'SORBET',
        cells: [
          [5, 4],
          [5, 5],
          [6, 5],
          [6, 4],
          [6, 3],
          [7, 4],
        ],
      },
      {
        word: 'TREAT',
        cells: [
          [3, 3],
          [4, 2],
          [5, 2],
          [4, 3],
          [3, 4],
        ],
      },
      {
        word: 'PUDDING',
        cells: [
          [3, 5],
          [4, 4],
          [4, 5],
          [3, 6],
          [4, 7],
          [4, 6],
          [5, 6],
        ],
      },
      {
        word: 'CHERRY',
        cells: [
          [1, 4],
          [2, 4],
          [2, 3],
          [3, 2],
          [2, 2],
          [1, 3],
        ],
      },
      {
        word: 'MALLOW',
        cells: [
          [3, 8],
          [2, 7],
          [2, 6],
          [1, 6],
          [2, 5],
          [1, 5],
        ],
      },
      {
        word: 'ICING',
        cells: [
          [1, 1],
          [1, 2],
          [2, 1],
          [2, 0],
          [3, 0],
        ],
      },
      {
        word: 'COCOA',
        cells: [
          [5, 1],
          [5, 0],
          [4, 0],
          [4, 1],
          [3, 1],
        ],
      },
      {
        word: 'HONEY',
        cells: [
          [8, 1],
          [8, 0],
          [7, 0],
          [6, 1],
          [6, 0],
        ],
      },
    ],
    code: 'TIML',
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) =>
  mountStrands(host, panel, { solved: () => hooks.solved(), status: hooks.status });

const CONTROLS =
  'Drag through touching letters (diagonals too) to spell a word; slide back to undo a letter; let go to check it. Every letter is in exactly one theme word. The panels teach the rules; open a panel number to jump about.';

export const lovenotes = run({
  id: 'lovenotes',
  title: 'Love Notes',
  room: "Valentine's",
  kind: 'warm-up',
  from: 'Heartstrings, taught panel by panel',
  rules: `${CONTROLS} (A spangram, on bigger boards, runs from one side of the board to the other.)`,
  panels: LOVENOTES,
  mountPanel,
});

export const jack = run({
  id: 'jack',
  title: "The Jack-o'-Lantern",
  room: "Valentine's",
  kind: 'stray',
  from: 'Heartstrings; twist from Halloween: Spooky (letters in the dark)',
  rules: `${CONTROLS} (Twist: some letters are in the dark, shown as ?; they light up when a word through them is found.)`,
  panels: JACK,
  mountPanel,
});

export const basket = run({
  id: 'basket',
  title: "The Bunny's Basket",
  room: "Valentine's",
  kind: 'stray',
  from: 'Heartstrings; twist from Easter: Egg Hunt',
  rules: `${CONTROLS} (Twist: an egg on a letter gives its place in its word; an egg marked 1 starts a word.)`,
  panels: BASKET,
  mountPanel,
});

export const mailbox = run({
  id: 'mailbox',
  title: 'The Valentine Mailbox',
  room: "Valentine's",
  kind: 'centerpiece',
  from: "Heartstrings; Valentine's own Love Letters (the round-one Mailbox's cipher)",
  rules: `${CONTROLS} (Twist: some letters are written as numbers, the same number always the same letter; find a word through one and it's revealed everywhere, and in the key.)`,
  panels: MAILBOX,
  mountPanel,
});
