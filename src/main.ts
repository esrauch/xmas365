/**
 * The entry point for Puzz: Holiday Hall — a single 3D cel-shaded toy-theatre
 * rotunda where the central Tuesday Finale & Calendar Desk bay and all six
 * Holiday Alcoves live around the perimeter of the same room.
 *
 * Rotating between holidays pans around Holiday Hall in 3D, with horizontal-FOV
 * compensation and vertically tiered alcoves tailored for mobile portrait.
 */
import * as THREE from 'three';
import { common, hexToNumber } from './content/palettes';
import {
  type BeatId,
  type DialogueLine,
  MEMOS,
  MEMO_ORDER,
  type MemoId,
  ROOM_SCRIPT,
  SPEAKERS,
  formatMemoText,
  getBeatSpec,
} from './content/script';
import { installErrorOverlay } from './dev/errorOverlay';
import { mountCalendarDesk } from './game/calendarDesk';
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
import { FINALE_PROTO, ROOM_SPECS, type RoomSpec, STRAY_ITEMS, gameState } from './game/state';
import { type Proto, blip, h } from './proto/kit';
import { PROTOS } from './proto/puzzles';
import { celUniforms } from './render/toon';
import { View } from './render/view';
import { isFpsEnabled, isSoundEnabled, setFpsEnabled, setSoundEnabled } from './settings';
import { buildMemoSheet, renderFormattedText, showMemoOverlay } from './ui/memo';
import { applyPaletteVars } from './ui/paletteVars';

if (import.meta.env.DEV) installErrorOverlay();

applyPaletteVars();
document.body.style.setProperty('--backdrop', common.backdrop);

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const ui = document.querySelector<HTMLDivElement>('#ui');
if (!canvas || !ui) throw new Error('index.html is missing #game or #ui');

// ?outline=0 turns off the cel line art.
const params = new URLSearchParams(location.search);
const view = new View(canvas, { fov: 40, outline: params.get('outline') !== '0' });

// Scene state: all 7 bays live in one Holiday Hall diorama
let currentBay: BayId = 'hall';
let activeDiorama: BuiltDiorama | null = null;
let activeModal: 'none' | 'proto' | 'desk' | 'corkboard' | 'settings' = 'none';

// Circular camera rotation around Holiday Hall + focus targets
let camAngleTarget = getBayAngle('hall');
let camAngleCurrent = camAngleTarget;
let isCameraFocused = false;
const focusPosTarget = new THREE.Vector3();
const focusLookTarget = new THREE.Vector3();
const camPosCurrent = bayToWorld(0, 0, 2.0, 5.15);
const camLookCurrent = bayToWorld(0, 0, 1.35, 0.7);

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
    width: 'min(540px, 95vw)',
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

/** Cold-start calendar-stamping & Tap to Start overlay. */
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

function hideMemoOverlay(): void {
  shownMemoBeatId = null;
  memoHost.replaceChildren();
}

function positionLeapBubbleElement(bubbleWrap: HTMLElement): void {
  const w = Math.max(1, window.innerWidth);
  const hPx = Math.max(1, window.innerHeight);
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

/**
 * Render the front beat from `gameState.beatQueue` into `storyBannerHost`
 * (or directly over Leap Day in `leapBubbleHost` when Leap Day speaks in Holiday Hall).
 * Per `SCRIPT.md`, beats never sit in front of an open puzzle panel.
 */
function renderActiveStoryBeat(): void {
  if (activeModal === 'proto') {
    storyBannerHost.replaceChildren();
    leapBubbleHost.replaceChildren();
    hideMemoOverlay();
    return;
  }
  const beatId = gameState.currentBeat();
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
      hasMore ? 'Next ▸' : '📌 Pin it to the corkboard',
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
        pointerEvents: 'auto',
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
      h(
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

  // When Leap Day speaks in Holiday Hall (such as P2 right after closing the All-Hands Memo),
  // anchor the speech bubble directly to Leap Day's 3D mascot!
  if (currentBay === 'hall' && line.speaker === 'leapday') {
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
          width: 'min(340px, 92vw)',
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
      : '🏛️ Holiday Hall · An Xmas365 Synergized Campus';

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
        title: `Misfiled Asset · Belongs in ${homeLabel}`,
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
    h('span', { style: { fontSize: '11px', fontWeight: '800' } }, '🏷️ MISFILED ASSET:'),
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
        const slotTitle = hs.label.startsWith(`${hs.icon} `)
          ? hs.label.slice(hs.icon.length + 1)
          : hs.label;
        const el = h(
          hs.status === 'place' ? 'button' : 'div',
          {
            class: `ladder-return-slot ${hs.status}`,
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
            h('span', { style: { fontWeight: '800', fontSize: '10.5px' } }, slotTitle),
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
  const w = Math.max(1, window.innerWidth);
  const hPx = Math.max(1, window.innerHeight);
  lastLayoutW = w;
  lastLayoutH = hPx;
  syncCameraFov(w, hPx);

  stableCam.fov = view.camera.fov;
  stableCam.aspect = w / hPx;
  stableCam.updateProjectionMatrix();
  stableCam.position.copy(bayToWorld(camAngleTarget, 0, 1.92, 5.15));
  stableCam.lookAt(bayToWorld(camAngleTarget, 0, 1.38, 0.75));
  stableCam.updateMatrixWorld();

  const padX = currentBay === 'hall' ? Math.min(60, w * 0.16) : Math.min(76, w * 0.2);
  const topBarBottom = topBar.getBoundingClientRect().bottom;
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

function rebuildScene(): void {
  if (activeDiorama) {
    view.scene.remove(activeDiorama.root);
  }

  activeDiorama = buildHolidayHallDiorama({
    onSelectBay: (bay) => switchBay(bay),
    onOpenProto: (protoId, focusPos, focusLook) => openProtoModal(protoId, focusPos, focusLook),
    onOpenDesk: (focusPos, focusLook) => openCalendarDeskModal(focusPos, focusLook),
    onShowStory: () => openCorkboardModal(),
    onOpenCorkboard: () => openCorkboardModal(),
    onClickMascot: (roomId) => {
      const room = ROOM_SPECS.find((r) => r.id === roomId);
      if (!room) return;
      const script = ROOM_SCRIPT[roomId];
      const beatId = gameState.isRoomComplete(room) ? script.freedBeatId : script.cagedBeatId;
      blip(587, 55);
      gameState.enqueueBeat(beatId, true);
      renderActiveStoryBeat();
    },
    onPlaceItem: (itemId) => placeItemOnPedestal(itemId),
  });

  view.scene.add(activeDiorama.root);
  buildHotspotDOM(activeDiorama.hotspots);
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

function switchBay(bay: BayId, opts?: { instant?: boolean }): void {
  if (isTransitioningBay && !opts?.instant) return;
  closeModal();

  if (opts?.instant || bay === currentBay) {
    currentBay = bay;
    camAngleTarget = getBayAngle(bay);
    camAngleCurrent = camAngleTarget;
    rebuildScene();
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
    window.setTimeout(() => blip(587, 65), 140);

    const hopDurationMs = 420;
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
    }, 270);

    window.setTimeout(() => {
      if (unlockItem) {
        blip(659, 90);
        gameState.placeItem(unlockItem.id);
      }
      currentBay = bay;
      camAngleTarget = getBayAngle(bay);
      camAngleCurrent = camAngleTarget;
      activeDiorama?.setDoorHop(null, 0);
      rebuildScene();
      hotspotLayer.classList.add('settled');
      fadeOverlay.style.opacity = '0';
      fadeOverlay.style.pointerEvents = 'none';
      window.setTimeout(() => {
        isTransitioningBay = false;
      }, 220);
    }, 500);
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
    rebuildScene();
    hotspotLayer.classList.add('settled');
    fadeOverlay.style.opacity = '0';
    fadeOverlay.style.pointerEvents = 'none';
    window.setTimeout(() => {
      isTransitioningBay = false;
    }, 220);
  }, 220);
}

function closeModal(): void {
  activeModal = 'none';
  isCameraFocused = false;
  modalHost.replaceChildren();
  hotspotLayer.style.display = '';
  sideArrowsHost.style.display = '';
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

function showUnlockDialog(roomSpec: RoomSpec, kind: 'warm-up' | 'centerpiece'): void {
  const isWarmup = kind === 'warm-up';
  const titleText = isWarmup
    ? `${roomSpec.icon} ${roomSpec.genreLabel} Unlocked at Calendar Desk!`
    : `${roomSpec.icon} All ${roomSpec.genreLabel} Twists Unlocked!`;
  const detailText = isWarmup
    ? `Beating the ${roomSpec.shortTitle} Warm-up (${roomSpec.warmup.title}) unlocked both the Warm-up replay and the Standard (No-Twist) ${roomSpec.genreLabel} generator at Leap Day's Calendar Desk!`
    : `Beating the ${roomSpec.shortTitle} Centerpiece (${roomSpec.centerpiece.title}) unlocked all 6 holiday twists for ${roomSpec.genreLabel} at Leap Day's Calendar Desk!`;

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
          width: 'min(420px, 92vw)',
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
              padding: '8px 16px',
              borderRadius: '999px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              background: '#805ad5',
              color: '#fff',
              border: '2px solid #1f2430',
              boxShadow: '0 2px 0 #1f2430',
            },
            onclick: () => {
              overlay.remove();
              switchBay('hall');
              openCalendarDeskModal();
            },
          },
          '📅 Open Calendar Desk',
        ),
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

function openProtoModal(protoId: string, focusPos: THREE.Vector3, focusLook: THREE.Vector3): void {
  const proto: Proto | undefined =
    protoId === 'tuesday' ? FINALE_PROTO : PROTOS.find((p) => p.id === protoId);
  if (!proto) return;

  if (protoId === 'tuesday') {
    gameState.enqueueBeat('C0');
  }

  activeModal = 'proto';
  storyBannerHost.replaceChildren();
  hideMemoOverlay();
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  isCameraFocused = true;
  focusPosTarget.copy(focusPos);
  focusLookTarget.copy(focusLook);

  // Match the puzzle frame theme to the room where this puzzle lives
  const roomSpec = ROOM_SPECS.find(
    (r) =>
      r.warmup.id === proto.id ||
      r.strays.some((s) => s.proto.id === proto.id) ||
      r.centerpiece.proto.id === proto.id,
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
        rebuildScene();
        hotspotLayer.style.display = 'none';
        sideArrowsHost.style.display = 'none';
        if (
          !wasAlreadySolved &&
          roomSpec &&
          (proto.kind === 'warm-up' || proto.kind === 'centerpiece')
        ) {
          wasAlreadySolved = true;
          showUnlockDialog(roomSpec, proto.kind);
        }

        const homeRoom = strayEntry
          ? ROOM_SPECS.find((r) => r.id === strayEntry.homeRoom)
          : undefined;

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
                : `🎉 ${proto.title} Complete!`,
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              strayEntry && homeRoom
                ? h(
                    'button',
                    {
                      style: {
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: homeRoom.accent,
                        color: '#fff',
                        border: '2px solid #1f2430',
                        boxShadow: '0 2px 0 #1f2430',
                      },
                      onclick: () => switchBay('hall'),
                    },
                    '← Return to Holiday Hall ▸',
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
}

function openCalendarDeskModal(
  focusPos = bayToWorld(getBayAngle('hall'), 0.5, 1.9, 3.7),
  focusLook = bayToWorld(getBayAngle('hall'), 0.82, 0.8, 1.15),
): void {
  activeModal = 'desk';
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  isCameraFocused = true;
  focusPosTarget.copy(focusPos);
  focusLookTarget.copy(focusLook);

  const deskBody = h('div', { class: 'puzz-modal-body' });
  const card = h(
    'div',
    {
      class: 'puzz-modal-card',
      onclick: (e: MouseEvent) => e.stopPropagation(),
    },
    deskBody,
  );
  card.style.setProperty('--room-accent', '#805ad5');
  card.style.setProperty('--room-tint', '#f5f0ff');
  const backdrop = h(
    'div',
    {
      class: 'puzz-modal-backdrop',
      onclick: () => closeModal(),
    },
    card,
  );
  modalHost.replaceChildren(backdrop);
  mountCalendarDesk(deskBody, () => {
    closeModal();
    rebuildScene();
  });
}

function openCorkboardModal(initialMemoId?: MemoId): void {
  activeModal = 'corkboard';
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
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
          '📌',
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
            `Holiday Hall · ${pinnedSpecs.length}/${MEMO_ORDER.length} Pinned`,
          ),
          h(
            'h2',
            { style: { margin: '0', fontSize: '17px', lineHeight: '1.15' } },
            'Hall Corkboard · Xmas365 Memos',
          ),
        ),
      ),
      h(
        'button',
        {
          title: 'Close corkboard',
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
}

function openSettingsModal(): void {
  activeModal = 'settings';
  hotspotLayer.style.display = 'none';
  sideArrowsHost.style.display = 'none';
  isCameraFocused = false;

  let confirmReset = false;
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
    const act = gameState.act();
    const lamps = gameState.completedRoomCount();

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
          marginBottom: '14px',
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
          `📌 Hall Corkboard (${gameState.pinnedMemos.size}/${MEMO_ORDER.length} Memos)`,
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
            gameState.resetAll();
            blip(330, 90);
            syncSceneBehindModal();
            renderSettingsContent();
          },
        },
        confirmReset ? '⚠️ Tap Again to Confirm Reset' : '🗑️ Reset All Progress',
      ),
    );

    // 2. Developer Panel: Global Checkboxes + Quick Presets + 6 Holiday Room Matrices
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
          '🛠️ Developer Panel',
        ),
        h(
          'div',
          { style: { fontSize: '14px', fontWeight: '800', color: '#1f2430' } },
          `Unlock & Completion States (Act ${act} · ★ ${lamps}/6 Lamps)`,
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
        presetBtn('Unlock All Warm-ups', () => {
          for (const r of ROOM_SPECS) gameState.setRunSolved(r.warmup.id, true);
        }),
        presetBtn('Free & Place All Strays', () => {
          for (const r of ROOM_SPECS) {
            gameState.setRunSolved(r.warmup.id, true);
            for (const s of r.strays) {
              gameState.setRunSolved(s.proto.id, true);
              gameState.setItemPlaced(s.id, true);
            }
          }
        }),
        presetBtn('Complete All 6 Rooms', () => {
          for (const r of ROOM_SPECS) {
            gameState.setRunSolved(r.warmup.id, true);
            for (const s of r.strays) {
              gameState.setRunSolved(s.proto.id, true);
              gameState.setItemPlaced(s.id, true);
            }
            gameState.setRunSolved(r.centerpiece.proto.id, true);
          }
        }),
        presetBtn('Unlock Everything (Act IV)', () => {
          for (const r of ROOM_SPECS) {
            gameState.setRunSolved(r.warmup.id, true);
            for (const s of r.strays) {
              gameState.setRunSolved(s.proto.id, true);
              gameState.setItemPlaced(s.id, true);
            }
            gameState.setRunSolved(r.centerpiece.proto.id, true);
          }
          gameState.setRunSolved('tuesday', true);
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
          marginBottom: '12px',
        },
      },
      makeCheckRow(
        '📅 Free Play / Custom Mixer',
        'Unlocks Custom Twist Mixer at Calendar Desk',
        gameState.freePlayUnlocked,
        (next) => gameState.setFreePlay(next),
      ),
      makeCheckRow(
        '📜 Xmas365 Merger Contract Solved',
        'Completes Grand Finale Door (Act IV)',
        gameState.solvedRuns.has('tuesday'),
        (next) => gameState.setRunSolved('tuesday', next),
      ),
    );

    const roomCards = ROOM_SPECS.map((room) => {
      const req0 = STRAY_ITEMS[room.centerpiece.requiredItems[0]];
      const req1 = STRAY_ITEMS[room.centerpiece.requiredItems[1]];
      const roomDone = gameState.isRoomComplete(room);
      const roomSign = gameState.getRoomSignage(room);

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
            roomDone ? '★ Lamp Lit' : 'Lamp Unlit',
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
            `Warm-up: ${room.warmup.title}`,
            'Unlocks room strays',
            gameState.solvedRuns.has(room.warmup.id),
            (next) => gameState.setRunSolved(room.warmup.id, next),
          ),
          makeCheckRow(
            `Stray Freed: ${room.strays[0].icon} ${room.strays[0].title}`,
            `Found in ${room.shortTitle}`,
            gameState.solvedRuns.has(room.strays[0].proto.id),
            (next) => gameState.setRunSolved(room.strays[0].proto.id, next),
          ),
          makeCheckRow(
            `Stray Freed: ${room.strays[1].icon} ${room.strays[1].title}`,
            `Found in ${room.shortTitle}`,
            gameState.solvedRuns.has(room.strays[1].proto.id),
            (next) => gameState.setRunSolved(room.strays[1].proto.id, next),
          ),
          makeCheckRow(
            `Pedestal 1: ${req0.icon} ${req0.title}`,
            `Placed in ${room.shortTitle}`,
            gameState.placedItems.has(req0.id),
            (next) => gameState.setItemPlaced(req0.id, next),
          ),
          makeCheckRow(
            `Pedestal 2: ${req1.icon} ${req1.title}`,
            `Placed in ${room.shortTitle}`,
            gameState.placedItems.has(req1.id),
            (next) => gameState.setItemPlaced(req1.id, next),
          ),
          makeCheckRow(
            `Centerpiece: ${room.centerpiece.icon} ${room.centerpiece.title}`,
            'Lights room Master Lamp',
            gameState.solvedRuns.has(room.centerpiece.proto.id),
            (next) => gameState.setRunSolved(room.centerpiece.proto.id, next),
          ),
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
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '9px' } }, ...roomCards),
    );

    bodyHost.replaceChildren(controlsSection, devSection);
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
}

// 3D Raycasting + Horizontal Swipe to spin around Holiday Hall
const raycaster = new THREE.Raycaster();
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
  const hits = raycaster.intersectObjects(activeDiorama.root.children, true);
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

// Cold-start intro runs on normal launch unless deep-linking into a room/puzzle or ?intro=0
introActive = !startRoomParam && !startProtoId && params.get('intro') !== '0';

if (startRoomParam && BAY_ORDER.includes(startRoomParam)) {
  currentBay = startRoomParam;
  camAngleTarget = getBayAngle(startRoomParam);
  camAngleCurrent = camAngleTarget;
} else if (startProtoId) {
  const matchingRoom = ROOM_SPECS.find(
    (r) =>
      r.warmup.id === startProtoId ||
      r.strays.some((s) => s.proto.id === startProtoId) ||
      r.centerpiece.proto.id === startProtoId,
  );
  if (matchingRoom) {
    currentBay = matchingRoom.id;
    camAngleTarget = getBayAngle(matchingRoom.id);
    camAngleCurrent = camAngleTarget;
  }
}

// Build initial Holiday Hall scene
rebuildScene();

if (startProtoId) {
  openProtoModal(startProtoId, camPosCurrent.clone(), camLookCurrent.clone());
}

// --- COLD-START INTRO CINEMATIC (<10s) & TAP TO START ---
const INTRO_MONTHS: readonly { short: string; full: string; days: string }[] = [
  { short: 'JAN', full: 'JANUARY', days: 'DAYS 001 - 031' },
  { short: 'FEB', full: 'FEBRUARY', days: 'DAYS 032 - 059' },
  { short: 'MAR', full: 'MARCH', days: 'DAYS 060 - 090' },
  { short: 'APR', full: 'APRIL', days: 'DAYS 091 - 120' },
  { short: 'MAY', full: 'MAY', days: 'DAYS 121 - 151' },
  { short: 'JUN', full: 'JUNE', days: 'DAYS 152 - 181' },
  { short: 'JUL', full: 'JULY', days: 'DAYS 182 - 212' },
  { short: 'AUG', full: 'AUGUST', days: 'DAYS 213 - 243' },
  { short: 'SEP', full: 'SEPTEMBER', days: 'DAYS 244 - 273' },
  { short: 'OCT', full: 'OCTOBER', days: 'DAYS 274 - 304' },
  { short: 'NOV', full: 'NOVEMBER', days: 'DAYS 305 - 334' },
  { short: 'DEC', full: 'DECEMBER', days: 'DAYS 335 - 365' },
];

let introStartTime: number | null = null;
let lastStampedMonthIdx = -1;
let introPopTriggered = false;
let introCalCardEl: HTMLElement | null = null;
let introMonthTitleEl: HTMLElement | null = null;
let introDaysCounterEl: HTMLElement | null = null;
let introMonthCells: HTMLElement[] = [];
let introBigStampEl: HTMLElement | null = null;
let introSlipEl: HTMLElement | null = null;
let introTapBtnEl: HTMLElement | null = null;
let introSubheadEl: HTMLElement | null = null;

function finishIntro(): void {
  if (!introActive) return;
  introActive = false;
  blip(587, 65);
  introHost.replaceChildren();
  introHost.style.display = 'none';
  activeDiorama?.setIntroPose('idle', 0);
  hotspotLayer.style.display = '';
  topBar.style.display = 'flex';
  bottomStack.style.display = 'flex';
  gameState.onEnterBay(currentBay);
  renderTopBar();
  renderCarryTray();
  renderActiveStoryBeat();
  layoutStableHotspots();
  hotspotLayer.classList.add('settled');
}

function mountIntroOverlay(): void {
  hotspotLayer.style.display = 'none';
  topBar.style.display = 'none';
  bottomStack.style.display = 'none';
  introHost.style.display = 'block';
  activeDiorama?.setIntroPose('hidden', 0);

  introMonthTitleEl = h(
    'div',
    {
      style: {
        fontSize: '21px',
        fontWeight: '900',
        letterSpacing: '0.06em',
        color: '#1f2430',
      },
    },
    'JANUARY',
  );

  introDaysCounterEl = h(
    'div',
    {
      style: {
        fontSize: '11.5px',
        fontWeight: '800',
        letterSpacing: '0.08em',
        color: '#c53030',
        marginTop: '2px',
      },
    },
    'DAYS 001 - 031 · REBRANDED',
  );

  introMonthCells = INTRO_MONTHS.map((m) =>
    h(
      'div',
      {
        style: {
          position: 'relative',
          padding: '6px 4px',
          borderRadius: '7px',
          background: '#fffdf9',
          border: '1.5px solid #d8cfc0',
          textAlign: 'center',
          fontSize: '10.5px',
          fontWeight: '900',
          color: '#4a5568',
          overflow: 'hidden',
          transition: 'transform 90ms ease, background 90ms ease, border-color 90ms ease',
        },
      },
      h('div', {}, m.short),
      h(
        'div',
        {
          class: 'xmas-mini-stamp',
          style: {
            position: 'absolute',
            inset: '1px',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(197, 48, 48, 0.92)',
            color: '#fff',
            fontWeight: '900',
            fontSize: '9.5px',
            letterSpacing: '0.06em',
            borderRadius: '5px',
            transform: 'rotate(-8deg) scale(1.35)',
            opacity: '0',
            transition: 'opacity 70ms ease, transform 90ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
        },
        'XMAS',
      ),
    ),
  );

  introBigStampEl = h(
    'div',
    {
      style: {
        position: 'absolute',
        top: '54%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-11deg) scale(1.6)',
        padding: '8px 16px',
        borderRadius: '10px',
        border: '4px solid #c53030',
        background: 'rgba(255, 245, 245, 0.96)',
        color: '#c53030',
        fontWeight: '900',
        fontSize: '19px',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 18px rgba(197, 48, 48, 0.35)',
        opacity: '0',
        pointerEvents: 'none',
        transition: 'opacity 90ms ease, transform 130ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
    '🎄 XMAS · 365 / 365',
  );

  introCalCardEl = h(
    'div',
    {
      style: {
        position: 'relative',
        width: 'min(320px, 88vw)',
        background: '#fffaf0',
        border: '3px solid #1f2430',
        borderRadius: '16px',
        boxShadow: '0 8px 0 #1f2430, 0 18px 36px rgba(0,0,0,0.45)',
        overflow: 'hidden',
        transition: 'opacity 280ms ease, transform 280ms ease',
      },
    },
    h(
      'div',
      {
        style: {
          padding: '8px 12px',
          background: '#c53030',
          color: '#fff',
          borderBottom: '2.5px solid #1f2430',
          fontWeight: '900',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textAlign: 'center',
        },
      },
      '📅 2026 CALENDAR CONSOLIDATION',
    ),
    h(
      'div',
      {
        style: {
          padding: '12px 14px 14px 14px',
          textAlign: 'center',
        },
      },
      introMonthTitleEl,
      introDaysCounterEl,
      h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            marginTop: '10px',
          },
        },
        ...introMonthCells,
      ),
    ),
    introBigStampEl,
  );

  introSlipEl = h(
    'div',
    {
      style: {
        position: 'fixed',
        left: '50%',
        top: '44%',
        transform: 'translate(-50%, -50%) scale(0.8)',
        padding: '7px 14px',
        borderRadius: '9px',
        background: '#fffaf0',
        border: '2.5px dashed #2f855a',
        boxShadow: '0 4px 0 #1f2430, 0 10px 22px rgba(0,0,0,0.35)',
        color: '#22543d',
        fontWeight: '900',
        fontSize: '13px',
        letterSpacing: '0.05em',
        opacity: '0',
        pointerEvents: 'none',
      },
    },
    '🐸 FEB 29 · LEAP DAY (UNFILED)',
  );

  introSubheadEl = h(
    'div',
    {
      style: {
        fontSize: '12.5px',
        fontWeight: '700',
        color: '#fefcbf',
        marginTop: '4px',
        textShadow: '0 2px 4px rgba(0,0,0,0.6)',
      },
    },
    'Stamping 365 days as Christmas...',
  );

  introTapBtnEl = h(
    'button',
    {
      style: {
        padding: '12px 28px',
        borderRadius: '999px',
        fontWeight: '900',
        fontSize: '16px',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        background: '#ecc94b',
        color: '#1f2430',
        border: '3px solid #1f2430',
        boxShadow: '0 5px 0 #1f2430, 0 12px 26px rgba(0,0,0,0.45)',
        transition: 'transform 160ms ease, background 160ms ease',
      },
      onclick: (e: MouseEvent) => {
        e.stopPropagation();
        finishIntro();
      },
    },
    '▶ Tap to Start',
  );

  const wrapper = h(
    'div',
    {
      class: 'interactive',
      style: {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding:
          'calc(18px + env(safe-area-inset-top)) 16px calc(26px + env(safe-area-inset-bottom)) 16px',
        background:
          'radial-gradient(circle at 50% 62%, rgba(15, 20, 28, 0.12) 0%, rgba(10, 14, 22, 0.62) 100%)',
        cursor: 'pointer',
        pointerEvents: 'auto',
      },
      onclick: () => finishIntro(),
    },
    h(
      'div',
      {
        style: {
          textAlign: 'center',
          padding: '10px 18px',
          borderRadius: '14px',
          background: 'rgba(31, 36, 48, 0.92)',
          border: '2.5px solid #1f2430',
          boxShadow: '0 4px 0 #1f2430, 0 10px 24px rgba(0,0,0,0.4)',
          color: '#fff',
        },
      },
      h(
        'div',
        {
          style: {
            fontSize: '20px',
            fontWeight: '900',
            letterSpacing: '0.04em',
          },
        },
        '🏛️ HOLIDAY HALL',
      ),
      introSubheadEl,
    ),
    introCalCardEl,
    introSlipEl,
    introTapBtnEl,
  );

  introHost.replaceChildren(wrapper);
}

function updateIntroCinematic(now: number): void {
  if (!introActive) return;
  if (introStartTime === null) {
    introStartTime = now;
  }
  const elapsed = (now - introStartTime) / 1000;

  // Stage 1 (0.0s -> 1.95s): Rapidly stamp all 12 months JAN -> DEC as XMAS
  const monthIdx = Math.min(11, Math.floor(elapsed / 0.155));
  if (monthIdx > lastStampedMonthIdx && monthIdx >= 0) {
    for (let i = lastStampedMonthIdx + 1; i <= monthIdx; i++) {
      const m = INTRO_MONTHS[i];
      const cell = introMonthCells[i];
      if (m && cell) {
        if (introMonthTitleEl) introMonthTitleEl.textContent = m.full;
        if (introDaysCounterEl) introDaysCounterEl.textContent = `${m.days} · STAMPED XMAS`;
        cell.style.background = '#fff5f5';
        cell.style.borderColor = '#c53030';
        const stamp = cell.querySelector<HTMLElement>('.xmas-mini-stamp');
        if (stamp) {
          stamp.style.opacity = '1';
          stamp.style.transform = 'rotate(-8deg) scale(1)';
        }
      }
    }
    lastStampedMonthIdx = monthIdx;
    if (introCalCardEl) {
      const tilt = (monthIdx % 2 === 0 ? 1 : -1) * 1.4;
      introCalCardEl.style.transform = `translateY(-2px) rotate(${tilt}deg)`;
    }
  }

  // At 1.95s: Slam giant "XMAS 365/365" stamp across the calendar
  if (elapsed >= 1.95 && introBigStampEl && introBigStampEl.style.opacity === '0') {
    introBigStampEl.style.opacity = '1';
    introBigStampEl.style.transform = 'translate(-50%, -50%) rotate(-11deg) scale(1)';
    if (introSubheadEl) {
      introSubheadEl.textContent = '365/365 Days Stamped... wait, what about FEB 29?';
    }
  }

  // Stage 2 (2.15s -> 2.70s): FEB 29 slip shakes loose and flutters down to the Holiday Hall rug
  if (elapsed >= 2.15 && elapsed < 2.75 && introSlipEl) {
    const u = Math.min(1, (elapsed - 2.15) / 0.55);
    const topPct = 44 + u * 22;
    const swayX = Math.sin(u * Math.PI * 2.5) * 26 * (1 - u * 0.4);
    const rotDeg = Math.sin(u * Math.PI * 2.5) * 14;
    introSlipEl.style.opacity = u < 0.9 ? '1' : `${(1 - u) * 10}`;
    introSlipEl.style.top = `${topPct.toFixed(1)}%`;
    introSlipEl.style.transform = `translate(calc(-50% + ${swayX.toFixed(1)}px), -50%) rotate(${rotDeg.toFixed(1)}deg) scale(${(0.95 + u * 0.1).toFixed(2)})`;
    if (introCalCardEl && elapsed >= 2.35) {
      introCalCardEl.style.opacity = '0';
      introCalCardEl.style.transform = 'translateY(-18px) scale(0.92)';
      introCalCardEl.style.pointerEvents = 'none';
    }
  }

  // Stage 3 (2.70s+): Leap Day pops out of the FEB 29 slip on the Holiday Hall floor and hops around!
  if (elapsed >= 2.7) {
    if (!introPopTriggered) {
      introPopTriggered = true;
      if (introSlipEl) introSlipEl.style.opacity = '0';
      if (introCalCardEl) introCalCardEl.style.opacity = '0';
      if (introSubheadEl) {
        introSubheadEl.textContent = 'FEB 29 slipped loose! Leap Day is in Holiday Hall.';
      }
    }
    activeDiorama?.setIntroPose('pop', elapsed - 2.7);
    if (introTapBtnEl) {
      const pulse = 1 + Math.sin((elapsed - 2.7) * 5.5) * 0.045;
      introTapBtnEl.style.transform = `scale(${pulse.toFixed(3)})`;
      introTapBtnEl.style.background = '#68d391';
    }
  }
}

if (introActive) {
  mountIntroOverlay();
}

const targetLitColor = new THREE.Color();
const targetShadeColor = new THREE.Color();
const targetSunColor = new THREE.Color();

let fpsFrameCount = 0;
let fpsSampleStart = performance.now();

view.renderer.setAnimationLoop((now) => {
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

  if (introActive) {
    updateIntroCinematic(now);
  }

  const t = now / 1000;
  if (activeDiorama) {
    activeDiorama.animate(t, currentBay);
  }

  // Guarantee horizontal FOV on mobile portrait so dioramas never clip off the sides
  const w = Math.max(1, window.innerWidth);
  const hPx = Math.max(1, window.innerHeight);
  syncCameraFov(w, hPx);
  if (w !== lastLayoutW || hPx !== lastLayoutH) {
    layoutStableHotspots();
  }

  camAngleCurrent = camAngleTarget;
  if (!introActive && !isTransitioningBay && activeModal === 'none') {
    if (!hotspotLayer.classList.contains('settled')) {
      hotspotLayer.classList.add('settled');
    }
  }

  // Smoothly transition cel shading tints; turn down overhead sun so the diorama's own
  // emissive fixtures (fireplace, candles, jack-o'-lanterns, lanterns) are the primary light source
  const mood = getBayLightMood(currentBay);
  targetLitColor.setRGB(mood.litTint[0], mood.litTint[1], mood.litTint[2]);
  targetShadeColor.setRGB(mood.shadeTint[0], mood.shadeTint[1], mood.shadeTint[2]);
  targetSunColor.setHex(hexToNumber(mood.sunColor as `#${string}`));
  celUniforms.celLitTint.value.lerp(targetLitColor, 0.15);
  celUniforms.celShadeTint.value.lerp(targetShadeColor, 0.15);
  celUniforms.celShadeGamma.value += (mood.shadeGamma - celUniforms.celShadeGamma.value) * 0.15;
  view.sun.color.lerp(targetSunColor, 0.15);
  view.sun.intensity = 0;
  view.sun.castShadow = false;
  view.sun.visible = false;

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
});

// Dev builds expose the view and gameState for debugging from the console.
if (import.meta.env.DEV) Object.assign(window, { view, gameState });
