import type { Panel as WebPanel } from '../../../gen/webs';
import type { ClauseDef } from './types';

export const CLAUSE_WEBS: ClauseDef<WebPanel> = {
  clauseIndex: 0,
  id: 'C1',
  genre: 'webs',
  title: 'Clause I: Halloween · Web',
  genreTitle: 'Web',
  icon: '🕸️',
  accent: '#805ad5',
  twistOrder: ['dark', 'letters', 'colours', 'eggs', 'cuts', 'snow'],
  twistMeta: [
    {
      key: 'dark',
      icon: '🎃',
      label: 'Spooky',
      rule: 'Dark (?) knots can take any thread count (1 or more).',
    },
    {
      key: 'letters',
      icon: '💌',
      label: 'Love-Letter',
      rule: 'Same letter = same thread count; different letters = different counts, filling the message blanks.',
    },
    {
      key: 'colours',
      icon: '🎆',
      label: 'Patriotic',
      rule: 'Red and blue knots never join two knots of the same color; white knots join anything.',
    },
    {
      key: 'eggs',
      icon: '🥚',
      label: 'Egg-Hunt',
      rule: 'Each numbered egg knot is reached in that exact fewest thread-steps from the 🕷 home knot.',
    },
    {
      key: 'cuts',
      icon: '🥧',
      label: 'Portioned',
      rule: 'Threads cannot cross thick fence bars between squares.',
    },
    {
      key: 'snow',
      icon: '❄️',
      label: 'Snowflake',
      rule: 'Inside the frosty frame, whether two knots are joined mirrors across the icy line.',
    },
  ],
  panels: [
    // 0: Base (7x7)
    {
      name: 'Porch Cobweb',
      section: 'base',
      twists: [],
      tip: "Match each knot's thread count; 1 or 2 straight threads per pair, no crossing, all one web.",
      explain:
        'Spin 1 or 2 straight threads between knots so every knot meets its number, threads never cross, and the whole web connects into one piece.',
      panel: {
        name: 'Porch Cobweb',
        rows: ['242...3', '.......', '...1.24', '.1.....', '..4.2..', '..3...3', '......1'],
      },
    },

    // 1..6: Intro (5x5 reminder levels)
    {
      name: 'Candle in the Dark',
      section: 'intro',
      twists: ['dark'],
      tip: '🎃 Spooky: Dark (?) knots accept any number of threads (at least 1).',
      explain:
        'A dark knot (?) hides its number in the shadows and can take any thread count (1 or more) needed to satisfy its neighbors and connect the web.',
      panel: {
        name: 'Candle in the Dark',
        rows: ['...1.', '.....', '.....', '?3.3.', '.?.32'],
      },
    },
    {
      name: 'Secret Initials',
      section: 'intro',
      twists: ['letters'],
      tip: '💌 Love Letters: Equal letters share a count; different letters take different counts.',
      explain:
        'Knots marked with the same letter must have the same thread count, and different letters must have different counts. Solving them fills the numbered blanks in the message above!',
      panel: {
        name: 'Secret Initials',
        rows: ['G.1..', '.....', '4...U', '....1', 'U.G..'],
        message: 'H32',
      },
    },
    {
      name: 'Party Bulbs',
      section: 'intro',
      twists: ['colours'],
      tip: '🎆 Red, White & Blue: Never connect two knots of the same color.',
      explain:
        'Red knots cannot connect to red knots, and blue knots cannot connect to blue knots. White (plain) knots can connect to any color.',
      panel: {
        name: 'Party Bulbs',
        rows: ['3.3.2', '.....', '4...1', '.....', '3.2..'],
        colours: ['r.b.r', '.....', 'b...b', '.....', '..r..'],
      },
    },
    {
      name: 'Three Hops Home',
      section: 'intro',
      twists: ['eggs'],
      tip: '🥚 Egg Hunt: Reach each egg in its exact shortest hop count from 🕷.',
      explain:
        'The number on an egg badge tells you the exact fewest knot-to-knot thread hops needed to reach that knot from the spider home (🕷). Direct shortcuts that arrive too soon must be avoided!',
      panel: {
        name: 'Three Hops Home',
        rows: ['24...', '.....', '.4.1.', '.....', '.3.31'],
        home: [2, 3],
        eggs: [[4, 4, 4]],
      },
    },
    {
      name: 'Fence Post',
      section: 'intro',
      twists: ['cuts'],
      tip: '🥧 Portions: Threads may not cross thick wooden fence bars.',
      explain:
        'Thick wooden fence bars between squares block straight sightlines—no thread is allowed to cross a bar.',
      panel: {
        name: 'Fence Post',
        rows: ['2...3', '2...3', '.....', '.....', '3..32'],
        walls: [[0, 0, 'h']],
      },
    },
    {
      name: 'Frosty Mirror',
      section: 'intro',
      twists: ['snow'],
      tip: '❄️ Snowflakes: Joined pairs mirror across the dashed icy axis.',
      explain:
        'Inside the frosty frame, wherever a thread is drawn on one side of the icy mirror line, a thread must also cover its mirror image on the other side (single vs. double threads need not match).',
      panel: {
        name: 'Frosty Mirror',
        rows: ['..2.3', '.....', '1.4.4', '.....', '..2.2'],
        frame: { top: 0, left: 0, bottom: 4, right: 4, axis: 'h' },
      },
    },

    // 7..12: Solo (7x7)
    {
      name: 'Rafters in Shadow',
      section: 'solo',
      twists: ['dark'],
      tip: '🎃 Spooky: Deduce the hidden ? counts from their neighbors.',
      explain:
        'Dark (?) knots can take any thread count (1 or more). Let the numbered knots around them dictate how many threads they need.',
      panel: {
        name: 'Rafters in Shadow',
        rows: ['.32.2..', '.......', '.?..3..', '1......', '3...4.3', '......?', '2..22..'],
      },
    },
    {
      name: 'Warm Embrace',
      section: 'solo',
      twists: ['letters'],
      tip: '💌 Love Letters: Match identical letters and decode the note.',
      explain:
        'Every E knot has the same thread count and every B knot has a different shared count, decoding the secret word above.',
      panel: {
        name: 'Warm Embrace',
        rows: ['..E....', '158...B', '.E.....', '12B.B.5', '......2', '.......', '....2..'],
        message: 'W24',
      },
    },
    {
      name: 'Patriot Strands',
      section: 'solo',
      twists: ['colours'],
      tip: '🎆 Red, White & Blue: Opposite colors may link; same colors never do.',
      explain:
        'Red and blue knots refuse threads to knots of their own color, while plain white knots bridge any pair.',
      panel: {
        name: 'Patriot Strands',
        rows: ['......2', '3..2..4', '..1...3', '4.4.2..', '.......', '3......', '3.3...2'],
        colours: ['......r', 'b..r..b', '..b...r', 'r.b.r..', '.......', 'b......', '..r...b'],
      },
    },
    {
      name: 'Silk Detour',
      section: 'solo',
      twists: ['eggs'],
      tip: '🥚 Egg Hunt: Route the web so every egg is the right number of hops from 🕷.',
      explain:
        'Count thread hops along the spun web from the spider home (🕷); the egg knot must be reached in 3 hops.',
      panel: {
        name: 'Silk Detour',
        rows: ['2.5...3', '.......', '1......', '..3..22', '.....34', '.......', '2.3..33'],
        home: [4, 5],
        eggs: [[6, 2, 3]],
      },
    },
    {
      name: 'Garden Trellis',
      section: 'solo',
      twists: ['cuts'],
      tip: '🥧 Portions: Spin around the wooden fence bar.',
      explain:
        'The wooden fence bar blocks a vertical sightline, forcing the surrounding knots to route around it.',
      panel: {
        name: 'Garden Trellis',
        rows: ['2...2..', '......2', '4...4.4', '.......', '....4.5', '....1.2', '3.3..2.'],
        walls: [[4, 4, 'h']],
      },
    },
    {
      name: 'Ice Lattice',
      section: 'solo',
      twists: ['snow'],
      tip: '❄️ Snowflakes: Every thread segment mirrors across the vertical frost line.',
      explain:
        'The frosty frame reflects every drawn thread across its middle vertical line, even when twin knots carry different numbers of single and double threads.',
      panel: {
        name: 'Ice Lattice',
        rows: ['2..3..2', '.......', '.......', '.......', '5.535.4', '..4.3..', '3.4.4.3'],
        frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'v' },
      },
    },

    // 13..27: Duo (all 15 pairs in pairCombinations(gimmickOrder) order, 7x7)
    // 13: dark + letters
    {
      name: 'Midnight Valentine',
      section: 'duo',
      twists: ['dark', 'letters'],
      tip: '🎃 Spooky + 💌 Love Letters: Dark (?) knots are free; letter knots share counts.',
      explain:
        'Combine dark (?) knots that accept any count with coded letter knots (L and V) that must share consistent, distinct counts.',
      panel: {
        name: 'Midnight Valentine',
        rows: ['?L2...3', '.......', '...V.2L', '.V.....', '..L.?..', '..3...?', '......V'],
        message: '4O1E',
      },
    },
    // 14: dark + colours
    {
      name: 'Twilight Fireworks',
      section: 'duo',
      twists: ['dark', 'colours'],
      tip: '🎃 Spooky + 🎆 Red, White & Blue: Respect bulb colors even on dark (?) knots.',
      explain:
        'Even when a knot hides its number with ?, its red or blue color still forbids joining another knot of the same color.',
      panel: {
        name: 'Twilight Fireworks',
        rows: ['23.23.?', '.2.....', '.......', '?..4..4', '.......', '....1.?', '3...2..'],
        colours: ['rb.br.b', '.r.....', '.......', 'b..r..b', '.......', '....b.r', 'r...b..'],
      },
    },
    // 15: dark + eggs
    {
      name: 'Shadow Nest',
      section: 'duo',
      twists: ['dark', 'eggs'],
      tip: '🎃 Spooky + 🥚 Egg Hunt: Use egg hop distance from 🕷 to pin down dark (?) knots.',
      explain:
        'The egg knot must sit 8 thread hops from the 🕷 home knot, revealing which links the dark (?) knots may spin.',
      panel: {
        name: 'Shadow Nest',
        rows: ['2...1.?', '31?....', '..2...3', '3..5.2.', '.......', '.......', '...3..?'],
        home: [0, 0],
        eggs: [[0, 4, 8]],
      },
    },
    // 16: dark + cuts
    {
      name: 'Haunted Fence',
      section: 'duo',
      twists: ['dark', 'cuts'],
      tip: '🎃 Spooky + 🥧 Portions: Fence bars block sightlines between dark and numbered knots.',
      explain:
        'No thread may cross the wooden fence bar, narrowing the choices for the dark (?) knots.',
      panel: {
        name: 'Haunted Fence',
        rows: ['..2....', '2...2?.', '.......', '..6.?..', '.......', '3.6.23.', '?.6...2'],
        walls: [[2, 4, 'h']],
      },
    },
    // 17: dark + snow
    {
      name: 'Frozen Shadows',
      section: 'duo',
      twists: ['dark', 'snow'],
      tip: '🎃 Spooky + ❄️ Snowflakes: Mirror thread paths across the vertical frost line.',
      explain:
        'Every thread drawn on one side of the vertical snowflake line must also appear on the mirrored side, guiding the dark (?) knots.',
      panel: {
        name: 'Frozen Shadows',
        rows: ['1..2..?', '...3...', '.......', '4..4..3', '.......', '3?...1?', '...1...'],
        frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'v' },
      },
    },
    // 18: letters + colours
    {
      name: 'Painted Postcard',
      section: 'duo',
      twists: ['letters', 'colours'],
      tip: '💌 Love Letters + 🎆 Red, White & Blue: Letter knots obey both color and count rules.',
      explain:
        'Red and blue knots never link to their own color, helping determine the shared thread counts for letters K and I.',
      panel: {
        name: 'Painted Postcard',
        rows: ['...4..3', '.......', 'I.IK.I.', '.......', '......2', '3..6...', '..13.I2'],
        message: '61SS',
        colours: ['...r..b', '.......', 'r.rb.r.', '.......', '......r', 'b..r...', '..rb.rb'],
      },
    },
    // 19: letters + eggs
    {
      name: 'Parcel Delivery',
      section: 'duo',
      twists: ['letters', 'eggs'],
      tip: '💌 Love Letters + 🥚 Egg Hunt: Match letter counts while keeping egg hops exact.',
      explain:
        'All W knots must take the same thread count, and the egg knot must be reached in 3 hops from the 🕷 home knot.',
      panel: {
        name: 'Parcel Delivery',
        rows: ['3...3..', '..W.3..', '.......', '.......', '5.4S4.4', '......W', 'W.2.1..'],
        message: '12EET',
        home: [1, 2],
        eggs: [[4, 3, 3]],
      },
    },
    // 20: letters + cuts
    {
      name: 'Sealed Envelope',
      section: 'duo',
      twists: ['letters', 'cuts'],
      tip: '💌 Love Letters + 🥧 Portions: Fence bars block links and fix the letter values.',
      explain:
        'The fence bar blocks a vertical connection, fixing the thread counts for R and E and unlocking the coded word.',
      panel: {
        name: 'Sealed Envelope',
        rows: ['.1...ER', '.4..3.1', '.......', '....1..', '.4...4.', 'R......', '4E...R.'],
        message: 'T23AT',
        walls: [[5, 1, 'h']],
      },
    },
    // 21: letters + snow
    {
      name: 'Frosted Note',
      section: 'duo',
      twists: ['letters', 'snow'],
      tip: '💌 Love Letters + ❄️ Snowflakes: Mirrored joins and equal letters solve together.',
      explain:
        'Symmetry across the vertical snowflake line pairs with the equal-count rule on E and B to spin the web.',
      panel: {
        name: 'Frosted Note',
        rows: ['E..E..2', '.......', '.2...2.', '3.....2', '.3.B.E.', '.......', '2..E..3'],
        message: 'W45',
        frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'v' },
      },
    },
    // 22: colours + eggs
    {
      name: 'Festival Basket',
      section: 'duo',
      twists: ['colours', 'eggs'],
      tip: '🎆 Red, White & Blue + 🥚 Egg Hunt: Alternate bulb colors along the 3-hop egg trail.',
      explain:
        'Avoid same-color links while making sure the shortest thread path from 🕷 to the egg takes 3 hops.',
      panel: {
        name: 'Festival Basket',
        rows: ['2.1....', '4.5.2.1', '225...3', '....1..', '.1.....', '.......', '2.4.4.3'],
        colours: ['b.r....', 'r.b.r.r', 'bbr...b', '....b..', '.r.....', '.......', 'r.b...r'],
        home: [0, 0],
        eggs: [[0, 2, 3]],
      },
    },
    // 23: colours + cuts
    {
      name: 'Bunting & Barriers',
      section: 'duo',
      twists: ['colours', 'cuts'],
      tip: '🎆 Red, White & Blue + 🥧 Portions: Both same-color bulbs and fence bars block links.',
      explain:
        'Neither same-color knots nor knots separated by a wooden fence bar may be joined by a thread.',
      panel: {
        name: 'Bunting & Barriers',
        rows: ['4...4.1', '..2.3.2', '.......', '5.4...3', '.......', '..12..3', '32.2..1'],
        colours: ['r...b.r', '..b.r.b', '.......', 'b.r....', '.......', '..b...b', 'rb.r..r'],
        walls: [
          [5, 2, 'v'],
          [0, 6, 'h'],
        ],
      },
    },
    // 24: colours + snow
    {
      name: 'Crystal Sparklers',
      section: 'duo',
      twists: ['colours', 'snow'],
      tip: '🎆 Red, White & Blue + ❄️ Snowflakes: Mirror thread geometry without linking same colors.',
      explain:
        'Threads must mirror across the vertical frost line while never connecting two red knots or two blue knots.',
      panel: {
        name: 'Crystal Sparklers',
        rows: ['.2...2.', '.......', '.......', '.3...3.', '..3.3..', '.36343.', '144.231'],
        colours: ['.r...r.', '.......', '.......', '.b...b.', '..r.b..', '.rbr.r.', 'rbr.b.r'],
        frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'v' },
      },
    },
    // 25: eggs + cuts
    {
      name: 'Hedgerow Hunt',
      section: 'duo',
      twists: ['eggs', 'cuts'],
      tip: '🥚 Egg Hunt + 🥧 Portions: Route around the fence bar to hit the 4-hop egg distance.',
      explain:
        'The fence bar blocks a horizontal link and the egg requires a 4-hop path from the 🕷 home knot.',
      panel: {
        name: 'Hedgerow Hunt',
        rows: ['.3.4..2', '32.4.2.', '.......', '5..6.34', '.......', '...6..3', '2..4.1.'],
        home: [1, 5],
        eggs: [[1, 0, 4]],
        walls: [[0, 4, 'v']],
      },
    },
    // 26: eggs + snow
    {
      name: 'Winter Warren',
      section: 'duo',
      twists: ['eggs', 'snow'],
      tip: '🥚 Egg Hunt + ❄️ Snowflakes: Symmetric threads must place the egg 6 hops from 🕷.',
      explain:
        'Keep the web symmetric across the horizontal frost line while routing the shortest path from 🕷 to the egg in 6 hops.',
      panel: {
        name: 'Winter Warren',
        rows: ['33..4.3', '.......', '44..2..', '...2..5', '46..3..', '.......', '34..4.4'],
        frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'h' },
        home: [2, 4],
        eggs: [[4, 4, 6]],
      },
    },
    // 27: cuts + snow
    {
      name: 'Icicle Gate',
      section: 'duo',
      twists: ['cuts', 'snow'],
      tip: '🥧 Portions + ❄️ Snowflakes: A fence bar on one side also forbids its mirror image!',
      explain:
        'Because threads mirror across the horizontal frost line, a fence bar blocking one side also prevents its mirror segment on the other side.',
      panel: {
        name: 'Icicle Gate',
        rows: ['.23..43', '.......', '1......', '45...54', '1......', '.......', '.33..53'],
        frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'h' },
        walls: [[3, 2, 'h']],
      },
    },

    // 28: All 6 twists boss puzzle (7x7)
    {
      name: 'The Grand Cobweb',
      section: 'all6',
      twists: ['dark', 'letters', 'colours', 'eggs', 'cuts', 'snow'],
      tip: '🎃💌🎆🥚🥧❄️ All 6 Twists: Every holiday clause rule is active at once!',
      explain:
        'The final Clause I boss web! Balance dark (?) knots, coded W/B letters, red/blue colors, the 5-hop egg from 🕷, the fence bar, and horizontal snowflake symmetry all at once.',
      panel: {
        name: 'The Grand Cobweb',
        rows: ['?.....2', '.......', '4....3W', 'W......', '5....3B', '.......', 'W.....2'],
        message: '3E2',
        colours: ['r.....b', '.......', 'b.....r', 'r......', 'b....rb', '.......', 'r......'],
        frame: { top: 0, left: 0, bottom: 6, right: 6, axis: 'h' },
        home: [0, 0],
        eggs: [[4, 6, 5]],
        walls: [[3, 5, 'h']],
      },
    },
  ],
};
