/**
 * Halloween: the web run (`revamp-centerpieces.md`). Hashi panels in seven
 * runs: the intro run on the porch cobwebs, the Spider's Web home-twist run
 * (dark `?` knots), and the five relic runs (Box of Chocolates, Tree-Top Star,
 * Marshmallow Chick, Picnic Basket, and Gravy Boat). Every panel is ≤ 7×7 and
 * has a unique solution (`tests/puzzles/halloween.test.ts`).
 */
import { type Panel, fillMessage, letterValues, parse, solve } from '../../gen/webs';
import { mountWeb } from '../hashiBoard';
import { run } from '../run';

export const WARMUP: Panel[] = [
  {
    name: 'One thread',
    rows: ['1.1'],
    tip: 'Drag from one knot to another to spin a single thread.',
  },
  {
    name: 'Sharing out',
    rows: ['1.3.2'],
    tip: 'Drag again for a double thread; each knot must match its number.',
  },
  {
    name: 'No crossing',
    rows: ['.2.3', '3..3', '....', '21..'],
    tip: 'Threads run straight horizontally or vertically and may never cross.',
  },
  {
    name: 'One web',
    rows: ['2.2', '...', '2.2'],
    start: [
      [0, 0, 0, 2, 2],
      [2, 0, 2, 2, 2],
    ],
    tip: 'Every knot must connect into one single web.',
  },
  {
    name: 'The Rafters',
    rows: ['..2....', '.15....', '1......', '4.7...2', '...21..', '.......', '1.23..1'],
    tip: 'Spin the whole porch cobweb into one connected piece.',
  },
];

export const SPIDER: Panel[] = [
  {
    name: 'Candle in the dark',
    rows: ['...1.', '.....', '.....', '?3.3.', '.?.32'],
    tip: '🎃 Spooky: A dark knot (?) hides its number and can take any thread count (1 or more).',
  },
  {
    name: 'In the dark',
    rows: ['.2?..', '.....', '....?', '1.3.3', '....1'],
    tip: '🎃 Spooky: Use the numbered neighbors to deduce how many threads each ? knot needs.',
  },
  {
    name: 'Corner shadows',
    rows: ['....2', '.....', '2.3.4', '?....', '..?.2'],
    tip: '🎃 Spooky: Every knot—dark or numbered—still connects into one web.',
  },
  {
    name: 'Deep in the dark',
    rows: ['?42...3', '.......', '...1.?4', '.1.....', '..4.2..', '..?...3', '......1'],
    tip: '🎃 Spooky: Trace from the forced numbered knots into the shadowy corners.',
  },
  {
    name: "The Spider's Web",
    rows: ['21...1.', '?.4....', '......?', '2......', '..4..53', '.......', '?...4.2'],
    tip: '🎃 Spooky: Spin the full 7×7 rafters web around the hidden ? knots.',
  },
];

export const CHOCOLATES: Panel[] = [
  {
    name: 'A love note',
    rows: ['OL..4', '.....', '.....', '.4.O.', 'O...3'],
    message: '52VE',
    tip: '💌 Love-Letter: Same letter = same thread count; different letters = different counts.',
  },
  {
    name: 'Be mine',
    rows: ['..E....', '158...B', '.E.....', '12B.B.5', '......2', '.......', '....2..'],
    message: 'W24',
    tip: '💌 Love-Letter: Equal letters take equal thread counts and fill the message blanks.',
  },
  {
    name: 'Sweet kiss',
    rows: ['...I...', 'K..5.4K', '.....2.', '1......', '.......', 'I..6.K.', '.K.6.K.'],
    message: '21SS',
    tip: '💌 Love-Letter: Match all K knots and all I knots to decode the final chocolate note.',
  },
];

/** What each message reads once its web is spun. */
export const MESSAGES = ['LOVE', 'WEB', 'KISS'];

export const STAR: Panel[] = [
  {
    name: 'A frosty line',
    rows: ['2...3', '42...', '....3', '31...', '3...3'],
    frame: {
      top: 0,
      left: 0,
      bottom: 4,
      right: 4,
      axis: 'h',
    },
    tip: '❄️ Snowflake: Joined pairs mirror across the icy line (singles vs. doubles need not match).',
  },
  {
    name: 'Across the ice',
    rows: ['2..3..2', '.......', '.......', '.......', '5.535.4', '..4.3..', '3.4.4.3'],
    frame: {
      top: 0,
      left: 0,
      bottom: 6,
      right: 6,
      axis: 'v',
    },
    tip: '❄️ Snowflake: Every thread on one side of the vertical frost line needs a partner on the other.',
  },
  {
    name: 'The Tree-Top Star',
    rows: ['2.4.3.3', '4.4.5.5', '.......', '..2.3..', '3..4..3', '.......', '...1...'],
    frame: {
      top: 0,
      left: 0,
      bottom: 6,
      right: 6,
      axis: 'v',
    },
    tip: '❄️ Snowflake: Mirror the web across the star’s vertical frost axis.',
  },
];

export const CHICK: Panel[] = [
  {
    name: 'Four hops home',
    rows: ['24...', '.....', '.4.1.', '.....', '.3.31'],
    home: [2, 3],
    eggs: [[4, 4, 4]],
    tip: '🥚 Egg-Hunt: Reach each numbered egg in that exact fewest thread-hops from 🕷.',
  },
  {
    name: 'Marshmallow trail',
    rows: ['....1', '.....', '4..53', '.....', '2..21'],
    home: [4, 4],
    eggs: [[2, 4, 3]],
    tip: '🥚 Egg-Hunt: Avoid direct shortcuts that reach the egg in fewer hops than its number!',
  },
  {
    name: 'The Marshmallow Chick',
    rows: ['2...1..', '.1....1', '45..3..', '43.....', '....4.2', '.......', '3...3..'],
    home: [6, 0],
    eggs: [[2, 0, 4]],
    tip: '🥚 Egg-Hunt: Route the 7×7 web so the egg sits 4 shortest thread-hops from 🕷.',
  },
];

export const PICNIC: Panel[] = [
  {
    name: 'Party bulbs',
    rows: ['3.3.2', '.....', '4...1', '.....', '3.2..'],
    colours: ['r.b.r', '.....', 'b...b', '.....', '..r..'],
    tip: '🎆 Patriotic: Never spin a thread between two knots of the same color.',
  },
  {
    name: 'Checkered cloth',
    rows: ['2..1.', '4...1', '.....', '.....', '3..32'],
    colours: ['b..r.', 'r...b', '.....', '.....', 'b..rb'],
    tip: '🎆 Patriotic: Red and blue knots cannot join their own color; plain white knots join any color.',
  },
  {
    name: 'The Picnic Basket',
    rows: ['2..32.1', '3......', '.......', '.......', '5..4..4', '.....14', '2.2...3'],
    colours: ['r..br.b', 'b......', '.......', '.......', '...r..b', '.....br', 'b.r...b'],
    tip: '🎆 Patriotic: Weave the 7×7 picnic web without linking matching colors.',
  },
];

export const GRAVYBOAT: Panel[] = [
  {
    name: 'Fence post',
    rows: ['2...3', '2...3', '.....', '.....', '3..32'],
    walls: [[0, 0, 'h']],
    tip: '🥧 Portioned: Threads may never cross a thick wooden fence bar.',
  },
  {
    name: 'Ladle barrier',
    rows: ['2....', '5...2', '....2', '....3', '2...2'],
    walls: [[1, 4, 'h']],
    tip: '🥧 Portioned: Route threads around the wooden fence bar to connect the web.',
  },
  {
    name: 'The Gravy Boat',
    rows: ['3.4...2', '..2....', '.......', '.14..34', '1......', '.....24', '..2...2'],
    walls: [[4, 5, 'h']],
    tip: '🥧 Portioned: Spin the 7×7 web around the fence bar so every knot is satisfied.',
  },
];

const mountPanel: Parameters<typeof run<Panel>>[0]['mountPanel'] = (host, panel, hooks) => {
  mountWeb(host, panel, {
    solved: () => hooks.solved(),
    status: hooks.status,
  });
};

const CONTROLS =
  'Drag from a knot towards another to spin a thread between them; drag again for a double, and a third time to cut it (or tap a thread). Tapping one knot, then another, works too. The puzzles teach the rules; open a puzzle number to jump about.';

export const cobwebs = run({
  id: 'cobwebs',
  title: 'Web',
  room: 'Halloween',
  kind: 'intro',
  from: 'Web · Halloween, taught puzzle by puzzle',
  rules: `${CONTROLS} (Rules: a knot's number is how many threads leave it; threads run straight, one or two between a pair, never crossing; the web hangs together as one.)`,
  panels: WARMUP,
  mountPanel,
});

export const web = run({
  id: 'web',
  title: 'Spooky Web',
  room: 'Halloween',
  kind: 'home',
  from: 'Spooky Web · Halloween (Halloween)',
  rules: `${CONTROLS} (Twist: a dark knot (?) in the shadows may have any count.)`,
  panels: SPIDER,
  mountPanel,
});

export const chocolates = run({
  id: 'chocolates',
  title: 'Love-Letter Web',
  room: 'Halloween',
  kind: 'relic',
  from: "Love-Letter Web · Halloween (Valentine's)",
  rules: `${CONTROLS} (Twist: the same letter means the same count, different letters different counts. Each numbered blank in the message takes the letter with that many threads, so the words can help with the web, and the web with the words. A small number by a knot shows its threads so far.)`,
  panels: CHOCOLATES,
  mountPanel,
});

export const starlights = run({
  id: 'starlights',
  title: 'Snowflake Web',
  room: 'Halloween',
  kind: 'relic',
  from: 'Snowflake Web · Halloween (Christmas)',
  rules: `${CONTROLS} (Twist: the joins mirror across the icy line; singles and doubles needn't.)`,
  panels: STAR,
  mountPanel,
});

export const chick = run({
  id: 'chick',
  title: 'Egg-Hunt Web',
  room: 'Halloween',
  kind: 'relic',
  from: 'Egg-Hunt Web · Halloween (Easter)',
  rules: `${CONTROLS} (Twist: each numbered egg knot must be reached in that exact fewest thread-steps from the 🕷 home knot.)`,
  panels: CHICK,
  mountPanel,
});

export const picnic = run({
  id: 'picnic',
  title: 'Patriotic Web',
  room: 'Halloween',
  kind: 'relic',
  from: 'Patriotic Web · Halloween (Fourth of July)',
  rules: `${CONTROLS} (Twist: red and blue knots may never connect to a knot of the same color; white knots can connect to any color.)`,
  panels: PICNIC,
  mountPanel,
});

export const gravyboat = run({
  id: 'gravyboat',
  title: 'Portioned Web',
  room: 'Halloween',
  kind: 'relic',
  from: 'Portioned Web · Halloween (Thanksgiving)',
  rules: `${CONTROLS} (Twist: no thread may cross a thick wooden fence bar between squares.)`,
  panels: GRAVYBOAT,
  mountPanel,
});

/** For the tests: the panel's message, filled in from its one answer. */
export const message = (panel: Panel): string => {
  const web = parse(panel);
  const answer = solve(web, 1)[0];
  const values = answer && letterValues(web, answer);
  return values && panel.message ? fillMessage(panel.message, values) : '';
};
