/**
 * Net (Lights) solver: fast depth-first search with loop prevention, component tracking,
 * budget capping, and early pruning for all holiday twists.
 */
import { Budget } from '../core/budget';
import { inFrame, mirrorSquare } from '../core/mirror';
import { type Board, DIRS, N, OPP, STEP, type Spot, W, key, mirrorMask } from './model';
import { type Rules, options, solved } from './rules';

/** Find up to `limit` answers (each the grid of pieces). */
export function solve(
  b: Board,
  limit = 2,
  rules: Rules = {},
  budgetIn: Budget | number = 100_000,
): number[][][] {
  const budget = typeof budgetIn === 'number' ? new Budget(budgetIn) : budgetIn;

  const cells: Spot[] = [];
  for (let r = 0; r < b.height; r++)
    for (let c = 0; c < b.width; c++) if (b.inside(r, c)) cells.push([r, c]);

  const walls = b.servings && !rules.noServings;
  const opts = new Map(
    cells.map(([r, c]) => [
      key(r, c),
      options(b, r, c, walls, Boolean(rules.noColours), Boolean(rules.blindDark)),
    ]),
  );

  const can = (r: number, c: number, d: number, want: boolean): boolean =>
    (opts.get(key(r, c)) ?? []).some((m) => !!(m & d) === want);

  // Single-pass arc-consistency filter: prune orientations whose neighbour cannot match
  for (const [r, c] of cells) {
    const k = key(r, c);
    const list = opts.get(k) ?? [];
    if (list.length <= 1) continue;
    const kept = list.filter((m) =>
      DIRS.every((d) => {
        const [dr, dc] = STEP[d] as Spot;
        const nr = r + dr;
        const nc = c + dc;
        return !b.inside(nr, nc) || can(nr, nc, OPP[d] as number, !!(m & d));
      }),
    );
    if (kept.length < list.length) opts.set(k, kept);
  }

  // Snowflake symmetry filter: inside the frame, keep only orientations whose mirror is also valid
  if (b.frame && !rules.noSnow) {
    const f = b.frame;
    for (const [r, c] of cells) {
      if (!inFrame(f, r, c)) continue;
      const [mr, mc] = mirrorSquare(f, r, c);
      const mList = opts.get(key(mr, mc)) ?? [];
      const k = key(r, c);
      const list = opts.get(k) ?? [];
      const kept = list.filter((m) => mList.includes(mirrorMask(m, f.axis)));
      if (kept.length < list.length) opts.set(k, kept);
    }
  }

  const grid = b.solution.map((row) => row.map((m) => (m < 0 ? -1 : -2))); // -2: undecided
  const index = new Map(cells.map(([r, c], i) => [key(r, c), i]));
  const parent = cells.map((_, i) => i);

  const find = (p: number[], i: number): number => {
    while (p[i] !== i) i = p[i] as number;
    return i;
  };

  const secondaryPlug = b.bluePlug ?? b.greenPlug;
  const plugs = secondaryPlug ? [b.plug, secondaryPlug] : [b.plug];
  const plugIndex = plugs.map(([r, c]) => index.get(key(r, c)) as number);

  const found: number[][][] = [];

  const go = (i: number, p: number[]): void => {
    if (found.length >= limit) return;
    budget.tick();

    if (i === cells.length) {
      const g = grid.map((row) => [...row]);
      if (solved(b, g, rules)) found.push(g);
      return;
    }

    const [r, c] = cells[i] as Spot;
    for (const m of opts.get(key(r, c)) ?? []) {
      let ok = true;
      for (const d of DIRS) {
        const [dr, dc] = STEP[d] as Spot;
        const nr = r + dr;
        const nc = c + dc;
        if (!b.inside(nr, nc)) continue;
        const nm = grid[nr]?.[nc] ?? -1;
        const want = !!(m & d);
        if (nm >= 0) {
          if (!!(nm & (OPP[d] as number)) !== want) ok = false;
        } else if (!can(nr, nc, OPP[d] as number, want)) ok = false;
        if (!ok) break;
      }
      if (!ok) continue;

      const q = [...p];
      for (const d of [N, W]) {
        if (!(m & d)) continue;
        const [dr, dc] = STEP[d] as Spot;
        const j = index.get(key(r + dr, c + dc));
        if (j === undefined) continue;
        const a = find(q, i);
        const z = find(q, j);
        if (a === z && !rules.loops) ok = false;
        else q[a] = z;
      }
      if (!ok) continue;

      if (b.frame && !rules.noSnow && inFrame(b.frame, r, c)) {
        const [mr, mc] = mirrorSquare(b.frame, r, c);
        const mi = index.get(key(mr, mc));
        if (mi !== undefined && mi < i) {
          const mm = grid[mr]?.[mc] ?? -1;
          if (mm !== mirrorMask(m, b.frame.axis)) ok = false;
        }
      }
      if (!ok) continue;

      (grid[r] as number[])[c] = m;

      const open = new Set<number>();
      const size = new Map<number, number>();
      for (let j = 0; j <= i; j++) {
        const [rr, cc] = cells[j] as Spot;
        const root = find(q, j);
        size.set(root, (size.get(root) ?? 0) + 1);
        const mm = grid[rr]?.[cc] ?? 0;
        for (const d of [DIRS[2] as number, DIRS[1] as number]) {
          const [dr, dc] = STEP[d] as Spot;
          if (mm & d && (grid[rr + dr]?.[cc + dc] ?? -1) === -2) open.add(root);
        }
      }

      let closedEarly = false;
      const plugRoots = plugIndex.map((k) => (k <= i ? find(q, k) : -1));
      if (plugRoots.length === 2 && plugRoots[0] !== -1 && plugRoots[0] === plugRoots[1]) {
        closedEarly = true;
      }
      for (const [root, n] of size) {
        if (open.has(root)) continue;
        if (!plugRoots.includes(root) || (plugIndex.length === 1 && n < cells.length)) {
          closedEarly = true;
        }
      }

      if (!closedEarly) go(i + 1, q);
      (grid[r] as number[])[c] = -2;
    }
  };

  go(0, parent);
  return found;
}

export const countSolutions = (
  b: Board,
  limit = 2,
  rules: Rules = {},
  budgetIn: Budget | number = 100_000,
): number => solve(b, limit, rules, budgetIn).length;
