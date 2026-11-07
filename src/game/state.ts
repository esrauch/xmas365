/**
 * Shared meta-game state, room/stray/centerpiece registry, and act-based
 * villain commentary (Act I: The Shadow -> Act II: Ordinary Tuesday ->
 * Act III: Santa's Hostile Merger -> Act IV: Tuesday's Party).
 */
import type { Proto } from '../proto/kit';
import { fairylights, goldenegg, pumpkinpie, tree } from '../proto/puzzles/christmas';
import { cornucopia, eggtree, flag, hutch } from '../proto/puzzles/easter';
import { bow, broom, finale, sparklers } from '../proto/puzzles/fourth';
import { chocolates, cobwebs, starlights, web } from '../proto/puzzles/halloween';
import { breadboard, feast, hotdog, stocking } from '../proto/puzzles/thanksgiving';
import { tuesday } from '../proto/puzzles/tuesday';
import { basket, jack, lovenotes, mailbox } from '../proto/puzzles/valentines';

export type RoomId =
  'halloween' | 'thanksgiving' | 'christmas' | 'valentines' | 'easter' | 'fourth';

export type StrayId =
  | 'chocolates'
  | 'starlights'
  | 'hotdog'
  | 'stocking'
  | 'goldenegg'
  | 'pumpkinpie'
  | 'jack'
  | 'basket'
  | 'flag'
  | 'cornucopia'
  | 'bow'
  | 'broom';

export interface StraySpec {
  id: StrayId;
  title: string;
  icon: string;
  twistLabel: string;
  foundIn: RoomId;
  homeRoom: RoomId;
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
  warmup: Proto;
  strays: [StraySpec, StraySpec];
  centerpiece: {
    id: string;
    title: string;
    icon: string;
    twistLabel: string;
    requiredItems: [StrayId, StrayId];
    proto: Proto;
  };
}

export const STRAY_ITEMS: Record<StrayId, StraySpec> = {
  // Found in Halloween
  chocolates: {
    id: 'chocolates',
    title: 'Box of Chocolates',
    icon: '🍫',
    twistLabel: "Valentine's Love Letters: same letter = same thread count",
    foundIn: 'halloween',
    homeRoom: 'valentines',
    proto: chocolates,
  },
  starlights: {
    id: 'starlights',
    title: 'Tree-Top Star',
    icon: '⭐',
    twistLabel: 'Christmas Snowflakes: joins mirror across the icy line',
    foundIn: 'halloween',
    homeRoom: 'christmas',
    proto: starlights,
  },
  // Found in Thanksgiving
  hotdog: {
    id: 'hotdog',
    title: 'The Hot Dog',
    icon: '🌭',
    twistLabel: 'Fourth of July Colors: same-color portions never share an edge',
    foundIn: 'thanksgiving',
    homeRoom: 'fourth',
    proto: hotdog,
  },
  stocking: {
    id: 'stocking',
    title: 'The Stocking',
    icon: '🧦',
    twistLabel: 'Christmas Snowflakes: cuts mirror inside the frosty frame',
    foundIn: 'thanksgiving',
    homeRoom: 'christmas',
    proto: stocking,
  },
  // Found in Christmas
  goldenegg: {
    id: 'goldenegg',
    title: 'The Golden Egg',
    icon: '🥚',
    twistLabel: 'Easter Egg Hunt: reach each numbered egg in that many wire steps',
    foundIn: 'christmas',
    homeRoom: 'easter',
    proto: goldenegg,
  },
  pumpkinpie: {
    id: 'pumpkinpie',
    title: 'The Pumpkin Pie',
    icon: '🥧',
    twistLabel: 'Thanksgiving Portions: each slice gets one wire from the plug',
    foundIn: 'christmas',
    homeRoom: 'thanksgiving',
    proto: pumpkinpie,
  },
  // Found in Valentine's
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
    twistLabel: 'Easter Egg Hunt: an egg shows a letter’s position in its word',
    foundIn: 'valentines',
    homeRoom: 'easter',
    proto: basket,
  },
  // Found in Easter
  flag: {
    id: 'flag',
    title: 'Star-Spangled Flag',
    icon: '🇺🇸',
    twistLabel:
      'Fourth of July Colors: red and blue bunnies hop over their own color (white is shared)',
    foundIn: 'easter',
    homeRoom: 'fourth',
    proto: flag,
  },
  cornucopia: {
    id: 'cornucopia',
    title: 'The Cornucopia',
    icon: '🌽',
    twistLabel: 'Thanksgiving Portions: finish each outlined course before the next',
    foundIn: 'easter',
    homeRoom: 'thanksgiving',
    proto: cornucopia,
  },
  // Found in Fourth of July
  bow: {
    id: 'bow',
    title: "Cupid's Bow",
    icon: '🏹',
    twistLabel: "Valentine's Love Letters: letter clues share equal run lengths",
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
};

export const ROOM_SPECS: readonly [RoomSpec, RoomSpec, RoomSpec, RoomSpec, RoomSpec, RoomSpec] = [
  {
    id: 'halloween',
    title: 'Halloween Porch',
    shortTitle: 'Halloween',
    icon: '🎃',
    genreLabel: 'Spiderweb',
    accent: '#805ad5',
    secondaryAccent: '#ff7b29',
    wallColor: '#634887',
    floorColor: '#8c5a3c',
    warmup: cobwebs,
    strays: [STRAY_ITEMS.chocolates, STRAY_ITEMS.starlights],
    centerpiece: {
      id: 'web',
      title: "The Spider's Web",
      icon: '🕸️',
      twistLabel: 'Halloween Spooky: dark knots (?) may take any thread count',
      requiredItems: ['jack', 'broom'],
      proto: web,
    },
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
    strays: [STRAY_ITEMS.hotdog, STRAY_ITEMS.stocking],
    centerpiece: {
      id: 'feast',
      title: 'The Feast',
      icon: '🦃',
      twistLabel: 'Thanksgiving Portions: no rectangle may cross a thick fence line',
      requiredItems: ['pumpkinpie', 'cornucopia'],
      proto: feast,
    },
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
    strays: [STRAY_ITEMS.goldenegg, STRAY_ITEMS.pumpkinpie],
    centerpiece: {
      id: 'tree',
      title: 'The Christmas Tree',
      icon: '🎄',
      twistLabel: 'Christmas Snowflakes: wires inside the frosty frame mirror across the axis',
      requiredItems: ['starlights', 'stocking'],
      proto: tree,
    },
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
    strays: [STRAY_ITEMS.jack, STRAY_ITEMS.basket],
    centerpiece: {
      id: 'mailbox',
      title: 'The Valentine Mailbox',
      icon: '📮',
      twistLabel: "Valentine's Love Letters: numbered squares share coded letters",
      requiredItems: ['chocolates', 'bow'],
      proto: mailbox,
    },
  },
  {
    id: 'easter',
    title: 'Easter Garden',
    shortTitle: 'Easter',
    icon: '🐰',
    genreLabel: 'Bunny Hops',
    accent: '#ecc94b',
    secondaryAccent: '#f687b3',
    wallColor: '#fefcbf',
    floorColor: '#b7791f',
    warmup: hutch,
    strays: [STRAY_ITEMS.flag, STRAY_ITEMS.cornucopia],
    centerpiece: {
      id: 'eggtree',
      title: 'The Egg Tree',
      icon: '🌳',
      twistLabel:
        'Easter Burrows: hop underground between matching burrows to reach the Golden Egg',
      requiredItems: ['goldenegg', 'basket'],
      proto: eggtree,
    },
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
    strays: [STRAY_ITEMS.bow, STRAY_ITEMS.broom],
    centerpiece: {
      id: 'finale',
      title: 'The Grand Finale',
      icon: '🎆',
      twistLabel: 'Fourth of July Colors: red and blue runs can touch without a gap',
      requiredItems: ['hotdog', 'flag'],
      proto: finale,
    },
  },
];

export const FINALE_PROTO = tuesday;

const SOLVED_RUNS_KEY = 'puzz.proto.solved';
const PLACED_ITEMS_KEY = 'puzz.meta.placed';
const MILESTONES_KEY = 'puzz.meta.milestones';
const FREEPLAY_KEY = 'puzz.meta.freeplay';

function readSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export class GameState {
  readonly solvedRuns = readSet(SOLVED_RUNS_KEY);
  readonly placedItems = readSet(PLACED_ITEMS_KEY);
  readonly milestones = readSet(MILESTONES_KEY);
  freePlayUnlocked = ((): boolean => {
    try {
      return localStorage.getItem(FREEPLAY_KEY) === '1';
    } catch {
      return false;
    }
  })();

  constructor() {
    // Backfill solvedRuns from per-panel progress if a run's final panel was already beaten
    const solvedPanels = readSet('puzz.proto.panels');
    for (const room of ROOM_SPECS) {
      for (const proto of [
        room.warmup,
        room.strays[0].proto,
        room.strays[1].proto,
        room.centerpiece.proto,
      ]) {
        if ([...solvedPanels].some((k) => k.startsWith(`${proto.id}:`))) {
          // Check if the highest-indexed panel (index >= 4 for centerpiece/warmup, >= 2 for strays) is solved
          const minLast = proto.kind === 'stray' ? 2 : 4;
          for (let i = minLast; i <= 8; i++) {
            if (solvedPanels.has(`${proto.id}:${i}`)) {
              this.solvedRuns.add(proto.id);
            }
          }
        }
      }
    }
  }

  private listeners = new Set<() => void>();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(): void {
    for (const fn of this.listeners) fn();
  }

  markRunSolved(protoId: string): void {
    if (!this.solvedRuns.has(protoId)) {
      this.solvedRuns.add(protoId);
      writeSet(SOLVED_RUNS_KEY, this.solvedRuns);
      if (protoId === 'tuesday') this.setFreePlay(true);
      this.notify();
    }
  }

  setRunSolved(protoId: string, solved: boolean): void {
    if (solved) {
      this.markRunSolved(protoId);
      return;
    }
    const hadRun = this.solvedRuns.delete(protoId);
    writeSet(SOLVED_RUNS_KEY, this.solvedRuns);
    const panels = readSet('puzz.proto.panels');
    let panelChanged = false;
    for (const k of [...panels]) {
      if (k.startsWith(`${protoId}:`)) {
        panels.delete(k);
        panelChanged = true;
      }
    }
    if (panelChanged) writeSet('puzz.proto.panels', panels);
    if (hadRun || panelChanged) this.notify();
  }

  placeItem(itemId: string): void {
    if (!this.placedItems.has(itemId)) {
      this.placedItems.add(itemId);
      writeSet(PLACED_ITEMS_KEY, this.placedItems);
      this.notify();
    }
  }

  setItemPlaced(itemId: string, placed: boolean): void {
    if (placed) {
      const stray = STRAY_ITEMS[itemId as StrayId];
      if (stray && !this.solvedRuns.has(stray.proto.id)) {
        this.solvedRuns.add(stray.proto.id);
        writeSet(SOLVED_RUNS_KEY, this.solvedRuns);
      }
      this.placeItem(itemId);
      return;
    }
    if (this.placedItems.delete(itemId)) {
      writeSet(PLACED_ITEMS_KEY, this.placedItems);
      this.notify();
    }
  }

  resetAll(): void {
    this.solvedRuns.clear();
    this.placedItems.clear();
    this.milestones.clear();
    this.freePlayUnlocked = false;
    writeSet(SOLVED_RUNS_KEY, this.solvedRuns);
    writeSet(PLACED_ITEMS_KEY, this.placedItems);
    writeSet(MILESTONES_KEY, this.milestones);
    try {
      localStorage.removeItem(FREEPLAY_KEY);
      localStorage.removeItem('puzz.proto.panels');
    } catch {
      // Ignore storage errors
    }
    this.notify();
  }

  markMilestone(id: string): void {
    if (!this.milestones.has(id)) {
      this.milestones.add(id);
      writeSet(MILESTONES_KEY, this.milestones);
      this.notify();
    }
  }

  setFreePlay(on: boolean): void {
    this.freePlayUnlocked = on;
    try {
      localStorage.setItem(FREEPLAY_KEY, on ? '1' : '0');
    } catch {
      // Ignore
    }
    this.notify();
  }

  isRoomComplete(room: RoomSpec): boolean {
    return this.solvedRuns.has(room.centerpiece.proto.id);
  }

  completedRoomCount(): number {
    return ROOM_SPECS.filter((r) => this.isRoomComplete(r)).length;
  }

  /**
   * Whether a room is unlocked: Thanksgiving starts open; other rooms unlock once at least
   * one of their two home items is restored (or if the room's warm-up was already beaten).
   */
  isRoomUnlocked(room: RoomSpec): boolean {
    if (room.id === 'thanksgiving' || this.freePlayUnlocked) return true;
    if (this.solvedRuns.has(room.warmup.id)) return true;
    return room.centerpiece.requiredItems.some((id) => this.placedItems.has(id));
  }

  /**
   * If the player is currently carrying one of this room's two home items (unplaced), return it.
   */
  carriedEligibleItemForRoom(room: RoomSpec): StraySpec | null {
    for (const reqId of room.centerpiece.requiredItems) {
      const item = STRAY_ITEMS[reqId];
      if (this.solvedRuns.has(item.proto.id) && !this.placedItems.has(reqId)) {
        return item;
      }
    }
    return null;
  }

  isStrayUnlocked(room: RoomSpec): boolean {
    return this.solvedRuns.has(room.warmup.id);
  }

  isCenterpieceUnlocked(room: RoomSpec): boolean {
    return room.centerpiece.requiredItems.every((id) => this.placedItems.has(id));
  }

  /** Whether a room's puzzle type (Warm-up + Standard no-twist) is unlocked at the Calendar Desk. */
  isDeskGenreUnlocked(room: RoomSpec): boolean {
    return this.solvedRuns.has(room.warmup.id) || this.freePlayUnlocked;
  }

  /** Whether all holiday twists for a room's puzzle type are unlocked at the Calendar Desk. */
  isDeskTwistsUnlocked(room: RoomSpec): boolean {
    return this.solvedRuns.has(room.centerpiece.proto.id) || this.freePlayUnlocked;
  }

  unlockedDeskGenreCount(): number {
    return ROOM_SPECS.filter((r) => this.isDeskGenreUnlocked(r)).length;
  }

  /** Items whose stray puzzle has been beaten, but not yet placed on their home pedestal. */
  carriedItems(): StraySpec[] {
    return Object.values(STRAY_ITEMS).filter(
      (item) => this.solvedRuns.has(item.proto.id) && !this.placedItems.has(item.id),
    );
  }

  /**
   * Current narrative act:
   * - Act 1: The Shadowy Culprit (0–2 rooms complete)
   * - Act 2: Ordinary Tuesday Unmasked (3–5 rooms complete)
   * - Act 3: Santa's Hostile Merger (all 6 rooms complete, Finale open)
   * - Act 4: Tuesday's Party (Finale beaten)
   */
  act(): 1 | 2 | 3 | 4 {
    if (this.solvedRuns.has('tuesday')) return 4;
    const lamps = this.completedRoomCount();
    if (lamps >= 6) return 3;
    if (lamps >= 3) return 2;
    return 1;
  }
}

export const gameState = new GameState();

export interface VillainNote {
  sender: string;
  badge: string;
  bg: string;
  border: string;
  textColor: string;
  text: string;
}

const SHADOW_NOTES: Record<string, string> = {
  cobwebs: 'Spin my threads if you dare—every holiday is tangled in my lair!',
  chocolates: 'I dipped Valentine’s sweets in midnight silk. Good luck reading their numbers!',
  starlights: 'A frozen star caught in a spider’s web—no light escapes my shadow!',
  web: 'Even my own lantern hides knots in the dark. You will never mend this web!',
  breadboard: 'Carve the board as you please; the feast will never be served!',
  hotdog: 'A backyard cookout on the Thanksgiving table? Chaos is my finest dish!',
  stocking: 'I froze a Christmas stocking right into the carving board!',
  feast: 'Fences across the table! Try serving fair portions through that!',
  fairylights: 'Twist the wires till your fingers ache—this house stays in the dark!',
  goldenegg: 'An Easter egg wired into the Christmas lights! Count your steps carefully!',
  pumpkinpie: 'Pumpkin pie on the light string! One wire per slice, or the fuse blows!',
  tree: 'Frost on the branches! Only a mirror-perfect circuit can light this tree!',
  lovenotes: 'Trace your little words—my shadows have scrambled every parlor!',
  jack: 'My Jack-o’-Lantern swallowed Valentine’s letters into the dark!',
  basket: 'Easter eggs in the love letters! Every number pins your words in place!',
  mailbox: 'I locked the mailbox in a secret cipher. No love note leaves this room!',
  hutch: 'Hop along little bunny—the garden paths are mine now!',
  flag: 'Two bunnies at a Fourth of July parade! Don’t cross their colors!',
  cornucopia: 'Thanksgiving courses across the lawn! Finish every dish in order!',
  eggtree: 'Underground burrows in the Egg Tree! You’ll lose your trail for sure!',
  sparklers: 'Paint by numbers in the dark—your fireworks are dampened!',
  bow: 'Cupid’s bow on the fireworks rack! Even the clues are written in code!',
  broom: 'My broom swept the numbers right off the firework clues!',
  finale: 'Red and blue rockets tangled together! The Grand Finale stays grounded!',
};

const TUESDAY_NOTES: Record<string, string> = {
  cobwebs: 'Okay fine, the cape was rented. But nobody ever hangs cobwebs for Ordinary Tuesday!',
  chocolates: 'Do you know how sticky it was wedging a box of chocolates into a spiderweb?',
  starlights: 'I found this frosty star in the December closet. Wait—why did it freeze the web?',
  web: 'Honestly, I only moved the props. Somebody else wired these 9×9 logic locks...',
  breadboard: 'Tuesday night dinner is usually plain toast. Enjoy your fancy rectangles.',
  hotdog: 'A hot dog at Thanksgiving! Honestly an upgrade over dry turkey.',
  stocking: 'Whoever my “benefactor” is, they really, really like frost.',
  feast: 'I didn’t put those fences on the table! My benefactor said it was “Q4 restructuring.”',
  fairylights:
    'Why does December get six weeks of fairy lights and Tuesday gets fluorescent tubes?',
  goldenegg: 'I hid the Golden Egg in the tree branches. The step-counter lock wasn’t me!',
  pumpkinpie:
    'Pie in the Christmas hearth—see, November and December were already bleeding together!',
  tree: 'Wait... why is the Christmas Tree locked with corporate-grade permafrost?',
  lovenotes: 'Nobody ever writes “Be My Ordinary Tuesday” on a candy heart.',
  jack: 'A pumpkin in the sweetheart parlor! Spooky Season meets Valentine’s.',
  basket: 'I left the Easter basket on the sofa. The numbered eggs were already ticking.',
  mailbox: 'I checked the mailbox—half the envelopes are invoices from the North Pole?!',
  hutch: 'Bunnies get a whole Sunday. I just wanted one afternoon!',
  flag: 'I put the flags by the hutch. Two bunnies at once was actually pretty cute.',
  cornucopia: 'Three courses for Easter, meanwhile Tuesday is “leftover Tupperware night.”',
  eggtree: 'Those burrows weren’t dug by bunnies—they look like sleigh-runner tracks...',
  sparklers: 'Fireworks on a Tuesday usually just means the toaster shorted out.',
  bow: 'Cupid’s bow on the rocket rack! Admit it, that’s a great crossover.',
  broom: 'I leaned the broom against the sparklers and half the clue numbers vanished.',
  finale: 'Wait—if you light all six lamps in Holiday Hall, the big door opens. Be careful!',
};

export function getVillainNote(protoId: string, act = gameState.act()): VillainNote {
  if (protoId === 'tuesday' || act === 3) {
    return {
      sender: 'SANTA CLAUS · CEO, Q4 EVERYDAY',
      badge: '🎅 MEMO',
      bg: '#fffaf0',
      border: '#d69e2e',
      textColor: '#744210',
      text:
        protoId === 'tuesday'
          ? '“Why stop at October and November? Once my Dual-Twist Merger locks, all 365 days—even Tuesday—will be Christmas!”'
          : '“Per North Pole Directive 12/25, this room’s assets are being absorbed into Year-Round Christmas.”',
    };
  }
  if (act === 4) {
    return {
      sender: 'ORDINARY TUESDAY (GUEST OF HONOR)',
      badge: '🎉 TUESDAY',
      bg: '#fefcbf',
      border: '#d69e2e',
      textColor: '#744210',
      text: '“We beat Santa’s merger! Take your time—or come back to my desk in Holiday Hall for the Daily Calendar!”',
    };
  }
  if (act === 2) {
    return {
      sender: 'ORDINARY TUESDAY',
      badge: '☕ TUESDAY',
      bg: '#fefcbf',
      border: '#ecc94b',
      textColor: '#744210',
      text:
        TUESDAY_NOTES[protoId] ??
        '“I only mixed up the props! Somebody else wired the whole house into a logic lock!”',
    };
  }
  return {
    sender: 'THE SHADOWY FIGURE',
    badge: '🕯️ SEALED',
    bg: '#2d2438',
    border: '#9f7aea',
    textColor: '#f7fafc',
    text:
      SHADOW_NOTES[protoId] ??
      '“Every holiday is tangled in my grasp—solve my panels if you dare!”',
  };
}

const COMPACT_RULE_PILLS: Record<string, string> = {
  // Halloween (Spiderweb)
  cobwebs: '🕸️ Drag between knots to spin threads',
  chocolates: '💌 Same letter = same thread count',
  starlights: '❄️ Mirror joins across the icy line',
  web: '🎃 ? knots take any thread count',
  // Thanksgiving (Carving)
  breadboard: '🦃 Drag rectangles matching each number’s area',
  hotdog: '🎆 Same-color portions never touch',
  stocking: '❄️ Mirror cuts inside the frosty frame',
  feast: '🦃 No portion may cross a fence',
  // Christmas (Lights)
  fairylights: '🎄 Tap tiles to rotate and light all bulbs',
  goldenegg: '🥚 Reach each egg on its step count',
  pumpkinpie: '🥧 One wire from the plug per slice',
  tree: '❄️ Mirrored tiles inside the frame turn together',
  // Valentine's (Heartstrings)
  lovenotes: '💌 Drag through letters to find theme words',
  jack: '🎃 ? hides letters until found',
  basket: '🥚 Egg number = letter’s place in word',
  mailbox: '💌 Numbered tiles share coded letters',
  // Easter (Bunny Hops)
  hutch: '🐰 Drag from the bunny to visit every square',
  flag: '🎆 Match bunny colors; white is shared',
  cornucopia: '🌽 Finish each fenced course before the next',
  eggtree: '🕳️ Hop underground between matching burrows',
  // Fourth of July (Fireworks)
  sparklers: '🎆 Fill runs of squares matching line numbers',
  bow: '💌 Same letter = same run length',
  broom: '🎃 ? = run of any non-zero length',
  finale: '🎆 Same-color runs need a gap; different colors can touch',
  // Tuesday Finale
  tuesday: '🎉 Two holiday twists combined on each board',
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
