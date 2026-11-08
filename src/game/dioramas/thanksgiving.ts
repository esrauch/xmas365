import * as THREE from 'three';
import {
  type BuiltBay,
  type DioramaCallbacks,
  box,
  buildCandle,
  buildHolidayAlcoveBay,
  buildWineGlass,
  cyl,
  mat,
  sphere,
} from './shared';

export function buildThanksgivingBay(callbacks: DioramaCallbacks): BuiltBay {
  return buildHolidayAlcoveBay(
    {
      roomId: 'thanksgiving',
      wallPalette: { wall: '#73482d', panel: '#593620', frame: '#dd6b20' },
      buildCenterpiece: (g, accentOrGoldMat) => {
        // Oval Silver/Gold Banquet Platter with herb/cranberry garnish, golden roast turkey, wings & paper-frilled drumsticks
        // 1. Oval banquet platter with raised rim
        const platterRim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.44, 0.07, 20),
          accentOrGoldMat,
        );
        platterRim.position.set(0, 0.05, 0);
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
      },
      decorateAlcove: (bay, flames) => {
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
      },
    },
    callbacks,
  );
}
