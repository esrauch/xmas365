/** A solver that finds a panel's answers (up to a limit, within a budget), by propagation and search. */
import { Budget } from '../core/budget';
import { type Knot, type Link, type Web } from './model';
import { type Rules, pieces, solved } from './rules';

/** Find up to `limit` answers (each a thread count per link). */
export function solve(
  web: Web,
  limit = 2,
  rules: Rules = {},
  budget: Budget = new Budget(),
): number[][] {
  const L = web.links.length;
  const K = web.knots.length;
  const found: number[][] = [];
  const noCrossing = rules.noCrossing !== false;
  const connected = rules.connected !== false;

  /** Tighten `val` (-1 unknown) and link bounds `[minV, maxV]` in place; false if unsolvable. */
  const propagate = (val: Int8Array, minV: Int8Array, maxV: Int8Array): boolean => {
    for (let i = 0; i < L; i++) {
      const v = val[i] ?? -1;
      if (v >= 0) {
        minV[i] = v;
        maxV[i] = v;
      } else {
        minV[i] = 0;
        maxV[i] = 2;
      }
    }
    for (let changed = true; changed;) {
      changed = false;
      for (let i = 0; i < L; i++) {
        const loI = minV[i] ?? 0;
        const hiI = maxV[i] ?? 2;
        if (loI > hiI) return false;
        if (loI === hiI && val[i] === -1) {
          val[i] = loI;
          changed = true;
        }
      }
      // Snowflakes: inside the frame, a segment is drawn iff its mirror image is.
      for (const [a, b] of web.framePairs) {
        const state = (seg: string): 'yes' | 'no' | 'maybe' => {
          const over = web.segmentLinks.get(seg) ?? [];
          if (over.some((i) => (minV[i] ?? 0) > 0)) return 'yes';
          return over.every((i) => (maxV[i] ?? 2) === 0) ? 'no' : 'maybe';
        };
        const x = state(a);
        const y = state(b);
        if ((x === 'yes' && y === 'no') || (x === 'no' && y === 'yes')) return false;
        const empty = x === 'no' && y === 'maybe' ? b : y === 'no' && x === 'maybe' ? a : null;
        if (empty)
          for (const i of web.segmentLinks.get(empty) ?? [])
            if ((maxV[i] ?? 2) > 0) {
              maxV[i] = 0;
              if ((minV[i] ?? 0) > 0) return false;
              val[i] = 0;
              changed = true;
            }
        const drawn = x === 'yes' && y === 'maybe' ? b : y === 'yes' && x === 'maybe' ? a : null;
        if (drawn) {
          const active = (web.segmentLinks.get(drawn) ?? []).filter((i) => (maxV[i] ?? 2) > 0);
          if (active.length === 0) return false;
          if (active.length === 1) {
            const only = active[0] as number;
            if ((minV[only] ?? 0) < 1) {
              minV[only] = 1;
              changed = true;
            }
          }
        }
      }
      if (noCrossing)
        for (let i = 0; i < L; i++)
          if ((maxV[i] ?? 2) > 0 && (web.crosses[i] ?? []).some((j) => (minV[j] ?? 0) > 0)) {
            if ((minV[i] ?? 0) > 0) return false;
            maxV[i] = 0;
            val[i] = 0;
            changed = true;
          }
      const lo = new Array<number>(K).fill(0);
      const hi = new Array<number>(K).fill(0);
      const freeCount = new Array<number>(K).fill(0);
      const deg = new Array<number>(K).fill(0);
      web.links.forEach((l, i) => {
        const mn = minV[i] ?? 0;
        const mx = maxV[i] ?? 2;
        for (const k of [l.a, l.b]) {
          lo[k] = (lo[k] ?? 0) + mn;
          hi[k] = (hi[k] ?? 0) + mx;
          if (mn > 0) deg[k] = (deg[k] ?? 0) + 1;
          if (val[i] === -1) freeCount[k] = (freeCount[k] ?? 0) + 1;
        }
      });
      // What each knot needs, where it's known: its number, or its letter's value once a knot of that letter is settled.
      const letterVal = new Map<string, number>(web.letterCounts);
      for (const [k, knot] of web.knots.entries()) {
        if (knot.clue.kind !== 'letter' || freeCount[k] !== 0) continue;
        const v = letterVal.get(knot.clue.letter);
        if (v !== undefined && v !== lo[k]) return false;
        letterVal.set(knot.clue.letter, lo[k] ?? 0);
      }
      if (new Set(letterVal.values()).size !== letterVal.size) return false;
      const need = web.knots.map((knot) =>
        knot.clue.kind === 'count'
          ? knot.clue.n
          : knot.clue.kind === 'letter'
            ? letterVal.get(knot.clue.letter)
            : undefined,
      );
      // Unsettled letters: their knots' ranges must overlap, and not only on a value another letter has.
      const groups = new Map<string, [number, number]>();
      for (const [k, knot] of web.knots.entries()) {
        if (knot.clue.kind !== 'letter' || letterVal.has(knot.clue.letter)) continue;
        const g = groups.get(knot.clue.letter) ?? [1, 99];
        groups.set(knot.clue.letter, [Math.max(g[0], lo[k] ?? 0), Math.min(g[1], hi[k] ?? 0)]);
      }
      const taken = new Set(letterVal.values());
      for (const [lo2, hi2] of groups.values()) {
        if (lo2 > hi2) return false;
        let open = false;
        for (let v = lo2; v <= hi2 && !open; v++) open = !taken.has(v);
        if (!open) return false;
      }
      // Pigeonhole & capacity interval tightening across all knots
      for (let k = 0; k < K; k++) {
        const n = need[k];
        const lk = lo[k] ?? 0;
        const hk = hi[k] ?? 0;
        if (n !== undefined) {
          if (lk > n || hk < n) return false;
          for (const i of web.incident[k] ?? []) {
            const mn = minV[i] ?? 0;
            const mx = maxV[i] ?? 2;
            const newMax = Math.min(mx, n - (lk - mn));
            const newMin = Math.max(mn, n - (hk - mx));
            if (newMin > newMax) return false;
            if (newMax < mx) {
              maxV[i] = newMax;
              changed = true;
            }
            if (newMin > mn) {
              minV[i] = newMin;
              changed = true;
            }
            if (minV[i] === maxV[i] && val[i] === -1) {
              val[i] = minV[i] as number;
              changed = true;
            }
          }
        } else if (K > 1 && hk < 1) return false;
        if (changed) break;
        if (web.ends) {
          const want = web.ends.includes(k) ? 1 : 2;
          const d = deg[k] ?? 0;
          const open = (web.incident[k] ?? []).filter(
            (i) => (minV[i] ?? 0) === 0 && (maxV[i] ?? 2) > 0,
          ).length;
          if (d > want || d + open < want) return false;
          if (d === want && open > 0) {
            for (const i of web.incident[k] ?? []) {
              if ((minV[i] ?? 0) === 0 && (maxV[i] ?? 2) > 0) {
                maxV[i] = 0;
                val[i] = 0;
                changed = true;
              }
            }
          }
        }
        if (changed) break;
      }
    }
    if (!rules.noFlags && [...web.rowFlags, ...web.colFlags].some((f) => f !== null)) {
      // Each flag: threads already along its line can't pass it, and what's left must still reach it.
      const lo = {
        rows: new Array<number>(web.height).fill(0),
        cols: new Array<number>(web.width).fill(0),
      };
      const hi = {
        rows: new Array<number>(web.height).fill(0),
        cols: new Array<number>(web.width).fill(0),
      };
      web.links.forEach((l, i) => {
        const a = web.knots[l.a] as Knot;
        const b = web.knots[l.b] as Knot;
        const line =
          a.r === b.r ? (['rows', a.r] as const) : a.c === b.c ? (['cols', a.c] as const) : null;
        if (!line) return;
        lo[line[0]][line[1]] = (lo[line[0]][line[1]] ?? 0) + (minV[i] ?? 0);
        hi[line[0]][line[1]] = (hi[line[0]][line[1]] ?? 0) + (maxV[i] ?? 2);
      });
      for (const [flags, k] of [
        [web.rowFlags, 'rows'],
        [web.colFlags, 'cols'],
      ] as const)
        for (const [line, f] of flags.entries())
          if (f !== null && ((lo[k][line] ?? 0) > f || (hi[k][line] ?? 0) < f)) return false;
    }
    if (connected) {
      // A finished piece with knots left outside it can never join up.
      const threads = Array.from(minV, (v) => Math.max(0, v));
      const piece = pieces(web, threads);
      const open = new Set<number>();
      web.links.forEach((l, i) => {
        if (val[i] === -1 && (maxV[i] ?? 2) > (minV[i] ?? 0))
          open.add(piece[l.a] ?? -1).add(piece[l.b] ?? -1);
      });
      const all = new Set(piece);
      if (all.size > 1 && [...all].some((p) => !open.has(p))) return false;
    }
    return true;
  };

  const go = (val: Int8Array): void => {
    budget.tick();
    const minV = new Int8Array(L);
    const maxV = new Int8Array(L);
    if (found.length >= limit || !propagate(val, minV, maxV)) return;
    let pick = -1;
    let best = 99;
    for (let i = 0; i < L; i++) {
      if (val[i] !== -1) continue;
      const l = web.links[i] as Link;
      const span = (maxV[i] ?? 2) - (minV[i] ?? 0);
      const free =
        span * 10 +
        [l.a, l.b].reduce(
          (s, k) => s + (web.incident[k] ?? []).filter((j) => val[j] === -1).length,
          0,
        );
      if (free < best) {
        best = free;
        pick = i;
      }
    }
    if (pick < 0) {
      const threads = Array.from(val);
      if (solved(web, threads, rules)) found.push(threads);
      return;
    }
    const loP = minV[pick] ?? 0;
    const hiP = maxV[pick] ?? 2;
    for (let v = loP; v <= hiP; v++) {
      const next = Int8Array.from(val);
      next[pick] = v;
      go(next);
    }
  };
  go(new Int8Array(L).fill(-1));
  return found;
}

export const countSolutions = (
  web: Web,
  limit = 2,
  rules: Rules = {},
  budget: Budget = new Budget(),
): number => solve(web, limit, rules, budget).length;
