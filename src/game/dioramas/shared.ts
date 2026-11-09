/**
 * Shared 3D cel-shaded diorama utilities, coordinate helpers, lighting moods,
 * common props, and the reusable Holiday Alcove scaffold.
 *
 * All meshes, geometries, and materials for every bay are constructed once at
 * startup and updated in-place via `syncState()` so there is zero WebGL resource
 * churn across the entire game lifecycle.
 */
import * as THREE from 'three';
import { hexToNumber } from '../../content/palettes';
import { FX_LAYER } from '../../render/outline';
import { toonMaterial } from '../../render/toon';
import { ROOM_MASCOT_ID, buildMascotMesh } from '../mascots';
import { type RoomId, ROOM_SPECS, type RoomSpec, STRAY_ITEMS, gameState } from '../state';

export { FX_LAYER, hexToNumber, toonMaterial };

export type BayId = 'hall' | RoomId;

export const BAY_ORDER: readonly BayId[] = [
  'hall',
  'halloween',
  'thanksgiving',
  'christmas',
  'valentines',
  'easter',
  'fourth',
];

export const BAY_COUNT = BAY_ORDER.length;
const BAY_STEP = (Math.PI * 2) / BAY_COUNT;
export const HALL_WALL_RADIUS = 5.3;
export const WALL_WIDTH = 2 * HALL_WALL_RADIUS * Math.tan(Math.PI / BAY_COUNT) + 0.18;

export function getBayAngle(bay: BayId): number {
  const idx = BAY_ORDER.indexOf(bay);
  return (idx >= 0 ? idx : 0) * BAY_STEP;
}

/** Convert bay-local (lx, ly, lz) into world coordinates for a bay at angle `theta`. */
export function bayToWorld(theta: number, lx: number, ly: number, lz: number): THREE.Vector3 {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const r = HALL_WALL_RADIUS - lz;
  return new THREE.Vector3(sin * r + cos * lx, ly, -cos * r + sin * lx);
}

export interface BayLightMood {
  litTint: readonly [number, number, number];
  shadeTint: readonly [number, number, number];
  shadeGamma: number;
  sunColor: string;
  sunIntensity: number;
  sunOffsetAngle: number;
  sunHeight: number;
  /** Bay-local (lx, ly, lz) position of the single shadow-casting diorama light source. */
  lightLocalPos: readonly [number, number, number];
  lightColor: string;
  lightIntensity: number;
  lightDistance: number;
}

export function getBayLightMood(bay: BayId, act = gameState.act()): BayLightMood {
  switch (bay) {
    case 'hall':
      if (act === 3) {
        return {
          litTint: [0.96, 1.04, 1.18],
          shadeTint: [0.36, 0.45, 0.68],
          shadeGamma: 1.4,
          sunColor: '#cbe4ff',
          sunIntensity: 1.45,
          sunOffsetAngle: -0.35,
          sunHeight: 13,
          lightLocalPos: [0, 1.65, 1.85],
          lightColor: '#90cdf4',
          lightIntensity: 4.8,
          lightDistance: 5.6,
        };
      }
      if (act === 4) {
        return {
          litTint: [1.14, 0.98, 0.84],
          shadeTint: [0.52, 0.36, 0.64],
          shadeGamma: 1.36,
          sunColor: '#ffe0a3',
          sunIntensity: 1.55,
          sunOffsetAngle: -0.4,
          sunHeight: 11.5,
          lightLocalPos: [0, 1.65, 1.85],
          lightColor: '#ffbe55',
          lightIntensity: 5.2,
          lightDistance: 5.6,
        };
      }
      return {
        litTint: [1.08, 0.92, 0.74],
        shadeTint: [0.24, 0.19, 0.34],
        shadeGamma: 1.42,
        sunColor: '#ffd296',
        sunIntensity: 1.32,
        sunOffsetAngle: -0.45,
        sunHeight: 11.5,
        lightLocalPos: [0, 1.25, 2.2],
        lightColor: '#ffc27a',
        lightIntensity: 3.4,
        lightDistance: 2.4,
      };
    case 'halloween':
      return {
        litTint: [1.14, 0.88, 0.68],
        shadeTint: [0.3, 0.21, 0.48],
        shadeGamma: 1.44,
        sunColor: '#ffae66',
        sunIntensity: 1.28,
        sunOffsetAngle: -0.5,
        sunHeight: 10.5,
        lightLocalPos: [0, 1.04, 0.82],
        lightColor: '#ff8533',
        lightIntensity: 4.8,
        lightDistance: 4.8,
      };
    case 'thanksgiving':
      return {
        litTint: [1.14, 0.94, 0.72],
        shadeTint: [0.42, 0.26, 0.22],
        shadeGamma: 1.4,
        sunColor: '#ffc978',
        sunIntensity: 1.35,
        sunOffsetAngle: -0.42,
        sunHeight: 10.8,
        lightLocalPos: [0, 1.22, 0.82],
        lightColor: '#ffa94d',
        lightIntensity: 5.0,
        lightDistance: 4.8,
      };
    case 'christmas':
      return {
        litTint: [1.16, 0.92, 0.7],
        shadeTint: [0.28, 0.36, 0.42],
        shadeGamma: 1.42,
        sunColor: '#ffb870',
        sunIntensity: 1.28,
        sunOffsetAngle: -0.25,
        sunHeight: 8.5,
        lightLocalPos: [0, 0.42, 0.86],
        lightColor: '#ff7733',
        lightIntensity: 5.4,
        lightDistance: 4.8,
      };
    case 'valentines':
      return {
        litTint: [1.15, 0.88, 0.82],
        shadeTint: [0.39, 0.2, 0.33],
        shadeGamma: 1.42,
        sunColor: '#ffb399',
        sunIntensity: 1.26,
        sunOffsetAngle: -0.38,
        sunHeight: 9.8,
        lightLocalPos: [0, 1.08, 0.82],
        lightColor: '#ff8c73',
        lightIntensity: 4.8,
        lightDistance: 4.8,
      };
    case 'easter':
      return {
        litTint: [1.14, 1.06, 0.82],
        shadeTint: [0.46, 0.4, 0.24],
        shadeGamma: 1.34,
        sunColor: '#ffe066',
        sunIntensity: 1.48,
        sunOffsetAngle: -0.48,
        sunHeight: 11.2,
        lightLocalPos: [0, 1.14, 0.82],
        lightColor: '#ffd43b',
        lightIntensity: 4.8,
        lightDistance: 4.8,
      };
    case 'fourth':
      return {
        litTint: [1.1, 0.98, 0.92],
        shadeTint: [0.28, 0.33, 0.56],
        shadeGamma: 1.42,
        sunColor: '#ffd699',
        sunIntensity: 1.32,
        sunOffsetAngle: -0.44,
        sunHeight: 10.5,
        lightLocalPos: [0, 1.22, 0.82],
        lightColor: '#ffbe55',
        lightIntensity: 4.8,
        lightDistance: 4.8,
      };
  }
}

export interface HotspotConnection {
  targetId: string;
  state: 'done' | 'place' | 'locked';
}

export interface Hotspot3D {
  id: string;
  bay: BayId;
  label: string;
  sublabel?: string;
  icon: string;
  status: 'locked' | 'ready' | 'done' | 'place' | 'door';
  kind?: 'puzzle' | 'return-slot';
  connections?: HotspotConnection[];
  accent: string;
  hero?: boolean;
  /** If true, clickable in 3D via raycasting without rendering a floating DOM pill. */
  hiddenPill?: boolean;
  worldPos: THREE.Vector3;
  cameraPos: THREE.Vector3;
  cameraLook: THREE.Vector3;
  meshGroup?: THREE.Group;
  onClick: () => void;
}

export interface DioramaCallbacks {
  onSelectBay: (bay: BayId) => void;
  onOpenProto: (protoId: string, focusPos: THREE.Vector3, focusLook: THREE.Vector3) => void;
  onShowStory: () => void;
  onOpenCorkboard?: () => void;
  onClickMascot?: (roomId: RoomId) => void;
  onPlaceItem: (itemId: string) => void;
}

export interface BuiltDiorama {
  root: THREE.Group;
  hotspots: Hotspot3D[];
  /** World-space anchor right above Leap Day's head in Holiday Hall (for Leap Day's speech bubbles). */
  leapDayHeadWorldPos: THREE.Vector3;
  /** Update all bay meshes, materials, visibility flags, and hotspot descriptors in-place from `gameState`. */
  syncState: () => void;
  /** Animate Leap Day hopping from the hall center toward `roomId`'s door (`progress` in 0..1). */
  setDoorHop: (roomId: RoomId | null, progress: number) => void;
  /** Animate Leap Day's cold-start intro pop-out & idle hops around the hall floor. */
  setIntroPose: (mode: 'hidden' | 'pop' | 'idle', elapsed: number) => void;
  animate: (t: number, activeBay: BayId, showAllBays?: boolean) => void;
}

export interface FlameEntry {
  mesh: THREE.Object3D;
  baseY: number;
  phase: number;
  baseScaleX?: number;
  baseScaleY?: number;
  baseScaleZ?: number;
  swayScale?: number;
  particle?: {
    baseX: number;
    baseZ: number;
    rise: number;
    sway: number;
    speed: number;
    scale: number;
  };
}

export interface FairyLightEntry {
  mat: THREE.MeshToonMaterial;
  baseColor: THREE.Color;
  offColor: THREE.Color;
  phase: number;
  active: boolean;
}

export interface FireflyEntry {
  mesh: THREE.Object3D;
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
}

export interface FloatingEntry {
  mesh: THREE.Object3D;
  phase: number;
  baseY: number;
}

export interface FxPulseEntry {
  mat: THREE.MeshBasicMaterial;
  base: number;
  phase: number;
}

export interface BuiltBay {
  bayId: BayId;
  group: THREE.Group;
  flames: FlameEntry[];
  fireflies: FireflyEntry[];
  fairyLights: FairyLightEntry[];
  fxPulses: FxPulseEntry[];
  floating: FloatingEntry[];
  syncState: (hotspotsOut: Hotspot3D[]) => void;
  /** Per-frame animation of this bay's own moments (a room's mascot leaving its cage). */
  animate?: (t: number) => void;
}

export function makeBayGroup(theta: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(Math.sin(theta) * HALL_WALL_RADIUS, 0, -Math.cos(theta) * HALL_WALL_RADIUS);
  g.rotation.y = -theta;
  return g;
}

export function mat(hex: string): THREE.MeshToonMaterial {
  return toonMaterial({ color: hexToNumber(hex as `#${string}`) });
}

export function glowMat(hex: string, intensity = 0.85): THREE.MeshToonMaterial {
  const c = hexToNumber(hex as `#${string}`);
  return toonMaterial({
    color: c,
    emissive: c,
    emissiveIntensity: intensity,
  });
}

export function box(
  w: number,
  h: number,
  d: number,
  hex: string,
  x = 0,
  y = 0,
  z = 0,
  castShadow = true,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  return m;
}

export function glowBox(
  w: number,
  h: number,
  d: number,
  hex: string,
  x = 0,
  y = 0,
  z = 0,
  intensity = 0.85,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glowMat(hex, intensity));
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
}

export function cyl(
  rTop: number,
  rBot: number,
  h: number,
  hex: string,
  x = 0,
  y = 0,
  z = 0,
  segs = 14,
  castShadow = true,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  return m;
}

export function sphere(r: number, hex: string, x = 0, y = 0, z = 0, castShadow = true): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  return m;
}

export function glowSphere(
  r: number,
  hex: string,
  x = 0,
  y = 0,
  z = 0,
  intensity = 0.9,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), glowMat(hex, intensity));
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
}

let radialTex: THREE.CanvasTexture | null = null;
let beamTex: THREE.CanvasTexture | null = null;

/** A round glow: white in the middle, fading to nothing at the edge. */
export function radialTexture(): THREE.CanvasTexture {
  if (radialTex) return radialTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  radialTex = new THREE.CanvasTexture(c);
  return radialTex;
}

/** A beam: bright at the top edge (the source), fading downward and soft at the sides. */
export function beamTexture(): THREE.CanvasTexture {
  if (beamTex) return beamTex;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const along = g.createLinearGradient(0, 0, 0, 128);
    along.addColorStop(0, 'rgba(255,255,255,1)');
    along.addColorStop(0.45, 'rgba(255,255,255,0.45)');
    along.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = along;
    g.fillRect(0, 0, 64, 128);
    g.globalCompositeOperation = 'destination-in';
    const across = g.createLinearGradient(0, 0, 64, 0);
    across.addColorStop(0, 'rgba(0,0,0,0)');
    across.addColorStop(0.25, 'rgba(0,0,0,1)');
    across.addColorStop(0.75, 'rgba(0,0,0,1)');
    across.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = across;
    g.fillRect(0, 0, 64, 128);
  }
  beamTex = new THREE.CanvasTexture(c);
  return beamTex;
}

export function fxMaterial(
  map: THREE.Texture,
  hex: string,
  opacity: number,
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    map,
    color: hexToNumber(hex as `#${string}`),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/** A light-effect plane (w × h), standing up and facing +z; lay it flat with `flat`. */
export function fxPlane(
  w: number,
  h: number,
  material: THREE.MeshBasicMaterial,
  x: number,
  y: number,
  z: number,
  flat = false,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(x, y, z);
  if (flat) m.rotation.x = -Math.PI / 2;
  m.layers.set(FX_LAYER);
  m.renderOrder = 2;
  return m;
}

/**
 * A wedge of light: a trapezoid `nearW` wide at its source end (local +y, the
 * texture's bright top), widening to `farW` over `length`.
 */
export function fxWedge(
  nearW: number,
  farW: number,
  length: number,
  material: THREE.MeshBasicMaterial,
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(1, length);
  const pos = geo.attributes['position'] as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) * (pos.getY(i) > 0 ? nearW : farW));
  pos.needsUpdate = true;
  const m = new THREE.Mesh(geo, material);
  m.layers.set(FX_LAYER);
  m.renderOrder = 2;
  return m;
}

/** Build a wax candle with an animated glowing flame tip and mild rising spark particles. */
export function buildCandle(
  r: number,
  h: number,
  waxHex: string,
  x: number,
  y: number,
  z: number,
  flames: FlameEntry[],
  phase: number,
): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(cyl(r, r * 1.05, h, waxHex, 0, h / 2, 0, 10, false));
  const flame = glowSphere(r * 0.65, '#ffbe3b', 0, h + r * 0.7, 0, 1.15);
  flame.scale.set(0.75, 1.45, 0.75);
  g.add(flame);
  flames.push({
    mesh: flame,
    baseY: h + r * 0.7,
    phase,
    baseScaleX: 0.75,
    baseScaleY: 1.45,
    baseScaleZ: 0.75,
  });

  for (let i = 0; i < 2; i++) {
    const pHex = i === 0 ? '#ffd43b' : '#ff922b';
    const spark = glowSphere(r * 0.34, pHex, 0, h + r * 1.25, 0, 1.35);
    g.add(spark);
    flames.push({
      mesh: spark,
      baseY: h + r * 1.25,
      phase: phase + i * 0.5,
      particle: {
        baseX: (i === 0 ? -1 : 1) * r * 0.15,
        baseZ: 0,
        rise: 0.22,
        sway: 0.022,
        speed: 0.55 + i * 0.12,
        scale: 1,
      },
    });
  }
  return g;
}

/** Build a stemmed crystal wine glass filled with ruby wine. */
export function buildWineGlass(x: number, y: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(cyl(0.08, 0.09, 0.02, '#e2e8f0', 0, 0.01, 0, 12, false));
  g.add(cyl(0.016, 0.016, 0.14, '#e2e8f0', 0, 0.08, 0, 8, false));
  g.add(cyl(0.095, 0.03, 0.14, '#cbd5e0', 0, 0.21, 0, 12, false));
  g.add(glowSphere(0.072, '#b81d4e', 0, 0.2, 0, 0.45));
  return g;
}

/** Build a porcelain vase with a bouquet of red roses and green leaves. */
export function buildRoseBouquet(x: number, y: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(cyl(0.11, 0.08, 0.26, '#fff5f7', 0, 0.13, 0, 12, false));
  g.add(cyl(0.125, 0.11, 0.04, '#ecc94b', 0, 0.25, 0, 12, false));
  g.add(sphere(0.14, '#2f855a', 0, 0.31, 0, false));
  const roses: [number, number, number, string][] = [
    [0, 0.42, 0.02, '#e53e3e'],
    [-0.1, 0.37, 0.06, '#c53030'],
    [0.1, 0.38, 0.05, '#d53f8c'],
    [-0.06, 0.39, -0.07, '#b83256'],
    [0.07, 0.36, -0.06, '#e53e3e'],
  ];
  for (const [rx, ry, rz, hex] of roses) {
    g.add(glowSphere(0.075, hex, rx, ry, rz, 0.25));
  }
  return g;
}

/** Build a wrapped gift box with overhanging lid, crossed ribbons, and a 3D ribbon bow on top. */
export function buildPresentBox(
  w: number,
  h: number,
  d: number,
  wrapHex: string,
  ribbonHex: string,
  x: number,
  y: number,
  z: number,
  rotY = 0,
): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  const lidH = Math.max(0.032, h * 0.22);
  g.add(box(w, h, d, wrapHex, 0, h / 2, 0));
  g.add(box(w + 0.024, lidH, d + 0.024, wrapHex, 0, h - lidH / 2 + 0.008, 0));
  const ribW = Math.max(0.036, Math.min(w, d) * 0.22);
  g.add(box(ribW, h + 0.018, d + 0.032, ribbonHex, 0, h / 2 + 0.004, 0));
  g.add(box(w + 0.032, h + 0.022, ribW, ribbonHex, 0, h / 2 + 0.006, 0));
  const topY = h + 0.016;
  for (const side of [-1, 1] as const) {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(ribW * 0.85, ribW * 0.28, 8, 14),
      mat(ribbonHex),
    );
    loop.position.set(side * ribW * 0.78, topY + ribW * 0.45, 0);
    loop.rotation.z = side * 0.35;
    loop.castShadow = true;
    loop.receiveShadow = true;
    g.add(loop);
  }
  g.add(sphere(ribW * 0.42, ribbonHex, 0, topY + ribW * 0.35, 0));
  return g;
}

/**
 * Build a bold, cel-shaded 3D prop for a stray item or pedestal item.
 */
export function buildPropMesh(id: string, accent: string): THREE.Group {
  const g = new THREE.Group();
  switch (id) {
    case 'chocolates': {
      const chocGroup = new THREE.Group();
      chocGroup.position.set(0, 0.02, 0.03);
      const makeHeartTray = (
        h: number,
        scale: number,
        wallHex: string,
        floorHex: string,
      ): THREE.Group => {
        const hg = new THREE.Group();
        const r = 0.125 * scale;
        hg.add(cyl(r, r, h, wallHex, -0.078 * scale, h / 2, -0.04 * scale, 16));
        hg.add(cyl(r, r, h, wallHex, 0.078 * scale, h / 2, -0.04 * scale, 16));
        const tipL = box(
          0.18 * scale,
          h,
          0.19 * scale,
          wallHex,
          -0.032 * scale,
          h / 2,
          0.04 * scale,
        );
        tipL.rotation.y = Math.PI / 4;
        const tipR = box(
          0.18 * scale,
          h,
          0.19 * scale,
          wallHex,
          0.032 * scale,
          h / 2,
          0.04 * scale,
        );
        tipR.rotation.y = -Math.PI / 4;
        hg.add(tipL, tipR);
        const ir = r * 0.84;
        const ih = h + 0.012;
        hg.add(cyl(ir, ir, ih, floorHex, -0.072 * scale, ih / 2, -0.038 * scale, 14));
        hg.add(cyl(ir, ir, ih, floorHex, 0.072 * scale, ih / 2, -0.038 * scale, 14));
        const inTip = box(0.145 * scale, ih, 0.145 * scale, floorHex, 0, ih / 2, 0.032 * scale);
        inTip.rotation.y = Math.PI / 4;
        hg.add(inTip);
        return hg;
      };
      const baseTray = makeHeartTray(0.1, 1.08, '#c53030', '#4a1525');
      baseTray.add(cyl(0.142, 0.142, 0.025, '#f6e05e', -0.084, 0.015, -0.043, 14));
      baseTray.add(cyl(0.142, 0.142, 0.025, '#f6e05e', 0.084, 0.015, -0.043, 14));
      chocGroup.add(baseTray);
      const truffles: {
        x: number;
        z: number;
        hex: string;
        drizzle: string;
        shape: 'round' | 'sq';
      }[] = [
        { x: -0.09, z: -0.055, hex: '#3b2313', drizzle: '#f6e05e', shape: 'round' },
        { x: 0.09, z: -0.055, hex: '#ed64a6', drizzle: '#fff5f7', shape: 'round' },
        { x: 0, z: -0.02, hex: '#744210', drizzle: '#fbd38d', shape: 'sq' },
        { x: -0.06, z: 0.035, hex: '#fff5f7', drizzle: '#d53f8c', shape: 'round' },
        { x: 0.06, z: 0.035, hex: '#4a2c18', drizzle: '#ecc94b', shape: 'round' },
        { x: 0, z: 0.095, hex: '#c53030', drizzle: '#f6e05e', shape: 'round' },
      ];
      for (const t of truffles) {
        chocGroup.add(cyl(0.042, 0.03, 0.035, '#ecc94b', t.x, 0.115, t.z, 10));
        if (t.shape === 'sq') {
          const praline = box(0.058, 0.048, 0.058, t.hex, t.x, 0.14, t.z);
          praline.rotation.y = 0.35;
          chocGroup.add(praline);
        } else {
          chocGroup.add(sphere(0.036, t.hex, t.x, 0.142, t.z));
        }
        chocGroup.add(sphere(0.014, t.drizzle, t.x, 0.172, t.z));
      }
      const lid = makeHeartTray(0.06, 1.06, '#d53f8c', '#ed64a6');
      lid.position.set(0.04, 0.24, -0.15);
      lid.rotation.x = 1.18;
      lid.rotation.z = -0.18;
      lid.add(box(0.042, 0.02, 0.28, '#f6e05e', 0, 0.068, 0.01));
      lid.add(box(0.28, 0.022, 0.042, '#f6e05e', 0, 0.07, -0.02));
      for (const side of [-1, 1] as const) {
        const bowLoop = new THREE.Mesh(
          new THREE.TorusGeometry(0.042, 0.014, 8, 14),
          mat('#f6e05e'),
        );
        bowLoop.position.set(side * 0.038, 0.09, -0.02);
        bowLoop.rotation.x = Math.PI / 3;
        bowLoop.rotation.y = side * 0.35;
        lid.add(bowLoop);
      }
      lid.add(sphere(0.022, '#ecc94b', 0, 0.085, -0.02));
      chocGroup.add(lid);
      g.add(chocGroup);
      break;
    }
    case 'starlights': {
      const starGroup = new THREE.Group();
      const coilRings: [number, number][] = [
        [0.11, 0.025],
        [0.095, 0.06],
        [0.08, 0.095],
        [0.065, 0.13],
        [0.05, 0.165],
      ];
      for (const [cr, cy] of coilRings) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(cr, 0.014, 8, 16), mat('#d69e2e'));
        ring.rotation.x = Math.PI / 2 + 0.08;
        ring.position.set(0, cy, 0);
        ring.castShadow = true;
        starGroup.add(ring);
      }
      starGroup.add(cyl(0.024, 0.036, 0.08, '#ecc94b', 0, 0.2, 0, 10));
      const head = new THREE.Group();
      head.position.set(0, 0.38, 0);
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5;
        const spikePivot = new THREE.Group();
        spikePivot.rotation.z = ang;
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.068, 0.24, 4),
          glowMat('#f6e05e', 0.45),
        );
        spike.rotation.y = Math.PI / 4;
        spike.scale.set(1, 1, 0.55);
        spike.position.y = 0.13;
        spike.castShadow = true;
        spikePivot.add(spike);
        head.add(spikePivot);

        const subPivot = new THREE.Group();
        subPivot.rotation.z = ang + Math.PI / 5;
        const subSpike = new THREE.Mesh(
          new THREE.ConeGeometry(0.042, 0.14, 4),
          glowMat('#fefcbf', 0.6),
        );
        subSpike.rotation.y = Math.PI / 4;
        subSpike.scale.set(1, 1, 0.48);
        subSpike.position.y = 0.09;
        subPivot.add(subSpike);
        head.add(subPivot);
      }
      const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.016, 8, 16), mat('#d69e2e'));
      bezel.position.z = 0.026;
      head.add(bezel);
      const jewel = glowSphere(0.068, '#ffffff', 0, 0, 0, 0.95);
      jewel.scale.set(1, 1, 0.72);
      head.add(jewel);
      starGroup.add(head);
      g.add(starGroup);
      break;
    }
    case 'hotdog': {
      const dogGroup = new THREE.Group();
      dogGroup.position.set(0, 0.02, 0);
      dogGroup.rotation.y = -0.18;
      dogGroup.add(box(0.56, 0.03, 0.28, '#f7fafc', 0, 0.02, 0));
      const wallF = box(0.58, 0.075, 0.024, '#e53e3e', 0, 0.052, 0.145);
      wallF.rotation.x = 0.28;
      const wallB = box(0.58, 0.075, 0.024, '#e53e3e', 0, 0.052, -0.145);
      wallB.rotation.x = -0.28;
      const wallL = box(0.024, 0.075, 0.28, '#f7fafc', -0.285, 0.052, 0);
      wallL.rotation.z = 0.28;
      const wallR = box(0.024, 0.075, 0.28, '#f7fafc', 0.285, 0.052, 0);
      wallR.rotation.z = -0.28;
      dogGroup.add(wallF, wallB, wallL, wallR);
      for (const cx of [-0.2, 0, 0.2]) {
        const chk = box(0.08, 0.068, 0.028, '#f7fafc', cx, 0.055, 0.146);
        chk.rotation.x = 0.28;
        dogGroup.add(chk);
      }
      for (const side of [-1, 1] as const) {
        const bz = side * 0.058;
        const bunCyl = cyl(0.068, 0.068, 0.38, '#ecc94b', 0, 0.11, bz, 12);
        bunCyl.rotation.z = Math.PI / 2;
        dogGroup.add(bunCyl);
        dogGroup.add(sphere(0.068, '#ecc94b', -0.19, 0.11, bz));
        dogGroup.add(sphere(0.068, '#ecc94b', 0.19, 0.11, bz));
      }
      const frank = cyl(0.058, 0.058, 0.48, '#b83227', 0, 0.155, 0, 12);
      frank.rotation.z = Math.PI / 2;
      dogGroup.add(frank);
      dogGroup.add(sphere(0.058, '#b83227', -0.24, 0.155, 0));
      dogGroup.add(sphere(0.058, '#b83227', 0.24, 0.155, 0));
      for (let i = -4; i <= 4; i++) {
        const mx = i * 0.046;
        const mz = Math.sin(i * 1.15) * 0.026;
        dogGroup.add(sphere(0.024, '#ffea79', mx, 0.215, mz));
        if (i % 2 === 0) {
          dogGroup.add(sphere(0.018, '#48bb78', mx + 0.015, 0.202, -mz * 0.8));
        }
      }
      dogGroup.add(cyl(0.01, 0.01, 0.3, '#fbd38d', -0.02, 0.34, 0, 8));
      dogGroup.add(sphere(0.018, '#f6e05e', -0.02, 0.49, 0));
      dogGroup.add(box(0.18, 0.11, 0.018, '#e53e3e', 0.075, 0.42, 0));
      dogGroup.add(box(0.18, 0.022, 0.022, '#ffffff', 0.075, 0.44, 0));
      dogGroup.add(box(0.18, 0.022, 0.022, '#ffffff', 0.075, 0.4, 0));
      dogGroup.add(box(0.08, 0.06, 0.026, '#2b6cb0', 0.025, 0.445, 0));
      g.add(dogGroup);
      break;
    }
    case 'stocking': {
      const stockGroup = new THREE.Group();
      stockGroup.position.set(-0.02, 0.02, 0);
      stockGroup.rotation.z = -0.08;
      const leg = cyl(0.115, 0.105, 0.3, '#c53030', -0.05, 0.25, 0, 14);
      leg.rotation.z = 0.08;
      stockGroup.add(leg);
      const foot = cyl(0.095, 0.088, 0.22, '#c53030', 0.06, 0.105, 0, 14);
      foot.rotation.z = Math.PI / 2 - 0.12;
      stockGroup.add(foot);
      stockGroup.add(sphere(0.102, '#2f855a', -0.07, 0.1, 0));
      const toeCap = sphere(0.092, '#ecc94b', 0.175, 0.092, 0);
      toeCap.scale.set(1.12, 0.95, 0.98);
      stockGroup.add(toeCap);
      const cuff = cyl(0.135, 0.128, 0.11, '#f7fafc', -0.065, 0.41, 0, 14);
      cuff.rotation.z = 0.08;
      stockGroup.add(cuff);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        stockGroup.add(
          sphere(0.048, '#ffffff', -0.065 + Math.cos(ang) * 0.105, 0.41, Math.sin(ang) * 0.105),
        );
      }
      const hangLoop = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.012, 8, 14), mat('#e53e3e'));
      hangLoop.position.set(-0.185, 0.43, 0);
      stockGroup.add(hangLoop);
      const cane = new THREE.Group();
      cane.position.set(-0.11, 0.46, 0.02);
      cane.rotation.z = 0.28;
      for (let s = 0; s < 5; s++) {
        cane.add(cyl(0.022, 0.022, 0.032, s % 2 === 0 ? '#ffffff' : '#e53e3e', 0, s * 0.03, 0, 10));
      }
      const caneHook = new THREE.Mesh(
        new THREE.TorusGeometry(0.038, 0.021, 8, 12, Math.PI),
        mat('#e53e3e'),
      );
      caneHook.position.set(-0.038, 0.135, 0);
      cane.add(caneHook);
      stockGroup.add(cane);
      const miniGift = buildPresentBox(
        0.11,
        0.1,
        0.1,
        '#2f855a',
        '#f6e05e',
        -0.02,
        0.45,
        -0.01,
        0.35,
      );
      miniGift.rotation.z = -0.22;
      stockGroup.add(miniGift);
      stockGroup.add(glowSphere(0.045, '#f6e05e', -0.05, 0.48, 0.055, 0.4));
      g.add(stockGroup);
      break;
    }
    case 'goldenegg': {
      const eggGroup = new THREE.Group();
      const nestColors = ['#8c6239', '#6b4226', '#b7791f'];
      for (let i = 0; i < 3; i++) {
        const twigRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.18 - i * 0.012, 0.028, 8, 16),
          mat(nestColors[i] ?? '#8c6239'),
        );
        twigRing.rotation.x = Math.PI / 2 + (i - 1) * 0.12;
        twigRing.rotation.y = i * 0.6;
        twigRing.position.set(0, 0.045 + i * 0.022, 0);
        twigRing.castShadow = true;
        eggGroup.add(twigRing);
      }
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const stick = cyl(
          0.012,
          0.014,
          0.18,
          i % 2 === 0 ? '#6b4226' : '#8c6239',
          Math.cos(ang) * 0.185,
          0.065,
          Math.sin(ang) * 0.185,
          6,
        );
        stick.rotation.x = Math.cos(ang) * 1.35;
        stick.rotation.z = Math.sin(ang) * 1.35;
        eggGroup.add(stick);
      }
      const moss = sphere(0.155, '#48bb78', 0, 0.06, 0);
      moss.scale.set(1.1, 0.45, 1.1);
      eggGroup.add(moss);
      eggGroup.add(sphere(0.032, '#fbb6ce', -0.17, 0.1, 0.09));
      eggGroup.add(sphere(0.032, '#90cdf4', 0.16, 0.1, 0.1));
      eggGroup.add(sphere(0.028, '#fefcbf', 0.04, 0.11, 0.18));
      const egg = glowSphere(0.175, '#f6e05e', 0, 0.27, 0, 0.45);
      egg.scale.set(0.86, 1.28, 0.86);
      eggGroup.add(egg);
      const waistBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.148, 0.016, 8, 20),
        mat('#d69e2e'),
      );
      waistBand.rotation.x = Math.PI / 2;
      waistBand.position.set(0, 0.26, 0);
      eggGroup.add(waistBand);
      const jewelCount = 6;
      for (let i = 0; i < jewelCount; i++) {
        const ang = (i / jewelCount) * Math.PI * 2;
        const jHex = i % 2 === 0 ? '#e53e3e' : '#3182ce';
        eggGroup.add(
          glowSphere(0.022, jHex, Math.cos(ang) * 0.158, 0.26, Math.sin(ang) * 0.158, 0.65),
        );
      }
      eggGroup.add(cyl(0.038, 0.026, 0.032, '#d69e2e', 0, 0.495, 0, 8));
      eggGroup.add(glowSphere(0.022, '#ffffff', 0, 0.52, 0, 0.8));
      g.add(eggGroup);
      break;
    }
    case 'pumpkinpie': {
      const pieGroup = new THREE.Group();
      pieGroup.position.set(-0.02, 0.01, -0.02);
      const sliceAngle = Math.PI * 0.36;
      const mainStart = sliceAngle / 2;
      const mainArc = Math.PI * 2 - sliceAngle;
      pieGroup.add(cyl(0.28, 0.22, 0.07, '#fffaf0', 0, 0.035, 0, 20));
      const crustGeo = new THREE.CylinderGeometry(
        0.265,
        0.225,
        0.1,
        24,
        1,
        false,
        mainStart,
        mainArc,
      );
      const crustMesh = new THREE.Mesh(crustGeo, mat('#ecc94b'));
      crustMesh.position.set(0, 0.065, 0);
      crustMesh.rotation.y = -Math.PI / 3;
      crustMesh.castShadow = true;
      crustMesh.receiveShadow = true;
      pieGroup.add(crustMesh);
      const fillGeo = new THREE.CylinderGeometry(
        0.235,
        0.205,
        0.11,
        24,
        1,
        false,
        mainStart,
        mainArc,
      );
      const fillMesh = new THREE.Mesh(fillGeo, mat('#dd6b20'));
      fillMesh.position.set(0, 0.072, 0);
      fillMesh.rotation.y = -Math.PI / 3;
      fillMesh.castShadow = true;
      fillMesh.receiveShadow = true;
      pieGroup.add(fillMesh);
      const numScallops = 14;
      for (let i = 0; i < numScallops; i++) {
        const ang = -Math.PI / 3 + mainStart + ((i + 0.5) / numScallops) * mainArc;
        const sx = Math.sin(ang) * 0.248;
        const sz = Math.cos(ang) * 0.248;
        const crimp = sphere(0.034, i % 2 === 0 ? '#ecc94b' : '#d69e2e', sx, 0.12, sz);
        crimp.scale.set(1.1, 0.65, 1.1);
        pieGroup.add(crimp);
      }
      const numCream = 5;
      for (let i = 0; i < numCream; i++) {
        const ang = -Math.PI / 3 + mainStart + ((i + 0.5) / numCream) * mainArc;
        const cx = Math.sin(ang) * 0.155;
        const cz = Math.cos(ang) * 0.155;
        pieGroup.add(sphere(0.036, '#ffffff', cx, 0.138, cz));
        pieGroup.add(sphere(0.022, '#fffaf0', cx, 0.165, cz));
      }
      const wedgeGroup = new THREE.Group();
      wedgeGroup.position.set(0.085, 0.012, 0.065);
      wedgeGroup.rotation.y = -Math.PI / 3;
      const wCrust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.265, 0.225, 0.1, 10, 1, false, -sliceAngle / 2, sliceAngle),
        mat('#ecc94b'),
      );
      wCrust.position.y = 0.065;
      wCrust.castShadow = true;
      const wFill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.235, 0.205, 0.112, 10, 1, false, -sliceAngle / 2, sliceAngle),
        mat('#c05621'),
      );
      wFill.position.y = 0.072;
      wFill.castShadow = true;
      wedgeGroup.add(wCrust, wFill);
      wedgeGroup.add(sphere(0.038, '#ffffff', 0, 0.14, 0.15));
      wedgeGroup.add(sphere(0.024, '#fffaf0', 0, 0.168, 0.15));
      wedgeGroup.add(sphere(0.034, '#ecc94b', -0.05, 0.12, 0.24));
      wedgeGroup.add(sphere(0.034, '#d69e2e', 0.05, 0.12, 0.24));
      pieGroup.add(wedgeGroup);
      g.add(pieGroup);
      break;
    }
    case 'jack': {
      const jackGroup = new THREE.Group();
      const core = sphere(0.22, '#dd6b20', 0, 0.22, 0);
      core.scale.set(1.12, 0.92, 1.12);
      jackGroup.add(core);
      const lobeCount = 8;
      for (let i = 0; i < lobeCount; i++) {
        const ang = (i / lobeCount) * Math.PI * 2;
        const lobeHex = i % 2 === 0 ? '#ed8936' : '#dd6b20';
        const lobe = sphere(0.145, lobeHex, Math.cos(ang) * 0.12, 0.22, Math.sin(ang) * 0.12);
        lobe.scale.set(0.95, 1.38, 0.95);
        jackGroup.add(lobe);
      }
      const stemBase = cyl(0.036, 0.058, 0.09, '#2f855a', 0, 0.43, 0, 10);
      stemBase.rotation.z = 0.18;
      const stemTip = cyl(0.018, 0.036, 0.08, '#276749', -0.025, 0.49, 0, 8);
      stemTip.rotation.z = 0.52;
      const leaf = sphere(0.055, '#38a169', 0.065, 0.42, 0.02);
      leaf.scale.set(1.4, 0.32, 0.95);
      leaf.rotation.z = -0.28;
      jackGroup.add(stemBase, stemTip, leaf);
      const glowM = glowMat('#ffea79', 1.25);
      for (const side of [-1, 1] as const) {
        const eye = new THREE.Mesh(new THREE.ConeGeometry(0.058, 0.085, 3), glowM);
        eye.position.set(side * 0.095, 0.27, 0.245);
        eye.rotation.y = Math.PI;
        eye.rotation.z = -side * 0.12;
        jackGroup.add(eye);
      }
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.055, 3), glowM);
      nose.position.set(0, 0.21, 0.258);
      nose.rotation.y = Math.PI;
      jackGroup.add(nose);
      const grinSegs: [number, number, number, number][] = [
        [-0.12, 0.155, 0.238, -0.38],
        [-0.06, 0.13, 0.25, -0.18],
        [0, 0.122, 0.255, 0],
        [0.06, 0.13, 0.25, 0.18],
        [0.12, 0.155, 0.238, 0.38],
      ];
      for (const [gx, gy, gz, rotZ] of grinSegs) {
        const seg = glowBox(0.072, 0.048, 0.03, '#ffea79', gx, gy, gz, 1.25);
        seg.rotation.z = rotZ;
        jackGroup.add(seg);
      }
      jackGroup.add(box(0.028, 0.026, 0.036, '#dd6b20', -0.045, 0.148, 0.256));
      jackGroup.add(box(0.028, 0.026, 0.036, '#dd6b20', 0.045, 0.148, 0.256));
      g.add(jackGroup);
      break;
    }
    case 'basket': {
      const basketGroup = new THREE.Group();
      basketGroup.add(cyl(0.24, 0.16, 0.2, '#d69e2e', 0, 0.1, 0, 16));
      for (const [ry, rRad] of [
        [0.05, 0.185],
        [0.11, 0.21],
        [0.17, 0.232],
      ] as const) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(rRad, 0.016, 8, 18), mat('#b7791f'));
        rib.rotation.x = Math.PI / 2;
        rib.position.set(0, ry, 0);
        rib.castShadow = true;
        basketGroup.add(rib);
      }
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.026, 10, 20), mat('#b7791f'));
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 0.205, 0);
      rim.castShadow = true;
      basketGroup.add(rim);
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.235, 0.022, 10, 22, Math.PI),
        mat('#b7791f'),
      );
      handle.position.set(0, 0.205, 0);
      handle.castShadow = true;
      basketGroup.add(handle);
      const bowNode = new THREE.Group();
      bowNode.position.set(-0.215, 0.3, 0.03);
      bowNode.rotation.z = 0.45;
      for (const side of [-1, 1] as const) {
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.014, 8, 12), mat('#ed64a6'));
        loop.position.set(side * 0.036, 0, 0);
        loop.rotation.y = side * 0.35;
        bowNode.add(loop);
      }
      bowNode.add(sphere(0.022, '#fbb6ce', 0, 0, 0.01));
      basketGroup.add(bowNode);
      const grass = sphere(0.22, '#48bb78', 0, 0.19, 0);
      grass.scale.set(1.05, 0.38, 1.05);
      basketGroup.add(grass);
      const eggs: { x: number; y: number; z: number; rz: number; hex: string; band: string }[] = [
        { x: -0.1, y: 0.25, z: 0.05, rz: 0.25, hex: '#fbb6ce', band: '#f6e05e' },
        { x: 0.1, y: 0.25, z: 0.04, rz: -0.22, hex: '#90cdf4', band: '#ffffff' },
        { x: 0, y: 0.27, z: -0.04, rz: 0.08, hex: '#fefcbf', band: '#ed64a6' },
        { x: -0.06, y: 0.24, z: -0.09, rz: -0.3, hex: '#b794f4', band: '#fefcbf' },
        { x: 0.08, y: 0.24, z: -0.08, rz: 0.28, hex: '#68d391', band: '#ffffff' },
      ];
      for (const e of eggs) {
        const eg = new THREE.Group();
        eg.position.set(e.x, e.y, e.z);
        eg.rotation.z = e.rz;
        const shell = sphere(0.072, e.hex, 0, 0, 0);
        shell.scale.set(0.84, 1.26, 0.84);
        eg.add(shell);
        const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.009, 6, 14), mat(e.band));
        stripe.rotation.x = Math.PI / 2;
        eg.add(stripe);
        basketGroup.add(eg);
      }
      g.add(basketGroup);
      break;
    }
    case 'flag': {
      const flagGroup = new THREE.Group();
      flagGroup.add(cyl(0.15, 0.18, 0.045, '#b7791f', -0.1, 0.022, 0, 16));
      flagGroup.add(cyl(0.1, 0.14, 0.04, '#d69e2e', -0.1, 0.06, 0, 14));
      flagGroup.add(cyl(0.04, 0.06, 0.04, '#ecc94b', -0.1, 0.095, 0, 12));
      flagGroup.add(cyl(0.022, 0.024, 0.52, '#f7fafc', -0.1, 0.34, 0, 10));
      flagGroup.add(cyl(0.03, 0.03, 0.025, '#d69e2e', -0.1, 0.59, 0, 10));
      flagGroup.add(glowSphere(0.042, '#f6e05e', -0.1, 0.63, 0, 0.35));
      const panels: { x: number; z: number; ry: number; w: number }[] = [
        { x: -0.02, z: 0.012, ry: -0.26, w: 0.14 },
        { x: 0.1, z: 0.028, ry: 0.24, w: 0.14 },
        { x: 0.22, z: 0.01, ry: -0.22, w: 0.14 },
      ];
      const stripeH = 0.034;
      const baseY = 0.34;
      for (let pIdx = 0; pIdx < panels.length; pIdx++) {
        const p = panels[pIdx];
        if (!p) continue;
        const pGroup = new THREE.Group();
        pGroup.position.set(p.x, baseY, p.z);
        pGroup.rotation.y = p.ry;
        for (let s = 0; s < 7; s++) {
          const sy = s * stripeH;
          const isCanton = pIdx === 0 && s >= 3;
          const sHex = isCanton ? '#2b6cb0' : s % 2 === 0 ? '#e53e3e' : '#ffffff';
          pGroup.add(box(p.w + 0.012, stripeH + 0.003, 0.032, sHex, 0, sy, 0));
        }
        if (pIdx === 0) {
          for (const sx of [-0.036, 0, 0.036]) {
            for (const sy of [3.5 * stripeH, 4.7 * stripeH, 5.8 * stripeH]) {
              pGroup.add(sphere(0.012, '#ffffff', sx, sy, 0.018));
              pGroup.add(sphere(0.012, '#ffffff', sx, sy, -0.018));
            }
          }
        }
        flagGroup.add(pGroup);
      }
      g.add(flagGroup);
      break;
    }
    case 'cornucopia': {
      const cornGroup = new THREE.Group();
      cornGroup.position.set(0, 0.02, 0);
      cornGroup.rotation.y = -0.28;
      const mouthGroup = new THREE.Group();
      mouthGroup.position.set(-0.1, 0.2, 0.04);
      mouthGroup.rotation.z = 0.22;
      mouthGroup.rotation.y = -0.35;
      const rimMat = mat('#b7791f');
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.032, 10, 20), rimMat);
      rim.rotation.y = Math.PI / 2;
      rim.castShadow = true;
      rim.receiveShadow = true;
      mouthGroup.add(rim);
      const innerCavity = cyl(0.155, 0.14, 0.05, '#3b2313', 0.02, 0, 0, 16);
      innerCavity.rotation.z = Math.PI / 2;
      mouthGroup.add(innerCavity);
      cornGroup.add(mouthGroup);
      const hornSegs: {
        x: number;
        y: number;
        z: number;
        r1: number;
        r2: number;
        len: number;
        rz: number;
        ry: number;
        hex: string;
      }[] = [
        {
          x: -0.02,
          y: 0.19,
          z: 0.01,
          r1: 0.125,
          r2: 0.155,
          len: 0.16,
          rz: -1.48,
          ry: -0.25,
          hex: '#d69e2e',
        },
        {
          x: 0.09,
          y: 0.2,
          z: -0.02,
          r1: 0.095,
          r2: 0.128,
          len: 0.15,
          rz: -1.22,
          ry: -0.15,
          hex: '#b7791f',
        },
        {
          x: 0.18,
          y: 0.25,
          z: -0.04,
          r1: 0.068,
          r2: 0.098,
          len: 0.14,
          rz: -0.78,
          ry: -0.05,
          hex: '#d69e2e',
        },
        {
          x: 0.23,
          y: 0.33,
          z: -0.04,
          r1: 0.042,
          r2: 0.07,
          len: 0.13,
          rz: -0.22,
          ry: 0.05,
          hex: '#b7791f',
        },
        {
          x: 0.22,
          y: 0.41,
          z: -0.03,
          r1: 0.018,
          r2: 0.044,
          len: 0.11,
          rz: 0.45,
          ry: 0.1,
          hex: '#d69e2e',
        },
      ];
      for (const s of hornSegs) {
        const seg = cyl(s.r1, s.r2, s.len, s.hex, s.x, s.y, s.z, 12);
        seg.rotation.z = s.rz;
        seg.rotation.y = s.ry;
        cornGroup.add(seg);
      }
      cornGroup.add(sphere(0.024, '#b7791f', 0.19, 0.45, -0.02));
      const pumpkin = sphere(0.095, '#ed8936', -0.16, 0.14, 0.08);
      pumpkin.scale.set(1.16, 0.84, 1.16);
      cornGroup.add(pumpkin);
      cornGroup.add(cyl(0.012, 0.016, 0.045, '#2f855a', -0.16, 0.22, 0.08, 8));
      cornGroup.add(sphere(0.072, '#e53e3e', -0.09, 0.24, 0.1));
      const gourd = sphere(0.068, '#48bb78', -0.2, 0.21, -0.02);
      gourd.scale.set(0.9, 1.3, 0.9);
      gourd.rotation.z = 0.45;
      cornGroup.add(gourd);
      const cornEar = cyl(0.028, 0.038, 0.16, '#f6e05e', -0.22, 0.14, 0.02, 10);
      cornEar.rotation.z = 1.15;
      cornEar.rotation.y = 0.3;
      const husk = cyl(0.015, 0.04, 0.14, '#38a169', -0.2, 0.12, -0.02, 8);
      husk.rotation.z = 1.35;
      cornGroup.add(cornEar, husk);
      const grapes: [number, number, number][] = [
        [-0.11, 0.11, 0.15],
        [-0.07, 0.14, 0.16],
        [-0.14, 0.15, 0.15],
        [-0.08, 0.09, 0.17],
        [-0.12, 0.08, 0.18],
      ];
      for (const [gx, gy, gz] of grapes) {
        cornGroup.add(sphere(0.032, '#805ad5', gx, gy, gz));
      }
      g.add(cornGroup);
      break;
    }
    case 'bow': {
      const bowGroup = new THREE.Group();
      bowGroup.position.set(0, 0.28, 0);
      bowGroup.rotation.z = -0.38;
      const staveMat = mat('#f6e05e');
      const archGeo = new THREE.TorusGeometry(0.22, 0.026, 10, 24, Math.PI * 1.08);
      const arch = new THREE.Mesh(archGeo, staveMat);
      arch.rotation.z = -Math.PI * 0.04;
      arch.position.set(0, -0.02, 0);
      arch.castShadow = true;
      arch.receiveShadow = true;
      bowGroup.add(arch);
      for (const side of [-1, 1] as const) {
        const tipCurl = cyl(0.012, 0.026, 0.11, '#ecc94b', side * 0.23, -0.06, 0, 10);
        tipCurl.rotation.z = side * 0.55;
        bowGroup.add(tipCurl);
        bowGroup.add(sphere(0.032, '#fff5f7', side * 0.25, -0.1, 0));
      }
      const grip = cyl(0.034, 0.034, 0.11, '#d53f8c', 0, 0.2, 0, 10);
      grip.rotation.z = Math.PI / 2;
      bowGroup.add(grip);
      for (const side of [-1, 1] as const) {
        const collar = cyl(0.038, 0.038, 0.022, '#ecc94b', side * 0.058, 0.2, 0, 10);
        collar.rotation.z = Math.PI / 2;
        bowGroup.add(collar);
      }
      for (const side of [-1, 1] as const) {
        const str = cyl(0.007, 0.007, 0.25, '#f7fafc', side * 0.12, -0.12, 0, 6, false);
        str.rotation.z = side * 1.24;
        bowGroup.add(str);
      }
      bowGroup.add(cyl(0.016, 0.016, 0.5, '#fbd38d', 0, 0.09, 0.025, 8));
      const heartGroup = new THREE.Group();
      heartGroup.position.set(0, 0.35, 0.025);
      heartGroup.scale.set(1, 1, 0.58);
      heartGroup.add(glowSphere(0.052, '#e53e3e', -0.032, 0.025, 0, 0.45));
      heartGroup.add(glowSphere(0.052, '#e53e3e', 0.032, 0.025, 0, 0.45));
      const heartTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.072, 0.11, 12),
        glowMat('#e53e3e', 0.45),
      );
      heartTip.rotation.z = Math.PI;
      heartTip.position.set(0, -0.028, 0);
      heartGroup.add(heartTip);
      bowGroup.add(heartGroup);
      for (const side of [-1, 1] as const) {
        const vane = box(0.055, 0.1, 0.014, '#fff5f7', side * 0.028, -0.12, 0.025);
        vane.rotation.z = side * 0.28;
        bowGroup.add(vane);
        const trimVane = box(0.042, 0.075, 0.018, '#ed64a6', side * 0.024, -0.12, 0.025);
        trimVane.rotation.z = side * 0.28;
        bowGroup.add(trimVane);
      }
      g.add(bowGroup);
      break;
    }
    case 'broom': {
      const broomGroup = new THREE.Group();
      broomGroup.position.set(0, 0.28, 0);
      broomGroup.rotation.z = -0.58;
      const shaftLow = cyl(0.026, 0.032, 0.24, '#5c3820', 0, 0.02, 0, 10);
      const shaftMid = cyl(0.024, 0.026, 0.22, '#6b4226', -0.016, 0.23, 0, 10);
      shaftMid.rotation.z = 0.14;
      const shaftTop = cyl(0.018, 0.025, 0.16, '#5c3820', -0.012, 0.39, 0, 10);
      shaftTop.rotation.z = -0.22;
      const pommel = sphere(0.028, '#4a2c18', 0.006, 0.46, 0);
      broomGroup.add(shaftLow, shaftMid, shaftTop, pommel);
      broomGroup.add(sphere(0.078, '#b7791f', 0, -0.08, 0));
      broomGroup.add(cyl(0.072, 0.165, 0.26, '#d69e2e', 0, -0.2, 0, 14));
      const tuftCount = 8;
      for (let i = 0; i < tuftCount; i++) {
        const ang = (i / tuftCount) * Math.PI * 2;
        const tx = Math.cos(ang) * 0.085;
        const tz = Math.sin(ang) * 0.085;
        const tuftHex = i % 2 === 0 ? '#ecc94b' : '#b7791f';
        const tuft = cyl(0.022, 0.052, 0.24, tuftHex, tx, -0.22, tz, 8);
        tuft.rotation.z = -Math.cos(ang) * 0.26;
        tuft.rotation.x = Math.sin(ang) * 0.26;
        broomGroup.add(tuft);
      }
      broomGroup.add(cyl(0.084, 0.088, 0.036, '#805ad5', 0, -0.1, 0, 12));
      broomGroup.add(cyl(0.09, 0.092, 0.02, '#f6e05e', 0, -0.12, 0, 12));
      broomGroup.add(cyl(0.11, 0.115, 0.022, '#f6e05e', 0, -0.17, 0, 12));
      g.add(broomGroup);
      break;
    }
    case 'watermelon': {
      // Fourth of July relic in Valentine's: juicy crimson watermelon wedge with green rind & black seeds
      const wm = new THREE.Group();
      wm.position.set(0, 0.08, 0);
      const rind = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.09, 18, 1, false, 0, Math.PI),
        mat('#2f855a'),
      );
      rind.rotation.z = Math.PI / 2;
      rind.rotation.y = Math.PI / 2;
      rind.position.set(0, 0.16, 0);
      const pith = new THREE.Mesh(
        new THREE.CylinderGeometry(0.215, 0.215, 0.095, 18, 1, false, 0, Math.PI),
        mat('#f0fff4'),
      );
      pith.rotation.z = Math.PI / 2;
      pith.rotation.y = Math.PI / 2;
      pith.position.set(0, 0.16, 0);
      const flesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.195, 0.195, 0.1, 18, 1, false, 0, Math.PI),
        mat('#e53e3e'),
      );
      flesh.rotation.z = Math.PI / 2;
      flesh.rotation.y = Math.PI / 2;
      flesh.position.set(0, 0.16, 0);
      wm.add(rind, pith, flesh);
      for (const [sx, sy] of [
        [-0.08, 0.1],
        [0, 0.08],
        [0.08, 0.1],
        [-0.04, 0.13],
        [0.04, 0.13],
      ] as const) {
        wm.add(sphere(0.016, '#1a202c', sx, sy, 0.052));
        wm.add(sphere(0.016, '#1a202c', sx, sy, -0.052));
      }
      g.add(wm);
      break;
    }
    case 'wishbone': {
      // Thanksgiving relic in Valentine's: golden lucky wishbone tied with a crimson ribbon
      const wb = new THREE.Group();
      wb.position.set(0, 0.04, 0);
      for (const side of [-1, 1] as const) {
        const leg = cyl(0.024, 0.032, 0.34, '#f6e05e', side * 0.085, 0.18, 0, 10);
        leg.rotation.z = side * 0.32;
        wb.add(leg);
        wb.add(sphere(0.032, '#ecc94b', side * 0.135, 0.035, 0));
      }
      wb.add(sphere(0.042, '#f6e05e', 0, 0.33, 0));
      wb.add(cyl(0.026, 0.026, 0.07, '#f6e05e', 0, 0.38, 0, 10));
      wb.add(box(0.14, 0.032, 0.048, '#e53e3e', 0, 0.33, 0.02));
      g.add(wb);
      break;
    }
    case 'candycane': {
      // Christmas relic in Valentine's: oversized peppermint candy cane with a green holly bow
      const cc = new THREE.Group();
      cc.position.set(0.03, 0.02, 0);
      for (let s = 0; s < 7; s++) {
        cc.add(
          cyl(0.04, 0.04, 0.048, s % 2 === 0 ? '#ffffff' : '#e53e3e', 0, 0.04 + s * 0.046, 0, 12),
        );
      }
      const hook = new THREE.Mesh(
        new THREE.TorusGeometry(0.085, 0.038, 10, 16, Math.PI),
        mat('#e53e3e'),
      );
      hook.position.set(-0.085, 0.35, 0);
      cc.add(hook);
      cc.add(box(0.15, 0.042, 0.055, '#2f855a', 0, 0.22, 0.032));
      cc.add(sphere(0.028, '#ecc94b', 0, 0.22, 0.058));
      g.add(cc);
      break;
    }
    case 'rose': {
      // Valentine's relic in Easter: single long-stemmed crimson rose in a bud vase
      const rg = new THREE.Group();
      rg.add(cyl(0.055, 0.085, 0.18, '#fbd38d', 0, 0.09, 0, 12));
      rg.add(cyl(0.018, 0.02, 0.28, '#2f855a', 0, 0.24, 0, 8));
      for (const side of [-1, 1] as const) {
        const leaf = box(0.09, 0.022, 0.045, '#38a169', side * 0.055, 0.22 + side * 0.03, 0);
        leaf.rotation.z = -side * 0.38;
        rg.add(leaf);
      }
      rg.add(sphere(0.085, '#c53030', 0, 0.39, 0));
      rg.add(sphere(0.062, '#e53e3e', 0, 0.43, 0));
      rg.add(sphere(0.038, '#ed64a6', 0, 0.46, 0));
      g.add(rg);
      break;
    }
    case 'ghost': {
      // Halloween relic in Easter: cute billowy white bedsheet ghost with dark peepholes
      const gg = new THREE.Group();
      gg.add(cyl(0.09, 0.19, 0.32, '#ffffff', 0, 0.18, 0, 16));
      gg.add(sphere(0.115, '#ffffff', 0, 0.34, 0));
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        gg.add(sphere(0.048, '#f7fafc', Math.cos(ang) * 0.15, 0.05, Math.sin(ang) * 0.15));
      }
      gg.add(sphere(0.024, '#1a202c', -0.042, 0.35, 0.1));
      gg.add(sphere(0.024, '#1a202c', 0.042, 0.35, 0.1));
      gg.add(sphere(0.028, '#805ad5', 0, 0.29, 0.105));
      g.add(gg);
      break;
    }
    case 'gingerbread': {
      // Christmas relic in Easter: frosted gingerbread cookie man with icing buttons & bowtie
      const gb = new THREE.Group();
      gb.position.set(0, 0.04, 0);
      gb.add(sphere(0.095, '#b7791f', 0, 0.34, 0));
      gb.add(box(0.16, 0.18, 0.06, '#b7791f', 0, 0.18, 0));
      for (const side of [-1, 1] as const) {
        const arm = box(0.12, 0.055, 0.055, '#b7791f', side * 0.13, 0.21, 0);
        arm.rotation.z = -side * 0.25;
        const leg = box(0.06, 0.12, 0.055, '#b7791f', side * 0.055, 0.05, 0);
        leg.rotation.z = -side * 0.12;
        gb.add(arm, leg);
      }
      gb.add(sphere(0.018, '#ffffff', -0.032, 0.36, 0.085));
      gb.add(sphere(0.018, '#ffffff', 0.032, 0.36, 0.085));
      gb.add(box(0.075, 0.028, 0.025, '#e53e3e', 0, 0.26, 0.035));
      gb.add(sphere(0.022, '#38a169', 0, 0.19, 0.035));
      gb.add(sphere(0.022, '#e53e3e', 0, 0.13, 0.035));
      g.add(gb);
      break;
    }
    case 'chocobunny': {
      // Easter relic in Fourth of July: sculpted milk-chocolate bunny with pastel pink foil bow
      const cb = new THREE.Group();
      cb.add(cyl(0.18, 0.2, 0.04, '#f6e05e', 0, 0.02, 0, 14));
      cb.add(sphere(0.12, '#5c3317', 0, 0.14, 0));
      cb.add(sphere(0.09, '#5c3317', 0, 0.28, 0.02));
      for (const side of [-1, 1] as const) {
        const ear = box(0.045, 0.16, 0.035, '#5c3317', side * 0.038, 0.41, 0.01);
        ear.rotation.z = -side * 0.1;
        cb.add(ear);
      }
      cb.add(box(0.11, 0.038, 0.04, '#ed64a6', 0, 0.21, 0.085));
      cb.add(sphere(0.022, '#f687b3', 0, 0.28, 0.105));
      g.add(cb);
      break;
    }
    case 'harvestcorn': {
      // Thanksgiving relic in Fourth of July: multi-colored Indian harvest corn cob with peeled husks
      const hc = new THREE.Group();
      hc.position.set(0, 0.04, 0);
      const cob = cyl(0.068, 0.085, 0.34, '#ecc94b', 0, 0.2, 0, 14);
      cob.rotation.z = 0.22;
      hc.add(cob);
      for (const [ky, khex] of [
        [0.12, '#9b2c2c'],
        [0.18, '#dd6b20'],
        [0.24, '#ecc94b'],
        [0.3, '#744210'],
      ] as const) {
        const band = cyl(0.082, 0.082, 0.042, khex, (0.2 - ky) * 0.22, ky, 0, 12);
        band.rotation.z = 0.22;
        hc.add(band);
      }
      for (const side of [-1, 1] as const) {
        const husk = box(0.06, 0.26, 0.09, '#d69e2e', side * 0.095, 0.14, 0);
        husk.rotation.z = -side * 0.48;
        hc.add(husk);
      }
      g.add(hc);
      break;
    }
    case 'snowglobe': {
      // Christmas relic in Fourth of July: winter snow globe with a mini evergreen & snow flurries
      const sg = new THREE.Group();
      sg.add(cyl(0.16, 0.19, 0.09, '#744210', 0, 0.045, 0, 16));
      sg.add(cyl(0.165, 0.165, 0.024, '#d69e2e', 0, 0.09, 0, 16));
      sg.add(cyl(0.14, 0.14, 0.03, '#ffffff', 0, 0.11, 0, 14));
      sg.add(cyl(0, 0.085, 0.16, '#2f855a', 0, 0.2, 0, 10));
      sg.add(glowSphere(0.025, '#ffea79', 0, 0.29, 0, 1.1));
      const domeMat = toonMaterial({
        color: hexToNumber('#bee3f8'),
        transparent: true,
        opacity: 0.42,
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.175, 16, 14), domeMat);
      dome.position.set(0, 0.22, 0);
      sg.add(dome);
      g.add(sg);
      break;
    }
    case 'chick': {
      // Easter relic in Halloween: bright yellow marshmallow Peeps-style chick on a purple nest
      const ck = new THREE.Group();
      ck.add(cyl(0.17, 0.19, 0.04, '#ed64a6', 0, 0.02, 0, 14));
      const body = sphere(0.125, '#f6e05e', 0, 0.13, -0.02);
      body.scale.set(0.95, 0.88, 1.25);
      ck.add(body);
      ck.add(sphere(0.092, '#f6e05e', 0, 0.26, 0.05));
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.07, 8), mat('#ed8936'));
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.25, 0.155);
      ck.add(beak);
      ck.add(sphere(0.018, '#1a202c', -0.038, 0.28, 0.125));
      ck.add(sphere(0.018, '#1a202c', 0.038, 0.28, 0.125));
      g.add(ck);
      break;
    }
    case 'picnic': {
      // Fourth of July relic in Halloween: woven picnic hamper with red-white-blue gingham cloth
      const pb = new THREE.Group();
      pb.add(box(0.36, 0.2, 0.24, '#b7791f', 0, 0.1, 0));
      pb.add(box(0.39, 0.035, 0.27, '#e53e3e', 0, 0.21, 0));
      pb.add(box(0.14, 0.04, 0.28, '#ffffff', -0.08, 0.212, 0));
      pb.add(box(0.14, 0.04, 0.28, '#2b6cb0', 0.08, 0.212, 0));
      pb.add(box(0.38, 0.04, 0.25, '#9c6b3b', 0, 0.24, 0));
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.018, 8, 16, Math.PI),
        mat('#744210'),
      );
      handle.position.set(0, 0.25, 0);
      pb.add(handle);
      g.add(pb);
      break;
    }
    case 'gravyboat': {
      // Thanksgiving relic in Halloween: cream porcelain gravy boat on saucer with rich brown gravy
      const gb = new THREE.Group();
      gb.add(cyl(0.21, 0.17, 0.03, '#fffaf0', 0, 0.015, 0, 16));
      gb.add(cyl(0.22, 0.22, 0.015, '#d69e2e', 0, 0.03, 0, 16));
      const bowl = sphere(0.14, '#fffaf0', 0, 0.13, 0);
      bowl.scale.set(1.45, 0.78, 0.92);
      gb.add(bowl);
      const gravy = cyl(0.13, 0.13, 0.025, '#744210', 0, 0.19, 0, 14);
      gravy.scale.set(1.35, 1, 0.82);
      gb.add(gravy);
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 8, 12), mat('#d69e2e'));
      loop.position.set(-0.19, 0.15, 0);
      gb.add(loop);
      g.add(gb);
      break;
    }
    case 'locket': {
      // Valentine's relic in Thanksgiving: gleaming golden heart locket on a gold chain
      const lk = new THREE.Group();
      lk.position.set(0, 0.04, 0);
      const chain = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.012, 8, 18), mat('#ecc94b'));
      chain.rotation.x = Math.PI / 2.4;
      chain.position.set(0, 0.04, 0);
      lk.add(chain);
      for (const side of [-1, 1] as const) {
        lk.add(sphere(0.088, '#f6e05e', side * 0.06, 0.24, 0));
      }
      const tip = cyl(0, 0.14, 0.18, '#f6e05e', 0, 0.15, 0, 12);
      tip.rotation.z = Math.PI;
      lk.add(tip);
      lk.add(sphere(0.048, '#e53e3e', 0, 0.21, 0.075));
      g.add(lk);
      break;
    }
    case 'jellybeans': {
      // Easter relic in Thanksgiving: glass apothecary jar filled with rainbow Easter jelly beans
      const jb = new THREE.Group();
      jb.add(cyl(0.15, 0.15, 0.28, '#fefcbf', 0, 0.15, 0, 14));
      const beanColors = ['#ed64a6', '#48bb78', '#ecc94b', '#9f7aea', '#4299e1', '#f56565'];
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const by = 0.06 + (i % 4) * 0.055;
        jb.add(
          sphere(
            0.042,
            beanColors[i % beanColors.length] ?? '#ed64a6',
            Math.cos(ang) * 0.115,
            by,
            Math.sin(ang) * 0.115,
          ),
        );
      }
      jb.add(cyl(0.12, 0.13, 0.045, '#d69e2e', 0, 0.3, 0, 14));
      jb.add(sphere(0.038, '#ecc94b', 0, 0.34, 0));
      g.add(jb);
      break;
    }
    case 'candycorn': {
      // Halloween relic in Thanksgiving: iconic yellow-orange-white tri-color candy corn trio
      const cc = new THREE.Group();
      for (const [cx, cz, rotZ, sc] of [
        [0, 0.02, 0, 1.05],
        [-0.11, -0.02, 0.22, 0.85],
        [0.11, -0.02, -0.22, 0.85],
      ] as const) {
        const cone = new THREE.Group();
        cone.position.set(cx, 0.02, cz);
        cone.rotation.z = rotZ;
        cone.scale.setScalar(sc);
        cone.add(cyl(0.085, 0.115, 0.1, '#ecc94b', 0, 0.05, 0, 12));
        cone.add(cyl(0.05, 0.085, 0.11, '#dd6b20', 0, 0.155, 0, 12));
        cone.add(cyl(0.01, 0.05, 0.09, '#ffffff', 0, 0.255, 0, 12));
        cc.add(cone);
      }
      g.add(cc);
      break;
    }
    case 'loveletter': {
      // Valentine's relic in Christmas: blush-pink parchment envelope sealed with a crimson heart wax seal
      const ll = new THREE.Group();
      ll.position.set(0, 0.06, 0);
      ll.rotation.x = -0.18;
      ll.add(box(0.36, 0.24, 0.045, '#fff5f7', 0, 0.14, 0));
      ll.add(box(0.37, 0.03, 0.05, '#fbb6ce', 0, 0.25, 0));
      const flap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 4), mat('#fed7e2'));
      flap.rotation.z = Math.PI;
      flap.rotation.y = Math.PI / 4;
      flap.scale.z = 0.28;
      flap.position.set(0, 0.19, 0.022);
      ll.add(flap);
      ll.add(glowSphere(0.048, '#e53e3e', 0, 0.13, 0.032, 0.85));
      g.add(ll);
      break;
    }
    case 'icepop': {
      // Fourth of July relic in Christmas: red-white-blue rocket ice pop on a wooden stick
      const ip = new THREE.Group();
      ip.add(box(0.042, 0.14, 0.018, '#fbd38d', 0, 0.07, 0));
      ip.add(cyl(0.085, 0.09, 0.1, '#2b6cb0', 0, 0.16, 0, 12));
      ip.add(cyl(0.075, 0.085, 0.1, '#ffffff', 0, 0.26, 0, 12));
      ip.add(cyl(0.02, 0.075, 0.11, '#e53e3e', 0, 0.365, 0, 12));
      g.add(ip);
      break;
    }
    case 'cauldron': {
      // Halloween relic in Christmas: cast-iron witch's cauldron bubbling with glowing green potion
      const cd = new THREE.Group();
      cd.add(sphere(0.175, '#2d3748', 0, 0.17, 0));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.026, 10, 18), mat('#1a202c'));
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 0.28, 0);
      cd.add(rim);
      cd.add(cyl(0.135, 0.135, 0.025, '#48bb78', 0, 0.285, 0, 16));
      for (const [bx, bz, br] of [
        [-0.05, 0.03, 0.036],
        [0.05, -0.02, 0.042],
        [0.01, 0.06, 0.028],
      ] as const) {
        cd.add(glowSphere(br, '#68d391', bx, 0.31, bz, 1.1));
      }
      g.add(cd);
      break;
    }
    default: {
      g.add(box(0.42, 0.34, 0.42, accent, 0, 0.17, 0));
      break;
    }
  }
  g.scale.setScalar(1.22);
  g.rotation.x = 0.18;
  return g;
}

function buildPropSilhouette(id: string): {
  group: THREE.Group;
  silMat: THREE.MeshBasicMaterial;
} {
  const group = buildPropMesh(id, '#4a5568');
  const silMat = new THREE.MeshBasicMaterial({
    color: 0x3b4252,
    transparent: true,
    opacity: 0.38,
  });
  group.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.material = silMat;
      c.castShadow = false;
      c.receiveShadow = false;
    }
  });
  return { group, silMat };
}

function buildMascotStageWithCage(
  roomId: RoomId,
  accent: string,
): {
  stage: THREE.Group;
  mascotMesh: THREE.Group;
  cage: THREE.Group;
  baseTopMat: THREE.MeshToonMaterial;
  padlocks: {
    group: THREE.Group;
    bodyMat: THREE.MeshToonMaterial;
    shackle: THREE.Mesh;
  }[];
} {
  const stage = new THREE.Group();
  const hitCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.48, 0.96, 12),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hitCyl.position.set(0, 0.46, 0);
  hitCyl.layers.set(2);
  stage.add(hitCyl);
  const baseBot = cyl(0.38, 0.42, 0.09, '#5c3d24', 0, 0.045, 0, 16);
  const baseTopMat = mat(accent);
  const baseTop = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.37, 0.04, 16), baseTopMat);
  baseTop.position.set(0, 0.1, 0);
  baseBot.receiveShadow = false;
  baseTop.receiveShadow = false;
  stage.add(baseBot, baseTop);

  const mascotMesh = buildMascotMesh(ROOM_MASCOT_ID[roomId], 0.54);
  mascotMesh.position.set(0, 0.12, 0);
  mascotMesh.traverse((c) => {
    c.castShadow = false;
    c.receiveShadow = false;
  });
  stage.add(mascotMesh);

  const cage = new THREE.Group();
  const cageRadius = 0.31;
  const cageBottomY = 0.13;
  const cageTopY = 0.77;
  const cageHeight = cageTopY - cageBottomY;

  const botRing = new THREE.Mesh(new THREE.TorusGeometry(cageRadius, 0.018, 8, 18), mat('#2d3748'));
  botRing.rotation.x = Math.PI / 2;
  botRing.position.set(0, cageBottomY, 0);
  cage.add(botRing);

  const topRing = new THREE.Mesh(new THREE.TorusGeometry(cageRadius, 0.018, 8, 18), mat('#2d3748'));
  topRing.rotation.x = Math.PI / 2;
  topRing.position.set(0, cageTopY, 0);
  cage.add(topRing);

  for (let i = 0; i < 8; i++) {
    const ang = ((i + 0.5) / 8) * Math.PI * 2;
    const bx = Math.sin(ang) * cageRadius;
    const bz = Math.cos(ang) * cageRadius;
    cage.add(cyl(0.016, 0.016, cageHeight, '#4a5568', bx, cageBottomY + cageHeight / 2, bz, 8));
  }

  for (const rotY of [Math.PI / 8, -Math.PI / 8]) {
    const domeArc = new THREE.Mesh(
      new THREE.TorusGeometry(cageRadius, 0.017, 8, 16, Math.PI),
      mat('#2d3748'),
    );
    domeArc.rotation.y = rotY;
    domeArc.position.set(0, cageTopY, 0);
    cage.add(domeArc);
  }
  const hookRing = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.014, 8, 12), mat('#d69e2e'));
  hookRing.position.set(0, cageTopY + cageRadius + 0.03, 0);
  cage.add(hookRing);

  // 5 Padlocks arranged across the front arc of the cage (one per Home Relic)
  const padlocks: {
    group: THREE.Group;
    bodyMat: THREE.MeshToonMaterial;
    shackle: THREE.Mesh;
  }[] = [];
  const lockAngles = [-1.04, -0.52, 0, 0.52, 1.04];
  for (const ang of lockAngles) {
    const lg = new THREE.Group();
    const lx = Math.sin(ang) * (cageRadius + 0.038);
    const lz = Math.cos(ang) * (cageRadius + 0.038);
    lg.position.set(lx, 0.23, lz);
    lg.rotation.y = ang;
    const bodyMat = mat('#c53030');
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.098, 0.042), bodyMat);
    lg.add(bodyMesh);
    lg.add(box(0.092, 0.022, 0.046, '#ecc94b', 0, 0, 0, false));
    const shackle = new THREE.Mesh(
      new THREE.TorusGeometry(0.028, 0.009, 6, 12, Math.PI),
      mat('#cbd5e0'),
    );
    shackle.position.set(0, 0.05, 0);
    lg.add(shackle);
    cage.add(lg);
    padlocks.push({ group: lg, bodyMat, shackle });
  }

  cage.traverse((c) => {
    c.castShadow = false;
    c.receiveShadow = false;
  });
  stage.add(cage);

  return { stage, mascotMesh, cage, baseTopMat, padlocks };
}

export interface HolidayAlcoveConfig {
  roomId: RoomId;
  wallPalette: { wall: string; panel: string; frame: string };
  decorateAlcove: (bay: THREE.Group, flames: FlameEntry[], fireflies: FireflyEntry[]) => void;
  buildCenterpiece: (
    g: THREE.Group,
    accentOrGoldMat: THREE.MeshToonMaterial,
    crownGlowMat: THREE.MeshToonMaterial,
  ) => void;
}

/**
 * Construct a complete Holiday Alcove bay once, pre-building all state variants
 * (lamp on/off, fairy lights, decorative centerpiece materials, mascot cage with
 * 5 padlocks, 5 relic shelves with silhouettes, and 5 relic tables) and returning
 * a `BuiltBay` whose `syncState()` updates everything in-place with zero 3D churn.
 */
export function buildHolidayAlcoveBay(
  config: HolidayAlcoveConfig,
  callbacks: DioramaCallbacks,
): BuiltBay {
  const room: RoomSpec | undefined = ROOM_SPECS.find((r) => r.id === config.roomId);
  if (!room) {
    throw new Error(`Missing RoomSpec for ${config.roomId}`);
  }
  const theta = getBayAngle(room.id);
  const bay = makeBayGroup(theta);
  const flames: FlameEntry[] = [];
  const fireflies: FireflyEntry[] = [];
  const fairyLights: FairyLightEntry[] = [];
  const fxPulses: FxPulseEntry[] = [];
  const floating: FloatingEntry[] = [];

  const { wallPalette } = config;

  // Back wall, recessed wainscoting panel, cornice beam, and pillar
  bay.add(box(WALL_WIDTH, 5.8, 0.28, wallPalette.wall, 0, 2.9, 0, false));
  bay.add(box(WALL_WIDTH - 0.5, 3.05, 0.05, wallPalette.frame, 0, 2.05, 0.13, false));
  bay.add(box(WALL_WIDTH - 0.66, 2.88, 0.07, wallPalette.panel, 0, 2.05, 0.14, false));
  bay.add(box(WALL_WIDTH, 0.34, 0.34, room.accent, 0, 0.17, 0.04, false));
  bay.add(box(WALL_WIDTH, 0.24, 0.38, '#4a3524', 0, 3.85, 0.05, false));
  bay.add(cyl(0.22, 0.26, 5.8, '#3b281a', WALL_WIDTH / 2 - 0.06, 2.9, 0.14, 12, false));

  // Holiday rug segment in front of the bay
  bay.add(box(2.7, 0.03, 2.35, room.floorColor, 0, 0.015, 1.28, false));
  bay.add(box(2.4, 0.04, 2.05, room.accent, 0, 0.02, 1.28, false));
  bay.add(box(2.15, 0.045, 1.8, '#8c6946', 0, 0.024, 1.28, false));

  // Holiday-specific practical lighting & atmospheric props
  config.decorateAlcove(bay, flames, fireflies);

  // Master Holiday Lamp above the bay's centerpiece arch (both on/off meshes pre-built)
  const lampOn = glowSphere(0.2, room.accent, 0, 3.68, 0.24, 1.25);
  const lampOff = sphere(0.2, '#3b4252', 0, 3.68, 0.24, false);
  bay.add(lampOn, lampOff);

  // String of 9 fairy lights draped across the top of the diorama
  for (let i = -4; i <= 4; i++) {
    const bx = i * 0.36;
    const by = 3.48 - Math.cos(i * 0.38) * 0.12;
    const bulbHex = (Math.abs(i) % 2 === 0 ? room.accent : room.secondaryAccent) as `#${string}`;
    bay.add(cyl(0.022, 0.022, 0.04, '#1f2430', bx, by + 0.05, 0.23, 8, false));
    const cNum = hexToNumber(bulbHex);
    const bulbMat = toonMaterial({
      color: cNum,
      emissive: cNum,
      emissiveIntensity: 1.1,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), bulbMat);
    bulb.position.set(bx, by, 0.24);
    bulb.castShadow = false;
    bulb.receiveShadow = false;
    bay.add(bulb);
    fairyLights.push({
      mat: bulbMat,
      baseColor: new THREE.Color(cNum),
      offColor: new THREE.Color(0x2a303c),
      phase: i * 0.9 + theta * 1.7,
      active: false,
    });
  }

  // TIER 1 (TOP-CENTER): LARGE MASCOT CAGE ON A RAISED ALTAR SHELF (locked by 5 padlocks)
  const cageShelfGroup = new THREE.Group();
  cageShelfGroup.position.set(0, 2.02, 0.42);
  cageShelfGroup.add(box(1.48, 0.16, 0.64, '#6b4928', 0, 0, 0, false));
  cageShelfGroup.add(box(1.38, 0.06, 0.58, '#d69e2e', 0, 0.1, 0, false));
  cageShelfGroup.traverse((c) => {
    c.castShadow = false;
  });
  bay.add(cageShelfGroup);

  const {
    stage: mascotStage,
    mascotMesh,
    cage,
    baseTopMat,
    padlocks,
  } = buildMascotStageWithCage(room.id, room.accent);
  mascotStage.position.set(0, 2.05, 0.45);
  mascotStage.scale.setScalar(1.38);
  mascotStage.traverse((c) => {
    c.castShadow = false;
  });
  bay.add(mascotStage);
  floating.push({ mesh: mascotMesh, phase: theta + 1.1, baseY: 0.12 });

  // DECORATIVE ROOM PROP (formerly the centerpiece sculpture): sits on a low central rug
  // plinth in front of the back wall so it never collides with the wall shelves or mantle.
  const cpGroup = new THREE.Group();
  cpGroup.position.set(0, 0.04, 0.92);
  cpGroup.scale.setScalar(0.58);
  const cpAccentOrGoldMat = mat(room.accent);
  const cpCrownGlowMat = glowMat('#f6e05e', 0.95);
  const cpSculpture = new THREE.Group();
  config.buildCenterpiece(cpSculpture, cpAccentOrGoldMat, cpCrownGlowMat);
  cpSculpture.rotation.x = 0.12;
  const cpDecorativeMats: {
    mat: THREE.MeshToonMaterial;
    baseColor: THREE.Color;
    baseEmissive: THREE.Color;
    baseEmissiveIntensity: number;
  }[] = [];
  const seenMats = new Set<THREE.Material>();
  cpSculpture.traverse((c) => {
    c.castShadow = false;
    if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshToonMaterial) {
      if (!seenMats.has(c.material)) {
        seenMats.add(c.material);
        cpDecorativeMats.push({
          mat: c.material,
          baseColor: c.material.color.clone(),
          baseEmissive: c.material.emissive.clone(),
          baseEmissiveIntensity: c.material.emissiveIntensity,
        });
      }
    }
  });
  cpGroup.add(cpSculpture);
  bay.add(cpGroup);

  // TIER 2: FIVE WALL-MOUNTED RELIC SHELVES IN A SEMICIRCLE AROUND & BELOW THE CAGE
  // Left upper -> Left lower -> Bottom center -> Right lower -> Right upper
  const shelfArc: readonly { x: number; y: number; z: number }[] = [
    { x: -1.2, y: 2.38, z: 0.42 },
    { x: -0.96, y: 1.78, z: 0.44 },
    { x: 0, y: 1.44, z: 0.46 },
    { x: 0.96, y: 1.78, z: 0.44 },
    { x: 1.2, y: 2.38, z: 0.42 },
  ];
  const shelfEntries = room.homeRelics.map((reqId, idx) => {
    const slot = shelfArc[idx] ?? { x: 0, y: 1.32, z: 0.46 };
    const lx = slot.x;
    const ly = slot.y;
    const lz = slot.z;
    const pg = new THREE.Group();
    pg.position.set(lx, ly, lz);
    pg.scale.setScalar(0.76);
    pg.add(cyl(0.28, 0.16, 0.24, '#6b4928', 0, -0.06, -0.06, 14, false));

    const midRingMat = mat('#718096');
    const midRing = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.1, 14), midRingMat);
    midRing.position.set(0, 0.08, 0);
    midRing.receiveShadow = true;
    pg.add(midRing);

    const topRingMat = mat(room.accent);
    const topRing = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.32, 0.06, 14), topRingMat);
    topRing.position.set(0, 0.15, 0);
    topRing.receiveShadow = true;
    pg.add(topRing);

    const placedMesh = buildPropMesh(reqId, room.accent);
    placedMesh.position.set(0, 0.18, 0);
    pg.add(placedMesh);
    floating.push({ mesh: placedMesh, phase: idx + 0.5, baseY: 0.18 });

    const { group: silhouetteMesh, silMat: silhouetteMat } = buildPropSilhouette(reqId);
    silhouetteMesh.position.set(0, 0.18, 0);
    pg.add(silhouetteMesh);

    const emptyCapMat = mat('#4a5568');
    const emptyCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.06, 14), emptyCapMat);
    emptyCap.position.set(0, 0.17, 0);
    emptyCap.receiveShadow = true;
    pg.add(emptyCap);

    pg.traverse((c) => {
      c.castShadow = false;
    });

    bay.add(pg);
    return {
      reqId,
      lx,
      ly,
      lz,
      pg,
      midRingMat,
      topRingMat,
      placedMesh,
      silhouetteMesh,
      silhouetteMat,
      emptyCap,
      emptyCapMat,
    };
  });

  // TIER 3: FIVE RELIC TABLES ON THE FLOOR IN A STAGGERED 2-ROW ARC
  const strayLayout: readonly { x: number; z: number; pillY: number }[] = [
    { x: -1.16, z: 1.64, pillY: 0.42 },
    { x: -0.64, z: 1.26, pillY: 0.84 },
    { x: 0, z: 1.68, pillY: 0.42 },
    { x: 0.64, z: 1.26, pillY: 0.84 },
    { x: 1.16, z: 1.64, pillY: 0.42 },
  ];
  const strayEntries = room.strays.map((stray, idx) => {
    const slot = strayLayout[idx] ?? { x: 0, z: 1.5, pillY: 0.48 };
    const lx = slot.x;
    const lz = slot.z;
    const pillY = slot.pillY;
    const homeRoomSpec = ROOM_SPECS.find((r) => r.id === stray.homeRoom);
    const sg = new THREE.Group();
    sg.position.set(lx, 0, lz);
    sg.scale.setScalar(0.8);
    sg.add(cyl(0.34, 0.28, 0.36, '#6b4928', 0, 0.18, 0));

    const rimMat = mat(homeRoomSpec?.accent ?? room.accent);
    const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.34, 0.06, 14), rimMat);
    rimMesh.position.set(0, 0.38, 0);
    rimMesh.castShadow = true;
    rimMesh.receiveShadow = true;
    sg.add(rimMesh);

    const prop = buildPropMesh(stray.id, room.accent);
    prop.position.set(0, 0.42, 0);
    sg.add(prop);
    floating.push({ mesh: prop, phase: idx * 1.4, baseY: 0.42 });

    bay.add(sg);
    return {
      stray,
      lx,
      lz,
      pillY,
      homeRoomSpec,
      sg,
      rimMat,
      prop,
    };
  });

  const cageFocusPos = bayToWorld(theta, 0, 2.25, 3.6);
  const cageFocusLook = bayToWorld(theta, 0, 2.48, 0.42);
  const homeTwistFocusPos = bayToWorld(theta, 0, 1.75, 3.7);
  const homeTwistFocusLook = bayToWorld(theta, 0, 0.95, 0.55);
  const warmupFocusPos = bayToWorld(theta, 0, 1.65, 3.8);
  const warmupFocusLook = bayToWorld(theta, 0, 1.15, 0.55);
  const centerHeroWorldPos = bayToWorld(theta, 0, 0.62, 1.15);
  const drainedScratchColor = new THREE.Color(0x4a5568);

  // The mascot's exit: the 5th relic lifts the cage away, the mascot hops down from the shelf
  // onto the room floor (world y = 0.045 -> local y = -1.453), and bounces far off the side of the screen.
  const EXIT_SECONDS = 2.15;
  const cageBaseY = cage.position.y;
  const mascotBase = mascotMesh.position.clone();
  const mascotBaseScale = mascotMesh.scale.x;
  const floorLocalY = (0.045 - mascotStage.position.y) / mascotStage.scale.y;
  let wasComplete: boolean | null = null;
  let exitPending = false;
  let exitStart: number | null = null;
  const resetExit = (): void => {
    cage.position.y = cageBaseY;
    mascotMesh.position.copy(mascotBase);
    mascotMesh.rotation.set(0, 0, 0);
    mascotMesh.scale.setScalar(mascotBaseScale);
  };

  const syncState = (hotspotsOut: Hotspot3D[]): void => {
    const complete = gameState.isRoomComplete(room);
    const restoredCount = gameState.roomRestoredRelicCount(room);
    const roomUnlocked = gameState.isRoomUnlocked(room);
    const carriedUnlockItem = gameState.carriedEligibleItemForRoom(room);
    const warmupDone = gameState.solvedRuns.has(room.warmup.id);
    const homeTwistDone = gameState.solvedRuns.has(room.homeTwist.proto.id);
    const homeTwistUnlocked = gameState.isHomeTwistUnlocked(room);
    const strayUnlocked = gameState.isStrayUnlocked(room);

    // Master lamp & fairy lights light up when all 5 relics are placed (mascot freed)
    lampOn.visible = complete;
    lampOff.visible = !complete;
    for (const fl of fairyLights) {
      fl.active = complete;
      if (!complete) {
        fl.mat.color.setHex(0x2d3340);
        fl.mat.emissiveIntensity = 0;
      } else {
        fl.mat.color.copy(fl.baseColor);
        fl.mat.emissiveIntensity = 1.1;
      }
    }

    // Old centerpiece prop stays as background decoration: drained while incomplete, full color when complete
    for (const entry of cpDecorativeMats) {
      if (complete) {
        entry.mat.color.copy(entry.baseColor);
        entry.mat.emissive.copy(entry.baseEmissive);
        entry.mat.emissiveIntensity = entry.baseEmissiveIntensity;
      } else {
        entry.mat.color.copy(entry.baseColor).lerp(drainedScratchColor, 0.72);
        entry.mat.emissiveIntensity = 0;
      }
    }
    if (complete) {
      cpAccentOrGoldMat.color.setHex(hexToNumber('#f6e05e'));
      cpCrownGlowMat.color.setHex(hexToNumber('#ffea79'));
      cpCrownGlowMat.emissive.setHex(hexToNumber('#ffea79'));
      cpCrownGlowMat.emissiveIntensity = 0.95;
    }

    // Mascot cage & 5 padlocks on the top-center shelf (the exit animation hides them itself)
    if (wasComplete === false && complete) {
      exitPending = true;
      exitStart = null;
    }
    if (!complete) {
      exitPending = false;
      resetExit();
    }
    wasComplete = complete;
    cage.visible = !complete || exitPending;
    mascotMesh.visible = !complete || exitPending;
    baseTopMat.color.setHex(hexToNumber((complete ? '#48bb78' : room.accent) as `#${string}`));
    for (let i = 0; i < padlocks.length; i++) {
      const lock = padlocks[i];
      if (!lock) continue;
      const unlockedLock = i < restoredCount;
      lock.bodyMat.color.setHex(hexToNumber(unlockedLock ? '#48bb78' : '#c53030'));
      lock.shackle.position.y = unlockedLock ? 0.056 : 0.04;
      lock.shackle.rotation.y = unlockedLock ? 0.65 : 0;
    }

    hotspotsOut.push({
      id: `mascot:${room.id}`,
      bay: room.id,
      label: complete
        ? `★ ${room.shortTitle} Mascot Freed!`
        : `🔒 ${room.shortTitle} Cage (${restoredCount}/5 Padlocks Open)`,
      sublabel: complete ? 'In Holiday Hall' : 'Place all 5 Relics below to free!',
      icon: complete ? '★' : room.icon,
      status: complete ? 'done' : 'ready',
      accent: room.accent,
      hiddenPill: true,
      worldPos: bayToWorld(theta, 0, 2.38, 0.56),
      cameraPos: cageFocusPos,
      cameraLook: cageFocusLook,
      meshGroup: mascotStage,
      onClick: () => {
        callbacks.onClickMascot?.(room.id);
      },
    });

    // Rung 2: Home Twist Run (5 puzzles, 5×5 → 7×7, unlocked right after Intro Run)
    if (warmupDone) {
      hotspotsOut.push({
        id: `proto:${room.homeTwist.proto.id}`,
        bay: room.id,
        label: homeTwistDone
          ? `✓ ${room.homeTwist.icon} ${room.homeTwist.title}`
          : `${room.homeTwist.icon} ${room.homeTwist.title}`,
        sublabel: homeTwistDone ? '✓ Home Twist Complete' : '▶ Tap to Solve Home Twist',
        icon: homeTwistDone ? '✓' : room.homeTwist.icon,
        status: homeTwistDone ? 'done' : homeTwistUnlocked ? 'ready' : 'locked',
        hero: !homeTwistDone,
        accent: room.accent,
        worldPos: homeTwistDone ? bayToWorld(theta, -0.78, 0.02, 2.16) : centerHeroWorldPos,
        cameraPos: homeTwistFocusPos,
        cameraLook: homeTwistFocusLook,
        onClick: () => {
          if (homeTwistUnlocked) {
            callbacks.onOpenProto(room.homeTwist.proto.id, homeTwistFocusPos, homeTwistFocusLook);
          }
        },
      });
    }

    // Update 5 Relic Shelves in a semicircle around & below the cage
    for (const ped of shelfEntries) {
      const item = STRAY_ITEMS[ped.reqId];
      const hasItem = gameState.solvedRuns.has(item.proto.id);
      const isPlaced = gameState.placedItems.has(ped.reqId);
      const isCarried = hasItem && !isPlaced;
      const foundInRoom = ROOM_SPECS.find((r) => r.strays.some((s) => s.id === ped.reqId));

      ped.placedMesh.visible = isPlaced;
      ped.silhouetteMesh.visible = !isPlaced;
      ped.emptyCap.visible = !isPlaced;
      ped.silhouetteMat.color.setHex(isCarried ? 0xf6e05e : 0x3b4252);
      ped.silhouetteMat.opacity = isCarried ? 0.65 : 0.38;
      ped.midRingMat.color.setHex(
        hexToNumber(isPlaced ? '#48bb78' : isCarried ? '#f6e05e' : '#718096'),
      );
      ped.topRingMat.color.setHex(
        hexToNumber((isPlaced ? '#f6e05e' : room.accent) as `#${string}`),
      );
      ped.emptyCapMat.color.setHex(hexToNumber(isCarried ? '#ecc94b' : '#4a5568'));

      if (roomUnlocked) {
        hotspotsOut.push({
          id: `pedestal:${ped.reqId}`,
          bay: room.id,
          kind: 'return-slot',
          label: `${item.icon} ${item.title}`,
          sublabel: isPlaced
            ? '✓ Padlock Opened'
            : isCarried
              ? '✨ Tap to Place & Open Padlock'
              : `📍 Found in ${foundInRoom?.icon ?? ''} ${foundInRoom?.shortTitle ?? ''}`,
          icon: isPlaced ? '✓' : isCarried ? '✨' : item.icon,
          status: isPlaced ? 'done' : isCarried ? 'place' : 'locked',
          connections: [
            {
              targetId: `mascot:${room.id}`,
              state: isPlaced ? 'done' : isCarried ? 'place' : 'locked',
            },
          ],
          accent: isCarried ? '#d69e2e' : room.accent,
          hiddenPill: true,
          worldPos: bayToWorld(theta, ped.lx, ped.ly - 0.08, ped.lz + 0.22),
          cameraPos: cageFocusPos,
          cameraLook: bayToWorld(theta, ped.lx, ped.ly + 0.15, ped.lz),
          meshGroup: ped.pg,
          onClick: () => {
            if (isCarried) callbacks.onPlaceItem(ped.reqId);
          },
        });
      }
    }

    // Update 5 Relic Tables on the floor (hidden until both home levels are done!)
    for (const st of strayEntries) {
      const strayDone = gameState.solvedRuns.has(st.stray.proto.id);
      st.sg.visible = strayUnlocked;
      st.prop.visible = !strayDone;
      st.rimMat.color.setHex(
        hexToNumber(
          (strayDone ? '#68d391' : (st.homeRoomSpec?.accent ?? room.accent)) as `#${string}`,
        ),
      );

      if (strayUnlocked) {
        const camPos = bayToWorld(theta, st.lx * 0.45, 1.75, 3.8);
        const camLook = bayToWorld(theta, st.lx, 0.64, st.lz);
        const shortStrayTitle = st.stray.title.replace(/^The\s+/i, '');
        hotspotsOut.push({
          id: `proto:${st.stray.proto.id}`,
          bay: room.id,
          label: strayDone
            ? `✓ ${st.stray.icon} ${shortStrayTitle}`
            : `${st.stray.icon} ${shortStrayTitle}`,
          sublabel: strayDone
            ? `✓ Freed → ${st.homeRoomSpec?.shortTitle ?? ''}`
            : `→ ${st.homeRoomSpec?.shortTitle ?? ''}`,
          icon: strayDone ? '✓' : st.stray.icon,
          status: strayDone ? 'done' : 'ready',
          accent: st.homeRoomSpec?.accent ?? room.accent,
          worldPos: bayToWorld(theta, st.lx, st.pillY, st.lz + 0.06),
          cameraPos: camPos,
          cameraLook: camLook,
          meshGroup: st.sg,
          onClick: () => {
            callbacks.onOpenProto(st.stray.proto.id, camPos, camLook);
          },
        });
      }
    }

    // Rung 1: Room lock / relic unlock / Intro Run
    if (!roomUnlocked) {
      if (carriedUnlockItem) {
        hotspotsOut.push({
          id: `unlock:${room.id}`,
          bay: room.id,
          label: `✨ Place ${carriedUnlockItem.icon} ${carriedUnlockItem.title}`,
          sublabel: `▶ Tap to Place Relic & Unlock ${room.shortTitle}`,
          icon: '✨',
          status: 'place',
          accent: '#d69e2e',
          hero: true,
          worldPos: centerHeroWorldPos,
          cameraPos: warmupFocusPos,
          cameraLook: warmupFocusLook,
          onClick: () => callbacks.onPlaceItem(carriedUnlockItem.id),
        });
      } else {
        hotspotsOut.push({
          id: `locked:${room.id}`,
          bay: room.id,
          label: `🔒 ${room.shortTitle} Locked`,
          sublabel: `Bring any ${room.shortTitle} Relic to unlock`,
          icon: '🔒',
          status: 'locked',
          accent: '#718096',
          hero: true,
          worldPos: centerHeroWorldPos,
          cameraPos: warmupFocusPos,
          cameraLook: warmupFocusLook,
          onClick: () => {},
        });
      }
    } else if (!warmupDone) {
      hotspotsOut.push({
        id: `proto:${room.warmup.id}`,
        bay: room.id,
        label: `${room.icon} ${room.warmup.title}`,
        sublabel: '▶ Tap to Start Intro Run',
        icon: '★',
        status: 'ready',
        accent: room.accent,
        hero: true,
        worldPos: centerHeroWorldPos,
        cameraPos: warmupFocusPos,
        cameraLook: warmupFocusLook,
        onClick: () => callbacks.onOpenProto(room.warmup.id, warmupFocusPos, warmupFocusLook),
      });
    } else {
      hotspotsOut.push({
        id: `proto:${room.warmup.id}`,
        bay: room.id,
        label: `✓ ${room.icon} ${room.warmup.title}`,
        sublabel: '✓ Intro Run Complete',
        icon: '✓',
        status: 'done',
        connections: [
          {
            targetId: `proto:${room.homeTwist.proto.id}`,
            state: 'done' as const,
          },
        ],
        accent: '#2f855a',
        worldPos: bayToWorld(theta, 0.78, 0.02, 2.16),
        cameraPos: warmupFocusPos,
        cameraLook: warmupFocusLook,
        onClick: () => callbacks.onOpenProto(room.warmup.id, warmupFocusPos, warmupFocusLook),
      });
    }
  };

  return {
    bayId: room.id,
    group: bay,
    flames,
    fireflies,
    fairyLights,
    fxPulses,
    floating,
    syncState,
    animate: (t) => {
      if (!exitPending) return;
      exitStart ??= t;
      const u = Math.min(1, (t - exitStart) / EXIT_SECONDS);
      // 1. The cage lifts straight up and out of frame over the first quarter.
      const lift = Math.min(1, u / 0.25);
      cage.position.y = cageBaseY + lift * lift * 1.6;
      cage.visible = u < 0.27;

      // 2. Mascot crouches (0..0.18), leaps down onto the floor (0.18..0.52),
      //    then keeps bouncing at full size far off the side of the screen (0.52..1.0).
      if (u < 0.18) {
        const crouchT = u / 0.18;
        const squash = Math.sin(crouchT * Math.PI) * 0.14;
        mascotMesh.scale.set(
          (1 + squash * 0.5) * mascotBaseScale,
          (1 - squash) * mascotBaseScale,
          (1 + squash * 0.5) * mascotBaseScale,
        );
        mascotMesh.position.copy(mascotBase);
        mascotMesh.rotation.set(0, 0, 0);
      } else if (u < 0.52) {
        const jumpT = (u - 0.18) / 0.34;
        const baseDropY = THREE.MathUtils.lerp(mascotBase.y, floorLocalY, jumpT * jumpT);
        const jumpArc = Math.sin(jumpT * Math.PI) * 0.36;
        mascotMesh.scale.setScalar(mascotBaseScale);
        mascotMesh.position.set(
          mascotBase.x + jumpT * 0.24,
          Math.max(floorLocalY, baseDropY + jumpArc),
          mascotBase.z + jumpT * 0.86,
        );
        mascotMesh.rotation.y = jumpT * 1.05;
      } else {
        const runT = (u - 0.52) / 0.48;
        const hopSin = Math.abs(Math.sin(runT * Math.PI * 4));
        const hopBounce = hopSin * 0.24;
        const landSquash = (1 - hopSin) * 0.08;
        mascotMesh.scale.set(
          mascotBaseScale * (1 + landSquash * 0.4),
          mascotBaseScale * (1 - landSquash),
          mascotBaseScale * (1 + landSquash * 0.4),
        );
        mascotMesh.position.set(
          mascotBase.x + 0.24 + runT * 2.35,
          floorLocalY + hopBounce,
          mascotBase.z + 0.86 + runT * 0.38,
        );
        mascotMesh.rotation.y = 1.05 + Math.sin(runT * Math.PI * 4) * 0.12;
      }

      if (u >= 1) {
        exitPending = false;
        cage.visible = false;
        mascotMesh.visible = false;
        resetExit();
      }
    },
  };
}
