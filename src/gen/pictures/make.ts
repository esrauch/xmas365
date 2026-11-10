/**
 * Making picture-grid boards: coherent shapes (overlapping geometric stamps),
 * red-and-blue colourings with touching runs, controlled 2×2 switching blocks
 * for clue-adding twists (eggs, portions, snowflakes), and contiguous
 * equal-share portion partitions.
 */
import type { Frame } from '../core/mirror';
import { type Rng, pick, shuffle } from '../core/rng';
import { type Panel, clues, picture } from './model';
import { portionCounts } from './rules';

const randInt = (random: Rng, lo: number, hi: number): number =>
  lo + Math.floor(random() * (hi - lo + 1));

export interface SwitchBlock {
  r: number;
  c: number;
  owner: 'eggs' | 'portions' | 'snow';
}

/** Check whether two 2×2 blocks (plus their orthogonal isolation perimeters) are compatible. */
function switchesDisjoint(a: { r: number; c: number }, b: { r: number; c: number }): boolean {
  // If they are separated by at least 3 rows or 3 columns, their 2×2 boxes and perimeters never overlap.
  return Math.abs(a.r - b.r) >= 3 || Math.abs(a.c - b.c) >= 3;
}

/**
 * Plant an isolated 2×2 switching block at [r..r+1] × [c..c+1]:
 *   [v, 0]
 *   [0, v]
 * surrounded on its 8 orthogonal perimeter cells by 0 (empty), so flipping it
 * to [0, v; v, 0] preserves the exact run sequence of rows r, r+1 and cols c, c+1.
 */
export function plantSwitch(grid: number[][], r: number, c: number, v = 1): void {
  const H = grid.length;
  const W = grid[0]?.length ?? 0;
  const set0 = (rr: number, cc: number): void => {
    if (rr >= 0 && rr < H && cc >= 0 && cc < W) (grid[rr] as number[])[cc] = 0;
  };
  // 8 orthogonal perimeter cells around [r..r+1] × [c..c+1]
  set0(r - 1, c);
  set0(r - 1, c + 1);
  set0(r + 2, c);
  set0(r + 2, c + 1);
  set0(r, c - 1);
  set0(r + 1, c - 1);
  set0(r, c + 2);
  set0(r + 1, c + 2);

  (grid[r] as number[])[c] = v;
  (grid[r] as number[])[c + 1] = 0;
  (grid[r + 1] as number[])[c] = 0;
  (grid[r + 1] as number[])[c + 1] = v;
}

/**Is (r, c) inside the 2×2 + orthogonal perimeter of a switch block? */
export function inSwitchZone(s: { r: number; c: number }, r: number, c: number): boolean {
  const inRows = r >= s.r && r <= s.r + 1;
  const inCols = c >= s.c && c <= s.c + 1;
  if (inRows && inCols) return true;
  if (inRows && (c === s.c - 1 || c === s.c + 2)) return true;
  if (inCols && (r === s.r - 1 || r === s.r + 2)) return true;
  return false;
}

/**
 * Paint a coherent monochrome (0/1) grid of size H × W using overlapping
 * stamps (rectangles, crosses, bars) so runs look like a picture rather than
 * random white noise, ensuring every row and column has at least one filled cell.
 */
export function makeBaseGrid(H: number, W: number, random: Rng): number[][] {
  const grid: number[][] = Array.from({ length: H }, () => new Array<number>(W).fill(0));
  const stamps = randInt(random, 3, 5);
  for (let s = 0; s < stamps; s++) {
    const kind = randInt(random, 0, 2);
    if (kind === 0) {
      // Filled rectangle
      const h = randInt(random, 2, Math.max(2, Math.ceil(H * 0.7)));
      const w = randInt(random, 2, Math.max(2, Math.ceil(W * 0.7)));
      const r0 = randInt(random, 0, H - h);
      const c0 = randInt(random, 0, W - w);
      for (let r = r0; r < r0 + h; r++)
        for (let c = c0; c < c0 + w; c++) (grid[r] as number[])[c] = 1;
    } else if (kind === 1) {
      // Cross / plus
      const cr = randInt(random, 1, H - 2);
      const cc = randInt(random, 1, W - 2);
      const arm = randInt(random, 1, Math.floor(Math.min(H, W) / 2));
      for (let d = -arm; d <= arm; d++) {
        if (cr + d >= 0 && cr + d < H) (grid[cr + d] as number[])[cc] = 1;
        if (cc + d >= 0 && cc + d < W) (grid[cr] as number[])[cc + d] = 1;
      }
    } else {
      // Thick bar (often full-span to give complete foothold lines)
      if (random() < 0.5) {
        const r = randInt(random, 0, H - 1);
        const full = random() < 0.6;
        const c0 = full ? 0 : randInt(random, 0, Math.floor(W / 3));
        const c1 = full ? W - 1 : randInt(random, Math.max(c0 + 2, Math.floor(W * 0.6)), W - 1);
        for (let c = c0; c <= c1; c++) (grid[r] as number[])[c] = 1;
      } else {
        const c = randInt(random, 0, W - 1);
        const full = random() < 0.6;
        const r0 = full ? 0 : randInt(random, 0, Math.floor(H / 3));
        const r1 = full ? H - 1 : randInt(random, Math.max(r0 + 2, Math.floor(H * 0.6)), H - 1);
        for (let r = r0; r <= r1; r++) (grid[r] as number[])[c] = 1;
      }
    }
  }
  // Light toggles for variety while keeping large contiguous runs intact
  const toggles = Math.max(1, Math.floor((H * W) / 14));
  for (let i = 0; i < toggles; i++) {
    const r = randInt(random, 0, H - 1);
    const c = randInt(random, 0, W - 1);
    (grid[r] as number[])[c] = (grid[r]?.[c] ?? 0) ? 0 : 1;
  }
  // Guarantee at least one completely filled row or column as an immediate foothold
  if (random() < 0.5) {
    const r = randInt(random, 0, H - 1);
    for (let c = 0; c < W; c++) (grid[r] as number[])[c] = 1;
  } else {
    const c = randInt(random, 0, W - 1);
    for (let r = 0; r < H; r++) (grid[r] as number[])[c] = 1;
  }
  // Ensure every row and column has at least one filled cell
  for (let r = 0; r < H; r++) {
    const row = grid[r] as number[];
    if (row.every((v): boolean => v === 0)) row[randInt(random, 0, W - 1)] = 1;
  }
  for (let c = 0; c < W; c++) {
    if (grid.every((row) => (row[c] ?? 0) === 0))
      (grid[randInt(random, 0, H - 1)] as number[])[c] = 1;
  }
  // Ensure the board as a whole has enough empty cells so it is not a solid block
  let emptyCount = grid.reduce((s, row) => s + row.filter((v) => v === 0).length, 0);
  for (let tries = 0; tries < 20 && emptyCount < Math.max(4, H); tries++) {
    const r = randInt(random, 0, H - 1);
    const c = randInt(random, 0, W - 1);
    if ((grid[r]?.[c] ?? 0) > 0) {
      (grid[r] as number[])[c] = 0;
      emptyCount++;
    }
  }
  return grid;
}

/**
 * Paint a monochrome (0/1) grid with Red (1) and Blue (2) regions so both
 * colours are balanced, at least one R and B run touch directly, and any
 * planted 2×2 switch block uses a single uniform colour on its two filled cells.
 */
export function colourGrid(
  grid: number[][],
  switches: SwitchBlock[],
  frame: Frame | undefined,
  random: Rng,
): void {
  const H = grid.length;
  const W = grid[0]?.length ?? 0;
  // Divide board into 2 or 3 colour zones (e.g. diagonal or quadrant wave) + random patches
  const mode = randInt(random, 0, 2);
  const swap = random() < 0.5;
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if ((grid[r]?.[c] ?? 0) <= 0) continue;
      let tone =
        mode === 0
          ? r + c < Math.floor((H + W) / 2)
            ? 1
            : 2
          : mode === 1
            ? (Math.floor(r / 2) + Math.floor(c / 2)) % 2 === 0
              ? 1
              : 2
            : r < Math.floor(H / 2)
              ? 1
              : 2;
      if (swap) tone = 3 - tone;
      (grid[r] as number[])[c] = tone;
    }
  }
  // Ensure each switch block has uniform colour on its two filled corners
  for (const s of switches) {
    const tone = (grid[s.r]?.[s.c] ?? 1) > 0 ? (grid[s.r]?.[s.c] as number) : 1;
    (grid[s.r] as number[])[s.c] = tone;
    (grid[s.r + 1] as number[])[s.c + 1] = tone;
  }
  // If frame is active, re-mirror inside the frame
  if (frame) {
    for (let r = frame.top; r <= frame.bottom; r++) {
      for (let c = frame.left; c <= frame.right; c++) {
        const mr = frame.axis === 'h' ? frame.top + frame.bottom - r : r;
        const mc = frame.axis === 'v' ? frame.left + frame.right - c : c;
        if (r < mr || (r === mr && c < mc)) {
          (grid[mr] as number[])[mc] = grid[r]?.[c] ?? 0;
        }
      }
    }
  }
}

/** Convert a numeric grid (0, 1, 2) to panel rows for `palette`. */
export function gridToRows(grid: number[][], palette?: string): string[] {
  const pal = palette ?? '#';
  return grid.map((row) => row.map((v) => (v <= 0 ? '.' : (pal[v - 1] ?? '#'))).join(''));
}

/**
 * Choose a snowflake frame and plant 1 (easy/medium) or 2 (hard) boundary-locked
 * 2×2 switches inside the frame on one half, locked on the mirror half by cells
 * just outside the frame!
 */
export function setupSnowAndSwitches(
  grid: number[][],
  needTwoPerTwist: boolean,
  wantSnow: boolean,
  wantPortions: boolean,
  wantEggs: boolean,
  random: Rng,
): { frame?: Frame; switches: SwitchBlock[] } | null {
  const H = grid.length;
  const W = grid[0]?.length ?? 0;
  const switches: SwitchBlock[] = [];

  let frame: Frame | undefined;
  const lockedCells = new Set<string>();
  const isLocked = (r: number, c: number): boolean =>
    lockedCells.has(`${r},${c}`) || switches.some((s) => inSwitchZone(s, r, c));

  if (wantSnow) {
    // Frame leaves room outside:
    // On 5×5: 4×4 frame when no outside switches are needed (or 3×4 when outside switches need rows 3..4).
    // On 7×7: 4×6 frame (top 1..4, left 0..5, axis 'v') leaves row 0, rows 5..6, and col 6 outside.
    // On 9×9: 6×8 frame (top 1..6, left 0..7, axis 'v') leaves row 0, rows 7..8, and col 8 outside.
    const needOutsideSwitch = wantPortions || wantEggs;
    if (H === 5) {
      frame = needOutsideSwitch
        ? { top: 0, bottom: 2, left: 0, right: 3, axis: 'v' }
        : { top: 0, bottom: 3, left: 0, right: 3, axis: 'v' };
    } else if (H === 7) {
      frame = { top: 1, bottom: 4, left: 0, right: 5, axis: 'v' };
    } else {
      frame = { top: 1, bottom: 6, left: 0, right: 7, axis: 'v' };
    }

    // Plant snow switch(es) on the left half of `frame` touching top or bottom of `frame`
    // so the mirror image on the right half can be locked by a cell just outside `frame`!
    const snowSpots: { r: number; c: number; lockOutR: number; lockInR: number }[] = [];
    if (frame.bottom + 1 < H) {
      snowSpots.push({
        r: frame.bottom - 1,
        c: frame.left,
        lockOutR: frame.bottom + 1,
        lockInR: frame.bottom,
      });
    }
    if (frame.top - 1 >= 0) {
      snowSpots.push({
        r: frame.top,
        c: frame.left,
        lockOutR: frame.top - 1,
        lockInR: frame.top,
      });
    }

    const countNeeded = needTwoPerTwist ? 2 : 1;
    for (const spot of snowSpots) {
      if (switches.filter((s) => s.owner === 'snow').length >= countNeeded) break;
      if (!switches.every((s) => switchesDisjoint(s, spot))) continue;
      plantSwitch(grid, spot.r, spot.c, 1);
      switches.push({ r: spot.r, c: spot.c, owner: 'snow' });
    }
    if (switches.filter((s) => s.owner === 'snow').length < countNeeded) return null;

    // Ensure at least 2 filled cells inside the left half of the frame (4 total in the frame)
    let leftFilled = 0;
    const midCol = Math.floor((frame.left + frame.right) / 2);
    const freeLeft: [number, number][] = [];
    for (let r = frame.top; r <= frame.bottom; r++) {
      for (let c = frame.left; c <= midCol; c++) {
        if ((grid[r]?.[c] ?? 0) > 0) leftFilled++;
        else if (!isLocked(r, c)) freeLeft.push([r, c]);
      }
    }
    for (const [r, c] of shuffle(random, freeLeft)) {
      if (leftFilled >= 3) break;
      (grid[r] as number[])[c] = 1;
      leftFilled++;
    }
    if (leftFilled < 2) return null;

    // Mirror left half of frame to right half of frame, and lock the mirror of each snow switch
    for (let r = frame.top; r <= frame.bottom; r++) {
      for (let c = frame.left; c <= midCol; c++) {
        const mc = frame.left + frame.right - c;
        (grid[r] as number[])[mc] = grid[r]?.[c] ?? 0;
      }
    }
    for (let r = frame.top; r <= frame.bottom; r++) {
      for (let c = frame.left; c <= frame.right; c++) {
        lockedCells.add(`${r},${c}`);
      }
    }
    for (const s of switches.filter((x) => x.owner === 'snow')) {
      const mc0 = frame.left + frame.right - s.c;
      const mc1 = frame.left + frame.right - (s.c + 1);
      // On the left side, keep outside cells 0 (already done by plantSwitch).
      // On the right side, at row s.r (if s.r === frame.top) or s.r + 1 (if s.r + 1 === frame.bottom),
      // connect the filled mirror cell vertically to the row just outside `frame`!
      if (s.r + 1 === frame.bottom && frame.bottom + 1 < H) {
        // Mirror of (s.r+1, s.c+1)=1 is (frame.bottom, mc1)=1, and mirror of (s.r+1, s.c)=0 is (frame.bottom, mc0)=0.
        (grid[frame.bottom + 1] as number[])[mc1] = grid[frame.bottom]?.[mc1] ?? 1;
        (grid[frame.bottom + 1] as number[])[mc0] = 0;
        lockedCells.add(`${frame.bottom + 1},${mc1}`);
        lockedCells.add(`${frame.bottom + 1},${mc0}`);
      } else if (s.r === frame.top && frame.top - 1 >= 0) {
        // Mirror of (s.r, s.c)=1 is (frame.top, mc0)=1, and mirror of (s.r, s.c+1)=0 is (frame.top, mc1)=0.
        (grid[frame.top - 1] as number[])[mc0] = grid[frame.top]?.[mc0] ?? 1;
        (grid[frame.top - 1] as number[])[mc1] = 0;
        lockedCells.add(`${frame.top - 1},${mc0}`);
        lockedCells.add(`${frame.top - 1},${mc1}`);
      }
    }
  }

  // Place switch(es) for portions and eggs outside `frame` (and disjoint from existing switches)
  const extraOwners: ('portions' | 'eggs')[] = [
    ...(wantPortions
      ? needTwoPerTwist
        ? (['portions', 'portions'] as const)
        : (['portions'] as const)
      : []),
    ...(wantEggs ? (needTwoPerTwist ? (['eggs', 'eggs'] as const) : (['eggs'] as const)) : []),
  ];

  if (extraOwners.length > 0) {
    const candidateSpots: { r: number; c: number }[] = [];
    for (let r = 0; r <= H - 2; r++) {
      for (let c = 0; c <= W - 2; c++) {
        // Must not overlap `frame`
        if (frame) {
          const overlapsFrame =
            r <= frame.bottom && r + 1 >= frame.top && c <= frame.right && c + 1 >= frame.left;
          if (overlapsFrame) continue;
        }
        candidateSpots.push({ r, c });
      }
    }
    for (const owner of extraOwners) {
      const spot = shuffle(random, candidateSpots).find(
        (cand) =>
          switches.every((s) => switchesDisjoint(s, cand)) &&
          ![
            [cand.r, cand.c],
            [cand.r, cand.c + 1],
            [cand.r + 1, cand.c],
            [cand.r + 1, cand.c + 1],
          ].some(([rr, cc]) => lockedCells.has(`${rr},${cc}`)),
      );
      if (!spot) return null;
      plantSwitch(grid, spot.r, spot.c, 1);
      switches.push({ r: spot.r, c: spot.c, owner });
    }
  }

  return { ...(frame ? { frame } : {}), switches };
}

/**
 * Build two contiguous portions ('A' and 'B') such that:
 * - Every `'portions'` switch has its top-left filled cell (r, c) in `'A'` and
 *   its other 3 cells (r, c+1), (r+1, c), (r+1, c+1) in `'B'`;
 * - Every non-`'portions'` switch (for `'snow'` or `'eggs'`) has all 4 of its
 *   cells in the same portion so flipping it does not alter portion counts;
 * - `'A'` and `'B'` are both 4-connected and contain the exact same number
 *   (`>= 2`) of filled squares in `grid` (adjusting non-switch cells if needed).
 */
export function makePortions(
  grid: number[][],
  switches: SwitchBlock[],
  frame: Frame | undefined,
  random: Rng,
): string[] | null {
  const H = grid.length;
  const W = grid[0]?.length ?? 0;
  const pSwitches = switches.filter((s) => s.owner === 'portions');
  const otherSwitches = switches.filter((s) => s.owner !== 'portions');

  // Start with a clean split where 'A' is the top-left / upper region and 'B' is the lower-right region,
  // passing through each portions-switch so (s.r, s.c) is 'A' and the other 3 cells are 'B'.
  const labels: string[][] = Array.from({ length: H }, () => new Array<string>(W).fill('B'));

  // Seed 'A' with (s.r, s.c) of each portions-switch and a path to the top-left corner (0, 0)
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (r + c < Math.floor((H + W - 1) / 2)) (labels[r] as string[])[c] = 'A';
    }
  }
  for (const s of pSwitches) {
    // Ensure (s.r, s.c) and its path to (0, 0) via row <= s.r and col <= s.c are 'A',
    // while (s.r, s.c+1), (s.r+1, s.c), (s.r+1, s.c+1) and their path to (H-1, W-1) are 'B'.
    for (let r = 0; r <= s.r; r++) for (let c = 0; c <= s.c; c++) (labels[r] as string[])[c] = 'A';
    (labels[s.r] as string[])[s.c] = 'A';
    (labels[s.r] as string[])[s.c + 1] = 'B';
    (labels[s.r + 1] as string[])[s.c] = 'B';
    (labels[s.r + 1] as string[])[s.c + 1] = 'B';
    for (let r = s.r + 1; r < H; r++)
      for (let c = s.c + 1; c < W; c++) (labels[r] as string[])[c] = 'B';
  }

  // Ensure every non-portions switch has all 4 of its cells in the same portion
  const pinnedPortion = new Set<string>();
  for (const s of pSwitches) {
    pinnedPortion.add(`${s.r},${s.c}`);
    pinnedPortion.add(`${s.r},${s.c + 1}`);
    pinnedPortion.add(`${s.r + 1},${s.c}`);
    pinnedPortion.add(`${s.r + 1},${s.c + 1}`);
  }
  for (const s of otherSwitches) {
    const ch = labels[s.r]?.[s.c] ?? 'A';
    const cells: [number, number][] = [
      [s.r, s.c],
      [s.r, s.c + 1],
      [s.r + 1, s.c],
      [s.r + 1, s.c + 1],
    ];
    if (cells.some(([rr, cc]) => pinnedPortion.has(`${rr},${cc}`))) return null;
    for (const [rr, cc] of cells) {
      (labels[rr] as string[])[cc] = ch;
      pinnedPortion.add(`${rr},${cc}`);
    }
  }

  const isConnected = (target: string): boolean => {
    const cells: [number, number][] = [];
    for (let r = 0; r < H; r++)
      for (let c = 0; c < W; c++) if (labels[r]?.[c] === target) cells.push([r, c]);
    if (cells.length === 0) return false;
    const start = cells[0] as [number, number];
    const seen = new Set<string>([`${start[0]},${start[1]}`]);
    const q: [number, number][] = [start];
    while (q.length) {
      const [r, c] = q.shift() as [number, number];
      for (const [nr, nc] of [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ] as const) {
        if (nr >= 0 && nr < H && nc >= 0 && nc < W && labels[nr]?.[nc] === target) {
          const k = `${nr},${nc}`;
          if (!seen.has(k)) {
            seen.add(k);
            q.push([nr, nc]);
          }
        }
      }
    }
    return seen.size === cells.length;
  };

  if (!isConnected('A') || !isConnected('B')) {
    // Repair connectivity by flipping non-pinned cells that are isolated
    for (let pass = 0; pass < 10 && (!isConnected('A') || !isConnected('B')); pass++) {
      for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
          if (pinnedPortion.has(`${r},${c}`)) continue;
          const cur = labels[r]?.[c] ?? 'A';
          const other = cur === 'A' ? 'B' : 'A';
          (labels[r] as string[])[c] = other;
          if (isConnected('A') && isConnected('B')) break;
          (labels[r] as string[])[c] = cur;
        }
      }
    }
  }
  if (!isConnected('A') || !isConnected('B')) return null;

  // Balance filled counts between 'A' and 'B' by flipping border portion labels first,
  // and if needed toggling unlocked grid cells outside switches and frame.
  const countFilled = (ch: string): number => {
    let n = 0;
    for (let r = 0; r < H; r++)
      for (let c = 0; c < W; c++) if (labels[r]?.[c] === ch && (grid[r]?.[c] ?? 0) > 0) n++;
    return n;
  };

  for (let step = 0; step < 30; step++) {
    const ca = countFilled('A');
    const cb = countFilled('B');
    if (ca === cb && ca >= 2) break;
    const heavy = ca > cb ? 'A' : 'B';
    const light = heavy === 'A' ? 'B' : 'A';
    // Try moving a filled border cell from `heavy` to `light`
    const candidates: [number, number][] = [];
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (labels[r]?.[c] !== heavy || pinnedPortion.has(`${r},${c}`)) continue;
        if ((grid[r]?.[c] ?? 0) <= 0) continue;
        const touchesLight = (
          [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1],
          ] as const
        ).some(([nr, nc]) => nr >= 0 && nr < H && nc >= 0 && nc < W && labels[nr]?.[nc] === light);
        if (touchesLight) candidates.push([r, c]);
      }
    }
    let moved = false;
    for (const [r, c] of shuffle(random, candidates)) {
      (labels[r] as string[])[c] = light;
      if (isConnected('A') && isConnected('B')) {
        moved = true;
        break;
      }
      (labels[r] as string[])[c] = heavy;
    }
    if (!moved) break;
  }

  // If still unequal, toggle unlocked grid cells outside switch zones and outside frame
  for (let step = 0; step < 25; step++) {
    const ca = countFilled('A');
    const cb = countFilled('B');
    if (ca === cb && ca >= 2) break;
    const needMore = ca < cb ? 'A' : 'B';
    const freeCells: [number, number][] = [];
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (switches.some((s) => inSwitchZone(s, r, c))) continue;
        if (frame && r >= frame.top && r <= frame.bottom && c >= frame.left && c <= frame.right)
          continue;
        if (labels[r]?.[c] === needMore && (grid[r]?.[c] ?? 0) === 0) freeCells.push([r, c]);
      }
    }
    if (!freeCells.length) break;
    const chosen = pick(random, freeCells);
    if (!chosen) break;
    const [r, c] = chosen;
    (grid[r] as number[])[c] = 1;
  }

  const ca = countFilled('A');
  const cb = countFilled('B');
  if (ca !== cb || ca < 2) return null;
  const rows = labels.map((r) => r.join(''));
  const p: Panel = { name: 'check', rows: gridToRows(grid), portions: rows };
  const pCounts = [...portionCounts(p, picture(p)).values()];
  if (pCounts.length < 2 || !pCounts.every((v) => v === pCounts[0])) return null;
  return rows;
}

/** Add dark clues (at most 1 per line, never a line's only clue). */
export function pickDarkClues(
  p: Panel,
  count: number,
  random: Rng,
): ['row' | 'col', number, number][] | null {
  const c = clues(p);
  const candidates: ['row' | 'col', number, number][] = [];
  c.rows.forEach((runs, r) => {
    if (runs.length > 1) {
      const k = randInt(random, 0, runs.length - 1);
      candidates.push(['row', r, k]);
    }
  });
  c.cols.forEach((runs, col) => {
    if (runs.length > 1) {
      const k = randInt(random, 0, runs.length - 1);
      candidates.push(['col', col, k]);
    }
  });
  if (candidates.length < count) return null;
  return shuffle(random, candidates).slice(0, count);
}
