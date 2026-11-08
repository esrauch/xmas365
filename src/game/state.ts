/**
 * Shared meta-game state, room/stray/centerpiece registry, and story beat /
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
import type { Proto } from '../proto/kit';
import { fairylights, goldenegg, pumpkinpie, tree } from '../proto/puzzles/christmas';
import { cornucopia, eggtree, flag, hutch } from '../proto/puzzles/easter';
import { bow, broom, finale, sparklers } from '../proto/puzzles/fourth';
import { chocolates, cobwebs, starlights, web } from '../proto/puzzles/halloween';
import { breadboard, feast, hotdog, stocking } from '../proto/puzzles/thanksgiving';
import { clause } from '../proto/puzzles/clause';
import {
  CLAUSE_GENRES,
  CLAUSE_PANEL_COUNT,
  type ClauseGenre,
} from '../proto/puzzles/clauses/types';
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

export const FINALE_PROTO = clause;

export const SAVE_KEY = 'puzz.save';
export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  /** Solved panel keys (`<protoId>:<idx>` for room runs, `clause:<genre>:<idx>` for Merger Contract clauses). */
  solvedPanels: string[];
  /** Placed stray item IDs on their home pedestals (`chocolates`, `starlights`, etc.). */
  placedItems: StrayId[];
  /** Seen story beat IDs (`P0`, `P1`, `T1`, `C1.torn`, etc.). */
  milestones: string[];
  /** Story beats queued for the next return to Holiday Hall (`E1`..`E6`). */
  hallPendingBeats: BeatId[];
  /** Name of the first holiday room completed (`{holiday}` interpolation in `E1`). */
  firstRevertedHoliday: string;
  /** Whether Free Play / Custom Twist Mixer is explicitly unlocked. */
  freePlayUnlocked: boolean;
}

function getRoomProtos(): Proto[] {
  const out: Proto[] = [];
  for (const r of ROOM_SPECS) {
    for (const p of [r.warmup, r.strays[0]?.proto, r.strays[1]?.proto, r.centerpiece?.proto] as (
      Proto | undefined
    )[]) {
      if (p) out.push(p);
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

function readLegacyArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export class GameState {
  readonly solvedRuns = new Set<string>();
  readonly solvedPanels = new Set<string>();
  readonly placedItems = new Set<string>();
  readonly milestones = new Set<string>();
  readonly pinnedMemos = new Set<MemoId>(['P1']);
  readonly hallPendingBeats = new Set<BeatId>();
  readonly beatQueue: BeatId[] = [];
  firstRevertedHoliday = 'Thanksgiving';
  freePlayUnlocked = false;

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

  /** Total panel count for a room run (`proto.panelCount ?? 1`), or `174` for `'clause'`. */
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
    // Expand any legacy `clause:<0..5>` keys into their 29 panel keys
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
    const completedRooms = ROOM_SPECS.filter(
      (r) => r.centerpiece?.proto && this.solvedRuns.has(r.centerpiece.proto.id),
    ).length;
    for (let k = 1; k <= ROOM_SPECS.length; k++) {
      const escId = `E${k}` as MemoId;
      if (k <= completedRooms || this.milestones.has(escId)) {
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
    return {
      version: SAVE_VERSION,
      solvedPanels: [...this.solvedPanels].sort(),
      placedItems: [...this.placedItems].filter((id): id is StrayId => id in STRAY_ITEMS).sort(),
      milestones: [...this.milestones].sort(),
      hallPendingBeats: [...this.hallPendingBeats],
      firstRevertedHoliday: this.firstRevertedHoliday,
      freePlayUnlocked: this.freePlayUnlocked,
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

  /** Load save state from `localStorage['puzz.save']`, migrating legacy keys if needed. */
  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const res = this.applySaveObject(JSON.parse(raw) as unknown, false);
        if (res.ok) return;
      }
    } catch {
      // Fall through to legacy migration or fresh state
    }

    // Check for legacy multi-key save data and migrate cleanly
    const legacyPanels = readLegacyArray(LEGACY_KEYS.solvedPanels);
    const legacyRuns = readLegacyArray(LEGACY_KEYS.solvedRuns);
    const legacyPlaced = readLegacyArray(LEGACY_KEYS.placedItems);
    const legacyMilestones = readLegacyArray(LEGACY_KEYS.milestones);
    const legacyPending = readLegacyArray(LEGACY_KEYS.hallPending);
    let legacyFirstHoliday = 'Thanksgiving';
    let legacyFreePlay = false;
    try {
      legacyFirstHoliday = localStorage.getItem(LEGACY_KEYS.firstHoliday) ?? 'Thanksgiving';
      legacyFreePlay = localStorage.getItem(LEGACY_KEYS.freePlay) === '1';
    } catch {
      // Ignore
    }

    for (const k of legacyPanels) this.solvedPanels.add(k);
    for (const runId of legacyRuns) this.fillRunPanels(runId, true);
    for (const itemId of legacyPlaced) {
      if (itemId in STRAY_ITEMS) this.placedItems.add(itemId);
    }
    for (const m of legacyMilestones) this.milestones.add(m);
    for (const b of legacyPending) this.hallPendingBeats.add(b as BeatId);
    this.firstRevertedHoliday = legacyFirstHoliday;
    this.freePlayUnlocked = legacyFreePlay;

    this.recomputeDerived();
    if (
      legacyPanels.length > 0 ||
      legacyRuns.length > 0 ||
      legacyPlaced.length > 0 ||
      legacyMilestones.length > 0 ||
      legacyFreePlay
    ) {
      this.save();
      try {
        for (const k of Object.values(LEGACY_KEYS)) localStorage.removeItem(k);
      } catch {
        // Ignore
      }
    }
  }

  private applySaveObject(
    parsed: unknown,
    persistAndNotify: boolean,
  ): { ok: true } | { ok: false; error: string } {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Save data must be a JSON object.' };
    }
    const obj = parsed as Partial<SaveData> & { solvedRuns?: unknown };
    if (obj.solvedPanels !== undefined && !Array.isArray(obj.solvedPanels)) {
      return { ok: false, error: '"solvedPanels" must be an array of strings.' };
    }
    if (obj.placedItems !== undefined && !Array.isArray(obj.placedItems)) {
      return { ok: false, error: '"placedItems" must be an array of item IDs.' };
    }

    this.solvedPanels.clear();
    this.placedItems.clear();
    this.milestones.clear();
    this.hallPendingBeats.clear();
    this.beatQueue.length = 0;

    if (Array.isArray(obj.solvedPanels)) {
      for (const k of obj.solvedPanels) {
        if (typeof k === 'string') this.solvedPanels.add(k);
      }
    }
    if (Array.isArray(obj.solvedRuns)) {
      for (const runId of obj.solvedRuns) {
        if (typeof runId === 'string') this.fillRunPanels(runId, true);
      }
    }
    if (Array.isArray(obj.placedItems)) {
      for (const id of obj.placedItems) {
        if (typeof id === 'string' && id in STRAY_ITEMS) {
          this.placedItems.add(id);
          // Placed items imply their stray run was solved
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
    this.firstRevertedHoliday =
      typeof obj.firstRevertedHoliday === 'string' && obj.firstRevertedHoliday.trim()
        ? obj.firstRevertedHoliday
        : 'Thanksgiving';
    this.freePlayUnlocked = Boolean(obj.freePlayUnlocked);

    this.recomputeDerived();
    if (this.solvedRuns.has('clause')) {
      this.freePlayUnlocked = true;
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
      this.beatQueue.push(id);
      this.notify();
    }
  }

  /** Whether the player has any existing save progress (so "Tap to start" goes straight to the hall). */
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
   *   on a sticky note) comes with beating its warm-up: see `markRunSolved`.
   */
  onEnterBay(bay: 'hall' | RoomId): void {
    if (bay === 'hall') {
      this.enqueueBeat('P1');
      this.enqueueBeat('P2');
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
    const wasAlreadySolved = this.solvedRuns.has(protoId);
    this.fillRunPanels(protoId, true);
    this.recomputeDerived();

    if (!wasAlreadySolved) {
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
        }
        if (count >= 1 && count <= ROOM_SPECS.length) {
          const escId = `E${count}` as MemoId;
          this.pinMemo(escId);
          this.hallPendingBeats.add(escId);
        }
      }

      // 4. Merger contract solved -> loophole & Santa confrontation (`C6.torn`), party (`Y1`, `Y2`, `Y4`), and `Y7` memo
      if (protoId === 'clause') {
        this.freePlayUnlocked = true;
        this.enqueueBeat('C6.torn');
        this.enqueueBeat('Y1');
        this.enqueueBeat('Y2');
        this.enqueueBeat('Y4');
        this.enqueueBeat('Y7');
      }
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
      const cpRoom = ROOM_SPECS.find((r) => r.centerpiece.proto.id === protoId);
      if (cpRoom && this.completedRoomCount() === 0) {
        this.firstRevertedHoliday = cpRoom.shortTitle;
      }
    } else {
      // Clear associated story milestones so unchecked runs unpin their memos and can replay beats
      const warmupRoom = ROOM_SPECS.find((r) => r.warmup.id === protoId);
      if (warmupRoom) {
        this.milestones.delete(ROOM_SCRIPT[warmupRoom.id].enterMemoId);
      }
      const cpRoom = ROOM_SPECS.find((r) => r.centerpiece.proto.id === protoId);
      if (cpRoom) {
        this.milestones.delete(ROOM_SCRIPT[cpRoom.id].freedBeatId);
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
      if (!anyStraySolved) this.milestones.delete('T1');
      const count = this.completedRoomCount();
      for (let k = count + 1; k <= ROOM_SPECS.length; k++) {
        const escId = `E${k}` as MemoId;
        this.milestones.delete(escId);
        this.hallPendingBeats.delete(escId);
      }
      this.recomputeDerived();
    }
    this.save();
    this.notify();
  }

  /** Whether a specific panel (`0..28`) within a Merger Contract clause has been solved. */
  isClausePanelSolved(genre: ClauseGenre | string, panelIdx: number): boolean {
    if (this.solvedRuns.has('clause')) return true;
    return this.solvedPanels.has(`clause:${genre}:${panelIdx}`);
  }

  /** Number of solved panels (`0..29`) within a Merger Contract clause. */
  clauseSolvedPanelCount(genre: ClauseGenre | string): number {
    if (this.solvedRuns.has('clause')) return CLAUSE_PANEL_COUNT;
    let count = 0;
    for (let i = 0; i < CLAUSE_PANEL_COUNT; i++) {
      if (this.solvedPanels.has(`clause:${genre}:${i}`)) count++;
    }
    return count;
  }

  /**
   * Mark a specific panel (`0..28`) in a Merger Contract clause as solved.
   * Automatically voids the clause if all 29 panels in that clause are now solved.
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
      this.placedItems.add(itemId);
      const stray = STRAY_ITEMS[itemId as StrayId];
      if (stray) {
        this.fillRunPanels(stray.proto.id, true);
      }
      this.recomputeDerived();
      this.save();

      // First item ever restored -> `T3` Leap Day line
      this.enqueueBeat('T3');

      this.notify();
    }
  }

  setItemPlaced(itemId: string, placed: boolean): void {
    if (placed) {
      this.placedItems.add(itemId);
      const stray = STRAY_ITEMS[itemId as StrayId];
      if (stray) {
        this.fillRunPanels(stray.proto.id, true);
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
      this.recomputeDerived();
      this.save();
      this.notify();
    }
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
    this.firstRevertedHoliday = 'Thanksgiving';
    this.freePlayUnlocked = false;
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
    if (this.solvedRuns.has('clause')) return 4;
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
