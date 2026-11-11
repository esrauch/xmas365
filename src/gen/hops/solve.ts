/**
 * A fast, budgeted solver for Bunny hops and its twists.
 */
import { Budget } from '../core/budget';
import { inside, mirrorKey, mirrorSquare, segment } from '../core/mirror';
import { type Board, type Spot } from './model';
import { type Rules, solved } from './rules';

/** Find up to `limit` routes (spot indices in order; for two bunnies, `[...red, ...blue]`). */
export function solve(
  b: Board,
  limit = 2,
  rules: Rules = {},
  budget: Budget | number = new Budget(),
  stats?: { steps: number },
): number[][] {
  const bgt = typeof budget === 'number' ? new Budget(budget) : budget;
  const N = b.spots.length;
  const found: number[][] = [];
  const used = new Array<boolean>(N).fill(false);

  const flags =
    !rules.noFlags && (b.rowFlags.some((f) => f !== null) || b.colFlags.some((f) => f !== null));
  const courses = !rules.noPortions && b.portion.some((x) => x !== undefined);
  const letters = !rules.noLetters && b.letterAt.size > 0 && b.blanks.length > 0;
  const blankSteps = new Set(b.blanks);
  const snow = !rules.noSnow && b.frame !== undefined;
  const hasDark = b.dark.some(Boolean);
  const hasBurrows = !rules.noBurrows && b.burrows.length > 0;

  // Active hops graph for this solve run
  const activeHops: number[][] = b.spots.map((_, i) =>
    (b.hops[i] ?? []).filter((j) => (rules.noBurrows ? !b.burrow.has(`${i},${j}`) : true)),
  );

  // All-pairs shortest hop distances
  const dist = b.spots.map((_, s) => {
    const d = new Array<number>(N).fill(99);
    d[s] = 0;
    const q = [s];
    while (q.length) {
      const x = q.shift() as number;
      for (const y of activeHops[x] ?? []) {
        if ((d[y] ?? 99) > (d[x] ?? 0) + 1) {
          d[y] = (d[x] ?? 0) + 1;
          q.push(y);
        }
      }
    }
    return d;
  });

  // Track surface strokes drawn so far for fast O(1) snowflake mirror checks
  const drawnStrokes = new Set<string>();
  const spotInFrame = b.spots.map(([r, c]) =>
    b.frame
      ? r >= b.frame.top && r <= b.frame.bottom && c >= b.frame.left && c <= b.frame.right
      : false,
  );
  const mirrorSpot = b.spots.map(([r, c]) => {
    if (!b.frame) return -1;
    const [mr, mc] = mirrorSquare(b.frame, r, c);
    return b.index.get(`${mr},${mc}`) ?? -1;
  });
  const frameStroke = (u: number, v: number): string | null => {
    if (!b.frame || b.burrow.has(`${u},${v}`)) return null;
    const [r1, c1] = b.spots[u] as Spot;
    const [r2, c2] = b.spots[v] as Spot;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return null;
    const s = segment(r1, c1, r2, c2);
    return inside(b.frame, s) ? s : null;
  };

  /** Check that finalized spot `u` inside frame agrees with its mirror if also finalized. */
  const snowConsistentAt = (u: number, head1: number, head2 = -1): boolean => {
    if (!snow || !b.frame || !spotInFrame[u]) return true;
    const mu = mirrorSpot[u] ?? -1;
    if (mu < 0 || !used[mu] || mu === head1 || mu === head2) return true;
    for (const v of activeHops[u] ?? []) {
      const s = frameStroke(u, v);
      if (!s) continue;
      const ms = mirrorKey(b.frame, s);
      const hasS = drawnStrokes.has(s);
      const hasMS = drawnStrokes.has(ms);
      if (hasS !== hasMS) {
        // If `mv` is not finalized yet, `ms` might still be drawn when entering `mv`,
        // EXCEPT `mu` IS already finalized, so no new stroke can ever touch `mu`!
        return false;
      }
    }
    return true;
  };

  const totalMandatory = b.spots.filter((_, i) => !b.dark[i]).length;
  let mandatoryVisited = 0;

  if (b.twoBunnies) {
    const redStart = b.redStart;
    const blueStart = b.blueStart;
    if (redStart === undefined || blueStart === undefined) return found;
    const sec = b.secondTone;
    const colour = (i: number): string => (rules.noColours ? 'w' : (b.colour[i] ?? 'w'));

    const redGivenAt = new Map<number, number>();
    const blueGivenAt = new Map<number, number>();
    for (const [i, n] of b.given) {
      if (rules.noDarkLength && hasDark && n === b.redLength && b.colour[i] === 'r') continue;
      if (rules.noDarkLength && hasDark && n === b.blueLength && b.colour[i] === sec) continue;
      const c = n === 1 ? b.colour[i] : colour(i);
      if (c === 'r') redGivenAt.set(n, i);
      else if (c === sec) blueGivenAt.set(n, i);
    }
    const redNumbers = [...redGivenAt.keys()].sort((x, y) => x - y);
    const blueNumbers = [...blueGivenAt.keys()].sort((x, y) => x - y);

    const reqRedMand = b.spots.filter((_, i) => !b.dark[i] && colour(i) === 'r').length;
    const lockRedLen = !rules.noDarkLength && !rules.noColours && b.redLength !== undefined;
    const minRedSteps = Math.max(
      1,
      letters ? Math.max(0, ...b.blanks) : 0,
      ...redNumbers,
      lockRedLen ? (b.redLength as number) : 0,
    );
    const maxRedSteps = lockRedLen ? (b.redLength as number) : b.length - 1;

    const fits = (i: number, n: number, tone: 'r' | 'b' | 'g'): boolean => {
      const c = colour(i);
      if (c !== 'w' && c !== tone) return false;
      const g = b.given.get(i);
      if (g !== undefined) {
        const ignoreLast =
          rules.noDarkLength &&
          hasDark &&
          ((g === b.redLength && b.colour[i] === 'r') ||
            (g === b.blueLength && b.colour[i] === sec));
        if (!ignoreLast) {
          if ((c === tone || c === 'w') && g !== n) return false;
          if (c !== 'w' && c !== tone) return false;
        }
      }
      const givenMap = tone === 'r' ? redGivenAt : blueGivenAt;
      const want = givenMap.get(n);
      if (want !== undefined && want !== i) return false;

      const nums = tone === 'r' ? redNumbers : blueNumbers;
      const next = nums.find((m) => m > n);
      if (next !== undefined) {
        const target = givenMap.get(next) as number;
        const d = dist[i]?.[target] ?? 99;
        if (d > next - n) return false;
        if (!hasBurrows && ((next - n - d) & 1) !== 0) return false;
      }

      if (letters) {
        if (tone === 'r') {
          if (blankSteps.has(n) !== b.letterAt.has(i)) return false;
        } else if (b.letterAt.has(i)) {
          return false;
        }
      }
      return true;
    };

    const red: number[] = [];
    const blue: number[] = [];
    let redMandVisited = 0;
    const finished = new Set<string>();

    const togetherFrom = (from: number): boolean => {
      const seen = new Array<boolean>(N).fill(false);
      const stack = [from];
      seen[from] = true;
      let mandReached = 0;
      while (stack.length) {
        const x = stack.pop() as number;
        for (const y of activeHops[x] ?? []) {
          if (!used[y] && !seen[y]) {
            seen[y] = true;
            if (!b.dark[y]) mandReached++;
            stack.push(y);
          }
        }
      }
      return mandReached === totalMandatory - mandatoryVisited;
    };

    const togetherTwo = (fromRed: number, fromBlue: number): boolean => {
      const seen = new Array<boolean>(N).fill(false);
      const stack = [fromRed, fromBlue];
      seen[fromRed] = true;
      seen[fromBlue] = true;
      let mandReached = !b.dark[fromBlue] ? 1 : 0;
      while (stack.length) {
        const x = stack.pop() as number;
        for (const y of activeHops[x] ?? []) {
          if (!used[y] && !seen[y]) {
            seen[y] = true;
            if (!b.dark[y]) mandReached++;
            stack.push(y);
          }
        }
      }
      return mandReached === totalMandatory - mandatoryVisited;
    };

    const goBlue = (): void => {
      if (found.length >= limit) return;
      bgt.tick();

      const totalLen = red.length + blue.length;
      const mandLeft = totalMandatory - mandatoryVisited;
      if (!rules.noDarkLength && totalLen + mandLeft > b.length) return;

      if (
        (!rules.noDarkLength && totalLen === b.length) ||
        (rules.noDarkLength && mandLeft === 0)
      ) {
        const combined = [...red, ...blue];
        if (solved(b, combined, rules)) found.push(combined);
        if (!rules.noDarkLength) return;
      }

      const last = blue[blue.length - 1] as number;
      if (!togetherFrom(last)) return;

      const n = blue.length + 1;
      const onward = (j: number): number => (activeHops[j] ?? []).filter((k) => !used[k]).length;
      const order = (activeHops[last] ?? [])
        .filter((j) => !used[j])
        .sort((x, y) => onward(x) - onward(y));

      for (const j of order) {
        if (!fits(j, n, sec)) continue;

        let changedPortion: string | undefined;
        if (courses) {
          const was = b.portion[last];
          const now = b.portion[j];
          if (was !== undefined && now !== undefined && was !== now) {
            if (b.spots.some((_, s) => !used[s] && !b.dark[s] && b.portion[s] === was)) continue;
            if (finished.has(now)) continue;
            changedPortion = was;
          }
        }

        const seg = frameStroke(last, j);
        if (seg) drawnStrokes.add(seg);
        used[j] = true;
        if (!b.dark[j]) mandatoryVisited++;
        blue.push(j);
        if (changedPortion) finished.add(changedPortion);

        if (
          snowConsistentAt(last, j) &&
          (mirrorSpot[last] === undefined ||
            mirrorSpot[last] < 0 ||
            snowConsistentAt(mirrorSpot[last] as number, j))
        ) {
          goBlue();
        }

        if (changedPortion) finished.delete(changedPortion);
        blue.pop();
        if (!b.dark[j]) mandatoryVisited--;
        used[j] = false;
        if (seg) drawnStrokes.delete(seg);
      }
    };

    const goRed = (): void => {
      if (found.length >= limit) return;
      bgt.tick();

      const last = red[red.length - 1] as number;
      const redMandLeft = reqRedMand - redMandVisited;
      if (red.length + redMandLeft > maxRedSteps) return;
      if (!togetherTwo(last, blueStart)) return;

      // Try transitioning to the second bunny if red has fulfilled its mandatory requirements
      if (
        redMandLeft === 0 &&
        red.length >= minRedSteps &&
        red.length <= maxRedSteps &&
        !used[blueStart] &&
        fits(blueStart, 1, sec)
      ) {
        let canSwitch = true;
        let switchPortion: string | undefined;
        if (courses) {
          const was = b.portion[last];
          const now = b.portion[blueStart];
          if (was !== undefined && now !== undefined && was !== now) {
            if (
              b.spots.some((_, s) => !used[s] && !b.dark[s] && b.portion[s] === was) ||
              finished.has(now)
            ) {
              canSwitch = false;
            } else {
              switchPortion = was;
            }
          }
        }
        if (canSwitch && snowConsistentAt(last, blueStart)) {
          used[blueStart] = true;
          if (!b.dark[blueStart]) mandatoryVisited++;
          blue.push(blueStart);
          if (switchPortion) finished.add(switchPortion);
          goBlue();
          if (switchPortion) finished.delete(switchPortion);
          blue.pop();
          if (!b.dark[blueStart]) mandatoryVisited--;
          used[blueStart] = false;
        }
      }

      if (red.length >= maxRedSteps) return;

      const n = red.length + 1;
      const onward = (j: number): number => (activeHops[j] ?? []).filter((k) => !used[k]).length;
      const order = (activeHops[last] ?? [])
        .filter((j) => !used[j] && j !== blueStart)
        .sort((x, y) => onward(x) - onward(y));

      for (const j of order) {
        if (!fits(j, n, 'r')) continue;

        let changedPortion: string | undefined;
        if (courses) {
          const was = b.portion[last];
          const now = b.portion[j];
          if (was !== undefined && now !== undefined && was !== now) {
            if (b.spots.some((_, s) => !used[s] && !b.dark[s] && b.portion[s] === was)) continue;
            if (finished.has(now)) continue;
            changedPortion = was;
          }
        }

        const seg = frameStroke(last, j);
        if (seg) drawnStrokes.add(seg);
        used[j] = true;
        if (!b.dark[j]) {
          mandatoryVisited++;
          if (colour(j) === 'r') redMandVisited++;
        }
        red.push(j);
        if (changedPortion) finished.add(changedPortion);

        if (snowConsistentAt(last, j, blueStart)) {
          goRed();
        }

        if (changedPortion) finished.delete(changedPortion);
        red.pop();
        if (!b.dark[j]) {
          mandatoryVisited--;
          if (colour(j) === 'r') redMandVisited--;
        }
        used[j] = false;
        if (seg) drawnStrokes.delete(seg);
      }
    };

    if (fits(redStart, 1, 'r')) {
      used[redStart] = true;
      if (!b.dark[redStart]) {
        mandatoryVisited++;
        if (colour(redStart) === 'r') redMandVisited++;
      }
      red.push(redStart);
      goRed();
    }

    if (stats) stats.steps = bgt.used;
    return found;
  }

  // Single-bunny solver
  const route: number[] = [];
  const lineSeen = { r: new Map<number, number>(), c: new Map<number, number>() };
  const finished = new Set<string>();

  const givenAt = new Map<number, number>();
  for (const [i, n] of b.given) {
    if (rules.noDarkLength && hasDark && n === b.length) continue;
    givenAt.set(n, i);
  }
  const numbers = [...givenAt.keys()].sort((x, y) => x - y);

  const ok = (i: number, n: number): boolean => {
    const g = b.given.get(i);
    if (g !== undefined && !(rules.noDarkLength && hasDark && g === b.length) && g !== n)
      return false;
    const want = givenAt.get(n);
    if (want !== undefined && want !== i) return false;

    const next = numbers.find((m) => m > n);
    if (next !== undefined) {
      const d = dist[i]?.[givenAt.get(next) as number] ?? 99;
      if (d > next - n) return false;
      if (!hasBurrows && ((next - n - d) & 1) !== 0) return false;
    }

    if (letters) {
      if (blankSteps.has(n) !== b.letterAt.has(i)) return false;
    }

    if (flags) {
      const [r, c] = b.spots[i] as Spot;
      for (const [line, flag, seen] of [
        [r, b.rowFlags[r], lineSeen.r],
        [c, b.colFlags[c], lineSeen.c],
      ] as const) {
        if (flag !== null && flag !== undefined && !seen.has(line) && flag !== n) return false;
      }
      for (const [lines, seen, mine] of [
        [b.rowFlags, lineSeen.r, r],
        [b.colFlags, lineSeen.c, c],
      ] as const) {
        for (const [line, flag] of lines.entries()) {
          if (flag !== null && flag !== undefined && flag <= n && !seen.has(line) && line !== mine)
            return false;
        }
      }
    }

    return true;
  };

  const visit = (i: number, prev?: number): (() => void) => {
    const [r, c] = b.spots[i] as Spot;
    const n = route.length + 1;
    const seg = prev !== undefined ? frameStroke(prev, i) : null;
    if (seg) drawnStrokes.add(seg);
    route.push(i);
    used[i] = true;
    if (!b.dark[i]) mandatoryVisited++;
    const newR = !lineSeen.r.has(r);
    const newC = !lineSeen.c.has(c);
    if (newR) lineSeen.r.set(r, n);
    if (newC) lineSeen.c.set(c, n);
    return () => {
      route.pop();
      used[i] = false;
      if (!b.dark[i]) mandatoryVisited--;
      if (seg) drawnStrokes.delete(seg);
      if (newR) lineSeen.r.delete(r);
      if (newC) lineSeen.c.delete(c);
    };
  };

  const go = (): void => {
    if (found.length >= limit) return;
    bgt.tick();

    const mandLeft = totalMandatory - mandatoryVisited;
    if (!rules.noDarkLength && route.length + mandLeft > b.length) return;

    if (
      (!rules.noDarkLength && route.length === b.length) ||
      (rules.noDarkLength && mandLeft === 0)
    ) {
      if (solved(b, route, rules)) found.push([...route]);
      if (!rules.noDarkLength) return;
    }

    const last = route[route.length - 1] as number;

    // Dead-end degree check on mandatory unvisited squares
    if (!hasDark) {
      let stuck = 0;
      for (let s = 0; s < N; s++) {
        if (used[s]) continue;
        const free = (activeHops[s] ?? []).filter((t) => !used[t] || t === last).length;
        if (free === 0) return;
        if (free === 1) stuck++;
      }
      if (stuck > 2) return;
    }

    // Reachability of all unvisited mandatory spots
    const seen = new Array<boolean>(N).fill(false);
    const stack = [last];
    seen[last] = true;
    let reachedMand = 0;
    while (stack.length) {
      const x = stack.pop() as number;
      for (const y of activeHops[x] ?? []) {
        if (!used[y] && !seen[y]) {
          seen[y] = true;
          if (!b.dark[y]) reachedMand++;
          stack.push(y);
        }
      }
    }
    if (reachedMand !== mandLeft) return;

    const n = route.length + 1;
    const onward = (j: number): number => (activeHops[j] ?? []).filter((k) => !used[k]).length;
    const order = (activeHops[last] ?? [])
      .filter((j) => !used[j])
      .sort((x, y) => onward(x) - onward(y));

    for (const j of order) {
      if (!ok(j, n)) continue;

      if (courses) {
        const was = b.portion[last];
        const now = b.portion[j];
        if (was !== undefined && now !== undefined && was !== now) {
          if (
            b.spots.some((_, s) => !used[s] && !b.dark[s] && b.portion[s] === was) ||
            finished.has(now)
          )
            continue;
          finished.add(was);
          const undo = visit(j, last);
          if (snowConsistentAt(last, j)) go();
          undo();
          finished.delete(was);
          continue;
        }
      }

      const undo = visit(j, last);
      if (snowConsistentAt(last, j)) go();
      undo();
    }
  };

  const starts = b.at.has(1) ? [b.at.get(1) as number] : b.spots.map((_, i) => i);
  for (const s of starts) {
    if (!ok(s, 1)) continue;
    const undo = visit(s);
    go();
    undo();
  }

  if (stats) stats.steps = bgt.used;
  return found;
}

export function countSolutions(
  b: Board,
  limit = 2,
  rules: Rules = {},
  budget: Budget | number = new Budget(),
): number {
  return solve(b, limit, rules, budget).length;
}
