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

export function buildEasterBay(callbacks: DioramaCallbacks): BuiltBay {
  return buildHolidayAlcoveBay(
    {
      roomId: 'easter',
      wallPalette: { wall: '#5c4d26', panel: '#473b1c', frame: '#ecc94b' },
      buildCenterpiece: (g, _accentOrGoldMat, crownGlowMat) => {
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
        const crownEgg = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), crownGlowMat);
        crownEgg.position.set(0, 0.94, 0.16);
        crownEgg.scale.set(0.84, 1.28, 0.84);
        g.add(crownEgg);
      },
      decorateAlcove: (bay, _flames, fireflies) => {
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
        wateringCan.add(
          cyl(0.065, 0.03, 0.05, '#ecc94b', 0, 0.34, 0.36, 10).rotateX(Math.PI / 3.2),
        );
        const canHandle = new THREE.Mesh(
          new THREE.TorusGeometry(0.12, 0.02, 8, 12),
          mat('#cbd5e0'),
        );
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
      },
    },
    callbacks,
  );
}
