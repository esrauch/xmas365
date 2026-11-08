/**
 * XMAS365™: 13-Second 3D Intro Cinematic (`intro_cinematic.md`).
 *
 * Built in its own temporary `THREE.Scene` so it shares the game's cel shader
 * and screen-space `Outline` pass without touching Holiday Hall, then disposes
 * itself cleanly when handing off to the Hall and the opening memo (`P1`).
 */
import * as THREE from 'three';
import { type Hex, hexToNumber } from '../content/palettes';
import { celUniforms, toonMaterial } from '../render/toon';
import type { View } from '../render/view';
import { type MascotId, buildMascotMesh } from './mascots';

/** 2032 calendar specification (weeks start Sunday = 0; Feb has 28 days on XMAS365™'s calendar). */
interface MonthSpec {
  readonly name: string;
  readonly startDow: number;
  readonly days: number;
}

const MONTHS_2032: readonly MonthSpec[] = [
  { name: 'JAN', startDow: 4, days: 31 },
  { name: 'FEB', startDow: 0, days: 28 },
  { name: 'MAR', startDow: 1, days: 31 },
  { name: 'APR', startDow: 4, days: 30 },
  { name: 'MAY', startDow: 6, days: 31 },
  { name: 'JUN', startDow: 2, days: 30 },
  { name: 'JUL', startDow: 4, days: 31 },
  { name: 'AUG', startDow: 0, days: 31 },
  { name: 'SEP', startDow: 3, days: 30 },
  { name: 'OCT', startDow: 5, days: 31 },
  { name: 'NOV', startDow: 1, days: 30 },
  { name: 'DEC', startDow: 3, days: 31 },
];

interface HolidayTileSpec {
  readonly id: string;
  readonly monthIdx: number;
  readonly day: number;
  readonly color: Hex;
  readonly mascotId: MascotId;
  readonly mascotScale: number;
  readonly lane: 0 | 1 | 2;
}

const HOLIDAY_TILES: readonly HolidayTileSpec[] = [
  {
    id: 'valentines',
    monthIdx: 1,
    day: 14,
    color: '#f687b3',
    mascotId: 'bear',
    mascotScale: 0.42,
    lane: 0,
  },
  {
    id: 'easter',
    monthIdx: 2,
    day: 28,
    color: '#fef08a',
    mascotId: 'bunny',
    mascotScale: 0.42,
    lane: 0,
  },
  {
    id: 'fourth',
    monthIdx: 6,
    day: 4,
    color: '#3b82f6',
    mascotId: 'eaglet',
    mascotScale: 0.42,
    lane: 1,
  },
  {
    id: 'halloween',
    monthIdx: 9,
    day: 31,
    color: '#f97316',
    mascotId: 'spider',
    mascotScale: 0.42,
    lane: 2,
  },
  {
    id: 'thanksgiving',
    monthIdx: 10,
    day: 25,
    color: '#d97706',
    mascotId: 'turkey',
    mascotScale: 0.42,
    lane: 2,
  },
  {
    id: 'christmas',
    monthIdx: 11,
    day: 25,
    color: '#22c55e',
    mascotId: 'snowman',
    mascotScale: 0.42,
    lane: 2,
  },
];

// Layout constants for the 4x3 calendar floor
const SLAB_W = 1.24;
const SLAB_H = 0.05;
const SLAB_D = 1.32;
const SLAB_PITCH_X = 1.42;
const SLAB_PITCH_Z = 1.58;
const TILE_STEP = 0.16;
const LANE_LEFT_X = -2.82;
const LANE_RIGHT_X = 2.82;
const LANE_SPAN_X = LANE_RIGHT_X - LANE_LEFT_X;
const FEB29_POS = new THREE.Vector3(0, 0, 5.15);

function colCenterX(colIdx: number): number {
  return (colIdx - 1.5) * SLAB_PITCH_X;
}

function laneCenterZ(laneIdx: number): number {
  return (laneIdx - 1) * SLAB_PITCH_Z;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / Math.max(0.0001, b - a)));
  return t * t * (3 - 2 * t);
}

function easeInOutCubic(t: number): number {
  const u = Math.max(0, Math.min(1, t));
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function easeOutBack(t: number): number {
  const u = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
}

function makeWarmBackdropTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#2a1a12');
    g.addColorStop(0.55, '#472d1e');
    g.addColorStop(1, '#5e3b26');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeMonthHeaderTexture(name: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#4a3221';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fdf8ec';
    ctx.font = '900 38px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 34);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeWrappingPaperTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 256, 256);

    // Diagonal festive green stripes
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 22;
    for (let offset = -256; offset <= 512; offset += 64) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + 256, 256);
      ctx.stroke();
    }

    // Gold trim pin-stripes
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    for (let offset = -256; offset <= 512; offset += 64) {
      ctx.beginPath();
      ctx.moveTo(offset + 14, 0);
      ctx.lineTo(offset + 270, 256);
      ctx.stroke();
    }

    // Repeating XMAS365™ stamp badges across the paper
    ctx.save();
    ctx.font = 'italic 900 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const [px, py] of [
      [64, 64],
      [192, 64],
      [128, 128],
      [64, 192],
      [192, 192],
    ] as const) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.22);
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(-54, -15, 108, 30);
      ctx.strokeStyle = '#1f2430';
      ctx.lineWidth = 3;
      ctx.strokeRect(-54, -15, 108, 30);
      ctx.fillStyle = '#c53030';
      ctx.fillText('XMAS', -18, 1);
      ctx.fillStyle = '#15803d';
      ctx.fillText('365™', 26, 1);
      ctx.restore();
    }
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeLogoSlamTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 384;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 1024, 384);
    ctx.save();
    ctx.translate(512, 192);
    ctx.rotate(-0.08);

    // Cream corporate stamp plaque with double red/green border
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(-440, -130, 880, 260);
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#1f2430';
    ctx.strokeRect(-440, -130, 880, 260);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#c53030';
    ctx.strokeRect(-420, -110, 840, 220);

    // XMAS365™ wordmark in red & green italic
    ctx.font = 'italic 900 132px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#c53030';
    ctx.fillText('XMAS', 40, -16);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2f855a';
    ctx.fillText('365', 44, -16);
    ctx.font = '900 44px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#1f2430';
    ctx.fillText('™', 318, -56);

    // Tagline underneath
    ctx.textAlign = 'center';
    ctx.font = '800 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#4a3525';
    ctx.fillText('CHRISTMAS. EVERY DAY. FOREVER.™', 0, 74);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRollerSideLogoTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, 256, 96);
    ctx.strokeStyle = '#1f2430';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 248, 88);
    ctx.font = 'italic 900 44px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#c53030';
    ctx.fillText('XMAS', 138, 50);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2f855a';
    ctx.fillText('365™', 140, 50);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeFeb29TileTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    // Cream calendar square surface with a crisp dark border
    ctx.fillStyle = '#fdf8ec';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#4a3221';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 492);

    // Red calendar header band along the top edge behind Leap Day
    ctx.fillStyle = '#c53030';
    ctx.fillRect(17, 17, 478, 72);

    // Bold, unmistakable "FEB 29" label across the front apron of the square (in front of Leap Day's feet)
    ctx.fillStyle = '#c53030';
    ctx.fillRect(36, 336, 440, 6);
    ctx.font = '900 92px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1f2430';
    ctx.fillText('FEB 29', 256, 422);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const INTRO_CINEMATIC_DURATION = 21.0;

interface HolidayActor {
  readonly spec: HolidayTileSpec;
  readonly worldPos: THREE.Vector3;
  readonly mascotGroup: THREE.Group;
  readonly giftBoxGroup: THREE.Group;
  readonly bowGroup: THREE.Group;
  readonly triggerTime: number;
}

interface SmokePuff {
  readonly mesh: THREE.Mesh;
  readonly spawnTime: number;
  readonly startPos: THREE.Vector3;
}

export interface BuiltIntroCinematic {
  readonly scene: THREE.Scene;
  /** Advance the cinematic to `elapsedSec` (0..13+) and update `view.camera`. */
  update(elapsedSec: number, view: View): void;
  /** Pre-compile shaders so Shot 1 starts with zero frame hitch. */
  precompile(view: View): void;
  /** Clean up temporary geometries, materials, and textures. */
  dispose(): void;
}

export function buildIntroCinematic(): BuiltIntroCinematic {
  const scene = new THREE.Scene();
  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableTextures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposableMaterials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    disposableTextures.push(t);
    return t;
  };

  const matCache = new Map<string, THREE.MeshToonMaterial>();
  const mat = (hex: string): THREE.MeshToonMaterial => {
    let m = matCache.get(hex);
    if (!m) {
      m = trackMat(toonMaterial({ color: hexToNumber(hex as Hex) }));
      matCache.set(hex, m);
    }
    return m;
  };

  const box = (
    w: number,
    h: number,
    d: number,
    hex: string,
    x = 0,
    y = 0,
    z = 0,
    shadow = true,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), mat(hex));
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  };

  const cyl = (
    rTop: number,
    rBot: number,
    h: number,
    hex: string,
    x = 0,
    y = 0,
    z = 0,
    seg = 16,
    shadow = true,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(rTop, rBot, h, seg)), mat(hex));
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  };

  const sphere = (
    r: number,
    hex: string,
    x = 0,
    y = 0,
    z = 0,
    seg = 12,
    shadow = true,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(r, seg, seg)), mat(hex));
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  };

  // Warm backdrop & soft key lighting from high on the left (`intro_cinematic.md`)
  scene.background = trackTex(makeWarmBackdropTexture());
  scene.fog = new THREE.Fog(0x472d1e, 14, 32);

  const keyLight = new THREE.DirectionalLight(0xffe0a3, 1.35);
  keyLight.position.set(-7.5, 11.5, 5.5);
  keyLight.target.position.set(0, 0, 0.8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.normalBias = 0.02;
  Object.assign(keyLight.shadow.camera, {
    left: -6.5,
    right: 6.5,
    top: 6.5,
    bottom: -6.5,
    near: 1,
    far: 26,
  });
  scene.add(keyLight, keyLight.target);

  // Bare warm wooden floor stretching beneath the calendar and down to the lone Feb 29 tile
  scene.add(box(28, 0.2, 32, '#593d28', 0, -0.1, 2.5, false));

  // --- 1. TWELVE MONTH SLABS & 365 INSTANCED DAY TILES ---
  const holidayPosMap = new Map<string, THREE.Vector3>();
  const tileTransforms: { pos: THREE.Vector3; color: THREE.Color }[] = [];
  const creamColor = new THREE.Color(hexToNumber('#fdf8ec'));

  for (const [mIdx, spec] of MONTHS_2032.entries()) {
    const col = mIdx % 4;
    const row = Math.floor(mIdx / 4);
    const cx = colCenterX(col);
    const cz = laneCenterZ(row);

    // Raised wooden month board + warm bevel rim
    scene.add(box(SLAB_W, SLAB_H, SLAB_D, '#7a5438', cx, SLAB_H * 0.5, cz, true));
    scene.add(
      box(SLAB_W + 0.04, SLAB_H * 0.6, SLAB_D + 0.04, '#5c3d24', cx, SLAB_H * 0.3, cz, false),
    );

    // Painted month name header on the slab's top edge
    const headerTex = trackTex(makeMonthHeaderTexture(spec.name));
    const headerMat = trackMat(new THREE.MeshBasicMaterial({ map: headerTex, toneMapped: false }));
    const headerPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.12, 0.22)), headerMat);
    headerPlane.rotation.x = -Math.PI / 2;
    headerPlane.position.set(cx, SLAB_H + 0.003, cz - 0.5);
    scene.add(headerPlane);

    // Individual day tiles (no numbers, true 2032 weekday alignment)
    for (let d = 1; d <= spec.days; d++) {
      const slot = spec.startDow + (d - 1);
      const dow = slot % 7;
      const weekRow = Math.floor(slot / 7);
      const tx = cx + (dow - 3) * TILE_STEP;
      const tz = cz - 0.31 + weekRow * TILE_STEP;

      const holiday = HOLIDAY_TILES.find((h) => h.monthIdx === mIdx && h.day === d);
      const tileColor = holiday ? new THREE.Color(hexToNumber(holiday.color)) : creamColor;
      const pos = new THREE.Vector3(tx, SLAB_H + 0.022, tz);
      tileTransforms.push({ pos, color: tileColor });

      if (holiday) {
        holidayPosMap.set(holiday.id, pos.clone());
      }
    }
  }

  // Single InstancedMesh for all 365 day tiles (1 draw call!)
  const tileGeo = trackGeo(new THREE.BoxGeometry(0.142, 0.044, 0.142));
  const tileMat = trackMat(toonMaterial({ color: 0xffffff }));
  const tilesInstanced = new THREE.InstancedMesh(tileGeo, tileMat, tileTransforms.length);
  tilesInstanced.castShadow = true;
  tilesInstanced.receiveShadow = true;
  const dummy = new THREE.Object3D();
  tileTransforms.forEach((item, idx) => {
    dummy.position.copy(item.pos);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    tilesInstanced.setMatrixAt(idx, dummy.matrix);
    tilesInstanced.setColorAt(idx, item.color);
  });
  tilesInstanced.instanceMatrix.needsUpdate = true;
  if (tilesInstanced.instanceColor) tilesInstanced.instanceColor.needsUpdate = true;
  scene.add(tilesInstanced);

  // --- 2. SIX HOLIDAY MASCOTS & THEIR POP-UP GIFT BOXES ---
  const paperTex = trackTex(makeWrappingPaperTexture());
  const giftPaperTex = trackTex(makeWrappingPaperTexture());
  giftPaperTex.repeat.set(1.2, 1.2);
  const giftPaperMat = trackMat(toonMaterial({ color: 0xffffff, map: giftPaperTex }));

  const buildGiftBox = (): { root: THREE.Group; bow: THREE.Group } => {
    const root = new THREE.Group();
    const body = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.28, 0.32)), giftPaperMat);
    body.position.y = 0.14;
    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);

    const lid = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.345, 0.06, 0.345)), giftPaperMat);
    lid.position.y = 0.27;
    lid.castShadow = true;
    root.add(lid);

    // Gold ribbon cross
    root.add(box(0.055, 0.305, 0.35, '#facc15', 0, 0.155, 0, false));
    root.add(box(0.35, 0.305, 0.055, '#facc15', 0, 0.155, 0, false));

    // Bow loops + XMAS365™ tag on top (pops up last)
    const bow = new THREE.Group();
    bow.position.set(0, 0.3, 0);
    const loopL = sphere(0.065, '#facc15', -0.055, 0.03, 0, 10, false);
    loopL.scale.set(1.3, 0.7, 0.65);
    loopL.rotation.z = 0.35;
    const loopR = sphere(0.065, '#facc15', 0.055, 0.03, 0, 10, false);
    loopR.scale.set(1.3, 0.7, 0.65);
    loopR.rotation.z = -0.35;
    const knot = sphere(0.032, '#eab308', 0, 0.025, 0, 8, false);
    const tag = box(0.11, 0.045, 0.012, '#fffdf7', 0.08, 0.015, 0.06, false);
    tag.rotation.z = -0.25;
    bow.add(loopL, loopR, knot, tag);
    root.add(bow);
    return { root, bow };
  };

  // Compute the exact time when the steamroller's front drum reaches each holiday's X coordinate
  const computeTriggerTime = (spec: HolidayTileSpec, x: number): number => {
    if (spec.lane === 0) {
      // Lane 1: t = 4.2..6.6s (2.4s), front drum moves from LANE_LEFT_X to LANE_RIGHT_X
      const u = (x - LANE_LEFT_X) / LANE_SPAN_X;
      return 4.2 + u * 2.4;
    }
    if (spec.lane === 1) {
      // Lane 2: t = 7.3..9.3s (2.0s), front drum moves from LANE_RIGHT_X to LANE_LEFT_X
      const u = (LANE_RIGHT_X - x) / LANE_SPAN_X;
      return 7.3 + u * 2.0;
    }
    // Lane 3: t = 10.0..12.2s (2.2s), front drum moves from LANE_LEFT_X to LANE_RIGHT_X
    const u = (x - LANE_LEFT_X) / LANE_SPAN_X;
    return 10.0 + u * 2.2;
  };

  const holidayActors: HolidayActor[] = [];
  for (const spec of HOLIDAY_TILES) {
    const pos = holidayPosMap.get(spec.id) ?? new THREE.Vector3();
    // Vivid coloured holiday square tile directly under the mascot
    scene.add(box(0.168, 0.054, 0.168, spec.color, pos.x, SLAB_H + 0.027, pos.z, false));

    const mascotGroup = new THREE.Group();
    mascotGroup.position.set(pos.x, pos.y + 0.03, pos.z);
    const mesh = buildMascotMesh(spec.mascotId, spec.mascotScale);
    mascotGroup.add(mesh);
    scene.add(mascotGroup);

    const { root: giftBoxGroup, bow: bowGroup } = buildGiftBox();
    giftBoxGroup.position.set(pos.x, pos.y + 0.02, pos.z);
    giftBoxGroup.visible = false;
    scene.add(giftBoxGroup);

    holidayActors.push({
      spec,
      worldPos: pos,
      mascotGroup,
      giftBoxGroup,
      bowGroup,
      triggerTime: computeTriggerTime(spec, pos.x),
    });
  }

  // --- 3. THREE UNROLLING WRAPPING PAPER LANES ---
  const lanePaperMeshes: {
    mesh: THREE.Mesh;
    tex: THREE.CanvasTexture;
    laneIdx: number;
  }[] = [];
  const PAPER_WIDTH_Z = SLAB_D + 0.08;
  for (let laneIdx = 0; laneIdx < 3; laneIdx++) {
    const tex = trackTex(paperTex.clone());
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    const pMat = trackMat(toonMaterial({ color: 0xffffff, map: tex }));
    const pGeo = trackGeo(new THREE.BoxGeometry(1, 0.018, PAPER_WIDTH_Z));
    const mesh = new THREE.Mesh(pGeo, pMat);
    mesh.position.set(0, SLAB_H + 0.048, laneCenterZ(laneIdx));
    mesh.receiveShadow = true;
    mesh.visible = false;
    scene.add(mesh);
    lanePaperMeshes.push({ mesh, tex, laneIdx });
  }

  // --- 4. DRIVERLESS XMAS365™ STEAMROLLER ---
  const rollerGroup = new THREE.Group();
  const rollerChassis = new THREE.Group();
  rollerGroup.add(rollerChassis);

  // Red boiler/hood & green chassis frame
  rollerChassis.add(box(0.86, 0.14, 0.88, '#15803d', -0.1, 0.24, 0));
  rollerChassis.add(box(0.68, 0.36, 0.68, '#c53030', 0.05, 0.46, 0));
  const boilerNose = cyl(0.22, 0.22, 0.42, '#b91c1c', 0.26, 0.46, 0, 16);
  boilerNose.rotation.z = Math.PI / 2;
  rollerChassis.add(boilerNose);
  rollerChassis.add(box(0.72, 0.05, 0.74, '#facc15', 0.05, 0.3, 0));

  // Side XMAS365™ logo plates on the body
  const sideLogoTex = trackTex(makeRollerSideLogoTexture());
  const sideLogoMat = trackMat(
    new THREE.MeshBasicMaterial({ map: sideLogoTex, toneMapped: false }),
  );
  for (const side of [-1, 1] as const) {
    const plate = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.52, 0.2)), sideLogoMat);
    plate.position.set(0.04, 0.48, side * 0.345);
    if (side < 0) plate.rotation.y = Math.PI;
    rollerChassis.add(plate);
  }

  // Open, visibly EMPTY cab at the rear (-X in local roller coordinates, since +X is forward)
  rollerChassis.add(box(0.42, 0.08, 0.78, '#991b1b', -0.34, 0.34, 0));
  // Empty driver's seat & steering wheel inside the open cab
  rollerChassis.add(box(0.14, 0.14, 0.22, '#4a3221', -0.38, 0.44, 0));
  const postOffsets: readonly [number, number][] = [
    [-0.52, -0.34],
    [-0.52, 0.34],
    [-0.16, -0.34],
    [-0.16, 0.34],
  ];
  for (const [px, pz] of postOffsets) {
    rollerChassis.add(cyl(0.025, 0.025, 0.48, '#facc15', px, 0.6, pz, 8));
  }
  // Cab roof + blinking XMAS365™ sign on top
  rollerChassis.add(box(0.48, 0.07, 0.84, '#15803d', -0.34, 0.85, 0));
  const cabSign = box(0.36, 0.15, 0.56, '#fef08a', -0.34, 0.96, 0);
  const cabBeacon = sphere(0.06, '#ef4444', -0.34, 1.07, 0, 10);
  rollerChassis.add(cabSign, cabBeacon);

  // Smokestack chimney at the front of the boiler
  rollerChassis.add(cyl(0.065, 0.05, 0.34, '#1f2430', 0.32, 0.76, 0, 12));
  rollerChassis.add(cyl(0.085, 0.065, 0.06, '#facc15', 0.32, 0.93, 0, 12));

  // Front fork arms holding the giant wrapping-paper roll drum at x = +0.58
  for (const side of [-1, 1] as const) {
    rollerChassis.add(box(0.46, 0.07, 0.06, '#facc15', 0.42, 0.3, side * 0.69));
  }
  // Cardboard inner core tube of the front roll (always full length, visible as paper runs out)
  const coreTube = cyl(0.11, 0.11, PAPER_WIDTH_Z + 0.06, '#a16207', 0.58, 0.3, 0, 16);
  coreTube.rotation.x = Math.PI / 2;
  rollerChassis.add(coreTube);

  // Giant front drum of wrapping paper (radius shrinks as it unrolls across the 3 lanes)
  const drumPaperTex = trackTex(makeWrappingPaperTexture());
  drumPaperTex.repeat.set(2.5, 2.5);
  const drumPaperMat = trackMat(toonMaterial({ color: 0xffffff, map: drumPaperTex }));
  const frontDrum = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.3, 0.3, PAPER_WIDTH_Z, 24)),
    drumPaperMat,
  );
  frontDrum.rotation.x = Math.PI / 2;
  frontDrum.position.set(0.58, 0.3, 0);
  frontDrum.castShadow = true;
  rollerChassis.add(frontDrum);

  // Rear dark iron wheels (`x = -0.36`)
  const rearWheels: THREE.Group[] = [];
  for (const side of [-1, 1] as const) {
    const wg = new THREE.Group();
    wg.position.set(-0.36, 0.28, side * 0.48);
    const tire = cyl(0.28, 0.28, 0.16, '#1f2430', 0, 0, 0, 18);
    tire.rotation.x = Math.PI / 2;
    const hub = cyl(0.12, 0.12, 0.18, '#facc15', 0, 0, 0, 12);
    hub.rotation.x = Math.PI / 2;
    const spoke = box(0.46, 0.04, 0.19, '#d97706', 0, 0, 0, false);
    wg.add(tire, hub, spoke);
    rollerChassis.add(wg);
    rearWheels.push(wg);
  }
  scene.add(rollerGroup);

  // Chimney smoke puffs pool
  const smokePuffs: SmokePuff[] = [];
  for (let i = 0; i < 20; i++) {
    const puffMesh = sphere(0.08, '#ffffff', 0, -10, 0, 10, false);
    puffMesh.visible = false;
    scene.add(puffMesh);
    smokePuffs.push({
      mesh: puffMesh,
      spawnTime: 2.8 + i * 0.52,
      startPos: new THREE.Vector3(),
    });
  }

  // --- 5. OVERHEAD XMAS365™ LOGO SLAM & CONFETTI (SHOT 8: 8.0–9.2s) ---
  const logoSlamTex = trackTex(makeLogoSlamTexture());
  const logoSlamMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: logoSlamTex,
      transparent: true,
      alphaTest: 0.05,
      toneMapped: false,
    }),
  );
  const logoSlamMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(4.5, 1.68)), logoSlamMat);
  logoSlamMesh.rotation.x = -Math.PI / 2;
  logoSlamMesh.position.set(0, 0.52, 0);
  logoSlamMesh.visible = false;
  scene.add(logoSlamMesh);

  // Confetti burst (instanced small squares)
  const CONFETTI_COUNT = 48;
  const confettiGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.015, 0.11));
  const confettiMat = trackMat(toonMaterial({ color: 0xffffff }));
  const confettiInstanced = new THREE.InstancedMesh(confettiGeo, confettiMat, CONFETTI_COUNT);
  confettiInstanced.visible = false;
  const confettiPalette = ['#ef4444', '#22c55e', '#facc15', '#ffffff'];
  const confettiSeeds = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const angle = (i / CONFETTI_COUNT) * Math.PI * 2 + (i % 3) * 0.2;
    const speed = 1.2 + ((i * 7) % 11) * 0.22;
    return {
      vx: Math.cos(angle) * speed,
      vz: Math.sin(angle) * speed * 0.85,
      vy: 1.8 + (i % 5) * 0.35,
      rotSpeed: 3.5 + (i % 4),
    };
  });
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    confettiInstanced.setColorAt(
      i,
      new THREE.Color(hexToNumber(confettiPalette[i % confettiPalette.length] as Hex)),
    );
  }
  if (confettiInstanced.instanceColor) confettiInstanced.instanceColor.needsUpdate = true;
  scene.add(confettiInstanced);

  // --- 6. LONE FEB 29 TILE & LEAP DAY (SHOTS 9 & 10: 14.2–21.0s) ---
  const feb29Group = new THREE.Group();
  feb29Group.position.copy(FEB29_POS);
  feb29Group.rotation.y = 0.2; // A little askew on the bare floor
  feb29Group.add(box(0.56, 0.052, 0.62, '#fdf8ec', 0, 0.026, 0, true));
  feb29Group.add(box(0.6, 0.03, 0.66, '#d6c7b2', 0, 0.015, 0, false));

  // Printed "FEB 29" label on the top of the square (in the front apron right in front of Leap Day)
  const feb29Tex = trackTex(makeFeb29TileTexture());
  const feb29LabelMat = trackMat(new THREE.MeshBasicMaterial({ map: feb29Tex, toneMapped: false }));
  const feb29LabelPlane = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.54, 0.6)),
    feb29LabelMat,
  );
  feb29LabelPlane.rotation.x = -Math.PI / 2;
  feb29LabelPlane.position.set(0, 0.054, 0);
  feb29Group.add(feb29LabelPlane);
  scene.add(feb29Group);

  const leapDayActor = new THREE.Group();
  // Seated slightly toward the back of the FEB 29 tile so the "FEB 29" front label is 100% clear
  leapDayActor.position.set(FEB29_POS.x - 0.02, 0.055, FEB29_POS.z - 0.09);
  leapDayActor.rotation.y = 0.14;
  const leapDayMesh = buildMascotMesh('leapday', 0.56);
  leapDayActor.add(leapDayMesh);

  // Glasses glint highlight spheres for the pause on Leap Day (`t ≈ 17.1s`)
  const glintMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }),
  );
  const glintL = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.032, 8, 8)), glintMat);
  const glintR = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.032, 8, 8)), glintMat);
  glintL.position.set(-0.06, 0.24, 0.15);
  glintR.position.set(0.06, 0.24, 0.15);
  leapDayActor.add(glintL, glintR);
  scene.add(leapDayActor);

  // Compute steamroller pose (world X, Z, heading angle Y, front drum world X, and paper roll radius scale)
  const getRollerState = (
    t: number,
  ): {
    x: number;
    z: number;
    rotY: number;
    frontDrumX: number;
    rollScale: number;
    travelDist: number;
    visible: boolean;
  } => {
    const drumOffset = 0.58;
    const lane0Z = laneCenterZ(0);
    const lane1Z = laneCenterZ(1);
    const lane2Z = laneCenterZ(2);

    if (t < 2.6) {
      return {
        x: LANE_LEFT_X - 2.4,
        z: lane0Z,
        rotY: 0,
        frontDrumX: LANE_LEFT_X - 2.4 + drumOffset,
        rollScale: 1,
        travelDist: 0,
        visible: false,
      };
    }
    if (t < 4.2) {
      // Shot 2 (2.8–4.2s): Rolls in from left to the start of January
      const u = easeInOutCubic((t - 2.7) / 1.5);
      const frontX = THREE.MathUtils.lerp(LANE_LEFT_X - 1.8, LANE_LEFT_X, u);
      return {
        x: frontX - drumOffset,
        z: lane0Z,
        rotY: 0,
        frontDrumX: frontX,
        rollScale: 1,
        travelDist: frontX - (LANE_LEFT_X - 1.8),
        visible: true,
      };
    }
    if (t < 6.6) {
      // Shot 3 (4.2–6.6s): Mows Lane 1 (JAN–APR) left to right
      const u = (t - 4.2) / 2.4;
      const frontX = THREE.MathUtils.lerp(LANE_LEFT_X, LANE_RIGHT_X, u);
      return {
        x: frontX - drumOffset,
        z: lane0Z,
        rotY: 0,
        frontDrumX: frontX,
        rollScale: THREE.MathUtils.lerp(1.0, 0.72, u),
        travelDist: 1.8 + u * LANE_SPAN_X,
        visible: true,
      };
    }
    if (t < 7.3) {
      // Shot 4 (6.6–7.3s): Swings round at April's end and drops into Lane 2
      const u = easeInOutCubic((t - 6.6) / 0.7);
      const angle = u * Math.PI;
      const turnCenterZ = (lane0Z + lane1Z) * 0.5;
      const turnRadiusZ = (lane1Z - lane0Z) * 0.5;
      const x = LANE_RIGHT_X - drumOffset * Math.cos(angle) + Math.sin(angle) * 0.45;
      const z = turnCenterZ - Math.cos(angle) * turnRadiusZ;
      return {
        x,
        z,
        rotY: -angle,
        frontDrumX: LANE_RIGHT_X,
        rollScale: 0.72,
        travelDist: 1.8 + LANE_SPAN_X + u * 1.4,
        visible: true,
      };
    }
    if (t < 9.3) {
      // Shot 5 (7.3–9.3s): Mows Lane 2 (AUG–MAY) right to left
      const u = (t - 7.3) / 2.0;
      const frontX = THREE.MathUtils.lerp(LANE_RIGHT_X, LANE_LEFT_X, u);
      return {
        x: frontX + drumOffset,
        z: lane1Z,
        rotY: -Math.PI,
        frontDrumX: frontX,
        rollScale: THREE.MathUtils.lerp(0.72, 0.44, u),
        travelDist: 3.2 + LANE_SPAN_X + u * LANE_SPAN_X,
        visible: true,
      };
    }
    if (t < 10.0) {
      // Shot 6 (9.3–10.0s): Swings round at May's left edge and drops into Lane 3
      const u = easeInOutCubic((t - 9.3) / 0.7);
      const angle = u * Math.PI;
      const turnCenterZ = (lane1Z + lane2Z) * 0.5;
      const turnRadiusZ = (lane2Z - lane1Z) * 0.5;
      const x = LANE_LEFT_X + drumOffset * Math.cos(angle) - Math.sin(angle) * 0.45;
      const z = turnCenterZ - Math.cos(angle) * turnRadiusZ;
      return {
        x,
        z,
        rotY: -Math.PI + angle,
        frontDrumX: LANE_LEFT_X,
        rollScale: 0.44,
        travelDist: 3.2 + 2 * LANE_SPAN_X + u * 1.4,
        visible: true,
      };
    }
    if (t < 12.2) {
      // Shot 7 (10.0–12.2s): Mows Lane 3 (SEP–DEC) left to right; roll runs out at December's end
      const u = (t - 10.0) / 2.2;
      const frontX = THREE.MathUtils.lerp(LANE_LEFT_X, LANE_RIGHT_X, u);
      return {
        x: frontX - drumOffset,
        z: lane2Z,
        rotY: 0,
        frontDrumX: frontX,
        rollScale: THREE.MathUtils.lerp(0.44, 0.02, u),
        travelDist: 4.6 + 2 * LANE_SPAN_X + u * LANE_SPAN_X,
        visible: true,
      };
    }
    // Puffs off-screen to the right after 12.2s
    const extra = t - 12.2;
    const frontX = LANE_RIGHT_X + extra * 4.5;
    return {
      x: frontX - drumOffset,
      z: lane2Z,
      rotY: 0,
      frontDrumX: frontX,
      rollScale: 0.01,
      travelDist: 4.6 + 3 * LANE_SPAN_X + extra * 4.5,
      visible: t < 12.7,
    };
  };

  // Camera keyframe evaluation matching the 10-shot table in `intro_cinematic.md`
  // Note: `syncCameraFov` in `main.ts` already widens vertical FOV on portrait phones so a ~5.8-unit
  // horizontal span fits cleanly without needing extra distance pullback.
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const evaluateCamera = (t: number): void => {
    if (t < 2.8) {
      // Shot 1 (0.0–2.8s): High, wide three-quarter view of the whole calendar floor, drifting slowly
      const u = smoothstep(0, 2.8, t);
      camPos.set(THREE.MathUtils.lerp(-0.38, 0.32, u), 5.45, THREE.MathUtils.lerp(5.15, 4.75, u));
      camLook.set(0, 0.05, 0.05);
    } else if (t < 4.2) {
      // Shot 2 (2.8–4.2s): Eases toward the floor's left edge, lower, as the steamroller rolls in at January
      const u = easeInOutCubic((t - 2.8) / 1.4);
      camPos.set(
        THREE.MathUtils.lerp(0.32, -2.1, u),
        THREE.MathUtils.lerp(5.45, 2.55, u),
        THREE.MathUtils.lerp(4.75, 1.55, u),
      );
      camLook.set(
        THREE.MathUtils.lerp(0, -1.95, u),
        THREE.MathUtils.lerp(0.05, 0.32, u),
        THREE.MathUtils.lerp(0.05, laneCenterZ(0), u),
      );
    } else if (t < 6.6) {
      // Shot 3 (4.2–6.6s): Follows alongside Lane 1 (JAN–APR)
      const u = easeInOutCubic((t - 4.2) / 2.4);
      const trackX = THREE.MathUtils.lerp(-1.85, 1.75, u);
      camPos.set(trackX - 0.22, 2.5, 1.5);
      camLook.set(trackX + 0.15, 0.28, laneCenterZ(0));
    } else if (t < 7.3) {
      // Shot 4 (6.6–7.3s): Holds as the roller swings round at April's end into Lane 2
      const u = easeInOutCubic((t - 6.6) / 0.7);
      camPos.set(
        THREE.MathUtils.lerp(1.53, 1.8, u),
        THREE.MathUtils.lerp(2.5, 2.65, u),
        THREE.MathUtils.lerp(1.5, 2.95, u),
      );
      camLook.set(
        THREE.MathUtils.lerp(1.9, 1.7, u),
        0.28,
        THREE.MathUtils.lerp(laneCenterZ(0), laneCenterZ(1), u),
      );
    } else if (t < 9.3) {
      // Shot 5 (7.3–9.3s): Follows Lane 2 (MAY–AUG), right to left
      const u = easeInOutCubic((t - 7.3) / 2.0);
      const trackX = THREE.MathUtils.lerp(1.75, -1.75, u);
      camPos.set(trackX + 0.2, 2.6, 3.0);
      camLook.set(trackX - 0.1, 0.28, laneCenterZ(1));
    } else if (t < 10.0) {
      // Shot 6 (9.3–10.0s): Holds as the roller turns down into Lane 3
      const u = easeInOutCubic((t - 9.3) / 0.7);
      camPos.set(
        THREE.MathUtils.lerp(-1.55, -1.75, u),
        THREE.MathUtils.lerp(2.6, 2.68, u),
        THREE.MathUtils.lerp(3.0, 4.45, u),
      );
      camLook.set(
        THREE.MathUtils.lerp(-1.85, -1.65, u),
        0.28,
        THREE.MathUtils.lerp(laneCenterZ(1), laneCenterZ(2), u),
      );
    } else if (t < 12.2) {
      // Shot 7 (10.0–12.2s): Follows Lane 3 (SEP–DEC) left to right
      const u = easeInOutCubic((t - 10.0) / 2.2);
      const trackX = THREE.MathUtils.lerp(-1.65, 1.8, u);
      camPos.set(trackX - 0.15, 2.65, 4.5);
      camLook.set(trackX + 0.15, 0.28, laneCenterZ(2));
    } else if (t < 14.2) {
      // Shot 8 (12.2–14.2s): Pulls up to straight overhead, the whole wrapped year in frame + logo slam shake
      const u = easeInOutCubic(Math.min(1, (t - 12.2) / 0.65));
      const shakeEnv = t >= 12.75 && t < 13.3 ? Math.exp(-(t - 12.75) * 9) * 0.14 : 0;
      const shakeX = Math.sin((t - 12.75) * 58) * shakeEnv;
      const shakeZ = Math.cos((t - 12.75) * 47) * shakeEnv;
      camPos.set(
        THREE.MathUtils.lerp(1.65, 0, u) + shakeX,
        THREE.MathUtils.lerp(2.65, 6.8, u),
        THREE.MathUtils.lerp(4.5, -0.35, u) + shakeZ,
      );
      camLook.set(shakeX * 0.5, 0.1, THREE.MathUtils.lerp(laneCenterZ(2), -0.55, u) + shakeZ * 0.5);
    } else if (t < 21.0) {
      // Shot 9 (14.2–16.4s), Pause on Leap Day (16.4–18.2s) & Shot 10 (18.2–21.0s):
      // Tilts and pans down past the calendar's bottom edge over bare floor and settles low and close
      // on Leap Day sitting on the lone FEB 29 square
      const u = easeInOutCubic(Math.min(1, (t - 14.2) / 2.2));
      camPos.set(
        THREE.MathUtils.lerp(0, 0.16, u),
        THREE.MathUtils.lerp(6.8, 0.94, u),
        THREE.MathUtils.lerp(-0.35, FEB29_POS.z + 1.32, u),
      );
      camLook.set(
        0,
        THREE.MathUtils.lerp(0.1, 0.16, u),
        THREE.MathUtils.lerp(-0.55, FEB29_POS.z + 0.02, u),
      );
    } else {
      // Shot 11 (21.0s+): Pan back up from Leap Day to frame the whole wrapped XMAS365™ calendar
      // alongside Leap Day's lone FEB 29 square at the bottom
      const u = easeInOutCubic(Math.min(1, (t - 21.0) / 2.2));
      camPos.set(
        THREE.MathUtils.lerp(0.16, 0, u),
        THREE.MathUtils.lerp(0.94, 8.2, u),
        THREE.MathUtils.lerp(FEB29_POS.z + 1.32, 2.35, u),
      );
      camLook.set(
        0,
        THREE.MathUtils.lerp(0.16, 0.08, u),
        THREE.MathUtils.lerp(FEB29_POS.z + 0.02, 1.65, u),
      );
    }
  };

  return {
    scene,
    precompile(view: View): void {
      view.renderer.compile(scene, view.camera);
    },
    update(elapsedSec: number, view: View): void {
      // Warm golden-hour cel shading palette for the calendar floor
      celUniforms.celLitTint.value.setRGB(1.12, 0.96, 0.78);
      celUniforms.celShadeTint.value.setRGB(0.42, 0.29, 0.34);
      celUniforms.celShadeGamma.value = 1.38;

      // 1. Update Steamroller position, wheel rotation, shrinking paper roll, and smoke puffs
      const rState = getRollerState(elapsedSec);
      rollerGroup.visible = rState.visible;
      if (rState.visible) {
        rollerGroup.position.set(rState.x, SLAB_H, rState.z);
        rollerGroup.rotation.y = rState.rotY;
        const engineVib = Math.sin(elapsedSec * 42) * 0.008;
        rollerChassis.position.y = engineVib;

        frontDrum.visible = rState.rollScale > 0.03;
        frontDrum.scale.set(rState.rollScale, 1, rState.rollScale);
        frontDrum.rotation.y = -rState.travelDist * 3.2;
        for (const w of rearWheels) {
          w.rotation.z = -rState.travelDist * 3.4;
        }
        // Blink the XMAS365™ cab beacon
        const blinkOn = Math.sin(elapsedSec * 12) > 0;
        (cabBeacon.material as THREE.MeshToonMaterial).emissiveIntensity = blinkOn ? 1.2 : 0.1;
      }

      // Update chimney smoke puffs
      for (const puff of smokePuffs) {
        const age = elapsedSec - puff.spawnTime;
        if (age <= 0 || age > 1.1) {
          puff.mesh.visible = false;
          continue;
        }
        if (age < 0.05 && rState.visible) {
          const forwardX = Math.cos(-rState.rotY) * 0.32;
          const forwardZ = Math.sin(-rState.rotY) * 0.32;
          puff.startPos.set(rState.x + forwardX, SLAB_H + 0.98, rState.z + forwardZ);
        }
        puff.mesh.visible = true;
        const u = age / 1.1;
        puff.mesh.position.set(
          puff.startPos.x + Math.sin(u * 5 + puff.spawnTime) * 0.06,
          puff.startPos.y + u * 0.65,
          puff.startPos.z,
        );
        const s = (1 - u * 0.4) * (0.6 + u * 1.3);
        puff.mesh.scale.setScalar(Math.max(0.01, s));
      }

      // 2. Update the 3 unrolling wrapping-paper lanes
      for (const entry of lanePaperMeshes) {
        const coverage =
          entry.laneIdx === 0
            ? Math.max(0, Math.min(1, (elapsedSec - 4.2) / 2.4))
            : entry.laneIdx === 1
              ? Math.max(0, Math.min(1, (elapsedSec - 7.3) / 2.0))
              : Math.max(0, Math.min(1, (elapsedSec - 10.0) / 2.2));

        if (coverage <= 0.001) {
          entry.mesh.visible = false;
          continue;
        }
        entry.mesh.visible = true;
        const len = Math.max(0.02, coverage * LANE_SPAN_X);
        entry.mesh.scale.set(len, 1, 1);
        if (entry.laneIdx === 1) {
          // Unrolls right-to-left
          entry.mesh.position.x = LANE_RIGHT_X - len * 0.5;
        } else {
          // Unrolls left-to-right
          entry.mesh.position.x = LANE_LEFT_X + len * 0.5;
        }
        entry.tex.repeat.set(Math.max(0.2, (len / LANE_SPAN_X) * 4.5), 1.1);
      }

      // 3. Update the 6 Holiday Mascots (idle -> startle & jump -> gift box pop)
      for (const [idx, actor] of holidayActors.entries()) {
        const dt = elapsedSec - actor.triggerTime;
        const basePos = actor.worldPos;
        if (dt < -0.28) {
          // Calm idle bob, blink & look around on their holiday square
          actor.mascotGroup.visible = true;
          actor.giftBoxGroup.visible = false;
          const phase = elapsedSec * 2.6 + idx * 1.3;
          actor.mascotGroup.position.set(
            basePos.x,
            basePos.y + 0.02 + Math.abs(Math.sin(phase)) * 0.025,
            basePos.z,
          );
          actor.mascotGroup.rotation.y = Math.sin(elapsedSec * 1.4 + idx * 1.7) * 0.28;
          actor.mascotGroup.scale.set(1, 1 + Math.sin(phase * 2) * 0.03, 1);
        } else if (dt < 0.02) {
          // Startle squash & jump just as the roller arrives!
          actor.mascotGroup.visible = true;
          actor.giftBoxGroup.visible = false;
          const u = (dt + 0.28) / 0.3; // 0..1
          if (u < 0.28) {
            // Quick startle squash
            const sq = u / 0.28;
            actor.mascotGroup.position.set(basePos.x, basePos.y + 0.02, basePos.z);
            actor.mascotGroup.scale.set(1 + sq * 0.22, 1 - sq * 0.28, 1 + sq * 0.22);
          } else {
            // High startled jump + stretch before being flattened under the paper
            const ju = (u - 0.28) / 0.72;
            const hopY = Math.sin(ju * Math.PI) * 0.36;
            actor.mascotGroup.position.set(basePos.x, basePos.y + 0.02 + hopY, basePos.z);
            actor.mascotGroup.scale.set(0.86, 1.24, 0.86);
            actor.mascotGroup.rotation.y = ju * 0.6;
          }
        } else {
          // Mascot is wrapped; gift box pops up in its place, with the bow popping last!
          actor.mascotGroup.visible = false;
          const boxAge = dt - 0.05;
          if (boxAge <= 0) {
            actor.giftBoxGroup.visible = false;
          } else {
            actor.giftBoxGroup.visible = true;
            const boxScale = easeOutBack(Math.min(1, boxAge / 0.26));
            actor.giftBoxGroup.scale.set(boxScale, boxScale, boxScale);
            const bowAge = boxAge - 0.14;
            if (bowAge <= 0) {
              actor.bowGroup.scale.setScalar(0.001);
            } else {
              const bowScale = easeOutBack(Math.min(1, bowAge / 0.22));
              actor.bowGroup.scale.setScalar(Math.max(0.001, bowScale));
            }
          }
        }
      }

      // 4. Overhead XMAS365™ Logo Slam & Confetti (Shot 8: t >= 12.7s)
      if (elapsedSec < 12.7) {
        logoSlamMesh.visible = false;
        confettiInstanced.visible = false;
      } else {
        logoSlamMesh.visible = true;
        const slamT = Math.min(1, (elapsedSec - 12.7) / 0.25);
        const s =
          slamT < 1
            ? THREE.MathUtils.lerp(2.6, 1.0, easeInOutCubic(slamT))
            : 1.0 +
              Math.sin((elapsedSec - 12.95) * 18) * Math.exp(-(elapsedSec - 12.95) * 8) * 0.06;
        logoSlamMesh.scale.setScalar(s);
        logoSlamMesh.position.y = slamT < 1 ? THREE.MathUtils.lerp(2.2, 0.52, slamT) : 0.52;

        // Confetti burst
        const cAge = elapsedSec - 12.78;
        if (cAge > 0 && cAge < 2.4) {
          confettiInstanced.visible = true;
          for (const [i, seed] of confettiSeeds.entries()) {
            const cx = seed.vx * cAge;
            const cz = seed.vz * cAge;
            const cy = Math.max(0.14, 0.55 + seed.vy * cAge - 3.2 * cAge * cAge);
            dummy.position.set(cx, cy, cz);
            dummy.rotation.set(cAge * seed.rotSpeed, cAge * 2.1, cAge * seed.rotSpeed * 0.7);
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            confettiInstanced.setMatrixAt(i, dummy.matrix);
          }
          confettiInstanced.instanceMatrix.needsUpdate = true;
        } else {
          confettiInstanced.visible = false;
        }
      }

      // 5. Leap Day on the lone Feb 29 tile (Shots 9 & 10: blink + glasses light glint during the pause)
      const blinkWindow = elapsedSec >= 16.95 && elapsedSec <= 17.14;
      const idleBreath = 1 + Math.sin(elapsedSec * 2.2) * 0.02;
      leapDayActor.scale.set(1, blinkWindow ? 0.94 : idleBreath, 1);
      leapDayActor.rotation.y =
        0.14 + (elapsedSec > 15.8 ? Math.sin((elapsedSec - 15.8) * 1.3) * 0.07 : 0);

      if (elapsedSec >= 17.1 && elapsedSec <= 17.7) {
        const gPulse = Math.sin(((elapsedSec - 17.1) / 0.6) * Math.PI);
        glintMat.opacity = gPulse * 0.95;
        const gs = 0.6 + gPulse * 0.9;
        glintL.scale.setScalar(gs);
        glintR.scale.setScalar(gs);
      } else {
        glintMat.opacity = 0;
      }

      // 6. Position camera for current shot
      evaluateCamera(elapsedSec);
      view.camera.position.copy(camPos);
      view.camera.lookAt(camLook);
      view.camera.updateMatrixWorld();
    },
    dispose(): void {
      for (const g of disposableGeometries) g.dispose();
      for (const m of disposableMaterials) m.dispose();
      for (const t of disposableTextures) t.dispose();
    },
  };
}
