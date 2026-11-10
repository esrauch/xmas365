/**
 * Shared meta-game state, room/relic/home-twist registry, and story beat /
 * corkboard progression (`SCRIPT.md`: Leap Day vs. CEO Santa's XMAS365 takeover).
 */
import {
  type BeatId,
  CLAUSE_EARLY_TORN_BEATS,
  MEMOS,
  MEMO_ORDER,
  type MemoId,
  type MemoSpec,
  ROOM_SCRIPT,
} from '../content/script';
import type { Tier } from '../gen/core/spec';
import { type Proto, panelSignature } from '../proto/kit';
import {
  cauldron,
  fairylights,
  goldenegg,
  icepop,
  loveletter,
  pumpkinpie,
  tree,
} from '../proto/puzzles/christmas';
import { clause } from '../proto/puzzles/clause';
import { ALL_CLAUSES } from '../proto/puzzles/clauses';
import {
  CLAUSE_GENRES,
  CLAUSE_PANEL_COUNT,
  type ClauseGenre,
  HOLIDAY_TERMS,
  type PuzzleIdentity,
  formatPuzzleIdentity,
  getGenreTwistKey,
} from '../proto/puzzles/clauses/types';
import {
  cornucopia,
  eggtree,
  flag,
  ghost,
  gingerbread,
  hutch,
  rose,
} from '../proto/puzzles/easter';
import {
  bow,
  broom,
  chocobunny,
  finale,
  harvestcorn,
  snowglobe,
  sparklers,
} from '../proto/puzzles/fourth';
import {
  chick,
  chocolates,
  cobwebs,
  gravyboat,
  picnic,
  starlights,
  web,
} from '../proto/puzzles/halloween';
import {
  breadboard,
  candycorn,
  feast,
  hotdog,
  jellybeans,
  locket,
  stocking,
} from '../proto/puzzles/thanksgiving';
import {
  basket,
  candycane,
  jack,
  lovenotes,
  mailbox,
  watermelon,
  wishbone,
} from '../proto/puzzles/valentines';

export type RoomId =
  'halloween' | 'thanksgiving' | 'christmas' | 'valentines' | 'easter' | 'fourth';

export type StrayId =
  // Found in Halloween (5)
  | 'chocolates'
  | 'starlights'
  | 'chick'
  | 'picnic'
  | 'gravyboat'
  // Found in Thanksgiving (5)
  | 'hotdog'
  | 'stocking'
  | 'locket'
  | 'jellybeans'
  | 'candycorn'
  // Found in Christmas (5)
  | 'goldenegg'
  | 'pumpkinpie'
  | 'loveletter'
  | 'icepop'
  | 'cauldron'
  // Found in Valentine's (5)
  | 'jack'
  | 'basket'
  | 'watermelon'
  | 'wishbone'
  | 'candycane'
  // Found in Easter (5)
  | 'flag'
  | 'cornucopia'
  | 'rose'
  | 'ghost'
  | 'gingerbread'
  // Found in Fourth of July (5)
  | 'bow'
  | 'broom'
  | 'chocobunny'
  | 'harvestcorn'
  | 'snowglobe';

export interface StraySpec {
  id: StrayId;
  title: string;
  icon: string;
  twistLabel: string;
  foundIn: RoomId;
  homeRoom: RoomId;
  proto: Proto;
}

export interface HomeTwistSpec {
  id: string;
  title: string;
  icon: string;
  twistLabel: string;
  requiredItems: readonly [StrayId, StrayId, StrayId, StrayId, StrayId];
  proto: Proto;
}

export interface RoomSpec {
  id: RoomId;
  title: string;
  shortTitle: string;
  icon: string;
  genreLabel: string;
  /** Primary holiday color (used for the room's master lamp and primary UI badge). */
  accent: string;
  /** Secondary holiday color (paired with `accent` on the alcove's fairy light string). */
  secondaryAccent: string;
  wallColor: string;
  floorColor: string;
  /** Rung 1: 5-puzzle Intro Run (Base only). */
  warmup: Proto;
  /** Rung 2: 5-puzzle Home Twist Run (this room's Base + this room's Twist). */
  homeTwist: HomeTwistSpec;
  /** Rung 3: 5 foreign Relic Runs (3 puzzles each) stranded in this room. */
  strays: readonly [StraySpec, StraySpec, StraySpec, StraySpec, StraySpec];
  /** The 5 Relics that belong on this room's 5 Relic Shelves (unlocking its 5 Cage Padlocks). */
  homeRelics: readonly [StrayId, StrayId, StrayId, StrayId, StrayId];
}

export const STRAY_ITEMS: Record<StrayId, StraySpec> = {
  // Found in Halloween (5)
  chocolates: {
    id: 'chocolates',
    title: 'Box of Chocolates',
    icon: '🍫',
    twistLabel: "Valentine's Love-Letter: same letter = same thread count",
    foundIn: 'halloween',
    homeRoom: 'valentines',
    proto: chocolates,
  },
  starlights: {
    id: 'starlights',
    title: 'Tree-Top Star',
    icon: '⭐',
    twistLabel: 'Christmas Snowflake: joins mirror across the icy line',
    foundIn: 'halloween',
    homeRoom: 'christmas',
    proto: starlights,
  },
  chick: {
    id: 'chick',
    title: 'Marshmallow Chick',
    icon: '🐥',
    twistLabel: 'Easter Egg-Hunt: eggs on threads must be reached in step order',
    foundIn: 'halloween',
    homeRoom: 'easter',
    proto: chick,
  },
  picnic: {
    id: 'picnic',
    title: 'Picnic Basket',
    icon: '🧺',
    twistLabel: 'Fourth of July Patriotic: red and blue knots alternate or match along threads',
    foundIn: 'halloween',
    homeRoom: 'fourth',
    proto: picnic,
  },
  gravyboat: {
    id: 'gravyboat',
    title: 'Gravy Boat',
    icon: '🥣',
    twistLabel: 'Thanksgiving Portioned: threads cannot cross a thick fence line',
    foundIn: 'halloween',
    homeRoom: 'thanksgiving',
    proto: gravyboat,
  },

  // Found in Thanksgiving (5)
  hotdog: {
    id: 'hotdog',
    title: 'The Hot Dog',
    icon: '🌭',
    twistLabel: 'Fourth of July Patriotic: same-color portions never share an edge',
    foundIn: 'thanksgiving',
    homeRoom: 'fourth',
    proto: hotdog,
  },
  stocking: {
    id: 'stocking',
    title: 'The Stocking',
    icon: '🧦',
    twistLabel: 'Christmas Snowflake: cuts mirror inside the frosty frame',
    foundIn: 'thanksgiving',
    homeRoom: 'christmas',
    proto: stocking,
  },
  locket: {
    id: 'locket',
    title: 'Heart Locket',
    icon: '💖',
    twistLabel: "Valentine's Love-Letter: same letter = same portion area",
    foundIn: 'thanksgiving',
    homeRoom: 'valentines',
    proto: locket,
  },
  jellybeans: {
    id: 'jellybeans',
    title: 'Jelly Bean Jar',
    icon: '🫘',
    twistLabel: 'Easter Egg-Hunt: each portion holds one of each treat',
    foundIn: 'thanksgiving',
    homeRoom: 'easter',
    proto: jellybeans,
  },
  candycorn: {
    id: 'candycorn',
    title: 'Candy Corn Dish',
    icon: '🍬',
    twistLabel: 'Halloween Spooky: ? clues stand for a portion of any area',
    foundIn: 'thanksgiving',
    homeRoom: 'halloween',
    proto: candycorn,
  },

  // Found in Christmas (5)
  goldenegg: {
    id: 'goldenegg',
    title: 'The Golden Egg',
    icon: '🥚',
    twistLabel: 'Easter Egg-Hunt: reach each numbered egg in that many wire steps',
    foundIn: 'christmas',
    homeRoom: 'easter',
    proto: goldenegg,
  },
  pumpkinpie: {
    id: 'pumpkinpie',
    title: 'The Pumpkin Pie',
    icon: '🥧',
    twistLabel: 'Thanksgiving Portioned: each slice gets one wire from the plug',
    foundIn: 'christmas',
    homeRoom: 'thanksgiving',
    proto: pumpkinpie,
  },
  loveletter: {
    id: 'loveletter',
    title: 'Love Letter',
    icon: '💌',
    twistLabel:
      "Valentine's Love-Letter: matching letters sit at equal wire distance from the plug",
    foundIn: 'christmas',
    homeRoom: 'valentines',
    proto: loveletter,
  },
  icepop: {
    id: 'icepop',
    title: 'Firecracker Ice Pop',
    icon: '🍧',
    twistLabel:
      'Fourth of July Patriotic: red and blue bulbs cannot connect directly to the same color',
    foundIn: 'christmas',
    homeRoom: 'fourth',
    proto: icepop,
  },
  cauldron: {
    id: 'cauldron',
    title: 'Mini Cauldron',
    icon: '⚗️',
    twistLabel: 'Halloween Spooky: dark tiles hide their wire shape until powered',
    foundIn: 'christmas',
    homeRoom: 'halloween',
    proto: cauldron,
  },

  // Found in Valentine's (5)
  jack: {
    id: 'jack',
    title: "Jack-o'-Lantern",
    icon: '🎃',
    twistLabel: 'Halloween Spooky: ? letters hide in the dark until found',
    foundIn: 'valentines',
    homeRoom: 'halloween',
    proto: jack,
  },
  basket: {
    id: 'basket',
    title: "Bunny's Basket",
    icon: '🧺',
    twistLabel: 'Easter Egg-Hunt: an egg shows a letter’s position in its word',
    foundIn: 'valentines',
    homeRoom: 'easter',
    proto: basket,
  },
  watermelon: {
    id: 'watermelon',
    title: 'Watermelon Slice',
    icon: '🍉',
    twistLabel: 'Fourth of July Patriotic: red and blue tiles must alternate along each word',
    foundIn: 'valentines',
    homeRoom: 'fourth',
    proto: watermelon,
  },
  wishbone: {
    id: 'wishbone',
    title: 'Lucky Wishbone',
    icon: '🦴',
    twistLabel: 'Thanksgiving Portioned: words cannot cross a thick fence line',
    foundIn: 'valentines',
    homeRoom: 'thanksgiving',
    proto: wishbone,
  },
  candycane: {
    id: 'candycane',
    title: 'Candy Cane',
    icon: '🍬',
    twistLabel: 'Christmas Snowflake: word paths mirror across the icy line',
    foundIn: 'valentines',
    homeRoom: 'christmas',
    proto: candycane,
  },

  // Found in Easter (5)
  flag: {
    id: 'flag',
    title: 'Star-Spangled Flag',
    icon: '🇺🇸',
    twistLabel:
      'Fourth of July Patriotic: red and blue bunnies hop over their own color (white is shared)',
    foundIn: 'easter',
    homeRoom: 'fourth',
    proto: flag,
  },
  cornucopia: {
    id: 'cornucopia',
    title: 'The Cornucopia',
    icon: '🌽',
    twistLabel: 'Thanksgiving Portioned: finish each outlined course before the next',
    foundIn: 'easter',
    homeRoom: 'thanksgiving',
    proto: cornucopia,
  },
  rose: {
    id: 'rose',
    title: 'Long-Stem Rose',
    icon: '🌹',
    twistLabel: "Valentine's Love-Letter: visit matching letter pairs at equal hop counts",
    foundIn: 'easter',
    homeRoom: 'valentines',
    proto: rose,
  },
  ghost: {
    id: 'ghost',
    title: 'Sheet Ghost',
    icon: '👻',
    twistLabel: 'Halloween Spooky: dark tiles must be hopped across in a straight line',
    foundIn: 'easter',
    homeRoom: 'halloween',
    proto: ghost,
  },
  gingerbread: {
    id: 'gingerbread',
    title: 'Gingerbread Man',
    icon: '🍪',
    twistLabel: 'Christmas Snowflake: hop path mirrors inside the frosty frame',
    foundIn: 'easter',
    homeRoom: 'christmas',
    proto: gingerbread,
  },

  // Found in Fourth of July (5)
  bow: {
    id: 'bow',
    title: "Cupid's Bow",
    icon: '🏹',
    twistLabel: "Valentine's Love-Letter: letter clues share equal run lengths",
    foundIn: 'fourth',
    homeRoom: 'valentines',
    proto: bow,
  },
  broom: {
    id: 'broom',
    title: "Witch's Broom",
    icon: '🧹',
    twistLabel: 'Halloween Spooky: ? clues hide runs of any non-zero length',
    foundIn: 'fourth',
    homeRoom: 'halloween',
    proto: broom,
  },
  chocobunny: {
    id: 'chocobunny',
    title: 'Chocolate Bunny',
    icon: '🐇',
    twistLabel: 'Easter Egg-Hunt: numbered eggs mark exact filled cells along the row/column',
    foundIn: 'fourth',
    homeRoom: 'easter',
    proto: chocobunny,
  },
  harvestcorn: {
    id: 'harvestcorn',
    title: 'Harvest Corn',
    icon: '🌽',
    twistLabel: 'Thanksgiving Portioned: each fenced portion contains the shown filled count',
    foundIn: 'fourth',
    homeRoom: 'thanksgiving',
    proto: harvestcorn,
  },
  snowglobe: {
    id: 'snowglobe',
    title: 'Snow Globe',
    icon: '🔮',
    twistLabel: 'Christmas Snowflake: filled cells mirror across the icy line',
    foundIn: 'fourth',
    homeRoom: 'christmas',
    proto: snowglobe,
  },
};

const HALLOWEEN_HOME_RELICS = ['candycorn', 'cauldron', 'jack', 'ghost', 'broom'] as const;
const THANKSGIVING_HOME_RELICS = [
  'gravyboat',
  'pumpkinpie',
  'wishbone',
  'cornucopia',
  'harvestcorn',
] as const;
const CHRISTMAS_HOME_RELICS = [
  'starlights',
  'stocking',
  'candycane',
  'gingerbread',
  'snowglobe',
] as const;
const VALENTINES_HOME_RELICS = ['chocolates', 'locket', 'loveletter', 'rose', 'bow'] as const;
const EASTER_HOME_RELICS = ['chick', 'jellybeans', 'goldenegg', 'basket', 'chocobunny'] as const;
const FOURTH_HOME_RELICS = ['picnic', 'hotdog', 'icepop', 'watermelon', 'flag'] as const;

const HALLOWEEN_HOME_TWIST: HomeTwistSpec = {
  id: 'web',
  title: "The Spider's Web",
  icon: '🕸️',
  twistLabel: 'Halloween Spooky: dark knots (?) may take any thread count',
  requiredItems: HALLOWEEN_HOME_RELICS,
  proto: web,
};

const THANKSGIVING_HOME_TWIST: HomeTwistSpec = {
  id: 'feast',
  title: 'The Feast',
  icon: '🦃',
  twistLabel: 'Thanksgiving Portioned: no rectangle may cross a thick fence line',
  requiredItems: THANKSGIVING_HOME_RELICS,
  proto: feast,
};

const CHRISTMAS_HOME_TWIST: HomeTwistSpec = {
  id: 'tree',
  title: 'The Christmas Tree',
  icon: '🎄',
  twistLabel: 'Christmas Snowflake: wires inside the frosty frame mirror across the axis',
  requiredItems: CHRISTMAS_HOME_RELICS,
  proto: tree,
};

const VALENTINES_HOME_TWIST: HomeTwistSpec = {
  id: 'mailbox',
  title: 'The Valentine Mailbox',
  icon: '📮',
  twistLabel: "Valentine's Love-Letter: numbered squares share coded letters",
  requiredItems: VALENTINES_HOME_RELICS,
  proto: mailbox,
};

const EASTER_HOME_TWIST: HomeTwistSpec = {
  id: 'eggtree',
  title: 'The Egg Tree',
  icon: '🌳',
  twistLabel: 'Easter Egg-Hunt: hop underground between matching burrows to reach the Golden Egg',
  requiredItems: EASTER_HOME_RELICS,
  proto: eggtree,
};

const FOURTH_HOME_TWIST: HomeTwistSpec = {
  id: 'finale',
  title: 'The Grand Finale',
  icon: '🎆',
  twistLabel: 'Fourth of July Patriotic: red and blue runs can touch without a gap',
  requiredItems: FOURTH_HOME_RELICS,
  proto: finale,
};

export const ROOM_SPECS: readonly [RoomSpec, RoomSpec, RoomSpec, RoomSpec, RoomSpec, RoomSpec] = [
  {
    id: 'halloween',
    title: 'Halloween Porch',
    shortTitle: 'Halloween',
    icon: '🎃',
    genreLabel: 'Web',
    accent: '#805ad5',
    secondaryAccent: '#ff7b29',
    wallColor: '#634887',
    floorColor: '#8c5a3c',
    warmup: cobwebs,
    homeTwist: HALLOWEEN_HOME_TWIST,
    strays: [
      STRAY_ITEMS.chocolates,
      STRAY_ITEMS.starlights,
      STRAY_ITEMS.chick,
      STRAY_ITEMS.picnic,
      STRAY_ITEMS.gravyboat,
    ],
    homeRelics: HALLOWEEN_HOME_RELICS,
  },
  {
    id: 'thanksgiving',
    title: 'Thanksgiving Table',
    shortTitle: 'Thanksgiving',
    icon: '🦃',
    genreLabel: 'Carving',
    accent: '#8c4a20',
    secondaryAccent: '#ed8936',
    wallColor: '#e8cfa8',
    floorColor: '#8c583a',
    warmup: breadboard,
    homeTwist: THANKSGIVING_HOME_TWIST,
    strays: [
      STRAY_ITEMS.hotdog,
      STRAY_ITEMS.stocking,
      STRAY_ITEMS.locket,
      STRAY_ITEMS.jellybeans,
      STRAY_ITEMS.candycorn,
    ],
    homeRelics: THANKSGIVING_HOME_RELICS,
  },
  {
    id: 'christmas',
    title: 'Christmas Hearth',
    shortTitle: 'Christmas',
    icon: '🎄',
    genreLabel: 'Lights',
    accent: '#2f855a',
    secondaryAccent: '#e53e3e',
    wallColor: '#d9ece2',
    floorColor: '#7a4b3a',
    warmup: fairylights,
    homeTwist: CHRISTMAS_HOME_TWIST,
    strays: [
      STRAY_ITEMS.goldenegg,
      STRAY_ITEMS.pumpkinpie,
      STRAY_ITEMS.loveletter,
      STRAY_ITEMS.icepop,
      STRAY_ITEMS.cauldron,
    ],
    homeRelics: CHRISTMAS_HOME_RELICS,
  },
  {
    id: 'valentines',
    title: "Valentine's Parlor",
    shortTitle: "Valentine's",
    icon: '💌',
    genreLabel: 'Heartstrings',
    accent: '#ed64a6',
    secondaryAccent: '#e53e3e',
    wallColor: '#fbe4ec',
    floorColor: '#9c5a6d',
    warmup: lovenotes,
    homeTwist: VALENTINES_HOME_TWIST,
    strays: [
      STRAY_ITEMS.jack,
      STRAY_ITEMS.basket,
      STRAY_ITEMS.watermelon,
      STRAY_ITEMS.wishbone,
      STRAY_ITEMS.candycane,
    ],
    homeRelics: VALENTINES_HOME_RELICS,
  },
  {
    id: 'easter',
    title: 'Easter Garden',
    shortTitle: 'Easter',
    icon: '🐰',
    genreLabel: 'Hops',
    accent: '#ecc94b',
    secondaryAccent: '#f687b3',
    wallColor: '#fefcbf',
    floorColor: '#b7791f',
    warmup: hutch,
    homeTwist: EASTER_HOME_TWIST,
    strays: [
      STRAY_ITEMS.flag,
      STRAY_ITEMS.cornucopia,
      STRAY_ITEMS.rose,
      STRAY_ITEMS.ghost,
      STRAY_ITEMS.gingerbread,
    ],
    homeRelics: EASTER_HOME_RELICS,
  },
  {
    id: 'fourth',
    title: 'Fourth of July Yard',
    shortTitle: 'Fourth of July',
    icon: '🎆',
    genreLabel: 'Fireworks',
    accent: '#2b6cb0',
    secondaryAccent: '#e53e3e',
    wallColor: '#dce7f7',
    floorColor: '#5c7863',
    warmup: sparklers,
    homeTwist: FOURTH_HOME_TWIST,
    strays: [
      STRAY_ITEMS.bow,
      STRAY_ITEMS.broom,
      STRAY_ITEMS.chocobunny,
      STRAY_ITEMS.harvestcorn,
      STRAY_ITEMS.snowglobe,
    ],
    homeRelics: FOURTH_HOME_RELICS,
  },
];

/**
 * A twist's label for a genre: "<Holiday> <Adjective>: <rule>", the rule taken from that genre's
 * clause twist text (`clauses/<genre>.ts`, `twistMeta`), the single source of each twist's rules.
 */
export function twistLabelFor(genre: ClauseGenre, holiday: RoomId): string {
  const key = getGenreTwistKey(genre, holiday);
  const meta = ALL_CLAUSES.find((c) => c.genre === genre)?.twistMeta.find((m) => m.key === key);
  const terms = HOLIDAY_TERMS[holiday];
  return `${terms.holiday} ${terms.twistAdjective}: ${meta?.rule ?? key}`;
}

for (const relic of Object.values(STRAY_ITEMS)) {
  relic.twistLabel = twistLabelFor(HOLIDAY_TERMS[relic.foundIn].genre, relic.homeRoom);
}
for (const room of ROOM_SPECS) {
  room.homeTwist.twistLabel = twistLabelFor(HOLIDAY_TERMS[room.id].genre, room.id);
}

export const FINALE_PROTO = clause;

export const SAVE_KEY = 'puzz.save';
export const SAVE_VERSION = 2;

export interface ActivePuzzleSave {
  protoId: string;
  panelIdx?: number;
  clauseIdx?: number;
  freePlay?: { tier: Tier; seed: number; panel: unknown };
  panelSig?: string;
  boardState?: unknown;
}

export interface SaveData {
  version: number;
  /** Solved puzzle keys (`<protoId>:<idx>` for room runs, `clause:<genre>:<idx>` for Merger Contract clauses). */
  solvedPuzzles: string[];
  /** Restored Relic IDs on their home shelves (`chocolates`, `starlights`, etc.). */
  restoredRelics: StrayId[];
  /** Seen story beat IDs (`P0`, `P1`, `T1`, `C1.torn`, etc.). */
  milestones: string[];
  /** Story beats queued for the next return to Holiday Hall (`E1`..`E6`). */
  hallPendingBeats: BeatId[];
  /** Name of the first holiday room completed (`{holiday}` interpolation in `E1`). */
  firstRevertedHoliday: string;
  /** Whether Free Play is explicitly unlocked across all rungs. */
  freePlayUnlocked: boolean;
  /** Solved Free Play board counts keyed by `<protoId>:<tier>` (`easy` | `medium` | `hard`). */
  freePlayCounts?: Record<string, number>;
  /** Currently open puzzle modal and in-progress board state, if any. */
  activePuzzle?: ActivePuzzleSave;
}

function getRoomProtos(): Proto[] {
  const out: Proto[] = [];
  for (const r of ROOM_SPECS) {
    if (r.warmup) out.push(r.warmup);
    if (r.homeTwist?.proto) out.push(r.homeTwist.proto);
    for (const s of r.strays) {
      if (s?.proto) out.push(s.proto);
    }
  }
  return out;
}

const LEGACY_KEYS = {
  solvedRuns: 'puzz.proto.solved',
  solvedPanels: 'puzz.proto.panels',
  placedItems: 'puzz.meta.placed',
  milestones: 'puzz.meta.milestones',
  freePlay: 'puzz.meta.freeplay',
  pinnedMemos: 'puzz.story.memos',
  hallPending: 'puzz.story.hallPending',
  firstHoliday: 'puzz.story.firstHoliday',
} as const;

export class GameState {
  readonly solvedRuns = new Set<string>();
  readonly solvedPanels = new Set<string>();
  readonly placedItems = new Set<string>();
  readonly milestones = new Set<string>();
  readonly pinnedMemos = new Set<MemoId>(['P1']);
  readonly hallPendingBeats = new Set<BeatId>();
  readonly beatQueue: BeatId[] = [];
  readonly freePlayCounts = new Map<string, number>();
  firstRevertedHoliday = 'Thanksgiving';
  freePlayUnlocked = false;
  activePuzzle: ActivePuzzleSave | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private listeners = new Set<() => void>();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(): void {
    for (const fn of this.listeners) fn();
  }

  /** Total panel count for a room run (`proto.panelCount ?? 1`), or `132` for `'clause'`. */
  runPanelCount(protoId: string): number {
    if (protoId === 'clause') return CLAUSE_GENRES.length * CLAUSE_PANEL_COUNT;
    return getRoomProtos().find((p) => p.id === protoId)?.panelCount ?? 1;
  }

  /** Number of solved panels (`0..N`) for a room run or `'clause'`. */
  runSolvedPanelCount(protoId: string): number {
    if (protoId === 'clause') {
      return CLAUSE_GENRES.reduce((sum, g) => sum + this.clauseSolvedPanelCount(g), 0);
    }
    const count = this.runPanelCount(protoId);
    let solved = 0;
    for (let i = 0; i < count; i++) {
      if (this.solvedPanels.has(`${protoId}:${i}`)) solved++;
    }
    return solved;
  }

  /** Total number of panels across all 6 holiday rooms + all 6 Merger Contract clauses. */
  totalGamePanelCount(): number {
    const roomTotal = getRoomProtos().reduce((sum, p) => sum + (p.panelCount ?? 1), 0);
    return roomTotal + CLAUSE_GENRES.length * CLAUSE_PANEL_COUNT;
  }

  /** Total number of solved panels across all 6 holiday rooms + all 6 Merger Contract clauses. */
  totalSolvedPanelCount(): number {
    const roomSolved = getRoomProtos().reduce((sum, p) => sum + this.runSolvedPanelCount(p.id), 0);
    return roomSolved + this.runSolvedPanelCount('clause');
  }

  /** Number of solved Free Play boards for `(protoId, tier)`. */
  freePlaySolvedCount(protoId: string, tier: Tier): number {
    return this.freePlayCounts.get(`${protoId}:${tier}`) ?? 0;
  }

  /** Increment and persist the solved Free Play counter for `(protoId, tier)`. */
  incrementFreePlaySolved(protoId: string, tier: Tier): number {
    const key = `${protoId}:${tier}`;
    const next = (this.freePlayCounts.get(key) ?? 0) + 1;
    this.freePlayCounts.set(key, next);
    this.save();
    this.notify();
    return next;
  }

  private fillClausePanels(clauseIdx: number, voided: boolean): void {
    const genre = CLAUSE_GENRES[clauseIdx];
    if (!genre) return;
    this.solvedPanels.delete(`clause:${clauseIdx}`);
    for (let i = 0; i < CLAUSE_PANEL_COUNT; i++) {
      const key = `clause:${genre}:${i}`;
      if (voided) this.solvedPanels.add(key);
      else this.solvedPanels.delete(key);
    }
  }

  private fillRunPanels(protoId: string, solved: boolean): void {
    if (protoId === 'clause') {
      for (let c = 0; c < CLAUSE_GENRES.length; c++) {
        this.fillClausePanels(c, solved);
      }
      return;
    }
    const count = this.runPanelCount(protoId);
    if (solved) {
      for (let i = 0; i < count; i++) {
        this.solvedPanels.add(`${protoId}:${i}`);
      }
    } else {
      for (const k of [...this.solvedPanels]) {
        if (k.startsWith(`${protoId}:`)) {
          this.solvedPanels.delete(k);
        }
      }
    }
  }

  /**
   * Recompute `solvedRuns` and `pinnedMemos` deterministically from `solvedPanels`,
   * `placedItems`, and `milestones` so they never drift out of sync.
   */
  recomputeDerived(): void {
    for (let c = 0; c < CLAUSE_GENRES.length; c++) {
      if (this.solvedPanels.has(`clause:${c}`)) {
        this.fillClausePanels(c, true);
      }
    }

    this.solvedRuns.clear();
    for (const proto of getRoomProtos()) {
      const count = proto.panelCount ?? 1;
      let allDone = true;
      for (let i = 0; i < count; i++) {
        if (!this.solvedPanels.has(`${proto.id}:${i}`)) {
          allDone = false;
          break;
        }
      }
      if (allDone) {
        this.solvedRuns.add(proto.id);
      }
    }

    const allClausesDone = CLAUSE_GENRES.every((genre) => {
      for (let i = 0; i < CLAUSE_PANEL_COUNT; i++) {
        if (!this.solvedPanels.has(`clause:${genre}:${i}`)) return false;
      }
      return true;
    });
    if (allClausesDone) {
      this.solvedRuns.add('clause');
    }

    // Derive pinned memos in canonical order from current progress + seen memo milestones
    this.pinnedMemos.clear();
    this.pinnedMemos.add('P1');
    const anyStraySolved = Object.values(STRAY_ITEMS).some(
      (s) => s.proto && this.solvedRuns.has(s.proto.id),
    );
    if (anyStraySolved || this.milestones.has('T1')) {
      this.pinnedMemos.add('T1');
    }
    for (const room of ROOM_SPECS) {
      const enterId = ROOM_SCRIPT[room.id].enterMemoId;
      if ((room.warmup && this.solvedRuns.has(room.warmup.id)) || this.milestones.has(enterId)) {
        this.pinnedMemos.add(enterId);
      }
    }
    // Escalation memos E1..E6 trigger every 5 relics returned (5, 10, 15, 20, 25, 30)
    const escalationTier = Math.floor(this.placedItems.size / 5);
    for (let k = 1; k <= ROOM_SPECS.length; k++) {
      const escId = `E${k}` as MemoId;
      if (k <= escalationTier || this.milestones.has(escId)) {
        this.pinnedMemos.add(escId);
      }
    }
    if (this.solvedRuns.has('clause') || this.milestones.has('Y7')) {
      this.pinnedMemos.add('Y7');
    }
  }

  /** Export a clean, serializable snapshot of the entire save state. */
  exportSave(): SaveData {
    this.recomputeDerived();
    const fpObj: Record<string, number> = {};
    for (const [k, v] of [...this.freePlayCounts.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      if (v > 0) fpObj[k] = v;
    }
    return {
      version: SAVE_VERSION,
      solvedPuzzles: [...this.solvedPanels].sort(),
      restoredRelics: [...this.placedItems].filter((id): id is StrayId => id in STRAY_ITEMS).sort(),
      milestones: [...this.milestones].sort(),
      hallPendingBeats: [...this.hallPendingBeats],
      firstRevertedHoliday: this.firstRevertedHoliday,
      freePlayUnlocked: this.freePlayUnlocked,
      ...(Object.keys(fpObj).length > 0 ? { freePlayCounts: fpObj } : {}),
      ...(this.activePuzzle ? { activePuzzle: this.activePuzzle } : {}),
    };
  }

  /** Export a formatted JSON string of the save state for backup/sharing. */
  exportSaveJson(): string {
    return JSON.stringify(this.exportSave(), null, 2);
  }

  /** Persist the unified save state to `localStorage['puzz.save']`. */
  save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.exportSave()));
    } catch {
      // Ignore storage errors in private browsing / sandboxed contexts.
    }
  }

  /** Load v2 save state from `localStorage['puzz.save']`, resetting stale v1 saves cleanly. */
  private loadFromStorage(): void {
    try {
      // Clean up any pre-v2 legacy multi-keys
      for (const k of Object.values(LEGACY_KEYS)) {
        localStorage.removeItem(k);
      }
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { version?: unknown } | null;
        if (parsed && typeof parsed === 'object' && parsed.version === SAVE_VERSION) {
          const res = this.applySaveObject(parsed, false);
          if (res.ok) return;
        } else {
          // Reset v1 saves cleanly per revamp-centerpieces.md
          localStorage.removeItem(SAVE_KEY);
        }
      }
    } catch {
      // Start fresh on parse/storage error
    }
  }

  private applySaveObject(
    parsed: unknown,
    persistAndNotify: boolean,
  ): { ok: true } | { ok: false; error: string } {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Save data must be a JSON object.' };
    }
    const obj = parsed as Partial<SaveData> & {
      solvedPanels?: unknown;
      placedItems?: unknown;
      solvedRuns?: unknown;
    };
    const rawPuzzles = obj.solvedPuzzles ?? obj.solvedPanels;
    const rawRelics = obj.restoredRelics ?? obj.placedItems;
    if (rawPuzzles !== undefined && !Array.isArray(rawPuzzles)) {
      return { ok: false, error: '"solvedPuzzles" must be an array of strings.' };
    }
    if (rawRelics !== undefined && !Array.isArray(rawRelics)) {
      return { ok: false, error: '"restoredRelics" must be an array of relic IDs.' };
    }

    this.solvedPanels.clear();
    this.placedItems.clear();
    this.milestones.clear();
    this.hallPendingBeats.clear();
    this.beatQueue.length = 0;
    this.freePlayCounts.clear();

    if (Array.isArray(rawPuzzles)) {
      for (const k of rawPuzzles) {
        if (typeof k === 'string') this.solvedPanels.add(k);
      }
    }
    if (Array.isArray(obj.solvedRuns)) {
      for (const runId of obj.solvedRuns) {
        if (typeof runId === 'string') this.fillRunPanels(runId, true);
      }
    }
    if (Array.isArray(rawRelics)) {
      for (const id of rawRelics) {
        if (typeof id === 'string' && id in STRAY_ITEMS) {
          this.placedItems.add(id);
          // Restored relics imply their relic run was solved
          const stray = STRAY_ITEMS[id as StrayId];
          this.fillRunPanels(stray.proto.id, true);
        }
      }
    }
    if (Array.isArray(obj.milestones)) {
      for (const m of obj.milestones) {
        if (typeof m === 'string') this.milestones.add(m);
      }
    }
    if (Array.isArray(obj.hallPendingBeats)) {
      for (const b of obj.hallPendingBeats) {
        if (typeof b === 'string') this.hallPendingBeats.add(b as BeatId);
      }
    }
    if (obj.freePlayCounts && typeof obj.freePlayCounts === 'object') {
      for (const [k, v] of Object.entries(obj.freePlayCounts)) {
        if (typeof v === 'number' && v > 0) {
          this.freePlayCounts.set(k, Math.floor(v));
        }
      }
    }
    this.firstRevertedHoliday =
      typeof obj.firstRevertedHoliday === 'string' && obj.firstRevertedHoliday.trim()
        ? obj.firstRevertedHoliday
        : 'Thanksgiving';
    this.freePlayUnlocked = Boolean(obj.freePlayUnlocked);

    this.recomputeDerived();
    if (this.solvedRuns.has('clause')) {
      this.freePlayUnlocked = true;
    }

    this.activePuzzle = null;
    if (
      obj.activePuzzle &&
      typeof obj.activePuzzle === 'object' &&
      !Array.isArray(obj.activePuzzle)
    ) {
      const ap = obj.activePuzzle as Partial<ActivePuzzleSave>;
      if (
        typeof ap.protoId === 'string' &&
        (ap.protoId === 'clause' || getRoomProtos().some((p) => p.id === ap.protoId))
      ) {
        const sanitized: ActivePuzzleSave = { protoId: ap.protoId };
        if (typeof ap.panelIdx === 'number' && Number.isInteger(ap.panelIdx) && ap.panelIdx >= 0) {
          sanitized.panelIdx = ap.panelIdx;
        }
        if (
          typeof ap.clauseIdx === 'number' &&
          Number.isInteger(ap.clauseIdx) &&
          ap.clauseIdx >= 0 &&
          ap.clauseIdx < CLAUSE_GENRES.length
        ) {
          sanitized.clauseIdx = ap.clauseIdx;
        }
        if (
          ap.freePlay &&
          typeof ap.freePlay === 'object' &&
          (ap.freePlay.tier === 'easy' ||
            ap.freePlay.tier === 'medium' ||
            ap.freePlay.tier === 'hard') &&
          typeof ap.freePlay.seed === 'number' &&
          ap.freePlay.panel &&
          typeof ap.freePlay.panel === 'object'
        ) {
          sanitized.freePlay = {
            tier: ap.freePlay.tier,
            seed: ap.freePlay.seed,
            panel: ap.freePlay.panel,
          };
        }
        if (typeof ap.panelSig === 'string') {
          sanitized.panelSig = ap.panelSig;
        }
        if (ap.boardState !== undefined) {
          sanitized.boardState = ap.boardState;
        }
        if (this.isValidActivePuzzle(sanitized)) {
          this.activePuzzle = sanitized;
        }
      }
    }

    if (persistAndNotify) {
      this.save();
      this.notify();
    }
    return { ok: true };
  }

  /** Validate and import a JSON save string, updating the game and saving to `puzz.save`. */
  importSaveJson(jsonText: string): { ok: true } | { ok: false; error: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      return {
        ok: false,
        error: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as { version?: unknown }).version !== SAVE_VERSION
    ) {
      return {
        ok: false,
        error: "This save is from an older version of the game and can't be loaded.",
      };
    }
    return this.applySaveObject(parsed, true);
  }

  /** Pin a memo to the Hall Corkboard without necessarily opening a modal. */
  pinMemo(id: MemoId): void {
    if (!this.pinnedMemos.has(id)) {
      this.pinnedMemos.add(id);
      this.save();
    }
  }

  /** Return all discovered XMAS365 / Xmas12 memos in canonical Corkboard order. */
  pinnedMemosInOrder(): MemoSpec[] {
    this.recomputeDerived();
    return MEMO_ORDER.filter((id) => this.pinnedMemos.has(id)).map((id) => MEMOS[id]);
  }

  /**
   * Queue a story beat (`SCRIPT.md`) to play in order.
   * If `force` is false and the beat has already been seen, it is skipped (though memos still pin).
   */
  enqueueBeat(id: BeatId, force = false): void {
    if (id in MEMOS) {
      this.pinMemo(id as MemoId);
    }
    if (!force && this.milestones.has(id)) return;
    if (!this.beatQueue.includes(id)) {
      if (id in MEMOS && id !== 'Y7') {
        const barkIdx = this.beatQueue.findIndex((b) => b === 'T3' || b.endsWith('.caged'));
        if (barkIdx !== -1) {
          this.beatQueue.splice(barkIdx, 0, id);
          this.notify();
          return;
        }
      }
      this.beatQueue.push(id);
      this.notify();
    }
  }

  /** Whether the player has any existing save progress (so cold start goes straight to the hall). */
  hasSaveProgress(): boolean {
    return (
      this.milestones.has('P0') ||
      this.milestones.has('P1') ||
      this.solvedPanels.size > 0 ||
      this.placedItems.size > 0
    );
  }

  /** Mark the intro cinematic (`P0`) as completed in persistent milestones. */
  markIntroSeen(): void {
    if (!this.milestones.has('P0')) {
      this.milestones.add('P0');
      this.save();
    }
  }

  /** Return the front beat waiting to be displayed, or `null` if the queue is empty. */
  currentBeat(): BeatId | null {
    return this.beatQueue[0] ?? null;
  }

  /** Dismiss the active beat, mark it as seen, and advance the queue. */
  dismissBeat(id?: BeatId): void {
    const target = id ?? this.beatQueue[0];
    if (!target) return;
    const idx = this.beatQueue.indexOf(target);
    if (idx !== -1) {
      this.beatQueue.splice(idx, 1);
    }
    this.milestones.add(target);
    this.recomputeDerived();
    this.save();
    this.notify();
  }

  /**
   * Triggered when the player enters Holiday Hall or turns to a holiday alcove (`SCRIPT.md`).
   * - In `hall`: opens `P1` on a new game, and flushes any pending escalation memos (`E1`–`E6`).
   * - In a holiday room: nothing yet. The room's memo (`<room>.enter`, with its caged mascot's plea
   *   on a sticky note) comes with beating its Intro Run: see `markRunSolved`.
   */
  onEnterBay(bay: 'hall' | RoomId): void {
    if (bay === 'hall') {
      this.enqueueBeat('P1');
      if (this.hallPendingBeats.size > 0) {
        const pending = [...this.hallPendingBeats];
        this.hallPendingBeats.clear();
        this.save();
        for (const beatId of pending) {
          this.enqueueBeat(beatId);
        }
      }
      return;
    }
  }

  /** Record a single solved panel (`<protoId>:<panelIdx>`) in a room puzzle run. */
  markPanelSolved(protoId: string, panelIdx: number): void {
    const key = `${protoId}:${panelIdx}`;
    if (!this.solvedPanels.has(key)) {
      this.solvedPanels.add(key);
      this.recomputeDerived();
      this.save();
    }
  }

  markRunSolved(protoId: string): void {
    this.fillRunPanels(protoId, true);
    this.recomputeDerived();

    // 1. First relic ever freed -> `T1` Logistics memo
    const isStray = Object.values(STRAY_ITEMS).some((s) => s.proto.id === protoId);
    if (isStray) {
      this.enqueueBeat('T1');
    }

    // 2. A room's Intro Run beaten -> that room's memo (`<room>.enter`)
    const warmupRoom = ROOM_SPECS.find((r) => r.warmup.id === protoId);
    if (warmupRoom) this.enqueueBeat(ROOM_SCRIPT[warmupRoom.id].enterMemoId);

    // 3. Merger contract solved -> loophole & Santa confrontation (`C6.torn`), party (`Y1`, `Y2`, `Y4`), and `Y7` memo
    if (protoId === 'clause') {
      this.freePlayUnlocked = true;
      this.enqueueBeat('C6.torn');
      this.enqueueBeat('Y1');
      this.enqueueBeat('Y2');
      this.enqueueBeat('Y4');
      this.enqueueBeat('Y7');
    }

    this.recomputeDerived();
    this.save();
    this.notify();
  }

  /**
   * Toggle a run's solved state directly (used by Settings toggles and dev tools).
   * Updates all panels of the run and syncs derived state/memos without queuing modal popups.
   */
  setRunSolved(protoId: string, solved: boolean): void {
    this.fillRunPanels(protoId, solved);
    if (solved) {
      if (protoId === 'clause') {
        this.freePlayUnlocked = true;
      }
    } else {
      const warmupRoom = ROOM_SPECS.find((r) => r.warmup.id === protoId);
      if (warmupRoom) {
        this.milestones.delete(ROOM_SCRIPT[warmupRoom.id].enterMemoId);
      }
      if (protoId === 'clause') {
        for (const b of [
          ...CLAUSE_EARLY_TORN_BEATS,
          'C6.torn',
          'Y1',
          'Y2',
          'Y4',
          'Y5',
          'Y6',
          'Y7',
        ]) {
          this.milestones.delete(b);
        }
      }
    }
    this.recomputeDerived();
    if (!solved) {
      const anyStraySolved = Object.values(STRAY_ITEMS).some((s) =>
        this.solvedRuns.has(s.proto.id),
      );
      if (!anyStraySolved) {
        this.milestones.delete('T1');
      }
      this.recomputeDerived();
    }
    this.save();
    this.notify();
  }

  /** Whether a specific panel (`0..21`) within a Merger Contract clause has been solved. */
  isClausePanelSolved(genre: ClauseGenre | string, panelIdx: number): boolean {
    if (this.solvedRuns.has('clause')) return true;
    return this.solvedPanels.has(`clause:${genre}:${panelIdx}`);
  }

  /** Number of solved panels (`0..22`) within a Merger Contract clause. */
  clauseSolvedPanelCount(genre: ClauseGenre | string): number {
    if (this.solvedRuns.has('clause')) return CLAUSE_PANEL_COUNT;
    let count = 0;
    for (let i = 0; i < CLAUSE_PANEL_COUNT; i++) {
      if (this.solvedPanels.has(`clause:${genre}:${i}`)) count++;
    }
    return count;
  }

  /**
   * Mark a specific panel (`0..21`) in a Merger Contract clause as solved.
   * Automatically voids the clause if all 22 panels in that clause are now solved.
   */
  markClausePanelSolved(genre: ClauseGenre | string, panelIdx: number): boolean {
    const key = `clause:${genre}:${panelIdx}`;
    const wasClauseVoided =
      CLAUSE_GENRES.indexOf(genre as ClauseGenre) !== -1 &&
      this.isClauseVoided(CLAUSE_GENRES.indexOf(genre as ClauseGenre));
    const isNew = !this.solvedPanels.has(key);
    if (isNew) {
      this.solvedPanels.add(key);
    }
    const clauseIdx = CLAUSE_GENRES.indexOf(genre as ClauseGenre);
    if (
      clauseIdx !== -1 &&
      !wasClauseVoided &&
      this.clauseSolvedPanelCount(genre) >= CLAUSE_PANEL_COUNT
    ) {
      this.markClauseVoided(clauseIdx, true);
    } else if (isNew) {
      this.recomputeDerived();
      this.save();
      this.notify();
    }
    return isNew;
  }

  /** Whether a Merger Contract clause (`0..5`) has been completely voided. */
  isClauseVoided(clauseIdx: number): boolean {
    if (this.solvedRuns.has('clause')) return true;
    const genre = CLAUSE_GENRES[clauseIdx];
    return genre ? this.clauseSolvedPanelCount(genre) >= CLAUSE_PANEL_COUNT : false;
  }

  /** Count of voided Merger Contract clauses (`0..6`). */
  voidedClauseCount(): number {
    let count = 0;
    for (let i = 0; i < CLAUSE_GENRES.length; i++) {
      if (this.isClauseVoided(i)) count++;
    }
    return count;
  }

  /**
   * Mark a Merger Contract clause (`0..5`) as voided during gameplay, queuing its `C<n>.torn` beat,
   * and completing `'clause'` once all 6 clauses are voided.
   */
  markClauseVoided(clauseIdx: number, forceTrigger = false): boolean {
    const wasVoided = !forceTrigger && this.isClauseVoided(clauseIdx);
    this.fillClausePanels(clauseIdx, true);
    if (!wasVoided) {
      const allVoided = this.voidedClauseCount() >= CLAUSE_GENRES.length;
      if (allVoided) {
        this.markRunSolved('clause');
      } else {
        this.recomputeDerived();
        const earlyBeat = CLAUSE_EARLY_TORN_BEATS[clauseIdx];
        if (earlyBeat) {
          this.enqueueBeat(earlyBeat);
        }
        this.save();
        this.notify();
      }
    } else {
      this.recomputeDerived();
      this.save();
    }
    return !wasVoided;
  }

  /**
   * Toggle a Merger Contract clause (`0..5`) directly (used by Settings toggles).
   */
  setClauseVoided(clauseIdx: number, voided: boolean): void {
    this.fillClausePanels(clauseIdx, voided);
    if (!voided) {
      const earlyBeat = CLAUSE_EARLY_TORN_BEATS[clauseIdx];
      if (earlyBeat) this.milestones.delete(earlyBeat);
      for (const b of ['C6.torn', 'Y1', 'Y2', 'Y4', 'Y5', 'Y6', 'Y7']) {
        this.milestones.delete(b);
      }
    }
    this.recomputeDerived();
    if (this.solvedRuns.has('clause')) {
      this.freePlayUnlocked = true;
    }
    this.save();
    this.notify();
  }

  placeItem(itemId: string): void {
    if (!this.placedItems.has(itemId)) {
      const stray = STRAY_ITEMS[itemId as StrayId];
      const homeRoom = stray ? ROOM_SPECS.find((r) => r.id === stray.homeRoom) : undefined;
      const wasRoomComplete = homeRoom ? this.isRoomComplete(homeRoom) : false;

      this.placedItems.add(itemId);
      if (stray) {
        this.fillRunPanels(stray.proto.id, true);
      }
      this.recomputeDerived();

      // 1. Every 5 relics returned across the Hall (5, 10, 15, 20, 25, 30) triggers E1..E6 immediately
      const totalPlaced = this.placedItems.size;
      if (totalPlaced % 5 === 0) {
        const escIdx = totalPlaced / 5;
        if (escIdx >= 1 && escIdx <= ROOM_SPECS.length) {
          const escId = `E${escIdx}` as MemoId;
          this.enqueueBeat(escId);
        }
      }

      // 2. First relic ever placed on a shelf -> `T3` Leap Day line
      this.enqueueBeat('T3');

      // 3. If this was the 5th relic placed on `homeRoom`'s shelves, its cage opens & mascot is freed!
      if (homeRoom && !wasRoomComplete && this.isRoomComplete(homeRoom)) {
        if (this.completedRoomCount() === 1) {
          this.firstRevertedHoliday = homeRoom.shortTitle;
        }
        this.enqueueBeat(ROOM_SCRIPT[homeRoom.id].freedBeatId);
      }

      this.save();
      this.notify();
    }
  }

  setItemPlaced(itemId: string, placed: boolean): void {
    const stray = STRAY_ITEMS[itemId as StrayId];
    const homeRoom = stray ? ROOM_SPECS.find((r) => r.id === stray.homeRoom) : undefined;
    if (placed) {
      this.placedItems.add(itemId);
      if (stray) {
        this.fillRunPanels(stray.proto.id, true);
      }
      if (homeRoom && this.isRoomComplete(homeRoom) && this.completedRoomCount() === 1) {
        this.firstRevertedHoliday = homeRoom.shortTitle;
      }
      this.recomputeDerived();
      this.save();
      this.notify();
      return;
    }
    if (this.placedItems.delete(itemId)) {
      if (this.placedItems.size === 0) {
        this.milestones.delete('T3');
      }
      if (homeRoom && !this.isRoomComplete(homeRoom)) {
        this.milestones.delete(ROOM_SCRIPT[homeRoom.id].freedBeatId);
      }
      const maxEsc = Math.floor(this.placedItems.size / 5);
      for (let k = maxEsc + 1; k <= ROOM_SPECS.length; k++) {
        const escId = `E${k}` as MemoId;
        this.milestones.delete(escId);
        this.hallPendingBeats.delete(escId);
      }
      this.recomputeDerived();
      this.save();
      this.notify();
    }
  }

  /**
   * Toggle all 5 of a room's Home Relics at once (used by Settings room completion toggles).
   */
  setRoomRelicsPlaced(room: RoomSpec, placed: boolean): void {
    for (const reqId of room.homeRelics) {
      if (placed) {
        this.placedItems.add(reqId);
        const stray = STRAY_ITEMS[reqId];
        if (stray) this.fillRunPanels(stray.proto.id, true);
      } else {
        this.placedItems.delete(reqId);
      }
    }
    if (!placed) {
      this.milestones.delete(ROOM_SCRIPT[room.id].freedBeatId);
      const maxEsc = Math.floor(this.placedItems.size / 5);
      for (let k = maxEsc + 1; k <= ROOM_SPECS.length; k++) {
        const escId = `E${k}` as MemoId;
        this.milestones.delete(escId);
        this.hallPendingBeats.delete(escId);
      }
    } else if (this.completedRoomCount() === 1) {
      this.firstRevertedHoliday = room.shortTitle;
    }
    this.recomputeDerived();
    this.save();
    this.notify();
  }

  resetAll(): void {
    this.solvedRuns.clear();
    this.solvedPanels.clear();
    this.placedItems.clear();
    this.milestones.clear();
    this.pinnedMemos.clear();
    this.pinnedMemos.add('P1');
    this.hallPendingBeats.clear();
    this.beatQueue.length = 0;
    this.freePlayCounts.clear();
    this.firstRevertedHoliday = 'Thanksgiving';
    this.freePlayUnlocked = false;
    this.activePuzzle = null;
    try {
      localStorage.removeItem(SAVE_KEY);
      for (const k of Object.values(LEGACY_KEYS)) {
        localStorage.removeItem(k);
      }
    } catch {
      // Ignore storage errors
    }
    this.enqueueBeat('P1');
    this.notify();
  }

  markMilestone(id: string): void {
    if (!this.milestones.has(id)) {
      this.milestones.add(id);
      this.recomputeDerived();
      this.save();
      this.notify();
    }
  }

  setFreePlay(on: boolean): void {
    this.freePlayUnlocked = on;
    this.save();
    this.notify();
  }

  /** Persist or clear the currently open puzzle modal and its active panel/board state. */
  setActivePuzzle(next: ActivePuzzleSave | null, notify = false): void {
    this.activePuzzle = next ? { ...next } : null;
    this.save();
    if (notify) this.notify();
  }

  /** Update the in-progress board state of the currently open puzzle without triggering global UI re-renders. */
  updateActiveBoardState(boardState: unknown): void {
    if (!this.activePuzzle) return;
    if (boardState === undefined) {
      delete this.activePuzzle.boardState;
    } else {
      this.activePuzzle.boardState = boardState;
    }
    this.save();
  }

  /** Return the holiday room specification where `protoId` lives, or `null` if it's `'clause'` or unknown. */
  getRoomForProto(protoId: string): RoomSpec | null {
    return (
      ROOM_SPECS.find(
        (r) =>
          r.warmup.id === protoId ||
          r.homeTwist.proto.id === protoId ||
          r.strays.some((s) => s.proto.id === protoId),
      ) ?? null
    );
  }

  /** Whether a puzzle run (`protoId`) exists and is currently unlocked to open. */
  isProtoUnlocked(protoId: string): boolean {
    if (protoId === 'clause') {
      return (
        this.completedRoomCount() >= 6 || this.freePlayUnlocked || this.solvedRuns.has('clause')
      );
    }
    const room = this.getRoomForProto(protoId);
    if (!room || !this.isRoomUnlocked(room)) return false;
    if (room.warmup.id === protoId) return true;
    if (room.homeTwist.proto.id === protoId) return this.isHomeTwistUnlocked(room);
    if (room.strays.some((s) => s.proto.id === protoId)) return this.isStrayUnlocked(room);
    return false;
  }

  /**
   * Check whether a saved `ActivePuzzleSave` matches the current puzzle definitions and unlocked progression.
   * Returns `false` if the run is locked, out of bounds, or its panel definition (`panelSig`) has changed.
   */
  isValidActivePuzzle(ap: ActivePuzzleSave | null | undefined): boolean {
    if (!ap || !ap.protoId || !this.isProtoUnlocked(ap.protoId)) return false;
    if (ap.protoId === 'clause') {
      if (ap.clauseIdx === undefined) return true;
      const clauseDef = ALL_CLAUSES[ap.clauseIdx];
      if (!clauseDef) return false;
      if (ap.panelIdx === undefined) return false;
      const item = clauseDef.panels[ap.panelIdx];
      if (!item) return false;
      if (ap.panelSig !== undefined && panelSignature(item.panel) !== ap.panelSig) {
        return false;
      }
      return true;
    }
    const proto = getRoomProtos().find((p) => p.id === ap.protoId);
    if (!proto) return false;
    if (ap.freePlay) {
      if (!(this.solvedRuns.has(proto.id) || this.freePlayUnlocked)) return false;
      if (ap.panelSig !== undefined && panelSignature(ap.freePlay.panel) !== ap.panelSig) {
        return false;
      }
      return true;
    }
    const panels = proto.panels ?? [];
    if (ap.panelIdx === undefined || ap.panelIdx < 0 || ap.panelIdx >= panels.length) {
      return false;
    }
    const targetPanel = panels[ap.panelIdx];
    if (!targetPanel) return false;
    if (ap.panelSig !== undefined && panelSignature(targetPanel) !== ap.panelSig) {
      return false;
    }
    return true;
  }

  /** Number of this room's 5 Home Relics currently placed on its shelves (`0..5`). */
  roomRestoredRelicCount(room: RoomSpec): number {
    let count = 0;
    for (const reqId of room.homeRelics) {
      if (this.placedItems.has(reqId)) count++;
    }
    return count;
  }

  /**
   * A room is complete (mascot freed from its 5-padlock cage & Hall lamp lit)
   * when all 5 of its Home Relics have been placed on its shelves.
   */
  isRoomComplete(room: RoomSpec): boolean {
    return this.roomRestoredRelicCount(room) >= room.homeRelics.length;
  }

  completedRoomCount(): number {
    return ROOM_SPECS.filter((r) => this.isRoomComplete(r)).length;
  }

  /**
   * Return a room's display title & subtitle based on whether it is still an
   * acquired XMAS365 subsidiary or has been restored (`SCRIPT.md`).
   */
  getRoomSignage(room: RoomSpec): { title: string; subtitle: string; isAcquired: boolean } {
    const s = ROOM_SCRIPT[room.id];
    if (this.isRoomComplete(room)) {
      return {
        title: s.restoredTitle,
        subtitle: `${room.shortTitle} · Restored`,
        isAcquired: false,
      };
    }
    return {
      title: s.acquiredTitle,
      subtitle: s.acquiredSubtitle,
      isAcquired: true,
    };
  }

  /**
   * Whether a room is unlocked: Thanksgiving starts open; other rooms unlock once at least
   * one of their 5 home relics is placed (or if the room's Intro Run was already beaten).
   */
  isRoomUnlocked(room: RoomSpec): boolean {
    if (room.id === 'thanksgiving' || this.freePlayUnlocked) return true;
    if (this.solvedRuns.has(room.warmup.id)) return true;
    return room.homeRelics.some((id) => this.placedItems.has(id));
  }

  /**
   * If the player is currently carrying one of this room's 5 home relics (unplaced), return it.
   */
  carriedEligibleItemForRoom(room: RoomSpec): StraySpec | null {
    for (const reqId of room.homeRelics) {
      const item = STRAY_ITEMS[reqId];
      if (this.solvedRuns.has(item.proto.id) && !this.placedItems.has(reqId)) {
        return item;
      }
    }
    return null;
  }

  /** Rung 2 (Home Twist Run) unlocks immediately after beating the room's Intro Run. */
  isHomeTwistUnlocked(room: RoomSpec): boolean {
    return this.solvedRuns.has(room.warmup.id) || this.freePlayUnlocked;
  }

  /** Rung 3 (all 5 Relic Runs in the room) unlocks as soon as the room's Home Twist Run is beaten. */
  isStrayUnlocked(room: RoomSpec): boolean {
    return this.solvedRuns.has(room.homeTwist.proto.id) || this.freePlayUnlocked;
  }

  /** Relics whose Relic Run has been beaten, but not yet placed on their home shelf. */
  carriedItems(): StraySpec[] {
    return Object.values(STRAY_ITEMS).filter(
      (item) => this.solvedRuns.has(item.proto.id) && !this.placedItems.has(item.id),
    );
  }

  /**
   * Current narrative act (`SCRIPT.md`):
   * - Act 1: Thanksgiving guided opening (0 rooms complete)
   * - Act 2: The Open House (1–5 rooms complete)
   * - Act 3: The Merger Contract in Holiday Hall (all 6 rooms complete)
   * - Act 4: Leap Day's Party & Xmas12 (Merger Contract beaten)
   */
  act(): 1 | 2 | 3 | 4 {
    if (this.solvedRuns.has('clause')) return 4;
    const lamps = this.completedRoomCount();
    if (lamps >= 6) return 3;
    if (lamps >= 1) return 2;
    return 1;
  }
}

export const gameState = new GameState();

const COMPACT_RULE_PILLS: Record<string, string> = {
  // Halloween (Web)
  cobwebs: '🕸️ Drag between knots to spin threads',
  web: '🎃 ? knots take any thread count',
  chocolates: '💌 Same letter = same thread count',
  starlights: '❄️ Mirror joins across the icy line',
  chick: '🥚 Reach numbered eggs in step order',
  picnic: '🎆 Red and blue knots alternate along threads',
  gravyboat: '🦃 Threads cannot cross a thick fence line',
  // Thanksgiving (Carving)
  breadboard: '🦃 Drag rectangles matching each number’s area',
  feast: '🦃 No portion may cross a fence',
  hotdog: '🎆 Same-color portions never touch',
  stocking: '❄️ Mirror cuts inside the frosty frame',
  locket: '💌 Same letter = same portion area',
  jellybeans: '🥚 Each portion holds one of each treat',
  candycorn: '🎃 ? clue = portion of any area',
  // Christmas (Lights)
  fairylights: '🎄 Tap tiles to rotate and light all bulbs',
  tree: '❄️ Mirrored tiles inside the frame turn together',
  goldenegg: '🥚 Reach each egg on its step count',
  pumpkinpie: '🥧 One wire from the plug per slice',
  loveletter: '💌 Same letters sit at equal wire steps',
  icepop: '🎆 Same-color bulbs cannot connect directly',
  cauldron: '🎃 Dark tiles hide their wire shape until lit',
  // Valentine's (Heartstrings)
  lovenotes: '💌 Drag through letters to find theme words',
  mailbox: '💌 Numbered tiles share coded letters',
  jack: '🎃 ? hides letters until found',
  basket: '🥚 Egg number = letter’s place in word',
  watermelon: '🎆 Red and blue tiles alternate along words',
  wishbone: '🦃 Words cannot cross a thick fence line',
  candycane: '❄️ Word paths mirror across the icy line',
  // Easter (Hops)
  hutch: '🐰 Drag from the bunny to visit every square',
  eggtree: '🕳️ Hop underground between matching burrows',
  flag: '🎆 Match bunny colors; white is shared',
  cornucopia: '🌽 Finish each fenced course before the next',
  rose: '💌 Visit matching letters at equal hop counts',
  ghost: '🎃 Glide straight across dark tiles',
  gingerbread: '❄️ Hop path mirrors inside the frosty frame',
  // Fourth of July (Fireworks)
  sparklers: '🎆 Fill runs of squares matching line numbers',
  finale: '🎆 Same-color runs need a gap; different colors can touch',
  bow: '💌 Same letter = same run length',
  broom: '🎃 ? = run of any non-zero length',
  chocobunny: '🥚 Numbered eggs mark exact filled cells',
  harvestcorn: '🌽 Each fenced portion holds its shown count',
  snowglobe: '❄️ Filled cells mirror across the icy line',
  // Merger Contract Finale
  clause: '🎉 Void all 6 clauses of Santa’s Merger Contract',
};

/** Return a concise 4–8 word micro-tip pill for a puzzle run. */
export function getCompactRulePill(proto: Proto): string {
  const short = COMPACT_RULE_PILLS[proto.id];
  if (short) return short;
  const m = proto.rules.match(
    /\((Twist:[^)]+|Rules:[^)]+|Color:[^)]+|Burrows:[^)]+|A spangram[^)]+)\)/,
  );
  if (m?.[1]) return m[1];
  return proto.from;
}

/**
 * Return the canonical Dual Display (`themedName`, `holidayFormula`, `dualLabel`)
 * for a Room Run (`Intro Run`, `Home Twist Run`, or `Relic Run`).
 */
export function getRunIdentity(protoId: string): PuzzleIdentity | null {
  for (const room of ROOM_SPECS) {
    if (room.warmup.id === protoId) {
      return formatPuzzleIdentity(room.id, []);
    }
    if (room.homeTwist.proto.id === protoId) {
      return formatPuzzleIdentity(room.id, [room.id]);
    }
  }
  for (const stray of Object.values(STRAY_ITEMS)) {
    if (stray.proto.id === protoId) {
      return formatPuzzleIdentity(stray.foundIn, [stray.homeRoom]);
    }
  }
  return null;
}

export interface RunFreePlaySpec {
  genre: ClauseGenre;
  twists: readonly string[];
}

/**
 * Return the generator `(genre, twists)` spec for Free Play on a beaten Room Run.
 */
export function getRunFreePlaySpec(protoId: string): RunFreePlaySpec | null {
  for (const room of ROOM_SPECS) {
    const genre = HOLIDAY_TERMS[room.id].genre;
    if (room.warmup.id === protoId) {
      return { genre, twists: [] };
    }
    if (room.homeTwist.proto.id === protoId) {
      return { genre, twists: [getGenreTwistKey(genre, room.id)] };
    }
  }
  for (const stray of Object.values(STRAY_ITEMS)) {
    if (stray.proto.id === protoId) {
      const genre = HOLIDAY_TERMS[stray.foundIn].genre;
      return { genre, twists: [getGenreTwistKey(genre, stray.homeRoom)] };
    }
  }
  return null;
}
