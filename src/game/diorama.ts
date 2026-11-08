import * as THREE from 'three';
import { buildChristmasBay } from './dioramas/christmas';
import { buildEasterBay } from './dioramas/easter';
import { buildFourthBay } from './dioramas/fourth';
import { buildHallBay } from './dioramas/hall';
import { buildHalloweenBay } from './dioramas/halloween';
import {
  type BayId,
  type BayLightMood,
  type BuiltBay,
  type BuiltDiorama,
  type DioramaCallbacks,
  type Hotspot3D,
  type HotspotConnection,
  BAY_COUNT,
  BAY_ORDER,
  HALL_WALL_RADIUS,
  bayToWorld,
  cyl,
  getBayAngle,
  getBayLightMood,
  hexToNumber,
  toonMaterial,
} from './dioramas/shared';
import { buildThanksgivingBay } from './dioramas/thanksgiving';
import { buildValentinesBay } from './dioramas/valentines';
import { gameState } from './state';

export {
  type BayId,
  type BayLightMood,
  type BuiltDiorama,
  type DioramaCallbacks,
  type Hotspot3D,
  type HotspotConnection,
  BAY_COUNT,
  BAY_ORDER,
  HALL_WALL_RADIUS,
  bayToWorld,
  getBayAngle,
  getBayLightMood,
};

/**
 * Build the complete 7-bay Holiday Hall rotunda.
 * Bay 0 ('hall') holds the 6-Lamp Grand Door (Tuesday Finale), the Host/Villain,
 * and the Calendar Desk. Bays 1..6 hold the 6 Holiday Alcoves.
 *
 * All 7 bay scene graphs are built once at initialization and never recreated or disposed;
 * state changes mutate visibility, material colors, and hotspot descriptors in place via `syncState()`.
 */
export function buildHolidayHallDiorama(callbacks: DioramaCallbacks): BuiltDiorama {
  const root = new THREE.Group();
  const hotspots: Hotspot3D[] = [];

  // Single shadow-casting light source centered at the active diorama's emissive fixture
  const dioramaLight = new THREE.PointLight(0xff7733, 5.2, 5.8, 1.55);
  dioramaLight.castShadow = true;
  dioramaLight.shadow.mapSize.set(512, 512);
  dioramaLight.shadow.camera.near = 0.12;
  dioramaLight.shadow.camera.far = 7.5;
  dioramaLight.shadow.bias = -0.0005;
  dioramaLight.shadow.normalBias = 0.02;
  root.add(dioramaLight);

  // Rich dark walnut circular floor + ceiling canopy so the rotunda feels warm and moody
  const mainFloorMat = toonMaterial({ color: hexToNumber('#594230') });
  const mainFloorMesh = new THREE.Mesh(new THREE.CylinderGeometry(6.3, 6.3, 0.3, 28), mainFloorMat);
  mainFloorMesh.position.set(0, -0.15, 0);
  mainFloorMesh.receiveShadow = true;
  root.add(mainFloorMesh);

  root.add(cyl(2.3, 2.3, 0.03, '#7a5938', 0, 0.01, 0, 24, false));

  const innerRugMat = toonMaterial({ color: hexToNumber('#8c6940') });
  const innerRugMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.04, 24), innerRugMat);
  innerRugMesh.position.set(0, 0.015, 0);
  innerRugMesh.receiveShadow = true;
  root.add(innerRugMesh);

  root.add(cyl(6.4, 6.4, 0.28, '#3b2b20', 0, 5.85, 0, 28, false));

  // Build all 7 bays once and attach them to the rotunda root
  const hallBay = buildHallBay(callbacks);
  const bays: BuiltBay[] = [
    hallBay,
    buildHalloweenBay(callbacks),
    buildThanksgivingBay(callbacks),
    buildChristmasBay(callbacks),
    buildValentinesBay(callbacks),
    buildEasterBay(callbacks),
    buildFourthBay(callbacks),
  ];

  const bayById = new Map<BayId, BuiltBay>();
  for (const b of bays) {
    root.add(b.group);
    bayById.set(b.bayId, b);
  }

  const syncState = (): void => {
    const act = gameState.act();
    mainFloorMat.color.setHex(hexToNumber(act >= 4 ? '#6b46c1' : '#594230'));
    innerRugMat.color.setHex(hexToNumber(act === 3 ? '#742a2a' : '#8c6940'));

    hotspots.length = 0;
    for (const b of bays) {
      b.syncState(hotspots);
    }
  };

  // Initialize state and hotspot list immediately
  syncState();

  return {
    root,
    hotspots,
    leapDayHeadWorldPos: hallBay.leapDayHeadWorldPos,
    setDoorHop: hallBay.setDoorHop,
    setIntroPose: hallBay.setIntroPose,
    syncState,
    animate: (t, activeBay, showAllBays = false) => {
      // Cull the 6 non-active bays so Three.js only traverses, shadows, and renders the active bay
      for (const b of bays) {
        b.group.visible = showAllBays || b.bayId === activeBay;
      }

      // Animate Leap Day in Holiday Hall (door hop, intro pop-out, or idle breathing)
      if (showAllBays || activeBay === 'hall') {
        hallBay.animateHallActor(t);
      }

      // Subtle flame flicker + rising ember/spark particles on candles and the fireplace (only in visible bays)
      const visibleBays: readonly BayId[] = showAllBays ? BAY_ORDER : [activeBay];
      for (const bId of visibleBays) {
        const bayObj = bayById.get(bId);
        if (!bayObj) continue;

        for (const fl of bayObj.flames) {
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

        for (const ff of bayObj.fireflies) {
          ff.mesh.position.x = ff.baseX + Math.sin(t * 0.9 + ff.phase) * 0.06;
          ff.mesh.position.y = ff.baseY + Math.cos(t * 1.1 + ff.phase) * 0.05;
        }

        // Twinkle / slow-flash the upper fairy light strings in completed rooms
        for (const fl of bayObj.fairyLights) {
          if (!fl.active) continue;
          const wave =
            0.5 + 0.5 * Math.sin(t * 2.1 + fl.phase) * Math.cos(t * 0.85 - fl.phase * 0.5);
          const on = THREE.MathUtils.smoothstep(wave, 0.22, 0.82);
          fl.mat.color.copy(fl.offColor).lerp(fl.baseColor, 0.2 + 0.8 * on);
          fl.mat.emissiveIntensity = on * 1.3;
        }
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

      // Restored lamps breathe; dust drifts up and sways (only while the hall is in view).
      if (showAllBays || activeBay === 'hall') {
        for (const p of hallBay.fxPulses) {
          p.mat.opacity = p.base * (0.82 + 0.18 * Math.sin(t * 1.6 + p.phase));
        }
        const pos = hallBay.hallDust.geo.attributes['position'] as THREE.BufferAttribute;
        const { base, seed } = hallBay.hallDust;
        for (let i = 0; i < seed.length; i++) {
          const k = seed[i] ?? 0;
          const rise = ((t * (0.04 + k * 0.05) + k) % 1) * 0.6;
          pos.setXYZ(
            i,
            (base[i * 3] ?? 0) + Math.sin(t * (0.2 + k * 0.3) + k * 9) * 0.12,
            (base[i * 3 + 1] ?? 0) + rise,
            (base[i * 3 + 2] ?? 0) + Math.cos(t * (0.15 + k * 0.2) + k * 7) * 0.08,
          );
        }
        pos.needsUpdate = true;
      }
    },
  };
}
