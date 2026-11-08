/**
 * Procedural low-poly 3D mascot models for Puzz, built from crisp cel-shaded
 * Three.js primitives (matching the style of the 12 stray item props and
 * 6 holiday centerpieces in `diorama.ts`).
 *
 * Because each body part, garment layer, hat brim, buckle, lapel, necktie,
 * and facial feature is a separate primitive mesh with its own surface normals,
 * the screen-space `Outline` pass automatically draws crisp cartoon ink lines
 * around every detail with zero voxel stair-stepping.
 */
import * as THREE from 'three';
import { type Hex, hexToNumber, voxel } from '../content/palettes';
import { toonMaterial } from '../render/toon';
import type { RoomId } from './state';

export type MascotId =
  'bear' | 'bunny' | 'eaglet' | 'leapday' | 'santa' | 'snowman' | 'spider' | 'turkey';

export const MASCOT_IDS: readonly MascotId[] = [
  'bear',
  'bunny',
  'eaglet',
  'leapday',
  'santa',
  'snowman',
  'spider',
  'turkey',
];

export const ROOM_MASCOT_ID: Record<RoomId, MascotId> = {
  halloween: 'spider',
  thanksgiving: 'turkey',
  christmas: 'snowman',
  valentines: 'bear',
  easter: 'bunny',
  fourth: 'eaglet',
};

const matCache = new Map<string, THREE.MeshToonMaterial>();
function mat(hex: string): THREE.MeshToonMaterial {
  let m = matCache.get(hex);
  if (!m) {
    m = toonMaterial({ color: hexToNumber(hex as Hex) });
    matCache.set(hex, m);
  }
  return m;
}

function box(w: number, h: number, d: number, hex: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
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
  seg = 16,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function sphere(r: number, hex: string, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), mat(hex));
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cone(r: number, h: number, hex: string, x = 0, y = 0, z = 0, seg = 16): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function torus(
  r: number,
  tube: number,
  hex: string,
  x = 0,
  y = 0,
  z = 0,
  arc = Math.PI * 2,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 20, arc), mat(hex));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Build a 3D extruded heart mesh centered at (0, 0, 0). */
function heartMesh(size: number, depth: number, hex: string): THREE.Mesh {
  const s = size;
  const shape = new THREE.Shape();
  shape.moveTo(0, -s * 0.85);
  shape.bezierCurveTo(-s * 0.15, -s * 0.9, -s * 1.05, -s * 0.2, -s * 1.05, s * 0.35);
  shape.bezierCurveTo(-s * 1.05, s * 0.85, -s * 0.35, s * 0.95, 0, s * 0.42);
  shape.bezierCurveTo(s * 0.35, s * 0.95, s * 1.05, s * 0.85, s * 1.05, s * 0.35);
  shape.bezierCurveTo(s * 1.05, -s * 0.2, s * 0.15, -s * 0.9, 0, -s * 0.85);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.3,
    bevelSize: s * 0.08,
    bevelSegments: 2,
  });
  geo.center();
  const m = new THREE.Mesh(geo, mat(hex));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function buildMascotMesh(id: MascotId, scale = 1): THREE.Group {
  const g = new THREE.Group();

  switch (id) {
    case 'santa': {
      // Santa, CEO of XMAS365: classic portly Santa shape & full white beard,
      // in a tailored red business suit with crisp white V-shirt, angled lapels,
      // gold CEO lapel pin, bold green necktie, and no hat (bald crown + white hair fringe).

      // 1. Polished black dress shoes + stout red business-suit trouser legs
      for (const side of [-1, 1] as const) {
        const sx = side * 0.125;
        const shoe = sphere(0.085, voxel.ink, sx, 0.055, 0.04, 0.95, 0.68, 1.45);
        const heel = cyl(0.068, 0.072, 0.07, voxel.ink, sx, 0.04, -0.02, 12);
        const leg = cyl(0.088, 0.08, 0.18, voxel.red, sx, 0.15, 0, 14);
        const cuff = cyl(0.092, 0.092, 0.032, voxel.red, sx, 0.09, 0, 14);
        g.add(shoe, heel, leg, cuff);
      }

      // 2. Classic portly round Santa belly in a tailored red business suit jacket
      const belly = sphere(0.28, voxel.red, 0, 0.38, 0, 1.08, 0.96, 0.96);
      const jacketSkirt = cyl(0.27, 0.295, 0.14, voxel.red, 0, 0.25, 0, 18);
      jacketSkirt.scale.set(1.06, 1, 0.94);
      g.add(belly, jacketSkirt);
      // Dark center suit-jacket hem split at the bottom front
      g.add(box(0.02, 0.09, 0.04, voxel.ink, 0, 0.21, 0.26));

      // 3. Crisp white dress-shirt V-plastron, angled red suit lapels & green necktie
      //    mounted in a chest group flush against the upper belly under the beard.
      const chestGroup = new THREE.Group();
      chestGroup.position.set(0, 0.41, 0.242);
      chestGroup.rotation.x = -0.08;

      const shirtShape = new THREE.Shape();
      shirtShape.moveTo(-0.115, 0.14);
      shirtShape.lineTo(0.115, 0.14);
      shirtShape.lineTo(0.032, -0.13);
      shirtShape.lineTo(-0.032, -0.13);
      shirtShape.closePath();
      const shirtFront = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shirtShape, { depth: 0.05, bevelEnabled: false }),
        mat(voxel.white),
      );
      shirtFront.position.set(0, 0, -0.032);
      shirtFront.castShadow = true;
      shirtFront.receiveShadow = true;
      chestGroup.add(shirtFront);

      // 4. Sharp angled red suit lapels framing the white shirt V (\ /) + gold CEO lapel pin
      for (const side of [-1, 1] as const) {
        const lapel = box(0.054, 0.27, 0.026, voxel.red, side * 0.082, 0.005, 0.014);
        lapel.rotation.z = -side * 0.29;
        lapel.rotation.y = side * 0.15;
        chestGroup.add(lapel);
      }
      // Gold CEO lapel pin on Santa's left lapel
      chestGroup.add(sphere(0.022, voxel.gold, 0.095, 0.035, 0.028, 1, 1, 0.6));

      // 5. Bold Green CEO Necktie (distinct knot + tapered diamond-tip blade hugging the chest)
      const tieKnot = cyl(0.034, 0.024, 0.048, voxel.green, 0, 0.095, 0.022, 6);
      tieKnot.scale.set(1.1, 1, 0.65);
      chestGroup.add(tieKnot);

      const tieShape = new THREE.Shape();
      tieShape.moveTo(-0.024, 0.075);
      tieShape.lineTo(0.024, 0.075);
      tieShape.lineTo(0.042, -0.1);
      tieShape.lineTo(0, -0.155);
      tieShape.lineTo(-0.042, -0.1);
      tieShape.closePath();
      const tieBlade = new THREE.Mesh(
        new THREE.ExtrudeGeometry(tieShape, {
          depth: 0.022,
          bevelEnabled: true,
          bevelThickness: 0.004,
          bevelSize: 0.004,
          bevelSegments: 1,
        }),
        mat(voxel.green),
      );
      tieBlade.position.set(0, 0, 0.012);
      tieBlade.castShadow = true;
      tieBlade.receiveShadow = true;
      chestGroup.add(tieBlade);

      g.add(chestGroup);

      // 6. Red business-suit sleeves, crisp white shirt cuffs & warm skin hands
      for (const side of [-1, 1] as const) {
        const armGroup = new THREE.Group();
        armGroup.position.set(side * 0.27, 0.48, 0);
        armGroup.rotation.z = side * 0.22;
        armGroup.add(sphere(0.082, voxel.red, 0, 0, 0));
        armGroup.add(cyl(0.076, 0.068, 0.2, voxel.red, 0, -0.1, 0, 12));
        armGroup.add(cyl(0.071, 0.071, 0.038, voxel.white, 0, -0.2, 0, 12));
        armGroup.add(sphere(0.058, voxel.skin, 0, -0.24, 0.01, 0.95, 0.9, 1.05));
        g.add(armGroup);
      }

      // 7. Big round Santa head (no hat!): warm skin crown + white hair fringe round sides & back
      const headY = 0.74;
      g.add(sphere(0.21, voxel.skin, 0, headY, 0, 1.04, 0.98, 0.98));
      // White horseshoe hair fringe around the temples and back of the head
      g.add(sphere(0.2, voxel.white, 0, headY - 0.02, -0.055, 1.08, 0.88, 0.95));
      for (const side of [-1, 1] as const) {
        g.add(sphere(0.085, voxel.white, side * 0.185, headY - 0.01, 0.01, 0.72, 1.05, 1.1));
        g.add(sphere(0.072, voxel.white, side * 0.17, headY - 0.06, 0.06, 0.68, 0.9, 0.95));
      }

      // 8. Classic full cascading white Santa beard & swooping handlebar mustache
      //    (sculpted to sit above y = 0.51 so the white shirt & green tie read 100% clearly below!)
      g.add(sphere(0.175, voxel.white, 0, 0.63, 0.095, 1.18, 0.78, 0.85));
      for (const side of [-1, 1] as const) {
        g.add(sphere(0.115, voxel.white, side * 0.11, 0.64, 0.09, 0.95, 0.85, 0.82));
      }
      g.add(sphere(0.115, voxel.white, 0, 0.565, 0.145, 1.08, 0.75, 0.78));
      // Swooping handlebar mustache wings under the nose
      for (const side of [-1, 1] as const) {
        const stache = sphere(0.068, voxel.white, side * 0.068, 0.695, 0.195, 1.35, 0.58, 0.68);
        stache.rotation.z = -side * 0.22;
        g.add(stache);
      }

      // 9. Jolly pink nose, rosy cheeks, deep dot eyes, and bushy white eyebrows
      g.add(sphere(0.046, voxel.pink, 0, 0.728, 0.215, 1.08, 0.95, 1.05));
      for (const side of [-1, 1] as const) {
        g.add(sphere(0.036, voxel.pink, side * 0.125, 0.715, 0.175, 1.1, 0.8, 0.6));
        g.add(sphere(0.026, voxel.eye, side * 0.075, 0.768, 0.195, 0.9, 1.15, 0.7));
        const brow = box(0.072, 0.024, 0.028, voxel.white, side * 0.078, 0.812, 0.195);
        brow.rotation.z = side * 0.14;
        g.add(brow);
      }
      break;
    }

    case 'leapday': {
      // Leap Day: cute determined green frog in oversized round brass glasses

      // 1. Plump sitting frog body + crisp oval cream belly patch
      g.add(sphere(0.24, voxel.green, 0, 0.25, -0.01, 1.08, 0.95, 0.96));
      g.add(sphere(0.165, voxel.bone, 0, 0.235, 0.125, 0.96, 0.86, 0.65));

      // 2. Folded hind legs on the flanks + 3-toed webbed feet & stubby front arms
      for (const side of [-1, 1] as const) {
        const thigh = sphere(0.115, voxel.green, side * 0.21, 0.14, -0.02, 0.85, 0.95, 1.25);
        thigh.rotation.y = -side * 0.2;
        const foot = sphere(0.085, voxel.green, side * 0.2, 0.045, 0.09, 1.15, 0.45, 1.45);
        const arm = cyl(0.048, 0.042, 0.18, voxel.green, side * 0.15, 0.14, 0.11, 10);
        arm.rotation.z = -side * 0.18;
        arm.rotation.x = 0.25;
        const hand = sphere(0.052, voxel.green, side * 0.135, 0.045, 0.15, 1.1, 0.45, 1.2);
        g.add(thigh, foot, arm, hand);
      }

      // 3. Wide chibi frog head + raised top eye domes + determined frog smile flush on snout
      const headY = 0.48;
      g.add(sphere(0.23, voxel.green, 0, headY, 0.0, 1.22, 0.84, 0.94));
      // Flush frog mouth smile across the front of the snout
      for (const sx of [-0.075, -0.038, 0, 0.038, 0.075]) {
        const sy = headY - 0.048 + sx * sx * 2.4;
        const sz = 0.212 - sx * sx * 1.2;
        g.add(sphere(0.014, voxel.ink, sx, sy, sz, 1.2, 0.8, 0.6));
      }

      for (const side of [-1, 1] as const) {
        const ex = side * 0.115;
        const ey = headY + 0.125;
        // Raised green frog eye socket dome
        g.add(sphere(0.082, voxel.green, ex, ey, 0.04, 1.0, 1.0, 0.9));
        // Rosy cheek blush
        g.add(sphere(0.032, voxel.pink, side * 0.185, headY - 0.02, 0.165, 1.1, 0.75, 0.5));
      }

      // 4. Signature oversized round brass glasses sitting cleanly in front of the eyes
      const glassY = headY + 0.085;
      const glassZ = 0.205;
      for (const side of [-1, 1] as const) {
        const gx = side * 0.115;
        const rim = torus(0.076, 0.016, voxel.brass, gx, glassY, glassZ);
        const lens = cyl(0.07, 0.07, 0.014, voxel.glass, gx, glassY, glassZ - 0.003, 20);
        lens.rotation.x = Math.PI / 2;
        const pupil = sphere(0.032, voxel.eye, gx, glassY, glassZ + 0.008, 1, 1.1, 0.45);
        const temple = box(0.016, 0.016, 0.14, voxel.brass, side * 0.19, glassY, glassZ - 0.075);
        g.add(rim, lens, pupil, temple);
      }
      // Brass nose bridge bar connecting the two round rims
      g.add(box(0.082, 0.018, 0.018, voxel.brass, 0, glassY + 0.005, glassZ + 0.005));
      break;
    }

    case 'spider': {
      // Halloween mascot: cute round Spider in a tilted purple witch's hat with orange band & brass buckle

      // 1. Plump fuzzy-looking dark round body + raised back abdomen with orange hourglass accent
      const bodyY = 0.25;
      g.add(sphere(0.24, voxel.ink, 0, bodyY, 0.02, 1.12, 0.92, 1.05));
      g.add(sphere(0.19, voxel.ink, 0, bodyY + 0.05, -0.14, 1.05, 0.95, 1.05));
      g.add(sphere(0.065, voxel.orange, 0, bodyY + 0.12, -0.26, 0.85, 1.1, 0.5));

      // 2. Eight (4 per side) cute arched stubby spider legs, fanned forward-to-back and staggered
      //    in lateral reach so all 8 legs silhouette distinctly from front, 3/4, and side angles.
      const legRootY = bodyY - 0.02;
      const footY = -legRootY + 0.022;
      const legSpecs = [
        { lz: 0.11, yaw: 0.58, rx: 0.175, kneeX: 0.095, kneeY: 0.045, footX: 0.145 },
        { lz: 0.038, yaw: 0.2, rx: 0.2, kneeX: 0.115, kneeY: 0.065, footX: 0.175 },
        { lz: -0.038, yaw: -0.2, rx: 0.205, kneeX: 0.135, kneeY: 0.075, footX: 0.205 },
        { lz: -0.11, yaw: -0.56, rx: 0.185, kneeX: 0.15, kneeY: 0.055, footX: 0.225 },
      ] as const;
      for (const side of [-1, 1] as const) {
        for (const sp of legSpecs) {
          const legPivot = new THREE.Group();
          legPivot.position.set(side * sp.rx, legRootY, sp.lz);
          legPivot.rotation.y = -side * sp.yaw;

          const kx = side * sp.kneeX;
          const ky = sp.kneeY;
          const fx = side * sp.footX;
          const fy = footY;

          const upLen = Math.hypot(kx, ky);
          const upper = cyl(0.025, 0.027, upLen, voxel.ink, kx * 0.5, ky * 0.5, 0, 10);
          upper.rotation.z = Math.atan2(-kx, ky);

          const knee = sphere(0.026, voxel.ink, kx, ky, 0);

          const lowDx = kx - fx;
          const lowDy = ky - fy;
          const lowLen = Math.hypot(lowDx, lowDy);
          const lower = cyl(
            0.024,
            0.02,
            lowLen,
            voxel.ink,
            (kx + fx) * 0.5,
            (ky + fy) * 0.5,
            0,
            10,
          );
          lower.rotation.z = Math.atan2(-lowDx, lowDy);

          const foot = sphere(0.027, voxel.ink, fx, fy, 0, 1.15, 0.72, 1.15);
          legPivot.add(upper, knee, lower, foot);
          g.add(legPivot);
        }
      }

      // 3. Big golden eyes + smaller secondary spider eyes + cute stubby pedipalps/fangs
      for (const side of [-1, 1] as const) {
        g.add(sphere(0.048, voxel.gold, side * 0.082, bodyY + 0.03, 0.23, 1, 1.1, 0.65));
        g.add(sphere(0.024, voxel.eye, side * 0.082, bodyY + 0.03, 0.262, 1, 1.1, 0.5));
        g.add(sphere(0.026, voxel.gold, side * 0.155, bodyY + 0.045, 0.195, 1, 1, 0.6));
        const fang = cone(0.022, 0.055, voxel.bone, side * 0.048, bodyY - 0.045, 0.258, 10);
        fang.rotation.x = Math.PI - 0.2;
        g.add(fang);
      }

      // 4. Signature tilted Purple Witch's Hat with orange band & brass buckle
      const hat = new THREE.Group();
      hat.position.set(0, bodyY + 0.18, 0.01);
      hat.rotation.z = -0.08;
      hat.rotation.x = -0.06;

      // Wide curved witch-hat brim
      const brim = cyl(0.36, 0.38, 0.036, voxel.purple, 0, 0, 0, 20);
      const brimLip = torus(0.365, 0.018, voxel.purple, 0, 0, 0);
      brimLip.rotation.x = Math.PI / 2;
      hat.add(brim, brimLip);

      // Orange hatband around the base of the crown + brass buckle in front
      hat.add(cyl(0.205, 0.215, 0.065, voxel.orange, 0, 0.045, 0, 16));
      hat.add(box(0.095, 0.078, 0.028, voxel.brass, 0, 0.048, 0.205));
      hat.add(box(0.048, 0.038, 0.032, voxel.ink, 0, 0.048, 0.207));

      // Tall tapered purple cone crown + bent crooked tip
      hat.add(cone(0.2, 0.36, voxel.purple, 0, 0.23, 0, 16));
      const tip = cone(0.085, 0.18, voxel.purple, 0.045, 0.42, -0.02, 12);
      tip.rotation.z = -0.52;
      tip.rotation.x = -0.2;
      hat.add(tip);

      g.add(hat);
      break;
    }

    case 'turkey': {
      // Thanksgiving mascot: plump Turkey with fanned autumn tail & tall Pilgrim buckle hat

      // 1. Golden bird feet & legs
      for (const side of [-1, 1] as const) {
        const lx = side * 0.095;
        g.add(cyl(0.026, 0.024, 0.12, voxel.gold, lx, 0.07, 0.02, 10));
        g.add(sphere(0.055, voxel.gold, lx, 0.024, 0.055, 1.15, 0.42, 1.45));
      }

      // 2. Signature Fanned Tail of 7 individual overlapping autumn feathers in back
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, 0.36, -0.17);
      tailGroup.rotation.x = -0.14;
      const featherColors = [
        voxel.red,
        voxel.orange,
        voxel.gold,
        voxel.red,
        voxel.gold,
        voxel.orange,
        voxel.red,
      ];
      for (let i = 0; i < 7; i++) {
        const frac = (i - 3) / 3;
        const ang = -frac * 0.98;
        const fPivot = new THREE.Group();
        fPivot.rotation.z = ang;
        fPivot.position.z = -Math.abs(i - 3) * 0.008;

        const feather = sphere(0.09, featherColors[i] ?? voxel.red, 0, 0.22, 0, 0.92, 2.25, 0.24);
        const innerBand = sphere(
          0.055,
          i % 2 === 0 ? voxel.gold : voxel.woodDark,
          0,
          0.28,
          0.016,
          0.88,
          1.25,
          0.2,
        );
        fPivot.add(feather, innerBand);
        tailGroup.add(fPivot);
      }
      g.add(tailGroup);

      // 3. Plump brown feathered body, warm tan breast, & tucked dark-brown wings
      g.add(sphere(0.24, voxel.wood, 0, 0.31, 0.02, 1.05, 0.96, 1.04));
      g.add(sphere(0.185, voxel.brass, 0, 0.3, 0.095, 0.92, 0.86, 0.78));
      for (const side of [-1, 1] as const) {
        const wing = sphere(0.12, voxel.woodDark, side * 0.215, 0.31, 0.01, 0.48, 0.95, 1.25);
        wing.rotation.z = side * 0.18;
        wing.rotation.x = 0.15;
        g.add(wing);
      }

      // 4. Round brown head, conical golden beak, red teardrop wattle, & dot eyes
      const headY = 0.56;
      const headZ = 0.09;
      g.add(sphere(0.155, voxel.wood, 0, headY, headZ, 1.02, 0.98, 1.0));
      const beak = cone(0.052, 0.12, voxel.gold, 0, headY - 0.01, headZ + 0.175, 12);
      beak.rotation.x = Math.PI / 2;
      g.add(beak);
      // Red turkey wattle hanging beside the beak
      g.add(sphere(0.042, voxel.red, 0.042, headY - 0.055, headZ + 0.155, 0.75, 1.45, 0.8));
      for (const side of [-1, 1] as const) {
        g.add(sphere(0.025, voxel.eye, side * 0.068, headY + 0.025, headZ + 0.135, 0.9, 1.1, 0.6));
      }

      // 5. Signature Tall Pilgrim Buckle Hat
      const hat = new THREE.Group();
      hat.position.set(0, headY + 0.12, headZ - 0.01);
      hat.rotation.x = -0.08;
      hat.add(cyl(0.24, 0.25, 0.032, voxel.ink, 0, 0, 0, 18));
      hat.add(cyl(0.125, 0.155, 0.24, voxel.ink, 0, 0.12, 0, 16));
      hat.add(cyl(0.152, 0.158, 0.048, voxel.orange, 0, 0.038, 0, 16));
      hat.add(box(0.082, 0.068, 0.025, voxel.gold, 0, 0.042, 0.152));
      hat.add(box(0.042, 0.034, 0.03, voxel.ink, 0, 0.042, 0.154));
      g.add(hat);
      break;
    }

    case 'snowman': {
      // Christmas mascot: cheerful Snowman with stacked snowballs, red scarf,
      // green mittens, orange carrot nose & stovepipe top hat

      // 1. Three stacked snowballs (wide base, middle torso with coal buttons, head)
      g.add(sphere(0.26, voxel.white, 0, 0.22, 0, 1.08, 0.9, 1.08));
      g.add(sphere(0.205, voxel.white, 0, 0.49, 0, 1.04, 0.92, 1.04));
      const headY = 0.73;
      g.add(sphere(0.165, voxel.white, 0, headY, 0, 1.02, 0.96, 1.02));

      // Three coal buttons down the middle snowball
      for (const [by, bz] of [
        [0.52, 0.198],
        [0.44, 0.208],
        [0.36, 0.195],
      ] as const) {
        g.add(sphere(0.026, voxel.ink, 0, by, bz, 1, 1, 0.65));
      }

      // 2. Cozy red wool scarf wrapped around the neck + hanging fringed tail
      const scarfRing = torus(0.152, 0.042, voxel.red, 0, 0.61, 0.01);
      scarfRing.rotation.x = Math.PI / 2 + 0.06;
      g.add(scarfRing);
      const scarfTail = box(0.068, 0.19, 0.036, voxel.red, -0.085, 0.51, 0.175);
      scarfTail.rotation.z = 0.14;
      scarfTail.rotation.x = -0.18;
      g.add(scarfTail);

      // 3. Green winter mitten arms on the left & right sides
      for (const side of [-1, 1] as const) {
        const arm = new THREE.Group();
        arm.position.set(side * 0.19, 0.52, 0);
        arm.rotation.z = side * 0.45;
        arm.add(cyl(0.022, 0.026, 0.14, voxel.woodDark, side * 0.04, -0.02, 0, 8));
        arm.add(cyl(0.048, 0.045, 0.035, voxel.white, side * 0.06, -0.08, 0, 10));
        arm.add(sphere(0.058, voxel.green, side * 0.075, -0.13, 0.01, 0.95, 1.15, 0.85));
        arm.add(sphere(0.028, voxel.green, side * 0.035, -0.11, 0.045));
        g.add(arm);
      }

      // 4. Prominent orange carrot nose + coal dot eyes & cheerful coal smile
      const carrot = cone(0.04, 0.17, voxel.orange, 0, headY - 0.01, 0.22, 12);
      carrot.rotation.x = Math.PI / 2;
      g.add(carrot);
      for (const side of [-1, 1] as const) {
        g.add(sphere(0.025, voxel.eye, side * 0.065, headY + 0.035, 0.152, 1, 1.1, 0.6));
      }
      for (const sx of [-0.055, -0.02, 0.02, 0.055]) {
        const sy = headY - 0.065 + Math.abs(sx) * 0.35;
        g.add(sphere(0.014, voxel.ink, sx, sy, 0.155));
      }

      // 5. Classic Black Stovepipe Top Hat with red ribbon band & holly sprig
      const hat = new THREE.Group();
      hat.position.set(0, headY + 0.135, 0);
      hat.rotation.z = -0.06;
      hat.rotation.x = -0.05;
      hat.add(cyl(0.22, 0.23, 0.032, voxel.ink, 0, 0, 0, 18));
      hat.add(cyl(0.148, 0.138, 0.22, voxel.ink, 0, 0.11, 0, 16));
      hat.add(cyl(0.144, 0.142, 0.045, voxel.red, 0, 0.036, 0, 16));
      // Green holly leaf + red berry accent on the hatband
      hat.add(sphere(0.032, voxel.green, 0.11, 0.045, 0.1, 1.3, 0.65, 0.6));
      hat.add(sphere(0.02, voxel.red, 0.09, 0.045, 0.12));
      g.add(hat);
      break;
    }

    case 'bear': {
      // Valentine's mascot: warm brown Teddy Bear with round ears & a big red heart on its tummy

      // 1. Stubby plush legs with pink paw pads
      for (const side of [-1, 1] as const) {
        const lx = side * 0.125;
        g.add(cyl(0.082, 0.088, 0.16, voxel.wood, lx, 0.09, 0, 14));
        g.add(sphere(0.088, voxel.wood, lx, 0.055, 0.045, 1.02, 0.68, 1.25));
        g.add(sphere(0.048, voxel.pinkLight, lx, 0.055, 0.145, 1, 0.85, 0.35));
      }

      // 2. Plump honey-brown teddy body + cream tummy patch + 3D extruded Ruby Heart emblem
      g.add(sphere(0.245, voxel.wood, 0, 0.34, 0, 1.06, 1.02, 0.96));
      g.add(sphere(0.19, voxel.bone, 0, 0.33, 0.065, 0.98, 0.92, 0.82));

      const tummyHeart = heartMesh(0.105, 0.035, voxel.red);
      tummyHeart.position.set(0, 0.34, 0.225);
      tummyHeart.rotation.x = -0.06;
      g.add(tummyHeart);

      // 3. Open hug-ready teddy arms with pink paw pads
      for (const side of [-1, 1] as const) {
        const arm = new THREE.Group();
        arm.position.set(side * 0.23, 0.42, 0.02);
        arm.rotation.z = side * 0.42;
        arm.rotation.x = 0.25;
        arm.add(cyl(0.068, 0.062, 0.18, voxel.wood, 0, -0.07, 0, 12));
        arm.add(sphere(0.068, voxel.wood, 0, -0.16, 0));
        arm.add(sphere(0.038, voxel.pinkLight, 0, -0.16, 0.055, 1, 1, 0.4));
        g.add(arm);
      }

      // 4. Big round teddy head, round ears with pink inner cups, cream snout & button nose
      const headY = 0.66;
      g.add(sphere(0.215, voxel.wood, 0, headY, 0.01, 1.06, 0.98, 0.98));

      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.175, headY + 0.165, -0.01);
        ear.rotation.z = -side * 0.25;
        ear.add(sphere(0.082, voxel.wood, 0, 0, 0, 1, 1, 0.55));
        ear.add(sphere(0.05, voxel.pink, 0, -0.005, 0.028, 1, 1, 0.45));
        g.add(ear);

        // Glossy dot eyes & rosy cheeks
        g.add(sphere(0.027, voxel.eye, side * 0.078, headY + 0.035, 0.195, 0.95, 1.1, 0.6));
        g.add(sphere(0.034, voxel.pink, side * 0.135, headY - 0.02, 0.175, 1.1, 0.75, 0.5));
      }

      // Cream muzzle snout + dark brown nose + vertical philtrum stitch
      g.add(sphere(0.088, voxel.bone, 0, headY - 0.035, 0.175, 1.18, 0.85, 0.78));
      g.add(sphere(0.034, voxel.ink, 0, headY - 0.005, 0.238, 1.2, 0.85, 0.75));
      g.add(box(0.014, 0.042, 0.014, voxel.ink, 0, headY - 0.042, 0.232));
      break;
    }

    case 'bunny': {
      // Easter mascot: snow-white Easter Bunny with tall upright pink-lined ears & fluffy tail

      // 1. Wide hop-ready hind feet with pink pads
      for (const side of [-1, 1] as const) {
        const lx = side * 0.115;
        g.add(sphere(0.11, voxel.white, lx, 0.11, 0, 0.85, 0.95, 1.05));
        g.add(sphere(0.082, voxel.white, lx, 0.045, 0.065, 0.95, 0.5, 1.45));
        g.add(sphere(0.042, voxel.pink, lx, 0.048, 0.172, 1, 0.75, 0.35));
      }

      // 2. Plump snow-white bunny body, soft cream belly & fluffy cotton tail in back
      g.add(sphere(0.22, voxel.white, 0, 0.31, 0, 1.02, 1.05, 0.96));
      g.add(sphere(0.165, voxel.bone, 0, 0.3, 0.075, 0.92, 0.92, 0.75));
      g.add(sphere(0.088, voxel.white, 0, 0.2, -0.21, 1.05, 1.05, 1.05));

      // Stubby front bunny paws held near the chest
      for (const side of [-1, 1] as const) {
        const arm = cyl(0.052, 0.046, 0.16, voxel.white, side * 0.175, 0.35, 0.04, 12);
        arm.rotation.z = side * 0.32;
        arm.rotation.x = 0.35;
        const paw = sphere(0.05, voxel.white, side * 0.145, 0.29, 0.1, 0.95, 0.85, 1.1);
        g.add(arm, paw);
      }

      // 3. Round bunny head with plump cheeks, pink nose & dark eyes
      const headY = 0.6;
      g.add(sphere(0.195, voxel.white, 0, headY, 0.01, 1.08, 0.96, 0.98));
      for (const side of [-1, 1] as const) {
        g.add(sphere(0.095, voxel.white, side * 0.095, headY - 0.035, 0.08, 1.1, 0.82, 0.9));
        g.add(sphere(0.035, voxel.pinkLight, side * 0.135, headY - 0.025, 0.165, 1.1, 0.75, 0.5));
        g.add(sphere(0.027, voxel.eye, side * 0.075, headY + 0.025, 0.185, 0.92, 1.15, 0.6));
      }
      g.add(sphere(0.032, voxel.pink, 0, headY - 0.01, 0.205, 1.15, 0.85, 0.85));

      // 4. Signature Tall Upright Pink-Lined Bunny Ears
      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.085, headY + 0.15, -0.01);
        ear.rotation.z = -side * (side < 0 ? 0.08 : 0.16);
        ear.rotation.x = 0.06;

        ear.add(sphere(0.072, voxel.white, 0, 0.14, 0, 0.78, 2.15, 0.48));
        ear.add(sphere(0.046, voxel.pink, 0, 0.135, 0.022, 0.68, 1.85, 0.35));
        g.add(ear);
      }
      break;
    }

    case 'eaglet': {
      // Fourth of July mascot: fluffy fledgling Eaglet with brown body, white head,
      // hooked golden beak & red-white-and-blue Uncle Sam striped top hat

      // 1. Bright golden talons & legs
      for (const side of [-1, 1] as const) {
        const lx = side * 0.095;
        g.add(cyl(0.028, 0.025, 0.12, voxel.gold, lx, 0.07, 0.01, 10));
        g.add(sphere(0.058, voxel.gold, lx, 0.025, 0.05, 1.15, 0.45, 1.45));
      }

      // 2. Fluffy golden-brown fledgling body, cream chest tuft, tail & feathered wings
      g.add(sphere(0.225, voxel.wood, 0, 0.3, 0, 1.04, 0.98, 1.0));
      g.add(sphere(0.165, voxel.bone, 0, 0.31, 0.08, 0.9, 0.88, 0.75));
      const tail = sphere(0.095, voxel.woodDark, 0, 0.21, -0.2, 0.95, 0.5, 1.25);
      tail.rotation.x = 0.35;
      g.add(tail);

      for (const side of [-1, 1] as const) {
        const wing = sphere(0.115, voxel.woodDark, side * 0.21, 0.31, 0.01, 0.48, 1.05, 1.15);
        wing.rotation.z = side * 0.24;
        wing.rotation.x = 0.12;
        g.add(wing);
      }

      // 3. White bald-eagle head, hooked golden beak, proud brow ridges & dot eyes
      const headY = 0.56;
      g.add(sphere(0.185, voxel.white, 0, headY, 0.02, 1.05, 0.96, 1.0));
      // Feathered collar ruff around the base of the white head
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        g.add(
          sphere(
            0.055,
            voxel.white,
            Math.sin(ang) * 0.145,
            headY - 0.12,
            0.02 + Math.cos(ang) * 0.145,
            1,
            0.65,
            1,
          ),
        );
      }

      // Hooked golden eagle beak (upper bridge + curved hooked tip)
      const beakBase = cone(0.058, 0.12, voxel.gold, 0, headY - 0.01, 0.215, 12);
      beakBase.rotation.x = Math.PI / 2 + 0.12;
      const beakHook = cone(0.032, 0.065, voxel.gold, 0, headY - 0.038, 0.258, 10);
      beakHook.rotation.x = Math.PI * 0.82;
      g.add(beakBase, beakHook);

      for (const side of [-1, 1] as const) {
        g.add(sphere(0.026, voxel.eye, side * 0.075, headY + 0.025, 0.185, 0.95, 1.1, 0.6));
        const brow = box(0.068, 0.022, 0.03, voxel.white, side * 0.078, headY + 0.062, 0.182);
        brow.rotation.z = -side * 0.18;
        g.add(brow);
      }

      // 4. Signature Uncle Sam Striped Top Hat (white brim, blue star band, red & white vertical stripes)
      const hat = new THREE.Group();
      hat.position.set(0, headY + 0.145, 0.01);
      hat.rotation.x = -0.06;

      // Crisp white brim + royal blue hatband with gold star studs
      hat.add(cyl(0.23, 0.24, 0.032, voxel.white, 0, 0, 0, 20));
      hat.add(cyl(0.152, 0.15, 0.062, voxel.blue, 0, 0.042, 0, 18));
      for (const sa of [-0.65, 0, 0.65]) {
        hat.add(
          sphere(0.018, voxel.gold, Math.sin(sa) * 0.154, 0.044, Math.cos(sa) * 0.154, 1, 1, 0.5),
        );
      }

      // Tall stovepipe crown with 12 alternating vertical red & white stripe wedges
      const stripeCount = 12;
      const sliceArc = (Math.PI * 2) / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        const sGeo = new THREE.CylinderGeometry(
          0.156,
          0.144,
          0.22,
          4,
          1,
          false,
          i * sliceArc,
          sliceArc,
        );
        const sMesh = new THREE.Mesh(sGeo, mat(i % 2 === 0 ? voxel.red : voxel.white));
        sMesh.position.set(0, 0.18, 0);
        sMesh.castShadow = true;
        sMesh.receiveShadow = true;
        hat.add(sMesh);
      }
      hat.add(cyl(0.156, 0.156, 0.018, voxel.white, 0, 0.29, 0, 18));
      g.add(hat);
      break;
    }
  }

  g.scale.setScalar(scale);
  return g;
}
