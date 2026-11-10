/**
 * The prototype kit: what every puzzle prototype is (a title, where it sits
 * in the game, its rules, and a mount function that builds it in a box),
 * and small DOM helpers. Prototypes are functional, not themed: plain
 * shapes and labels, to find out whether each puzzle is fun.
 */

export interface Proto {
  id: string;
  title: string;
  /** The holiday room it's in (or "Holiday Hall" for the final puzzle). */
  room: string;
  kind: 'intro' | 'home' | 'relic' | 'final' | 'workshop';
  /** The puzzle it grows from, and the twist. */
  from: string;
  /** How to play, briefly. */
  rules: string;
  /** The panels teach the rules: keep them folded away (a run of panels). */
  teaches?: boolean;
  /** Number of panels in this puzzle run. */
  panelCount?: number;
  /** The run's panels (story order), for tests and tools. */
  panels?: readonly unknown[];
  /** Build the puzzle in `host`; call `solved()` when it's done. */
  mount(host: HTMLElement, ctx: Ctx): void;
}

export interface Ctx {
  solved(): void;
  /** A line of feedback under the puzzle ("3 moves", "not yet"…). */
  status(text: string): void;
}

export interface BoardPersistenceHooks {
  initialState?: unknown;
  onChange(state: unknown): void;
}

const boardPersistence = new WeakMap<HTMLElement, BoardPersistenceHooks>();

export function setBoardPersistence(host: HTMLElement, hooks: BoardPersistenceHooks): void {
  boardPersistence.set(host, hooks);
}

export function getBoardPersistence(host: HTMLElement): BoardPersistenceHooks | undefined {
  return boardPersistence.get(host);
}

export function panelSignature(panel: unknown): string {
  try {
    return JSON.stringify(panel);
  } catch {
    return '';
  }
}

type Child = Node | string | null | undefined | false;

/** Make an element: h('button', { class: 'x', onclick: … }, 'Label'). */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, unknown> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function')
      el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

/** A seeded random number generator (mulberry32), for repeatable scrambles. */
export { rng } from '../gen/core/rng';

/**
 * Breadth-first search over a puzzle's states: the fewest moves from
 * `start` to a solved state (null if none within `limit` states). For the
 * tests, which prove each level can be solved.
 */
export function bfs<S, M>(
  start: S,
  moves: (s: S) => M[],
  apply: (s: S, m: M) => S | null,
  solved: (s: S) => boolean,
  key: (s: S) => string,
  limit = 2_000_000,
): M[] | null {
  const seen = new Map<string, { prev: string | null; move: M | null }>();
  const startKey = key(start);
  seen.set(startKey, { prev: null, move: null });
  let frontier: [string, S][] = [[startKey, start]];
  const path = (k: string): M[] => {
    const out: M[] = [];
    for (
      let at = seen.get(k);
      at?.move !== null && at?.move !== undefined;
      at = seen.get(at.prev ?? '')
    )
      out.unshift(at.move);
    return out;
  };
  if (solved(start)) return [];
  while (frontier.length && seen.size < limit) {
    const next: [string, S][] = [];
    for (const [k, s] of frontier)
      for (const m of moves(s)) {
        const t = apply(s, m);
        if (!t) continue;
        const tk = key(t);
        if (seen.has(tk)) continue;
        seen.set(tk, { prev: k, move: m });
        if (solved(t)) return path(tk);
        next.push([tk, t]);
      }
    frontier = next;
  }
  return null;
}

import { isSoundEnabled } from '../settings';

let audio: AudioContext | null = null;
/** A short blip (and a buzz on phones). */
export function blip(freq: number, ms = 60, buzz = 0): void {
  if (!isSoundEnabled()) return;
  try {
    audio ??= new AudioContext();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.frequency.value = freq;
    o.type = 'triangle';
    g.gain.setValueAtTime(0.12, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + ms / 1000);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + ms / 1000);
  } catch {
    // No audio: silent.
  }
  if (buzz) navigator.vibrate?.(buzz);
}
