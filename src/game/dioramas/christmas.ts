import * as THREE from 'three';
import {
  type BuiltBay,
  type DioramaCallbacks,
  box,
  buildHolidayAlcoveBay,
  buildPresentBox,
  cyl,
  glowBox,
  glowMat,
  glowSphere,
  mat,
  sphere,
} from './shared';

export function buildChristmasBay(callbacks: DioramaCallbacks): BuiltBay {
  return buildHolidayAlcoveBay(
    {
      roomId: 'christmas',
      wallPalette: { wall: '#284d3e', panel: '#1e3b30', frame: '#c53030' },
      buildCenterpiece: (g, _accentOrGoldMat, crownGlowMat) => {
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
        for (let i = 0; i < 5; i++) {
          const sp = new THREE.Group();
          sp.rotation.z = (i * Math.PI * 2) / 5;
          const pt = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.16, 4), crownGlowMat);
          pt.rotation.y = Math.PI / 4;
          pt.position.y = 0.08;
          sp.add(pt);
          starTop.add(sp);
        }
        starTop.add(glowSphere(0.052, '#ffffff', 0, 0, 0.02, 1.1));
        g.add(starTop);
      },
      decorateAlcove: (bay, flames) => {
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
      },
    },
    callbacks,
  );
}
