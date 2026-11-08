import * as THREE from 'three';
import { ROOM_MASCOT_ID, buildMascotMesh } from '../mascots';
import { ROOM_SPECS, type RoomId, type RoomSpec, gameState } from '../state';
import {
  type BuiltBay,
  type DioramaCallbacks,
  type FairyLightEntry,
  type FloatingEntry,
  type FxPulseEntry,
  type Hotspot3D,
  FX_LAYER,
  WALL_WIDTH,
  bayToWorld,
  beamTexture,
  box,
  cyl,
  fxMaterial,
  fxPlane,
  fxWedge,
  getBayAngle,
  glowBox,
  glowSphere,
  hexToNumber,
  makeBayGroup,
  mat,
  radialTexture,
  sphere,
  toonMaterial,
} from './shared';

export interface BuiltHallBay extends BuiltBay {
  leapDayHeadWorldPos: THREE.Vector3;
  hallDust: { geo: THREE.BufferGeometry; base: Float32Array; seed: Float32Array };
  setDoorHop: (roomId: RoomId | null, progress: number) => void;
  setIntroPose: (mode: 'hidden' | 'pop' | 'idle', elapsed: number) => void;
  animateHallActor: (t: number) => void;
}

function buildDoorHolidayEmblem(roomId: RoomId): THREE.Group {
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
      const featherColors: `#${string}`[] = ['#c53030', '#dd6b20', '#ecc94b', '#dd6b20', '#c53030'];
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
}

export function buildHallBay(callbacks: DioramaCallbacks): BuiltHallBay {
  const theta = getBayAngle('hall');
  const bay = makeBayGroup(theta);
  const fairyLights: FairyLightEntry[] = [];
  const floating: FloatingEntry[] = [];
  const fxPulses: FxPulseEntry[] = [];

  const hallDoorPivots = new Map<RoomId, { pivot: THREE.Group; baseRotY: number }>();
  const hallDoorTargets = new Map<RoomId, THREE.Vector3>();
  let activeDoorHop: { roomId: RoomId; progress: number } | null = null;
  let activeIntroPose: { mode: 'hidden' | 'pop' | 'idle'; elapsed: number } | null = null;
  const leapDayRestPos = new THREE.Vector3(0, 0.06, 2.08);

  // Grand wood-paneled foyer back wall, recessed wainscot panel, cornice beam, and side pillars
  const wallMat = toonMaterial({ color: hexToNumber('#4a3525') });
  const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(WALL_WIDTH + 0.4, 5.8, 0.28), wallMat);
  wallMesh.position.set(0, 2.9, 0);
  wallMesh.receiveShadow = true;
  bay.add(wallMesh);

  bay.add(box(WALL_WIDTH - 0.1, 3.66, 0.05, '#7a5938', 0, 1.9, 0.13, false));

  const panelMat = toonMaterial({ color: hexToNumber('#36261a') });
  const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(WALL_WIDTH - 0.26, 3.5, 0.07), panelMat);
  panelMesh.position.set(0, 1.9, 0.14);
  panelMesh.receiveShadow = true;
  bay.add(panelMesh);

  bay.add(box(WALL_WIDTH + 0.4, 0.12, 0.22, '#6b4f35', 0, 0.06, 0.04, false));
  bay.add(box(WALL_WIDTH + 0.4, 0.24, 0.38, '#4a3524', 0, 3.85, 0.05, false));
  for (const side of [-1, 1] as const) {
    bay.add(cyl(0.2, 0.24, 5.8, '#3b281a', side * (WALL_WIDTH / 2 - 0.04), 2.9, 0.14, 12, false));
  }

  // Grand foyer carpet & central medallion rug
  const carpetMat = toonMaterial({ color: hexToNumber('#7b341e') });
  const carpetMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 2.65), carpetMat);
  carpetMesh.position.set(0, 0.015, 1.32);
  carpetMesh.receiveShadow = true;
  bay.add(carpetMesh);

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
      box(stairW * 0.58, 0.04, treadRun + 0.01, '#b83232', stairX, stepTopY + 0.003, treadZ, false),
    );
  }
  bay.add(stairsGroup);

  // 1. ALL SIX HOLIDAY DOORS IN TWO TIERS IN CALENDAR ORDER
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

  interface BuiltHallDoor {
    room: RoomSpec;
    slot: { roomId: RoomId; lx: number; floorY: number };
    pal: { frame: `#${string}`; lintel: `#${string}`; leaf: `#${string}`; inset: `#${string}` };
    dg: THREE.Group;
    frameMat: THREE.MeshToonMaterial;
    lintelMat: THREE.MeshToonMaterial;
    lampOn: THREE.Mesh;
    lampOff: THREE.Mesh;
    doorFairyEntries: FairyLightEntry[];
    recessDarkMesh: THREE.Mesh;
    recessGlowMesh: THREE.Mesh;
    recessGlowMat: THREE.MeshToonMaterial;
    thresholdSpillMesh: THREE.Mesh;
    thresholdSpillMat: THREE.MeshToonMaterial;
    doorPivotEntry: { pivot: THREE.Group; baseRotY: number };
    lockGroup: THREE.Group;
    lockBodyMat: THREE.MeshToonMaterial;
    completeFxGroup: THREE.Group;
    unlockedFxGroup: THREE.Group;
    worldPos: THREE.Vector3;
  }

  const builtDoors: BuiltHallDoor[] = [];

  for (const slot of doorLayout) {
    const room = ROOM_SPECS.find((r) => r.id === slot.roomId);
    if (!room) continue;
    const pal = doorPalettes[room.id];

    const dg = new THREE.Group();
    dg.position.set(slot.lx, slot.floorY, 0.22);
    hallDoorTargets.set(room.id, new THREE.Vector3(slot.lx, slot.floorY + 0.04, 0.48));

    // Generous invisible 3D raycast hit-box on layer 2
    const hitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 1.12, 0.38),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitMesh.position.set(0, 0.5, 0.08);
    hitMesh.layers.set(2);
    dg.add(hitMesh);

    // Doorway outer casing & lintel
    dg.add(box(0.76, 0.88, 0.12, '#2d1d11', 0, 0.44, 0, false));
    const frameMat = toonMaterial({ color: hexToNumber(pal.frame) });
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.84, 0.14), frameMat);
    frameMesh.position.set(0, 0.42, 0.01);
    frameMesh.receiveShadow = true;
    dg.add(frameMesh);

    const lintelMat = toonMaterial({ color: hexToNumber(pal.lintel) });
    const lintelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.18), lintelMat);
    lintelMesh.position.set(0, 0.86, 0.02);
    lintelMesh.receiveShadow = true;
    dg.add(lintelMesh);

    // Master Holiday Lamp directly above the door lintel (both on and off meshes pre-built)
    const lampOn = glowSphere(0.105, room.accent, 0, 1.01, 0.08, 1.35);
    const lampOff = sphere(0.095, '#3b4252', 0, 1.01, 0.08, false);
    dg.add(lampOn, lampOff);
    dg.add(cyl(0.04, 0.055, 0.05, '#d69e2e', 0, 0.91, 0.06, 10, false));

    // Mini string of 4 fairy light bulbs across the top of the door arch
    const doorFairyEntries: FairyLightEntry[] = [];
    for (const [bIdx, bx] of [-0.27, -0.1, 0.1, 0.27].entries()) {
      const bulbHex = (bIdx % 2 === 0 ? room.accent : room.secondaryAccent) as `#${string}`;
      const cNum = hexToNumber(bulbHex);
      const bulbMat = toonMaterial({ color: cNum, emissive: cNum, emissiveIntensity: 1.1 });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), bulbMat);
      bulb.position.set(bx, 0.86, 0.11);
      bulb.castShadow = false;
      bulb.receiveShadow = false;
      dg.add(bulb);
      const entry: FairyLightEntry = {
        mat: bulbMat,
        baseColor: new THREE.Color(cNum),
        offColor: new THREE.Color(0x2a303c),
        phase: bIdx * 1.1 + slot.lx,
        active: false,
      };
      fairyLights.push(entry);
      doorFairyEntries.push(entry);
    }

    // Interior doorway recess (both dark and warm-glowing variants pre-built)
    const recessDarkMesh = box(0.56, 0.78, 0.05, '#161b24', 0, 0.4, 0.03, false);
    const recessGlowMat = toonMaterial({
      color: hexToNumber('#ffae52'),
      emissive: hexToNumber('#ffae52'),
      emissiveIntensity: 1.05,
    });
    const recessGlowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.78, 0.05), recessGlowMat);
    recessGlowMesh.position.set(0, 0.4, 0.03);
    recessGlowMesh.castShadow = false;
    recessGlowMesh.receiveShadow = false;

    const thresholdSpillMat = toonMaterial({
      color: hexToNumber('#ffae52'),
      emissive: hexToNumber('#ffae52'),
      emissiveIntensity: 0.9,
    });
    const thresholdSpillMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.018, 0.24),
      thresholdSpillMat,
    );
    thresholdSpillMesh.position.set(0, 0.01, 0.16);
    thresholdSpillMesh.castShadow = false;
    thresholdSpillMesh.receiveShadow = false;

    dg.add(recessDarkMesh, recessGlowMesh, thresholdSpillMesh);

    // Hinged holiday-colored door leaf (pivoted at left jamb x = -0.28, z = 0.06)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-0.28, 0, 0.06);
    const doorPivotEntry = { pivot: doorPivot, baseRotY: 0 };
    hallDoorPivots.set(room.id, doorPivotEntry);

    doorPivot.add(box(0.56, 0.78, 0.045, pal.leaf, 0.28, 0.4, 0, false));
    doorPivot.add(box(0.42, 0.3, 0.052, pal.inset, 0.28, 0.56, 0, false));
    doorPivot.add(box(0.42, 0.22, 0.052, pal.inset, 0.28, 0.2, 0, false));

    // 3D Holiday Icon Emblem mounted on the upper panel of the door leaf
    const emblem = buildDoorHolidayEmblem(room.id);
    emblem.position.set(0.28, 0.56, 0.032);
    doorPivot.add(emblem);

    // Brass doorknob
    doorPivot.add(sphere(0.032, '#ecc94b', 0.48, 0.34, 0.04, false));

    // Heavy brass padlock on locked doors (pre-built, visibility toggled in syncState)
    const lockGroup = new THREE.Group();
    lockGroup.position.set(0.46, 0.34, 0.055);
    const lockBodyMat = toonMaterial({ color: hexToNumber('#d69e2e') });
    const lockBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.04), lockBodyMat);
    lockBodyMesh.position.set(0, -0.04, 0);
    lockBodyMesh.receiveShadow = true;
    lockGroup.add(lockBodyMesh);
    lockGroup.add(box(0.03, 0.05, 0.045, '#1a202c', 0, -0.04, 0.005, false));
    const shackle = new THREE.Mesh(
      new THREE.TorusGeometry(0.038, 0.012, 8, 14, Math.PI),
      mat('#cbd5e0'),
    );
    shackle.position.set(0, 0.02, 0);
    lockGroup.add(shackle);
    doorPivot.add(lockGroup);

    dg.add(doorPivot);

    // Stage lighting FX groups (both complete and unlocked-ajar FX groups pre-built, attached to bay so door prop bounds / raycasts stay clean)
    const upper = slot.floorY > 1;
    const completeFxGroup = new THREE.Group();
    completeFxGroup.position.set(slot.lx, slot.floorY, 0.22);
    const halo = fxMaterial(radialTexture(), room.accent, 0.9);
    completeFxGroup.add(fxPlane(0.62, 0.62, halo, 0, 1.01, 0.14));
    fxPulses.push({ mat: halo, base: 0.9, phase: slot.lx * 2.3 + slot.floorY });
    completeFxGroup.add(
      fxPlane(1.0, 1.1, fxMaterial(radialTexture(), room.accent, 0.3), 0, 0.62, 0.13),
    );
    completeFxGroup.add(
      fxPlane(1.1, 0.8, fxMaterial(radialTexture(), room.accent, 0.42), 0, 0.012, 0.42, true),
    );
    bay.add(completeFxGroup);

    const unlockedFxGroup = new THREE.Group();
    unlockedFxGroup.position.set(slot.lx, slot.floorY, 0.22);
    const spill = room.id === 'thanksgiving' ? '#ffb05c' : '#ffc27a';
    unlockedFxGroup.add(
      fxPlane(0.95, 1.15, fxMaterial(radialTexture(), spill, 0.38), 0, 0.42, 0.1),
    );
    const length = upper ? 0.5 : 1.55;
    const wedge = fxWedge(0.56, upper ? 0.8 : 1.6, length, fxMaterial(beamTexture(), spill, 0.8));
    wedge.rotation.x = -Math.PI / 2;
    wedge.position.set(0, 0.014, 0.08 + length / 2);
    unlockedFxGroup.add(wedge);
    bay.add(unlockedFxGroup);

    bay.add(dg);

    builtDoors.push({
      room,
      slot,
      pal,
      dg,
      frameMat,
      lintelMat,
      lampOn,
      lampOff,
      doorFairyEntries,
      recessDarkMesh,
      recessGlowMesh,
      recessGlowMat,
      thresholdSpillMesh,
      thresholdSpillMat,
      doorPivotEntry,
      lockGroup,
      lockBodyMat,
      completeFxGroup,
      unlockedFxGroup,
      worldPos: bayToWorld(theta, slot.lx * 1.24, slot.floorY + 0.08, 0.42),
    });
  }

  // 2. Foreground Center: Leap Day on the Hall Rug + FEB 29 Calendar Slip
  const hallFloorSlip = new THREE.Group();
  hallFloorSlip.position.set(0, 0.058, 2.08);
  hallFloorSlip.add(box(0.42, 0.012, 0.34, '#fffaf0', 0, 0, 0, false));
  hallFloorSlip.add(box(0.42, 0.015, 0.08, '#c53030', 0, 0.001, -0.12, false));
  hallFloorSlip.visible = false;
  bay.add(hallFloorSlip);

  const hallLeapDayActor = new THREE.Group();
  hallLeapDayActor.position.copy(leapDayRestPos);
  const leapDayMesh = buildMascotMesh('leapday', 0.68);
  leapDayMesh.traverse((c) => {
    c.castShadow = false;
    c.receiveShadow = false;
  });
  hallLeapDayActor.add(leapDayMesh);
  const partyHatGroup = new THREE.Group();
  partyHatGroup.add(cyl(0.01, 0.085, 0.19, '#ed64a6', 0, 0.54, -0.01, 10, false));
  partyHatGroup.add(glowSphere(0.026, '#ffea79', 0, 0.65, -0.01, 0.9));
  hallLeapDayActor.add(partyHatGroup);
  bay.add(hallLeapDayActor);

  // The year wheel: a rug of twelve month segments round Leap Day's lily pad
  const MONTH_TINTS = [
    '#9ec9e8', // Jan
    '#f4a6c0', // Feb
    '#9fd49a', // Mar
    '#f6e58d', // Apr
    '#c9b3e8', // May
    '#b5e3a0', // Jun
    '#7fa8e0', // Jul
    '#f2c46b', // Aug
    '#e8a65c', // Sep
    '#f08a4b', // Oct
    '#c98b5a', // Nov
    '#e06a6a', // Dec
  ];
  const wheel = new THREE.Group();
  wheel.position.set(leapDayRestPos.x, 0.042, leapDayRestPos.z);
  const step = (Math.PI * 2) / 12;
  const angleOf = (month: number): number => Math.PI / 2 - month * step - step / 2;
  for (let m = 0; m < 12; m++) {
    const seg = new THREE.Mesh(
      new THREE.RingGeometry(0.56, 0.98, 6, 1, angleOf(m) - step / 2 + 0.03, step - 0.06),
      mat(MONTH_TINTS[m] ?? '#e8d8b8'),
    );
    seg.rotation.x = -Math.PI / 2;
    seg.receiveShadow = true;
    wheel.add(seg);
  }
  const rim = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.04, 48), mat('#5c3d24'));
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = -0.002;
  wheel.add(rim);
  const febAngle = angleOf(1);
  const slip = new THREE.Group();
  slip.position.set(Math.cos(febAngle) * 1.17, 0.006, -Math.sin(febAngle) * 1.17);
  slip.rotation.y = febAngle + 0.35;
  slip.add(box(0.15, 0.012, 0.15, '#fffaf0', 0, 0, 0, false));
  slip.add(box(0.15, 0.016, 0.04, '#c53030', 0, 0.002, -0.055, false));
  wheel.add(slip);
  bay.add(wheel);

  // Footlights along the front of the stage
  const footZ = 3.42;
  const house = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 1.1), mat('#1a120c'));
  house.rotation.x = -Math.PI / 2;
  house.position.set(0, 0.006, footZ + 0.62);
  house.receiveShadow = true;
  bay.add(house);
  bay.add(box(3.9, 0.06, 0.14, '#2a1d14', 0, 0.03, footZ, false));
  bay.add(box(3.9, 0.012, 0.15, '#8a6a2a', 0, 0.064, footZ, false));
  for (let i = 0; i < 9; i++) {
    const fx = -1.68 + i * 0.42;
    const hood = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.16, 12, 1, false, -Math.PI / 2, Math.PI),
      mat('#6b4a1c'),
    );
    hood.rotation.z = Math.PI / 2;
    hood.position.set(fx, 0.1, footZ + 0.02);
    bay.add(hood);
    bay.add(glowSphere(0.035, '#ffe3a3', fx, 0.11, footZ - 0.03, 1.2));
    bay.add(
      fxPlane(0.55, 0.42, fxMaterial(radialTexture(), '#ffc98a', 0.32), fx, 0.2, footZ - 0.06),
    );
  }

  // Stage spotlight on Leap Day
  const beam = fxWedge(0.3, 0.95, 2.3, fxMaterial(beamTexture(), '#ffe2b0', 0.13));
  beam.position.set(leapDayRestPos.x, 1.2, leapDayRestPos.z + 0.05);
  bay.add(beam);
  bay.add(
    fxPlane(
      1.25,
      0.95,
      fxMaterial(radialTexture(), '#ffe2b0', 0.45),
      leapDayRestPos.x,
      0.05,
      leapDayRestPos.z,
      true,
    ),
  );

  // Dust motes drifting slowly through the light
  const dustCount = 40;
  const base = new Float32Array(dustCount * 3);
  const seed = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    const r = (k: number) => {
      const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    base[i * 3] = -1.0 + r(1) * 2.2;
    base[i * 3 + 1] = 0.1 + r(2) * 2.1;
    base[i * 3 + 2] = 0.6 + r(3) * 1.8;
    seed[i] = r(4);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      map: radialTexture(),
      color: 0xffc98a,
      size: 0.022,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  dust.layers.set(FX_LAYER);
  bay.add(dust);
  const hallDust = { geo: dustGeo, base, seed };

  // 3. Foreground Right: The Calendar Desk with a glowing Banker's Lamp (`lx = 1.26, lz = 2.08`)
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
  const deskWorldPos = bayToWorld(theta, 1.26, 0.12, 2.32);

  // 4. Center Podium: XMAS365 Merger Contract (pre-built once, visibility toggled when all 6 door lamps are lit)
  const podiumGroup = new THREE.Group();
  podiumGroup.position.set(0, 0, 1.15);
  podiumGroup.add(cyl(0.28, 0.34, 0.12, '#5c3d24', 0, 0.06, 0, 14, false));
  podiumGroup.add(cyl(0.14, 0.18, 0.68, '#d69e2e', 0, 0.42, 0, 12, false));
  podiumGroup.add(box(0.56, 0.08, 0.44, '#ecc94b', 0, 0.78, 0, false));
  podiumGroup.add(glowBox(0.42, 0.04, 0.32, '#fffaf0', 0, 0.83, 0, 0.6));
  bay.add(podiumGroup);
  const podiumWorldPos = bayToWorld(theta, 0, 1.02, 1.25);

  // 5. Act 4 Party Guests (all 6 freed holiday mascots + humbled CEO Santa, pre-built once)
  const partyGuestsGroup = new THREE.Group();
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
    partyGuestsGroup.add(guest);
    floating.push({ mesh: guest, phase: pIdx * 0.9 + 0.5, baseY: 0.03 });
  }
  const santaGuest = buildMascotMesh('santa', 0.48);
  santaGuest.position.set(0, 0.03, 0.82);
  partyGuestsGroup.add(santaGuest);
  floating.push({ mesh: santaGuest, phase: 2.1, baseY: 0.03 });
  bay.add(partyGuestsGroup);

  const syncState = (hotspotsOut: Hotspot3D[]): void => {
    const act = gameState.act();
    const lampsLit = gameState.completedRoomCount();

    const wallHex = act >= 4 ? '#553c9a' : act === 3 ? '#334155' : '#4a3525';
    const panelHex = act >= 4 ? '#44337a' : act === 3 ? '#1e293b' : '#36261a';
    wallMat.color.setHex(hexToNumber(wallHex));
    panelMat.color.setHex(hexToNumber(panelHex));
    carpetMat.color.setHex(hexToNumber(act === 3 ? '#742a2a' : '#7b341e'));

    partyHatGroup.visible = act === 4;
    partyGuestsGroup.visible = act === 4;

    for (const d of builtDoors) {
      const unlocked = gameState.isRoomUnlocked(d.room);
      const complete = gameState.isRoomComplete(d.room);
      const unlockItem = !unlocked ? gameState.carriedEligibleItemForRoom(d.room) : null;
      const carriedSecondItem = unlocked
        ? (gameState.carriedItems().find((it) => it.homeRoom === d.room.id) ?? null)
        : null;
      const sign = gameState.getRoomSignage(d.room);

      d.frameMat.color.setHex(hexToNumber(complete ? '#ecc94b' : d.pal.frame));
      d.lintelMat.color.setHex(hexToNumber(complete ? '#ecc94b' : d.pal.lintel));

      d.lampOn.visible = complete;
      d.lampOff.visible = !complete;

      for (const fl of d.doorFairyEntries) {
        fl.active = complete;
        if (!complete) {
          fl.mat.color.setHex(0x2d3340);
          fl.mat.emissiveIntensity = 0;
        } else {
          fl.mat.color.copy(fl.baseColor);
          fl.mat.emissiveIntensity = 1.1;
        }
      }

      const glowColor =
        d.room.id === 'thanksgiving'
          ? '#ff8c24'
          : complete
            ? '#ffe082'
            : unlocked
              ? '#ffae52'
              : '#161b24';
      const glowNum = hexToNumber(glowColor);
      d.recessDarkMesh.visible = !(unlocked || complete);
      d.recessGlowMesh.visible = unlocked || complete;
      d.recessGlowMat.color.setHex(glowNum);
      d.recessGlowMat.emissive.setHex(glowNum);
      d.recessGlowMat.emissiveIntensity = complete ? 1.15 : 1.05;

      const spillNum = hexToNumber(d.room.id === 'thanksgiving' ? '#ff922b' : glowColor);
      d.thresholdSpillMesh.visible = unlocked || complete;
      d.thresholdSpillMat.color.setHex(spillNum);
      d.thresholdSpillMat.emissive.setHex(spillNum);

      const baseRotY = complete ? -0.82 : unlocked ? -0.48 : 0;
      d.doorPivotEntry.baseRotY = baseRotY;
      if (!activeDoorHop || activeDoorHop.roomId !== d.room.id) {
        d.doorPivotEntry.pivot.rotation.y = baseRotY;
      }

      d.lockGroup.visible = !unlocked;
      d.lockBodyMat.color.setHex(hexToNumber(unlockItem ? '#ffea79' : '#d69e2e'));

      d.completeFxGroup.visible = complete;
      d.unlockedFxGroup.visible = !complete && unlocked;

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

      hotspotsOut.push({
        id: `door:${d.room.id}`,
        bay: 'hall',
        label: `${d.room.icon} ${sign.title}`,
        sublabel,
        icon: complete ? '★' : unlockItem ? '✨' : unlocked ? d.room.icon : '🔒',
        status,
        accent: unlockItem ? '#d69e2e' : d.room.accent,
        hiddenPill: true,
        worldPos: d.worldPos,
        cameraPos: doorFocusPos,
        cameraLook: doorFocusLook,
        meshGroup: d.dg,
        onClick: () => {
          if (canInteract) {
            callbacks.onSelectBay(d.room.id);
          }
        },
      });
    }

    const deskUnlockedCount = gameState.unlockedDeskGenreCount();
    hotspotsOut.push({
      id: 'desk:calendar',
      bay: 'hall',
      label: '📅 Calendar Desk',
      sublabel: `${deskUnlockedCount}/6 Reclaimed`,
      icon: '📅',
      status: deskUnlockedCount >= 6 ? 'done' : 'ready',
      accent: '#805ad5',
      hiddenPill: deskUnlockedCount === 0,
      worldPos: deskWorldPos,
      cameraPos: deskFocusPos,
      cameraLook: deskFocusLook,
      meshGroup: deskGroup,
      onClick: () => {
        if (deskUnlockedCount > 0) callbacks.onOpenDesk(deskFocusPos, deskFocusLook);
      },
    });

    const finaleUnlocked = lampsLit >= 6;
    const finaleDone = gameState.solvedRuns.has('tuesday');
    podiumGroup.visible = finaleUnlocked;
    if (finaleUnlocked) {
      hotspotsOut.push({
        id: 'finale:tuesday',
        bay: 'hall',
        label: act === 4 ? "🎉 Leap Day's Party" : '📜 XMAS365™ Merger Contract',
        sublabel: finaleDone ? '✓ Xmas12 · Day 366 Every Year!' : '6/6 Mascots Free · Red-Line It!',
        icon: finaleDone ? '🎉' : '📜',
        status: finaleDone ? 'done' : 'ready',
        hero: !finaleDone,
        accent: '#d69e2e',
        worldPos: podiumWorldPos,
        cameraPos: doorFocusPos,
        cameraLook: doorFocusLook,
        meshGroup: podiumGroup,
        onClick: () => callbacks.onOpenProto('tuesday', doorFocusPos, doorFocusLook),
      });
    }
  };

  return {
    bayId: 'hall',
    group: bay,
    flames: [],
    fireflies: [],
    fairyLights,
    floating,
    fxPulses,
    hallDust,
    leapDayHeadWorldPos: bayToWorld(theta, 0, 0.62, 2.08),
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
    animateHallActor: (t) => {
      if (activeDoorHop) {
        const doorTarget = hallDoorTargets.get(activeDoorHop.roomId) ?? leapDayRestPos;
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
          const cyclePos = Math.max(0, e - 0.75) * 0.78;
          const hopIndex = Math.floor(cyclePos);
          const hopPhase = cyclePos - hopIndex;
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
    },
    syncState,
  };
}
