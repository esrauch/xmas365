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
let activeModal: 'none' | 'proto' | 'desk' | 'settings' = 'none';

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

ui.replaceChildren(hotspotLayer, sideArrowsHost, topBar, bottomStack, modalHost, fpsBadge);

interface ProjectedPill {
  hotspot: Hotspot3D;
  el: HTMLElement;
}
let projectedPills: ProjectedPill[] = [];

const MILESTONE_VIGNETTES: Record<
  'intro' | 'act2' | 'act3' | 'act4',
  { speaker: string; badge: string; bg: string; border: string; text: string }
> = {
  intro: {
    speaker: 'THE SHADOWY FIGURE',
    badge: '🕯️ ACT I · HOLIDAY HALL',
    bg: '#2d2438',
    border: '#9f7aea',
    text: '“Welcome to Holiday Hall! I scattered every holiday’s prized props into the wrong alcoves and locked them. Spin around the Hall and light all 6 Lamps if you dare!”',
  },
  act2: {
    speaker: 'ORDINARY TUESDAY (UNMASKED)',
    badge: '☕ ACT II · 3/6 LAMPS LIT',
    bg: '#fefcbf',
    border: '#d69e2e',
    text: '“BZZT! ...Okay, the shadow cloak was rented! Nobody ever celebrates an Ordinary Tuesday! Wait—I only swapped the props. My ‘benefactor’ wired these 9×9 logic locks...”',
  },
  act3: {
    speaker: 'SANTA CLAUS · CEO OF Q4 EVERYDAY',
    badge: '🎅 ACT III · 6/6 LAMPS LIT',
    bg: '#fff5f5',
    border: '#e53e3e',
    text: '“Ho-ho-hostile takeover! Thanks for clearing Holiday Hall—and thank you, Tuesday, for being my patsy! Soon all 365 days will be Christmas! Try breaking my Dual-Twist Merger Lock!”',
  },
  act4: {
    speaker: 'ORDINARY TUESDAY & ALL SIX HOLIDAYS',
    badge: '🎉 ACT IV · TUESDAY’S PARTY!',
    bg: '#f0fff4',
    border: '#38a169',
    text: '“We shredded Santa’s merger contract! The holidays threw Tuesday’s Party right here in Holiday Hall—visit the Calendar Desk anytime for Daily Tuesday or the Custom Mixer!”',
  },
};

function currentMilestoneKey(): 'intro' | 'act2' | 'act3' | 'act4' {
  const act = gameState.act();
  if (act === 4) return 'act4';
  if (act === 3) return 'act3';
  if (act === 2) return 'act2';
  return 'intro';
}

function showStoryVignette(key = currentMilestoneKey(), force = false): void {
  if (!force && gameState.milestones.has(key)) return;
  const v = MILESTONE_VIGNETTES[key];
  const isDark = key === 'intro';
  const card = h(
    'div',
    {
      class: 'interactive',
      style: {
        background: v.bg,
        color: isDark ? '#f7fafc' : '#1f2430',
        border: `2.5px solid ${v.border}`,
        borderRadius: '12px',
        padding: '8px 12px',
        boxShadow: '0 4px 0 #1f2430, 0 8px 18px rgba(0,0,0,0.28)',
        pointerEvents: 'auto',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '3px',
        },
      },
      h(
        'span',
        {
          style: {
            fontSize: '10.5px',
            fontWeight: '800',
            letterSpacing: '0.05em',
            opacity: '0.92',
          },
        },
        `${v.badge} · ${v.speaker}`,
      ),
      h(
        'button',
        {
          style: {
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            border: '1.5px solid currentColor',
            background: 'transparent',
            color: 'inherit',
          },
          onclick: () => {
            gameState.markMilestone(key);
            storyBannerHost.replaceChildren();
          },
        },
        '✕',
      ),
    ),
    h('div', { style: { fontSize: '12px', lineHeight: '1.35', fontStyle: 'italic' } }, v.text),
  );
  storyBannerHost.replaceChildren(card);
}

function stepBay(delta: number): void {
  const idx = BAY_ORDER.indexOf(currentBay);
  const nextIdx = (idx + delta + BAY_ORDER.length) % BAY_ORDER.length;
  switchBay(BAY_ORDER[nextIdx] ?? 'hall');
}

function renderSideArrows(): void {
  sideArrowsHost.replaceChildren();
}

function renderTopBar(): void {
  const lamps = gameState.completedRoomCount();
  const roomSpec =
    currentBay === 'hall' ? null : (ROOM_SPECS.find((r) => r.id === currentBay) ?? null);

  // Row 1: Current Bay Title + Lamp Progress + Calendar Desk + Settings (Top Right)
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
    h(
      'div',
      {
        style: {
          padding: '5px 11px',
          borderRadius: '10px',
          fontWeight: '800',
          fontSize: '13.5px',
          background: roomSpec ? roomSpec.accent : '#1f2430',
          color: '#fff',
          border: '2px solid #1f2430',
          boxShadow: '0 2px 0 #1f2430',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
      roomSpec ? `${roomSpec.icon} ${roomSpec.title}` : '🏛️ Holiday Hall',
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '5px', flexShrink: '0' } },
      h(
        'span',
        {
          style: {
            padding: '5px 9px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '11.5px',
            background: '#fffdf9',
            color: '#1f2430',
            border: '2px solid #1f2430',
          },
        },
        `★ ${lamps}/6`,
      ),
      h(
        'button',
        {
          title: 'Open Calendar Desk',
          style: {
            padding: '5px 9px',
            borderRadius: '9px',
            fontWeight: '800',
            fontSize: '11.5px',
            cursor: 'pointer',
            background: '#805ad5',
            color: '#fff',
            border: '2px solid #1f2430',
          },
          onclick: () => openCalendarDeskModal(),
        },
        '📅 Desk',
      ),
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
        '⚙️ Settings',
      ),
    ),
  );

  // Row 2: Compact 7-bay ring switcher around Holiday Hall with ‹ / › spin buttons
  const row2 = h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        pointerEvents: 'auto',
      },
    },
    h(
      'button',
      {
        title: 'Rotate left in Holiday Hall',
        style: {
          padding: '3px 9px',
          borderRadius: '999px',
          fontWeight: '900',
          fontSize: '14px',
          cursor: 'pointer',
          background: '#fffdf9',
          color: '#1f2430',
          border: '2px solid #1f2430',
        },
        onclick: () => stepBay(-1),
      },
      '‹',
    ),
    h(
      'button',
      {
        title: 'Holiday Hall (Tuesday Finale & Desk)',
        style: {
          padding: '4px 8px',
          borderRadius: '999px',
          fontWeight: '800',
          fontSize: '11.5px',
          cursor: 'pointer',
          background: currentBay === 'hall' ? '#1f2430' : '#fffdf9',
          color: currentBay === 'hall' ? '#fff' : '#1f2430',
          border: '2px solid #1f2430',
        },
        onclick: () => switchBay('hall'),
      },
      '🏛️',
    ),
    ...ROOM_SPECS.map((r) => {
      const active = currentBay === r.id;
      const done = gameState.isRoomComplete(r);
      const unlocked = gameState.isRoomUnlocked(r);
      const canUnlock = !unlocked && gameState.carriedEligibleItemForRoom(r) !== null;
      return h(
        'button',
        {
          title: r.title,
          style: {
            padding: '4px 8px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            background: active
              ? r.accent
              : done
                ? '#c6f6d5'
                : canUnlock
                  ? '#fefcbf'
                  : unlocked
                    ? '#fffdf9'
                    : '#edf2f7',
            color: active ? '#fff' : '#1f2430',
            border: canUnlock ? '2px solid #d69e2e' : '2px solid #1f2430',
          },
          onclick: () => switchBay(r.id),
        },
        done ? `${r.icon}★` : canUnlock ? `${r.icon}✨` : unlocked ? r.icon : `${r.icon}🔒`,
      );
    }),
    h(
      'button',
      {
        title: 'Rotate right in Holiday Hall',
        style: {
          padding: '3px 9px',
          borderRadius: '999px',
          fontWeight: '900',
          fontSize: '14px',
          cursor: 'pointer',
          background: '#fffdf9',
          color: '#1f2430',
          border: '2px solid #1f2430',
        },
        onclick: () => stepBay(1),
      },
      '›',
    ),
  );

  topBar.replaceChildren(row1, row2);
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
    return h(
      'button',
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 10px',
          borderRadius: '999px',
          fontWeight: '700',
          fontSize: '12px',
          cursor: 'pointer',
          background: inHomeRoom ? '#fefcbf' : '#fffdf9',
          color: '#1f2430',
          border: inHomeRoom ? '2px solid #d69e2e' : '2px solid #1f2430',
          boxShadow: '0 2px 0 #1f2430',
        },
        onclick: () => {
          if (inHomeRoom) {
            placeItemOnPedestal(item.id);
          } else {
            switchBay(item.homeRoom);
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
            color: inHomeRoom ? '#b7791f' : (homeRoom?.accent ?? '#4a5568'),
          },
        },
        inHomeRoom ? '✨ Place!' : `→ ${homeRoom?.shortTitle ?? item.homeRoom}`,
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
    h('span', { style: { fontSize: '11px', fontWeight: '800' } }, '🎒 CARRY:'),
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
  projectedPills = hotspots.map((hs) => {
    if (hs.kind === 'return-slot') {
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
          h('span', { style: { fontWeight: '800', fontSize: '10.5px' } }, hs.label),
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

    const el = h(
      'button',
      {
        class: `hotspot-pill ${hs.status}${hs.hero ? ' hero' : ''}`,
        style: {
          borderColor: hs.status === 'ready' || hs.status === 'door' ? hs.accent : undefined,
        },
        onclick: (e: MouseEvent) => {
          e.stopPropagation();
          hs.onClick();
        },
      },
      h(
        'span',
        { style: { fontWeight: '800', fontSize: hs.hero ? '15.5px' : '10.5px' } },
        hs.label,
      ),
      hs.sublabel
        ? h(
            'span',
            {
              style: {
                fontSize: hs.hero ? '12px' : '9px',
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

  const padX = Math.min(76, w * 0.2);
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
      const y = (-tempProj.y * 0.5 + 0.5) * hPx;
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
}

function rebuildScene(): void {
  if (activeDiorama) {
    view.scene.remove(activeDiorama.root);
  }

  activeDiorama = buildHolidayHallDiorama({
    onSelectBay: (bay) => switchBay(bay),
    onOpenProto: (protoId, focusPos, focusLook) => openProtoModal(protoId, focusPos, focusLook),
    onOpenDesk: (focusPos, focusLook) => openCalendarDeskModal(focusPos, focusLook),
    onShowStory: () => showStoryVignette(currentMilestoneKey(), true),
    onPlaceItem: (itemId) => placeItemOnPedestal(itemId),
  });

  view.scene.add(activeDiorama.root);
  buildHotspotDOM(activeDiorama.hotspots);
  layoutStableHotspots();
  if (Math.abs(shortestAngleDelta(camAngleCurrent, camAngleTarget)) <= 0.015) {
    hotspotLayer.classList.add('settled');
  }
  renderTopBar();
  renderSideArrows();
  renderCarryTray();
  showStoryVignette();
}

function switchBay(bay: BayId): void {
  closeModal();
  const changed = bay !== currentBay;
  currentBay = bay;
  camAngleTarget = getBayAngle(bay);
  if (changed) {
    // Immediately hide the old bay's pills during rotation; they will fade in once settled
    hotspotLayer.style.transition = 'none';
    hotspotLayer.classList.remove('settled');
    layoutStableHotspots();
    requestAnimationFrame(() => {
      hotspotLayer.style.transition = '';
    });
  } else {
    layoutStableHotspots();
  }
  blip(440, 45);
  renderTopBar();
  renderCarryTray();
}

function closeModal(): void {
  activeModal = 'none';
  isCameraFocused = false;
  modalHost.replaceChildren();
  hotspotLayer.style.display = '';
  sideArrowsHost.style.display = '';
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
    ? `Beating the ${roomSpec.shortTitle} Warm-up (${roomSpec.warmup.title}) unlocked both the Warm-up replay and the Standard (No-Twist) ${roomSpec.genreLabel} generator at Tuesday's Calendar Desk!`
    : `Beating the ${roomSpec.shortTitle} Centerpiece (${roomSpec.centerpiece.title}) unlocked all 6 holiday twists for ${roomSpec.genreLabel} at Tuesday's Calendar Desk!`;

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

  activeModal = 'proto';
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
                      onclick: () => switchBay(homeRoom.id),
                    },
                    `Go to ${homeRoom.shortTitle} ▸`,
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
              showStoryVignette(currentMilestoneKey(), true);
            },
          },
          `📖 View Act ${act} Story Note`,
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
        "🎉 Tuesday's Finale Solved",
        'Completes Grand Finale Door (Act IV)',
        gameState.solvedRuns.has('tuesday'),
        (next) => gameState.setRunSolved('tuesday', next),
      ),
    );

    const roomCards = ROOM_SPECS.map((room) => {
      const req0 = STRAY_ITEMS[room.centerpiece.requiredItems[0]];
      const req1 = STRAY_ITEMS[room.centerpiece.requiredItems[1]];
      const roomDone = gameState.isRoomComplete(room);

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
            'span',
            { style: { fontWeight: '800', fontSize: '13.5px', color: '#1f2430' } },
            `${room.icon} ${room.title}`,
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
  if (activeModal !== 'none' || !activeDiorama) return;
  const dx = e.clientX - pointerDownX;
  const dy = e.clientY - pointerDownY;
  // Horizontal swipe rotates around Holiday Hall!
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    stepBay(dx < 0 ? 1 : -1);
    return;
  }
  const rect = canvas.getBoundingClientRect();
  pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, view.camera);
  const hits = raycaster.intersectObjects(activeDiorama.root.children, true);
  for (const hit of hits) {
    const hs = findHotspotFromObject(hit.object);
    if (hs) {
      if (hs.bay !== currentBay) {
        switchBay(hs.bay);
      } else {
        hs.onClick();
      }
      return;
    }
  }
});

// Build initial Holiday Hall scene
rebuildScene();

// Support ?room=<bayId> or ?p=<protoId> deep-linking
const startRoomParam = params.get('room') as BayId | null;
if (startRoomParam && BAY_ORDER.includes(startRoomParam)) {
  switchBay(startRoomParam);
  camAngleCurrent = camAngleTarget;
  layoutStableHotspots();
  hotspotLayer.classList.add('settled');
}

const startProtoId = params.get('p');
if (startProtoId) {
  const matchingRoom = ROOM_SPECS.find(
    (r) =>
      r.warmup.id === startProtoId ||
      r.strays.some((s) => s.proto.id === startProtoId) ||
      r.centerpiece.proto.id === startProtoId,
  );
  if (matchingRoom) {
    switchBay(matchingRoom.id);
    camAngleCurrent = camAngleTarget;
    layoutStableHotspots();
  }
  openProtoModal(startProtoId, camPosCurrent.clone(), camLookCurrent.clone());
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

  // Smooth circular rotation around Holiday Hall
  const angleDelta = shortestAngleDelta(camAngleCurrent, camAngleTarget);
  if (Math.abs(angleDelta) > 0.012) {
    camAngleCurrent += angleDelta * 0.16;
  } else {
    camAngleCurrent = camAngleTarget;
    if (activeModal === 'none' && !hotspotLayer.classList.contains('settled')) {
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
