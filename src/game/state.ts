/**
 * Shared meta-game state, room/stray/centerpiece registry, and story beat /
 * corkboard progression (`SCRIPT.md`: Leap Day vs. CEO Santa's XMAS365 takeover).
 */
import {
  type BeatId,
  MEMOS,
  MEMO_ORDER,
  type MemoId,
  type MemoSpec,
  ROOM_SCRIPT,
} from '../content/script';
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
const PINNED_MEMOS_KEY = 'puzz.story.memos';
const HALL_PENDING_KEY = 'puzz.story.hallPending';
const FIRST_HOLIDAY_KEY = 'puzz.story.firstHoliday';

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
  readonly pinnedMemos = readSet(PINNED_MEMOS_KEY) as Set<MemoId>;
  readonly hallPendingBeats = readSet(HALL_PENDING_KEY) as Set<BeatId>;
  readonly beatQueue: BeatId[] = [];
  firstRevertedHoliday = ((): string => {
    try {
      return localStorage.getItem(FIRST_HOLIDAY_KEY) ?? 'Thanksgiving';
    } catch {
      return 'Thanksgiving';
    }
  })();
  freePlayUnlocked = ((): boolean => {
    try {
      return localStorage.getItem(FREEPLAY_KEY) === '1';
    } catch {
      return false;
    }
  })();

  constructor() {
    // `P1` is always pinned to the Hall Corkboard from the very start of the game (`SCRIPT.md`)
    if (!this.pinnedMemos.has('P1')) {
      this.pinnedMemos.add('P1');
      writeSet(PINNED_MEMOS_KEY, this.pinnedMemos as Set<string>);
    }

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
          // Check if the highest-indexed panel is solved
          const minLast =
            proto.kind === 'stray' || proto.id === 'mailbox' ? 2 : proto.id === 'lovenotes' ? 3 : 4;
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

  /** Pin a memo to the Hall Corkboard without necessariamente opening a modal. */
  pinMemo(id: MemoId): void {
    if (!this.pinnedMemos.has(id)) {
      this.pinnedMemos.add(id);
      writeSet(PINNED_MEMOS_KEY, this.pinnedMemos as Set<string>);
    }
  }

  /** Return all discovered XMAS365 / Xmas12 memos in canonical Corkboard order. */
  pinnedMemosInOrder(): MemoSpec[] {
    this.pinMemo('P1');
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
      this.beatQueue.push(id);
      this.notify();
    }
  }

  /** Whether the player has any existing save progress (so "Tap to start" goes straight to the hall). */
  hasSaveProgress(): boolean {
    return (
      this.milestones.has('P0') ||
      this.milestones.has('P1') ||
      this.solvedRuns.size > 0 ||
      this.placedItems.size > 0
    );
  }

  /** Mark the intro cinematic (`P0`) as completed in persistent milestones. */
  markIntroSeen(): void {
    if (!this.milestones.has('P0')) {
      this.milestones.add('P0');
      writeSet(MILESTONES_KEY, this.milestones);
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
    writeSet(MILESTONES_KEY, this.milestones);
    this.notify();
  }

  /**
   * Triggered when the player enters Holiday Hall or turns to a holiday alcove (`SCRIPT.md`).
   * - In `hall`: opens `P1` on a new game, and flushes any pending escalation memos (`E1`–`E6`).
   * - In a holiday room: nothing yet. The room's memo (`<room>.enter`, with its caged mascot's plea
   *   on a sticky note) comes with beating its warm-up: see `markRunSolved`.
   */
  onEnterBay(bay: 'hall' | RoomId): void {
    if (bay === 'hall') {
      this.enqueueBeat('P1');
      this.enqueueBeat('P2');
      if (this.hallPendingBeats.size > 0) {
        const pending = [...this.hallPendingBeats];
        this.hallPendingBeats.clear();
        writeSet(HALL_PENDING_KEY, this.hallPendingBeats as Set<string>);
        for (const beatId of pending) {
          this.enqueueBeat(beatId);
        }
      }
      return;
    }
  }

  markRunSolved(protoId: string): void {
    if (!this.solvedRuns.has(protoId)) {
      this.solvedRuns.add(protoId);
      writeSet(SOLVED_RUNS_KEY, this.solvedRuns);

      // 1. First stray ever freed -> `T1` Logistics memo
      const isStray = Object.values(STRAY_ITEMS).some((s) => s.proto.id === protoId);
      if (isStray) {
        this.enqueueBeat('T1');
      }

      // 2. A room's warm-up beaten -> that room's memo (`<room>.enter`)
      const warmupRoom = ROOM_SPECS.find((r) => r.warmup.id === protoId);
      if (warmupRoom) this.enqueueBeat(ROOM_SCRIPT[warmupRoom.id].enterMemoId);

      // 3. Room centerpiece solved -> mascot freed (`<room>.freed`) + queue escalation memo (`E1`..`E6`) for the Hall
      const cpRoom = ROOM_SPECS.find((r) => r.centerpiece.proto.id === protoId);
      if (cpRoom) {
        const script = ROOM_SCRIPT[cpRoom.id];
        this.enqueueBeat(script.freedBeatId);
        const count = this.completedRoomCount();
        if (count === 1) {
          this.firstRevertedHoliday = cpRoom.shortTitle;
          try {
            localStorage.setItem(FIRST_HOLIDAY_KEY, this.firstRevertedHoliday);
          } catch {
            // Ignore
          }
        }
        if (count >= 1 && count <= 6) {
          const escId = `E${count}` as MemoId;
          this.pinMemo(escId);
          this.hallPendingBeats.add(escId);
          writeSet(HALL_PENDING_KEY, this.hallPendingBeats as Set<string>);
        }
      }

      // 4. Merger contract solved -> loophole & Santa confrontation (`C6.torn`), party (`Y1`, `Y2`, `Y4`), and `Y7` memo
      if (protoId === 'tuesday') {
        this.setFreePlay(true);
        this.enqueueBeat('C6.torn');
        this.enqueueBeat('Y1');
        this.enqueueBeat('Y2');
        this.enqueueBeat('Y4');
        this.enqueueBeat('Y7');
      }

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

      // First item ever restored -> `T3` Leap Day line
      this.enqueueBeat('T3');

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
    this.pinnedMemos.clear();
    this.pinnedMemos.add('P1');
    this.hallPendingBeats.clear();
    this.beatQueue.length = 0;
    this.firstRevertedHoliday = 'Thanksgiving';
    this.freePlayUnlocked = false;
    writeSet(SOLVED_RUNS_KEY, this.solvedRuns);
    writeSet(PLACED_ITEMS_KEY, this.placedItems);
    writeSet(MILESTONES_KEY, this.milestones);
    writeSet(PINNED_MEMOS_KEY, this.pinnedMemos as Set<string>);
    writeSet(HALL_PENDING_KEY, this.hallPendingBeats as Set<string>);
    try {
      localStorage.removeItem(FREEPLAY_KEY);
      localStorage.removeItem(FIRST_HOLIDAY_KEY);
      localStorage.removeItem('puzz.proto.panels');
    } catch {
      // Ignore storage errors
    }
    this.enqueueBeat('P1');
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
   * Current narrative act (`SCRIPT.md`):
   * - Act 1: Thanksgiving guided opening (0 rooms complete)
   * - Act 2: The Open House (1–5 rooms complete)
   * - Act 3: The Merger Contract in Holiday Hall (all 6 rooms complete)
   * - Act 4: Leap Day's Party & Xmas12 (Merger Contract beaten)
   */
  act(): 1 | 2 | 3 | 4 {
    if (this.solvedRuns.has('tuesday')) return 4;
    const lamps = this.completedRoomCount();
    if (lamps >= 6) return 3;
    if (lamps >= 1) return 2;
    return 1;
  }
}

export const gameState = new GameState();

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
