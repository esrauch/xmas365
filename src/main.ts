/**
 * The entry point for Puzz: Holiday Hall — a single 3D cel-shaded toy-theatre
 * rotunda where the central Merger Contract & Freed Mascots' Corner bay and all six
 * Holiday Alcoves live around the perimeter of the same room.
 *
 * Rotating between holidays pans around Holiday Hall in 3D, with horizontal-FOV
 * compensation and vertically tiered alcoves tailored for mobile portrait.
 */
import * as THREE from 'three';
import {
  type BeatId,
  type DialogueLine,
  HALL_MASCOT_LINES,
  MEMOS,
  MEMO_ORDER,
  type MemoId,
  ROOM_SCRIPT,
  SPEAKERS,
  formatMemoText,
  getBeatSpec,
} from './content/script';
import { installErrorOverlay } from './dev/errorOverlay';
import {
  BAY_ORDER,
  type BayId,
  type BuiltDiorama,
  type Hotspot3D,
  bayToWorld,
  buildHolidayHallDiorama,
  getBayAngle,
  getBayLightMood,
} from './game/diorama';
import { type BuiltIntroCinematic, buildIntroCinematic } from './game/introCinematic';
import { FINALE_PROTO, ROOM_SPECS, type RoomSpec, STRAY_ITEMS, gameState } from './game/state';
import { type Proto, blip, h } from './proto/kit';
import { PROTOS } from './proto/puzzles';
import { ALL_CLAUSES, CLAUSE_PANEL_COUNT } from './proto/puzzles/clauses';
import { celUniforms } from './render/toon';
import { View } from './render/view';
import {
  isFpsEnabled,
  isShowIntroOnLoadEnabled,
  isSoundEnabled,
  setFpsEnabled,
  setShowIntroOnLoadEnabled,
  setSoundEnabled,
} from './settings';
import { buildMemoSheet, renderFormattedText, showMemoOverlay } from './ui/memo';
import { applyPaletteVars } from './ui/paletteVars';

if (import.meta.env.DEV) installErrorOverlay();

applyPaletteVars();

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const ui = document.querySelector<HTMLDivElement>('#ui');
if (!canvas || !ui) throw new Error('index.html is missing #game or #ui');

// ?outline=0 turns off the cel line art.
const params = new URLSearchParams(location.search);
const view = new View(canvas, { fov: 40, outline: params.get('outline') !== '0' });

// Scene state: all 7 bays live in one Holiday Hall diorama
let currentBay: BayId = 'hall';
let activeDiorama: BuiltDiorama | null = null;
let activeModal: 'none' | 'proto' | 'corkboard' | 'settings' | 'credits' = 'none';
let activeProtoId: string | null = null;
let activeProtoWasSolvedOnOpen = false;

// Circular camera rotation around Holiday Hall + focus targets
let camAngleTarget = getBayAngle('hall');
let camAngleCurrent = camAngleTarget;
let isCameraFocused = false;
const focusPosTarget = new THREE.Vector3();
const focusLookTarget = new THREE.Vector3();
const camPosCurrent = bayToWorld(0, 0, 2.0, 5.15);
const camLookCurrent = bayToWorld(0, 0, 1.35, 0.7);
const targetLitColor = new THREE.Color();
const targetShadeColor = new THREE.Color();
let isRenderLoopRunning = false;
let fpsFrameCount = 0;
let fpsSampleStart = performance.now();

function shortestAngleDelta(from: number, to: number): number {
  let diff = (to - from) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

// UI containers
const hotspotLayer = h('div', { class: 'hotspot-layer' });
const topBar = h('div', {
  class: 'interactive',
  style: {
    position: 'fixed',
    top: 'calc(8px + env(safe-area-inset-top))',
    left: '8px',
    right: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    zIndex: '15',
    pointerEvents: 'none',
  },
});

const sideArrowsHost = h('div', {
  style: {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '14',
  },
});

/** Speech bubble host anchored directly over Leap Day in Holiday Hall. */
const leapBubbleHost = h('div', {
  style: {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '22',
  },
});

const bottomStack = h('div', {
  style: {
    position: 'fixed',
    bottom: 'calc(10px + env(safe-area-inset-bottom))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(540px, 95%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    zIndex: '20',
    pointerEvents: 'none',
  },
});
const carryTrayHost = h('div', { style: { width: '100%' } });
const storyBannerHost = h('div', { style: { width: '100%' } });
bottomStack.append(carryTrayHost, storyBannerHost);

const modalHost = h('div', {});
/** A new memo fills the screen here (`ui/memo.ts`), above everything else. */
const memoHost = h('div', {});

/** Cold-start 3D intro cinematic overlay. */
const introHost = h('div', {
  style: {
    position: 'fixed',
    inset: '0',
    zIndex: '48',
    display: 'none',
  },
});

/** Full-screen black curtain for door-hop fade transitions. */
const fadeOverlay = h('div', {
  style: {
    position: 'fixed',
    inset: '0',
    background: '#0b0e14',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 220ms ease',
    zIndex: '50',
  },
});

const fpsBadge = h(
  'div',
  {
    style: {
      position: 'fixed',
      bottom: 'calc(10px + env(safe-area-inset-bottom))',
      left: 'calc(10px + env(safe-area-inset-left))',
      zIndex: '40',
      pointerEvents: 'none',
      padding: '4px 8px',
      borderRadius: '7px',
      background: 'rgba(20, 24, 33, 0.88)',
      color: '#68d391',
      border: '1.5px solid #2d3748',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '11.5px',
      fontWeight: '800',
      letterSpacing: '0.03em',
      display: isFpsEnabled() ? 'block' : 'none',
    },
  },
  '-- FPS',
);

ui.replaceChildren(
  hotspotLayer,
  sideArrowsHost,
  topBar,
  leapBubbleHost,
  bottomStack,
  modalHost,
  memoHost,
  introHost,
  fadeOverlay,
  fpsBadge,
);

interface ProjectedPill {
  hotspot: Hotspot3D;
  el: HTMLElement;
}
let projectedPills: ProjectedPill[] = [];

let activeDialogueStepIndex = 0;
let activeDialogueBeatId: BeatId | null = null;
/** The memo beat filling the screen, if any (so re-renders don't restart its animation). */
let shownMemoBeatId: BeatId | null = null;
let cagedPromptTimer: number | null = null;

/**
 * One-line "barks" that play like a caged mascot's plea: a speech bubble at the bottom with
 * no button, which fades away on its own. Leap Day's line on the first relic placed on a shelf
 * (T3) works this way too. (Leap Day doesn't reply to memos.)
 */
const BARK_BEATS: ReadonlySet<string> = new Set(['T3']);
const BARK_SECONDS = 5;

function isBarkBeat(beatId: BeatId | null): boolean {
  if (!beatId) return false;
  return beatId.endsWith('.caged') || BARK_BEATS.has(beatId);
}

function dismissActiveBarkBeat(): void {
  clearCagedPromptTimer();
  const activeBeat = gameState.currentBeat();
  if (activeBeat && isBarkBeat(activeBeat)) {
    gameState.dismissBeat(activeBeat);
  }
}

function clearCagedPromptTimer(): void {
  if (cagedPromptTimer !== null) {
    window.clearTimeout(cagedPromptTimer);
    cagedPromptTimer = null;
  }
}

function hideMemoOverlay(): void {
  shownMemoBeatId = null;
  memoHost.replaceChildren();
}

function positionLeapBubbleElement(bubbleWrap: HTMLElement): void {
  const w = Math.max(1, view.canvas.clientWidth);
  const hPx = Math.max(1, view.canvas.clientHeight);
  let anchorX = w * 0.5;
  let anchorY = hPx * 0.72;
  if (activeDiorama) {
    tempProj.copy(activeDiorama.leapDayHeadWorldPos).project(stableCam);
    if (tempProj.z <= 1) {
      anchorX = (tempProj.x * 0.5 + 0.5) * w;
      anchorY = (-tempProj.y * 0.5 + 0.5) * hPx;
    }
  }
  const clampedX = Math.max(175, Math.min(w - 175, anchorX));
  // Anchor the speech bubble right below Leap Day on the rug with an upward tail
  // so it points directly at Leap Day without covering any of the 6 holiday doors!
  const belowY = Math.max(200, Math.min(hPx - 115, anchorY + 72));
  bubbleWrap.style.left = `${clampedX.toFixed(1)}px`;
  bubbleWrap.style.top = `${belowY.toFixed(1)}px`;
}

function isContractOverlayBeat(beatId: BeatId | null): boolean {
  if (!beatId) return false;
  return beatId === 'C0' || beatId === 'C6.early' || /^C[1-5]\.torn$/.test(beatId);
}

function clearContractOverlayBeats(): void {
  for (let i = gameState.beatQueue.length - 1; i >= 0; i--) {
    const b = gameState.beatQueue[i];
    if (!b) continue;
    if (b === 'C0' || b === 'C6.early' || /^C[1-5]\.torn$/.test(b)) {
      gameState.beatQueue.splice(i, 1);
      gameState.markMilestone(b);
    }
  }
}

/**
 * Render the front beat from `gameState.beatQueue` into `storyBannerHost`
 * (or directly over Leap Day in `leapBubbleHost` when Leap Day speaks in Holiday Hall).
 * Per `SCRIPT.md`, beats never sit in front of an open puzzle panel, except contract
 * reaction beats (`C0`, `C1.torn`..`C5.torn`) which appear over the Merger Contract checklist.
 */
function renderActiveStoryBeat(): void {
  clearCagedPromptTimer();
  const beatId = gameState.currentBeat();
  const allowOverProtoModal =
    activeModal === 'proto' &&
    ((activeProtoId === 'clause' && isContractOverlayBeat(beatId)) ||
      (beatId !== null &&
        beatId in MEMOS &&
        activeProtoId !== null &&
        gameState.solvedRuns.has(activeProtoId)));
  if (activeModal !== 'none' && !allowOverProtoModal) {
    bottomStack.style.zIndex = '20';
    storyBannerHost.replaceChildren();
    leapBubbleHost.replaceChildren();
    hideMemoOverlay();
    return;
  }
  bottomStack.style.zIndex = allowOverProtoModal ? '45' : '20';
  if (!beatId) {
    activeDialogueBeatId = null;
    activeDialogueStepIndex = 0;
    storyBannerHost.replaceChildren();
    leapBubbleHost.replaceChildren();
    hideMemoOverlay();
    return;
  }
  if (beatId !== activeDialogueBeatId) {
    activeDialogueBeatId = beatId;
    activeDialogueStepIndex = 0;
  }

  const spec = getBeatSpec(beatId);
  if (!spec) {
    gameState.dismissBeat(beatId);
    renderActiveStoryBeat();
    return;
  }
  if (spec.kind === 'memo') {
    // A new memo fills the screen; putting it away pins it to the corkboard (already done on queueing).
    storyBannerHost.replaceChildren();
    leapBubbleHost.replaceChildren();
    if (shownMemoBeatId === beatId) return;
    shownMemoBeatId = beatId;
    const hasMore = gameState.beatQueue.length > 1;
    showMemoOverlay(
      memoHost,
      MEMOS[spec.memoId],
      gameState.firstRevertedHoliday,
      hasMore ? 'Next ▸' : 'Got it ✓',
      () => {
        blip(523, 45);
        shownMemoBeatId = null;
        gameState.dismissBeat(beatId);
        renderTopBar();
        renderActiveStoryBeat();
      },
    );
    return;
  }
  hideMemoOverlay();

  // Dialogue beat (`spec.kind === 'dialogue'`)
  const lines = spec.lines;
  const line: DialogueLine | undefined = lines[activeDialogueStepIndex] ?? lines[0];
  if (!line) {
    gameState.dismissBeat(beatId);
    renderActiveStoryBeat();
    return;
  }

  const sp = SPEAKERS[line.speaker];
  const isBark = beatId.endsWith('.caged') || BARK_BEATS.has(beatId);
  const isLastLine = activeDialogueStepIndex >= lines.length - 1;
  const hasMoreBeats = gameState.beatQueue.length > 1;
  const btnLabel = !isLastLine
    ? `Next (${activeDialogueStepIndex + 1}/${lines.length}) ▸`
    : hasMoreBeats
      ? 'Next ▸'
      : 'Got it ✓';

  const docNode =
    spec.document && activeDialogueStepIndex === 0
      ? h(
          'div',
          {
            style: {
              padding: '7px 10px',
              marginBottom: '7px',
              borderRadius: '8px',
              background: '#fffaf0',
              border: '1.5px solid #d69e2e',
              color: '#744210',
              fontSize: '11px',
              lineHeight: '1.35',
            },
          },
          h('div', { style: { fontWeight: '900', letterSpacing: '0.04em' } }, spec.document.title),
          h('div', {}, spec.document.subtitle),
          h('div', { style: { fontWeight: '700' } }, `Term: ${spec.document.term}`),
        )
      : null;

  const advanceDialogue = (): void => {
    blip(523, 45);
    if (!isLastLine) {
      activeDialogueStepIndex++;
      renderActiveStoryBeat();
    } else {
      gameState.dismissBeat(beatId);
      if (beatId === 'C6.torn') {
        rebuildScene();
        return;
      } else if (beatId === 'Y4') {
        renderTopBar();
        openVictoryCreditsModal();
        return;
      }
      renderTopBar();
      renderActiveStoryBeat();
    }
  };

  const card = h(
    'div',
    {
      class: 'interactive',
      style: {
        background: sp.bg,
        color: sp.textColor,
        border: `2.5px solid ${sp.border}`,
        borderRadius: '13px',
        padding: '10px 13px',
        boxShadow: '0 4px 0 #1f2430, 0 10px 22px rgba(0,0,0,0.28)',
        pointerEvents: isBark ? 'none' : 'auto',
      },
    },
    docNode,
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '5px',
        },
      },
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.05em',
          },
        },
        sp.badge,
        line.stage
          ? h(
              'em',
              { style: { fontWeight: '600', opacity: '0.85', marginLeft: '5px' } },
              `(${line.stage})`,
            )
          : null,
      ),
      isBark
        ? null
        : h(
            'button',
            {
              style: {
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                border: '1.5px solid #1f2430',
                background: sp.border,
                color: '#fff',
              },
              onclick: advanceDialogue,
            },
            btnLabel,
          ),
    ),
    h(
      'div',
      { style: { fontSize: '12.5px', lineHeight: '1.4', fontWeight: '600' } },
      '"',
      renderFormattedText(line.text),
      '"',
    ),
  );

  // A bark: a speech bubble at the bottom (its tail pointing up toward the speaker), which
  // fades and goes away on its own; taps pass straight through it.
  if (isBark) {
    leapBubbleHost.replaceChildren();
    card.style.borderRadius = '18px';
    const tail = h('div', {
      style: {
        width: '0',
        height: '0',
        borderLeft: '11px solid transparent',
        borderRight: '11px solid transparent',
        borderBottom: `12px solid ${sp.border}`,
        margin: '0 auto -1px auto',
      },
    });
    const bubble = h(
      'div',
      {
        style: {
          width: 'min(380px, 100%)',
          margin: '0 auto',
          pointerEvents: 'none',
          transition: 'opacity 0.35s ease',
          animation: 'puzz-card-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
        },
      },
      tail,
      card,
    );
    storyBannerHost.replaceChildren(bubble);
    cagedPromptTimer = window.setTimeout(() => {
      bubble.style.opacity = '0';
      cagedPromptTimer = window.setTimeout(() => {
        cagedPromptTimer = null;
        gameState.dismissBeat(beatId);
        renderTopBar();
        renderActiveStoryBeat();
      }, 350);
    }, BARK_SECONDS * 1000);
    return;
  }

  // When Leap Day speaks in Holiday Hall (other than a bark or modal overlay), anchor the speech bubble
  // directly to Leap Day's 3D mascot.
  if (currentBay === 'hall' && line.speaker === 'leapday' && activeModal === 'none') {
    storyBannerHost.replaceChildren();
    card.style.animation = 'puzz-card-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both';
    const tailUp = h('div', {
      style: {
        width: '0',
        height: '0',
        borderLeft: '11px solid transparent',
        borderRight: '11px solid transparent',
        borderBottom: `12px solid ${sp.border}`,
        margin: '0 auto -1px auto',
      },
    });
    const bubbleWrap = h(
      'div',
      {
        style: {
          position: 'fixed',
          transform: 'translateX(-50%)',
          width: 'min(340px, 92%)',
          pointerEvents: 'auto',
        },
      },
      tailUp,
      card,
    );
    positionLeapBubbleElement(bubbleWrap);
    leapBubbleHost.replaceChildren(bubbleWrap);
    return;
  }

  leapBubbleHost.replaceChildren();
  storyBannerHost.replaceChildren(card);
}

function renderSideArrows(): void {
  sideArrowsHost.replaceChildren();
}

function renderTopBar(): void {
  const act = gameState.act();
  const roomSpec =
    currentBay === 'hall' ? null : (ROOM_SPECS.find((r) => r.id === currentBay) ?? null);
  const signage = roomSpec ? gameState.getRoomSignage(roomSpec) : null;
  const hallTitle =
    act === 4
      ? '🏛️ Holiday Hall · Day 366 & Xmas12'
      : '🏛️ Holiday Hall · An XMAS365™ Synergized Campus';

  const leftGroup =
    roomSpec && signage
      ? h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '0',
            },
          },
          h(
            'button',
            {
              title: 'Return to Holiday Hall',
              style: {
                padding: '5px 10px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: 'pointer',
                background: '#fffdf9',
                color: '#1f2430',
                border: '2px solid #1f2430',
                boxShadow: '0 2px 0 #1f2430',
                flexShrink: '0',
              },
              onclick: () => switchBay('hall'),
            },
            '← Hall',
          ),
          h(
            'div',
            {
              title: `${roomSpec.title} · ${signage.title} (${signage.subtitle})`,
              style: {
                padding: '5px 11px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '13px',
                background: roomSpec.accent,
                color: '#fff',
                border: '2px solid #1f2430',
                boxShadow: '0 2px 0 #1f2430',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            },
            `${roomSpec.icon} ${signage.title}`,
          ),
        )
      : h(
          'div',
          {
            title: hallTitle,
            style: {
              padding: '5px 11px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              background: '#1f2430',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },
          '🏛️ Holiday Hall',
        );

  const row1 = h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        pointerEvents: 'auto',
      },
    },
    leftGroup,
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '5px', flexShrink: '0' } },
      h(
        'button',
        {
          title: 'Open Settings & Developer Panel',
          style: {
            padding: '5px 10px',
            borderRadius: '9px',
            fontWeight: '800',
            fontSize: '11.5px',
            cursor: 'pointer',
            background: '#1f2430',
            color: '#fff',
            border: '2px solid #1f2430',
            boxShadow: '0 2px 0 #000',
          },
          onclick: () => openSettingsModal(),
        },
        roomSpec ? '⚙️' : '⚙️ Settings',
      ),
    ),
  );

  topBar.replaceChildren(row1);
}

function renderCarryTray(): void {
  const carried = gameState.carriedItems();
  if (carried.length === 0) {
    carryTrayHost.replaceChildren();
    return;
  }

  const pills = carried.map((item) => {
    const homeRoom = ROOM_SPECS.find((r) => r.id === item.homeRoom);
    const inHomeRoom = currentBay === item.homeRoom;
    const inHall = currentBay === 'hall';
    const homeSign = homeRoom ? gameState.getRoomSignage(homeRoom) : null;
    const homeLabel = homeSign?.title ?? homeRoom?.shortTitle ?? item.homeRoom;
    const actionLabel = inHomeRoom
      ? '✨ Restore Here!'
      : inHall
        ? `✨ Take to ${homeLabel} Door ▸`
        : `← Holiday Hall (${homeRoom?.shortTitle ?? item.homeRoom})`;
    return h(
      'button',
      {
        title: `Carried Relic · Belongs in ${homeLabel}`,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 10px',
          borderRadius: '999px',
          fontWeight: '700',
          fontSize: '12px',
          cursor: 'pointer',
          background: inHomeRoom || inHall ? '#fefcbf' : '#fffdf9',
          color: '#1f2430',
          border: inHomeRoom || inHall ? '2px solid #d69e2e' : '2px solid #1f2430',
          boxShadow: '0 2px 0 #1f2430',
        },
        onclick: () => {
          if (inHomeRoom) {
            placeItemOnPedestal(item.id);
          } else if (inHall) {
            switchBay(item.homeRoom);
          } else {
            switchBay('hall');
          }
        },
      },
      `${item.icon} ${item.title}`,
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            fontWeight: '800',
            color: inHomeRoom || inHall ? '#b7791f' : (homeRoom?.accent ?? '#4a5568'),
          },
        },
        actionLabel,
      ),
    );
  });

  const bar = h(
    'div',
    {
      class: 'interactive',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: '12px',
        background: 'rgba(31, 36, 48, 0.92)',
        color: '#fff',
        border: '2px solid #1f2430',
        boxShadow: '0 4px 12px rgba(0,0,0,0.32)',
        pointerEvents: 'auto',
      },
    },
    h('span', { style: { fontSize: '11px', fontWeight: '800' } }, '🏷️ CARRIED RELIC:'),
    ...pills,
  );
  carryTrayHost.replaceChildren(bar);
}

function placeItemOnPedestal(itemId: string): void {
  const item = STRAY_ITEMS[itemId as keyof typeof STRAY_ITEMS];
  if (!item) return;
  blip(587, 90);
  window.setTimeout(() => blip(880, 130), 90);
  gameState.placeItem(itemId);
  rebuildScene();
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const ladderSvg = document.createElementNS(SVG_NS, 'svg');
ladderSvg.setAttribute('class', 'ladder-lines-svg');

function buildHotspotDOM(hotspots: Hotspot3D[]): void {
  projectedPills = hotspots
    .filter((hs) => !hs.hiddenPill)
    .map((hs) => {
      if (hs.kind === 'return-slot') {
        const rawTitle = hs.label.startsWith(`${hs.icon} `)
          ? hs.label.slice(hs.icon.length + 1)
          : hs.label;
        const slotTitle = rawTitle.replace(/^The\s+/i, '');
        const el = h(
          hs.status === 'place' ? 'button' : 'div',
          {
            class: `ladder-return-slot ${hs.status}`,
            title: hs.sublabel ? `${rawTitle} · ${hs.sublabel}` : rawTitle,
            onclick:
              hs.status === 'place'
                ? (e: MouseEvent) => {
                    e.stopPropagation();
                    hs.onClick();
                  }
                : undefined,
          },
          h('span', { class: 'slot-socket' }, hs.icon),
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '1px',
              },
            },
            h('span', { style: { fontWeight: '800', fontSize: '10px' } }, slotTitle),
            hs.status === 'place'
              ? h(
                  'span',
                  { style: { fontSize: '8.5px', fontWeight: '800', color: '#975a16' } },
                  '✨ Tap to Restore',
                )
              : null,
          ),
        );
        return { hotspot: hs, el };
      }

      const isDoorPill = hs.id.startsWith('door:');
      const el = h(
        'button',
        {
          class: `hotspot-pill ${hs.status}${hs.hero ? ' hero' : ''}`,
          style: {
            borderColor: hs.status === 'ready' || hs.status === 'door' ? hs.accent : undefined,
            minWidth: isDoorPill ? '0' : undefined,
            maxWidth: isDoorPill ? '112px' : undefined,
            padding: isDoorPill ? '4px 6px' : undefined,
          },
          onclick: (e: MouseEvent) => {
            e.stopPropagation();
            hs.onClick();
          },
        },
        h(
          'span',
          {
            style: {
              fontWeight: '800',
              fontSize: hs.hero ? '15.5px' : isDoorPill ? '9.5px' : '10.5px',
            },
          },
          hs.label,
        ),
        hs.sublabel
          ? h(
              'span',
              {
                style: {
                  fontSize: hs.hero ? '12px' : isDoorPill ? '8.5px' : '9px',
                  fontWeight: '700',
                  opacity: hs.hero ? '0.95' : '0.88',
                  color: hs.status === 'done' ? '#22543d' : hs.hero ? hs.accent : undefined,
                },
              },
              hs.sublabel,
            )
          : null,
      );
      return { hotspot: hs, el };
    });
  hotspotLayer.replaceChildren(ladderSvg, ...projectedPills.map((p) => p.el));
}

const tempProj = new THREE.Vector3();
const stableCam = new THREE.PerspectiveCamera(40, 1, 0.5, 200);
let lastLayoutW = 0;
let lastLayoutH = 0;

function syncCameraFov(w: number, hPx: number): void {
  const aspect = w / hPx;
  const minTanHalfH = 0.48; // ~51 deg horizontal FOV minimum so full bay + columns fit in portrait
  const tanHalfV = Math.max(0.35, minTanHalfH / aspect);
  const targetFov = THREE.MathUtils.radToDeg(2 * Math.atan(tanHalfV));
  if (
    Math.abs(view.camera.fov - targetFov) > 0.05 ||
    Math.abs(view.camera.aspect - aspect) > 0.001
  ) {
    view.camera.fov = targetFov;
    view.camera.aspect = aspect;
    view.camera.updateProjectionMatrix();
  }
}

/**
 * Compute each hotspot pill's exact resting position for `currentBay` once,
 * using the resting camera at `camAngleTarget` so pills never jitter or reshape
 * during camera rotation or idle drift.
 */
function layoutStableHotspots(): void {
  const w = Math.max(1, view.canvas.clientWidth);
  const hPx = Math.max(1, view.canvas.clientHeight);
  lastLayoutW = w;
  lastLayoutH = hPx;
  syncCameraFov(w, hPx);

  stableCam.fov = view.camera.fov;
  stableCam.aspect = w / hPx;
  stableCam.updateProjectionMatrix();
  stableCam.position.copy(bayToWorld(camAngleTarget, 0, 1.92, 5.15));
  stableCam.lookAt(bayToWorld(camAngleTarget, 0, 1.38, 0.75));
  stableCam.updateMatrixWorld();

  const padX = currentBay === 'hall' ? Math.min(54, w * 0.14) : Math.min(58, w * 0.15);
  const topBarBottom =
    topBar.getBoundingClientRect().bottom - view.canvas.getBoundingClientRect().top;
  const minY = Math.max(88, topBarBottom > 0 ? topBarBottom + 22 : 88);
  const posById = new Map<string, { x: number; y: number }>();

  for (const item of projectedPills) {
    if (item.hotspot.bay !== currentBay) {
      item.el.style.display = 'none';
      continue;
    }
    tempProj.copy(item.hotspot.worldPos).project(stableCam);
    if (tempProj.z > 1) {
      item.el.style.display = 'none';
    } else {
      const rawX = (tempProj.x * 0.5 + 0.5) * w;
      const clampedX = Math.max(padX, Math.min(w - padX, rawX));
      const rawY = (-tempProj.y * 0.5 + 0.5) * hPx;
      const y = Math.max(minY, rawY);
      item.el.style.display = '';
      item.el.style.left = `${clampedX.toFixed(1)}px`;
      item.el.style.top = `${y.toFixed(1)}px`;
      posById.set(item.hotspot.id, { x: clampedX, y });
    }
  }

  // Render progression ladder lines between connected nodes in the current room
  ladderSvg.replaceChildren();
  for (const item of projectedPills) {
    if (item.hotspot.bay !== currentBay || !item.hotspot.connections) continue;
    const src = posById.get(item.hotspot.id);
    if (!src) continue;
    for (const conn of item.hotspot.connections) {
      const dst = posById.get(conn.targetId);
      if (!dst) continue;
      const x1 = src.x;
      const y1 = src.y + 8;
      const x2 = dst.x;
      const y2 = dst.y + 26;
      const midY = (y1 + y2) * 0.5;
      const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;

      const backPath = document.createElementNS(SVG_NS, 'path');
      backPath.setAttribute('d', d);
      backPath.setAttribute('fill', 'none');
      backPath.setAttribute('stroke', '#1f2430');
      backPath.setAttribute('stroke-width', '6.5');
      backPath.setAttribute('stroke-linecap', 'round');
      ladderSvg.appendChild(backPath);

      const fgPath = document.createElementNS(SVG_NS, 'path');
      fgPath.setAttribute('d', d);
      fgPath.setAttribute('fill', 'none');
      fgPath.setAttribute(
        'stroke',
        conn.state === 'done' ? '#38a169' : conn.state === 'place' ? '#ecc94b' : '#a0aec0',
      );
      fgPath.setAttribute('stroke-width', conn.state === 'locked' ? '2.5' : '3.5');
      fgPath.setAttribute('stroke-linecap', 'round');
      if (conn.state === 'locked') {
        fgPath.setAttribute('stroke-dasharray', '5 5');
      }
      ladderSvg.appendChild(fgPath);
    }
  }
  const bubbleChild = leapBubbleHost.firstElementChild as HTMLElement | null;
  if (bubbleChild) {
    positionLeapBubbleElement(bubbleChild);
  }
}

let introActive = false;
let isTransitioningBay = false;

function syncBayUIAndHotspots(): void {
  layoutStableHotspots();
  if (!introActive && Math.abs(shortestAngleDelta(camAngleCurrent, camAngleTarget)) <= 0.015) {
    hotspotLayer.classList.add('settled');
  }
  if (!introActive) {
    gameState.onEnterBay(currentBay);
    renderTopBar();
    renderSideArrows();
    renderCarryTray();
    renderActiveStoryBeat();
  }
}

function showHallMascotBark(roomId: RoomSpec['id']): void {
  const entry = HALL_MASCOT_LINES[roomId];
  const room = ROOM_SPECS.find((r) => r.id === roomId);
  if (!entry || !room) return;
  clearCagedPromptTimer();
  leapBubbleHost.replaceChildren();
  const card = h(
    'div',
    {
      class: 'interactive',
      style: {
        background: '#fffdf9',
        color: '#1f2430',
        border: `2.5px solid ${room.accent}`,
        borderRadius: '18px',
        padding: '10px 13px',
        boxShadow: '0 4px 0 #1f2430, 0 10px 22px rgba(0,0,0,0.28)',
        pointerEvents: 'none',
      },
    },
    h(
      'div',
      {
        style: {
          fontSize: '11px',
          fontWeight: '900',
          letterSpacing: '0.05em',
          color: room.accent,
          marginBottom: '4px',
        },
      },
      `${entry.icon} ${entry.speaker.toUpperCase()} · ${room.shortTitle.toUpperCase()}`,
    ),
    h(
      'div',
      { style: { fontSize: '12.5px', lineHeight: '1.4', fontWeight: '600' } },
      `"${entry.line}"`,
    ),
  );
  const bubble = h(
    'div',
    {
      style: {
        width: 'min(380px, 100%)',
        margin: '0 auto',
        pointerEvents: 'none',
        transition: 'opacity 0.35s ease',
        animation: 'puzz-card-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
    card,
  );
  storyBannerHost.replaceChildren(bubble);
  cagedPromptTimer = window.setTimeout(() => {
    bubble.style.opacity = '0';
    cagedPromptTimer = window.setTimeout(() => {
      cagedPromptTimer = null;
      renderActiveStoryBeat();
    }, 350);
  }, BARK_SECONDS * 1000);
}

function rebuildScene(): void {
  if (!activeDiorama) {
    activeDiorama = buildHolidayHallDiorama({
      onSelectBay: (bay) => switchBay(bay),
      onOpenProto: (protoId, focusPos, focusLook) => openProtoModal(protoId, focusPos, focusLook),
      onShowStory: () => openCorkboardModal(),
      onOpenCorkboard: () => openCorkboardModal(),
      onClickMascot: (roomId) => {
        const room = ROOM_SPECS.find((r) => r.id === roomId);
        if (!room) return;
        blip(587, 55);
        if (currentBay === 'hall' && gameState.isRoomComplete(room)) {
          showHallMascotBark(roomId);
          return;
        }
        const script = ROOM_SCRIPT[roomId];
        const beatId = gameState.isRoomComplete(room) ? script.freedBeatId : script.cagedBeatId;
        gameState.enqueueBeat(beatId, true);
        renderActiveStoryBeat();
      },
      onPlaceItem: (itemId) => placeItemOnPedestal(itemId),
    });
    view.scene.add(activeDiorama.root);
  } else {
    activeDiorama.syncState();
  }

  buildHotspotDOM(activeDiorama.hotspots);
  syncBayUIAndHotspots();
  if (!isRenderLoopRunning && !introActive) {
    renderStaticSceneFrame();
  }
}

function switchBay(bay: BayId, opts?: { instant?: boolean }): void {
  if (isTransitioningBay && !opts?.instant) return;
  dismissActiveBarkBeat();
  const activeBeat = gameState.currentBeat();
  if (activeBeat && activeBeat.endsWith('.freed')) {
    gameState.dismissBeat(activeBeat);
  }
  closeModal();

  if (opts?.instant || bay === currentBay) {
    currentBay = bay;
    camAngleTarget = getBayAngle(bay);
    camAngleCurrent = camAngleTarget;
    syncBayUIAndHotspots();
    hotspotLayer.classList.add('settled');
    return;
  }

  // Navigating from Holiday Hall through one of the 6 holiday doors:
  // Leap Day hops to the door, unlocks it if carrying its first misfiled item,
  // fades to black, and fades in inside the holiday room!
  if (currentBay === 'hall' && bay !== 'hall') {
    const roomSpec = ROOM_SPECS.find((r) => r.id === bay);
    if (!roomSpec) return;
    const unlocked = gameState.isRoomUnlocked(roomSpec);
    const unlockItem = !unlocked ? gameState.carriedEligibleItemForRoom(roomSpec) : null;
    if (!unlocked && !unlockItem) {
      blip(180, 60);
      return;
    }

    isTransitioningBay = true;
    hotspotLayer.classList.remove('settled');
    leapBubbleHost.replaceChildren();
    storyBannerHost.replaceChildren();
    blip(440, 50);
    window.setTimeout(() => blip(587, 65), 320);

    const hopDurationMs = 860;
    const hopStart = performance.now();
    const tickHop = (now: number): void => {
      const p = Math.min(1, (now - hopStart) / hopDurationMs);
      activeDiorama?.setDoorHop(bay, p);
      if (p < 1 && isTransitioningBay) {
        requestAnimationFrame(tickHop);
      }
    };
    requestAnimationFrame(tickHop);

    window.setTimeout(() => {
      fadeOverlay.style.pointerEvents = 'auto';
      fadeOverlay.style.opacity = '1';
    }, 660);

    window.setTimeout(() => {
      currentBay = bay;
      camAngleTarget = getBayAngle(bay);
      camAngleCurrent = camAngleTarget;
      activeDiorama?.setDoorHop(null, 0);
      if (unlockItem) {
        blip(659, 90);
        gameState.placeItem(unlockItem.id);
        rebuildScene();
      } else {
        syncBayUIAndHotspots();
      }
      hotspotLayer.classList.add('settled');
      fadeOverlay.style.opacity = '0';
      fadeOverlay.style.pointerEvents = 'none';
      window.setTimeout(() => {
        isTransitioningBay = false;
      }, 220);
    }, 900);
    return;
  }

  // Returning to Holiday Hall (or switching bays): fade to black, snap camera, fade in
  isTransitioningBay = true;
  hotspotLayer.classList.remove('settled');
  leapBubbleHost.replaceChildren();
  storyBannerHost.replaceChildren();
  blip(392, 45);
  fadeOverlay.style.pointerEvents = 'auto';
  fadeOverlay.style.opacity = '1';

  window.setTimeout(() => {
    currentBay = bay;
    camAngleTarget = getBayAngle(bay);
    camAngleCurrent = camAngleTarget;
    syncBayUIAndHotspots();
    hotspotLayer.classList.add('settled');
    fadeOverlay.style.opacity = '0';
    fadeOverlay.style.pointerEvents = 'none';
    window.setTimeout(() => {
      isTransitioningBay = false;
    }, 220);
  }, 220);
}

function closeModal(): void {
  if (activeModal === 'proto') {
    gameState.setActivePuzzle(null);
  }
  activeModal = 'none';
  activeProtoId = null;
  activeProtoWasSolvedOnOpen = false;
  isCameraFocused = false;
  modalHost.replaceChildren();
  hotspotLayer.style.display = '';
  sideArrowsHost.style.display = '';
  syncRenderLoop();
  renderActiveStoryBeat();
}

const ROOM_TINTS: Record<string, string> = {
  halloween: '#f5f0ff',
  thanksgiving: '#fcf6ec',
  christmas: '#effaf4',
  valentines: '#fff3f8',
  easter: '#fefce8',
  fourth: '#eff6ff',
};

function showUnlockDialog(roomSpec: RoomSpec, kind: 'intro' | 'home'): void {
  const isWarmup = kind === 'intro';
  const sizeText =
    roomSpec.id === 'easter'
      ? '4×4 / 5×5 / 6×6'
      : roomSpec.id === 'christmas'
        ? '5×5 / 6×6 / 7×7'
        : '5×5 / 7×7 / 9×9';
  const titleText = isWarmup
    ? `${roomSpec.icon} ${roomSpec.homeTwist.title} Unlocked!`
    : `${roomSpec.icon} 5 Relic Runs Unlocked in ${roomSpec.shortTitle}!`;
  const detailText = isWarmup
    ? `Beating the ${roomSpec.shortTitle} Intro Run (${roomSpec.warmup.title}) unlocked ${roomSpec.homeTwist.title} (Home Twist) and Free Play (${sizeText}) on this rung!`
    : `Beating ${roomSpec.homeTwist.title} unlocked all 5 foreign Relic Runs on the floor of ${roomSpec.shortTitle}, plus Free Play (${sizeText}) on this rung!`;

  const overlay = h(
    'div',
    {
      class: 'puzz-modal-backdrop',
      style: { zIndex: '55' },
      onclick: () => overlay.remove(),
    },
    h(
      'div',
      {
        style: {
          width: 'min(420px, 92%)',
          background: '#fffdf8',
          border: `3px solid ${roomSpec.accent}`,
          borderRadius: '18px',
          boxShadow: '0 8px 0 #1f2430, 0 20px 44px rgba(0, 0, 0, 0.45)',
          padding: '20px 22px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#1f2430',
          animation: 'puzz-card-in 0.24s cubic-bezier(0.22, 1, 0.36, 1) both',
        },
        onclick: (e: MouseEvent) => e.stopPropagation(),
      },
      h(
        'div',
        {
          style: {
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '999px',
            background: '#fefcbf',
            border: '2px solid #d69e2e',
            color: '#744210',
            fontWeight: '900',
            fontSize: '12px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          },
        },
        '🔓 Unlocked!',
      ),
      h(
        'h3',
        {
          style: {
            margin: '0 0 8px 0',
            fontSize: '19px',
            lineHeight: '1.22',
            color: '#1f2430',
          },
        },
        titleText,
      ),
      h(
        'p',
        {
          style: {
            margin: '0 0 16px 0',
            fontSize: '13.5px',
            lineHeight: '1.45',
            color: '#4a5568',
            fontWeight: '600',
          },
        },
        detailText,
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          },
        },
        h(
          'button',
          {
            style: {
              padding: '8px 18px',
              borderRadius: '999px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              background: '#2f855a',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
            },
            onclick: () => overlay.remove(),
          },
          'Awesome! ✓',
        ),
      ),
    ),
  );
  (ui ?? document.body).append(overlay);
}

export function openVictoryCreditsModal(): void {
  activeModal = 'credits';
  activeProtoId = null;
  isCameraFocused = false;
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  storyBannerHost.replaceChildren();
  leapBubbleHost.replaceChildren();
  hideMemoOverlay();

  blip(523, 80);
  window.setTimeout(() => blip(659, 80), 85);
  window.setTimeout(() => blip(784, 90), 170);
  window.setTimeout(() => blip(1047, 180), 260);

  const y6Spec = {
    title: 'DAY 366: LEAP DAY',
    subtitle: 'An Xmas12 Production',
    body: 'Holiday Hall is back on the twelve-month calendar.\n\nAll six holidays restored · All mascots uncaged · All contract clauses voided.\n\nHappy Birthday, Leap Day!',
  };

  const mascotRollCall: readonly { label: string; role: string; bg: string; border: string }[] = [
    { label: '🎩 Leap Day', role: 'Day 366 · Every Year', bg: '#f0fff4', border: '#2f855a' },
    { label: '🕷️ Halloween Spider', role: 'Halloween Porch', bg: '#faf5ff', border: '#805ad5' },
    {
      label: '🦃 Thanksgiving Turkey',
      role: 'Thanksgiving Table',
      bg: '#fffaf0',
      border: '#c05621',
    },
    { label: '⛄ Christmas Snowman', role: 'Christmas Hearth', bg: '#f0fff4', border: '#2f855a' },
    { label: "🧸 Valentine's Bear", role: "Valentine's Parlor", bg: '#fff5f7', border: '#d53f8c' },
    { label: '🐰 Easter Bunny', role: 'Easter Garden', bg: '#fefcbf', border: '#d69e2e' },
    {
      label: '🦅 Fourth of July Eaglet',
      role: 'Fourth of July Yard',
      bg: '#ebf8ff',
      border: '#2b6cb0',
    },
    {
      label: '🎅 Humbled Santa',
      role: 'Founder, Xmas12 (12 Days Only)',
      bg: '#fff5f5',
      border: '#c53030',
    },
  ];

  const mascotPills = mascotRollCall.map((m) =>
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '7px 10px',
          borderRadius: '10px',
          background: m.bg,
          border: `2px solid ${m.border}`,
          boxShadow: '0 2px 0 rgba(31, 36, 48, 0.16)',
        },
      },
      h('span', { style: { fontWeight: '800', fontSize: '12.5px', color: '#1f2430' } }, m.label),
      h('span', { style: { fontWeight: '700', fontSize: '10.5px', color: '#4a5568' } }, m.role),
    ),
  );

  const genrePills = ROOM_SPECS.map((r) =>
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '9px',
          background: '#fffdf9',
          border: `1.5px solid ${r.accent}`,
          fontSize: '12px',
          fontWeight: '700',
          color: '#1f2430',
        },
      },
      h('span', {}, `${r.icon} ${r.title}`),
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            fontWeight: '800',
            color: r.accent,
          },
        },
        `★ ${r.genreLabel}`,
      ),
    ),
  );

  const finishCredits = (): void => {
    blip(587, 65);
    closeModal();
  };

  const card = h(
    'div',
    {
      class: 'puzz-modal-card',
      style: { maxWidth: '560px' },
      onclick: (e: MouseEvent) => e.stopPropagation(),
    },
    h(
      'div',
      { class: 'puzz-modal-header' },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '9px' } },
        h(
          'span',
          {
            style: {
              display: 'inline-grid',
              placeItems: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#d69e2e',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
              fontSize: '19px',
            },
          },
          '🎂',
        ),
        h(
          'div',
          {},
          h(
            'div',
            {
              style: {
                fontSize: '10px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: '#975a16',
              },
            },
            y6Spec.subtitle,
          ),
          h('h2', { style: { margin: '0', fontSize: '18px', lineHeight: '1.15' } }, y6Spec.title),
        ),
      ),
      h(
        'button',
        {
          title: 'Close credits',
          style: {
            marginLeft: 'auto',
            flexShrink: '0',
            padding: '5px 11px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            background: '#1f2430',
            color: '#fff',
            border: '2px solid #1f2430',
            boxShadow: '0 2px 0 #1f2430',
          },
          onclick: finishCredits,
        },
        '✕ Close',
      ),
    ),
    h(
      'div',
      {
        class: 'puzz-modal-body',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        },
      },
      h(
        'div',
        {
          style: {
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(180deg, #fefcbf 0%, #fffaf0 100%)',
            border: '2px solid #d69e2e',
            color: '#744210',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          },
        },
        ...y6Spec.body.split('\n\n').map((para, idx) =>
          h(
            'div',
            {
              style: {
                fontSize: idx === 2 ? '15px' : '13px',
                fontWeight: idx === 2 ? '900' : '700',
                lineHeight: '1.4',
              },
            },
            para,
          ),
        ),
      ),
      h(
        'div',
        {},
        h(
          'div',
          {
            style: {
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#4a5568',
              marginBottom: '6px',
            },
          },
          '🎉 Starring the Holiday Hall Cast',
        ),
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
              gap: '7px',
            },
          },
          ...mascotPills,
        ),
      ),
      h(
        'div',
        {},
        h(
          'div',
          {
            style: {
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#4a5568',
              marginBottom: '6px',
            },
          },
          '★ Six Restored Holiday Verticals',
        ),
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '6px',
            },
          },
          ...genrePills,
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', justifyContent: 'center', marginTop: '4px' } },
        h(
          'button',
          {
            style: {
              padding: '10px 20px',
              borderRadius: '999px',
              fontWeight: '900',
              fontSize: '13.5px',
              cursor: 'pointer',
              background: '#2f855a',
              color: '#fff',
              border: '2.5px solid #1f2430',
              boxShadow: '0 3px 0 #1f2430',
            },
            onclick: finishCredits,
          },
          '📌 Read Final Memo (Y7) & Enter Free Play ▸',
        ),
      ),
    ),
  );
  card.style.setProperty('--room-accent', '#d69e2e');
  card.style.setProperty('--room-tint', '#fefcbf');

  const backdrop = h(
    'div',
    {
      class: 'puzz-modal-backdrop',
    },
    card,
  );
  modalHost.replaceChildren(backdrop);
  syncRenderLoop();
}

function openProtoModal(protoId: string, focusPos: THREE.Vector3, focusLook: THREE.Vector3): void {
  const proto: Proto | undefined =
    protoId === 'clause' ? FINALE_PROTO : PROTOS.find((p) => p.id === protoId);
  if (!proto) return;

  dismissActiveBarkBeat();
  activeModal = 'proto';
  activeProtoId = proto.id;
  activeProtoWasSolvedOnOpen = gameState.solvedRuns.has(proto.id);
  storyBannerHost.replaceChildren();
  hideMemoOverlay();
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  isCameraFocused = true;
  focusPosTarget.copy(focusPos);
  focusLookTarget.copy(focusLook);

  if (protoId === 'clause') {
    gameState.enqueueBeat('C0');
    renderActiveStoryBeat();
  }

  // Match the puzzle frame theme to the room where this puzzle lives
  const roomSpec = ROOM_SPECS.find(
    (r) =>
      r.warmup.id === proto.id ||
      r.strays.some((s) => s.proto.id === proto.id) ||
      r.homeTwist.proto.id === proto.id,
  );
  const strayEntry = Object.values(STRAY_ITEMS).find((s) => s.proto.id === proto.id);
  const accent = roomSpec?.accent ?? '#c53030';
  const tint = roomSpec ? (ROOM_TINTS[roomSpec.id] ?? '#f8f4ec') : '#fff5f5';
  const badgeIcon = strayEntry?.icon ?? roomSpec?.icon ?? '🎉';

  const body = h('div', {});
  const doneBanner = h('div', { style: { marginTop: '10px' } });
  let wasAlreadySolved = gameState.solvedRuns.has(proto.id);

  const mountPuzzle = (): void => {
    body.replaceChildren();
    doneBanner.replaceChildren();
    proto.mount(body, {
      solved: () => {
        blip(523, 90);
        window.setTimeout(() => blip(659, 90), 90);
        window.setTimeout(() => blip(784, 160), 180);
        gameState.markRunSolved(proto.id);
        if (proto.id === 'clause') {
          clearContractOverlayBeats();
          closeModal();
          if (currentBay !== 'hall') {
            switchBay('hall', { instant: true });
          } else {
            rebuildScene();
          }
          return;
        }
        if (!wasAlreadySolved && roomSpec && (proto.kind === 'intro' || proto.kind === 'home')) {
          wasAlreadySolved = true;
          closeModal();
          rebuildScene();
          showUnlockDialog(roomSpec, proto.kind);
          return;
        }
        rebuildScene();
        if (!isRenderLoopRunning) {
          renderStaticSceneFrame();
        }
        hotspotLayer.style.display = 'none';
        sideArrowsHost.style.display = 'none';

        const homeRoom = strayEntry
          ? ROOM_SPECS.find((r) => r.id === strayEntry.homeRoom)
          : undefined;
        const cpRoom =
          proto.kind === 'home'
            ? ROOM_SPECS.find((r) => r.homeTwist.proto.id === proto.id)
            : undefined;
        const readyForSanta =
          gameState.completedRoomCount() >= 6 && !gameState.solvedRuns.has('clause');
        const returnHallRoom = homeRoom;

        doneBanner.replaceChildren(
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#f0fff4',
                border: '2px solid #2f855a',
                boxShadow: '0 2px 0 #22543d',
                color: '#22543d',
                fontWeight: '700',
                fontSize: '13.5px',
              },
            },
            h(
              'span',
              {},
              strayEntry
                ? `🎉 Freed ${strayEntry.icon} ${strayEntry.title}! Belongs in ${homeRoom?.shortTitle ?? strayEntry.homeRoom}.`
                : cpRoom
                  ? `✨ Home Twist Complete! 🎉 All 5 Relic Runs in ${cpRoom.shortTitle} are now open!`
                  : `🎉 ${proto.title} Complete!`,
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              returnHallRoom
                ? h(
                    'button',
                    {
                      style: {
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: readyForSanta ? '#c53030' : returnHallRoom.accent,
                        color: '#fff',
                        border: '2px solid #1f2430',
                        boxShadow: '0 2px 0 #1f2430',
                      },
                      onclick: () => switchBay('hall'),
                    },
                    readyForSanta
                      ? '🎅 Confront CEO Santa in Holiday Hall ▸'
                      : '← Return to Holiday Hall ▸',
                  )
                : null,
              h(
                'button',
                {
                  style: {
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: '#2f855a',
                    color: '#fff',
                    border: '2px solid #1f2430',
                    boxShadow: '0 2px 0 #1f2430',
                  },
                  onclick: () => closeModal(),
                },
                'Done ▸',
              ),
            ),
          ),
        );
      },
      status: () => {
        // Status is rendered inside the puzzle run footer
      },
    });
  };

  const card = h(
    'div',
    {
      class: 'puzz-modal-card',
      onclick: (e: MouseEvent) => e.stopPropagation(),
    },
    h(
      'div',
      { class: 'puzz-modal-header' },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '9px', minWidth: '0' } },
        h(
          'span',
          {
            style: {
              display: 'inline-grid',
              placeItems: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: accent,
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
              fontSize: '18px',
              flexShrink: '0',
            },
          },
          badgeIcon,
        ),
        h(
          'div',
          { style: { minWidth: '0' } },
          h(
            'div',
            {
              style: {
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: accent,
              },
            },
            `${proto.room} · ${proto.kind}`,
          ),
          h('h2', { style: { margin: '0', fontSize: '17px', lineHeight: '1.15' } }, proto.title),
        ),
      ),
      h(
        'button',
        {
          title: 'Close puzzle panel',
          style: {
            marginLeft: 'auto',
            flexShrink: '0',
            padding: '5px 11px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            background: '#1f2430',
            color: '#fff',
            border: '2px solid #1f2430',
            boxShadow: '0 2px 0 #1f2430',
          },
          onclick: () => closeModal(),
        },
        '✕ Close',
      ),
    ),
    h('div', { class: 'puzz-modal-body' }, body, doneBanner),
  );
  card.style.setProperty('--room-accent', accent);
  card.style.setProperty('--room-tint', tint);

  const backdrop = h(
    'div',
    {
      class: 'puzz-modal-backdrop',
      onclick: () => closeModal(),
    },
    card,
  );
  modalHost.replaceChildren(backdrop);
  mountPuzzle();
  syncRenderLoop(true);
}

function openCorkboardModal(initialMemoId?: MemoId): void {
  activeModal = 'corkboard';
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  renderActiveStoryBeat();
  isCameraFocused = false;

  const pinnedSpecs = gameState.pinnedMemosInOrder();
  const pinnedIds = new Set<MemoId>(pinnedSpecs.map((m) => m.id));
  let selectedId: MemoId =
    initialMemoId && pinnedIds.has(initialMemoId)
      ? initialMemoId
      : (pinnedSpecs[pinnedSpecs.length - 1]?.id ?? 'P1');

  const bodyHost = h('div', {
    class: 'puzz-modal-body',
    style: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      overflowY: 'auto',
    },
  });

  const renderCorkboardContent = (): void => {
    const pinCards = MEMO_ORDER.map((memoId) => {
      const unlocked = pinnedIds.has(memoId);
      const spec = MEMOS[memoId];
      const active = unlocked && memoId === selectedId;
      const isXmas12 = spec.header.includes('XMAS12');
      return h(
        'button',
        {
          disabled: unlocked ? undefined : 'disabled',
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '3px',
            padding: '8px 10px',
            borderRadius: '10px',
            textAlign: 'left',
            cursor: unlocked ? 'pointer' : 'not-allowed',
            background: !unlocked
              ? 'rgba(31, 36, 48, 0.22)'
              : active
                ? isXmas12
                  ? '#f0fff4'
                  : '#fff5f5'
                : '#fffdf7',
            color: unlocked ? '#1f2430' : '#cbd5e0',
            border: active
              ? `2.5px solid ${isXmas12 ? '#2f855a' : '#c53030'}`
              : unlocked
                ? '1.5px solid #bfa77a'
                : '1.5px dashed rgba(255,255,255,0.28)',
            boxShadow: active ? '0 3px 0 #1f2430' : unlocked ? '0 2px 0 rgba(0,0,0,0.18)' : 'none',
            opacity: unlocked ? '1' : '0.6',
          },
          onclick: () => {
            if (!unlocked) return;
            selectedId = memoId;
            blip(540, 45);
            renderCorkboardContent();
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '4px',
            },
          },
          h(
            'span',
            {
              style: {
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: !unlocked ? '#a0aec0' : isXmas12 ? '#2f855a' : '#c53030',
              },
            },
            unlocked ? (isXmas12 ? '📌 Xmas12' : '📌 Memo') : '🔒 Unfound',
          ),
          h(
            'span',
            {
              style: {
                fontSize: '9.5px',
                fontWeight: '800',
                color: unlocked ? '#718096' : '#a0aec0',
              },
            },
            memoId,
          ),
        ),
        h(
          'div',
          {
            style: {
              fontSize: '11.5px',
              fontWeight: '800',
              lineHeight: '1.25',
              display: '-webkit-box',
              webkitLineClamp: '2',
              webkitBoxOrient: 'vertical',
              overflow: 'hidden',
            },
          },
          unlocked ? formatMemoText(spec.re, gameState.firstRevertedHoliday) : 'Undiscovered Memo',
        ),
      );
    });

    const corkGrid = h(
      'div',
      {
        style: {
          padding: '12px',
          borderRadius: '14px',
          background: 'linear-gradient(180deg, #b8834a 0%, #9c6b36 100%)',
          border: '3px solid #5c3b1e',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.28)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
          gap: '8px',
        },
      },
      ...pinCards,
    );

    const activeReader = h(
      'div',
      { class: 'memo-reader' },
      buildMemoSheet(MEMOS[selectedId], gameState.firstRevertedHoliday),
    );

    bodyHost.replaceChildren(corkGrid, activeReader);
  };

  const card = h(
    'div',
    {
      class: 'puzz-modal-card',
      onclick: (e: MouseEvent) => e.stopPropagation(),
    },
    h(
      'div',
      { class: 'puzz-modal-header' },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '9px' } },
        h(
          'span',
          {
            style: {
              display: 'inline-grid',
              placeItems: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#9c6b36',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
              fontSize: '18px',
            },
          },
          '📄',
        ),
        h(
          'div',
          {},
          h(
            'div',
            {
              style: {
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#744210',
              },
            },
            `Holiday Hall · ${pinnedSpecs.length}/${MEMO_ORDER.length} Unlocked`,
          ),
          h(
            'h2',
            { style: { margin: '0', fontSize: '17px', lineHeight: '1.15' } },
            'Unlocked Memos · XMAS365™ Archive',
          ),
        ),
      ),
      h(
        'button',
        {
          title: 'Close memos',
          style: {
            marginLeft: 'auto',
            flexShrink: '0',
            padding: '5px 11px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            background: '#1f2430',
            color: '#fff',
            border: '2px solid #1f2430',
            boxShadow: '0 2px 0 #1f2430',
          },
          onclick: () => closeModal(),
        },
        '✕ Close',
      ),
    ),
    bodyHost,
  );
  card.style.setProperty('--room-accent', '#9c6b36');
  card.style.setProperty('--room-tint', '#fdf8ef');

  const backdrop = h(
    'div',
    {
      class: 'puzz-modal-backdrop',
      onclick: () => closeModal(),
    },
    card,
  );
  modalHost.replaceChildren(backdrop);
  renderCorkboardContent();
  syncRenderLoop();
}

function openSettingsModal(): void {
  activeModal = 'settings';
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  renderActiveStoryBeat();
  isCameraFocused = false;

  let confirmReset = false;
  let showSaveEditor = false;
  let saveFeedback: { ok: boolean; text: string } | null = null;
  const bodyHost = h('div', { class: 'puzz-modal-body' });

  const syncSceneBehindModal = (): void => {
    rebuildScene();
    hotspotLayer.style.display = 'none';
    sideArrowsHost.style.display = 'none';
  };

  const makeCheckRow = (
    label: string,
    sublabel: string,
    checked: boolean,
    onToggle: (next: boolean) => void,
  ): HTMLElement => {
    const input = h('input', {
      type: 'checkbox',
      checked: checked ? 'checked' : undefined,
      style: {
        width: '17px',
        height: '17px',
        cursor: 'pointer',
        accentColor: '#2f855a',
        flexShrink: '0',
      },
      onchange: (e: Event) => {
        const next = (e.target as HTMLInputElement).checked;
        saveFeedback = null;
        onToggle(next);
        syncSceneBehindModal();
        renderSettingsContent();
      },
    }) as HTMLInputElement;
    input.checked = checked;

    return h(
      'label',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 9px',
          borderRadius: '8px',
          background: checked ? '#f0fff4' : '#fffdf9',
          border: checked ? '1.5px solid #68d391' : '1.5px solid #e2d9c8',
          cursor: 'pointer',
          fontSize: '12.5px',
          lineHeight: '1.25',
        },
      },
      input,
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '1px' } },
        h('span', { style: { fontWeight: '700', color: '#1f2430' } }, label),
        h('span', { style: { fontSize: '10.5px', color: '#6b7280', fontWeight: '600' } }, sublabel),
      ),
    );
  };

  const renderSettingsContent = (): void => {
    const soundOn = isSoundEnabled();
    const fpsOn = isFpsEnabled();
    const introOn = isShowIntroOnLoadEnabled();
    const act = gameState.act();
    const lamps = gameState.completedRoomCount();
    const voidedClauses = gameState.voidedClauseCount();
    const totalSolvedPanels = gameState.totalSolvedPanelCount();
    const totalPanels = gameState.totalGamePanelCount();

    // 1. General Settings (Sound Toggle + FPS Counter Toggle + Reset Progress)
    const controlsSection = h(
      'div',
      {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: '12px',
          background: '#fffdf9',
          border: '2px solid #d8cfc0',
          marginBottom: '12px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
        h(
          'button',
          {
            style: {
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              background: soundOn ? '#2f855a' : '#4a5568',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
            },
            onclick: () => {
              const next = !isSoundEnabled();
              setSoundEnabled(next);
              if (next) blip(660, 70);
              renderSettingsContent();
            },
          },
          soundOn ? '🔊 Sound: ON' : '🔇 Sound: OFF',
        ),
        h(
          'button',
          {
            style: {
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              background: fpsOn ? '#2b6cb0' : '#4a5568',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
            },
            onclick: () => {
              const next = !isFpsEnabled();
              setFpsEnabled(next);
              fpsBadge.style.display = next ? 'block' : 'none';
              blip(523, 55);
              renderSettingsContent();
            },
          },
          fpsOn ? '⏱️ FPS Counter: ON' : '⏱️ FPS Counter: OFF',
        ),
        h(
          'button',
          {
            style: {
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              background: '#fffaf0',
              color: '#744210',
              border: '2px solid #d69e2e',
              boxShadow: '0 2px 0 #b7791f',
            },
            onclick: () => {
              closeModal();
              openCorkboardModal();
            },
          },
          `📄 Unlocked Memos (${gameState.pinnedMemos.size}/${MEMO_ORDER.length})`,
        ),
        h(
          'button',
          {
            style: {
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              background: introOn ? '#2b6cb0' : '#4a5568',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
            },
            onclick: () => {
              const next = !isShowIntroOnLoadEnabled();
              setShowIntroOnLoadEnabled(next);
              blip(523, 55);
              renderSettingsContent();
            },
          },
          introOn ? '🎬 Show Intro on Load: ON' : '🎬 Show Intro on Load: OFF',
        ),
      ),
      h(
        'button',
        {
          style: {
            padding: '8px 14px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            background: confirmReset ? '#c53030' : '#fff5f5',
            color: confirmReset ? '#fff' : '#c53030',
            border: '2px solid #c53030',
            boxShadow: '0 2px 0 #742a2a',
          },
          onclick: () => {
            if (!confirmReset) {
              confirmReset = true;
              renderSettingsContent();
              return;
            }
            confirmReset = false;
            saveFeedback = { ok: true, text: 'All progress reset to New Game.' };
            gameState.resetAll();
            blip(330, 90);
            syncSceneBehindModal();
            renderSettingsContent();
          },
        },
        confirmReset ? '⚠️ Tap Again to Confirm Reset' : '🗑️ Reset All Progress',
      ),
    );

    // 2. Save State (`puzz.save`) Backup & Restore Card
    const saveTextarea = h('textarea', {
      rows: '6',
      spellcheck: 'false',
      style: {
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '11.5px',
        lineHeight: '1.4',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1.5px solid #cbd5e0',
        background: '#1f2430',
        color: '#edf2f7',
        resize: 'vertical',
      },
    }) as HTMLTextAreaElement;
    saveTextarea.value = gameState.exportSaveJson();

    const saveCard = h(
      'div',
      {
        style: {
          padding: '11px 14px',
          borderRadius: '12px',
          background: '#fffdf9',
          border: '2px solid #d8cfc0',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          },
        },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
          h(
            'span',
            {
              style: {
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#4a5568',
              },
            },
            '💾 Save State (puzz.save)',
          ),
          h(
            'span',
            { style: { fontSize: '13px', fontWeight: '800', color: '#1f2430' } },
            `Act ${act} · ★ ${lamps}/6 Rooms · 📜 ${voidedClauses}/${ALL_CLAUSES.length} Clauses · ✓ ${totalSolvedPanels}/${totalPanels} Puzzles`,
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
          h(
            'button',
            {
              style: {
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer',
                background: '#edf2f7',
                color: '#1f2430',
                border: '1.5px solid #1f2430',
              },
              onclick: () => {
                const json = gameState.exportSaveJson();
                if (navigator.clipboard?.writeText) {
                  void navigator.clipboard.writeText(json).then(
                    () => {
                      saveFeedback = { ok: true, text: 'Copied save JSON to clipboard!' };
                      blip(660, 55);
                      renderSettingsContent();
                    },
                    () => {
                      showSaveEditor = true;
                      saveFeedback = {
                        ok: true,
                        text: 'Select and copy your save JSON below.',
                      };
                      renderSettingsContent();
                    },
                  );
                } else {
                  showSaveEditor = true;
                  saveFeedback = { ok: true, text: 'Select and copy your save JSON below.' };
                  renderSettingsContent();
                }
              },
            },
            '📋 Copy Save JSON',
          ),
          h(
            'button',
            {
              style: {
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer',
                background: showSaveEditor ? '#1f2430' : '#fffaf0',
                color: showSaveEditor ? '#fff' : '#744210',
                border: '1.5px solid #1f2430',
              },
              onclick: () => {
                showSaveEditor = !showSaveEditor;
                saveFeedback = null;
                blip(523, 45);
                renderSettingsContent();
              },
            },
            showSaveEditor ? '▾ Hide JSON Editor' : '📥 Restore / Edit Save JSON',
          ),
        ),
      ),
      saveFeedback
        ? h(
            'div',
            {
              style: {
                fontSize: '12px',
                fontWeight: '700',
                padding: '6px 10px',
                borderRadius: '8px',
                background: saveFeedback.ok ? '#f0fff4' : '#fff5f5',
                color: saveFeedback.ok ? '#22543d' : '#c53030',
                border: `1.5px solid ${saveFeedback.ok ? '#68d391' : '#feb2b2'}`,
              },
            },
            `${saveFeedback.ok ? '✓' : '⚠️'} ${saveFeedback.text}`,
          )
        : null,
      showSaveEditor
        ? h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '2px',
              },
            },
            h(
              'div',
              { style: { fontSize: '11.5px', color: '#4a5568', fontWeight: '600' } },
              'Paste a backup JSON save object below and click Apply to restore your progress:',
            ),
            saveTextarea,
            h(
              'div',
              { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
              h(
                'button',
                {
                  style: {
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: '#2f855a',
                    color: '#fff',
                    border: '1.5px solid #1f2430',
                    boxShadow: '0 2px 0 #1f2430',
                  },
                  onclick: () => {
                    const res = gameState.importSaveJson(saveTextarea.value);
                    if (res.ok) {
                      saveFeedback = { ok: true, text: 'Save state restored and applied!' };
                      blip(660, 70);
                      syncSceneBehindModal();
                    } else {
                      saveFeedback = { ok: false, text: res.error };
                      blip(240, 90);
                    }
                    renderSettingsContent();
                  },
                },
                '✓ Apply Save JSON',
              ),
            ),
          )
        : null,
    );

    // 3. Progression & State Toggles: Quick Presets + Global Flags + 6 Contract Clauses + 6 Holiday Rooms
    const presetBtn = (label: string, onClick: () => void): HTMLElement =>
      h(
        'button',
        {
          style: {
            padding: '5px 10px',
            borderRadius: '8px',
            fontWeight: '800',
            fontSize: '11.5px',
            cursor: 'pointer',
            background: '#edf2f7',
            color: '#1f2430',
            border: '1.5px solid #1f2430',
          },
          onclick: () => {
            saveFeedback = null;
            onClick();
            blip(523, 60);
            syncSceneBehindModal();
            renderSettingsContent();
          },
        },
        label,
      );

    const devHeader = h(
      'div',
      {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '10px',
        },
      },
      h(
        'div',
        {},
        h(
          'div',
          {
            style: {
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#4a5568',
            },
          },
          '🛠️ Progression & Save State Toggles',
        ),
        h(
          'div',
          { style: { fontSize: '14px', fontWeight: '800', color: '#1f2430' } },
          `Toggle Rooms, Relics & Contract Clauses (Act ${act} · ★ ${lamps}/6 Lamps)`,
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
        presetBtn('Unlock All Intros & Home Twists', () => {
          for (const r of ROOM_SPECS) {
            gameState.setRunSolved(r.warmup.id, true);
            gameState.setRunSolved(r.homeTwist.proto.id, true);
          }
        }),
        presetBtn('Complete All 6 Rooms · 30 Relics (Act III)', () => {
          for (const r of ROOM_SPECS) {
            gameState.setRunSolved(r.warmup.id, true);
            gameState.setRunSolved(r.homeTwist.proto.id, true);
            for (const s of r.strays) {
              gameState.setRunSolved(s.proto.id, true);
              gameState.setItemPlaced(s.id, true);
            }
          }
          gameState.setRunSolved('clause', false);
        }),
        presetBtn('Void 5 Clauses (Ready for Loophole)', () => {
          for (const r of ROOM_SPECS) {
            gameState.setRunSolved(r.warmup.id, true);
            gameState.setRunSolved(r.homeTwist.proto.id, true);
            for (const s of r.strays) {
              gameState.setRunSolved(s.proto.id, true);
              gameState.setItemPlaced(s.id, true);
            }
          }
          for (let c = 0; c < ALL_CLAUSES.length - 1; c++) {
            gameState.setClauseVoided(c, true);
          }
          gameState.setClauseVoided(ALL_CLAUSES.length - 1, false);
        }),
        presetBtn('Unlock Everything (Act IV)', () => {
          for (const r of ROOM_SPECS) {
            gameState.setRunSolved(r.warmup.id, true);
            gameState.setRunSolved(r.homeTwist.proto.id, true);
            for (const s of r.strays) {
              gameState.setRunSolved(s.proto.id, true);
              gameState.setItemPlaced(s.id, true);
            }
          }
          gameState.setRunSolved('clause', true);
          gameState.setFreePlay(true);
        }),
      ),
    );

    const globalChecks = h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '8px',
          marginBottom: '10px',
        },
      },
      makeCheckRow(
        '🎲 Free Play on All Room Rungs',
        'Unlocks 5×5 / 7×7 / 9×9 Free Play across all 42 room runs',
        gameState.freePlayUnlocked,
        (next) => gameState.setFreePlay(next),
      ),
      makeCheckRow(
        '📜 XMAS365™ Merger Contract Solved',
        `Voids all ${ALL_CLAUSES.length} clauses (${ALL_CLAUSES.length * CLAUSE_PANEL_COUNT} puzzles · Act IV Party)`,
        gameState.solvedRuns.has('clause'),
        (next) => gameState.setRunSolved('clause', next),
      ),
    );

    const contractDone = gameState.solvedRuns.has('clause');
    const clauseCard = h(
      'div',
      {
        style: {
          padding: '10px 12px',
          borderRadius: '11px',
          background: '#fffdf9',
          border: `2px solid ${contractDone ? '#2f855a' : '#c53030'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          marginBottom: '9px',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
          },
        },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '1px' } },
          h(
            'span',
            { style: { fontWeight: '800', fontSize: '13.5px', color: '#1f2430' } },
            '📜 XMAS365™ Merger Contract Clauses (Holiday Hall)',
          ),
          h(
            'span',
            { style: { fontSize: '10.5px', fontWeight: '700', color: '#6b7280' } },
            `${gameState.runSolvedPanelCount('clause')}/${gameState.runPanelCount('clause')} puzzles solved across 6 clauses`,
          ),
        ),
        h(
          'span',
          {
            style: {
              fontSize: '11px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '999px',
              background: contractDone ? '#c6f6d5' : '#fff5f5',
              color: contractDone ? '#22543d' : '#c53030',
            },
          },
          contractDone
            ? '★ Contract Voided'
            : `${voidedClauses}/${ALL_CLAUSES.length} Clauses Voided`,
        ),
      ),
      h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
            gap: '6px',
          },
        },
        ...ALL_CLAUSES.map((clauseDef, idx) => {
          const voided = gameState.isClauseVoided(idx);
          const solvedCount = gameState.clauseSolvedPanelCount(clauseDef.genre);
          return makeCheckRow(
            `${clauseDef.icon} ${clauseDef.title}`,
            `${solvedCount}/${CLAUSE_PANEL_COUNT} puzzles · ${clauseDef.genreTitle}`,
            voided,
            (next) => gameState.setClauseVoided(idx, next),
          );
        }),
      ),
    );

    const roomCards = ROOM_SPECS.map((room) => {
      const roomDone = gameState.isRoomComplete(room);
      const restoredCount = gameState.roomRestoredRelicCount(room);
      const roomSign = gameState.getRoomSignage(room);

      const warmupDone = gameState.runSolvedPanelCount(room.warmup.id);
      const warmupTotal = gameState.runPanelCount(room.warmup.id);
      const homeTwistDone = gameState.runSolvedPanelCount(room.homeTwist.proto.id);
      const homeTwistTotal = gameState.runPanelCount(room.homeTwist.proto.id);

      return h(
        'div',
        {
          style: {
            padding: '10px 12px',
            borderRadius: '11px',
            background: '#fffdf9',
            border: `2px solid ${roomDone ? '#2f855a' : '#d8cfc0'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
            },
          },
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '1px' } },
            h(
              'span',
              { style: { fontWeight: '800', fontSize: '13.5px', color: '#1f2430' } },
              `${room.icon} ${room.title}`,
            ),
            h(
              'span',
              { style: { fontSize: '10.5px', fontWeight: '700', color: '#6b7280' } },
              roomSign.isAcquired ? `${roomSign.title} (${roomSign.subtitle})` : roomSign.subtitle,
            ),
          ),
          h(
            'span',
            {
              style: {
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '999px',
                background: roomDone ? '#c6f6d5' : '#edf2f7',
                color: roomDone ? '#22543d' : '#4a5568',
              },
            },
            roomDone ? '★ Mascot Freed & Lamp Lit' : `🔒 ${restoredCount}/5 Padlocks Open`,
          ),
        ),
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
              gap: '6px',
            },
          },
          makeCheckRow(
            `Intro Run: ${room.warmup.title}`,
            `${warmupDone}/${warmupTotal} puzzles · Unlocks Home Twist`,
            gameState.solvedRuns.has(room.warmup.id),
            (next) => gameState.setRunSolved(room.warmup.id, next),
          ),
          makeCheckRow(
            `Home Twist: ${room.homeTwist.icon} ${room.homeTwist.title}`,
            `${homeTwistDone}/${homeTwistTotal} puzzles · Unlocks 5 Relic Runs`,
            gameState.solvedRuns.has(room.homeTwist.proto.id),
            (next) => gameState.setRunSolved(room.homeTwist.proto.id, next),
          ),
          makeCheckRow(
            `★ All 5 ${room.shortTitle} Shelves Placed (Free Mascot)`,
            `${restoredCount}/5 padlocks open · Lights Hall Lamp`,
            roomDone,
            (next) => gameState.setRoomRelicsPlaced(room, next),
          ),
          ...room.strays.map((st) => {
            const stDone = gameState.runSolvedPanelCount(st.proto.id);
            const stTotal = gameState.runPanelCount(st.proto.id);
            return makeCheckRow(
              `Relic Run: ${st.icon} ${st.title}`,
              `${stDone}/${stTotal} puzzles · → ${st.homeRoom}`,
              gameState.solvedRuns.has(st.proto.id),
              (next) => gameState.setRunSolved(st.proto.id, next),
            );
          }),
          ...room.homeRelics.map((reqId, idx) => {
            const req = STRAY_ITEMS[reqId];
            return makeCheckRow(
              `Shelf ${idx + 1}: ${req.icon} ${req.title}`,
              `Found in ${req.foundIn} · Padlock ${idx + 1}/5`,
              gameState.placedItems.has(req.id),
              (next) => gameState.setItemPlaced(req.id, next),
            );
          }),
        ),
      );
    });

    const devSection = h(
      'div',
      {
        style: {
          padding: '12px 14px',
          borderRadius: '12px',
          background: '#f7f3eb',
          border: '2px solid #d8cfc0',
        },
      },
      devHeader,
      globalChecks,
      clauseCard,
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '9px' } }, ...roomCards),
    );

    bodyHost.replaceChildren(controlsSection, saveCard, devSection);
  };

  const card = h(
    'div',
    {
      class: 'puzz-modal-card',
      onclick: (e: MouseEvent) => e.stopPropagation(),
    },
    h(
      'div',
      { class: 'puzz-modal-header' },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '9px' } },
        h(
          'span',
          {
            style: {
              display: 'inline-grid',
              placeItems: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#1f2430',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #000',
              fontSize: '18px',
            },
          },
          '⚙️',
        ),
        h(
          'div',
          {},
          h(
            'div',
            {
              style: {
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#4a5568',
              },
            },
            'Holiday Hall · Options',
          ),
          h('h2', { style: { margin: '0', fontSize: '17px', lineHeight: '1.15' } }, 'Settings'),
        ),
      ),
      h(
        'button',
        {
          title: 'Close settings',
          style: {
            marginLeft: 'auto',
            flexShrink: '0',
            padding: '5px 11px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            background: '#1f2430',
            color: '#fff',
            border: '2px solid #1f2430',
            boxShadow: '0 2px 0 #1f2430',
          },
          onclick: () => closeModal(),
        },
        '✕ Close',
      ),
    ),
    bodyHost,
  );
  card.style.setProperty('--room-accent', '#1f2430');
  card.style.setProperty('--room-tint', '#f8f4ec');

  const backdrop = h(
    'div',
    {
      class: 'puzz-modal-backdrop',
      onclick: () => closeModal(),
    },
    card,
  );
  modalHost.replaceChildren(backdrop);
  renderSettingsContent();
  syncRenderLoop();
}

// 3D Raycasting + Horizontal Swipe to spin around Holiday Hall
const raycaster = new THREE.Raycaster();
raycaster.layers.enable(2);
const pointerNDC = new THREE.Vector2();
let pointerDownX = 0;
let pointerDownY = 0;

function findHotspotFromObject(obj: THREE.Object3D | null): Hotspot3D | null {
  if (!activeDiorama) return null;
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    for (const hs of activeDiorama.hotspots) {
      if (hs.meshGroup && hs.meshGroup === cur) return hs;
    }
    cur = cur.parent;
  }
  return null;
}

canvas.addEventListener('pointerdown', (e: PointerEvent) => {
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
  syncRenderLoop();
});

canvas.addEventListener('pointerup', (e: PointerEvent) => {
  if (introActive || isTransitioningBay || activeModal !== 'none' || !activeDiorama) return;
  const dx = e.clientX - pointerDownX;
  const dy = e.clientY - pointerDownY;
  if (Math.hypot(dx, dy) > 24) return;
  const rect = canvas.getBoundingClientRect();
  pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, view.camera);
  const bayMeshGroups: THREE.Object3D[] = [];
  for (const hs of activeDiorama.hotspots) {
    if (hs.bay === currentBay && hs.meshGroup) {
      bayMeshGroups.push(hs.meshGroup);
    }
  }
  const hits = raycaster.intersectObjects(bayMeshGroups, true);
  for (const hit of hits) {
    const hs = findHotspotFromObject(hit.object);
    if (hs && hs.bay === currentBay) {
      hs.onClick();
      return;
    }
  }
});

// Support ?room=<bayId> or ?p=<protoId> deep-linking
const startRoomParam = params.get('room') as BayId | null;
const startProtoId = params.get('p');

// Cold-start intro runs on launch when Show Intro on Load is enabled (unless deep-linking or ?intro=0)
introActive =
  !startRoomParam &&
  !startProtoId &&
  params.get('intro') !== '0' &&
  (isShowIntroOnLoadEnabled() || params.get('introTime') !== null);

if (startRoomParam && BAY_ORDER.includes(startRoomParam)) {
  currentBay = startRoomParam;
  camAngleTarget = getBayAngle(startRoomParam);
  camAngleCurrent = camAngleTarget;
} else if (startProtoId) {
  const matchingRoom = ROOM_SPECS.find(
    (r) =>
      r.warmup.id === startProtoId ||
      r.strays.some((s) => s.proto.id === startProtoId) ||
      r.homeTwist.proto.id === startProtoId,
  );
  if (matchingRoom) {
    currentBay = matchingRoom.id;
    camAngleTarget = getBayAngle(matchingRoom.id);
    camAngleCurrent = camAngleTarget;
  }
} else if (
  !introActive &&
  gameState.activePuzzle &&
  gameState.isValidActivePuzzle(gameState.activePuzzle)
) {
  const savedRoom = gameState.getRoomForProto(gameState.activePuzzle.protoId);
  if (savedRoom) {
    currentBay = savedRoom.id;
    camAngleTarget = getBayAngle(savedRoom.id);
    camAngleCurrent = camAngleTarget;
  }
}

function restoreSavedActivePuzzleModal(): boolean {
  const saved = gameState.activePuzzle;
  if (!saved) return false;
  if (!gameState.isValidActivePuzzle(saved)) {
    gameState.setActivePuzzle(null);
    return false;
  }
  const targetRoom = gameState.getRoomForProto(saved.protoId);
  const targetBay: BayId = targetRoom ? targetRoom.id : 'hall';
  if (currentBay !== targetBay) {
    currentBay = targetBay;
    camAngleTarget = getBayAngle(targetBay);
    camAngleCurrent = camAngleTarget;
    syncBayUIAndHotspots();
    hotspotLayer.classList.add('settled');
  }
  const hs = projectedPills.find(
    (item) =>
      item.hotspot.id === `proto:${saved.protoId}` || item.hotspot.id === `finale:${saved.protoId}`,
  )?.hotspot;
  const defaultPos = hs ? hs.cameraPos : bayToWorld(camAngleTarget, 0, 1.92, 5.15);
  const defaultLook = hs ? hs.cameraLook : bayToWorld(camAngleTarget, 0, 1.38, 0.75);
  try {
    openProtoModal(saved.protoId, defaultPos.clone(), defaultLook.clone());
    gameState.onEnterBay(currentBay);
    return true;
  } catch {
    closeModal();
    return false;
  }
}

// Build initial Holiday Hall scene
rebuildScene();

let isHandlingGameStateChange = false;
gameState.subscribe(() => {
  if (isHandlingGameStateChange || introActive) return;
  isHandlingGameStateChange = true;
  try {
    if (activeModal === 'proto' && activeProtoId === 'clause') {
      if (!activeProtoWasSolvedOnOpen && gameState.solvedRuns.has('clause')) {
        activeProtoWasSolvedOnOpen = true;
        clearContractOverlayBeats();
        closeModal();
        if (currentBay !== 'hall') {
          switchBay('hall', { instant: true });
        } else {
          rebuildScene();
        }
        return;
      }
      activeDiorama?.syncState();
      if (!isRenderLoopRunning && !introActive) {
        renderStaticSceneFrame();
      }
      renderActiveStoryBeat();
    }
  } finally {
    isHandlingGameStateChange = false;
  }
});

if (startProtoId) {
  const hs = projectedPills.find(
    (item) =>
      item.hotspot.id === `proto:${startProtoId}` || item.hotspot.id === `finale:${startProtoId}`,
  )?.hotspot;
  const defaultPos = hs ? hs.cameraPos : bayToWorld(camAngleTarget, 0, 1.92, 5.15);
  const defaultLook = hs ? hs.cameraLook : bayToWorld(camAngleTarget, 0, 1.38, 0.75);
  openProtoModal(startProtoId, defaultPos.clone(), defaultLook.clone());
} else if (!introActive && !startRoomParam) {
  restoreSavedActivePuzzleModal();
}

// --- COLD-START 3D INTRO CINEMATIC (`intro_cinematic.md`) ---
type IntroStage = 'none' | 'cinematic' | 'fading_out';
let introStage: IntroStage = 'none';
const activeIntroCinematic: BuiltIntroCinematic = buildIntroCinematic();
let introStartTime: number | null = null;
let introSteadyFrames = 0;
let introPrecompiled = false;
let introSceneMounted = false;

// DOM elements for the letterbox, caption, and hold-to-skip indicator
let letterboxTopEl: HTMLElement | null = null;
let letterboxBotEl: HTMLElement | null = null;
let captionWrapEl: HTMLElement | null = null;
let captionTextEl: HTMLElement | null = null;
let titlePromptEl: HTMLElement | null = null;
let holdSkipPillEl: HTMLElement | null = null;
let holdSkipFillEl: HTMLElement | null = null;
let holdPointerDownAt: number | null = null;

const CAPTION_FULL_TEXT = 'Huh. Missed a spot.';

function cleanupIntroCinematicScene(): void {
  introSceneMounted = false;
}

function finishIntro(): void {
  if (!introActive || introStage === 'fading_out') return;
  holdPointerDownAt = null;
  gameState.markIntroSeen();

  // Close the letterbox bars over the 3D intro scene, then fade open into Holiday Hall
  introStage = 'fading_out';
  if (captionWrapEl) captionWrapEl.style.opacity = '0';
  if (titlePromptEl) titlePromptEl.style.opacity = '0';
  if (holdSkipPillEl) holdSkipPillEl.style.opacity = '0';
  if (letterboxTopEl) letterboxTopEl.style.height = '50%';
  if (letterboxBotEl) letterboxBotEl.style.height = '50%';

  window.setTimeout(() => {
    cleanupIntroCinematicScene();
    introActive = false;
    activeDiorama?.setIntroPose('idle', 0);
    topBar.style.display = 'flex';
    bottomStack.style.display = 'flex';
    restoreSavedActivePuzzleModal();
    renderTopBar();
    renderCarryTray();
    renderSideArrows();
    layoutStableHotspots();
    hotspotLayer.classList.add('settled');
    if (activeModal === 'none') {
      hotspotLayer.style.display = '';
      sideArrowsHost.style.display = '';
    } else {
      hotspotLayer.style.display = 'none';
      sideArrowsHost.style.display = 'none';
    }
    syncRenderLoop(true);

    const fadeWrapper = introHost.firstElementChild as HTMLElement | null;
    if (fadeWrapper) {
      fadeWrapper.style.transition = 'opacity 420ms ease';
      fadeWrapper.style.opacity = '0';
      fadeWrapper.style.pointerEvents = 'none';
    }

    window.setTimeout(() => {
      introStage = 'none';
      introHost.replaceChildren();
      introHost.style.display = 'none';
      syncRenderLoop();
      // Wait ~0.5s for Holiday Hall & Leap Day on the rug to register before opening P1
      window.setTimeout(() => {
        gameState.onEnterBay(currentBay);
        renderTopBar();
        renderCarryTray();
        renderActiveStoryBeat();
      }, 500);
    }, 420);
  }, 380);
}

function mountCinematicStageDOM(): void {
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  topBar.style.display = 'none';
  bottomStack.style.display = 'none';
  storyBannerHost.replaceChildren();
  leapBubbleHost.replaceChildren();
  hideMemoOverlay();
  introHost.style.display = 'block';

  introSceneMounted = true;
  if (!introPrecompiled) {
    introPrecompiled = true;
    view.renderer.compile(view.scene, view.camera);
    activeIntroCinematic.precompile(view);
  }

  introStage = 'cinematic';
  introStartTime = null;
  introSteadyFrames = 0;
  holdPointerDownAt = null;

  letterboxTopEl = h('div', {
    style: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      height: 'min(78px, 11.5%)',
      background: '#0d0907',
      transform: 'translateY(-100%)',
      transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms ease',
      zIndex: '2',
    },
  });

  captionTextEl = h(
    'div',
    {
      style: {
        fontSize: 'clamp(16px, 4.4vw, 20px)',
        fontWeight: '700',
        color: '#ffffff',
        textShadow: '0 2px 6px rgba(0, 0, 0, 0.85)',
        minHeight: '1.35em',
        marginTop: '2px',
      },
    },
    '',
  );

  captionWrapEl = h(
    'div',
    {
      style: {
        textAlign: 'center',
        opacity: '0',
        transition: 'opacity 220ms ease',
        padding: '0 16px',
      },
    },
    h(
      'div',
      {
        style: {
          fontSize: '11px',
          fontWeight: '900',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#facc15',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)',
        },
      },
      'LEAP DAY',
    ),
    captionTextEl,
  );

  titlePromptEl = h(
    'div',
    {
      style: {
        position: 'absolute',
        fontSize: '12px',
        fontWeight: '800',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255, 253, 247, 0.85)',
        opacity: '0',
        transition: 'opacity 320ms ease',
        pointerEvents: 'none',
      },
    },
    'Tap to continue',
  );

  letterboxBotEl = h(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: 'min(96px, 14%)',
        background: '#0d0907',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translateY(100%)',
        transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), height 380ms ease',
        zIndex: '2',
      },
    },
    captionWrapEl,
    titlePromptEl,
  );

  holdSkipFillEl = h('div', {
    style: {
      height: '100%',
      width: '0%',
      background: '#facc15',
      borderRadius: '999px',
    },
  });

  holdSkipPillEl = h(
    'div',
    {
      style: {
        position: 'absolute',
        top: 'calc(14px + env(safe-area-inset-top))',
        right: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '6px 11px',
        borderRadius: '10px',
        background: 'rgba(15, 12, 10, 0.82)',
        border: '1.5px solid rgba(255, 255, 255, 0.22)',
        color: '#fdf8ec',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '0.04em',
        opacity: '0',
        transition: 'opacity 140ms ease',
        pointerEvents: 'none',
        zIndex: '5',
      },
    },
    h('div', {}, 'Hold to skip'),
    h(
      'div',
      {
        style: {
          width: '84px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '999px',
          overflow: 'hidden',
        },
      },
      holdSkipFillEl,
    ),
  );

  const stageWrapper = h(
    'div',
    {
      class: 'interactive',
      style: {
        position: 'fixed',
        inset: '0',
        overflow: 'hidden',
        userSelect: 'none',
        webkitUserSelect: 'none',
        touchAction: 'none',
        pointerEvents: 'auto',
      },
      onpointerdown: (e: PointerEvent) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        if (introStartTime !== null) {
          const elapsed = (performance.now() - introStartTime) / 1000;
          if (elapsed >= 21.6) {
            finishIntro();
            return;
          }
        }
        holdPointerDownAt = performance.now();
        if (holdSkipPillEl) holdSkipPillEl.style.opacity = '1';
      },
      onpointerup: () => {
        holdPointerDownAt = null;
        if (holdSkipPillEl) holdSkipPillEl.style.opacity = '0';
        if (holdSkipFillEl) holdSkipFillEl.style.width = '0%';
      },
      onpointercancel: () => {
        holdPointerDownAt = null;
        if (holdSkipPillEl) holdSkipPillEl.style.opacity = '0';
        if (holdSkipFillEl) holdSkipFillEl.style.width = '0%';
      },
      onpointerleave: () => {
        holdPointerDownAt = null;
        if (holdSkipPillEl) holdSkipPillEl.style.opacity = '0';
        if (holdSkipFillEl) holdSkipFillEl.style.width = '0%';
      },
    },
    letterboxTopEl,
    letterboxBotEl,
    holdSkipPillEl,
  );

  introHost.replaceChildren(stageWrapper);
}

function updateIntroCinematic(now: number): void {
  if (!introActive) return;
  if (introStage === 'fading_out' || introStage === 'none') return;

  // Check 1-second hold-to-skip
  if (holdPointerDownAt !== null) {
    const heldMs = now - holdPointerDownAt;
    const pct = Math.min(100, (heldMs / 1000) * 100);
    if (holdSkipFillEl) holdSkipFillEl.style.width = `${pct.toFixed(1)}%`;
    if (heldMs >= 1000) {
      finishIntro();
      return;
    }
  }

  // Wait for 2 steady animation frames after mounting before starting the timeline clock
  if (introStartTime === null) {
    introSteadyFrames++;
    activeIntroCinematic?.update(0, view);
    if (introSteadyFrames >= 2) {
      introStartTime = now;
      if (letterboxTopEl) letterboxTopEl.style.transform = 'translateY(0)';
      if (letterboxBotEl) letterboxBotEl.style.transform = 'translateY(0)';
    }
    return;
  }

  const elapsed =
    params.get('introTime') !== null
      ? Number(params.get('introTime'))
      : (now - introStartTime) / 1000;

  activeIntroCinematic?.update(elapsed, view);

  if (elapsed < 21.0) {
    // Shot 10 (18.2–21.0s): After panning to Leap Day and pausing (16.4–18.2s), type out caption
    if (elapsed >= 18.2 && captionWrapEl && captionTextEl) {
      captionWrapEl.style.opacity = '1';
      const charCount = Math.min(
        CAPTION_FULL_TEXT.length,
        Math.floor(((elapsed - 18.25) / 1.25) * CAPTION_FULL_TEXT.length),
      );
      const nextText = CAPTION_FULL_TEXT.slice(0, Math.max(0, charCount));
      if (captionTextEl.textContent !== nextText) {
        captionTextEl.textContent = nextText;
      }
    }
  } else {
    // At 21.0s+: Pan back up from Leap Day to the wide wrapped XMAS365™ calendar view
    if (captionWrapEl) captionWrapEl.style.opacity = '0';
    if (elapsed >= 23.4 && titlePromptEl && titlePromptEl.style.opacity === '0') {
      titlePromptEl.style.opacity = '1';
    }
    if (elapsed >= 27.0) {
      finishIntro();
    }
  }
}

if (introActive) {
  mountCinematicStageDOM();
}

function renderStaticSceneFrame(): void {
  const w = Math.max(1, view.canvas.clientWidth);
  const hPx = Math.max(1, view.canvas.clientHeight);
  syncCameraFov(w, hPx);

  if (activeDiorama) {
    activeDiorama.animate(performance.now() / 1000, currentBay);
  }

  const mood = getBayLightMood(currentBay);
  targetLitColor.setRGB(mood.litTint[0], mood.litTint[1], mood.litTint[2]);
  targetShadeColor.setRGB(mood.shadeTint[0], mood.shadeTint[1], mood.shadeTint[2]);
  celUniforms.celLitTint.value.copy(targetLitColor);
  celUniforms.celShadeTint.value.copy(targetShadeColor);
  celUniforms.celShadeGamma.value = mood.shadeGamma;

  camAngleCurrent = camAngleTarget;
  const overviewPos = bayToWorld(camAngleCurrent, 0, 1.92, 5.15);
  const overviewLook = bayToWorld(camAngleCurrent, 0, 1.38, 0.75);

  if (isCameraFocused) {
    camPosCurrent.copy(focusPosTarget);
    camLookCurrent.copy(focusLookTarget);
  } else {
    camPosCurrent.copy(overviewPos);
    camLookCurrent.copy(overviewLook);
  }
  view.camera.position.copy(camPosCurrent);
  view.camera.lookAt(camLookCurrent);
  view.camera.updateMatrixWorld();

  view.render();
}

function onAnimationFrame(now: number): void {
  if (activeModal !== 'none' && modalHost.childElementCount === 0) {
    closeModal();
  }
  fpsFrameCount++;
  const elapsedMs = now - fpsSampleStart;
  if (elapsedMs >= 166) {
    if (isFpsEnabled()) {
      const fps = Math.round((fpsFrameCount * 1000) / elapsedMs);
      fpsBadge.textContent = `${fps} FPS`;
      fpsBadge.style.color = fps >= 50 ? '#68d391' : fps >= 30 ? '#f6e05e' : '#fc8181';
    }
    fpsFrameCount = 0;
    fpsSampleStart = now;
  }

  // Guarantee horizontal FOV on mobile portrait so dioramas never clip off the sides
  const w = Math.max(1, view.canvas.clientWidth);
  const hPx = Math.max(1, view.canvas.clientHeight);
  syncCameraFov(w, hPx);

  if (introActive) {
    updateIntroCinematic(now);
    if (introSceneMounted) {
      view.render(activeIntroCinematic.scene);
      return;
    }
  }

  const t = now / 1000;
  if (activeDiorama) {
    activeDiorama.animate(t, currentBay);
  }

  if (w !== lastLayoutW || hPx !== lastLayoutH) {
    layoutStableHotspots();
  }

  camAngleCurrent = camAngleTarget;
  if (!introActive && !isTransitioningBay && activeModal === 'none') {
    if (!hotspotLayer.classList.contains('settled')) {
      hotspotLayer.classList.add('settled');
    }
  }

  // Smoothly transition cel shading tints for the active bay's practical lighting mood
  const mood = getBayLightMood(currentBay);
  targetLitColor.setRGB(mood.litTint[0], mood.litTint[1], mood.litTint[2]);
  targetShadeColor.setRGB(mood.shadeTint[0], mood.shadeTint[1], mood.shadeTint[2]);
  celUniforms.celLitTint.value.lerp(targetLitColor, 0.15);
  celUniforms.celShadeTint.value.lerp(targetShadeColor, 0.15);
  celUniforms.celShadeGamma.value += (mood.shadeGamma - celUniforms.celShadeGamma.value) * 0.15;

  const overviewPos = bayToWorld(camAngleCurrent, 0, 1.92, 5.15);
  const overviewLook = bayToWorld(camAngleCurrent, 0, 1.38, 0.75);

  if (isCameraFocused) {
    camPosCurrent.lerp(focusPosTarget, 0.16);
    camLookCurrent.lerp(focusLookTarget, 0.16);
  } else {
    camPosCurrent.copy(overviewPos);
    camLookCurrent.copy(overviewLook);
  }
  view.camera.position.copy(camPosCurrent);
  view.camera.lookAt(camLookCurrent);
  view.camera.updateMatrixWorld();

  view.render();
}

function shouldPause3D(): boolean {
  return (
    !introActive &&
    !isTransitioningBay &&
    activeModal === 'proto' &&
    modalHost.childElementCount > 0
  );
}

function syncRenderLoop(forceStaticRender = false): void {
  if (shouldPause3D()) {
    if (forceStaticRender || isRenderLoopRunning) {
      renderStaticSceneFrame();
    }
    if (isRenderLoopRunning) {
      isRenderLoopRunning = false;
      view.renderer.setAnimationLoop(null);
    }
    if (isFpsEnabled()) {
      fpsBadge.textContent = '3D PAUSED';
      fpsBadge.style.color = '#a0aec0';
    }
  } else if (!isRenderLoopRunning) {
    isRenderLoopRunning = true;
    fpsFrameCount = 0;
    fpsSampleStart = performance.now();
    view.renderer.setAnimationLoop(onAnimationFrame);
  }
}

new MutationObserver(() => {
  if (modalHost.childElementCount === 0 && activeModal !== 'none') {
    if (activeModal === 'proto') {
      gameState.setActivePuzzle(null);
    }
    activeModal = 'none';
    activeProtoId = null;
    activeProtoWasSolvedOnOpen = false;
    isCameraFocused = false;
    hotspotLayer.style.display = '';
    sideArrowsHost.style.display = '';
  }
  syncRenderLoop();
}).observe(modalHost, { childList: true });

window.addEventListener('resize', () => {
  if (!isRenderLoopRunning && !introActive) {
    renderStaticSceneFrame();
  }
});
window.addEventListener('focus', () => syncRenderLoop());
window.addEventListener('pageshow', () => syncRenderLoop());
document.addEventListener('visibilitychange', () => syncRenderLoop());

syncRenderLoop();

// Dev builds expose the view and gameState for debugging from the console.
if (import.meta.env.DEV) Object.assign(window, { view, gameState });
