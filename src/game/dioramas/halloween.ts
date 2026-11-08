import * as THREE from 'three';
import {
  type BuiltBay,
  type DioramaCallbacks,
  box,
  buildCandle,
  buildHolidayAlcoveBay,
  cyl,
  glowBox,
  glowMat,
  glowSphere,
  mat,
  sphere,
} from './shared';

export function buildHalloweenBay(callbacks: DioramaCallbacks): BuiltBay {
  return buildHolidayAlcoveBay(
    {
      roomId: 'halloween',
      wallPalette: { wall: '#463063', panel: '#35234d', frame: '#805ad5' },
      buildCenterpiece: (g, accentOrGoldMat) => {
        // Sculpted Gothic Arch Frame with concentric silver spiderweb & 8-legged Widow Spider
        // 1. Stepped stone base & twin Gothic columns with pointed arch & finials
        g.add(box(1.06, 0.1, 0.24, '#2d2438', 0, 0.05, 0));
        const trimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.06, 0.2), accentOrGoldMat);
        trimMesh.position.set(0, 0.12, 0.01);
        g.add(trimMesh);
        for (const side of [-1, 1] as const) {
          const cx = side * 0.44;
          const colMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.058, 0.068, 0.56, 10),
            accentOrGoldMat,
          );
          colMesh.position.set(cx, 0.4, 0);
          g.add(colMesh);
          // Pointed Gothic pinnacle finial on each column
          const finial = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.18, 6), accentOrGoldMat);
          finial.position.set(cx, 0.77, 0);
          g.add(finial);
          // Pointed Gothic arch ribs meeting at the apex
          const archRib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.14), accentOrGoldMat);
          archRib.position.set(side * 0.22, 0.8, 0);
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
      },
      decorateAlcove: (bay, flames) => {
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
      },
    },
    callbacks,
  );
}
