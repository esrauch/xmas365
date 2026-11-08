import * as THREE from 'three';
import {
  type BuiltBay,
  type DioramaCallbacks,
  box,
  buildHolidayAlcoveBay,
  cyl,
  glowSphere,
  mat,
  sphere,
} from './shared';

export function buildFourthBay(callbacks: DioramaCallbacks): BuiltBay {
  return buildHolidayAlcoveBay(
    {
      roomId: 'fourth',
      wallPalette: { wall: '#263a5e', panel: '#1c2c4a', frame: '#3182ce' },
      buildCenterpiece: (g) => {
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
      },
      decorateAlcove: (bay, flames) => {
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
      },
    },
    callbacks,
  );
}
