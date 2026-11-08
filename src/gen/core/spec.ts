/** What a generator is asked for, and what it hands back. */
export type Tier = 'easy' | 'medium' | 'hard';
export type BoardShape = 'rect' | 'tree' | 'egg' | 'pie' | 'wreath';
export type WordBoardSize = 4 | 5 | 6 | 7 | 9;

export interface Spec<T extends string> {
  tier: Tier;
  /** Optional explicit board size (4x4, 5x5, 6x6, 7x7, or 9x9 for Words). */
  size?: WordBoardSize;
  /** Optional board silhouette (default: 'rect'). */
  shape?: BoardShape;
  /** Twists on, in any combination (none: the plain puzzle). */
  twists: T[];
}

export interface Made<P> {
  panel: P;
  seed: number;
  /** Numbers worth keeping for tuning: answers without the twists, each twist's margin, solver steps. */
  stats: Record<string, number>;
}

/** Try seeds from `from` until `make` succeeds or the deadline passes. */
export function trySeeds<P>(
  from: number,
  seconds: number,
  make: (seed: number) => P | null,
): { result: P; seed: number } | null {
  const deadline = Date.now() + seconds * 1000;
  for (let seed = from; Date.now() < deadline; seed++) {
    const result = make(seed);
    if (result) return { result, seed };
  }
  return null;
}

/** Why attempts were thrown away, counted (for tuning a generator: which step fails most). */
export class Rejections {
  readonly counts = new Map<string, number>();
  /** Count a reason, and return null (so `return why.no('reason')` ends an attempt). */
  no(reason: string): null {
    this.counts.set(reason, (this.counts.get(reason) ?? 0) + 1);
    return null;
  }
  toString(): string {
    return [...this.counts]
      .sort((a, b) => b[1] - a[1])
      .map(([r, n]) => `${r} ×${n}`)
      .join(', ');
  }
}
