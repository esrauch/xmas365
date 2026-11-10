/**
 * Rules and verification for Bunny hops (Numbrix) and its twists.
 */
import { segment, symmetricIn } from '../core/mirror';
import { type Board, type Spot, splitRoutes } from './model';

export interface Rules {
  noFlags?: boolean;
  noPortions?: boolean;
  noColours?: boolean;
  noBurrows?: boolean;
  noSnow?: boolean;
  noLetters?: boolean;
  /** Ignore the route length fixed by the last egg in the dark (to test that the dark length matters). */
  noDarkLength?: boolean;
}

/** The lowest number in each row and column, for a full route (spot indices in order). */
export function firstVisits(b: Board, route: number[]): { rows: number[]; cols: number[] } {
  const rows = Array<number>(b.height).fill(0);
  const cols = Array<number>(b.width).fill(0);
  route.forEach((i, n) => {
    const [r, c] = b.spots[i] as Spot;
    if (!rows[r]) rows[r] = n + 1;
    if (!cols[c]) cols[c] = n + 1;
  });
  return { rows, cols };
}

/** Surface strokes covered by the bunny trail(s) (underground burrow hops excluded). */
export function trailSegments(b: Board, route: number[]): Set<string> {
  const segs = new Set<string>();
  const [red, blue] = splitRoutes(b, route);
  for (const path of [red, blue]) {
    for (let n = 1; n < path.length; n++) {
      const u = path[n - 1] as number;
      const v = path[n] as number;
      if (b.burrow.has(`${u},${v}`)) continue;
      const [r1, c1] = b.spots[u] as Spot;
      const [r2, c2] = b.spots[v] as Spot;
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
        segs.add(segment(r1, c1, r2, c2));
      }
    }
  }
  return segs;
}

/** The message word spelled by the route at the message's blank step numbers. */
export function spell(b: Board, route: number[]): string {
  const [red] = splitRoutes(b, route);
  return b.blanks.map((n) => b.letterAt.get(red[n - 1] ?? -1) ?? '_').join('');
}

/** Is a route (spot indices in visit order; for two bunnies, `[...red, ...blue]`) a full, legal tour? */
export function solved(b: Board, route: number[], rules: Rules = {}): boolean {
  if (new Set(route).size !== route.length) return false;
  if (!rules.noDarkLength && route.length !== b.length) return false;

  const visited = new Set(route);
  // Every non-shadowed lawn spot must be visited.
  for (let i = 0; i < b.spots.length; i++) {
    if (!b.dark[i] && !visited.has(i)) return false;
  }

  const [red, blue] = splitRoutes(b, route);
  if (b.twoBunnies) {
    if (!red.length || !blue.length) return false;
    if (b.redStart !== undefined && red[0] !== b.redStart) return false;
    if (b.blueStart !== undefined && blue[0] !== b.blueStart) return false;
    if (!rules.noDarkLength) {
      if (!rules.noColours) {
        if (b.redLength !== undefined && red.length !== b.redLength) return false;
        if (b.blueLength !== undefined && blue.length !== b.blueLength) return false;
      } else if (b.redLength !== undefined && b.blueLength !== undefined) {
        const matchDirect = red.length === b.redLength && blue.length === b.blueLength;
        const matchSwapped = red.length === b.blueLength && blue.length === b.redLength;
        if (!matchDirect && !matchSwapped) return false;
      }
    }
  } else if (b.redStart !== undefined && route[0] !== b.redStart) {
    return false;
  }

  // Each step within each bunny's route must be a legal hop.
  for (const path of b.twoBunnies ? [red, blue] : [route]) {
    for (let n = 1; n < path.length; n++) {
      const prev = path[n - 1] as number;
      const curr = path[n] as number;
      if (!(b.hops[prev] ?? []).includes(curr)) return false;
    }
  }

  // Colours (Fourth of July two bunnies): red bunny over 'r' and 'w', blue bunny over 'b'/'g' and 'w'.
  if (b.twoBunnies && !rules.noColours) {
    const sec = b.secondTone;
    if (red.some((i) => b.colour[i] === sec) || blue.some((i) => b.colour[i] === 'r')) {
      return false;
    }
    for (let i = 0; i < b.spots.length; i++) {
      if (b.dark[i] && !visited.has(i)) continue;
      if (b.colour[i] === 'r' && !red.includes(i)) return false;
      if (b.colour[i] === sec && !blue.includes(i)) return false;
    }
  }

  // Numbered eggs must be visited on their exact step by their bunny.
  if (b.twoBunnies) {
    const sec = b.secondTone;
    for (const [i, g] of b.given) {
      if (rules.noDarkLength && b.dark.some(Boolean) && g === b.redLength && b.colour[i] === 'r')
        continue;
      if (rules.noDarkLength && b.dark.some(Boolean) && g === b.blueLength && b.colour[i] === sec)
        continue;
      const col = rules.noColours && g > 1 ? 'w' : b.colour[i];
      if (col === 'r') {
        if (red[g - 1] !== i) return false;
      } else if (col === sec) {
        if (blue[g - 1] !== i) return false;
      } else {
        if (red[g - 1] !== i && blue[g - 1] !== i) return false;
      }
    }
  } else {
    for (const [i, g] of b.given) {
      if (rules.noDarkLength && b.dark.some(Boolean) && g === b.length) continue;
      if (route[g - 1] !== i) return false;
    }
  }

  // Flags: row and column first-visit ranks.
  if (
    !rules.noFlags &&
    (b.rowFlags.some((f) => f !== null) || b.colFlags.some((f) => f !== null))
  ) {
    const { rows, cols } = firstVisits(b, route);
    if (b.rowFlags.some((f, r) => f !== null && f !== rows[r])) return false;
    if (b.colFlags.some((f, c) => f !== null && f !== cols[c])) return false;
  }

  // Courses (Thanksgiving fair shares): each portion visited in one unbroken stretch.
  if (!rules.noPortions && b.portion.some((x) => x !== undefined)) {
    const done = new Set<string>();
    for (let n = 1; n < route.length; n++) {
      const was = b.portion[route[n - 1] as number];
      const now = b.portion[route[n] as number];
      if (was !== undefined && now !== undefined && was !== now) {
        done.add(was);
        if (done.has(now)) return false;
      }
    }
  }

  // Burrows (Easter): every burrow pair must be used as a hop.
  if (!rules.noBurrows && b.burrows.length > 0) {
    for (const [u, v] of b.burrows) {
      const used = [red, blue].some((path) =>
        path.some(
          (x, n) => n > 0 && ((x === u && path[n - 1] === v) || (x === v && path[n - 1] === u)),
        ),
      );
      if (!used) return false;
    }
  }

  // Snowflakes (Christmas): inside the frame, trail strokes mirror across the axis.
  if (!rules.noSnow && b.frame) {
    if (!symmetricIn(b.frame, trailSegments(b, route))) return false;
  }

  // Letters (Valentine's): the bunny's letters lie on the exact step numbers named in `b.blanks`.
  if (!rules.noLetters && b.letterAt.size > 0 && b.blanks.length > 0) {
    const steps = new Set(b.blanks);
    if (red.some((i, n) => steps.has(n + 1) !== b.letterAt.has(i))) return false;
    for (const i of b.letterAt.keys()) {
      if (!red.includes(i)) return false;
    }
  }

  return true;
}
