import * as THREE from 'three';
import { ROOM_MASCOT_ID, buildMascotMesh } from '../mascots';
import { FINALE_PROTO, ROOM_SPECS, type RoomId, type RoomSpec, gameState } from '../state';
import {
  type BuiltBay,
  type DioramaCallbacks,
  type FairyLightEntry,
  type FlameEntry,
  type FloatingEntry,
  type FxPulseEntry,
  type Hotspot3D,
  FX_LAYER,
  WALL_WIDTH,
  bayToWorld,
  beamTexture,
  box,
  buildCandle,
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

function makeCorporateBannerTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;

  // Base woven canvas cloth gradient (aged cream/burlap with darker top/bottom fold shading)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#dfd0b2');
  bgGrad.addColorStop(0.18, '#f6ecd7');
  bgGrad.addColorStop(0.55, '#fbf4e4');
  bgGrad.addColorStop(0.85, '#efe1c4');
  bgGrad.addColorStop(1, '#d8c5a0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle vertical drapery fold shading across the canvas width
  for (let fx = 0; fx < w; fx += 8) {
    const u = fx / w;
    const wave = Math.sin(u * Math.PI * 7) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(110, 82, 48, ${(wave * 0.055).toFixed(3)})`;
    ctx.fillRect(fx, 0, 8, h);
  }

  // Subtle horizontal & vertical fabric weave threads
  ctx.strokeStyle = 'rgba(120, 90, 55, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 4; y < h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = 4; x < w; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Diagonal candy-cane / corporate hazard stripes near the left and right swallowtail ends
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 145, h);
  ctx.rect(w - 145, 0, 145, h);
  ctx.clip();
  for (let i = -h; i < w + h; i += 36) {
    ctx.fillStyle =
      (Math.floor(i / 36) & 1) === 0 ? 'rgba(185, 28, 28, 0.22)' : 'rgba(34, 84, 61, 0.18)';
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 20, 0);
    ctx.lineTo(i - 60, h);
    ctx.lineTo(i - 80, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Top & bottom crimson and gold woven cloth selvedge bands
  ctx.fillStyle = '#9b1c1c';
  ctx.fillRect(0, 0, w, 16);
  ctx.fillRect(0, h - 16, w, 16);
  ctx.fillStyle = '#d69e2e';
  ctx.fillRect(0, 16, w, 6);
  ctx.fillRect(0, h - 22, w, 6);

  // Stitched inner hem line
  ctx.save();
  ctx.strokeStyle = '#822727';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(28, 30, w - 56, h - 60);
  ctx.restore();

  // 8 brass grommet eyelets along the top hem matching the 3D hanging straps
  const grommetCount = 8;
  for (let i = 0; i < grommetCount; i++) {
    const gx = 92 + (i / (grommetCount - 1)) * (w - 184);
    const gy = 22;
    ctx.fillStyle = '#b7791f';
    ctx.beginPath();
    ctx.arc(gx, gy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d1d11';
    ctx.beginPath();
    ctx.arc(gx, gy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top stenciled header: "UNDER NEW MANAGEMENT:"
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 44px "Arial Black", Impact, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(214, 158, 46, 0.45)';
  ctx.fillText('UNDER NEW MANAGEMENT:', w * 0.5 + 3, 86 + 3);
  ctx.fillStyle = '#1e293b';
  ctx.fillText('UNDER NEW MANAGEMENT:', w * 0.5, 86);

  // Main takeover title: "XMAS365™" (seamless bold painted lettering)
  const mainX = w * 0.468;
  const mainY = 186;
  ctx.font = '900 108px "Arial Black", Impact, system-ui, sans-serif';
  ctx.lineJoin = 'round';
  const mainHalfW = ctx.measureText('XMAS365').width * 0.5;
  // Deep block shadow
  ctx.fillStyle = '#1e293b';
  ctx.fillText('XMAS365', mainX + 6, mainY + 6);
  // Warm gold outline offset
  ctx.strokeStyle = '#d69e2e';
  ctx.lineWidth = 10;
  ctx.strokeText('XMAS365', mainX, mainY);
  // Crimson corporate fill
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('XMAS365', mainX, mainY);

  // Superscript "TM" cleanly spaced beside XMAS365
  const tmX = mainX + mainHalfW + 30;
  const tmY = mainY - 32;
  ctx.font = '900 36px "Arial Black", Impact, system-ui, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('TM', tmX + 3, tmY + 3);
  ctx.strokeStyle = '#d69e2e';
  ctx.lineWidth = 6;
  ctx.strokeText('TM', tmX, tmY);
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('TM', tmX, tmY);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function buildCorporateBanner(): THREE.Group {
  const group = new THREE.Group();
  // Positioned higher in the upper hall span below the cornice beam (y = 3.85) with clear breathing room above the upper door lamps (y = 2.49)
  group.position.set(0, 3.3, 0.34);

  // 1. Ceiling iron mounting brackets on the cornice beam & V-rigged hemp suspension ropes
  for (const side of [-1, 1] as const) {
    const innerX = side * 1.12;
    const outerX = side * 1.38;
    // Iron cornice brackets at y = +0.52 (world y = 3.82)
    group.add(box(0.08, 0.09, 0.08, '#1e293b', innerX, 0.52, -0.04, false));
    group.add(sphere(0.036, '#d69e2e', innerX, 0.47, -0.01, false));
    group.add(box(0.07, 0.08, 0.07, '#1e293b', outerX, 0.52, -0.04, false));

    // Vertical main suspension rope from cornice bracket down to crossbar pole (y = +0.35)
    group.add(cyl(0.016, 0.016, 0.18, '#c49a6c', innerX, 0.435, 0, 8, false));
    // Angled guy-rope from outer bracket to pole collar
    const guyRope = cyl(0.013, 0.013, 0.31, '#b78856', side * 1.25, 0.435, 0, 8, false);
    guyRope.rotation.z = -side * 0.99;
    group.add(guyRope);

    // Brass rope knot collar on the crossbar pole
    group.add(cyl(0.038, 0.038, 0.07, '#d69e2e', innerX, 0.35, 0, 12, false));
  }

  // 2. Horizontal wooden crossbar pole with candy-cane/gold finials
  const poleWidth = 2.94;
  const pole = cyl(0.028, 0.028, poleWidth, '#5c3d24', 0, 0.35, 0, 12, false);
  pole.rotation.z = Math.PI / 2;
  group.add(pole);

  for (const side of [-1, 1] as const) {
    const endX = side * (poleWidth * 0.5 + 0.02);
    const collar = cyl(0.042, 0.034, 0.06, '#c53030', endX - side * 0.03, 0.35, 0, 12, false);
    collar.rotation.z = Math.PI / 2;
    group.add(collar);
    group.add(sphere(0.058, '#ecc94b', endX + side * 0.02, 0.35, 0, false));

    // Hanging crimson & gold side ribbons dangling from the outer crossbar ends
    const ribbon = box(0.065, 0.42, 0.016, '#c53030', side * 1.38, 0.11, 0.01, false);
    ribbon.rotation.z = side * 0.09;
    group.add(ribbon);
    group.add(sphere(0.03, '#ecc94b', side * 1.4, -0.1, 0.015, false));
  }

  // 3. 8 Brass hanging loops connecting the horizontal pole to the sagging cloth top hem
  const bannerW = 2.68;
  const bannerH = 0.68;
  const ringCount = 8;
  for (let i = 0; i < ringCount; i++) {
    const u = 0.08 + (i / (ringCount - 1)) * 0.84;
    const rx = (u - 0.5) * bannerW;
    const catenarySag = Math.sin(u * Math.PI) * 0.095;
    const strapLen = 0.065 + catenarySag;
    const strapCenterY = 0.35 - strapLen * 0.5;
    group.add(cyl(0.018, 0.018, strapLen, '#d69e2e', rx, strapCenterY, 0.015, 8, false));
    group.add(sphere(0.024, '#ecc94b', rx, 0.35 - strapLen, 0.025, false));
  }

  // 4. Deformed 3D Draped Cloth Geometry (smooth catenary sag + swallowtail V-notches + smooth billow)
  const segX = 40;
  const segY = 14;
  const clothGeo = new THREE.PlaneGeometry(bannerW, bannerH, segX, segY);
  const posAttr = clothGeo.attributes.position;
  if (posAttr) {
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const u = vx / bannerW + 0.5; // 0..1 left to right
      const v = vy / bannerH + 0.5; // 0..1 bottom to top

      // Swallowtail V-notches cut inward on the left and right ends so the 3D outline is non-rectangular
      const midPinch = 1 - Math.abs(v - 0.5) * 2; // 0 at top/bottom corners, 1 at vertical center
      const endWeight = Math.pow(Math.abs(u - 0.5) * 2, 3.2); // active only near left/right ends
      const notchedX = vx * (1 - 0.14 * midPinch * endWeight);

      // Smooth gravity catenary sag across the span
      const catenarySag = -Math.sin(u * Math.PI) * 0.095;
      const drapedY = vy + catenarySag;

      // Smooth forward cloth billow (no sharp normal creases across the letters)
      const billowZ = Math.sin(u * Math.PI) * 0.046 + Math.sin(v * Math.PI) * 0.024;

      posAttr.setXYZ(i, notchedX, drapedY, billowZ);
    }
    posAttr.needsUpdate = true;
    clothGeo.computeVertexNormals();
  }

  const bannerTex = makeCorporateBannerTexture();
  const clothMat = toonMaterial({
    color: bannerTex ? 0xffffff : hexToNumber('#f6ecd7'),
    ...(bannerTex
      ? {
          map: bannerTex,
          emissive: 0xffffff,
          emissiveMap: bannerTex,
          emissiveIntensity: 0.32,
        }
      : {}),
  });
  const clothMesh = new THREE.Mesh(clothGeo, clothMat);
  clothMesh.position.set(0, -0.04, 0.015);
  clothMesh.castShadow = true;
  clothMesh.receiveShadow = true;
  group.add(clothMesh);

  // 5. 9 Hanging 3D Gold Fringe Tassels along the sagging bottom hem of the cloth
  const tasselCount = 9;
  for (let i = 0; i < tasselCount; i++) {
    const u = 0.1 + (i / (tasselCount - 1)) * 0.8;
    const tx = (u - 0.5) * bannerW;
    const catenarySag = -Math.sin(u * Math.PI) * 0.095;
    const bottomY = -0.04 - bannerH * 0.5 + catenarySag;
    const billowZ = Math.sin(u * Math.PI) * 0.048 + 0.018;
    const tasselColor = i % 2 === 0 ? '#ecc94b' : '#c53030';
    group.add(sphere(0.022, '#d69e2e', tx, bottomY - 0.01, billowZ, false));
    group.add(cyl(0.012, 0.022, 0.055, tasselColor, tx, bottomY - 0.042, billowZ, 8, false));
  }

  // 6. Oversized 3D XMAS365™ Red Wax Corporate Seal & Ribbon Rosette pinned to bottom-right of cloth
  const sealGroup = new THREE.Group();
  sealGroup.position.set(1.02, -0.34, 0.055);
  sealGroup.rotation.z = -0.14;
  // Gold rosette backing & two notched ribbon tails
  const rTailL = box(0.045, 0.14, 0.014, '#c53030', -0.028, -0.08, -0.006, false);
  rTailL.rotation.z = -0.22;
  const rTailR = box(0.045, 0.14, 0.014, '#22543d', 0.028, -0.08, -0.006, false);
  rTailR.rotation.z = 0.22;
  sealGroup.add(rTailL, rTailR);
  const goldRim = cyl(0.082, 0.082, 0.02, '#ecc94b', 0, 0, 0, 14, false);
  goldRim.rotation.x = Math.PI / 2;
  sealGroup.add(goldRim);
  const waxDisc = cyl(0.064, 0.064, 0.028, '#e53e3e', 0, 0, 0.006, 14, false);
  waxDisc.rotation.x = Math.PI / 2;
  sealGroup.add(waxDisc);
  group.add(sealGroup);

  // Hastily-hung corporate crooked tilt
  group.rotation.z = -0.024;
  return group;
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

function buildPartyHat(coneHex: string, pomHex: string, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const h = 0.2 * scale;
  const r = 0.086 * scale;
  const coneMesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 12), mat(coneHex));
  coneMesh.position.set(0, h * 0.5, 0);
  coneMesh.castShadow = false;
  coneMesh.receiveShadow = false;
  g.add(coneMesh);
  g.add(cyl(r * 1.04, r * 1.08, 0.024 * scale, pomHex, 0, 0.012 * scale, 0, 12, false));
  g.add(glowSphere(0.028 * scale, pomHex, 0, h + 0.012 * scale, 0, 0.95));
  return g;
}

export function buildHallBay(callbacks: DioramaCallbacks): BuiltHallBay {
  const theta = getBayAngle('hall');
  const bay = makeBayGroup(theta);
  const flames: FlameEntry[] = [];
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

  // Hanging 3D cloth prop banner ("UNDER NEW MANAGEMENT: XMAS365") rigged below the cornice beam
  const corporateBannerGroup = buildCorporateBanner();
  bay.add(corporateBannerGroup);

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
    // Twice life size so it reads from the hall camera; moved in so it stays on the leaf.
    lockGroup.position.set(0.4, 0.26, 0.07);
    lockGroup.scale.setScalar(2);
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
    // The step's pool of colour; an upper door's balcony ledge is shallow, so its pool is too.
    completeFxGroup.add(
      fxPlane(
        1.1,
        upper ? 0.34 : 0.8,
        fxMaterial(radialTexture(), room.accent, 0.42),
        0,
        0.012,
        upper ? 0.12 : 0.42,
        true,
      ),
    );
    bay.add(completeFxGroup);

    const unlockedFxGroup = new THREE.Group();
    unlockedFxGroup.position.set(slot.lx, slot.floorY, 0.22);
    const spill = room.id === 'thanksgiving' ? '#ffb05c' : '#ffc27a';
    unlockedFxGroup.add(
      fxPlane(0.95, 1.15, fxMaterial(radialTexture(), spill, 0.38), 0, 0.42, 0.1),
    );
    // Upper doors spill only as far as the balcony's edge.
    const length = upper ? 0.26 : 1.55;
    const wedge = fxWedge(0.56, upper ? 0.72 : 1.6, length, fxMaterial(beamTexture(), spill, 0.8));
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

  // 2. Foreground Center: Leap Day on the Hall Rug
  const hallLeapDayActor = new THREE.Group();
  hallLeapDayActor.position.copy(leapDayRestPos);
  const leapDayMesh = buildMascotMesh('leapday', 0.68);
  leapDayMesh.traverse((c) => {
    c.castShadow = false;
    c.receiveShadow = false;
  });
  hallLeapDayActor.add(leapDayMesh);
  const leapDayPartyHat = buildPartyHat('#ed64a6', '#ffea79', 1.0);
  leapDayPartyHat.position.set(0, 0.44, -0.01);
  leapDayPartyHat.visible = false;
  hallLeapDayActor.add(leapDayPartyHat);
  bay.add(hallLeapDayActor);

  // Footlights along the front of the stage. This close to the rotunda's centre the hall's
  // slice is only ~1.8 wide (and a phone sees ~1.66 of it), so the row stays inside it.
  const footZ = 3.42;
  // Beyond them the floor falls into the dark of the house: a trapezoid narrowing toward the
  // centre with the slice, just above the rotunda's centre rugs.
  const houseDepth = 1.1;
  const houseGeo = new THREE.PlaneGeometry(1, houseDepth);
  const housePos = houseGeo.attributes['position'] as THREE.BufferAttribute;
  for (let i = 0; i < housePos.count; i++) {
    // Local +y is the footlight end once laid flat; -y runs toward the centre.
    housePos.setX(i, housePos.getX(i) * (housePos.getY(i) > 0 ? 1.74 : 0.7));
  }
  housePos.needsUpdate = true;
  const house = new THREE.Mesh(houseGeo, mat('#1a120c'));
  house.rotation.x = -Math.PI / 2;
  house.position.set(0, 0.04, footZ + 0.07 + houseDepth / 2);
  house.receiveShadow = true;
  bay.add(house);
  bay.add(box(1.8, 0.06, 0.14, '#2a1d14', 0, 0.03, footZ, false));
  bay.add(box(1.8, 0.012, 0.15, '#8a6a2a', 0, 0.064, footZ, false));
  for (let i = 0; i < 5; i++) {
    const fx = -0.84 + i * 0.42;
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

  // 3. Foreground Right: The Freed Mascots' Corner, where the Calendar Desk used to sit.
  const cornerX = 1.25;
  const cornerZ = 1.6;

  const cornerSlots: readonly {
    roomId: RoomId;
    ox: number;
    oz: number;
    rotY: number;
    hatY: number;
    hatZ: number;
    hatHex: `#${string}`;
    pomHex: `#${string}`;
  }[] = [
    // Two rows of three: the back row first, then the front.
    {
      roomId: 'thanksgiving',
      ox: -0.22,
      oz: -0.14,
      rotY: 0.35,
      hatY: 0.9,
      hatZ: 0.08,
      hatHex: '#ed8936',
      pomHex: '#ffea79',
    },
    {
      roomId: 'halloween',
      ox: 0.0,
      oz: -0.18,
      rotY: 0,
      hatY: 0.66,
      hatZ: 0.01,
      hatHex: '#805ad5',
      pomHex: '#ed8936',
    },
    {
      roomId: 'christmas',
      ox: 0.22,
      oz: -0.14,
      rotY: -0.35,
      hatY: 1.06,
      hatZ: 0,
      hatHex: '#38a169',
      pomHex: '#e53e3e',
    },
    {
      roomId: 'valentines',
      ox: -0.22,
      oz: 0.15,
      rotY: 0.45,
      hatY: 0.88,
      hatZ: 0.01,
      hatHex: '#ed64a6',
      pomHex: '#fff5f7',
    },
    {
      roomId: 'easter',
      ox: 0.0,
      oz: 0.19,
      rotY: 0,
      hatY: 0.82,
      hatZ: 0.01,
      hatHex: '#ecc94b',
      pomHex: '#f687b3',
    },
    {
      roomId: 'fourth',
      ox: 0.22,
      oz: 0.15,
      rotY: -0.45,
      hatY: 0.98,
      hatZ: 0.02,
      hatHex: '#2b6cb0',
      pomHex: '#ffffff',
    },
  ];

  const cornerMascotEntries: {
    room: RoomSpec;
    group: THREE.Group;
    hat: THREE.Group;
    worldPos: THREE.Vector3;
  }[] = [];

  for (const [mIdx, cSlot] of cornerSlots.entries()) {
    const room = ROOM_SPECS.find((r) => r.id === cSlot.roomId);
    if (!room) continue;
    const mg = new THREE.Group();
    mg.position.set(cornerX + cSlot.ox, 0.03, cornerZ + cSlot.oz);
    mg.rotation.y = cSlot.rotY;

    const hitCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.48, 10),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitCyl.position.set(0, 0.24, 0);
    hitCyl.layers.set(2);
    mg.add(hitCyl);

    const mesh = buildMascotMesh(ROOM_MASCOT_ID[room.id], 0.34);
    const guestHat = buildPartyHat(cSlot.hatHex, cSlot.pomHex, 0.72);
    guestHat.position.set(0, cSlot.hatY, cSlot.hatZ);
    guestHat.visible = false;
    mesh.add(guestHat);
    mesh.traverse((c) => {
      c.castShadow = false;
      c.receiveShadow = false;
    });
    mg.add(mesh);
    floating.push({ mesh, phase: mIdx * 1.1 + 0.4, baseY: 0 });
    mg.visible = false;
    bay.add(mg);

    cornerMascotEntries.push({
      room,
      group: mg,
      hat: guestHat,
      worldPos: bayToWorld(theta, cornerX + cSlot.ox, 0.4, cornerZ + cSlot.oz),
    });
  }

  const cornerFocusPos = bayToWorld(theta, 0.5, 1.9, 4.1);
  const cornerFocusLook = bayToWorld(theta, cornerX, 0.45, cornerZ);
  const cornerWorldPos = bayToWorld(theta, 1.02, 0.06, cornerZ + 0.36);
  let lastChattedCornerIdx = 0;

  // 4. Act 3 Left-Stage Hotspot: CEO Santa Confrontation & XMAS365™ Merger Contract (pre-built once)
  const santaX = -1.12;
  const santaZ = 1.62;
  const santaConfrontGroup = new THREE.Group();
  santaConfrontGroup.position.set(santaX, 0, santaZ);
  santaConfrontGroup.rotation.y = 0.24;

  // Invisible raycast hit-box on layer 2 so tapping Santa or the Contract clipboard in 3D opens the Merger Contract
  const santaHitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.25, 0.9),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  santaHitMesh.position.set(0, 0.58, 0.05);
  santaHitMesh.layers.set(2);
  santaConfrontGroup.add(santaHitMesh);

  // Crimson XMAS365™ executive podium & gold-rimmed rug
  santaConfrontGroup.add(cyl(0.42, 0.45, 0.026, '#d69e2e', 0, 0.013, 0, 24, false));
  santaConfrontGroup.add(cyl(0.37, 0.4, 0.036, '#9b2c2c', 0, 0.022, 0, 24, false));
  santaConfrontGroup.add(cyl(0.28, 0.32, 0.075, '#5c3d24', 0, 0.055, 0, 18, false));
  santaConfrontGroup.add(cyl(0.29, 0.29, 0.022, '#ecc94b', 0, 0.095, 0, 18, false));
  santaConfrontGroup.add(
    fxPlane(0.95, 0.85, fxMaterial(radialTexture(), '#feb2b2', 0.38), 0, 0.04, 0, true),
  );

  // CEO Santa standing on the left-stage podium
  const ceoSantaMesh = buildMascotMesh('santa', 0.68);
  ceoSantaMesh.position.set(-0.04, 0.095, -0.02);
  ceoSantaMesh.rotation.y = 0.08;
  const ceoSantaPartyHat = buildPartyHat('#38a169', '#ffea79', 0.82);
  ceoSantaPartyHat.position.set(0, 0.94, 0);
  ceoSantaPartyHat.visible = false;
  ceoSantaMesh.add(ceoSantaPartyHat);
  santaConfrontGroup.add(ceoSantaMesh);

  // Oversized golden-framed XMAS365™ Merger Contract clipboard with glowing red wax seal
  const contractClipboard = new THREE.Group();
  contractClipboard.position.set(0.26, 0.46, 0.16);
  contractClipboard.rotation.set(-0.2, -0.26, -0.08);
  contractClipboard.add(box(0.34, 0.44, 0.028, '#d69e2e', 0, 0, 0, false));
  contractClipboard.add(glowBox(0.28, 0.38, 0.034, '#fffaf0', 0, -0.005, 0.004, 0.65));
  contractClipboard.add(box(0.14, 0.048, 0.044, '#ecc94b', 0, 0.2, 0.008, false));
  contractClipboard.add(box(0.23, 0.042, 0.038, '#c53030', 0, 0.125, 0.006, false));
  for (let cIdx = 0; cIdx < 6; cIdx++) {
    const cy = 0.065 - cIdx * 0.036;
    contractClipboard.add(box(0.2, 0.015, 0.038, '#2d3748', -0.01, cy, 0.006, false));
  }
  contractClipboard.add(glowSphere(0.042, '#e53e3e', 0.075, -0.125, 0.024, 1.25));
  contractClipboard.add(box(0.022, 0.065, 0.018, '#d69e2e', 0.065, -0.165, 0.018, false));
  santaConfrontGroup.add(contractClipboard);
  floating.push({ mesh: contractClipboard, phase: 0.4, baseY: 0.46 });

  santaConfrontGroup.visible = false;
  bay.add(santaConfrontGroup);
  const santaFocusPos = bayToWorld(theta, -0.45, 1.85, 4.0);
  const santaFocusLook = bayToWorld(theta, santaX, 0.55, santaZ);
  const santaWorldPos = bayToWorld(theta, -1.02, 0.06, santaZ + 0.34);

  // 5. Act 4 Surprise Party & 6-Tier Birthday Cake (`partyGroup`, pre-built once)
  const partyGroup = new THREE.Group();

  // 5a. Festive 6-Tier Holiday Birthday Cake at the bottom-center foreground in front of Leap Day
  const partyCakeGroup = new THREE.Group();
  partyCakeGroup.position.set(0, -0.02, 3.08);
  partyCakeGroup.scale.setScalar(0.68);

  // Low festive banquet platter & cream/gold tablecloth base
  partyCakeGroup.add(cyl(0.48, 0.52, 0.05, '#5c3d24', 0, 0.025, 0, 24, false));
  partyCakeGroup.add(cyl(0.54, 0.58, 0.09, '#fffaf0', 0, 0.08, 0, 24, false));
  partyCakeGroup.add(cyl(0.56, 0.56, 0.035, '#ecc94b', 0, 0.13, 0, 24, false));
  for (let sw = 0; sw < 12; sw++) {
    const swAng = (sw / 12) * Math.PI * 2;
    partyCakeGroup.add(
      sphere(0.03, '#d69e2e', Math.cos(swAng) * 0.56, 0.06, Math.sin(swAng) * 0.56, false),
    );
  }
  // Golden cake stand platter
  partyCakeGroup.add(cyl(0.42, 0.36, 0.04, '#d69e2e', 0, 0.16, 0, 20, false));

  // 6-tier holiday-colored Birthday Cake with frosting piping
  const cakeTierColors: readonly `#${string}`[] = [
    '#805ad5',
    '#ed8936',
    '#38a169',
    '#ed64a6',
    '#ecc94b',
    '#2b6cb0',
  ];
  const cakeTierRadii = [0.35, 0.295, 0.245, 0.195, 0.15, 0.11] as const;
  const cakeTierHeights = [0.095, 0.09, 0.085, 0.08, 0.075, 0.07] as const;
  let cakeY = 0.18;
  for (let tIdx = 0; tIdx < 6; tIdx++) {
    const tr = cakeTierRadii[tIdx] ?? 0.15;
    const th = cakeTierHeights[tIdx] ?? 0.08;
    const tHex = cakeTierColors[tIdx] ?? '#ecc94b';
    partyCakeGroup.add(cyl(tr, tr * 1.02, th, tHex, 0, cakeY + th * 0.5, 0, 20, false));
    // Cream frosting piping ring at the top of each tier
    partyCakeGroup.add(
      cyl(tr + 0.012, tr + 0.012, 0.018, '#fffaf0', 0, cakeY + th - 0.005, 0, 20, false),
    );
    cakeY += th;
  }

  // 6 lit birthday candles with warm flickering flames around the cake tiers
  const candleRingRadius = 0.22;
  const candleBaseY = 0.18 + 0.095 + 0.09;
  for (let cIdx = 0; cIdx < 6; cIdx++) {
    const cAng = (cIdx / 6) * Math.PI * 2 + 0.26;
    const cx = Math.cos(cAng) * candleRingRadius;
    const cz = Math.sin(cAng) * candleRingRadius;
    const waxHex = cakeTierColors[cIdx] ?? '#fffaf0';
    partyCakeGroup.add(
      buildCandle(0.016, 0.11, waxHex, cx, candleBaseY, cz, flames, cIdx * 1.05 + 0.3),
    );
  }

  // `366` / `FEB 29` Cake Topper crowning the top tier
  const topperGroup = new THREE.Group();
  topperGroup.position.set(0, cakeY, 0);
  topperGroup.add(cyl(0.012, 0.012, 0.09, '#d69e2e', 0, 0.045, 0, 8, false));
  topperGroup.add(box(0.22, 0.11, 0.024, '#d69e2e', 0, 0.11, 0, false));
  topperGroup.add(glowBox(0.19, 0.085, 0.028, '#fffaf0', 0, 0.11, 0.002, 0.75));
  topperGroup.add(box(0.19, 0.026, 0.032, '#c53030', 0, 0.138, 0.004, false));
  topperGroup.add(glowSphere(0.032, '#ffea79', 0, 0.188, 0, 1.25));
  partyCakeGroup.add(topperGroup);

  partyGroup.add(partyCakeGroup);

  // 5b. Overhead Festive Bunting / Confetti Garland (high across the upper wall, clear of the upper doors)
  const partyBuntingGroup = new THREE.Group();
  const buntingCount = 12;
  for (let bIdx = 0; bIdx < buntingCount; bIdx++) {
    const u = bIdx / (buntingCount - 1);
    const bx = -1.48 + u * 2.96;
    const sag = Math.sin(u * Math.PI) * 0.24;
    const by = 3.48 - sag;
    const bz = 0.36 + Math.sin(u * Math.PI) * 0.08;
    const flagHex = cakeTierColors[bIdx % cakeTierColors.length] ?? '#ecc94b';
    const pennant = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.14, 4), mat(flagHex));
    pennant.position.set(bx, by - 0.06, bz);
    pennant.rotation.x = Math.PI;
    pennant.rotation.y = Math.PI / 4;
    pennant.scale.z = 0.35;
    partyBuntingGroup.add(pennant);
    partyBuntingGroup.add(glowSphere(0.024, '#ffea79', bx, by + 0.01, bz, 1.05));
  }
  partyGroup.add(partyBuntingGroup);

  partyGroup.visible = false;
  bay.add(partyGroup);

  const syncState = (hotspotsOut: Hotspot3D[]): void => {
    const act = gameState.act();
    const lampsLit = gameState.completedRoomCount();
    const finaleSolved = gameState.solvedRuns.has('clause');

    const wallHex = act >= 4 ? '#553c9a' : act === 3 ? '#334155' : '#4a3525';
    const panelHex = act >= 4 ? '#44337a' : act === 3 ? '#1e293b' : '#36261a';
    wallMat.color.setHex(hexToNumber(wallHex));
    panelMat.color.setHex(hexToNumber(panelHex));
    carpetMat.color.setHex(hexToNumber(act === 3 ? '#742a2a' : '#7b341e'));

    leapDayPartyHat.visible = finaleSolved;
    ceoSantaPartyHat.visible = finaleSolved;
    corporateBannerGroup.visible = !finaleSolved;
    santaConfrontGroup.visible = lampsLit >= 6;
    partyGroup.visible = finaleSolved;

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

      const canInteract = unlocked || unlockItem !== null;

      const glowColor =
        d.room.id === 'thanksgiving'
          ? '#ff8c24'
          : complete
            ? '#ffe082'
            : canInteract
              ? '#ffae52'
              : '#161b24';
      const glowNum = hexToNumber(glowColor);
      d.recessDarkMesh.visible = !(canInteract || complete);
      d.recessGlowMesh.visible = canInteract || complete;
      d.recessGlowMat.color.setHex(glowNum);
      d.recessGlowMat.emissive.setHex(glowNum);
      d.recessGlowMat.emissiveIntensity = complete ? 1.15 : 1.05;

      const spillNum = hexToNumber(d.room.id === 'thanksgiving' ? '#ff922b' : glowColor);
      d.thresholdSpillMesh.visible = canInteract || complete;
      d.thresholdSpillMat.color.setHex(spillNum);
      d.thresholdSpillMat.emissive.setHex(spillNum);

      const baseRotY = complete ? -0.82 : canInteract ? -0.48 : 0;
      d.doorPivotEntry.baseRotY = baseRotY;
      if (!activeDoorHop || activeDoorHop.roomId !== d.room.id) {
        d.doorPivotEntry.pivot.rotation.y = baseRotY;
      }

      d.lockGroup.visible = !canInteract;
      d.lockBodyMat.color.setHex(hexToNumber(unlockItem ? '#ffea79' : '#d69e2e'));

      d.completeFxGroup.visible = complete;
      d.unlockedFxGroup.visible = !complete && canInteract;
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

    const freedCornerMascots: RoomId[] = [];
    for (const entry of cornerMascotEntries) {
      const isFreed = gameState.isRoomComplete(entry.room);
      entry.group.visible = isFreed;
      entry.hat.visible = finaleSolved;
      if (isFreed) {
        freedCornerMascots.push(entry.room.id);
        hotspotsOut.push({
          id: `hall-mascot:${entry.room.id}`,
          bay: 'hall',
          label: `${entry.room.icon} ${entry.room.shortTitle}`,
          sublabel: '💬 Tap to Chat',
          icon: entry.room.icon,
          status: 'done',
          accent: entry.room.accent,
          hiddenPill: true,
          worldPos: entry.worldPos,
          cameraPos: cornerFocusPos,
          cameraLook: cornerFocusLook,
          meshGroup: entry.group,
          onClick: () => {
            callbacks.onClickMascot?.(entry.room.id);
          },
        });
      }
    }

    if (freedCornerMascots.length > 0) {
      hotspotsOut.push({
        id: 'hall:mascot-corner',
        bay: 'hall',
        label: `🎉 Freed Mascots (${freedCornerMascots.length}/6)`,
        sublabel: '💬 Tap to Chat',
        icon: '🎉',
        status: freedCornerMascots.length >= 6 ? 'done' : 'ready',
        accent: '#d69e2e',
        worldPos: cornerWorldPos,
        cameraPos: cornerFocusPos,
        cameraLook: cornerFocusLook,
        onClick: () => {
          const picked =
            freedCornerMascots[lastChattedCornerIdx % freedCornerMascots.length] ??
            freedCornerMascots[0];
          lastChattedCornerIdx++;
          if (picked) callbacks.onClickMascot?.(picked);
        },
      });
    }

    const finaleUnlocked = lampsLit >= 6;
    if (finaleUnlocked) {
      hotspotsOut.push({
        id: 'finale:clause',
        bay: 'hall',
        kind: 'puzzle',
        label: '🎅 Merger Contract',
        sublabel: finaleSolved
          ? '6/6 Voided ✓ · Free Play'
          : `${gameState.voidedClauseCount()}/6 Voided · Red-Line!`,
        icon: '🎅',
        status: finaleSolved ? 'done' : 'ready',
        hero: false,
        accent: finaleSolved ? '#d69e2e' : '#c53030',
        worldPos: santaWorldPos,
        cameraPos: santaFocusPos,
        cameraLook: santaFocusLook,
        meshGroup: santaConfrontGroup,
        onClick: () => callbacks.onOpenProto(FINALE_PROTO.id, santaFocusPos, santaFocusLook),
      });
    }
  };

  return {
    bayId: 'hall',
    group: bay,
    flames,
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
        } else if (activeIntroPose.mode === 'pop') {
          const e = Math.max(0, activeIntroPose.elapsed);
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

      for (const fl of floating) {
        fl.mesh.position.y = fl.baseY + Math.abs(Math.sin(t * 1.9 + fl.phase)) * 0.028;
      }

      corporateBannerGroup.rotation.z = -0.024 + Math.sin(t * 0.85) * 0.008;
      corporateBannerGroup.rotation.x = Math.sin(t * 1.15 + 0.6) * 0.02;
    },
    syncState,
  };
}
