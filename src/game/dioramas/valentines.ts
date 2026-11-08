import * as THREE from 'three';
import {
  type BuiltBay,
  type DioramaCallbacks,
  box,
  buildCandle,
  buildHolidayAlcoveBay,
  buildPresentBox,
  buildRoseBouquet,
  buildWineGlass,
  cyl,
  glowBox,
  glowMat,
  glowSphere,
  mat,
  sphere,
} from './shared';

export function buildValentinesBay(callbacks: DioramaCallbacks): BuiltBay {
  return buildHolidayAlcoveBay(
    {
      roomId: 'valentines',
      wallPalette: { wall: '#632944', panel: '#4d1e34', frame: '#d53f8c' },
      buildCenterpiece: (g) => {
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
      },
      decorateAlcove: (bay, flames) => {
        // 1. Pleated crimson velvet drapes & gold tassel tie-backs framing the left and right alcove edges
        for (const side of [-1, 1] as const) {
          bay.add(cyl(0.18, 0.24, 2.0, '#821c46', side * 1.66, 2.55, 0.26, 12, false));
          bay.add(cyl(0.22, 0.16, 1.65, '#6b1539', side * 1.72, 0.85, 0.26, 12, false));
          // Golden rope tie-back ring & hanging tassel at waist height
          const tieRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.19, 0.028, 8, 14),
            mat('#f6e05e'),
          );
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
      },
    },
    callbacks,
  );
}
