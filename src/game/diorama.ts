/**
 * 3D cel-shaded toy-theatre diorama for Holiday Hall: a single heptagonal
 * (7-bay) rotunda where the central Tuesday Finale & Calendar Desk bay and all
 * six Holiday Alcoves live around the perimeter of the same room.
 *
 * Each bay features dramatic, moody practical lighting (flickering candles,
 * wine glasses & roses in Valentine's; a crackling brick fireplace in Christmas;
 * glowing jack-o'-lanterns & moonlit gothic window in Halloween; brass
 * candelabras in Thanksgiving; twilight egg lanterns & fireflies in Easter;
 * midnight sparklers & festoon bulbs in Fourth of July).
 */
import * as THREE from 'three';
import { hexToNumber } from '../content/palettes';
import { toonMaterial } from '../render/toon';
import { ROOM_MASCOT_ID, buildMascotMesh } from './mascots';
import { type RoomId, ROOM_SPECS, STRAY_ITEMS, gameState } from './state';

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

const BAY_COUNT = BAY_ORDER.length;
const BAY_STEP = (Math.PI * 2) / BAY_COUNT;
export const HALL_WALL_RADIUS = 5.3;

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
        // Cold North Pole corporate fluorescent glare
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
        // Warm golden Tuesday party glow
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
      // Moody gaslight & shadowy spotlight rotunda
      return {
        litTint: [1.08, 0.92, 0.74],
        shadeTint: [0.36, 0.29, 0.48],
        shadeGamma: 1.42,
        sunColor: '#ffd296',
        sunIntensity: 1.32,
        sunOffsetAngle: -0.45,
        sunHeight: 11.5,
        lightLocalPos: [0, 1.65, 1.85],
        lightColor: '#ffa94d',
        lightIntensity: 4.8,
        lightDistance: 5.6,
      };
    case 'halloween':
      // Eerie midnight indigo shadow + warm pumpkin jack-o'-lantern glow
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
      // Rich candlelit mahogany & amber harvest glow
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
      // Dark pine shadow lit from below by the crackling brick fireplace
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
      // Intimate velvet-burgundy shadow lit by flickering candles, wine glasses & roses
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
      // Golden-hour yellow garden with glowing egg lanterns & fireflies
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
      // Midnight backyard lit by fizzing sparklers, firework mortars & string bulbs
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

export interface BuiltDiorama {
  root: THREE.Group;
  hotspots: Hotspot3D[];
  /** World-space anchor right above Leap Day's head in Holiday Hall (for the P2 speech bubble). */
  leapDayHeadWorldPos: THREE.Vector3;
  /** Animate Leap Day hopping from the hall center toward `roomId`'s door (`progress` in 0..1). */
  setDoorHop: (roomId: RoomId | null, progress: number) => void;
  /** Animate Leap Day's cold-start intro pop-out & idle hops around the hall floor. */
  setIntroPose: (mode: 'hidden' | 'pop' | 'idle', elapsed: number) => void;
  animate: (t: number, activeBay: BayId) => void;
}

function mat(hex: string): THREE.MeshToonMaterial {
  return toonMaterial({ color: hexToNumber(hex as `#${string}`) });
}

function glowMat(hex: string, intensity = 0.85): THREE.MeshToonMaterial {
  const c = hexToNumber(hex as `#${string}`);
  return toonMaterial({
    color: c,
    emissive: c,
    emissiveIntensity: intensity,
  });
}

function box(
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

function glowBox(
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

function cyl(
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

function sphere(r: number, hex: string, x = 0, y = 0, z = 0, castShadow = true): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  return m;
}

function glowSphere(r: number, hex: string, x = 0, y = 0, z = 0, intensity = 0.9): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), glowMat(hex, intensity));
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
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

/** Build a wax candle with an animated glowing flame tip and mild rising spark particles. */
function buildCandle(
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

  // Two gentle rising spark motes above the candle flame
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
function buildWineGlass(x: number, y: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  // Base foot & stem
  g.add(cyl(0.08, 0.09, 0.02, '#e2e8f0', 0, 0.01, 0, 12, false));
  g.add(cyl(0.016, 0.016, 0.14, '#e2e8f0', 0, 0.08, 0, 8, false));
  // Outer crystal bowl + glowing ruby wine inside
  g.add(cyl(0.095, 0.03, 0.14, '#cbd5e0', 0, 0.21, 0, 12, false));
  g.add(glowSphere(0.072, '#b81d4e', 0, 0.2, 0, 0.45));
  return g;
}

/** Build a porcelain vase with a bouquet of red roses and green leaves. */
function buildRoseBouquet(x: number, y: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  // Fluted cream-and-gold vase
  g.add(cyl(0.11, 0.08, 0.26, '#fff5f7', 0, 0.13, 0, 12, false));
  g.add(cyl(0.125, 0.11, 0.04, '#ecc94b', 0, 0.25, 0, 12, false));
  // Green foliage & stems
  g.add(sphere(0.14, '#2f855a', 0, 0.31, 0, false));
  // Cluster of ruby & crimson rose blooms
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

/**
 * Build a bold, cel-shaded 3D prop for a stray item or pedestal item.
 * Scaled and angled slightly toward the viewer so its silhouette and ink
 * outlines read unmistakably above its nameplate plaque.
 */
function buildPropMesh(id: string, accent: string): THREE.Group {
  const g = new THREE.Group();
  switch (id) {
    case 'chocolates': {
      // Open/ajar plush crimson heart-shaped box of assorted truffles with ribboned lid propped at the back
      const chocGroup = new THREE.Group();
      chocGroup.position.set(0, 0.02, 0.03);

      // Helper to build a 3D extruded heart prism (two cylinders + V-point wedge)
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
        // Inner velvet lining inset slightly higher
        const ir = r * 0.84;
        const ih = h + 0.012;
        hg.add(cyl(ir, ir, ih, floorHex, -0.072 * scale, ih / 2, -0.038 * scale, 14));
        hg.add(cyl(ir, ir, ih, floorHex, 0.072 * scale, ih / 2, -0.038 * scale, 14));
        const inTip = box(0.145 * scale, ih, 0.145 * scale, floorHex, 0, ih / 2, 0.032 * scale);
        inTip.rotation.y = Math.PI / 4;
        hg.add(inTip);
        return hg;
      };

      // 1. Open crimson & gold-trimmed heart base tray sitting on the table
      const baseTray = makeHeartTray(0.1, 1.08, '#c53030', '#4a1525');
      baseTray.add(cyl(0.142, 0.142, 0.025, '#f6e05e', -0.084, 0.015, -0.043, 14));
      baseTray.add(cyl(0.142, 0.142, 0.025, '#f6e05e', 0.084, 0.015, -0.043, 14));
      chocGroup.add(baseTray);

      // 2. Assorted truffles (dark, milk, white, and strawberry) nestled in gold paper cups
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
        // Gold foil cup
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

      // 3. Propped pink & crimson heart lid tilted open behind the tray with a 3D satin gold bow
      const lid = makeHeartTray(0.06, 1.06, '#d53f8c', '#ed64a6');
      lid.position.set(0.04, 0.24, -0.15);
      lid.rotation.x = 1.18;
      lid.rotation.z = -0.18;
      // Satin gold ribbon band + looped bow on top of the lid
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
      // Classic 5-pointed faceted gold Bethlehem Tree-Top Star on a coiled brass spring tree-mount base
      const starGroup = new THREE.Group();

      // 1. Coiled brass wire spring base (conical spiral rings that slip over a tree top)
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

      // 2. Faceted 5-point Bethlehem star head centered at y = 0.38
      const head = new THREE.Group();
      head.position.set(0, 0.38, 0);

      // 5 primary long tapered golden star points (4-sided pyramid spikes for crisp faceted shading)
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

        // 5 shorter secondary champagne-gold rays nestled in the valleys between main points
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

      // 3. Glowing warm-white diamond jewel core + raised gold bezel front & back
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
      // Fourth of July ballpark hot dog in split rounded bun with curved frankfurter, wavy mustard & toothpick flag in a checkered paper boat
      const dogGroup = new THREE.Group();
      dogGroup.position.set(0, 0.02, 0);
      dogGroup.rotation.y = -0.18;

      // 1. Red-and-white checkered paper boat tray with flared walls
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
      // Red check accents along the front rim
      for (const cx of [-0.2, 0, 0.2]) {
        const chk = box(0.08, 0.068, 0.028, '#f7fafc', cx, 0.055, 0.146);
        chk.rotation.x = 0.28;
        dogGroup.add(chk);
      }

      // 2. Two plump rounded split toasted bun halves (front & back pillows)
      for (const side of [-1, 1] as const) {
        const bz = side * 0.058;
        const bunCyl = cyl(0.068, 0.068, 0.38, '#ecc94b', 0, 0.11, bz, 12);
        bunCyl.rotation.z = Math.PI / 2;
        dogGroup.add(bunCyl);
        dogGroup.add(sphere(0.068, '#ecc94b', -0.19, 0.11, bz));
        dogGroup.add(sphere(0.068, '#ecc94b', 0.19, 0.11, bz));
      }

      // 3. Plump grilled frankfurter extending past the bun ends with rounded caps
      const frank = cyl(0.058, 0.058, 0.48, '#b83227', 0, 0.155, 0, 12);
      frank.rotation.z = Math.PI / 2;
      dogGroup.add(frank);
      dogGroup.add(sphere(0.058, '#b83227', -0.24, 0.155, 0));
      dogGroup.add(sphere(0.058, '#b83227', 0.24, 0.155, 0));

      // 4. Wavy yellow mustard squiggle + sweet green relish accents along the top of the frankfurter
      for (let i = -4; i <= 4; i++) {
        const mx = i * 0.046;
        const mz = Math.sin(i * 1.15) * 0.026;
        dogGroup.add(sphere(0.024, '#ffea79', mx, 0.215, mz));
        if (i % 2 === 0) {
          dogGroup.add(sphere(0.018, '#48bb78', mx + 0.015, 0.202, -mz * 0.8));
        }
      }

      // 5. Toothpick mini American flag planted in the center
      dogGroup.add(cyl(0.01, 0.01, 0.3, '#fbd38d', -0.02, 0.34, 0, 8));
      dogGroup.add(sphere(0.018, '#f6e05e', -0.02, 0.49, 0));
      // Striped mini flag banner + blue star canton
      dogGroup.add(box(0.18, 0.11, 0.018, '#e53e3e', 0.075, 0.42, 0));
      dogGroup.add(box(0.18, 0.022, 0.022, '#ffffff', 0.075, 0.44, 0));
      dogGroup.add(box(0.18, 0.022, 0.022, '#ffffff', 0.075, 0.4, 0));
      dogGroup.add(box(0.08, 0.06, 0.026, '#2b6cb0', 0.025, 0.445, 0));

      g.add(dogGroup);
      break;
    }
    case 'stocking': {
      // Stuffed Christmas Stocking: sculpted red velvet stocking, fluffy sherpa cuff, green heel & gold toe, candy cane + mini gift peeking out
      const stockGroup = new THREE.Group();
      stockGroup.position.set(-0.02, 0.02, 0);
      stockGroup.rotation.z = -0.08;

      // 1. Sculpted red velvet leg shaft + curved ankle + rounded foot
      const leg = cyl(0.115, 0.105, 0.3, '#c53030', -0.05, 0.25, 0, 14);
      leg.rotation.z = 0.08;
      stockGroup.add(leg);
      const foot = cyl(0.095, 0.088, 0.22, '#c53030', 0.06, 0.105, 0, 14);
      foot.rotation.z = Math.PI / 2 - 0.12;
      stockGroup.add(foot);

      // Contrast pine-green heel patch & golden-yellow rounded toe cap
      stockGroup.add(sphere(0.102, '#2f855a', -0.07, 0.1, 0));
      const toeCap = sphere(0.092, '#ecc94b', 0.175, 0.092, 0);
      toeCap.scale.set(1.12, 0.95, 0.98);
      stockGroup.add(toeCap);

      // 2. Fluffy white sherpa cuff with sculpted cloud puffs around the collar + red hanging ribbon loop
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

      // 3. Goodies stuffed into the top of the stocking:
      //    (a) Hooked red-and-white striped candy cane
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

      //    (b) Tiny emerald-and-gold wrapped present box tilted in the cuff
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

      //    (c) Shiny golden ornament ball peeking out the front
      stockGroup.add(glowSphere(0.045, '#f6e05e', -0.05, 0.48, 0.055, 0.4));

      g.add(stockGroup);
      break;
    }
    case 'goldenegg': {
      // Royal Fabergé-style Golden Egg with filigree band & jewel studs cradled in a woven birch-twig & spring blossom nest
      const eggGroup = new THREE.Group();

      // 1. Woven birch-twig bird's nest (overlapping tilted twig rings + soft green moss cradle + spring blossoms)
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
      // Interlaced twig sticks around the outer perimeter
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
      // Soft moss lining + pastel spring blossoms tucked into the twigs
      const moss = sphere(0.155, '#48bb78', 0, 0.06, 0);
      moss.scale.set(1.1, 0.45, 1.1);
      eggGroup.add(moss);
      eggGroup.add(sphere(0.032, '#fbb6ce', -0.17, 0.1, 0.09));
      eggGroup.add(sphere(0.032, '#90cdf4', 0.16, 0.1, 0.1));
      eggGroup.add(sphere(0.028, '#fefcbf', 0.04, 0.11, 0.18));

      // 2. Shimmering Golden Egg body
      const egg = glowSphere(0.175, '#f6e05e', 0, 0.27, 0, 0.45);
      egg.scale.set(0.86, 1.28, 0.86);
      eggGroup.add(egg);

      // 3. Raised golden filigree waist band, ruby & sapphire jewel cabochons, and crown finial at apex
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
      // Tiny royal crown finial at the top tip of the egg
      eggGroup.add(cyl(0.038, 0.026, 0.032, '#d69e2e', 0, 0.495, 0, 8));
      eggGroup.add(glowSphere(0.022, '#ffffff', 0, 0.52, 0, 0.8));

      g.add(eggGroup);
      break;
    }
    case 'pumpkinpie': {
      // Spiced Pumpkin Pie in a ceramic dish with crimped pastry crust, piped whipped cream rosettes, and one slice pulled forward
      const pieGroup = new THREE.Group();
      pieGroup.position.set(-0.02, 0.01, -0.02);

      const sliceAngle = Math.PI * 0.36; // ~65 degree slice cut out from the front-right
      const mainStart = sliceAngle / 2;
      const mainArc = Math.PI * 2 - sliceAngle;

      // 1. Cream ceramic pie dish base & flared rim
      pieGroup.add(cyl(0.28, 0.22, 0.07, '#fffaf0', 0, 0.035, 0, 20));

      // 2. Main pie body (crust + spiced pumpkin filling with a wedge cut out in front-right)
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

      // Crimped golden pastry scallops & piped whipped cream rosettes around the main pie rim
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

      // 3. Pulled-out triangular slice wedge in the front-right showing the rich orange filling interior
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
      // Whipped cream rosette & crimp on the pulled-out slice
      wedgeGroup.add(sphere(0.038, '#ffffff', 0, 0.14, 0.15));
      wedgeGroup.add(sphere(0.024, '#fffaf0', 0, 0.168, 0.15));
      wedgeGroup.add(sphere(0.034, '#ecc94b', -0.05, 0.12, 0.24));
      wedgeGroup.add(sphere(0.034, '#d69e2e', 0.05, 0.12, 0.24));
      pieGroup.add(wedgeGroup);

      g.add(pieGroup);
      break;
    }
    case 'jack': {
      // Classic ribbed Jack-o'-Lantern: plump multi-lobed gourd, curled green vine stem & leaf, triangular glowing eyes & toothy grin
      const jackGroup = new THREE.Group();

      // 1. Plump ribbed pumpkin body (8 vertical orange gourd lobes arranged in a ring)
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

      // 2. Twisted green vine stem + curled tendril & leaf on top
      const stemBase = cyl(0.036, 0.058, 0.09, '#2f855a', 0, 0.43, 0, 10);
      stemBase.rotation.z = 0.18;
      const stemTip = cyl(0.018, 0.036, 0.08, '#276749', -0.025, 0.49, 0, 8);
      stemTip.rotation.z = 0.52;
      const leaf = sphere(0.055, '#38a169', 0.065, 0.42, 0.02);
      leaf.scale.set(1.4, 0.32, 0.95);
      leaf.rotation.z = -0.28;
      jackGroup.add(stemBase, stemTip, leaf);

      // 3. Glowing triangular carved eyes + triangular nose
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

      // 4. Jagged multi-segment smiling grin with carved pumpkin teeth
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
      // Two dark orange tooth notches biting into the glowing grin
      jackGroup.add(box(0.028, 0.026, 0.036, '#dd6b20', -0.045, 0.148, 0.256));
      jackGroup.add(box(0.028, 0.026, 0.036, '#dd6b20', 0.045, 0.148, 0.256));

      g.add(jackGroup);
      break;
    }
    case 'basket': {
      // Woven Easter Basket with braided rim, curved arched handle, pink ribbon bow, grass, and striped pastel eggs
      const basketGroup = new THREE.Group();

      // 1. Tapered woven wicker basket body with horizontal weave ribs & braided torus rim
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

      // 2. Smooth arched wicker handle + pastel pink 3D ribbon bow on the side
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

      // 3. Bed of spring-green Easter grass + 5 painted & banded pastel Easter eggs
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
      // Star-Spangled Flag: tiered brass parade stand, pole with golden finial ball, and waving S-curve striped banner
      const flagGroup = new THREE.Group();

      // 1. Tiered brass parade stand + tall silver/white flagpole with gold ball finial
      flagGroup.add(cyl(0.15, 0.18, 0.045, '#b7791f', -0.1, 0.022, 0, 16));
      flagGroup.add(cyl(0.1, 0.14, 0.04, '#d69e2e', -0.1, 0.06, 0, 14));
      flagGroup.add(cyl(0.04, 0.06, 0.04, '#ecc94b', -0.1, 0.095, 0, 12));
      flagGroup.add(cyl(0.022, 0.024, 0.52, '#f7fafc', -0.1, 0.34, 0, 10));
      flagGroup.add(cyl(0.03, 0.03, 0.025, '#d69e2e', -0.1, 0.59, 0, 10));
      flagGroup.add(glowSphere(0.042, '#f6e05e', -0.1, 0.63, 0, 0.35));

      // 2. Waving 3-panel S-curve cloth flag banner with 7 alternating red & white stripes
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

        // Raised white star studs on the blue canton (panel 0, upper 4 stripes)
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
      // Sculpted Woven Wicker Cornucopia (curving spiral horn + braided rim + overflowing harvest bounty)
      const cornGroup = new THREE.Group();
      cornGroup.position.set(0, 0.02, 0);
      cornGroup.rotation.y = -0.28;

      // 1. Braided wicker mouth rim (facing front-left) + hollow dark interior recess
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

      // 2. Multi-segment curved & ribbed wicker horn sweeping up and curling into a spiral tail
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
      // Curled tip knob at the apex of the horn tail
      cornGroup.add(sphere(0.024, '#b7791f', 0.19, 0.45, -0.02));

      // 3. Overflowing Autumn Harvest Produce spilling from the mouth
      // Mini harvest pumpkin with green stem
      const pumpkin = sphere(0.095, '#ed8936', -0.16, 0.14, 0.08);
      pumpkin.scale.set(1.16, 0.84, 1.16);
      cornGroup.add(pumpkin);
      cornGroup.add(cyl(0.012, 0.016, 0.045, '#2f855a', -0.16, 0.22, 0.08, 8));

      // Crisp crimson apple + spring-green pear/gourd
      cornGroup.add(sphere(0.072, '#e53e3e', -0.09, 0.24, 0.1));
      const gourd = sphere(0.068, '#48bb78', -0.2, 0.21, -0.02);
      gourd.scale.set(0.9, 1.3, 0.9);
      gourd.rotation.z = 0.45;
      cornGroup.add(gourd);

      // Golden ear of corn sticking out the front-left with green husk leaf
      const cornEar = cyl(0.028, 0.038, 0.16, '#f6e05e', -0.22, 0.14, 0.02, 10);
      cornEar.rotation.z = 1.15;
      cornEar.rotation.y = 0.3;
      const husk = cyl(0.015, 0.04, 0.14, '#38a169', -0.2, 0.12, -0.02, 8);
      husk.rotation.z = 1.35;
      cornGroup.add(cornEar, husk);

      // Cascading cluster of purple Concord grapes spilling over the lower rim
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
      // Sculpted Golden Recurve Cupid's Bow & Drawn Heart-Tipped Arrow
      const bowGroup = new THREE.Group();
      bowGroup.position.set(0, 0.28, 0);
      bowGroup.rotation.z = -0.38;

      // 1. Curved golden bow stave (recurve arch facing +Y, drawn back toward -Y)
      const staveMat = mat('#f6e05e');
      const archGeo = new THREE.TorusGeometry(0.22, 0.026, 10, 24, Math.PI * 1.08);
      const arch = new THREE.Mesh(archGeo, staveMat);
      arch.rotation.z = -Math.PI * 0.04;
      arch.position.set(0, -0.02, 0);
      arch.castShadow = true;
      arch.receiveShadow = true;
      bowGroup.add(arch);

      // Curled recurve wing-tips at the left and right ends of the bow limbs
      for (const side of [-1, 1] as const) {
        const tipCurl = cyl(0.012, 0.026, 0.11, '#ecc94b', side * 0.23, -0.06, 0, 10);
        tipCurl.rotation.z = side * 0.55;
        bowGroup.add(tipCurl);
        bowGroup.add(sphere(0.032, '#fff5f7', side * 0.25, -0.1, 0));
      }

      // Crimson velvet riser grip at the center of the bow arch + gold collars
      const grip = cyl(0.034, 0.034, 0.11, '#d53f8c', 0, 0.2, 0, 10);
      grip.rotation.z = Math.PI / 2;
      bowGroup.add(grip);
      for (const side of [-1, 1] as const) {
        const collar = cyl(0.038, 0.038, 0.022, '#ecc94b', side * 0.058, 0.2, 0, 10);
        collar.rotation.z = Math.PI / 2;
        bowGroup.add(collar);
      }

      // 2. Drawn silver bowstring (two taut segments pulled back to the arrow nock at y = -0.16)
      for (const side of [-1, 1] as const) {
        const str = cyl(0.007, 0.007, 0.25, '#f7fafc', side * 0.12, -0.12, 0, 6, false);
        str.rotation.z = side * 1.24;
        bowGroup.add(str);
      }

      // 3. Nocked arrow shaft with 3D sculpted ruby heart tip and feather fletching
      bowGroup.add(cyl(0.016, 0.016, 0.5, '#fbd38d', 0, 0.09, 0.025, 8));

      // Sculpted 3D Heart arrowhead at y = 0.36
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

      // Feather fletching vanes at the tail of the arrow
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
      // Sculpted crooked Witch's Besom Broomstick with gnarled dark-wood shaft & splayed twig brush
      const broomGroup = new THREE.Group();
      broomGroup.position.set(0, 0.28, 0);
      broomGroup.rotation.z = -0.58;

      // 1. Crooked 3-segment dark walnut broomstick handle
      const shaftLow = cyl(0.026, 0.032, 0.24, '#5c3820', 0, 0.02, 0, 10);
      const shaftMid = cyl(0.024, 0.026, 0.22, '#6b4226', -0.016, 0.23, 0, 10);
      shaftMid.rotation.z = 0.14;
      const shaftTop = cyl(0.018, 0.025, 0.16, '#5c3820', -0.012, 0.39, 0, 10);
      shaftTop.rotation.z = -0.22;
      const pommel = sphere(0.028, '#4a2c18', 0.006, 0.46, 0);
      broomGroup.add(shaftLow, shaftMid, shaftTop, pommel);

      // 2. Gathered birch-twig brush head (besom) at the lower end of the broom
      // Rounded top gather shoulder
      broomGroup.add(sphere(0.078, '#b7791f', 0, -0.08, 0));
      // Main flared core bundle
      broomGroup.add(cyl(0.072, 0.165, 0.26, '#d69e2e', 0, -0.2, 0, 14));

      // Ring of splayed outer twig tufts around the brush skirt for a textured straw silhouette
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

      // 3. Witchy purple & gold binding bands cinching the brush neck
      broomGroup.add(cyl(0.084, 0.088, 0.036, '#805ad5', 0, -0.1, 0, 12));
      broomGroup.add(cyl(0.09, 0.092, 0.02, '#f6e05e', 0, -0.12, 0, 12));
      broomGroup.add(cyl(0.11, 0.115, 0.022, '#f6e05e', 0, -0.17, 0, 12));

      g.add(broomGroup);
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

/** Build a distinct 3D sculpture for each room's Centerpiece on the upper altar shelf. */
function buildCenterpieceSculpture(roomId: RoomId, accent: string, done: boolean): THREE.Group {
  const g = new THREE.Group();
  const goldOrAccent = done ? '#f6e05e' : accent;
  switch (roomId) {
    case 'halloween': {
      // Sculpted Gothic Arch Frame with concentric silver spiderweb & 8-legged Widow Spider
      // 1. Stepped stone base & twin Gothic columns with pointed arch & finials
      g.add(box(1.06, 0.1, 0.24, '#2d2438', 0, 0.05, 0));
      g.add(box(0.98, 0.06, 0.2, goldOrAccent, 0, 0.12, 0.01));
      for (const side of [-1, 1] as const) {
        const cx = side * 0.44;
        g.add(cyl(0.058, 0.068, 0.56, goldOrAccent, cx, 0.4, 0, 10));
        // Pointed Gothic pinnacle finial on each column
        const finial = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.18, 6), mat(goldOrAccent));
        finial.position.set(cx, 0.77, 0);
        g.add(finial);
        // Pointed Gothic arch ribs meeting at the apex
        const archRib = box(0.08, 0.48, 0.14, goldOrAccent, side * 0.22, 0.8, 0);
        archRib.rotation.z = side * 0.72;
        g.add(archRib);
      }
      // Apex keystone & flat dark twilight recess backdrop (strictly behind the web at z = -0.07..-0.01)
      g.add(sphere(0.065, '#ff7b29', 0, 0.96, 0.02));
      g.add(box(0.78, 0.52, 0.06, '#140d1f', 0, 0.38, -0.04));
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-0.39, 0.63);
      gableShape.lineTo(0.39, 0.63);
      gableShape.lineTo(0, 0.94);
      gableShape.closePath();
      const archBack = new THREE.Mesh(
        new THREE.ExtrudeGeometry(gableShape, { depth: 0.06, bevelEnabled: false }),
        mat('#140d1f'),
      );
      archBack.position.set(0, 0, -0.07);
      g.add(archBack);

      // 2. Concentric silver spiderweb (6 radial spokes + 3 polygonal web rings)
      const webY = 0.48;
      const webZ = 0.05;
      for (let i = 0; i < 6; i++) {
        const spoke = box(0.76, 0.024, 0.02, '#e2e8f0', 0, webY, webZ + i * 0.002);
        spoke.rotation.z = (i * Math.PI) / 6;
        g.add(spoke);
      }
      for (const r of [0.13, 0.24, 0.35]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.013, 6, 12), mat('#cbd5e0'));
        ring.position.set(0, webY, webZ + 0.015);
        g.add(ring);
      }

      // 3. Sculpted 8-legged Widow Spider in the center of the web
      const spider = new THREE.Group();
      spider.position.set(0, webY, webZ + 0.05);
      const abdomen = sphere(0.105, '#1a202c', 0, 0.045, 0);
      abdomen.scale.set(0.95, 1.2, 0.85);
      spider.add(abdomen);
      // Glowing orange hourglass emblem on the abdomen
      spider.add(glowSphere(0.042, '#ff7b29', 0, 0.05, 0.075, 1.1));
      // Cephalothorax + pair of glowing ruby/amber eyes
      spider.add(sphere(0.068, '#2d3748', 0, -0.065, 0.015));
      spider.add(glowSphere(0.022, '#ffea79', -0.026, -0.1, 0.065, 1.3));
      spider.add(glowSphere(0.022, '#ffea79', 0.026, -0.1, 0.065, 1.3));
      // 8 jointed spider legs (4 per side)
      const legAngles = [-0.55, -0.18, 0.2, 0.58];
      for (const side of [-1, 1] as const) {
        for (const la of legAngles) {
          const leg = cyl(0.013, 0.01, 0.22, '#1a202c', side * 0.12, -0.03 + la * 0.08, 0.01, 6);
          leg.rotation.z = Math.PI / 2 + side * la;
          spider.add(leg);
        }
      }
      g.add(spider);
      break;
    }
    case 'thanksgiving': {
      // Oval Silver/Gold Banquet Platter with herb/cranberry garnish, golden roast turkey, wings & paper-frilled drumsticks
      // 1. Oval banquet platter with raised rim
      const platterRim = cyl(0.5, 0.44, 0.07, goldOrAccent, 0, 0.05, 0, 20);
      platterRim.scale.set(1.22, 1, 0.92);
      const platterWell = cyl(0.42, 0.4, 0.08, '#fffaf0', 0, 0.06, 0, 18);
      platterWell.scale.set(1.2, 1, 0.9);
      g.add(platterRim, platterWell);

      // Ring of green herb sprigs & ruby cranberries around the platter edge
      const garnishCount = 12;
      for (let i = 0; i < garnishCount; i++) {
        const ang = (i / garnishCount) * Math.PI * 2;
        const gx = Math.cos(ang) * 0.46;
        const gz = Math.sin(ang) * 0.34;
        const herb = sphere(0.052, i % 2 === 0 ? '#2f855a' : '#38a169', gx, 0.11, gz);
        herb.scale.set(1.2, 0.55, 1.2);
        g.add(herb);
        g.add(sphere(0.028, i % 3 === 0 ? '#ecc94b' : '#c53030', gx * 0.92, 0.135, gz * 0.92));
      }

      // 2. Plump golden-brown roast turkey breast & body
      const breast = sphere(0.28, '#c05621', 0, 0.31, -0.02);
      breast.scale.set(1.26, 0.98, 1.08);
      g.add(breast);
      // Glazed golden highlight ridge along the breastbone
      const ridge = sphere(0.21, '#dd6b20', 0, 0.39, 0.02);
      ridge.scale.set(1.15, 0.72, 0.95);
      g.add(ridge);

      // 3. Sculpted tucked wings on the left & right flanks + angled drumsticks with white chef paper frills
      for (const side of [-1, 1] as const) {
        const wing = sphere(0.13, '#b7501c', side * 0.31, 0.25, -0.05);
        wing.scale.set(0.75, 0.95, 1.35);
        wing.rotation.z = side * 0.25;
        g.add(wing);

        // Drumstick thigh + bone + fluted white paper frill crown
        const drumGroup = new THREE.Group();
        drumGroup.position.set(side * 0.24, 0.3, 0.15);
        drumGroup.rotation.z = -side * 0.48;
        drumGroup.rotation.x = 0.38;
        const thigh = sphere(0.115, '#dd6b20', 0, 0, 0);
        thigh.scale.set(0.9, 1.35, 0.9);
        const bone = cyl(0.026, 0.032, 0.14, '#fefcbf', 0, 0.14, 0, 8);
        const frill = cyl(0.058, 0.032, 0.065, '#ffffff', 0, 0.21, 0, 10);
        drumGroup.add(thigh, bone, frill);
        g.add(drumGroup);
      }
      break;
    }
    case 'christmas': {
      // Tiered Conical Evergreen Christmas Tree with scalloped boughs, spiral gold garland, baubles & faceted 5-point Star Topper
      // 1. Crimson & gold tree skirt + cedar trunk
      g.add(cyl(0.44, 0.48, 0.04, '#c53030', 0, 0.02, 0.04, 18));
      g.add(cyl(0.46, 0.49, 0.025, '#f6e05e', 0, 0.015, 0.04, 18));
      g.add(cyl(0.085, 0.11, 0.26, '#5c3820', 0, 0.14, 0.04, 10));

      // 2. Four tiered conical evergreen bough layers with scalloped branch tips
      const tiers: { y: number; r: number; h: number; hex: string }[] = [
        { y: 0.34, r: 0.46, h: 0.36, hex: '#22543d' },
        { y: 0.56, r: 0.38, h: 0.34, hex: '#276749' },
        { y: 0.76, r: 0.29, h: 0.3, hex: '#2f855a' },
        { y: 0.93, r: 0.19, h: 0.26, hex: '#38a169' },
      ];
      for (const t of tiers) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 12), mat(t.hex));
        cone.position.set(0, t.y, 0.04);
        cone.scale.set(1.08, 1, 0.88);
        g.add(cone);
      }

      // 3. Spiral golden tinsel garland beads + glowing colorful ornaments
      const garlandSteps = 14;
      for (let i = 0; i < garlandSteps; i++) {
        const frac = i / (garlandSteps - 1);
        const gy = 0.24 + frac * 0.66;
        const gr = (0.42 - frac * 0.25) * 0.96;
        const ang = -Math.PI * 0.38 + frac * Math.PI * 2.5;
        const gx = Math.sin(ang) * gr * 1.05;
        const gz = 0.04 + Math.cos(ang) * gr * 0.85;
        g.add(glowSphere(0.032, '#f6e05e', gx, gy, gz, 0.55));
      }

      const ornaments: [number, number, number, string][] = [
        [-0.24, 0.3, 0.34, '#ff4d4d'],
        [0.22, 0.32, 0.33, '#63b3ed'],
        [0, 0.46, 0.34, '#ffea79'],
        [-0.18, 0.56, 0.28, '#ed64a6'],
        [0.18, 0.58, 0.27, '#ff4d4d'],
        [-0.1, 0.74, 0.22, '#63b3ed'],
        [0.1, 0.76, 0.22, '#ffea79'],
      ];
      for (const [ox, oy, oz, oHex] of ornaments) {
        g.add(glowSphere(0.056, oHex, ox, oy, oz, 0.85));
      }

      // 4. Faceted 5-pointed Bethlehem Star Topper at the crown
      const starTop = new THREE.Group();
      starTop.position.set(0, 1.12, 0.04);
      const starHex = done ? '#ffea79' : '#f6e05e';
      for (let i = 0; i < 5; i++) {
        const sp = new THREE.Group();
        sp.rotation.z = (i * Math.PI * 2) / 5;
        const pt = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.16, 4), glowMat(starHex, 0.95));
        pt.rotation.y = Math.PI / 4;
        pt.position.y = 0.08;
        sp.add(pt);
        starTop.add(sp);
      }
      starTop.add(glowSphere(0.052, '#ffffff', 0, 0, 0.02, 1.1));
      g.add(starTop);
      break;
    }
    case 'valentines': {
      // Sculpted Sweetheart Pedestal Mailbox with gold trim, embossed heart badge, raised flag & love letters spilling out
      // 1. Fluted pedestal base + mailbox cabinet + rounded barrel-vault roof
      g.add(box(0.76, 0.08, 0.44, '#97266d', 0, 0.04, 0));
      g.add(box(0.68, 0.46, 0.38, '#d53f8c', 0, 0.3, 0));
      const roof = cyl(0.19, 0.19, 0.68, '#ed64a6', 0, 0.53, 0, 16);
      roof.rotation.z = Math.PI / 2;
      g.add(roof);

      // Gold trim bands framing the front and roof arch
      const frontArch = new THREE.Mesh(
        new THREE.TorusGeometry(0.192, 0.022, 8, 16, Math.PI),
        mat('#f6e05e'),
      );
      frontArch.position.set(0, 0.53, 0.19);
      g.add(frontArch);
      g.add(box(0.71, 0.04, 0.41, '#f6e05e', 0, 0.1, 0));
      g.add(box(0.71, 0.035, 0.41, '#f6e05e', 0, 0.52, 0));

      // 2. Embossed 3D Ruby Heart Crest above the mail slot
      const crest = new THREE.Group();
      crest.position.set(0, 0.58, 0.21);
      crest.add(glowSphere(0.048, '#e53e3e', -0.032, 0.02, 0, 0.5));
      crest.add(glowSphere(0.048, '#e53e3e', 0.032, 0.02, 0, 0.5));
      const crestTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.068, 0.095, 10),
        glowMat('#e53e3e', 0.5),
      );
      crestTip.rotation.z = Math.PI;
      crestTip.position.set(0, -0.025, 0);
      crest.add(crestTip);
      g.add(crest);

      // 3. Open recessed mail slot with fanned white love-letter envelopes & red wax heart seals peeking out
      g.add(box(0.48, 0.11, 0.04, '#4a1525', 0, 0.39, 0.185));
      const letters: { x: number; y: number; z: number; rz: number }[] = [
        { x: -0.1, y: 0.38, z: 0.22, rz: 0.14 },
        { x: 0.08, y: 0.39, z: 0.235, rz: -0.12 },
      ];
      for (const l of letters) {
        const env = new THREE.Group();
        env.position.set(l.x, l.y, l.z);
        env.rotation.z = l.rz;
        env.rotation.x = 0.22;
        env.add(glowBox(0.22, 0.14, 0.022, '#fff5f7', 0, 0, 0, 0.3));
        env.add(glowSphere(0.026, '#e53e3e', 0, 0, 0.015, 0.6));
        g.add(env);
      }

      // 4. Raised gold mail-call flag on the right side with a heart-shaped flag pennant
      g.add(cyl(0.035, 0.035, 0.05, '#ecc94b', 0.36, 0.38, 0.06, 10));
      g.add(glowBox(0.045, 0.3, 0.045, '#f6e05e', 0.38, 0.52, 0.06, 0.55));
      g.add(glowBox(0.14, 0.09, 0.035, '#e53e3e', 0.43, 0.64, 0.06, 0.65));
      break;
    }
    case 'easter': {
      // Branching Blossoming Spring Egg Tree with pastel flower clusters & hanging painted Easter eggs on ribbons
      // 1. Mossy garden mound base + gnarled branching tree trunk
      const mound = sphere(0.32, '#48bb78', 0, 0.04, 0);
      mound.scale.set(1.25, 0.28, 1.1);
      g.add(mound);
      g.add(cyl(0.085, 0.135, 0.44, '#6b4226', 0, 0.26, 0, 12));
      // 3 reaching upper branches
      const branchL = cyl(0.045, 0.07, 0.32, '#6b4226', -0.16, 0.52, 0.02, 8);
      branchL.rotation.z = 0.62;
      const branchR = cyl(0.045, 0.07, 0.32, '#6b4226', 0.16, 0.52, 0.02, 8);
      branchR.rotation.z = -0.62;
      const branchC = cyl(0.04, 0.065, 0.28, '#6b4226', 0, 0.58, -0.02, 8);
      g.add(branchL, branchR, branchC);

      // 2. Multi-cloud golden-yellow & pastel blossom canopy
      const clouds: [number, number, number, number, string][] = [
        [0, 0.74, 0, 0.26, '#ecc94b'],
        [-0.25, 0.64, 0.04, 0.2, '#f6e05e'],
        [0.25, 0.64, 0.04, 0.2, '#f6e05e'],
        [-0.12, 0.82, 0.08, 0.17, '#fefcbf'],
        [0.12, 0.82, 0.08, 0.17, '#fefcbf'],
      ];
      for (const [cx, cy, cz, cr, cHex] of clouds) {
        g.add(sphere(cr, cHex, cx, cy, cz));
      }
      // Pink & lavender spring blossom accents dotted across the canopy
      for (const [bx, by, bz, bHex] of [
        [-0.18, 0.72, 0.2, '#fbb6ce'],
        [0.18, 0.72, 0.2, '#b794f4'],
        [0, 0.66, 0.25, '#fbb6ce'],
        [-0.32, 0.68, 0.16, '#90cdf4'],
        [0.32, 0.68, 0.16, '#fbb6ce'],
      ] as const) {
        g.add(glowSphere(0.042, bHex, bx, by, bz, 0.45));
      }

      // 3. Hanging painted Easter eggs suspended from branches on ribbons + Crown Golden Egg
      const hangingEggs: { x: number; y: number; z: number; hex: string; band: string }[] = [
        { x: -0.26, y: 0.44, z: 0.16, hex: '#fbb6ce', band: '#f6e05e' },
        { x: 0.26, y: 0.44, z: 0.16, hex: '#90cdf4', band: '#ffffff' },
        { x: -0.11, y: 0.54, z: 0.24, hex: '#b794f4', band: '#fefcbf' },
        { x: 0.11, y: 0.54, z: 0.24, hex: '#68d391', band: '#ffffff' },
      ];
      for (const he of hangingEggs) {
        g.add(cyl(0.008, 0.008, 0.12, '#ffffff', he.x, he.y + 0.09, he.z, 6));
        const egg = glowSphere(0.075, he.hex, he.x, he.y, he.z, 0.55);
        egg.scale.set(0.82, 1.26, 0.82);
        g.add(egg);
        const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 6, 12), mat(he.band));
        stripe.rotation.x = Math.PI / 2;
        stripe.position.set(he.x, he.y, he.z);
        g.add(stripe);
      }
      // Crown Golden Egg at the top of the tree
      const crownEgg = glowSphere(0.105, done ? '#ffea79' : '#f6e05e', 0, 0.94, 0.16, 0.95);
      crownEgg.scale.set(0.84, 1.28, 0.84);
      g.add(crownEgg);
      break;
    }
    case 'fourth': {
      // Timber A-frame Firework Finale Launch Battery with 5 fanned sky-rockets, conical nosecones, fins & glowing fuses
      // 1. Timber launch rack base & crossbar rail
      g.add(box(0.92, 0.09, 0.34, '#6b4226', 0, 0.045, 0));
      g.add(box(0.86, 0.06, 0.08, '#d69e2e', 0, 0.24, 0.1));
      g.add(box(0.07, 0.24, 0.26, '#8c6239', -0.38, 0.14, 0));
      g.add(box(0.07, 0.24, 0.26, '#8c6239', 0.38, 0.14, 0));

      // 2. Fan of 5 patriotic sky-rockets with nosecones, stripe rings, tail fins & glowing sparkler fuses
      const rockets: {
        x: number;
        z: number;
        rz: number;
        scale: number;
        bodyHex: string;
        stripeHex: string;
        coneHex: string;
        sparkHex: string;
      }[] = [
        {
          x: -0.3,
          z: -0.02,
          rz: 0.22,
          scale: 0.86,
          bodyHex: '#2b6cb0',
          stripeHex: '#ffffff',
          coneHex: '#e53e3e',
          sparkHex: '#63b3ed',
        },
        {
          x: -0.15,
          z: 0.02,
          rz: 0.1,
          scale: 0.96,
          bodyHex: '#e53e3e',
          stripeHex: '#ffffff',
          coneHex: '#2b6cb0',
          sparkHex: '#ffbe3b',
        },
        {
          x: 0,
          z: 0.05,
          rz: 0,
          scale: 1.08,
          bodyHex: '#ffffff',
          stripeHex: '#e53e3e',
          coneHex: '#2b6cb0',
          sparkHex: '#ffea79',
        },
        {
          x: 0.15,
          z: 0.02,
          rz: -0.1,
          scale: 0.96,
          bodyHex: '#e53e3e',
          stripeHex: '#ffffff',
          coneHex: '#2b6cb0',
          sparkHex: '#ffbe3b',
        },
        {
          x: 0.3,
          z: -0.02,
          rz: -0.22,
          scale: 0.86,
          bodyHex: '#2b6cb0',
          stripeHex: '#ffffff',
          coneHex: '#e53e3e',
          sparkHex: '#ff6b6b',
        },
      ];

      for (const r of rockets) {
        const rg = new THREE.Group();
        rg.position.set(r.x, 0.12, r.z);
        rg.rotation.z = r.rz;
        rg.scale.setScalar(r.scale);

        // Rocket tube body + 2 contrast stripe bands
        rg.add(cyl(0.068, 0.068, 0.42, r.bodyHex, 0, 0.28, 0, 12));
        rg.add(cyl(0.072, 0.072, 0.055, r.stripeHex, 0, 0.2, 0, 12));
        rg.add(cyl(0.072, 0.072, 0.055, r.stripeHex, 0, 0.36, 0, 12));

        // Conical rocket nosecone + glowing starburst tip
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.2, 12), mat(r.coneHex));
        nose.position.set(0, 0.58, 0);
        rg.add(nose);
        rg.add(glowSphere(0.055, r.sparkHex, 0, 0.7, 0, 0.85));

        // Pair of swept tail fins at the bottom of the rocket tube
        for (const fSide of [-1, 1] as const) {
          const fin = box(0.045, 0.11, 0.02, r.coneHex, fSide * 0.072, 0.13, 0);
          fin.rotation.z = -fSide * 0.25;
          rg.add(fin);
        }
        g.add(rg);
      }
      break;
    }
  }
  g.rotation.x = 0.22;
  g.traverse((c) => {
    c.castShadow = false;
  });
  return g;
}

function buildMascotStage(
  roomId: RoomId,
  accent: string,
  freed: boolean,
): { stage: THREE.Group; mascotMesh: THREE.Group } {
  const stage = new THREE.Group();
  const hitCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.44, 0.92, 12),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hitCyl.position.set(0, 0.46, 0);
  hitCyl.layers.set(2);
  stage.add(hitCyl);
  const baseBot = cyl(0.36, 0.4, 0.09, '#5c3d24', 0, 0.045, 0, 16);
  const baseTop = cyl(0.33, 0.35, 0.04, freed ? '#48bb78' : accent, 0, 0.1, 0, 16);
  baseBot.receiveShadow = false;
  baseTop.receiveShadow = false;
  stage.add(baseBot, baseTop);

  const mascotMesh = buildMascotMesh(ROOM_MASCOT_ID[roomId], 0.58);
  mascotMesh.position.set(0, 0.12, 0);
  mascotMesh.traverse((c) => {
    c.castShadow = false;
    c.receiveShadow = false;
  });
  stage.add(mascotMesh);

  if (!freed) {
    const cage = new THREE.Group();
    const cageRadius = 0.3;
    const cageBottomY = 0.13;
    const cageTopY = 0.77;
    const cageHeight = cageTopY - cageBottomY;

    const botRing = new THREE.Mesh(
      new THREE.TorusGeometry(cageRadius, 0.018, 8, 18),
      mat('#2d3748'),
    );
    botRing.rotation.x = Math.PI / 2;
    botRing.position.set(0, cageBottomY, 0);
    cage.add(botRing);

    const topRing = new THREE.Mesh(
      new THREE.TorusGeometry(cageRadius, 0.018, 8, 18),
      mat('#2d3748'),
    );
    topRing.rotation.x = Math.PI / 2;
    topRing.position.set(0, cageTopY, 0);
    cage.add(topRing);

    // 8 vertical bars offset by half-step so the front-center window stays clear of bars
    for (let i = 0; i < 8; i++) {
      const ang = ((i + 0.5) / 8) * Math.PI * 2;
      const bx = Math.sin(ang) * cageRadius;
      const bz = Math.cos(ang) * cageRadius;
      cage.add(cyl(0.013, 0.013, cageHeight, '#4a5568', bx, cageBottomY + cageHeight / 2, bz, 8));
    }

    // 2 crossed dome ribs on top + brass hanging ring
    for (const rotY of [Math.PI / 8, -Math.PI / 8]) {
      const domeArc = new THREE.Mesh(
        new THREE.TorusGeometry(cageRadius, 0.015, 8, 16, Math.PI),
        mat('#2d3748'),
      );
      domeArc.rotation.y = rotY;
      domeArc.position.set(0, cageTopY, 0);
      cage.add(domeArc);
    }
    const hookRing = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 12), mat('#d69e2e'));
    hookRing.position.set(0, cageTopY + cageRadius + 0.03, 0);
    cage.add(hookRing);

    // Corporate XMAS365 red-and-gold padlock on the front-right bar
    const lockX = Math.sin(Math.PI / 8) * (cageRadius + 0.02);
    const lockZ = Math.cos(Math.PI / 8) * (cageRadius + 0.02);
    cage.add(box(0.09, 0.1, 0.04, '#c53030', lockX, 0.42, lockZ));
    cage.add(box(0.094, 0.024, 0.044, '#ecc94b', lockX, 0.42, lockZ));
    cage.traverse((c) => {
      c.castShadow = false;
      c.receiveShadow = false;
    });
    stage.add(cage);
  }

  return { stage, mascotMesh };
}

/** Build a wrapped gift box with overhanging lid, crossed ribbons, and a 3D ribbon bow on top. */
function buildPresentBox(
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
  // Box body + slightly overhanging lid
  g.add(box(w, h, d, wrapHex, 0, h / 2, 0));
  g.add(box(w + 0.024, lidH, d + 0.024, wrapHex, 0, h - lidH / 2 + 0.008, 0));
  // Crossed ribbons (staggered slightly so they never z-fight)
  const ribW = Math.max(0.036, Math.min(w, d) * 0.22);
  g.add(box(ribW, h + 0.018, d + 0.032, ribbonHex, 0, h / 2 + 0.004, 0));
  g.add(box(w + 0.032, h + 0.022, ribW, ribbonHex, 0, h / 2 + 0.006, 0));
  // 3D sculpted bow loops + center knot on top
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
 * Add holiday-specific glowing practical fixtures (candles, hearth fire,
 * jack-o'-lanterns, lanterns) and rich thematic set-dressing props to a Holiday Alcove bay.
 * The single shadow-casting light source is centered in each bay's fixture via `dioramaLight`.
 */
function decorateHolidayAlcove(
  roomId: RoomId,
  bay: THREE.Group,
  flames: FlameEntry[],
  fireflies: { mesh: THREE.Object3D; baseX: number; baseY: number; baseZ: number; phase: number }[],
): void {
  switch (roomId) {
    case 'halloween': {
      // 1. Eerie moonlit Gothic arched window high on the back wall with glowing full harvest moon
      bay.add(box(1.5, 0.72, 0.06, '#1a1126', 0, 3.12, 0.14, false));
      const winArchFrame = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.06, 18, 1, false, 0, Math.PI),
        mat('#1a1126'),
      );
      winArchFrame.rotation.z = Math.PI / 2;
      winArchFrame.rotation.y = Math.PI / 2;
      winArchFrame.position.set(0, 3.48, 0.14);
      bay.add(winArchFrame);

      bay.add(glowBox(1.32, 0.62, 0.04, '#63b3ed', 0, 3.12, 0.16, 0.45));
      const winArchPane = new THREE.Mesh(
        new THREE.CylinderGeometry(0.66, 0.66, 0.04, 16, 1, false, 0, Math.PI),
        glowMat('#63b3ed', 0.45),
      );
      winArchPane.rotation.z = Math.PI / 2;
      winArchPane.rotation.y = Math.PI / 2;
      winArchPane.position.set(0, 3.43, 0.16);
      bay.add(winArchPane);

      // Glowing full moon inside the window arch + Gothic muntin bars
      const moon = glowSphere(0.22, '#fefcbf', 0.24, 3.44, 0.17, 1.05);
      moon.scale.set(1, 1, 0.25);
      bay.add(moon);
      bay.add(box(1.36, 0.045, 0.06, '#2d2438', 0, 3.18, 0.18, false));
      bay.add(box(1.36, 0.045, 0.06, '#2d2438', 0, 3.43, 0.18, false));
      bay.add(box(0.045, 0.96, 0.06, '#2d2438', 0, 3.3, 0.18, false));
      bay.add(box(0.04, 0.76, 0.06, '#2d2438', -0.34, 3.2, 0.18, false));
      bay.add(box(0.04, 0.76, 0.06, '#2d2438', 0.34, 3.2, 0.18, false));

      // 2. Central Spooky Stone Porch Ledge (y=0.78..1.38) in unobstructed center stage
      //    holding ribbed carved Jack-o'-Lanterns and dripping black & orange candles!
      bay.add(box(1.16, 0.12, 0.42, '#2d2438', 0, 0.78, 0.36, false));
      const glowEyeMat = glowMat('#ffea79', 1.35);
      for (const side of [-1, 1] as const) {
        const lantern = new THREE.Group();
        lantern.position.set(side * 0.34, 0.84, 0.42);
        lantern.rotation.y = -side * 0.18;
        // Ribbed pumpkin gourd lobes
        for (let l = 0; l < 6; l++) {
          const lang = (l / 6) * Math.PI * 2;
          const lobe = sphere(
            0.125,
            l % 2 === 0 ? '#ed8936' : '#dd6b20',
            Math.cos(lang) * 0.075,
            0.15,
            Math.sin(lang) * 0.075,
            false,
          );
          lobe.scale.set(0.95, 1.25, 0.95);
          lantern.add(lobe);
        }
        const stem = cyl(0.024, 0.038, 0.08, '#2f855a', 0, 0.32, 0, 8, false);
        stem.rotation.z = side * 0.22;
        lantern.add(stem);
        // Triangular glowing eyes & toothy grin
        for (const eSide of [-1, 1] as const) {
          const eye = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.062, 3), glowEyeMat);
          eye.position.set(eSide * 0.065, 0.18, 0.185);
          eye.rotation.y = Math.PI;
          lantern.add(eye);
        }
        lantern.add(glowBox(0.14, 0.04, 0.03, '#ffea79', 0, 0.095, 0.185, 1.35));
        lantern.add(box(0.025, 0.022, 0.036, '#dd6b20', -0.03, 0.105, 0.19, false));
        lantern.add(box(0.025, 0.022, 0.036, '#dd6b20', 0.03, 0.105, 0.19, false));
        bay.add(lantern);
      }
      bay.add(buildCandle(0.045, 0.28, '#1a202c', 0, 0.84, 0.44, flames, 0.4));
      bay.add(buildCandle(0.04, 0.2, '#ff7b29', -0.09, 0.84, 0.48, flames, 1.3));
      bay.add(buildCandle(0.04, 0.22, '#ff7b29', 0.09, 0.84, 0.48, flames, 2.1));

      // 3. Crooked wrought-iron porch railings left & right with iron balusters and spear finials
      for (const side of [-1, 1] as const) {
        const rx = side * 1.68;
        bay.add(box(0.08, 0.95, 0.08, '#1a202c', rx, 0.48, 0.85));
        bay.add(box(0.08, 0.88, 0.08, '#1a202c', rx, 0.44, 1.85));
        bay.add(box(0.06, 0.05, 1.1, '#1a202c', rx, 0.78, 1.35));
        bay.add(box(0.05, 0.04, 1.04, '#1a202c', rx, 0.18, 1.35));
        for (const bz of [1.05, 1.25, 1.45, 1.65]) {
          bay.add(cyl(0.016, 0.016, 0.66, '#2d3748', rx, 0.5, bz, 6));
          const spear = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.08, 4), mat('#2d3748'));
          spear.position.set(rx, 0.86, bz);
          bay.add(spear);
        }
      }

      // 4. Large Hero Floor Props:
      //    (a) Left Outer Flank: Towering Gnarled Spooky Dead Tree (2.55m tall) with hanging iron cage lantern & perched raven
      const spookyTree = new THREE.Group();
      spookyTree.position.set(-1.74, 0, 0.72);
      spookyTree.rotation.y = 0.35;
      // Twisted dark trunk & spreading roots
      spookyTree.add(cyl(0.14, 0.24, 1.35, '#23192d', 0, 0.68, 0, 10));
      for (const [rx, rz, rotZ] of [
        [-0.16, 0.12, 0.55],
        [0.18, 0.1, -0.52],
        [0, -0.16, 0.45],
      ] as const) {
        const root = cyl(0.045, 0.09, 0.38, '#1a1126', rx, 0.12, rz, 8);
        root.rotation.z = rotZ;
        spookyTree.add(root);
      }
      // Crooked upper trunk & gnarled boughs reaching across the gothic alcove
      const upperTrunk = cyl(0.095, 0.14, 1.15, '#23192d', 0.08, 1.82, -0.04, 9);
      upperTrunk.rotation.z = -0.18;
      spookyTree.add(upperTrunk);
      const boughR = cyl(0.045, 0.085, 0.92, '#2d203a', 0.42, 2.18, 0.08, 8);
      boughR.rotation.z = -1.05;
      spookyTree.add(boughR);
      const boughL = cyl(0.04, 0.075, 0.74, '#2d203a', -0.22, 2.05, 0.06, 8);
      boughL.rotation.z = 0.78;
      spookyTree.add(boughL);
      // Hanging wrought-iron cage lantern dangling from the right bough
      spookyTree.add(cyl(0.01, 0.01, 0.28, '#1a202c', 0.72, 1.88, 0.1, 6));
      spookyTree.add(cyl(0.09, 0.06, 0.05, '#1a202c', 0.72, 1.72, 0.1, 8));
      const treeLanternGlow = glowSphere(0.075, '#ff922b', 0.72, 1.62, 0.1, 1.25);
      spookyTree.add(treeLanternGlow);
      flames.push({ mesh: treeLanternGlow, baseY: 1.62, phase: 1.8 });
      spookyTree.add(cyl(0.06, 0.08, 0.04, '#1a202c', 0.72, 1.52, 0.1, 8));
      // Perched raven with glowing purple eyes on the left bough
      spookyTree.add(sphere(0.075, '#11131a', -0.42, 2.34, 0.08));
      spookyTree.add(sphere(0.052, '#11131a', -0.37, 2.41, 0.12));
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 6), mat('#ecc94b'));
      beak.rotation.x = Math.PI / 2;
      beak.position.set(-0.34, 2.41, 0.18);
      spookyTree.add(beak);
      bay.add(spookyTree);

      //    (b) Right Outer Flank: Leaning Gothic Tombstone Monument (1.45m tall) & Wrought-Iron Torch Stand (1.75m tall)
      const graveGroup = new THREE.Group();
      graveGroup.position.set(1.72, 0, 0.76);
      graveGroup.rotation.y = -0.32;
      graveGroup.add(box(0.68, 0.16, 0.36, '#3b334a', 0, 0.08, 0));
      graveGroup.add(box(0.58, 0.12, 0.3, '#4a415a', 0, 0.22, 0));
      const headstone = new THREE.Group();
      headstone.position.set(0, 0.28, 0);
      headstone.rotation.z = -0.06;
      headstone.add(box(0.5, 0.86, 0.18, '#5a506b', 0, 0.43, 0));
      const tombArch = cyl(0.25, 0.25, 0.18, '#5a506b', 0, 0.86, 0, 14);
      tombArch.rotation.x = Math.PI / 2;
      headstone.add(tombArch);
      // Carved stone cross relief on the tombstone
      headstone.add(box(0.06, 0.34, 0.04, '#2d2438', 0, 0.68, 0.09));
      headstone.add(box(0.22, 0.06, 0.04, '#2d2438', 0, 0.74, 0.09));
      graveGroup.add(headstone);
      // Tall wrought-iron torch stand beside the tombstone
      graveGroup.add(cyl(0.03, 0.05, 1.55, '#1a202c', -0.38, 0.78, 0.12, 8));
      graveGroup.add(cyl(0.11, 0.05, 0.14, '#2d3748', -0.38, 1.56, 0.12, 10));
      graveGroup.add(buildCandle(0.055, 0.24, '#ff7b29', -0.38, 1.62, 0.12, flames, 0.9));
      bay.add(graveGroup);

      //    (c) Inner Rug: Large Bubbling Witch's Cauldron on Firewood Tripod (left) + Giant Pumpkin Stack (right)
      const cauldron = new THREE.Group();
      cauldron.position.set(-0.56, 0.03, 1.04);
      cauldron.scale.setScalar(1.38);
      // Glowing fire logs underneath the cauldron
      cauldron.add(glowBox(0.28, 0.04, 0.18, '#ff7733', 0, 0.03, 0, 1.1));
      const potBelly = sphere(0.23, '#1f2430', 0, 0.22, 0);
      potBelly.scale.set(1.14, 0.94, 1.14);
      cauldron.add(potBelly);
      const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 10, 18), mat('#2d3748'));
      potRim.rotation.x = Math.PI / 2;
      potRim.position.set(0, 0.36, 0);
      cauldron.add(potRim);
      cauldron.add(glowSphere(0.175, '#48bb78', 0, 0.29, 0, 0.95));
      cauldron.add(glowSphere(0.05, '#9ae6b4', -0.05, 0.4, 0.03, 1.2));
      cauldron.add(glowSphere(0.04, '#68d391', 0.06, 0.39, -0.04, 1.1));
      cauldron.add(glowSphere(0.038, '#9ae6b4', 0.02, 0.42, 0.06, 1.25));
      // Long wooden stirring ladle sticking out of the cauldron
      const ladle = cyl(0.018, 0.022, 0.42, '#6b4226', 0.08, 0.48, -0.04, 8);
      ladle.rotation.z = -0.38;
      cauldron.add(ladle);
      bay.add(cauldron);

      const floorPump1 = sphere(0.24, '#dd6b20', 0.54, 0.21, 1.02);
      floorPump1.scale.set(1.2, 0.85, 1.2);
      bay.add(floorPump1, cyl(0.032, 0.045, 0.09, '#2f855a', 0.54, 0.42, 1.02, 10));
      const floorPump2 = sphere(0.17, '#ed8936', 0.72, 0.16, 1.22);
      floorPump2.scale.set(1.16, 0.86, 1.16);
      bay.add(floorPump2, cyl(0.024, 0.032, 0.07, '#2f855a', 0.72, 0.31, 1.22, 8));
      const floorPump3 = sphere(0.14, '#f6ad55', 0.48, 0.13, 1.28);
      floorPump3.scale.set(1.14, 0.84, 1.14);
      bay.add(floorPump3, cyl(0.02, 0.028, 0.06, '#2f855a', 0.48, 0.25, 1.28, 8));
      bay.add(buildCandle(0.044, 0.22, '#fffaf0', 0.34, 0.03, 0.98, flames, 2.6));
      break;
    }

    case 'thanksgiving': {
      // 1. Draped autumn leaf, pinecone & golden ribbon garland swags across the upper wall
      const leafColors = ['#dd6b20', '#c53030', '#ecc94b', '#b7791f'];
      for (let i = -6; i <= 6; i++) {
        const gx = i * 0.23;
        const swagWave = Math.abs(Math.sin((i / 3) * Math.PI * 0.5)) * 0.18;
        const gy = 3.36 - swagWave;
        // Vine cord segment + angled autumn leaf cluster
        bay.add(sphere(0.055, '#5c3820', gx, gy, 0.16, false));
        const leaf = sphere(
          0.095,
          leafColors[Math.abs(i) % leafColors.length] ?? '#dd6b20',
          gx,
          gy,
          0.19,
          false,
        );
        leaf.scale.set(1.25, 0.68, 0.55);
        leaf.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.38;
        bay.add(leaf);
      }
      // Golden harvest bows & pinecones at the 3 garland pinning points
      for (const px of [-1.38, 0, 1.38]) {
        bay.add(sphere(0.075, '#f6e05e', px - 0.05, 3.38, 0.21, false));
        bay.add(sphere(0.075, '#f6e05e', px + 0.05, 3.38, 0.21, false));
        const cone = sphere(0.065, '#6b4226', px, 3.27, 0.21, false);
        cone.scale.set(0.8, 1.35, 0.8);
        bay.add(cone);
      }

      // 2. Central Candlelit Harvest Sideboard (y=0.78..1.38) with 3-branch Brass Candelabra,
      //    amber goblets, and autumn gourds in unobstructed center stage!
      bay.add(box(1.18, 0.12, 0.42, '#5c3d24', 0, 0.78, 0.36, false));
      bay.add(cyl(0.11, 0.15, 0.05, '#b7791f', 0, 0.86, 0.4, 14, false));
      bay.add(cyl(0.035, 0.05, 0.22, '#d69e2e', 0, 0.96, 0.4, 10, false));
      // Curved brass candelabra arms + drip bobeches
      const candArm = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.018, 8, 16, Math.PI),
        mat('#d69e2e'),
      );
      candArm.position.set(0, 1.06, 0.4);
      candArm.rotation.z = Math.PI;
      bay.add(candArm);
      for (const cx of [-0.18, 0, 0.18]) {
        bay.add(cyl(0.055, 0.035, 0.025, '#ecc94b', cx, 1.055, 0.4, 10, false));
      }
      bay.add(buildCandle(0.036, 0.22, '#fffaf0', -0.18, 1.06, 0.4, flames, 0.5));
      bay.add(buildCandle(0.04, 0.28, '#fffaf0', 0, 1.06, 0.4, flames, 1.2));
      bay.add(buildCandle(0.036, 0.22, '#fffaf0', 0.18, 1.06, 0.4, flames, 2.0));
      // Two amber wine goblets & harvest pumpkins with stems flanking the candelabra
      bay.add(buildWineGlass(-0.38, 0.84, 0.42));
      bay.add(buildWineGlass(0.38, 0.84, 0.42));
      const sbPumpL = sphere(0.105, '#dd6b20', -0.5, 0.91, 0.44, false);
      sbPumpL.scale.set(1.15, 0.85, 1.15);
      bay.add(sbPumpL, cyl(0.015, 0.022, 0.045, '#2f855a', -0.5, 1.0, 0.44, 8, false));
      const sbPumpR = sphere(0.095, '#ecc94b', 0.5, 0.91, 0.44, false);
      sbPumpR.scale.set(1.12, 0.88, 1.12);
      bay.add(sbPumpR, cyl(0.014, 0.02, 0.045, '#2f855a', 0.5, 0.99, 0.44, 8, false));

      // 3. Large Hero Floor Props:
      //    (a) Left Outer Flank: Towering Bundled Cornstalk Shock (2.35m tall) & Heirloom Pumpkin Patch
      const cornShock = new THREE.Group();
      cornShock.position.set(-1.74, 0, 0.72);
      cornShock.rotation.y = 0.32;
      // Bundle of 7 tall golden-tan cornstalk canes tied at the waist with rustic twine
      const stalkAngles = [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4];
      for (const [si, ang] of stalkAngles.entries()) {
        const rad = si === 0 ? 0 : 0.14;
        const stalk = cyl(
          0.038,
          0.055,
          2.05 + (si % 2) * 0.18,
          si % 2 === 0 ? '#d69e2e' : '#b7791f',
          Math.cos(ang) * rad,
          1.02,
          Math.sin(ang) * rad,
          8,
        );
        stalk.rotation.x = -Math.sin(ang) * 0.08;
        stalk.rotation.z = Math.cos(ang) * 0.08;
        cornShock.add(stalk);
      }
      // Twine binding rings around the shock waist + peeled golden corn ears
      cornShock.add(cyl(0.18, 0.18, 0.06, '#6b4226', 0, 0.95, 0, 12));
      cornShock.add(cyl(0.16, 0.16, 0.05, '#6b4226', 0, 1.35, 0, 12));
      for (const [cx, cy, cz, rz] of [
        [0.14, 1.15, 0.1, -0.35],
        [-0.12, 1.22, 0.12, 0.32],
        [0.04, 1.48, 0.14, -0.18],
      ] as const) {
        const ear = sphere(0.055, '#f6e05e', cx, cy, cz);
        ear.scale.set(0.65, 1.85, 0.65);
        ear.rotation.z = rz;
        cornShock.add(ear);
      }
      // Flared golden corn-tassel plumes at the top
      for (let t = 0; t < 5; t++) {
        const tang = (t / 5) * Math.PI * 2;
        const plume = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.34, 6), mat('#ecc94b'));
        plume.position.set(Math.cos(tang) * 0.12, 2.18, Math.sin(tang) * 0.12);
        plume.rotation.z = -Math.cos(tang) * 0.38;
        plume.rotation.x = Math.sin(tang) * 0.38;
        cornShock.add(plume);
      }
      bay.add(cornShock);

      //    (b) Right Outer Flank: Rustic Oak Cider Barrel on Trestle Stand (1.55m tall) & Tall Sunflower / Wheat Urn
      const barrelStand = new THREE.Group();
      barrelStand.position.set(1.72, 0, 0.74);
      barrelStand.rotation.y = -0.34;
      // Timber sawhorse cradle legs
      barrelStand.add(box(0.52, 0.48, 0.08, '#5c3d24', 0, 0.24, -0.16));
      barrelStand.add(box(0.52, 0.48, 0.08, '#5c3d24', 0, 0.24, 0.16));
      // Horizontal oak cider barrel + iron hoops + brass tap spigot
      const barrelBody = cyl(0.26, 0.26, 0.64, '#8c5828', 0, 0.64, 0, 14);
      barrelBody.rotation.x = Math.PI / 2;
      barrelStand.add(barrelBody);
      for (const bz of [-0.22, 0, 0.22]) {
        const hoop = cyl(0.272, 0.272, 0.04, '#2d3748', 0, 0.64, bz, 14);
        hoop.rotation.x = Math.PI / 2;
        barrelStand.add(hoop);
      }
      barrelStand.add(cyl(0.025, 0.025, 0.12, '#ecc94b', 0, 0.56, 0.36, 8));
      // Copper cider pitcher & tall autumn sunflower bouquet on top of the barrel
      barrelStand.add(cyl(0.11, 0.09, 0.28, '#c05621', 0, 1.04, 0, 12));
      for (const [sx, sy, sz] of [
        [-0.08, 1.36, 0.04],
        [0.08, 1.4, -0.02],
        [0, 1.46, 0.02],
      ] as const) {
        barrelStand.add(cyl(0.016, 0.016, 0.28, '#2f855a', sx, sy - 0.12, sz, 6));
        barrelStand.add(sphere(0.09, '#f6e05e', sx, sy, sz));
        barrelStand.add(sphere(0.048, '#5c3820', sx, sy, sz + 0.05));
      }
      bay.add(barrelStand);

      //    (c) Inner Rug: Double-Stacked Bound Straw Hay Bales & Pumpkins (left) + Large Overflowing Apple Bushel (right)
      const hayBale = new THREE.Group();
      hayBale.position.set(-0.56, 0.03, 1.04);
      hayBale.rotation.y = 0.28;
      hayBale.scale.setScalar(1.32);
      // Bottom bale + top angled bale
      hayBale.add(box(0.46, 0.26, 0.32, '#d69e2e', 0, 0.13, 0));
      hayBale.add(box(0.032, 0.27, 0.33, '#8c6239', -0.12, 0.13, 0));
      hayBale.add(box(0.032, 0.27, 0.33, '#8c6239', 0.12, 0.13, 0));
      const topBale = new THREE.Group();
      topBale.position.set(-0.03, 0.26, -0.02);
      topBale.rotation.y = -0.24;
      topBale.add(box(0.36, 0.2, 0.24, '#ecc94b', 0, 0.1, 0));
      topBale.add(box(0.028, 0.21, 0.25, '#8c6239', -0.09, 0.1, 0));
      topBale.add(box(0.028, 0.21, 0.25, '#8c6239', 0.09, 0.1, 0));
      hayBale.add(topBale);
      bay.add(hayBale);

      const tgPump = sphere(0.18, '#ed8936', -0.52, 0.17, 1.32);
      tgPump.scale.set(1.18, 0.84, 1.18);
      bay.add(tgPump, cyl(0.024, 0.032, 0.07, '#2f855a', -0.52, 0.33, 1.32, 8));

      const bushel = new THREE.Group();
      bushel.position.set(0.54, 0.03, 1.08);
      bushel.scale.setScalar(1.36);
      bushel.add(cyl(0.21, 0.16, 0.26, '#b7791f', 0, 0.13, 0, 14));
      bushel.add(cyl(0.22, 0.21, 0.035, '#5c3d24', 0, 0.23, 0, 14));
      const apples: [number, number, number, string][] = [
        [0, 0.28, 0, '#e53e3e'],
        [-0.09, 0.26, 0.06, '#c53030'],
        [0.09, 0.26, 0.05, '#ecc94b'],
        [-0.06, 0.26, -0.08, '#48bb78'],
        [0.07, 0.25, -0.07, '#e53e3e'],
        [0, 0.33, 0.02, '#c53030'],
      ];
      for (const [ax, ay, az, aHex] of apples) {
        bushel.add(sphere(0.072, aHex, ax, ay, az));
      }
      bay.add(bushel);
      break;
    }

    case 'christmas': {
      // Brick Fireplace Hearth built into the lower-center back wall (primary light source!)
      const hearth = new THREE.Group();
      hearth.position.set(0, 0, 0.28);
      // Stone hearth base slab + red brick surround + dark firebox + golden oak mantel
      hearth.add(box(1.72, 0.08, 0.54, '#4a5568', 0, 0.04, 0.08, false));
      hearth.add(box(1.58, 1.32, 0.34, '#9b2c2c', 0, 0.66, 0, false));
      hearth.add(box(1.06, 0.94, 0.36, '#161110', 0, 0.49, 0.04, false));
      hearth.add(box(1.76, 0.14, 0.46, '#d69e2e', 0, 1.36, 0.04, false));
      // Scalloped evergreen mantel garland with holly berries & central crimson bow
      for (let gi = -4; gi <= 4; gi++) {
        const gx = gi * 0.19;
        const gy = 1.43 - (gi % 2 === 0 ? 0 : 0.025);
        hearth.add(sphere(0.115, gi % 2 === 0 ? '#2f855a' : '#276749', gx, gy, 0.22, false));
        if (gi % 2 === 0) {
          hearth.add(glowSphere(0.028, '#e53e3e', gx, gy + 0.02, 0.31, 0.55));
        }
      }
      hearth.add(sphere(0.065, '#e53e3e', -0.05, 1.46, 0.32, false));
      hearth.add(sphere(0.065, '#e53e3e', 0.05, 1.46, 0.32, false));

      // Wrought-iron andirons & glowing bed of coals
      for (const side of [-1, 1] as const) {
        hearth.add(box(0.05, 0.22, 0.26, '#1f2430', side * 0.34, 0.15, 0.2, false));
        hearth.add(sphere(0.042, '#d69e2e', side * 0.34, 0.28, 0.3, false));
      }
      hearth.add(glowBox(0.66, 0.05, 0.22, '#e53e3e', 0, 0.1, 0.17, 1.15));
      hearth.add(glowBox(0.48, 0.045, 0.16, '#ff7733', 0, 0.12, 0.21, 1.35));

      // Crossed horizontal split firewood logs with cut end-grain rings
      const addLog = (
        lx: number,
        ly: number,
        lz: number,
        len: number,
        rad: number,
        tiltZ: number,
        yawY: number,
      ): void => {
        const logGroup = new THREE.Group();
        logGroup.position.set(lx, ly, lz);
        logGroup.rotation.y = yawY;
        logGroup.rotation.z = Math.PI / 2 + tiltZ;
        logGroup.add(cyl(rad, rad, len, '#4a2c18', 0, 0, 0, 10, false));
        logGroup.add(cyl(rad * 0.78, rad * 0.78, len + 0.01, '#b7791f', 0, 0, 0, 10, false));
        hearth.add(logGroup);
      };
      addLog(-0.08, 0.17, 0.16, 0.62, 0.068, 0.1, 0.18);
      addLog(0.09, 0.2, 0.22, 0.58, 0.064, -0.14, -0.22);
      addLog(0, 0.15, 0.25, 0.46, 0.055, 0.03, 0.05);

      // Multi-layered tapered flame tongues (back crimson-orange, mid amber, inner bright gold core)
      const addFlameTongue = (
        fx: number,
        fy: number,
        fz: number,
        rBot: number,
        h: number,
        hex: string,
        intensity: number,
        phase: number,
        leanZ = 0,
      ): void => {
        const tongue = new THREE.Group();
        tongue.position.set(fx, fy, fz);
        tongue.rotation.z = leanZ;
        const m = glowMat(hex, intensity);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(rBot, h, 10), m);
        cone.position.y = h * 0.42;
        const base = new THREE.Mesh(new THREE.SphereGeometry(rBot * 0.96, 10, 8), m);
        base.scale.set(1, 0.75, 0.78);
        tongue.add(cone, base);
        tongue.scale.set(1, 1, 0.72);
        hearth.add(tongue);
        flames.push({
          mesh: tongue,
          baseY: fy,
          phase,
          baseScaleX: 1,
          baseScaleY: 1,
          baseScaleZ: 0.72,
          swayScale: 1.35,
        });
      };

      // Back layer: tall deep orange-red tongues
      addFlameTongue(-0.21, 0.2, 0.15, 0.11, 0.46, '#ff4500', 1.3, 0.2, 0.1);
      addFlameTongue(0.0, 0.21, 0.15, 0.14, 0.58, '#ff5500', 1.35, 0.9, -0.03);
      addFlameTongue(0.21, 0.2, 0.15, 0.11, 0.44, '#ff4500', 1.3, 1.7, -0.1);
      // Mid layer: bright amber-orange tongues
      addFlameTongue(-0.12, 0.21, 0.2, 0.1, 0.44, '#ff8800', 1.45, 0.5, 0.06);
      addFlameTongue(0.03, 0.22, 0.2, 0.115, 0.5, '#ff9900', 1.5, 1.4, -0.04);
      addFlameTongue(0.14, 0.2, 0.2, 0.09, 0.38, '#ff8800', 1.45, 2.2, -0.07);
      // Front inner core: hot golden-yellow tongues licking up between the logs
      addFlameTongue(-0.06, 0.2, 0.24, 0.075, 0.3, '#ffd43b', 1.55, 0.8, 0.04);
      addFlameTongue(0.06, 0.2, 0.24, 0.08, 0.34, '#ffea79', 1.6, 1.9, -0.04);

      // Rising fireplace embers drifting up from the crackling logs
      const emberSpecs: [number, number, number, string, number, number][] = [
        [-0.24, 0.34, 0.22, '#ffbe3b', 0.1, 0.62],
        [-0.12, 0.38, 0.25, '#ff7733', 0.35, 0.54],
        [-0.03, 0.4, 0.24, '#ffd43b', 0.62, 0.68],
        [0.08, 0.36, 0.25, '#ff922b', 0.85, 0.58],
        [0.19, 0.34, 0.22, '#ffd43b', 1.15, 0.64],
        [-0.18, 0.42, 0.26, '#ffbe3b', 1.48, 0.52],
        [0.14, 0.4, 0.26, '#ff7733', 1.75, 0.6],
      ];
      for (const [ex, ey, ez, eHex, ePhase, eSpeed] of emberSpecs) {
        const ember = glowSphere(0.03, eHex, ex, ey, ez, 1.45);
        hearth.add(ember);
        flames.push({
          mesh: ember,
          baseY: ey,
          phase: ePhase,
          particle: {
            baseX: ex,
            baseZ: ez,
            rise: 0.52,
            sway: 0.045,
            speed: eSpeed,
            scale: 1,
          },
        });
      }
      bay.add(hearth);

      // 4. Large Outer Flank Hero Props:
      //    Left Outer Flank (lx=-1.72, lz=0.74): Cozy Tufted Forest-Green Wingback Armchair (~1.48m tall) angled toward the hearth
      const armchair = new THREE.Group();
      armchair.position.set(-1.72, 0, 0.74);
      armchair.rotation.y = 0.52;
      // 4 carved wooden cabriole legs
      for (const [legX, legZ] of [
        [-0.28, -0.26],
        [0.28, -0.26],
        [-0.28, 0.26],
        [0.28, 0.26],
      ] as const) {
        armchair.add(cyl(0.036, 0.024, 0.24, '#4a3524', legX, 0.12, legZ, 8));
      }
      // Upholstered seat base + thick plush cushion
      armchair.add(box(0.72, 0.18, 0.68, '#1e4e3a', 0, 0.31, 0));
      armchair.add(box(0.56, 0.14, 0.56, '#276749', 0, 0.44, 0.04));
      // Tall tufted high back + curved crown
      const chairBack = box(0.7, 0.92, 0.16, '#1e4e3a', 0, 0.88, -0.26);
      chairBack.rotation.x = -0.1;
      armchair.add(chairBack);
      armchair.add(cyl(0.35, 0.35, 0.16, '#1e4e3a', 0, 1.32, -0.3, 14).rotateX(Math.PI / 2));
      // Brass upholstery buttons on the tufted backrest
      for (const [bx, by] of [
        [-0.16, 0.78],
        [0.16, 0.78],
        [0, 0.96],
        [-0.16, 1.14],
        [0.16, 1.14],
      ] as const) {
        armchair.add(sphere(0.022, '#ecc94b', bx, by, -0.17));
      }
      // Wingback side ears & rolled armrests
      for (const side of [-1, 1] as const) {
        const wing = box(0.12, 0.56, 0.28, '#22543d', side * 0.33, 1.04, -0.14);
        wing.rotation.y = -side * 0.22;
        armchair.add(wing);
        armchair.add(box(0.14, 0.28, 0.64, '#22543d', side * 0.33, 0.5, 0.02));
        const armRoll = cyl(0.085, 0.085, 0.66, '#276749', side * 0.34, 0.64, 0.03, 10);
        armRoll.rotation.x = Math.PI / 2;
        armchair.add(armRoll);
      }
      // Crimson-and-gold holiday throw pillow nestled in the seat
      const throwPillow = box(0.32, 0.28, 0.12, '#c53030', -0.06, 0.62, -0.1);
      throwPillow.rotation.set(-0.28, 0.18, 0.14);
      armchair.add(throwPillow);
      const pillowBand = box(0.33, 0.04, 0.13, '#ecc94b', -0.06, 0.62, -0.1);
      pillowBand.rotation.set(-0.28, 0.18, 0.14);
      armchair.add(pillowBand);
      bay.add(armchair);

      //    Right Outer Flank (lx=1.72, lz=0.72): Tall Decorated Frosted Pine Tree (~2.35m tall) in a red barrel planter + Standing Nutcracker
      const flankTree = new THREE.Group();
      flankTree.position.set(1.72, 0, 0.72);
      // Red wooden barrel planter with brass hoops
      flankTree.add(cyl(0.26, 0.21, 0.42, '#9b2c2c', 0, 0.21, 0, 12));
      flankTree.add(cyl(0.266, 0.266, 0.035, '#d69e2e', 0, 0.34, 0, 12));
      flankTree.add(cyl(0.235, 0.235, 0.035, '#d69e2e', 0, 0.12, 0, 12));
      flankTree.add(cyl(0.09, 0.11, 0.45, '#5c3d24', 0, 0.52, 0, 8));
      // 4 lush layered evergreen cone tiers
      flankTree.add(
        new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.78, 12), mat('#1e4e3a')).translateY(0.92),
      );
      flankTree.add(
        new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 12), mat('#22543d')).translateY(1.36),
      );
      flankTree.add(
        new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.58, 12), mat('#276749')).translateY(1.76),
      );
      flankTree.add(
        new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 12), mat('#2f855a')).translateY(2.08),
      );
      // Glowing golden star topper + colorful ornament baubles
      flankTree.add(glowSphere(0.095, '#ffea79', 0, 2.34, 0, 1.3));
      const treeOrnaments: [number, number, number, string][] = [
        [-0.32, 0.78, 0.34, '#e53e3e'],
        [0.28, 0.84, 0.36, '#ecc94b'],
        [0.04, 0.74, 0.48, '#63b3ed'],
        [-0.24, 1.24, 0.28, '#ecc94b'],
        [0.22, 1.28, 0.28, '#e53e3e'],
        [-0.02, 1.66, 0.26, '#ffea79'],
        [0.16, 1.72, 0.18, '#e53e3e'],
        [-0.14, 1.98, 0.14, '#63b3ed'],
      ];
      for (const [ox, oy, oz, oCol] of treeOrnaments) {
        flankTree.add(glowSphere(0.052, oCol, ox, oy, oz, 0.75));
      }
      bay.add(flankTree);

      // Standing Wooden Nutcracker Soldier (~1.18m tall) standing guard beside the hearth & pine tree
      const nutcracker = new THREE.Group();
      nutcracker.position.set(1.34, 0, 1.02);
      nutcracker.rotation.y = -0.38;
      nutcracker.add(cyl(0.16, 0.18, 0.06, '#ecc94b', 0, 0.03, 0, 12));
      for (const side of [-1, 1] as const) {
        nutcracker.add(cyl(0.048, 0.045, 0.24, '#1a202c', side * 0.065, 0.18, 0, 8));
        nutcracker.add(cyl(0.044, 0.044, 0.2, '#f7fafc', side * 0.065, 0.38, 0, 8));
      }
      // Red regiment tunic + gold belt + shoulder epaulets
      nutcracker.add(cyl(0.12, 0.11, 0.34, '#c53030', 0, 0.62, 0, 10));
      nutcracker.add(cyl(0.124, 0.124, 0.045, '#1a202c', 0, 0.52, 0, 10));
      nutcracker.add(box(0.06, 0.055, 0.04, '#ecc94b', 0, 0.52, 0.11));
      for (const side of [-1, 1] as const) {
        nutcracker.add(sphere(0.055, '#ecc94b', side * 0.14, 0.76, 0));
        nutcracker.add(cyl(0.036, 0.034, 0.28, '#c53030', side * 0.15, 0.61, 0, 8));
        nutcracker.add(sphere(0.038, '#fbd38d', side * 0.15, 0.46, 0));
      }
      // Head, white beard, & tall black shako hat with gold plume
      nutcracker.add(cyl(0.095, 0.095, 0.16, '#fbd38d', 0, 0.87, 0, 10));
      nutcracker.add(box(0.07, 0.14, 0.05, '#ffffff', 0, 0.8, 0.08));
      nutcracker.add(cyl(0.11, 0.1, 0.24, '#1a202c', 0, 1.06, 0, 10));
      nutcracker.add(sphere(0.045, '#ecc94b', 0, 1.2, 0.06));
      bay.add(nutcracker);

      // 5. Scaled-up Floor Props: Stacked 2-tier towers of wrapped Christmas presents with ribbons & bows on the hearth rug
      bay.add(buildPresentBox(0.42, 0.34, 0.38, '#c53030', '#f6e05e', -0.56, 0.03, 1.02, 0.28));
      bay.add(buildPresentBox(0.28, 0.22, 0.26, '#2f855a', '#e53e3e', -0.56, 0.37, 1.02, -0.18));
      bay.add(buildPresentBox(0.28, 0.24, 0.28, '#ecc94b', '#c53030', -0.52, 0.03, 1.32, -0.35));
      bay.add(buildPresentBox(0.38, 0.38, 0.34, '#2b6cb0', '#f7fafc', 0.56, 0.03, 1.04, -0.24));
      bay.add(buildPresentBox(0.24, 0.2, 0.22, '#805ad5', '#f6e05e', 0.56, 0.41, 1.04, 0.22));
      bay.add(buildPresentBox(0.3, 0.22, 0.26, '#f6e05e', '#c53030', 0.52, 0.03, 1.32, 0.42));
      break;
    }

    case 'valentines': {
      // 1. Pleated crimson velvet drapes & gold tassel tie-backs framing the left and right alcove edges
      for (const side of [-1, 1] as const) {
        bay.add(cyl(0.18, 0.24, 2.0, '#821c46', side * 1.66, 2.55, 0.26, 12, false));
        bay.add(cyl(0.22, 0.16, 1.65, '#6b1539', side * 1.72, 0.85, 0.26, 12, false));
        // Golden rope tie-back ring & hanging tassel at waist height
        const tieRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.028, 8, 14), mat('#f6e05e'));
        tieRing.rotation.x = Math.PI / 2 + 0.15;
        tieRing.position.set(side * 1.68, 1.5, 0.28);
        bay.add(tieRing);
        bay.add(sphere(0.065, '#ecc94b', side * 1.52, 1.42, 0.42, false));
        bay.add(cyl(0.025, 0.055, 0.16, '#f6e05e', side * 1.52, 1.3, 0.42, 8, false));
      }
      // 2. Central Romantic Candlelit Bistro Mantle (y=0.78..1.38) in unobstructed center stage:
      //    Porcelain Vase of Red Roses + Two Crystal Wine Glasses + Flickering Pillar Candles!
      bay.add(box(1.18, 0.1, 0.42, '#6b2143', 0, 0.78, 0.36, false));
      bay.add(box(1.1, 0.04, 0.36, '#f6e05e', 0, 0.84, 0.38, false));
      bay.add(buildRoseBouquet(0, 0.85, 0.4));
      bay.add(buildWineGlass(-0.26, 0.85, 0.44));
      bay.add(buildWineGlass(0.26, 0.85, 0.44));
      bay.add(buildCandle(0.048, 0.28, '#fff5f7', -0.44, 0.85, 0.4, flames, 0.4));
      bay.add(buildCandle(0.042, 0.18, '#fbb6ce', -0.52, 0.85, 0.46, flames, 1.2));
      bay.add(buildCandle(0.048, 0.28, '#fff5f7', 0.44, 0.85, 0.4, flames, 2.0));
      bay.add(buildCandle(0.042, 0.18, '#fbb6ce', 0.52, 0.85, 0.46, flames, 2.8));

      // Additional flickering candles on the upper altar shelf flanking the mailbox
      bay.add(buildCandle(0.04, 0.22, '#fff5f7', -0.48, 2.2, 0.42, flames, 0.9));
      bay.add(buildCandle(0.04, 0.22, '#fff5f7', 0.48, 2.2, 0.42, flames, 1.7));

      // 3. Large Outer Flank Hero Props:
      //    Left Outer Flank (lx=-1.68, lz=0.78): Tufted Rose-Velvet & Gilded Romantic Settee Bench (~1.32m tall)
      const settee = new THREE.Group();
      settee.position.set(-1.68, 0, 0.78);
      settee.rotation.y = 0.48;
      // 4 gilded cabriole legs
      for (const [legX, legZ] of [
        [-0.38, -0.22],
        [0.38, -0.22],
        [-0.38, 0.22],
        [0.38, 0.22],
      ] as const) {
        settee.add(cyl(0.032, 0.02, 0.26, '#ecc94b', legX, 0.13, legZ, 8));
      }
      // Gilded apron frame + plush rose-velvet seat cushion
      settee.add(box(0.88, 0.08, 0.54, '#ecc94b', 0, 0.28, 0));
      settee.add(box(0.82, 0.14, 0.5, '#b83280', 0, 0.38, 0.02));
      // Twin heart-shaped / double-arched tufted velvet backrest with gilded crest molding
      for (const side of [-1, 1] as const) {
        const lobe = cyl(0.24, 0.24, 0.12, '#97266d', side * 0.2, 0.84, -0.2, 14);
        lobe.rotation.x = Math.PI / 2;
        lobe.scale.set(1, 1, 1.35);
        settee.add(lobe);
        const trimLobe = cyl(0.265, 0.265, 0.09, '#ecc94b', side * 0.2, 0.86, -0.22, 14);
        trimLobe.rotation.x = Math.PI / 2;
        trimLobe.scale.set(1, 1, 1.35);
        settee.add(trimLobe);
        // Rolled velvet bolster armrests
        const bolster = cyl(0.08, 0.08, 0.48, '#d53f8c', side * 0.38, 0.48, 0.02, 10);
        bolster.rotation.x = Math.PI / 2;
        settee.add(bolster);
      }
      settee.add(box(0.76, 0.42, 0.12, '#97266d', 0, 0.62, -0.2));
      bay.add(settee);

      //    Right Outer Flank (lx=1.68, lz=0.74): Fluted Marble Pedestal Column topped with a Giant Heart-Shaped Rose Topiary (~2.25m tall) + Gilded Harp
      const topiaryCol = new THREE.Group();
      topiaryCol.position.set(1.68, 0, 0.74);
      // Classical white-and-blush marble pedestal column
      topiaryCol.add(box(0.46, 0.1, 0.46, '#fff5f7', 0, 0.05, 0));
      topiaryCol.add(cyl(0.2, 0.22, 0.1, '#fed7e2', 0, 0.14, 0, 12));
      topiaryCol.add(cyl(0.16, 0.18, 0.78, '#fff5f7', 0, 0.56, 0, 14));
      topiaryCol.add(cyl(0.22, 0.18, 0.1, '#fed7e2', 0, 0.98, 0, 12));
      topiaryCol.add(box(0.44, 0.08, 0.44, '#ecc94b', 0, 1.06, 0));
      // Gilded urn planter + twisting topiary trunk
      topiaryCol.add(cyl(0.18, 0.12, 0.26, '#ecc94b', 0, 1.22, 0, 12));
      topiaryCol.add(cyl(0.038, 0.048, 0.34, '#5c3d24', 0, 1.48, 0, 8));
      // Giant Lush Heart-Shaped Topiary Crown studded with crimson & pink roses
      const topHeart = new THREE.Group();
      topHeart.position.set(0, 1.88, 0);
      topHeart.rotation.y = -0.35;
      topHeart.add(sphere(0.24, '#276749', -0.15, 0.12, 0));
      topHeart.add(sphere(0.24, '#276749', 0.15, 0.12, 0));
      const heartCone = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.46, 12), mat('#22543d'));
      heartCone.rotation.z = Math.PI;
      heartCone.position.set(0, -0.14, 0);
      topHeart.add(heartCone);
      for (const [rx, ry, rz, rHex] of [
        [-0.16, 0.16, 0.2, '#e53e3e'],
        [0.16, 0.16, 0.2, '#e53e3e'],
        [0, 0.04, 0.22, '#fbb6ce'],
        [-0.1, -0.08, 0.18, '#f687b3'],
        [0.1, -0.08, 0.18, '#e53e3e'],
        [0, 0.26, 0.14, '#fbb6ce'],
        [-0.24, 0.06, 0.14, '#e53e3e'],
        [0.24, 0.06, 0.14, '#f687b3'],
      ] as const) {
        topHeart.add(sphere(0.058, rHex, rx, ry, rz));
      }
      topiaryCol.add(topHeart);
      bay.add(topiaryCol);

      // Standing Gilded Concert Harp (~1.28m tall) beside the marble column
      const harp = new THREE.Group();
      harp.position.set(1.32, 0, 1.04);
      harp.rotation.y = -0.45;
      harp.add(box(0.32, 0.08, 0.44, '#d69e2e', 0, 0.04, 0));
      // Vertical forepillar column + angled soundboard + curved harmonic neck
      harp.add(cyl(0.036, 0.042, 1.18, '#ecc94b', 0, 0.62, 0.16, 10));
      harp.add(sphere(0.06, '#f6e05e', 0, 1.22, 0.16));
      const soundboard = box(0.12, 1.08, 0.14, '#b7791f', 0, 0.56, -0.04);
      soundboard.rotation.x = 0.28;
      harp.add(soundboard);
      const harpNeck = box(0.07, 0.09, 0.42, '#ecc94b', 0, 1.12, -0.02);
      harpNeck.rotation.x = -0.22;
      harp.add(harpNeck);
      for (let s = 0; s < 5; s++) {
        const sz = -0.14 + s * 0.065;
        const sh = 0.62 + s * 0.09;
        harp.add(cyl(0.005, 0.005, sh, '#fff5f7', 0, 0.42 + sh / 2, sz, 6));
      }
      bay.add(harp);

      // 4. Scaled-up Floor Props: Stacked Ribboned Valentine Gift Boxes on the left + Silver Champagne Bucket & Velvet Heart Cushion on the right
      bay.add(buildPresentBox(0.38, 0.26, 0.34, '#d53f8c', '#f6e05e', -0.54, 0.03, 1.04, 0.32));
      bay.add(buildPresentBox(0.26, 0.2, 0.24, '#fbb6ce', '#c53030', -0.54, 0.29, 1.04, -0.22));
      bay.add(buildPresentBox(0.24, 0.18, 0.22, '#c53030', '#fff5f7', -0.48, 0.03, 1.3, 0.15));

      // Silver Champagne Ice Bucket on Stand with tilted emerald champagne bottle
      const champagneStand = new THREE.Group();
      champagneStand.position.set(0.56, 0, 1.02);
      champagneStand.add(cyl(0.16, 0.18, 0.05, '#cbd5e0', 0, 0.025, 0, 12));
      champagneStand.add(cyl(0.03, 0.035, 0.42, '#e2e8f0', 0, 0.24, 0, 10));
      champagneStand.add(cyl(0.16, 0.11, 0.28, '#cbd5e0', 0, 0.56, 0, 12));
      champagneStand.add(cyl(0.17, 0.165, 0.03, '#f7fafc', 0, 0.69, 0, 12));
      const bottle = new THREE.Group();
      bottle.position.set(0, 0.64, 0);
      bottle.rotation.z = -0.28;
      bottle.add(cyl(0.055, 0.055, 0.22, '#22543d', 0, 0.08, 0, 10));
      bottle.add(cyl(0.022, 0.052, 0.14, '#276749', 0, 0.24, 0, 10));
      bottle.add(cyl(0.025, 0.025, 0.07, '#ecc94b', 0, 0.31, 0, 10));
      champagneStand.add(bottle);
      bay.add(champagneStand);

      // Plush crimson velvet heart pillow on the rug (scaled up)
      const pillow = new THREE.Group();
      pillow.position.set(0.5, 0.08, 1.3);
      pillow.rotation.x = -Math.PI / 2.4;
      pillow.rotation.z = 0.25;
      pillow.scale.set(1.55, 1.55, 0.72);
      pillow.add(sphere(0.1, '#c53030', -0.06, 0.05, 0));
      pillow.add(sphere(0.1, '#c53030', 0.06, 0.05, 0));
      const pillowTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.2, 12), mat('#c53030'));
      pillowTip.rotation.z = Math.PI;
      pillowTip.position.set(0, -0.05, 0);
      pillow.add(pillowTip);
      bay.add(pillow);
      bay.add(buildCandle(0.048, 0.24, '#fff5f7', 0.36, 0.03, 0.98, flames, 1.5));
      break;
    }

    case 'easter': {
      // 1. Cedar garden trellis + hanging pastel Egg Paper Lanterns
      for (const lx of [-0.75, 0, 0.75]) {
        bay.add(box(0.05, 2.7, 0.04, '#6b4f35', lx, 1.8, 0.16, false));
      }
      for (const ly of [1.1, 1.9, 2.7]) {
        bay.add(box(2.2, 0.05, 0.04, '#6b4f35', 0, ly, 0.17, false));
      }
      // 2. Central Blooming Tulip Planter & Glowing Ribbed Egg Lanterns (y=0.78..1.35) in center stage
      bay.add(box(1.14, 0.18, 0.38, '#6b4f35', 0, 0.78, 0.36, false));
      bay.add(box(1.18, 0.04, 0.42, '#8c6239', 0, 0.86, 0.36, false));
      const tulipColors = ['#fbb6ce', '#f6e05e', '#b794f4', '#90cdf4', '#fbb6ce'];
      for (let i = -2; i <= 2; i++) {
        const tx = i * 0.19;
        const col = tulipColors[i + 2] ?? '#fbb6ce';
        bay.add(cyl(0.015, 0.015, 0.22, '#38a169', tx, 0.97, 0.38, 8, false));
        // Pair of angled green tulip leaves at the stem base
        for (const lSide of [-1, 1] as const) {
          const leaf = sphere(0.042, '#48bb78', tx + lSide * 0.032, 0.93, 0.38, false);
          leaf.scale.set(0.55, 1.6, 0.45);
          leaf.rotation.z = -lSide * 0.42;
          bay.add(leaf);
        }
        // Cupped tulip bloom + inner golden stamen glow
        const cup = cyl(0.058, 0.032, 0.095, col, tx, 1.09, 0.38, 10, false);
        bay.add(cup);
        bay.add(glowSphere(0.042, col, tx, 1.12, 0.38, 0.65));
      }
      for (const side of [-1, 1] as const) {
        const lx = side * 0.48;
        const ly = 1.12;
        const lz = 0.44;
        const lHex = side < 0 ? '#fbb6ce' : '#fefcbf';
        const lanternEgg = glowSphere(0.155, lHex, lx, ly, lz, 1.05);
        lanternEgg.scale.set(0.85, 1.25, 0.85);
        bay.add(lanternEgg);
        // Brass top & bottom paper-lantern collars
        bay.add(cyl(0.055, 0.065, 0.03, '#d69e2e', lx, ly + 0.19, lz, 10, false));
        bay.add(cyl(0.06, 0.05, 0.03, '#d69e2e', lx, ly - 0.19, lz, 10, false));
      }
      // 3. Drifting golden twilight fireflies
      const ffCoords: [number, number, number, number][] = [
        [-0.45, 1.25, 0.85, 0.2],
        [0.48, 1.32, 0.85, 1.5],
        [-0.45, 2.45, 0.85, 2.7],
        [0.52, 2.35, 0.9, 3.8],
      ];
      for (const [fx, fy, fz, ph] of ffCoords) {
        const ff = glowSphere(0.045, '#ffea79', fx, fy, fz, 1.25);
        bay.add(ff);
        fireflies.push({ mesh: ff, baseX: fx, baseY: fy, baseZ: fz, phase: ph });
      }

      // 4. Large Outer Flank Hero Props:
      //    Left Outer Flank (lx=-1.72, lz=0.72): Blossoming Pink Cherry-Blossom Tree (~2.45m tall) + Pastel Wooden Birdhouse on Post
      const blossomTree = new THREE.Group();
      blossomTree.position.set(-1.72, 0, 0.72);
      // Stone garden planter ring + gnarled trunk & spreading boughs
      blossomTree.add(cyl(0.32, 0.28, 0.24, '#a0aec0', 0, 0.12, 0, 12));
      blossomTree.add(cyl(0.28, 0.28, 0.05, '#68d391', 0, 0.23, 0, 12));
      const bTrunk = cyl(0.1, 0.15, 1.55, '#6b4f35', 0, 0.95, 0, 10);
      bTrunk.rotation.z = -0.06;
      blossomTree.add(bTrunk);
      const bBranchL = cyl(0.055, 0.08, 0.72, '#6b4f35', -0.22, 1.68, 0.06, 8);
      bBranchL.rotation.z = 0.52;
      blossomTree.add(bBranchL);
      const bBranchR = cyl(0.05, 0.075, 0.68, '#6b4f35', 0.24, 1.74, -0.04, 8);
      bBranchR.rotation.z = -0.48;
      blossomTree.add(bBranchR);
      // Lush clouds of pink, rose, and cream cherry blossoms
      const blossomClouds: [number, number, number, number, string][] = [
        [0, 2.08, 0.04, 0.36, '#fbb6ce'],
        [-0.36, 1.92, 0.12, 0.28, '#fed7e2'],
        [0.36, 1.96, 0.08, 0.3, '#f687b3'],
        [-0.18, 2.26, -0.06, 0.26, '#fff5f7'],
        [0.2, 2.22, 0.12, 0.25, '#fbb6ce'],
        [0, 1.82, 0.24, 0.24, '#fed7e2'],
      ];
      for (const [cx, cy, cz, cr, cHex] of blossomClouds) {
        const cloud = sphere(cr, cHex, cx, cy, cz);
        cloud.scale.set(1.18, 0.88, 1.08);
        blossomTree.add(cloud);
      }
      // Pastel blue wooden Birdhouse on a garden post beside the cherry tree
      blossomTree.add(box(0.06, 1.18, 0.06, '#e2e8f0', 0.38, 0.59, 0.28));
      const birdhouse = new THREE.Group();
      birdhouse.position.set(0.38, 1.24, 0.28);
      birdhouse.rotation.y = 0.32;
      birdhouse.add(box(0.24, 0.26, 0.22, '#90cdf4', 0, 0, 0));
      birdhouse.add(cyl(0.045, 0.045, 0.04, '#2d3748', 0, 0.02, 0.1, 10).rotateX(Math.PI / 2));
      birdhouse.add(cyl(0.015, 0.015, 0.08, '#ecc94b', 0, -0.06, 0.13, 8).rotateX(Math.PI / 2));
      const roofL = box(0.18, 0.035, 0.26, '#fbb6ce', -0.07, 0.16, 0);
      roofL.rotation.z = 0.65;
      const roofR = box(0.18, 0.035, 0.26, '#fbb6ce', 0.07, 0.16, 0);
      roofR.rotation.z = -0.65;
      birdhouse.add(roofL, roofR);
      blossomTree.add(birdhouse);
      bay.add(blossomTree);

      //    Right Outer Flank (lx=1.68, lz=0.78): Vintage Wooden Garden Wheelbarrow (~1.1m tall) overflowing with Giant Tulips & Painted Eggs + Watering Can
      const barrow = new THREE.Group();
      barrow.position.set(1.68, 0, 0.78);
      barrow.rotation.y = -0.52;
      // Spoked wooden wheel at front (z = +0.38) + two angled legs at back (z = -0.22)
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 8, 16), mat('#5c3d24'));
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(0, 0.22, 0.42);
      barrow.add(wheel);
      barrow.add(sphere(0.055, '#ecc94b', 0, 0.22, 0.42));
      for (const side of [-1, 1] as const) {
        const handle = box(0.055, 0.055, 0.96, '#8c6239', side * 0.2, 0.36, 0.02);
        handle.rotation.x = 0.18;
        barrow.add(handle);
        barrow.add(box(0.05, 0.34, 0.05, '#6b4f35', side * 0.2, 0.17, -0.22));
      }
      // Trapezoidal pastel-mint wooden wheelbarrow tray + soil bed
      barrow.add(box(0.48, 0.28, 0.58, '#68d391', 0, 0.48, 0.06));
      barrow.add(box(0.52, 0.04, 0.62, '#38a169', 0, 0.62, 0.06));
      barrow.add(box(0.44, 0.06, 0.52, '#5c3d24', 0, 0.6, 0.06));
      // Giant painted Easter eggs + blooming spring flowers heaped inside the wheelbarrow
      for (const [ex, ez, eHex] of [
        [-0.11, 0.16, '#fbb6ce'],
        [0.12, 0.14, '#f6e05e'],
        [0, -0.06, '#90cdf4'],
        [-0.1, -0.12, '#b794f4'],
        [0.12, -0.1, '#fed7e2'],
      ] as const) {
        const bEgg = sphere(0.11, eHex, ex, 0.72, ez);
        bEgg.scale.set(0.85, 1.3, 0.85);
        barrow.add(bEgg);
      }
      for (const [fx, fz, fHex] of [
        [-0.08, 0.02, '#f6e05e'],
        [0.08, 0.04, '#fbb6ce'],
        [0, 0.2, '#b794f4'],
      ] as const) {
        barrow.add(cyl(0.018, 0.018, 0.28, '#38a169', fx, 0.78, fz, 8));
        barrow.add(sphere(0.072, fHex, fx, 0.94, fz));
      }
      bay.add(barrow);

      // Large Galvanized Steel Garden Watering Can beside the wheelbarrow
      const wateringCan = new THREE.Group();
      wateringCan.position.set(1.32, 0, 1.12);
      wateringCan.rotation.y = -0.35;
      wateringCan.add(cyl(0.15, 0.17, 0.34, '#a0aec0', 0, 0.17, 0, 12));
      wateringCan.add(cyl(0.156, 0.156, 0.03, '#ecc94b', 0, 0.28, 0, 12));
      const spout = cyl(0.025, 0.045, 0.34, '#a0aec0', 0, 0.24, 0.22, 8);
      spout.rotation.x = Math.PI / 3.2;
      wateringCan.add(spout);
      wateringCan.add(cyl(0.065, 0.03, 0.05, '#ecc94b', 0, 0.34, 0.36, 10).rotateX(Math.PI / 3.2));
      const canHandle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 12), mat('#cbd5e0'));
      canHandle.rotation.y = Math.PI / 2;
      canHandle.position.set(0, 0.28, -0.1);
      wateringCan.add(canHandle);
      bay.add(wateringCan);

      // 5. Scaled-up Floor Props: Terra-cotta Daffodil Pot on the left (1.42x) + Porcelain Bunny Statue & Painted Easter Eggs on the right (1.45x)
      const clayPot = new THREE.Group();
      clayPot.position.set(-0.54, 0.03, 1.04);
      clayPot.scale.setScalar(1.42);
      clayPot.add(cyl(0.14, 0.1, 0.2, '#c05621', 0, 0.1, 0, 12));
      clayPot.add(cyl(0.155, 0.145, 0.04, '#dd6b20', 0, 0.19, 0, 12));
      for (const [sx, sz, col] of [
        [-0.04, 0.02, '#f6e05e'],
        [0.04, -0.02, '#fbb6ce'],
        [0, 0.04, '#90cdf4'],
      ] as const) {
        clayPot.add(cyl(0.014, 0.014, 0.16, '#48bb78', sx, 0.26, sz, 8));
        clayPot.add(sphere(0.055, col, sx, 0.35, sz));
      }
      bay.add(clayPot);

      // Woven Easter Egg Basket + giant pastel Easter eggs on the right rug
      const basketFig = new THREE.Group();
      basketFig.position.set(0.52, 0.03, 1.04);
      basketFig.rotation.y = -0.35;
      basketFig.scale.setScalar(1.38);
      basketFig.add(cyl(0.16, 0.12, 0.14, '#b7791f', 0, 0.07, 0, 12));
      basketFig.add(cyl(0.17, 0.16, 0.03, '#d69e2e', 0, 0.13, 0, 12));
      const bHandle = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.018, 8, 14, Math.PI),
        mat('#b7791f'),
      );
      bHandle.position.set(0, 0.14, 0);
      basketFig.add(bHandle);
      for (const [bx, bz, bHex] of [
        [-0.05, 0.02, '#fbb6ce'],
        [0.05, 0.02, '#f6e05e'],
        [0, -0.04, '#90cdf4'],
      ] as const) {
        const bEgg = sphere(0.055, bHex, bx, 0.15, bz);
        bEgg.scale.set(0.85, 1.25, 0.85);
        basketFig.add(bEgg);
      }
      bay.add(basketFig);
      for (const [ex, ez, eHex] of [
        [0.48, 1.28, '#f6e05e'],
        [0.7, 1.2, '#90cdf4'],
        [-0.48, 1.28, '#fbb6ce'],
      ] as const) {
        const floorEgg = sphere(0.11, eHex, ex, 0.15, ez);
        floorEgg.scale.set(0.85, 1.28, 0.85);
        bay.add(floorEgg);
      }
      break;
    }

    case 'fourth': {
      // 1. Whitewashed backyard picket fence with horizontal rails & pointed picket tips + pleated fan bunting overhead
      bay.add(box(3.1, 0.06, 0.035, '#cbd5e0', 0, 0.26, 0.16, false));
      bay.add(box(3.1, 0.06, 0.035, '#cbd5e0', 0, 0.72, 0.16, false));
      for (let i = -5; i <= 5; i++) {
        const px = i * 0.28;
        bay.add(box(0.13, 0.88, 0.045, '#e2e8f0', px, 0.44, 0.18, false));
        const picketTip = new THREE.Mesh(new THREE.ConeGeometry(0.092, 0.14, 4), mat('#e2e8f0'));
        picketTip.rotation.y = Math.PI / 4;
        picketTip.scale.set(1, 1, 0.36);
        picketTip.position.set(px, 0.95, 0.18);
        bay.add(picketTip);
      }
      // Three semicircular pleated red-white-and-blue patriotic fan buntings across the top wall
      for (const bx of [-0.95, 0, 0.95]) {
        const fanBands: [number, string, number][] = [
          [0.38, '#e53e3e', 0.17],
          [0.27, '#ffffff', 0.18],
          [0.16, '#2b6cb0', 0.19],
        ];
        for (const [rad, hex, fz] of fanBands) {
          const fan = new THREE.Mesh(
            new THREE.CylinderGeometry(rad, rad, 0.04, 16, 1, false, 0, Math.PI),
            mat(hex),
          );
          fan.rotation.z = -Math.PI / 2;
          fan.rotation.y = Math.PI / 2;
          fan.position.set(bx, 3.44, fz);
          bay.add(fan);
        }
        bay.add(sphere(0.045, '#f6e05e', bx, 3.42, 0.21, false));
      }
      // 2. Central Sparkler & Firework Mortar Bench (y=0.78..1.38) in unobstructed center stage
      bay.add(box(1.14, 0.1, 0.38, '#5c3d24', 0, 0.78, 0.36, false));
      for (const side of [-1, 0, 1] as const) {
        const sx = side * 0.32;
        bay.add(
          cyl(0.09, 0.08, 0.22, side === 0 ? '#e53e3e' : '#2b6cb0', sx, 0.94, 0.4, 12, false),
        );
        bay.add(cyl(0.015, 0.015, 0.26, '#e2e8f0', sx, 1.12, 0.4, 8, false));
        const spark = glowSphere(
          0.075,
          side === 0 ? '#ffea79' : side < 0 ? '#ff6b6b' : '#63b3ed',
          sx,
          1.26,
          0.4,
          1.35,
        );
        bay.add(spark);
        flames.push({ mesh: spark, baseY: 1.26, phase: side + 0.8 });
      }

      // 3. Large Outer Flank Hero Props:
      //    Left Outer Flank (lx=-1.72, lz=0.74): Classic Red Kettle BBQ Grill (~1.15m tall) shaded under a Tall Striped Patio Umbrella (~2.45m tall)
      const bbqGroup = new THREE.Group();
      bbqGroup.position.set(-1.72, 0, 0.74);
      // Tall white-and-crimson patriotic patio umbrella post & canopy
      bbqGroup.add(cyl(0.032, 0.038, 2.38, '#e2e8f0', -0.12, 1.19, -0.12, 10));
      const umbrellaCanopy = new THREE.Group();
      umbrellaCanopy.position.set(-0.12, 2.28, -0.12);
      umbrellaCanopy.rotation.z = -0.18;
      umbrellaCanopy.rotation.x = 0.12;
      umbrellaCanopy.add(new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.34, 12), mat('#e53e3e')));
      umbrellaCanopy.add(
        new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.36, 12), mat('#ffffff')).translateY(0.02),
      );
      umbrellaCanopy.add(
        new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.38, 12), mat('#2b6cb0')).translateY(0.04),
      );
      umbrellaCanopy.add(sphere(0.048, '#ecc94b', 0, 0.24, 0));
      bbqGroup.add(umbrellaCanopy);

      // Tripod chrome legs + bottom ash tray + glossy red kettle bowl & glowing coals
      for (const [lx, lz, rotZ, rotX] of [
        [-0.18, 0.16, -0.18, 0.16],
        [0.18, 0.16, 0.18, 0.16],
        [0, -0.2, 0, -0.2],
      ] as const) {
        const leg = cyl(0.022, 0.02, 0.62, '#cbd5e0', lx * 0.6, 0.3, lz * 0.6, 8);
        leg.rotation.set(rotX, 0, rotZ);
        bbqGroup.add(leg);
      }
      bbqGroup.add(cyl(0.18, 0.16, 0.02, '#a0aec0', 0, 0.18, 0, 12));
      // Lower black kettle hemisphere + glowing orange charcoal bed + grill grate
      bbqGroup.add(cyl(0.32, 0.14, 0.28, '#1a202c', 0, 0.64, 0, 14));
      bbqGroup.add(glowSphere(0.24, '#ff6b35', 0, 0.68, 0, 0.85));
      bbqGroup.add(cyl(0.31, 0.31, 0.02, '#cbd5e0', 0, 0.78, 0, 14));
      // Hinged glossy crimson dome lid tilted back on the kettle rim
      const lidGroup = new THREE.Group();
      lidGroup.position.set(0, 0.82, -0.22);
      lidGroup.rotation.x = -0.78;
      lidGroup.add(cyl(0.16, 0.32, 0.22, '#c53030', 0, 0.11, 0.22, 14));
      lidGroup.add(box(0.14, 0.04, 0.05, '#e2e8f0', 0, 0.24, 0.22));
      bbqGroup.add(lidGroup);
      bay.add(bbqGroup);

      //    Right Outer Flank (lx=1.72, lz=0.76): Wooden Fireworks Crate overflowing with Tall Sky-Rockets (~1.65m tall) + Parade Bass Drum
      const rocketCrate = new THREE.Group();
      rocketCrate.position.set(1.72, 0, 0.76);
      rocketCrate.rotation.y = -0.38;
      // Slatted pine fireworks crate with stenciled red-and-blue bands
      rocketCrate.add(box(0.56, 0.48, 0.48, '#b7791f', 0, 0.24, 0));
      rocketCrate.add(box(0.58, 0.06, 0.5, '#8c6239', 0, 0.44, 0));
      rocketCrate.add(box(0.58, 0.06, 0.5, '#8c6239', 0, 0.08, 0));
      rocketCrate.add(box(0.57, 0.1, 0.49, '#c53030', 0, 0.26, 0));
      // 5 tall sky-rockets on wooden launch sticks jutting high out of the crate
      const rockets: [number, number, number, number, string, string][] = [
        [-0.14, 0.08, 1.48, 0.12, '#e53e3e', '#f6e05e'],
        [0.14, 0.1, 1.62, -0.08, '#2b6cb0', '#ffffff'],
        [0, -0.08, 1.54, 0.04, '#e53e3e', '#2b6cb0'],
        [-0.16, -0.1, 1.28, 0.18, '#ecc94b', '#c53030'],
        [0.16, -0.08, 1.36, -0.15, '#2b6cb0', '#ecc94b'],
      ];
      for (const [rx, rz, rHeight, tiltZ, bodyHex, coneHex] of rockets) {
        const rGroup = new THREE.Group();
        rGroup.position.set(rx, 0.36, rz);
        rGroup.rotation.z = tiltZ;
        const stickH = rHeight - 0.36;
        rGroup.add(cyl(0.014, 0.014, stickH, '#d69e2e', 0, stickH / 2, 0, 6));
        rGroup.add(cyl(0.068, 0.068, 0.36, bodyHex, 0, stickH - 0.12, 0, 12));
        rGroup.add(cyl(0.071, 0.071, 0.05, '#ffffff', 0, stickH - 0.12, 0, 12));
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.22, 12), mat(coneHex));
        nose.position.set(0, stickH + 0.17, 0);
        rGroup.add(nose);
        rocketCrate.add(rGroup);
      }
      bay.add(rocketCrate);

      // Patriotic Parade Bass Drum (0.68m diameter) on stand beside the fireworks crate
      const paradeDrum = new THREE.Group();
      paradeDrum.position.set(1.32, 0, 1.1);
      paradeDrum.rotation.y = -0.45;
      paradeDrum.add(box(0.38, 0.08, 0.26, '#5c3d24', 0, 0.04, 0));
      const drumShell = cyl(0.3, 0.3, 0.26, '#c53030', 0, 0.36, 0, 16);
      drumShell.rotation.x = Math.PI / 2;
      paradeDrum.add(drumShell);
      const drumRimF = cyl(0.315, 0.315, 0.04, '#2b6cb0', 0, 0.36, 0.12, 16);
      drumRimF.rotation.x = Math.PI / 2;
      const drumRimB = cyl(0.315, 0.315, 0.04, '#2b6cb0', 0, 0.36, -0.12, 16);
      drumRimB.rotation.x = Math.PI / 2;
      const drumHead = cyl(0.28, 0.28, 0.28, '#fffaf0', 0, 0.36, 0, 16);
      drumHead.rotation.x = Math.PI / 2;
      const drumStar = cyl(0.11, 0.11, 0.29, '#ecc94b', 0, 0.36, 0, 5);
      drumStar.rotation.x = Math.PI / 2;
      paradeDrum.add(drumRimF, drumRimB, drumHead, drumStar);
      bay.add(paradeDrum);

      // 4. Scaled-up Floor Props: Wicker Picnic Basket & Watermelon Wedge on the left (1.38x) + Giant Firecracker Bundle on the right (1.42x)
      const picnic = new THREE.Group();
      picnic.position.set(-0.56, 0.03, 1.02);
      picnic.rotation.y = 0.26;
      picnic.scale.setScalar(1.38);
      picnic.add(box(0.36, 0.2, 0.24, '#b7791f', 0, 0.1, 0));
      picnic.add(box(0.38, 0.035, 0.26, '#d69e2e', 0, 0.21, 0));
      picnic.add(box(0.34, 0.025, 0.22, '#e53e3e', 0, 0.19, 0.02));
      picnic.add(box(0.04, 0.14, 0.04, '#8c6239', 0, 0.28, 0));
      bay.add(picnic);

      // Juicy red watermelon slice wedge with green rind next to the picnic basket (scaled up)
      const melon = new THREE.Group();
      melon.position.set(-0.48, 0.16, 1.3);
      melon.rotation.y = -0.35;
      melon.scale.setScalar(1.38);
      const rind = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.06, 14, 1, false, -Math.PI / 2, Math.PI),
        mat('#2f855a'),
      );
      rind.rotation.z = Math.PI / 2;
      rind.rotation.y = Math.PI / 2;
      const flesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.115, 0.066, 14, 1, false, -Math.PI / 2, Math.PI),
        mat('#e53e3e'),
      );
      flesh.rotation.z = Math.PI / 2;
      flesh.rotation.y = Math.PI / 2;
      melon.add(rind, flesh);
      bay.add(melon);

      // Bundle of 3 giant red firecrackers with gold bands & white fuses on the right rug (1.42x)
      const crackers = new THREE.Group();
      crackers.position.set(0.52, 0.03, 1.08);
      crackers.rotation.y = -0.22;
      crackers.scale.setScalar(1.42);
      for (const [cx, cz, ch] of [
        [-0.07, 0.03, 0.26],
        [0.07, 0.03, 0.24],
        [0, -0.05, 0.3],
      ] as const) {
        crackers.add(cyl(0.052, 0.052, ch, '#e53e3e', cx, ch / 2, cz, 12));
        crackers.add(cyl(0.055, 0.055, 0.03, '#f6e05e', cx, ch * 0.72, cz, 12));
        crackers.add(cyl(0.008, 0.008, 0.07, '#f7fafc', cx, ch + 0.03, cz, 6));
      }
      bay.add(crackers);
      break;
    }
  }
}

/**
 * Build the complete 7-bay Holiday Hall rotunda.
 * Bay 0 ('hall') holds the 6-Lamp Grand Door (Tuesday Finale), the Host/Villain,
 * and the Calendar Desk. Bays 1..6 hold the 6 Holiday Alcoves.
 */
export function buildHolidayHallDiorama(callbacks: {
  onSelectBay: (bay: BayId) => void;
  onOpenProto: (protoId: string, focusPos: THREE.Vector3, focusLook: THREE.Vector3) => void;
  onOpenDesk: (focusPos: THREE.Vector3, focusLook: THREE.Vector3) => void;
  onShowStory: () => void;
  onOpenCorkboard?: () => void;
  onClickMascot?: (roomId: RoomId) => void;
  onPlaceItem: (itemId: string) => void;
}): BuiltDiorama {
  const root = new THREE.Group();
  const hotspots: Hotspot3D[] = [];
  const floating: { mesh: THREE.Object3D; phase: number; baseY: number }[] = [];
  const flames: FlameEntry[] = [];
  const fairyLights: {
    mat: THREE.MeshToonMaterial;
    baseColor: THREE.Color;
    offColor: THREE.Color;
    phase: number;
  }[] = [];
  const fireflies: {
    mesh: THREE.Object3D;
    baseX: number;
    baseY: number;
    baseZ: number;
    phase: number;
  }[] = [];

  // Single shadow-casting light source centered at the active diorama's emissive fixture
  const dioramaLight = new THREE.PointLight(0xff7733, 5.2, 5.8, 1.55);
  dioramaLight.castShadow = true;
  dioramaLight.shadow.mapSize.set(1024, 1024);
  dioramaLight.shadow.camera.near = 0.12;
  dioramaLight.shadow.camera.far = 7.5;
  dioramaLight.shadow.bias = -0.0005;
  dioramaLight.shadow.normalBias = 0.02;
  root.add(dioramaLight);

  const act = gameState.act();
  const lampsLit = gameState.completedRoomCount();

  // Rich dark walnut circular floor + ceiling canopy so the rotunda feels warm and moody
  const mainFloorColor = act >= 4 ? '#6b46c1' : '#594230';
  root.add(cyl(6.3, 6.3, 0.3, mainFloorColor, 0, -0.15, 0, 28, false));
  root.add(cyl(2.3, 2.3, 0.03, '#7a5938', 0, 0.01, 0, 24, false));
  root.add(cyl(1.9, 1.9, 0.04, act === 3 ? '#742a2a' : '#8c6940', 0, 0.015, 0, 24, false));
  root.add(cyl(6.4, 6.4, 0.28, '#3b2b20', 0, 5.85, 0, 28, false));

  // Chord width of each of the 7 walls at HALL_WALL_RADIUS
  const wallWidth = 2 * HALL_WALL_RADIUS * Math.tan(Math.PI / BAY_COUNT) + 0.18;

  // Helper to create a bay group positioned at the bay's back wall facing inward
  const makeBayGroup = (theta: number): THREE.Group => {
    const g = new THREE.Group();
    g.position.set(Math.sin(theta) * HALL_WALL_RADIUS, 0, -Math.cos(theta) * HALL_WALL_RADIUS);
    g.rotation.y = -theta;
    root.add(g);
    return g;
  };

  // --- BAY 0: HOLIDAY HALL (TWO-TIER GRAND FOYER WITH ALL 6 HOLIDAY DOORS) ---
  let hallLeapDayActor = new THREE.Group();
  let hallFloorSlip = new THREE.Group();
  const hallDoorPivots = new Map<RoomId, { pivot: THREE.Group; baseRotY: number }>();
  const hallDoorTargets = new Map<RoomId, THREE.Vector3>();
  let activeDoorHop: { roomId: RoomId; progress: number } | null = null;
  let activeIntroPose: { mode: 'hidden' | 'pop' | 'idle'; elapsed: number } | null = null;
  const leapDayRestPos = new THREE.Vector3(0, 0.06, 2.08);

  {
    const theta = getBayAngle('hall');
    const bay = makeBayGroup(theta);
    const wallHex = act >= 4 ? '#553c9a' : act === 3 ? '#334155' : '#4a3525';
    const panelHex = act >= 4 ? '#44337a' : act === 3 ? '#1e293b' : '#36261a';

    // Grand wood-paneled foyer back wall, recessed wainscot panel, cornice beam, and side pillars
    bay.add(box(wallWidth + 0.4, 5.8, 0.28, wallHex, 0, 2.9, 0, false));
    bay.add(box(wallWidth - 0.1, 3.66, 0.05, '#7a5938', 0, 1.9, 0.13, false));
    bay.add(box(wallWidth - 0.26, 3.5, 0.07, panelHex, 0, 1.9, 0.14, false));
    bay.add(box(wallWidth + 0.4, 0.12, 0.22, '#6b4f35', 0, 0.06, 0.04, false));
    bay.add(box(wallWidth + 0.4, 0.24, 0.38, '#4a3524', 0, 3.85, 0.05, false));
    for (const side of [-1, 1] as const) {
      bay.add(cyl(0.2, 0.24, 5.8, '#3b281a', side * (wallWidth / 2 - 0.04), 2.9, 0.14, 12, false));
    }

    // Grand foyer carpet & central medallion rug
    bay.add(box(3.2, 0.03, 2.65, act === 3 ? '#742a2a' : '#7b341e', 0, 0.015, 1.32, false));
    bay.add(box(2.9, 0.038, 2.4, '#b7791f', 0, 0.02, 1.32, false));
    bay.add(cyl(0.48, 0.52, 0.045, '#5c3d24', 0, 0.025, 2.08, 20, false));
    bay.add(cyl(0.42, 0.44, 0.052, '#2f855a', 0, 0.03, 2.08, 20, false));

    // Low ground-floor door sill (`ly = 0.04`) & Upper Gallery Balcony Ledge (`ly = 1.46`)
    bay.add(box(3.68, 0.04, 0.44, '#7a5938', 0, 0.04, 0.25, false));
    bay.add(box(3.68, 0.09, 0.54, '#5c3d24', 0, 1.41, 0.26, false));
    bay.add(box(3.72, 0.04, 0.58, '#d69e2e', 0, 1.46, 0.27, false));

    // Clean stacked wooden staircase on the left (`lx = -1.56`) rising from the ground floor
    // (`y = 0.03`) up to the second-floor balcony (`y = 1.46`), completely clear of the left doors.
    const stairsGroup = new THREE.Group();
    const stairX = -1.56;
    const stairW = 0.36;
    const stepCount = 8;
    const startZ = 1.48;
    const backZ = 0.26;
    const topFrontZ = 0.48;
    const baseY = 0.03;
    const topY = 1.45;
    const climbY = topY - baseY;
    const riserH = climbY / stepCount;
    const treadRun = (startZ - topFrontZ) / (stepCount - 1);

    for (let s = 0; s < stepCount; s++) {
      const stepTopY = baseY + (s + 1) * riserH;
      const stepFrontZ = startZ - s * treadRun;
      const slabDepth = Math.max(0.16, stepFrontZ - backZ);
      const slabCenterZ = backZ + slabDepth * 0.5;

      // Horizontal stacked step tier extending back to the gallery wall (no vertical seams or gaps)
      stairsGroup.add(
        box(
          stairW,
          riserH,
          slabDepth,
          '#7a5938',
          stairX,
          stepTopY - riserH * 0.5,
          slabCenterZ,
          false,
        ),
      );
      // Polished oak tread nosing at the front of each step
      const treadZ = stepFrontZ - treadRun * 0.48;
      stairsGroup.add(
        box(stairW + 0.03, 0.034, treadRun + 0.02, '#9c6b3b', stairX, stepTopY, treadZ, false),
      );
      // Festive crimson stair runner carpet down the center of each tread
      stairsGroup.add(
        box(
          stairW * 0.58,
          0.04,
          treadRun + 0.01,
          '#b83232',
          stairX,
          stepTopY + 0.003,
          treadZ,
          false,
        ),
      );
    }
    bay.add(stairsGroup);

    // 1. ALL SIX HOLIDAY DOORS IN TWO TIERS IN CALENDAR ORDER
    //    Shifted cleanly to the right of the left staircase (`lx = -0.82, +0.20, +1.22`) so
    //    the staircase (`lx = -1.74..-1.38`) never overlaps the left doors (`lx = -1.22..-0.42`).
    const doorLayout: readonly { roomId: RoomId; lx: number; floorY: number }[] = [
      { roomId: 'valentines', lx: -0.82, floorY: 1.48 },
      { roomId: 'easter', lx: 0.2, floorY: 1.48 },
      { roomId: 'fourth', lx: 1.22, floorY: 1.48 },
      { roomId: 'halloween', lx: -0.82, floorY: 0.06 },
      { roomId: 'thanksgiving', lx: 0.2, floorY: 0.06 },
      { roomId: 'christmas', lx: 1.22, floorY: 0.06 },
    ];

    const doorFocusPos = bayToWorld(theta, 0, 1.92, 5.15);
    const doorFocusLook = bayToWorld(theta, 0, 1.38, 0.75);

    const doorPalettes: Record<
      RoomId,
      {
        frame: `#${string}`;
        lintel: `#${string}`;
        leaf: `#${string}`;
        inset: `#${string}`;
      }
    > = {
      halloween: {
        frame: '#6b46c1',
        lintel: '#dd6b20',
        leaf: '#44337a',
        inset: '#ed8936',
      },
      christmas: {
        frame: '#c53030',
        lintel: '#c53030',
        leaf: '#22543d',
        inset: '#2f855a',
      },
      easter: {
        frame: '#805ad5',
        lintel: '#f687b3',
        leaf: '#38a169',
        inset: '#fefcbf',
      },
      thanksgiving: {
        frame: '#c05621',
        lintel: '#ecc94b',
        leaf: '#7b341e',
        inset: '#dd6b20',
      },
      valentines: {
        frame: '#d53f8c',
        lintel: '#fbb6ce',
        leaf: '#97266d',
        inset: '#f687b3',
      },
      fourth: {
        frame: '#2b6cb0',
        lintel: '#e53e3e',
        leaf: '#1e4e8c',
        inset: '#ffffff',
      },
    };

    const buildDoorHolidayEmblem = (roomId: RoomId): THREE.Group => {
      const g = new THREE.Group();
      const disc = cyl(0.145, 0.145, 0.022, '#fffaf0', 0, 0, 0, 18, false);
      disc.rotation.x = Math.PI / 2;
      g.add(disc);
      const rim = cyl(0.16, 0.16, 0.016, '#1f2430', 0, 0, -0.004, 18, false);
      rim.rotation.x = Math.PI / 2;
      g.add(rim);

      switch (roomId) {
        case 'halloween': {
          // Jack-o'-Lantern Pumpkin Emblem
          const pumpkin = sphere(0.105, '#ed8936', 0, -0.01, 0.02, false);
          pumpkin.scale.set(1.18, 0.95, 0.55);
          g.add(pumpkin);
          g.add(cyl(0.016, 0.024, 0.05, '#2f855a', 0, 0.095, 0.02, 8, false));
          g.add(glowSphere(0.02, '#ffea79', -0.038, 0.015, 0.068, 1.1));
          g.add(glowSphere(0.02, '#ffea79', 0.038, 0.015, 0.068, 1.1));
          g.add(glowBox(0.075, 0.02, 0.018, '#ffea79', 0, -0.035, 0.068, 1.1));
          break;
        }
        case 'christmas': {
          // Evergreen Tree with Gold Topper Star & Red Ornaments
          g.add(box(0.034, 0.05, 0.024, '#744210', 0, -0.095, 0.02, false));
          const tier1 = cyl(0, 0.105, 0.1, '#22543d', 0, -0.03, 0.022, 10, false);
          tier1.scale.z = 0.55;
          const tier2 = cyl(0, 0.085, 0.095, '#2f855a', 0, 0.025, 0.025, 10, false);
          tier2.scale.z = 0.55;
          const tier3 = cyl(0, 0.062, 0.08, '#38a169', 0, 0.075, 0.028, 10, false);
          tier3.scale.z = 0.55;
          g.add(tier1, tier2, tier3);
          g.add(glowSphere(0.026, '#ffea79', 0, 0.122, 0.035, 1.15));
          g.add(sphere(0.018, '#e53e3e', -0.04, -0.02, 0.052, false));
          g.add(sphere(0.018, '#e53e3e', 0.04, 0.015, 0.052, false));
          break;
        }
        case 'easter': {
          // High-contrast White Bunny Head with Tall Pink-Lined Ears
          const bunnyDisc = cyl(0.14, 0.14, 0.025, '#553c9a', 0, 0, 0.002, 18, false);
          bunnyDisc.rotation.x = Math.PI / 2;
          g.add(bunnyDisc);
          for (const side of [-1, 1] as const) {
            const earOuter = box(0.044, 0.125, 0.024, '#ffffff', side * 0.044, 0.055, 0.024, false);
            earOuter.rotation.z = -side * 0.08;
            const earInner = box(0.022, 0.088, 0.026, '#ed64a6', side * 0.044, 0.055, 0.03, false);
            earInner.rotation.z = -side * 0.08;
            g.add(earOuter, earInner);
          }
          const head = sphere(0.082, '#ffffff', 0, -0.038, 0.03, false);
          head.scale.set(1.16, 0.96, 0.58);
          g.add(head);
          g.add(sphere(0.015, '#1a202c', -0.032, -0.025, 0.075, false));
          g.add(sphere(0.015, '#1a202c', 0.032, -0.025, 0.075, false));
          g.add(sphere(0.018, '#ed64a6', 0, -0.048, 0.078, false));
          break;
        }
        case 'thanksgiving': {
          // Turkey Feather Fan + Pilgrim Hat Emblem
          const featherColors: `#${string}`[] = [
            '#c53030',
            '#dd6b20',
            '#ecc94b',
            '#dd6b20',
            '#c53030',
          ];
          for (let f = 0; f < 5; f++) {
            const ang = (f - 2) * 0.36;
            const feather = box(
              0.038,
              0.11,
              0.018,
              featherColors[f] ?? '#dd6b20',
              Math.sin(ang) * 0.055,
              Math.cos(ang) * 0.055 - 0.01,
              0.018,
              false,
            );
            feather.rotation.z = -ang;
            g.add(feather);
          }
          const body = sphere(0.068, '#7b341e', 0, -0.035, 0.032, false);
          body.scale.z = 0.65;
          g.add(body);
          g.add(sphere(0.045, '#8c5834', 0, 0.025, 0.045, false));
          g.add(sphere(0.016, '#e53e3e', 0.014, 0.012, 0.08, false));
          g.add(box(0.075, 0.014, 0.035, '#1a202c', 0, 0.068, 0.048, false));
          g.add(box(0.048, 0.04, 0.032, '#1a202c', 0, 0.09, 0.048, false));
          break;
        }
        case 'valentines': {
          // Sculpted Crimson Heart + Golden Cupid Arrow
          const lobeL = sphere(0.062, '#c53030', -0.044, 0.032, 0.028, false);
          lobeL.scale.z = 0.55;
          const lobeR = sphere(0.062, '#c53030', 0.044, 0.032, 0.028, false);
          lobeR.scale.z = 0.55;
          const tip = cyl(0, 0.106, 0.13, '#c53030', 0, -0.042, 0.028, 12, false);
          tip.rotation.z = Math.PI;
          tip.scale.z = 0.55;
          const arrow = box(0.24, 0.02, 0.022, '#d69e2e', 0, 0, 0.052, false);
          arrow.rotation.z = 0.42;
          g.add(lobeL, lobeR, tip, arrow);
          break;
        }
        case 'fourth': {
          // Simplified 3D American Flag (5 Red & White Stripes + Blue Canton with Stars)
          g.add(box(0.228, 0.162, 0.024, '#1f2430', 0, 0, 0.014, false));
          const stripeH = 0.14 / 5;
          for (let s = 0; s < 5; s++) {
            const sy = 0.07 - stripeH * (s + 0.5);
            g.add(
              box(
                0.21,
                stripeH + 0.002,
                0.028,
                s % 2 === 0 ? '#e53e3e' : '#ffffff',
                0,
                sy,
                0.022,
                false,
              ),
            );
          }
          // Upper-left blue canton spanning the top 3 stripes
          const cantonH = stripeH * 3;
          const cantonY = 0.07 - cantonH * 0.5;
          g.add(box(0.098, cantonH + 0.002, 0.034, '#1e4e8c', -0.056, cantonY, 0.026, false));
          for (const sx of [-0.078, -0.034]) {
            for (const sy of [cantonY + 0.018, cantonY - 0.018]) {
              g.add(sphere(0.012, '#ffffff', sx, sy, 0.044, false));
            }
          }
          break;
        }
      }
      return g;
    };

    for (const slot of doorLayout) {
      const room = ROOM_SPECS.find((r) => r.id === slot.roomId);
      if (!room) continue;
      const unlocked = gameState.isRoomUnlocked(room);
      const complete = gameState.isRoomComplete(room);
      const unlockItem = !unlocked ? gameState.carriedEligibleItemForRoom(room) : null;
      const carriedSecondItem = unlocked
        ? (gameState.carriedItems().find((it) => it.homeRoom === room.id) ?? null)
        : null;
      const sign = gameState.getRoomSignage(room);
      const pal = doorPalettes[room.id];

      const dg = new THREE.Group();
      dg.position.set(slot.lx, slot.floorY, 0.22);
      hallDoorTargets.set(room.id, new THREE.Vector3(slot.lx, slot.floorY + 0.04, 0.48));

      // Generous invisible 3D raycast hit-box on layer 2 so tapping anywhere on the door is effortless
      // without polluting the camera's Outline normal pass on layer 0
      const hitMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 1.12, 0.38),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hitMesh.position.set(0, 0.5, 0.08);
      hitMesh.layers.set(2);
      dg.add(hitMesh);

      // Doorway outer casing & lintel in the holiday's signature colors right from the start
      const frameColor = complete ? '#ecc94b' : pal.frame;
      const lintelColor = complete ? '#ecc94b' : pal.lintel;
      dg.add(box(0.76, 0.88, 0.12, '#2d1d11', 0, 0.44, 0, false));
      dg.add(box(0.68, 0.84, 0.14, frameColor, 0, 0.42, 0.01, false));
      dg.add(box(0.8, 0.08, 0.18, lintelColor, 0, 0.86, 0.02, false));

      // Master Holiday Lamp directly above the door lintel (replaces top-bar 0/6 counter)
      const lampMesh = complete
        ? glowSphere(0.105, room.accent, 0, 1.01, 0.08, 1.35)
        : sphere(0.095, '#3b4252', 0, 1.01, 0.08, false);
      dg.add(lampMesh);
      dg.add(cyl(0.04, 0.055, 0.05, '#d69e2e', 0, 0.91, 0.06, 10, false));

      // Mini string of 4 fairy light bulbs across the top of the door arch
      for (const [bIdx, bx] of [-0.27, -0.1, 0.1, 0.27].entries()) {
        const bulbHex = (bIdx % 2 === 0 ? room.accent : room.secondaryAccent) as `#${string}`;
        if (complete) {
          const cNum = hexToNumber(bulbHex);
          const bulbMat = toonMaterial({ color: cNum, emissive: cNum, emissiveIntensity: 1.1 });
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), bulbMat);
          bulb.position.set(bx, 0.86, 0.11);
          bulb.castShadow = false;
          bulb.receiveShadow = false;
          dg.add(bulb);
          fairyLights.push({
            mat: bulbMat,
            baseColor: new THREE.Color(cNum),
            offColor: new THREE.Color(0x2a303c),
            phase: bIdx * 1.1 + slot.lx,
          });
        } else {
          dg.add(sphere(0.028, '#2d3340', bx, 0.86, 0.11, false));
        }
      }

      // Interior doorway recess (warm orange glow when ajar/unlocked, dark when locked)
      const glowColor =
        room.id === 'thanksgiving'
          ? '#ff8c24'
          : complete
            ? '#ffe082'
            : unlocked
              ? '#ffae52'
              : '#161b24';
      if (unlocked || complete) {
        dg.add(glowBox(0.56, 0.78, 0.05, glowColor, 0, 0.4, 0.03, complete ? 1.15 : 1.05));
        // Warm light spill pool on the threshold step in front of the ajar door
        dg.add(
          glowBox(
            0.58,
            0.018,
            0.24,
            room.id === 'thanksgiving' ? '#ff922b' : glowColor,
            0,
            0.01,
            0.16,
            0.9,
          ),
        );
      } else {
        dg.add(box(0.56, 0.78, 0.05, '#161b24', 0, 0.4, 0.03, false));
      }

      // Hinged holiday-colored door leaf (pivoted at left jamb x = -0.28, z = 0.06)
      const doorPivot = new THREE.Group();
      doorPivot.position.set(-0.28, 0, 0.06);
      const baseRotY = complete ? -0.82 : unlocked ? -0.48 : 0;
      doorPivot.rotation.y = baseRotY;
      hallDoorPivots.set(room.id, { pivot: doorPivot, baseRotY });

      doorPivot.add(box(0.56, 0.78, 0.045, pal.leaf, 0.28, 0.4, 0, false));
      doorPivot.add(box(0.42, 0.3, 0.052, pal.inset, 0.28, 0.56, 0, false));
      doorPivot.add(box(0.42, 0.22, 0.052, pal.inset, 0.28, 0.2, 0, false));

      // 3D Holiday Icon Emblem mounted on the upper panel of the door leaf
      const emblem = buildDoorHolidayEmblem(room.id);
      emblem.position.set(0.28, 0.56, 0.032);
      doorPivot.add(emblem);

      // Brass doorknob
      doorPivot.add(sphere(0.032, '#ecc94b', 0.48, 0.34, 0.04, false));

      // Heavy brass padlock on locked doors
      if (!unlocked) {
        const lockGroup = new THREE.Group();
        lockGroup.position.set(0.46, 0.34, 0.055);
        lockGroup.add(
          box(0.11, 0.12, 0.04, unlockItem ? '#ffea79' : '#d69e2e', 0, -0.04, 0, false),
        );
        lockGroup.add(box(0.03, 0.05, 0.045, '#1a202c', 0, -0.04, 0.005, false));
        const shackle = new THREE.Mesh(
          new THREE.TorusGeometry(0.038, 0.012, 8, 14, Math.PI),
          mat('#cbd5e0'),
        );
        shackle.position.set(0, 0.02, 0);
        lockGroup.add(shackle);
        doorPivot.add(lockGroup);
      }

      dg.add(doorPivot);
      bay.add(dg);

      const canInteract = unlocked || unlockItem !== null;
      const sublabel = complete
        ? '★ Restored!'
        : unlockItem
          ? `✨ Unlock with ${unlockItem.icon} ${unlockItem.title}`
          : carriedSecondItem
            ? `✨ Deliver ${carriedSecondItem.icon} ${carriedSecondItem.title}`
            : unlocked
              ? '▶ Tap to Enter'
              : '🔒 Locked';
      const status: Hotspot3D['status'] = complete
        ? 'done'
        : unlockItem || carriedSecondItem
          ? 'place'
          : unlocked
            ? 'door'
            : 'locked';

      hotspots.push({
        id: `door:${room.id}`,
        bay: 'hall',
        label: `${room.icon} ${sign.title}`,
        sublabel,
        icon: complete ? '★' : unlockItem ? '✨' : unlocked ? room.icon : '🔒',
        status,
        accent: unlockItem ? '#d69e2e' : room.accent,
        hiddenPill: true,
        worldPos: bayToWorld(theta, slot.lx * 1.24, slot.floorY + 0.08, 0.42),
        cameraPos: doorFocusPos,
        cameraLook: doorFocusLook,
        meshGroup: dg,
        onClick: () => {
          if (canInteract) {
            callbacks.onSelectBay(room.id);
          }
        },
      });
    }

    // 2. Foreground Center: Leap Day on the Hall Rug + FEB 29 Calendar Slip
    hallFloorSlip = new THREE.Group();
    hallFloorSlip.position.set(0, 0.058, 2.08);
    hallFloorSlip.add(box(0.42, 0.012, 0.34, '#fffaf0', 0, 0, 0, false));
    hallFloorSlip.add(box(0.42, 0.015, 0.08, '#c53030', 0, 0.001, -0.12, false));
    hallFloorSlip.visible = false;
    bay.add(hallFloorSlip);

    hallLeapDayActor = new THREE.Group();
    hallLeapDayActor.position.copy(leapDayRestPos);
    const leapDayMesh = buildMascotMesh('leapday', 0.68);
    leapDayMesh.traverse((c) => {
      c.castShadow = false;
      c.receiveShadow = false;
    });
    hallLeapDayActor.add(leapDayMesh);
    if (act === 4) {
      hallLeapDayActor.add(cyl(0.01, 0.085, 0.19, '#ed64a6', 0, 0.54, -0.01, 10, false));
      hallLeapDayActor.add(glowSphere(0.026, '#ffea79', 0, 0.65, -0.01, 0.9));
    }
    bay.add(hallLeapDayActor);

    // 3. Foreground Right: The Calendar Desk with a glowing Banker's Lamp (`lx = 1.26, lz = 2.08`)
    //    Positioned in the foreground beside the rug so it never blocks the Christmas door behind it.
    //    Pill is hidden until your first warm-up is beaten (`deskUnlockedCount > 0`)!
    const deskGroup = new THREE.Group();
    deskGroup.position.set(1.26, 0, 2.08);
    deskGroup.rotation.y = -0.32;
    deskGroup.scale.setScalar(0.84);
    deskGroup.add(box(0.82, 0.56, 0.52, '#8c6239', 0, 0.28, 0, false));
    deskGroup.add(box(0.88, 0.07, 0.56, '#5c3d24', 0, 0.58, 0, false));
    deskGroup.add(box(0.38, 0.05, 0.3, '#ffffff', -0.1, 0.64, 0, false));
    deskGroup.add(box(0.38, 0.07, 0.1, '#e53e3e', -0.1, 0.67, -0.1, false));
    deskGroup.add(cyl(0.025, 0.06, 0.18, '#d69e2e', 0.22, 0.7, -0.06, 10, false));
    deskGroup.add(glowBox(0.18, 0.08, 0.12, '#48bb78', 0.22, 0.8, -0.06, 0.85));
    deskGroup.add(glowSphere(0.05, '#ffea79', 0.22, 0.75, -0.06, 1.1));
    bay.add(deskGroup);

    const deskFocusPos = bayToWorld(theta, 0.5, 1.9, 4.1);
    const deskFocusLook = bayToWorld(theta, 1.26, 0.58, 2.08);
    const deskUnlockedCount = gameState.unlockedDeskGenreCount();
    hotspots.push({
      id: 'desk:calendar',
      bay: 'hall',
      label: '📅 Calendar Desk',
      sublabel: `${deskUnlockedCount}/6 Reclaimed`,
      icon: '📅',
      status: deskUnlockedCount >= 6 ? 'done' : 'ready',
      accent: '#805ad5',
      hiddenPill: deskUnlockedCount === 0,
      worldPos: bayToWorld(theta, 1.26, 0.12, 2.32),
      cameraPos: deskFocusPos,
      cameraLook: deskFocusLook,
      meshGroup: deskGroup,
      onClick: () => {
        if (deskUnlockedCount > 0) callbacks.onOpenDesk(deskFocusPos, deskFocusLook);
      },
    });

    // 5. Center Podium: XMAS365 Merger Contract (only spawns once all 6 door lamps are lit!)
    const finaleUnlocked = lampsLit >= 6;
    const finaleDone = gameState.solvedRuns.has('tuesday');
    if (finaleUnlocked) {
      const podiumGroup = new THREE.Group();
      podiumGroup.position.set(0, 0, 1.15);
      podiumGroup.add(cyl(0.28, 0.34, 0.12, '#5c3d24', 0, 0.06, 0, 14, false));
      podiumGroup.add(cyl(0.14, 0.18, 0.68, '#d69e2e', 0, 0.42, 0, 12, false));
      podiumGroup.add(box(0.56, 0.08, 0.44, '#ecc94b', 0, 0.78, 0, false));
      podiumGroup.add(glowBox(0.42, 0.04, 0.32, '#fffaf0', 0, 0.83, 0, 0.6));
      bay.add(podiumGroup);

      hotspots.push({
        id: 'finale:tuesday',
        bay: 'hall',
        label: act === 4 ? "🎉 Leap Day's Party" : '📜 XMAS365™ Merger Contract',
        sublabel: finaleDone ? '✓ Xmas12 · Day 366 Every Year!' : '6/6 Mascots Free · Red-Line It!',
        icon: finaleDone ? '🎉' : '📜',
        status: finaleDone ? 'done' : 'ready',
        hero: !finaleDone,
        accent: '#d69e2e',
        worldPos: bayToWorld(theta, 0, 1.02, 1.25),
        cameraPos: doorFocusPos,
        cameraLook: doorFocusLook,
        meshGroup: podiumGroup,
        onClick: () => callbacks.onOpenProto('tuesday', doorFocusPos, doorFocusLook),
      });
    }

    // In Act 4 (Leap Day's Party), all 6 freed holiday mascots + humbled CEO Santa gather in the Hall!
    if (act === 4) {
      const partySpots: readonly [RoomId, number, number, number][] = [
        ['halloween', -0.78, 1.54, 0.42],
        ['thanksgiving', -0.45, 1.62, 0.18],
        ['christmas', 0.45, 1.62, -0.18],
        ['valentines', 0.78, 1.54, -0.42],
        ['easter', -0.58, 1.12, 0.24],
        ['fourth', 0.58, 1.12, -0.24],
      ];
      for (const [pIdx, [rId, px, pz, rotY]] of partySpots.entries()) {
        const guest = buildMascotMesh(ROOM_MASCOT_ID[rId], 0.46);
        guest.position.set(px, 0.03, pz);
        guest.rotation.y = rotY;
        bay.add(guest);
        floating.push({ mesh: guest, phase: pIdx * 0.9 + 0.5, baseY: 0.03 });
      }
      const santaGuest = buildMascotMesh('santa', 0.48);
      santaGuest.position.set(0, 0.03, 0.82);
      bay.add(santaGuest);
      floating.push({ mesh: santaGuest, phase: 2.1, baseY: 0.03 });
    }
  }

  // Moody alcove wall & recessed-panel colors so each holiday feels atmospheric & candle/fire-lit
  const MOODY_WALLS: Record<RoomId, { wall: string; panel: string; frame: string }> = {
    halloween: { wall: '#463063', panel: '#35234d', frame: '#805ad5' },
    thanksgiving: { wall: '#73482d', panel: '#593620', frame: '#dd6b20' },
    christmas: { wall: '#284d3e', panel: '#1e3b30', frame: '#c53030' },
    valentines: { wall: '#632944', panel: '#4d1e34', frame: '#d53f8c' },
    easter: { wall: '#5c4d26', panel: '#473b1c', frame: '#ecc94b' },
    fourth: { wall: '#263a5e', panel: '#1c2c4a', frame: '#3182ce' },
  };

  // --- BAYS 1..6: THE SIX HOLIDAY ALCOVES AROUND HOLIDAY HALL ---
  for (const room of ROOM_SPECS) {
    const theta = getBayAngle(room.id);
    const bay = makeBayGroup(theta);
    const complete = gameState.isRoomComplete(room);
    const palette = MOODY_WALLS[room.id];

    // Moody full-height back wall, dark recessed wainscoting panel, cornice beam, and pillar
    bay.add(box(wallWidth, 5.8, 0.28, palette.wall, 0, 2.9, 0, false));
    bay.add(box(wallWidth - 0.5, 3.05, 0.05, palette.frame, 0, 2.05, 0.13, false));
    bay.add(box(wallWidth - 0.66, 2.88, 0.07, palette.panel, 0, 2.05, 0.14, false));
    bay.add(box(wallWidth, 0.34, 0.34, room.accent, 0, 0.17, 0.04, false));
    bay.add(box(wallWidth, 0.24, 0.38, '#4a3524', 0, 3.85, 0.05, false));
    bay.add(cyl(0.22, 0.26, 5.8, '#3b281a', wallWidth / 2 - 0.06, 2.9, 0.14, 12, false));

    // Holiday rug segment in front of the bay (warm inner wool so spotlight pools shine clearly)
    bay.add(box(2.5, 0.03, 2.35, room.floorColor, 0, 0.015, 1.28, false));
    bay.add(box(2.2, 0.04, 2.05, room.accent, 0, 0.02, 1.28, false));
    bay.add(box(1.95, 0.045, 1.8, '#8c6946', 0, 0.024, 1.28, false));

    // Add holiday-specific practical lighting & atmospheric props (fireplace, candles, wine, roses, lanterns)
    decorateHolidayAlcove(room.id, bay, flames, fireflies);

    // Master Holiday Lamp above the bay's centerpiece arch (uses the holiday's primary color)
    const lamp = complete
      ? glowSphere(0.2, room.accent, 0, 3.55, 0.24, 1.25)
      : sphere(0.2, '#3b4252', 0, 3.55, 0.24, false);
    bay.add(lamp);

    // String of fairy lights draped across the top of the diorama (alternating primary & secondary colors;
    // off until the room's master lamp is completed, then twinkling / slow-flashing on and off)
    for (let i = -4; i <= 4; i++) {
      const bx = i * 0.36;
      const by = 3.32 - Math.cos(i * 0.38) * 0.14;
      const bulbHex = (Math.abs(i) % 2 === 0 ? room.accent : room.secondaryAccent) as `#${string}`;
      // Small dark socket cap on the cord
      bay.add(cyl(0.022, 0.022, 0.04, '#1f2430', bx, by + 0.05, 0.23, 8, false));
      if (complete) {
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
        });
      } else {
        bay.add(sphere(0.064, '#2d3340', bx, by, 0.24, false));
      }
    }

    // TIER 1 (TOP-CENTER): THE CENTERPIECE ON A RAISED ALTAR SHELF (ly = 2.15..3.15)
    const roomUnlocked = gameState.isRoomUnlocked(room);
    const carriedUnlockItem = gameState.carriedEligibleItemForRoom(room);
    const warmupDone = gameState.solvedRuns.has(room.warmup.id);
    const cpDone = gameState.solvedRuns.has(room.centerpiece.proto.id);
    const cpUnlocked = gameState.isCenterpieceUnlocked(room);
    const cpGroup = new THREE.Group();
    cpGroup.position.set(0, 2.12, 0.36);
    cpGroup.add(box(1.24, 0.16, 0.56, '#6b4928', 0, 0, 0, false));
    cpGroup.add(box(1.12, 0.06, 0.48, '#d69e2e', 0, 0.1, 0, false));
    cpGroup.add(buildCenterpieceSculpture(room.id, room.accent, cpDone));
    bay.add(cpGroup);

    // Holiday Mascot Stage on the front-center of the rug (caged while !cpDone; freed when cpDone)
    const { stage: mascotStage, mascotMesh } = buildMascotStage(room.id, room.accent, cpDone);
    mascotStage.position.set(0, 0.02, 1.44);
    bay.add(mascotStage);
    if (cpDone) {
      floating.push({ mesh: mascotMesh, phase: theta + 1.1, baseY: 0.12 });
    }
    hotspots.push({
      id: `mascot:${room.id}`,
      bay: room.id,
      label: room.shortTitle,
      icon: room.icon,
      status: cpDone ? 'done' : 'ready',
      accent: room.accent,
      hiddenPill: true,
      worldPos: bayToWorld(theta, 0, 0.35, 1.44),
      cameraPos: bayToWorld(theta, 0, 1.65, 3.8),
      cameraLook: bayToWorld(theta, 0, 0.45, 1.44),
      meshGroup: mascotStage,
      onClick: () => {
        callbacks.onClickMascot?.(room.id);
      },
    });

    const cpFocusPos = bayToWorld(theta, 0, 2.15, 3.6);
    const cpFocusLook = bayToWorld(theta, 0, 2.35, 0.36);
    if (warmupDone) {
      hotspots.push({
        id: `proto:${room.centerpiece.proto.id}`,
        bay: room.id,
        label: cpDone
          ? `✓ ${room.centerpiece.icon} ${room.centerpiece.title}`
          : cpUnlocked
            ? `${room.centerpiece.icon} ${room.centerpiece.title}`
            : `🔒 ${room.centerpiece.title}`,
        sublabel: cpDone
          ? '★ Restored!'
          : cpUnlocked
            ? '▶ Ready to Solve!'
            : 'Restore 2 Items Below',
        icon: cpDone ? '✓' : cpUnlocked ? room.centerpiece.icon : '🔒',
        status: cpDone ? 'done' : cpUnlocked ? 'ready' : 'locked',
        accent: room.accent,
        worldPos: bayToWorld(theta, 0, 2.32, 0.62),
        cameraPos: cpFocusPos,
        cameraLook: cpFocusLook,
        meshGroup: cpGroup,
        onClick: () => {
          if (cpUnlocked) callbacks.onOpenProto(room.centerpiece.proto.id, cpFocusPos, cpFocusLook);
        },
      });
    }

    // TIER 2 (UPPER-MIDDLE LEFT & RIGHT): TWO WALL-MOUNTED NATIVE ITEM PEDESTALS (ly = 1.50..2.15)
    const pedX = [-1.14, 1.14] as const;
    room.centerpiece.requiredItems.forEach((reqId, idx) => {
      const item = STRAY_ITEMS[reqId];
      const hasItem = gameState.solvedRuns.has(item.proto.id);
      const isPlaced = gameState.placedItems.has(reqId);
      const isCarried = hasItem && !isPlaced;
      const lx = pedX[idx] ?? pedX[0];
      const lz = 0.44;

      const pg = new THREE.Group();
      pg.position.set(lx, 1.48, lz);
      pg.add(cyl(0.28, 0.16, 0.24, '#6b4928', 0, -0.06, -0.06, 14, false));
      pg.add(
        cyl(
          0.32,
          0.28,
          0.1,
          isPlaced ? '#48bb78' : isCarried ? '#f6e05e' : '#718096',
          0,
          0.08,
          0,
          14,
          false,
        ),
      );
      pg.add(cyl(0.34, 0.32, 0.06, isPlaced ? '#f6e05e' : room.accent, 0, 0.15, 0, 14, false));

      if (isPlaced) {
        const placedMesh = buildPropMesh(reqId, room.accent);
        placedMesh.position.set(0, 0.18, 0);
        pg.add(placedMesh);
        floating.push({ mesh: placedMesh, phase: idx + 0.5, baseY: 0.18 });
      } else {
        pg.add(cyl(0.18, 0.22, 0.08, isCarried ? '#ecc94b' : '#4a5568', 0, 0.2, 0, 14, false));
      }
      bay.add(pg);

      // In the Ladder UX (once warm-up is done), show both return slots with lines feeding up to the centerpiece
      if (warmupDone) {
        hotspots.push({
          id: `pedestal:${reqId}`,
          bay: room.id,
          kind: 'return-slot',
          label: `${item.icon} ${item.title}`,
          sublabel: isPlaced ? '✓ Restored' : isCarried ? '✨ Tap to Restore' : 'Return Item',
          icon: isPlaced ? '✓' : isCarried ? '✨' : item.icon,
          status: isPlaced ? 'done' : isCarried ? 'place' : 'locked',
          connections: [
            {
              targetId: `proto:${room.centerpiece.proto.id}`,
              state: isPlaced ? 'done' : isCarried ? 'place' : 'locked',
            },
          ],
          accent: isCarried ? '#d69e2e' : room.accent,
          worldPos: bayToWorld(theta, lx, 1.56, lz + 0.22),
          cameraPos: cpFocusPos,
          cameraLook: bayToWorld(theta, lx, 1.75, lz),
          meshGroup: pg,
          onClick: () => {
            if (isCarried) callbacks.onPlaceItem(reqId);
          },
        });
      }
    });

    // TIER 3 (LOWER-MIDDLE LEFT & RIGHT): TWO STRAY ITEM SIDE TABLES ON THE FLOOR (ly = 0..1.02)
    const strayUnlocked = gameState.isStrayUnlocked(room);
    const strayX = [-1.14, 1.14] as const;
    room.strays.forEach((stray, idx) => {
      const lx = strayX[idx] ?? strayX[0];
      const lz = 1.46;
      const strayDone = gameState.solvedRuns.has(stray.proto.id);
      const homeRoomSpec = ROOM_SPECS.find((r) => r.id === stray.homeRoom);

      const sg = new THREE.Group();
      sg.position.set(lx, 0, lz);
      sg.add(cyl(0.36, 0.3, 0.36, '#6b4928', 0, 0.18, 0));
      sg.add(
        cyl(
          0.38,
          0.36,
          0.06,
          strayDone ? '#68d391' : (homeRoomSpec?.accent ?? room.accent),
          0,
          0.38,
          0,
        ),
      );

      if (!strayDone) {
        const prop = buildPropMesh(stray.id, room.accent);
        prop.position.set(0, 0.42, 0);
        sg.add(prop);
        floating.push({ mesh: prop, phase: idx * 1.7, baseY: 0.42 });
      }
      bay.add(sg);

      if (warmupDone) {
        const camPos = bayToWorld(theta, lx * 0.5, 1.75, 3.8);
        const camLook = bayToWorld(theta, lx, 0.68, lz);
        hotspots.push({
          id: `proto:${stray.proto.id}`,
          bay: room.id,
          label: strayDone ? `✓ ${stray.icon} ${stray.title}` : `${stray.icon} ${stray.title}`,
          sublabel: strayDone
            ? `✓ Freed → ${homeRoomSpec?.shortTitle ?? ''}`
            : `→ ${homeRoomSpec?.shortTitle ?? ''}`,
          icon: strayDone ? '✓' : stray.icon,
          status: strayDone ? 'done' : 'ready',
          accent: homeRoomSpec?.accent ?? room.accent,
          worldPos: bayToWorld(theta, lx, 0.62, 1.52),
          cameraPos: camPos,
          cameraLook: camLook,
          meshGroup: sg,
          onClick: () => {
            if (strayUnlocked) callbacks.onOpenProto(stray.proto.id, camPos, camLook);
          },
        });
      }
    });

    // TIER 4: ROOM LOCK / ITEM UNLOCK / WARM-UP (hero in center before warm-up is beaten; green base of ladder at bottom once beaten)
    const warmupFocusPos = bayToWorld(theta, 0, 1.65, 3.8);
    const warmupFocusLook = bayToWorld(theta, 0, 1.25, 0.5);
    const centerHeroWorldPos = bayToWorld(theta, 0, 1.38, 0.75);
    if (!roomUnlocked) {
      if (carriedUnlockItem) {
        hotspots.push({
          id: `unlock:${room.id}`,
          bay: room.id,
          label: `✨ Restore ${carriedUnlockItem.icon} ${carriedUnlockItem.title}`,
          sublabel: `▶ Tap to Restore Item & Unlock ${room.shortTitle}`,
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
        const req0 = STRAY_ITEMS[room.centerpiece.requiredItems[0]];
        const req1 = STRAY_ITEMS[room.centerpiece.requiredItems[1]];
        hotspots.push({
          id: `locked:${room.id}`,
          bay: room.id,
          label: `🔒 ${room.shortTitle} Locked`,
          sublabel: `Bring ${req0.icon} ${req0.title} or ${req1.icon} ${req1.title} to unlock`,
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
      hotspots.push({
        id: `proto:${room.warmup.id}`,
        bay: room.id,
        label: `${room.icon} ${room.warmup.title}`,
        sublabel: '▶ Tap to Start Warm-up',
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
      hotspots.push({
        id: `proto:${room.warmup.id}`,
        bay: room.id,
        label: `✓ ${room.icon} ${room.warmup.title}`,
        sublabel: '✓ Warm-up Complete',
        icon: '✓',
        status: 'done',
        connections: room.strays.map((s) => ({
          targetId: `proto:${s.proto.id}`,
          state: 'done' as const,
        })),
        accent: '#2f855a',
        worldPos: bayToWorld(theta, 0, -0.02, 2.12),
        cameraPos: warmupFocusPos,
        cameraLook: warmupFocusLook,
        onClick: () => callbacks.onOpenProto(room.warmup.id, warmupFocusPos, warmupFocusLook),
      });
    }
  }

  return {
    root,
    hotspots,
    leapDayHeadWorldPos: bayToWorld(getBayAngle('hall'), 0, 0.62, 2.08),
    setDoorHop: (roomId, progress) => {
      if (!roomId) {
        activeDoorHop = null;
        hallLeapDayActor.position.copy(leapDayRestPos);
        hallLeapDayActor.rotation.set(0, 0, 0);
        hallLeapDayActor.scale.setScalar(1);
        for (const { pivot, baseRotY } of hallDoorPivots.values()) {
          pivot.rotation.y = baseRotY;
        }
        return;
      }
      activeDoorHop = { roomId, progress: Math.max(0, Math.min(1, progress)) };
    },
    setIntroPose: (mode, elapsed) => {
      activeIntroPose = { mode, elapsed };
    },
    animate: (t, activeBay) => {
      void floating;
      // Animate Leap Day in Holiday Hall (door hop, intro pop-out, or idle breathing)
      if (activeDoorHop) {
        const doorTarget = hallDoorTargets.get(activeDoorHop.roomId) ?? leapDayRestPos;
        // For second-floor doors, head calmly toward the foot of the left staircase;
        // fade-out happens before Leap Day reaches the door or stairs so speed stays slow.
        const headingTarget =
          doorTarget.y > 1.2 ? new THREE.Vector3(-1.54, 0.14, 1.58) : doorTarget;
        const p = activeDoorHop.progress;
        const ease = p * p * (3 - 2 * p);
        hallLeapDayActor.visible = true;
        hallFloorSlip.visible = false;

        const fullDist = leapDayRestPos.distanceTo(headingTarget);
        const maxTravel = 0.72;
        const travelFraction = fullDist > 0.001 ? Math.min(1, maxTravel / fullDist) * ease : 0;
        hallLeapDayActor.position.lerpVectors(leapDayRestPos, headingTarget, travelFraction);

        const hopArc = Math.abs(Math.sin(p * Math.PI * 1.5)) * 0.15;
        hallLeapDayActor.position.y += hopArc;
        const dx = headingTarget.x - leapDayRestPos.x;
        const dz = headingTarget.z - leapDayRestPos.z;
        hallLeapDayActor.rotation.y = Math.atan2(dx, dz) * Math.min(1, p * 2.2);
        hallLeapDayActor.rotation.x = Math.cos(p * Math.PI * 1.5) * 0.09;

        const doorEntry = hallDoorPivots.get(activeDoorHop.roomId);
        if (doorEntry) {
          doorEntry.pivot.rotation.y = THREE.MathUtils.lerp(
            doorEntry.baseRotY,
            -0.95,
            Math.min(1, p * 1.3),
          );
        }
      } else if (activeIntroPose) {
        if (activeIntroPose.mode === 'hidden') {
          hallLeapDayActor.visible = false;
          hallFloorSlip.visible = false;
        } else if (activeIntroPose.mode === 'pop') {
          const e = Math.max(0, activeIntroPose.elapsed);
          hallFloorSlip.visible = true;
          hallLeapDayActor.visible = true;
          const popT = Math.min(1, e / 0.75);
          const popScale =
            popT < 1 ? popT * popT * (2.5 - 1.5 * popT) : 1 + Math.sin((e - 0.75) * 2.6) * 0.025;
          hallLeapDayActor.scale.setScalar(Math.max(0.01, popScale));
          // Calm, unhurried hops on the foyer rug with a brief rest between each hop
          const cyclePos = Math.max(0, e - 0.75) * 0.78;
          const hopIndex = Math.floor(cyclePos);
          const hopPhase = cyclePos - hopIndex;
          // Spend the first 52% of each cycle in a gentle hop, and 48% resting on the rug
          const inAir = hopPhase < 0.52 ? hopPhase / 0.52 : 0;
          const hopHeight =
            e < 0.75
              ? Math.sin(popT * Math.PI) * 0.34
              : inAir > 0
                ? Math.sin(inAir * Math.PI) * 0.16
                : 0;
          const roamAngle = Math.max(0, e - 0.75) * 0.55;
          const roamRadius = Math.min(0.16, Math.max(0, (e - 0.75) * 0.08));
          hallLeapDayActor.position.set(
            leapDayRestPos.x + Math.sin(roamAngle) * roamRadius,
            leapDayRestPos.y + hopHeight,
            leapDayRestPos.z + (Math.cos(roamAngle) - 1) * roamRadius * 0.4,
          );
          hallLeapDayActor.rotation.y = Math.sin(roamAngle) * 0.28;
          hallLeapDayActor.rotation.x = inAir > 0 ? Math.cos(inAir * Math.PI) * 0.08 : 0;
        } else {
          hallFloorSlip.visible = false;
          hallLeapDayActor.visible = true;
          hallLeapDayActor.scale.setScalar(1);
          hallLeapDayActor.position.set(
            leapDayRestPos.x,
            leapDayRestPos.y + Math.abs(Math.sin(t * 1.15)) * 0.016,
            leapDayRestPos.z,
          );
          hallLeapDayActor.rotation.set(0, Math.sin(t * 0.55) * 0.05, 0);
        }
      } else {
        hallLeapDayActor.visible = true;
        hallLeapDayActor.scale.setScalar(1);
        hallLeapDayActor.position.set(
          leapDayRestPos.x,
          leapDayRestPos.y + Math.abs(Math.sin(t * 1.15)) * 0.016,
          leapDayRestPos.z,
        );
        hallLeapDayActor.rotation.set(0, Math.sin(t * 0.55) * 0.05, 0);
      }

      // Subtle flame flicker + rising ember/spark particles on candles and the fireplace
      for (const fl of flames) {
        if (fl.particle) {
          const p = fl.particle;
          const u = (t * p.speed + fl.phase) % 1;
          const env = Math.sin(u * Math.PI);
          fl.mesh.position.y = fl.baseY + u * p.rise;
          fl.mesh.position.x = p.baseX + Math.sin(u * Math.PI * 2 + fl.phase * 3.1) * p.sway;
          fl.mesh.position.z =
            p.baseZ + Math.cos(u * Math.PI * 1.5 + fl.phase * 2.3) * p.sway * 0.4;
          fl.mesh.scale.setScalar(Math.max(0.001, p.scale * env));
          continue;
        }
        const f1 = Math.sin(t * 7.5 + fl.phase * 2.1);
        const f2 = Math.cos(t * 12.8 + fl.phase * 3.7);
        const f3 = Math.sin(t * 18.2 + fl.phase * 1.3);
        const flicker = f1 * 0.07 + f2 * 0.045 + f3 * 0.025;
        const sx = fl.baseScaleX ?? 1;
        const sy = fl.baseScaleY ?? 1;
        const sz = fl.baseScaleZ ?? 1;
        const sway = fl.swayScale ?? 1;
        fl.mesh.position.y = fl.baseY + flicker * 0.05;
        fl.mesh.scale.set(sx * (1 - flicker * 0.1 * sway), sy * (1 + flicker * 0.24 * sway), sz);
        fl.mesh.rotation.z = f2 * 0.05 * sway;
      }
      for (const ff of fireflies) {
        ff.mesh.position.x = ff.baseX + Math.sin(t * 0.9 + ff.phase) * 0.06;
        ff.mesh.position.y = ff.baseY + Math.cos(t * 1.1 + ff.phase) * 0.05;
      }
      // Twinkle / slow-flash the upper fairy light strings in completed rooms
      for (const fl of fairyLights) {
        const wave = 0.5 + 0.5 * Math.sin(t * 2.1 + fl.phase) * Math.cos(t * 0.85 - fl.phase * 0.5);
        const on = THREE.MathUtils.smoothstep(wave, 0.22, 0.82);
        fl.mat.color.copy(fl.offColor).lerp(fl.baseColor, 0.2 + 0.8 * on);
        fl.mat.emissiveIntensity = on * 1.3;
      }
      // Position the single shadow-casting diorama light at the active bay's light source
      const mood = getBayLightMood(activeBay);
      const theta = getBayAngle(activeBay);
      const [lx, ly, lz] = mood.lightLocalPos;
      const wave = Math.sin(t * 6.5) * 0.14 + Math.cos(t * 11.8) * 0.08 + Math.sin(t * 17.5) * 0.04;
      dioramaLight.position.copy(bayToWorld(theta, lx, ly, lz));
      dioramaLight.color.setHex(hexToNumber(mood.lightColor as `#${string}`));
      dioramaLight.distance = mood.lightDistance;
      dioramaLight.intensity = mood.lightIntensity * (1 + wave * 0.1);
    },
  };
}
