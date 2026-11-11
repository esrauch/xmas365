/**
 * Lights board generation: spanning trees, snowflake-framed trees,
 * and holiday twist synthesizers.
 */
import { Budget } from '../core/budget';
import { area, frames, inFrame, mirrorSquare, offAxis, segment } from '../core/mirror';
import { type Rng, shuffle } from '../core/rng';
import {
  DIRS,
  E,
  N,
  OPP,
  type Panel,
  S,
  STEP,
  type Shape,
  type Spot,
  W,
  key,
  parse,
} from './model';
import { light, piecesSymmetricIn, wiresOf } from './rules';
import { countSolutions } from './solve';

/** Theme words with all distinct letters (so different letters always have different distances). */
export const THEME_WORDS: Record<number, readonly string[]> = {
  2: ['GO', 'ON', 'UP', 'IN', 'TO', 'BY'],
  3: ['STAR', 'GLOW', 'WARM', 'GOLD', 'SNOW', 'PINE', 'YULE', 'GIFT', 'COZY'].filter(
    (w) => w.length === 3,
  ),
  4: ['STAR', 'GLOW', 'WARM', 'GOLD', 'SNOW', 'PINE', 'YULE', 'GIFT', 'COZY', 'NOEL'],
  5: ['LIGHT', 'SHINE', 'SPARK', 'FROST', 'ANGEL', 'FLAME', 'CHIME', 'CROWN', 'CAROL'],
};
const WORDS_3 = ['JOY', 'SUN', 'ICY', 'FIR', 'ELM', 'BOW', 'RED', 'LIT', 'RAY', 'WAX'];

/** Partition a board into balanced pie-wedge slices around a center plug `*`. */
export function makePieSlices(
  height: number,
  width: number,
  numSlices: number,
  random: Rng,
  needInternalCycle = false,
  shape?: Shape,
): { plug: Spot; slices: string[] } {
  const isInside = (r: number, c: number): boolean => !shape || shape[r]?.[c] === '#';
  if (
    height === 5 &&
    width === 5 &&
    numSlices === 2 &&
    needInternalCycle &&
    (!shape || shape.every((row) => !row.includes('.')))
  ) {
    return {
      plug: [2, 3],
      slices: ['BBBAA', 'BBBBA', 'BBB*A', 'BBAAA', 'BBAAA'],
    };
  }
  if (
    height === 6 &&
    width === 6 &&
    numSlices === 2 &&
    (!shape || shape.every((row) => !row.includes('.')))
  ) {
    return {
      plug: [0, 3],
      slices: ['BBB*AA', 'BBBBAA', 'BBBBAA', 'BBBAAA', 'BBBAAA', 'BBBAAA'],
    };
  }
  if (
    height === 7 &&
    width === 7 &&
    numSlices === 3 &&
    (!shape || shape.every((row) => !row.includes('.')))
  ) {
    return {
      plug: [3, 3],
      slices: ['BBBCCCC', 'BBBCCCC', 'BBBCCCC', 'BBB*AAA', 'BBBAAAA', 'BBBAAAA', 'BBBAAAA'],
    };
  }
  const midR = Math.floor(height / 2);
  const midC = Math.floor(width / 2);
  if (!isInside(midR, midC)) {
    // Wreath (ring with center hole)
    const pr = 1;
    const pc = midC;
    const plug: Spot = [pr, pc];
    const grid = Array.from({ length: height }, (_, r) =>
      Array.from({ length: width }, (_, c) => {
        if (!isInside(r, c)) return '.';
        if (r === pr && c === pc) return '*';
        if (numSlices === 2) {
          return (r <= 1 && c < midC) || (r <= height - 3 && c >= midC && !(r === 2 && c === midC))
            ? 'B'
            : 'A';
        }
        if ((r <= 1 && c < midC) || (r === 0 && c <= midC + 1)) return 'B';
        if (r <= height - 3 && c >= midC && !(r === 2 && c === midC)) return 'A';
        return 'C';
      }),
    );
    return { plug, slices: grid.map((row) => row.join('')) };
  }
  if (!isInside(0, 0) && isInside(height - 1, 0)) {
    // Tree shape (narrow top, wide bottom)
    if (height <= 6) {
      const pr = 2;
      const pc = midC;
      const plug: Spot = [pr, pc];
      const grid = Array.from({ length: height }, (_, r) =>
        Array.from({ length: width }, (_, c) => {
          if (!isInside(r, c)) return '.';
          if (r === pr && c === pc) return '*';
          return c < midC || (c === midC && r < pr) ? 'B' : 'A';
        }),
      );
      return { plug, slices: grid.map((row) => row.join('')) };
    }
    const pr = height - 2;
    const pc = midC;
    const plug: Spot = [pr, pc];
    const grid = Array.from({ length: height }, (_, r) =>
      Array.from({ length: width }, (_, c) => {
        if (!isInside(r, c)) return '.';
        if (r === pr && c === pc) return '*';
        if (numSlices === 2) return r <= height - 3 ? 'B' : 'A';
        if (r <= height - 3) return 'B';
        return c < midC ? 'C' : 'A';
      }),
    );
    return { plug, slices: grid.map((row) => row.join('')) };
  }
  const pr = midR;
  const pc = midC;
  const plug: Spot = [pr, pc];
  const grid: string[][] = Array.from({ length: height }, (_, r) =>
    Array.from({ length: width }, (_, c) => (isInside(r, c) ? 'A' : '.')),
  );
  (grid[pr] as string[])[pc] = '*';

  if (numSlices === 2) {
    const vertical = random() < 0.5;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (!isInside(r, c) || (r === pr && c === pc)) continue;
        const firstHalf = vertical
          ? c < pc || (c === pc && r < pr)
          : r < pr || (r === pr && c < pc);
        (grid[r] as string[])[c] = firstHalf ? 'B' : 'A';
      }
    }
  } else {
    const offsets = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const theta0 = offsets[Math.floor(random() * offsets.length)] ?? 0;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (!isInside(r, c) || (r === pr && c === pc)) continue;
        const raw = Math.atan2(r - pr, c - pc) - theta0;
        const norm = ((raw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const idx = Math.min(numSlices - 1, Math.floor((norm / (2 * Math.PI)) * numSlices));
        (grid[r] as string[])[c] = letters[idx] ?? 'A';
      }
    }
  }

  return { plug, slices: grid.map((row) => row.join('')) };
}

/** Build a random light string (spanning tree) over a board shape, optionally planting 2x2 rotatable leaf-swap cycles. */
export function randomTree(
  shape: Shape,
  plug: Spot,
  random: Rng,
  style: 'branching' | 'winding' = 'branching',
  cycles = 0,
  plugDegree?: number,
  slices?: string[],
  straddleCycles = 0,
): Panel | null {
  const H = shape.length;
  const Wd = shape[0]?.length ?? 0;
  const inside = (r: number, c: number): boolean => shape[r]?.[c] === '#';
  const sliceAt = (r: number, c: number): string | undefined => slices?.[r]?.[c];

  const cells: Spot[] = [];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < Wd; c++) {
      if (inside(r, c)) cells.push([r, c]);
    }
  }

  const mask = new Map<string, number>(cells.map(([r, c]) => [key(r, c), 0]));
  const link = (a: Spot, d: number): void => {
    const [dr, dc] = STEP[d] as Spot;
    mask.set(key(...a), (mask.get(key(...a)) ?? 0) | d);
    mask.set(
      key(a[0] + dr, a[1] + dc),
      (mask.get(key(a[0] + dr, a[1] + dc)) ?? 0) | (OPP[d] as number),
    );
  };
  const linkSpots = (a: Spot, b: Spot): void => {
    const dr = b[0] - a[0];
    const dc = b[1] - a[1];
    const d = dr === -1 ? N : dr === 1 ? S : dc === 1 ? E : W;
    link(a, d);
  };

  if (style === 'branching') {
    const leafSet = new Set<string>();
    const hubSet = new Set<string>();
    const hubPairs: [Spot, Spot][] = [];

    const effCycles = H < 7 || Wd < 7 ? Math.min(cycles, 1) : cycles;
    const effStraddle = slices && H >= 6 && Wd >= 6 ? straddleCycles : 0;

    if ((effCycles > 0 || effStraddle > 0) && H >= 5 && Wd >= 5) {
      const hasOffBoard = shape.some((row) => row.includes('.'));
      const rMin = hasOffBoard ? 0 : 1;
      const rMax = hasOffBoard ? H - 1 : H - 2;
      const cMin = hasOffBoard ? 0 : 1;
      const cMax = hasOffBoard ? Wd - 1 : Wd - 2;
      const blocks: Spot[] = [];
      for (let r = rMin; r < rMax; r++) {
        for (let c = cMin; c < cMax; c++) {
          const sq: Spot[] = [
            [r, c],
            [r, c + 1],
            [r + 1, c],
            [r + 1, c + 1],
          ];
          if (sq.every(([rr, cc]) => inside(rr, cc) && !(rr === plug[0] && cc === plug[1]))) {
            blocks.push([r, c]);
          }
        }
      }

      const staysConnected = (leaves: Set<string>): boolean => {
        if (!hasOffBoard) return true;
        const activeCount = cells.length - leaves.size;
        if (activeCount <= 0 || leaves.has(key(...plug))) return false;
        const seen = new Set<string>([key(...plug)]);
        const queue: Spot[] = [plug];
        while (queue.length) {
          const [cr, cc] = queue.shift() as Spot;
          const cs = sliceAt(cr, cc);
          for (const d of DIRS) {
            const [dr, dc] = STEP[d] as Spot;
            const nr = cr + dr;
            const nc = cc + dc;
            const nk = key(nr, nc);
            if (!inside(nr, nc) || leaves.has(nk) || seen.has(nk)) continue;
            const ns = sliceAt(nr, nc);
            if (slices && cs !== '*' && ns !== '*' && cs !== ns) continue;
            seen.add(nk);
            queue.push([nr, nc]);
          }
        }
        return seen.size === activeCount;
      };

      const chosenBlocks: { B: Spot; D: Spot; r: number; c: number }[] = [];

      const tryPickBlocks = (wantCount: number, straddle: boolean): boolean => {
        let picked = 0;
        for (const [r, c] of shuffle(random, blocks)) {
          if (picked >= wantCount) break;
          if (chosenBlocks.some((b) => Math.abs(r - b.r) < 2 && Math.abs(c - b.c) < 2)) continue;
          for (const diag of shuffle(random, [true, false])) {
            const L1: Spot = diag ? [r, c] : [r, c + 1];
            const L2: Spot = diag ? [r + 1, c + 1] : [r + 1, c];
            const B: Spot = diag ? [r, c + 1] : [r, c];
            const D: Spot = diag ? [r + 1, c] : [r + 1, c + 1];
            const nextLeaves = new Set([...leafSet, key(...L1), key(...L2)]);

            let pairB: Spot = L1;
            let pairD: Spot = L2;

            if (slices) {
              const sB = sliceAt(B[0], B[1]);
              const sD = sliceAt(D[0], D[1]);
              const sL1 = sliceAt(L1[0], L1[1]);
              const sL2 = sliceAt(L2[0], L2[1]);
              if (!sB || !sD || sB === '*' || sD === '*') continue;
              if (straddle) {
                if (sB === sD) continue;
                if (sL1 === sB && sL2 === sD) {
                  pairB = L1;
                  pairD = L2;
                } else if (sL2 === sB && sL1 === sD) {
                  pairB = L2;
                  pairD = L1;
                } else {
                  continue;
                }
              } else {
                if (sB !== sD || sL1 !== sB || sL2 !== sB) continue;
              }
            }

            const nextHubs = [...chosenBlocks.flatMap((b) => [b.B, b.D]), B, D];
            const ok = nextHubs.every(([hr, hc]) => {
              const hs = sliceAt(hr, hc);
              let ext = 0;
              for (const d of DIRS) {
                const [dr, dc] = STEP[d] as Spot;
                const nr = hr + dr;
                const nc = hc + dc;
                if (!inside(nr, nc) || nextLeaves.has(key(nr, nc))) continue;
                if (slices && sliceAt(nr, nc) !== hs && sliceAt(nr, nc) !== '*') continue;
                ext++;
              }
              return ext >= 2;
            });
            if (ok && staysConnected(nextLeaves)) {
              chosenBlocks.push({ B, D, r, c });
              leafSet.add(key(...L1)).add(key(...L2));
              hubSet.add(key(...B)).add(key(...D));
              hubPairs.push([B, pairB], [D, pairD]);
              picked++;
              break;
            }
          }
        }
        return picked === wantCount;
      };

      if (effStraddle > 0 && !tryPickBlocks(effStraddle, true)) return null;
      if (effCycles > 0 && !tryPickBlocks(effCycles, false)) return null;
    }

    const activeCells = cells.filter(([r, c]) => !leafSet.has(key(r, c)));
    const parent = new Map(activeCells.map(([r, c]) => [key(r, c), key(r, c)]));
    const find = (k: string): string => {
      while (parent.get(k) !== k) k = parent.get(k) as string;
      return k;
    };
    const deg = new Map<string, number>(activeCells.map(([r, c]) => [key(r, c), 0]));

    const edges: [Spot, number][] = [];
    for (const s of activeCells) {
      for (const d of [E, S]) {
        const t: Spot = [s[0] + (STEP[d] as Spot)[0], s[1] + (STEP[d] as Spot)[1]];
        if (!inside(...t) || leafSet.has(key(...t))) continue;
        if (slices) {
          const ss = sliceAt(s[0], s[1]);
          const st = sliceAt(t[0], t[1]);
          if (ss !== '*' && st !== '*' && ss !== st) continue;
        }
        edges.push([s, d]);
      }
    }
    const shuffledEdges = shuffle(random, edges);
    edges.splice(0, edges.length, ...shuffledEdges);

    const plugKey = key(...plug);
    const fedSlices = new Set<string>();
    const canAdd = (s: Spot, t: Spot, ks: string, kt: string): boolean => {
      if (hubSet.has(ks) && (deg.get(ks) ?? 0) >= 2) return false;
      if (hubSet.has(kt) && (deg.get(kt) ?? 0) >= 2) return false;
      if (plugDegree !== undefined) {
        if (ks === plugKey && (deg.get(ks) ?? 0) >= plugDegree) return false;
        if (kt === plugKey && (deg.get(kt) ?? 0) >= plugDegree) return false;
      }
      if (slices && (ks === plugKey || kt === plugKey)) {
        const other = ks === plugKey ? t : s;
        const sl = sliceAt(other[0], other[1]);
        if (!sl || sl === '*' || fedSlices.has(sl)) return false;
      }
      return find(ks) !== find(kt);
    };
    const recordAdd = (s: Spot, t: Spot, d: number, ks: string, kt: string): void => {
      parent.set(find(ks), find(kt));
      link(s, d);
      deg.set(ks, (deg.get(ks) ?? 0) + 1);
      deg.set(kt, (deg.get(kt) ?? 0) + 1);
      if (slices && (ks === plugKey || kt === plugKey)) {
        const other = ks === plugKey ? t : s;
        const sl = sliceAt(other[0], other[1]);
        if (sl) fedSlices.add(sl);
      }
    };

    // Prioritize giving hubs their 2 external edges and the plug its branches
    const priorityEdges = [...edges].sort((x, y) => {
      const xk0 = key(...x[0]);
      const xk1 = key(x[0][0] + (STEP[x[1]] as Spot)[0], x[0][1] + (STEP[x[1]] as Spot)[1]);
      const yk0 = key(...y[0]);
      const yk1 = key(y[0][0] + (STEP[y[1]] as Spot)[0], y[0][1] + (STEP[y[1]] as Spot)[1]);
      const xScore =
        (hubSet.has(xk0) || hubSet.has(xk1) ? 0 : 2) + (xk0 === plugKey || xk1 === plugKey ? 0 : 1);
      const yScore =
        (hubSet.has(yk0) || hubSet.has(yk1) ? 0 : 2) + (yk0 === plugKey || yk1 === plugKey ? 0 : 1);
      return xScore - yScore;
    });

    for (const [s, d] of priorityEdges) {
      const t: Spot = [s[0] + (STEP[d] as Spot)[0], s[1] + (STEP[d] as Spot)[1]];
      const ks = key(...s);
      const kt = key(...t);
      if (!canAdd(s, t, ks, kt)) continue;
      if (
        !hubSet.has(ks) &&
        !hubSet.has(kt) &&
        ks !== plugKey &&
        kt !== plugKey &&
        ((deg.get(ks) ?? 0) >= 2 || (deg.get(kt) ?? 0) >= 2) &&
        random() < (slices ? 0.2 : 0.65)
      ) {
        continue;
      }
      recordAdd(s, t, d, ks, kt);
    }

    // Second pass: connect any remaining components
    for (const [s, d] of edges) {
      const t: Spot = [s[0] + (STEP[d] as Spot)[0], s[1] + (STEP[d] as Spot)[1]];
      const ks = key(...s);
      const kt = key(...t);
      if (!canAdd(s, t, ks, kt)) continue;
      recordAdd(s, t, d, ks, kt);
    }

    if (plugDegree !== undefined && (deg.get(plugKey) ?? 0) !== plugDegree) return null;

    // Verify all hubs got exact degree 2 in activeCells and activeCells is connected
    for (const hk of hubSet) {
      if ((deg.get(hk) ?? 0) !== 2) return null;
    }
    const roots = new Set(activeCells.map(([r, c]) => find(key(r, c))));
    if (roots.size !== 1) return null;

    // Attach the planted leaves to their hubs (making each hub a degree-3 T-junction)
    for (const [hub, leaf] of hubPairs) {
      linkSpots(hub, leaf);
    }
  } else {
    const seen = new Set<string>();
    const stack: Spot[] = [plug];
    seen.add(key(...plug));
    while (stack.length) {
      const at = stack[stack.length - 1] as Spot;
      const next = DIRS.filter((d) => {
        const t: Spot = [at[0] + (STEP[d] as Spot)[0], at[1] + (STEP[d] as Spot)[1]];
        return inside(...t) && !seen.has(key(...t));
      });
      if (!next.length) {
        stack.pop();
        continue;
      }
      const d = next[Math.floor(random() * next.length)] as number;
      const t: Spot = [at[0] + (STEP[d] as Spot)[0], at[1] + (STEP[d] as Spot)[1]];
      link(at, d);
      seen.add(key(...t));
      stack.push(t);
    }
    if (seen.size !== cells.length) return null;
  }

  const rows = shape.map((row, r) =>
    [...row].map((ch, c) => (ch === '#' ? (mask.get(key(r, c)) ?? 0).toString(16) : '.')).join(''),
  );
  if (rows.some((row) => row.includes('0'))) return null;

  return { name: 'generated', rows, plug, ...(slices ? { slices } : {}) };
}

/**
 * Build a spanning tree with a guaranteed >= 3x3 near-square snowflake frame
 * where the wires inside the frame mirror across the axis (`offAxis >= 3`),
 * while wires outside the frame carry on freely.
 */
export function randomSnowTree(
  shape: Shape,
  plug: Spot,
  random: Rng,
  wantBlocks = 0,
): Panel | null {
  const H = shape.length;
  const Wd = shape[0]?.length ?? 0;
  const inside = (r: number, c: number): boolean => shape[r]?.[c] === '#';
  const isInterior = (r: number, c: number): boolean =>
    DIRS.every((d) => inside(r + (STEP[d] as Spot)[0], c + (STEP[d] as Spot)[1]));

  const cells: Spot[] = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < Wd; c++) if (inside(r, c)) cells.push([r, c]);

  const straddleCandsFor = (
    f: ReturnType<typeof frames>[number],
  ): {
    B: Spot;
    D: Spot;
    L1: Spot;
    L2: Spot;
    mB: Spot;
    mD: Spot;
    mL1: Spot;
    mL2: Spot;
  }[] => {
    const cands: {
      B: Spot;
      D: Spot;
      L1: Spot;
      L2: Spot;
      mB: Spot;
      mD: Spot;
      mL1: Spot;
      mL2: Spot;
    }[] = [];
    for (let r = 0; r < H - 1; r++) {
      for (let c = 0; c < Wd - 1; c++) {
        const sq: Spot[] = [
          [r, c],
          [r, c + 1],
          [r + 1, c],
          [r + 1, c + 1],
        ];
        if (!sq.every(([rr, cc]) => inside(rr, cc) && !(rr === plug[0] && cc === plug[1])))
          continue;
        if (sq.filter(([rr, cc]) => inFrame(f, rr, cc)).length !== 2) continue;
        for (const diag of [true, false]) {
          const c1 = diag ? (sq[0] as Spot) : (sq[1] as Spot);
          const c2 = diag ? (sq[3] as Spot) : (sq[2] as Spot);
          const o1 = diag ? (sq[1] as Spot) : (sq[0] as Spot);
          const o2 = diag ? (sq[2] as Spot) : (sq[3] as Spot);
          const B = inFrame(f, ...c1) ? c1 : c2;
          const D = inFrame(f, ...c1) ? c2 : c1;
          const L1 = inFrame(f, ...o1) ? o1 : o2;
          const L2 = inFrame(f, ...o1) ? o2 : o1;
          if (!inFrame(f, ...B) || inFrame(f, ...D) || !inFrame(f, ...L1) || inFrame(f, ...L2))
            continue;
          if (!isInterior(...B) || !isInterior(...D)) continue;
          const mB = mirrorSquare(f, B[0], B[1]);
          const mD = mirrorSquare(f, D[0], D[1]);
          const mL1 = mirrorSquare(f, L1[0], L1[1]);
          const mL2 = mirrorSquare(f, L2[0], L2[1]);
          if (!inside(...mB) || !inside(...mD) || !inside(...mL1) || !inside(...mL2)) continue;
          if (mL1[0] === plug[0] && mL1[1] === plug[1]) continue;
          const all8 = new Set([B, D, L1, L2, mB, mD, mL1, mL2].map(([rr, cc]) => key(rr, cc)));
          if (all8.size !== 8) continue;
          cands.push({ B, D, L1, L2, mB, mD, mL1, mL2 });
        }
      }
    }
    return cands;
  };

  const maxDisjoint = (cands: ReturnType<typeof straddleCandsFor>, want: number): number => {
    if (want <= 0 || cands.length === 0) return 0;
    if (want === 1) return 1;
    const sets = cands.map(
      (c) => new Set([c.B, c.D, c.L1, c.L2, c.mB, c.mD, c.mL1, c.mL2].map((s) => key(...s))),
    );
    for (let i = 0; i < sets.length; i++) {
      const a = sets[i] as Set<string>;
      for (let j = i + 1; j < sets.length; j++) {
        const b = sets[j] as Set<string>;
        if ([...a].every((k) => !b.has(k))) return 2;
      }
    }
    return 1;
  };

  const validFrames = shuffle(
    random,
    frames(Wd, H, 3).filter((f) => {
      const h = f.bottom - f.top + 1;
      const w = f.right - f.left + 1;
      if ((f.axis === 'v' ? w : h) % 2 !== 0) return false;
      if (area(f) >= Wd * H * 0.85) return false;
      if (Math.min(h, w) / Math.max(h, w) < 0.6) return false;
      let countIn = 0;
      for (let r = f.top; r <= f.bottom; r++) {
        for (let c = f.left; c <= f.right; c++) {
          const [mr, mc] = mirrorSquare(f, r, c);
          if (inside(r, c) !== inside(mr, mc)) return false;
          if (inside(r, c)) countIn++;
        }
      }
      return countIn >= 6 && countIn <= cells.length - 2;
    }),
  );
  const frameScore = new Map(
    validFrames.map((vf) => [vf, maxDisjoint(straddleCandsFor(vf), wantBlocks)]),
  );
  validFrames.sort(
    (a, b) => (frameScore.get(b) ?? 0) - (frameScore.get(a) ?? 0) || area(b) - area(a),
  );
  const topFrames = validFrames.filter(
    (vf) => (frameScore.get(vf) ?? 0) === (frameScore.get(validFrames[0] as typeof vf) ?? 0),
  );
  const f = topFrames[Math.floor(random() * Math.min(topFrames.length, 8))];
  if (!f) return null;

  const rawCands = wantBlocks > 0 ? shuffle(random, straddleCandsFor(f)) : [];
  // Order rawCands so a disjoint pair comes first when wantBlocks >= 2
  const cands = [...rawCands];
  if (wantBlocks >= 2 && cands.length >= 2) {
    const sets = cands.map(
      (c) => new Set([c.B, c.D, c.L1, c.L2, c.mB, c.mD, c.mL1, c.mL2].map((s) => key(...s))),
    );
    let foundPair: [number, number] | null = null;
    for (let i = 0; i < sets.length && !foundPair; i++) {
      const a = sets[i] as Set<string>;
      for (let j = i + 1; j < sets.length; j++) {
        const b = sets[j] as Set<string>;
        if ([...a].every((k) => !b.has(k))) {
          foundPair = [i, j];
          break;
        }
      }
    }
    if (foundPair) {
      const [i, j] = foundPair;
      const first = cands[i] as (typeof cands)[number];
      const second = cands[j] as (typeof cands)[number];
      const rest = cands.filter((_, idx) => idx !== i && idx !== j);
      cands.splice(0, cands.length, first, second, ...rest);
    }
  }
  const chosen: typeof cands = [];
  const usedKeys = new Set<string>();
  const leafSet = new Set<string>();
  const hubCap = new Map<string, number>();
  const hubPairs: [Spot, Spot][] = [];

  for (const cand of cands) {
    if (chosen.length >= wantBlocks) break;
    const keys = [
      key(...cand.B),
      key(...cand.D),
      key(...cand.L1),
      key(...cand.L2),
      key(...cand.mB),
      key(...cand.mD),
      key(...cand.mL1),
      key(...cand.mL2),
    ];
    if (keys.some((k) => usedKeys.has(k))) continue;
    const nextLeaves = new Set([...leafSet, key(...cand.L1), key(...cand.L2), key(...cand.mL1)]);
    const nextHubs = [...chosen.flatMap((c) => [c.B, c.D]), cand.B, cand.D];
    const hubsOk = nextHubs.every(([hr, hc]) => {
      let ext = 0;
      for (const d of DIRS) {
        const nr = hr + (STEP[d] as Spot)[0];
        const nc = hc + (STEP[d] as Spot)[1];
        if (!inside(nr, nc) || nextLeaves.has(key(nr, nc))) continue;
        if (inFrame(f, hr, hc) || inFrame(f, nr, nc)) {
          const [mhr, mhc] = mirrorSquare(f, hr, hc);
          const [mnr, mnc] = mirrorSquare(f, nr, nc);
          if (
            !inside(mhr, mhc) ||
            !inside(mnr, mnc) ||
            nextLeaves.has(key(mhr, mhc)) ||
            nextLeaves.has(key(mnr, mnc))
          )
            continue;
        }
        ext++;
      }
      return ext >= 2;
    });
    if (!hubsOk) continue;
    for (const k of keys) usedKeys.add(k);
    chosen.push(cand);
    leafSet
      .add(key(...cand.L1))
      .add(key(...cand.L2))
      .add(key(...cand.mL1));
    hubCap.set(key(...cand.B), 2);
    hubCap.set(key(...cand.D), 2);
    hubCap.set(key(...cand.mB), 3);
    hubPairs.push([cand.B, cand.L2], [cand.D, cand.L1], [cand.mD, cand.mL1]);
  }

  const activeCells = cells.filter(([r, c]) => !leafSet.has(key(r, c)));
  const mask = new Map<string, number>(cells.map(([r, c]) => [key(r, c), 0]));
  const parent = new Map(activeCells.map(([r, c]) => [key(r, c), key(r, c)]));
  const deg = new Map<string, number>(activeCells.map(([r, c]) => [key(r, c), 0]));
  const find = (k: string): string => {
    while (parent.get(k) !== k) k = parent.get(k) as string;
    return k;
  };
  const linkSpots = (a: Spot, b: Spot): void => {
    const dr = b[0] - a[0];
    const dc = b[1] - a[1];
    const d = dr === -1 ? N : dr === 1 ? S : dc === 1 ? E : W;
    mask.set(key(...a), (mask.get(key(...a)) ?? 0) | d);
    mask.set(key(...b), (mask.get(key(...b)) ?? 0) | (OPP[d] as number));
    deg.set(key(...a), (deg.get(key(...a)) ?? 0) + 1);
    deg.set(key(...b), (deg.get(key(...b)) ?? 0) + 1);
  };

  // Pre-link (mB, mL2) for each straddle block so mB mirrors B's leaf edge (B, L2) across the frame boundary
  const seenSegs = new Set<string>();
  for (const cand of chosen) {
    const k1 = find(key(...cand.mB));
    const k2 = find(key(...cand.mL2));
    if (k1 !== k2) {
      parent.set(k1, k2);
      linkSpots(cand.mB, cand.mL2);
    }
    seenSegs.add(segment(...cand.B, ...cand.L2)).add(segment(...cand.mB, ...cand.mL2));
  }

  // Collect edges touching `f` (grouped with their mirror image so pieces inside `f` are truly symmetric)
  // and edges strictly outside `f`
  const inEdges: [Spot, Spot, Spot, Spot][] = [];
  const outEdges: [Spot, Spot][] = [];

  for (const [r, c] of activeCells) {
    for (const d of [E, S]) {
      const [dr, dc] = STEP[d] as Spot;
      const r2 = r + dr;
      const c2 = c + dc;
      if (!inside(r2, c2) || leafSet.has(key(r2, c2))) continue;
      if (inFrame(f, r, c) || inFrame(f, r2, c2)) {
        const seg = segment(r, c, r2, c2);
        if (seenSegs.has(seg)) continue;
        const [mr1, mc1] = mirrorSquare(f, r, c);
        const [mr2, mc2] = mirrorSquare(f, r2, c2);
        if (
          !inside(mr1, mc1) ||
          !inside(mr2, mc2) ||
          leafSet.has(key(mr1, mc1)) ||
          leafSet.has(key(mr2, mc2))
        )
          continue;
        const mseg = segment(mr1, mc1, mr2, mc2);
        seenSegs.add(seg).add(mseg);
        inEdges.push([
          [r, c],
          [r2, c2],
          [mr1, mc1],
          [mr2, mc2],
        ]);
      } else {
        outEdges.push([
          [r, c],
          [r2, c2],
        ]);
      }
    }
  }

  const canUse = (k: string, add = 1): boolean => {
    const cap = hubCap.get(k);
    return cap === undefined || (deg.get(k) ?? 0) + add <= cap;
  };

  // First add mirrored edge pairs inside `f` (preferring hub edges and off-axis pairs first)
  const shuffledIn = shuffle(random, inEdges).sort((x, y) => {
    const xHub =
      hubCap.has(key(...x[0])) ||
      hubCap.has(key(...x[1])) ||
      hubCap.has(key(...x[2])) ||
      hubCap.has(key(...x[3]))
        ? 0
        : 1;
    const yHub =
      hubCap.has(key(...y[0])) ||
      hubCap.has(key(...y[1])) ||
      hubCap.has(key(...y[2])) ||
      hubCap.has(key(...y[3]))
        ? 0
        : 1;
    if (xHub !== yHub) return xHub - yHub;
    const xSelf = segment(...x[0], ...x[1]) === segment(...x[2], ...x[3]) ? 1 : 0;
    const ySelf = segment(...y[0], ...y[1]) === segment(...y[2], ...y[3]) ? 1 : 0;
    return xSelf - ySelf;
  });

  for (const [a1, b1, a2, b2] of shuffledIn) {
    const ka1 = key(...a1);
    const kb1 = key(...b1);
    const ka2 = key(...a2);
    const kb2 = key(...b2);
    const k1 = find(ka1);
    const k2 = find(kb1);
    if (k1 === k2) continue;
    const sameEdge = segment(...a1, ...b1) === segment(...a2, ...b2);
    if (sameEdge) {
      if (!canUse(ka1) || !canUse(kb1)) continue;
      parent.set(k1, k2);
      linkSpots(a1, b1);
    } else {
      const degNeed = new Map<string, number>();
      for (const k of [ka1, kb1, ka2, kb2]) degNeed.set(k, (degNeed.get(k) ?? 0) + 1);
      if ([...degNeed.entries()].some(([k, cnt]) => !canUse(k, cnt))) continue;
      // Check if adding both (a1, b1) and (a2, b2) creates a cycle
      parent.set(k1, k2);
      const m1 = find(ka2);
      const m2 = find(kb2);
      if (m1 === m2) {
        // Revert first union
        parent.set(k1, k1);
        continue;
      }
      parent.set(m1, m2);
      linkSpots(a1, b1);
      linkSpots(a2, b2);
    }
  }

  // Now complete the spanning tree using edges outside `f`
  const sortedOut = shuffle(random, outEdges).sort((x, y) => {
    const xHub = hubCap.has(key(...x[0])) || hubCap.has(key(...x[1])) ? 0 : 1;
    const yHub = hubCap.has(key(...y[0])) || hubCap.has(key(...y[1])) ? 0 : 1;
    return xHub - yHub;
  });

  for (const [a, b] of sortedOut) {
    const ka = key(...a);
    const kb = key(...b);
    if (!canUse(ka) || !canUse(kb)) continue;
    const k1 = find(ka);
    const k2 = find(kb);
    if (k1 === k2) continue;
    parent.set(k1, k2);
    linkSpots(a, b);
  }

  for (const [hk, cap] of hubCap) {
    if ((deg.get(hk) ?? 0) !== cap) return null;
  }

  // Verify activeCells is a single connected tree
  const roots = new Set(activeCells.map(([r, c]) => find(key(r, c))));
  if (roots.size !== 1) return null;

  for (const [hub, leaf] of hubPairs) linkSpots(hub, leaf);

  const rows = shape.map((row, r) =>
    [...row].map((ch, c) => (ch === '#' ? (mask.get(key(r, c)) ?? 0).toString(16) : '.')).join(''),
  );
  if (rows.some((row) => row.includes('0'))) return null;

  const p: Panel = { name: 'generated', rows, plug, frame: f };
  const b = parse(p);
  const wires = wiresOf(b.solution);
  if (!piecesSymmetricIn(f, b.solution) || offAxis(f, wires) < 3) return null;
  return p;
}

/**
 * Split a spanning tree into red and blue strings (Fourth of July colours),
 * introducing white ('w') pieces that can belong to either string and ensuring
 * that without the colours (`noColours: true`), at least `margin` solutions exist.
 */
export function colourTree(
  p: Panel,
  random: Rng,
  margin: number,
  wantAmbiguity = false,
  baseSols?: number[][][],
): Panel | null {
  const b = parse(p);
  const H = b.height;
  const Wd = b.width;
  const cells: Spot[] = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < Wd; c++) if (b.inside(r, c)) cells.push([r, c]);

  // When preserving an internal cycle (`wantAmbiguity`), all cells of at least one cycle
  // must stay on the same side of the red/blue cut so the cycle survives colouring.
  const cycleGroups: string[][] = [];
  if (wantAmbiguity && baseSols && baseSols.length >= 2) {
    const s0 = baseSols[0] as number[][];
    for (let idx = 1; idx < baseSols.length; idx++) {
      const sAlt = baseSols[idx] as number[][];
      const diff: string[] = [];
      for (const [r, c] of cells) {
        if (s0[r]?.[c] !== sAlt[r]?.[c]) diff.push(key(r, c));
      }
      if (diff.length > 0 && diff.length <= 4) cycleGroups.push(diff);
    }
  }

  const joins: [Spot, number][] = [];
  for (const s of cells) {
    const m = b.solution[s[0]]?.[s[1]] ?? 0;
    for (const d of [E, S]) {
      if (m & d) {
        // Don't cut an edge touching a snowflake frame, or the mirror symmetry would break
        if (b.frame) {
          const [dr, dc] = STEP[d] as Spot;
          if (inFrame(b.frame, s[0], s[1]) || inFrame(b.frame, s[0] + dr, s[1] + dc)) continue;
        }
        joins.push([s, d]);
      }
    }
  }

  const sideOf = ([s0, d]: [Spot, number]): Set<string> => {
    const t: Spot = [s0[0] + (STEP[d] as Spot)[0], s0[1] + (STEP[d] as Spot)[1]];
    const seen = new Set([key(...s0), key(...t)]);
    const side = new Set([key(...s0)]);
    const stack: Spot[] = [s0];
    while (stack.length) {
      const [r, c] = stack.pop() as Spot;
      const m = b.solution[r]?.[c] ?? 0;
      for (const e of DIRS) {
        if (!(m & e)) continue;
        const n: Spot = [r + (STEP[e] as Spot)[0], c + (STEP[e] as Spot)[1]];
        if (seen.has(key(...n))) continue;
        seen.add(key(...n));
        side.add(key(...n));
        stack.push(n);
      }
    }
    return side;
  };

  const fair = shuffle(
    random,
    joins
      .map((cut) => ({ cut, side: sideOf(cut) }))
      .filter(
        ({ side }) =>
          side.size >= cells.length * 0.3 &&
          side.size <= cells.length * 0.7 &&
          (cycleGroups.length === 0 ||
            cycleGroups.some(
              (grp) => grp.every((k) => side.has(k)) || grp.every((k) => !side.has(k)),
            )),
      ),
  );

  for (const { cut, side } of fair.slice(0, 10)) {
    const [s0, d] = cut;
    const t: Spot = [s0[0] + (STEP[d] as Spot)[0], s0[1] + (STEP[d] as Spot)[1]];
    const m0 = (b.solution[s0[0]]?.[s0[1]] ?? 0) & ~d;
    const mt = (b.solution[t[0]]?.[t[1]] ?? 0) & ~(OPP[d] as number);
    if (m0 === 0 || mt === 0) continue;

    const newRows = b.solution.map((row) => [...row]);
    (newRows[s0[0]] as number[])[s0[1]] = m0;
    (newRows[t[0]] as number[])[t[1]] = mt;

    const owner = new Map<string, 'r' | 'b' | 'w'>();
    for (const [r, c] of cells) owner.set(key(r, c), side.has(key(r, c)) ? 'r' : 'b');

    const redCells = cells.filter(([r, c]) => side.has(key(r, c)));
    const blueCells = cells.filter(([r, c]) => !side.has(key(r, c)));
    const redPlug = redCells[Math.floor(random() * redCells.length)] as Spot;
    const bluePlug = blueCells[Math.floor(random() * blueCells.length)] as Spot;

    const rows = newRows.map((row) => row.map((m) => (m < 0 ? '.' : m.toString(16))).join(''));
    const buildColours = (): string[] =>
      p.rows.map((row, r) =>
        [...row].map((ch, c) => (ch === '.' ? '.' : (owner.get(key(r, c)) ?? 'w'))).join(''),
      );

    const baseColoured: Panel = {
      ...p,
      rows,
      plug: redPlug,
      bluePlug,
      colours: buildColours(),
    };

    try {
      // Check that without colours (`noColours: true`), there are >= margin ways to wire the two strings
      const bCand = parse(baseColoured);
      const colouredCount = countSolutions(bCand, margin + 2, {}, new Budget(25_000));
      if (!wantAmbiguity && colouredCount !== 1) continue;
      if (wantAmbiguity && (colouredCount < 2 || colouredCount > margin + 2)) continue;
      const wantNoCol = wantAmbiguity ? colouredCount + margin - 1 : margin;
      if (countSolutions(bCand, wantNoCol, { noColours: true }, new Budget(25_000)) < wantNoCol)
        continue;

      // Turn only border pieces (adjacent to both 'r' and 'b') into white ('w')
      const validWhite = (rr: number, cc: number): boolean => {
        let hasR = false;
        let hasB = false;
        for (const d of DIRS) {
          const [dr, dc] = STEP[d] as Spot;
          const nr = rr + dr;
          const nc = cc + dc;
          if (!b.inside(nr, nc)) continue;
          const cTone = owner.get(key(nr, nc));
          if (cTone === 'r') hasR = true;
          if (cTone === 'b') hasB = true;
        }
        return hasR && hasB;
      };

      const candidates = shuffle(
        random,
        cells.filter(([r, c]) => key(r, c) !== key(...redPlug) && key(r, c) !== key(...bluePlug)),
      );
      let whites = 0;
      let curCount = colouredCount;
      const targetWhites = Math.max(2, Math.min(4, Math.floor(cells.length / 7)));
      for (const [r, c] of candidates) {
        if (whites >= targetWhites && (!wantAmbiguity || curCount >= margin)) break;
        const k = key(r, c);
        const prev = owner.get(k) as 'r' | 'b';
        owner.set(k, 'w');
        const affected: Spot[] = [[r, c]];
        for (const d of DIRS) {
          const [dr, dc] = STEP[d] as Spot;
          const nr = r + dr;
          const nc = c + dc;
          if (b.inside(nr, nc) && owner.get(key(nr, nc)) === 'w') affected.push([nr, nc]);
        }
        if (!affected.every(([ar, ac]) => validWhite(ar, ac))) {
          owner.set(k, prev);
          continue;
        }
        const testPanel: Panel = { ...baseColoured, colours: buildColours() };
        const cnt = countSolutions(parse(testPanel), margin + 3, {}, new Budget(15_000));
        if (wantAmbiguity ? cnt >= 1 && cnt <= margin + 2 : cnt === 1) {
          whites++;
          curCount = cnt;
        } else {
          owner.set(k, prev);
        }
      }
      if (whites >= 1 && (wantAmbiguity ? curCount >= margin : curCount === 1)) {
        return { ...baseColoured, colours: buildColours() };
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Place numbered eggs at distance >= 2 that distinguish the true solution from
 * alternative solutions, and drop any redundant eggs so every egg does work.
 */
export function addEggs(
  p: Panel,
  altSolutions: number[][][],
  maxCount: number,
  random: Rng,
): [number, number, number][] | null {
  const b = parse(p);
  const { dist: trueDist, string: trueString } = light(b, b.solution);
  const secPlug = b.bluePlug ?? b.greenPlug;

  const altDists = altSolutions.map((sol) => light(b, sol).dist);

  const candidates: [number, number, number][] = [];
  for (let r = 0; r < b.height; r++) {
    for (let c = 0; c < b.width; c++) {
      if (!b.inside(r, c)) continue;
      if (r === b.plug[0] && c === b.plug[1]) continue;
      if (secPlug && r === secPlug[0] && c === secPlug[1]) continue;
      if (p.colours && p.colours[r]?.[c] === 'w') continue;
      const d0 = trueDist.get(key(r, c));
      if (d0 === undefined || d0 < 2) continue;
      const differs = altDists.some((altDist) => altDist.get(key(r, c)) !== d0);
      if (differs) candidates.push([r, c, d0]);
    }
  }

  if (!candidates.length) return null;
  const shuffled = shuffle(random, candidates);

  // Greedily pick up to maxCount eggs so each new egg eliminates remaining altSolutions
  let remainingAlts = [...altDists];
  let chosen: [number, number, number][] = [];
  while (chosen.length < maxCount && remainingAlts.length > 0) {
    let best: [number, number, number] | null = null;
    let bestScore = -1;
    for (const cand of shuffled) {
      if (chosen.includes(cand)) continue;
      const k = key(cand[0], cand[1]);
      const killed = remainingAlts.filter((ad) => ad.get(k) !== cand[2]).length;
      if (killed <= 0) continue;
      let keepsColourAmbiguity = 1;
      if (p.colours) {
        try {
          const noCol = countSolutions(
            parse({ ...p, eggs: [...chosen, cand] }),
            2,
            { noColours: true },
            new Budget(15_000),
          );
          if (noCol < 2) continue;
          keepsColourAmbiguity = 100;
        } catch {
          continue;
        }
      }
      const plugSpot = trueString.get(k) !== 'r' && secPlug ? secPlug : b.plug;
      const manhattan = Math.abs(cand[0] - plugSpot[0]) + Math.abs(cand[1] - plugSpot[1]);
      const score =
        killed + keepsColourAmbiguity + (cand[2] > manhattan ? 25 : 0) + (cand[2] >= 3 ? 20 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    if (!best) break;
    chosen.push(best);
    const bk = key(best[0], best[1]);
    const bd = best[2];
    remainingAlts = remainingAlts.filter((ad) => ad.get(bk) === bd);
  }

  for (const e of [...chosen]) {
    if (chosen.length <= 1) break;
    const rest = chosen.filter((x) => x !== e);
    try {
      if (countSolutions(parse({ ...p, eggs: rest }), 2, {}, new Budget(20_000)) === 1) {
        chosen = rest;
      }
    } catch {
      // Keep egg
    }
  }

  return chosen;
}

/**
 * Add letters for numbers (Valentine's): pick `count` bulbs at distinct distances from
 * the plug that distinguish the true solution from alternatives when only the set of
 * distances `blanks` is known.
 */
export function addLetters(
  p: Panel,
  altSolutions: number[][][],
  count: number,
  random: Rng,
  preserveSolutions: number[][][] = [],
): { letters: [number, number, string][]; message: string; word: string; blanks: number[] } | null {
  const b = parse(p);
  const { dist: trueDist, string: trueString } = light(b, b.solution);
  const altDists = altSolutions.map((sol) => light(b, sol).dist);
  const preserveDists = preserveSolutions.map((sol) => light(b, sol).dist);
  const secPlug = b.bluePlug ?? b.greenPlug;
  const eggKeys = new Set((p.eggs ?? []).map(([r, c]) => key(r, c)));

  const bank = count === 3 ? WORDS_3 : (THEME_WORDS[count] ?? WORDS_3);
  const word = bank[Math.floor(random() * bank.length)] ?? 'STAR'.slice(0, count);

  // Group candidate squares by their true distance from the plug (each >= 2)
  const byDist = new Map<number, { spot: Spot; differs: boolean; manhattan: number }[]>();
  for (let r = 0; r < b.height; r++) {
    for (let c = 0; c < b.width; c++) {
      if (!b.inside(r, c)) continue;
      if (r === b.plug[0] && c === b.plug[1]) continue;
      if (secPlug && r === secPlug[0] && c === secPlug[1]) continue;
      if (p.colours && p.colours[r]?.[c] === 'w') continue;
      const k = key(r, c);
      if (eggKeys.has(k)) continue;
      const d0 = trueDist.get(k);
      if (d0 === undefined || d0 < 2) continue;
      const plugSpot = trueString.get(k) !== 'r' && secPlug ? secPlug : b.plug;
      const manhattan = Math.abs(r - plugSpot[0]) + Math.abs(c - plugSpot[1]);
      const differs = altDists.some((altDist) => altDist.get(k) !== d0);
      const list = byDist.get(d0) ?? [];
      list.push({ spot: [r, c], differs, manhattan });
      byDist.set(d0, list);
    }
  }

  if (byDist.size < count) return null;

  // Greedily pick `count` distinct distances + spots to cover remaining altDists
  // while preserving at least one solution in `preserveDists` if non-empty.
  const usedDists = new Set<number>();
  const chosenSpots: { spot: Spot; d: number; manhattan: number }[] = [];
  let remainingAlts = [...altDists];
  const allSpots = shuffle(
    random,
    [...byDist.entries()].flatMap(([d, items]) =>
      items.map((it) => ({ spot: it.spot, d, manhattan: it.manhattan })),
    ),
  );

  while (chosenSpots.length < count) {
    let best: { spot: Spot; d: number; manhattan: number } | null = null;
    let bestScore = -1;
    for (const cand of allSpots) {
      if (usedDists.has(cand.d)) continue;
      const k = key(...cand.spot);
      const killed = remainingAlts.filter((ad) => ad.get(k) !== cand.d).length;
      const trialSpots = [...chosenSpots, cand];
      const preserves =
        preserveDists.length === 0 ||
        preserveDists.some((pd) => trialSpots.every((s) => pd.get(key(...s.spot)) === s.d))
          ? 100
          : 0;
      const score =
        killed + preserves + (cand.d > cand.manhattan ? 25 : 0) + (cand.d >= 3 ? 10 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    if (!best) return null;
    chosenSpots.push(best);
    usedDists.add(best.d);
    const bk = key(...best.spot);
    const bd = best.d;
    remainingAlts = remainingAlts.filter((ad) => ad.get(bk) === bd);
  }

  // Shuffle order to match the word's letters
  const ordered = shuffle(random, chosenSpots);
  const blanks = ordered.map((x) => x.d);
  const letters: [number, number, string][] = ordered.map((x, idx) => [
    x.spot[0],
    x.spot[1],
    word[idx] as string,
  ]);

  return {
    letters,
    message: blanks.join(' '),
    word,
    blanks,
  };
}

/**
 * Add non-touching dark squares (?) that remain uniquely deducible from their
 * visible neighbours (`blindDark: true`).
 */
export function addDark(p: Panel, count: number, random: Rng): Spot[] | null {
  const b = parse(p);
  const secPlug = b.bluePlug ?? b.greenPlug;
  const forbidden = new Set<string>([
    key(b.plug[0], b.plug[1]),
    ...(secPlug ? [key(secPlug[0], secPlug[1])] : []),
    ...(p.eggs ?? []).map(([r, c]) => key(r, c)),
    ...(p.letters ?? []).map(([r, c]) => key(r, c)),
  ]);

  const candidates: Spot[] = [];
  for (let r = 0; r < b.height; r++) {
    for (let c = 0; c < b.width; c++) {
      if (!b.inside(r, c)) continue;
      if (forbidden.has(key(r, c))) continue;
      const m = b.solution[r]?.[c] ?? 0;
      if (m <= 0 || m === 15) continue;
      candidates.push([r, c]);
    }
  }

  const chosen: Spot[] = [];
  for (const [r, c] of shuffle(random, candidates)) {
    if (chosen.length >= count) break;
    if (chosen.some(([r2, c2]) => Math.abs(r - r2) + Math.abs(c - c2) <= 1)) continue;
    const nextDark = [...chosen, [r, c] as Spot];
    try {
      if (
        countSolutions(
          parse({ ...p, dark: nextDark }),
          2,
          { blindDark: true },
          new Budget(20_000),
        ) === 1
      ) {
        chosen.push([r, c]);
      }
    } catch {
      // Skip if budget exceeded
    }
  }

  return chosen.length >= 2 ? chosen : null;
}
