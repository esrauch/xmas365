/**
 * The clicky bunny-hop panel: drag from a bunny through neighbouring spots
 * to lay its trail (drag back over it to rub it out), or tap a neighbour to
 * hop there; tap a bunny to take a hop back, or an earlier spot to go back
 * to it. Supports all six holiday twists:
 * - courses (thick portion walls);
 * - colours (red bunny and blue bunny, white squares go to either);
 * - burrows (matching coloured holes joined underground);
 * - snowflakes (frosty frame, mirror line with ❄, and ghost mirror trail);
 * - letters (letter eggs on the board and message blank tiles above);
 * - the dark (shadowed squares ? that may be lawn or rock, lighting up when solved).
 * Rocks (base game) are drawn as grey stones; the bunny can't hop onto them.
 */
import { inside, mirrorKey } from '../gen/core/mirror';
import {
  type Panel,
  type Spot,
  firstVisits,
  key,
  parse,
  solve,
  solved,
  spell,
  splitRoutes,
  trailSegments,
} from './hops';
import { blip, getBoardPersistence, h } from './kit';

const NS = 'http://www.w3.org/2000/svg';
const BURROW = ['#8d6e63', '#5c6bc0', '#26a69a'];
const TINT: Record<string, string> = {
  r: '#fbe0dc',
  b: '#dde6fb',
  g: '#dcf0dc',
  w: '#ffffff',
};
const TRAIL: Record<'r' | 'b' | 'g', string> = {
  r: '#e57373',
  b: '#5c85d6',
  g: '#66bb6a',
};

export interface HopsHooks {
  solved(): void;
  status(text: string): void;
}

export function mountHops(host: HTMLElement, panel: Panel, hooks: HopsHooks): () => unknown {
  const b = parse(panel);
  const H = panel.rows.length;
  const Wd = panel.rows[0]?.length ?? 0;
  const flagged = [...b.rowFlags, ...b.colFlags].some((f) => f !== null);
  const avail = Math.min(host.clientWidth || 360, 520);
  const cell = Math.max(32, Math.min(60, Math.floor((avail - 8) / (Wd + (flagged ? 0.9 : 0)))));
  const pad = flagged ? cell * 0.9 : 0;
  const W = Wd * cell + pad;
  const Hpx = H * cell + pad;

  const secTone = b.secondTone;
  const routes: { r: number[]; b: number[] } = {
    r: b.redStart !== undefined ? [b.redStart] : [],
    b: b.twoBunnies && b.blueStart !== undefined ? [b.blueStart] : [],
  };
  let active: 'r' | 'b' | null = null;
  let lastBunny: 'r' | 'b' = 'r';
  let done = false;
  let lastHoppedSpot: number | null = null;
  const flashing = new Set<number>();
  let cachedSol: number[] | null = null;
  const hintOwner = new Map<number, 'r' | 'b'>();

  // Message blank tiles for Valentine's letters twist
  const note = b.blanks.length ? h('div', { style: { margin: '0 0 8px' } }) : null;
  const combinedRoute = (): number[] => (b.twoBunnies ? [...routes.r, ...routes.b] : routes.r);
  const blankSteps = new Set(b.blanks);

  const drawNote = (): void => {
    if (!note) return;
    const word = done && b.word ? b.word : spell(b, combinedRoute());
    const row = h(
      'div',
      { style: { display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' } },
      h('span', { style: { fontSize: '20px', marginRight: '2px' } }, '🐇'),
      ...b.blanks.map((n, idx) => {
        const ch = word[idx] ?? '_';
        const filled = ch !== '_';
        return h(
          'span',
          {
            style: {
              minWidth: '34px',
              height: '38px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '6px',
              border: `2px ${done ? 'solid #c9a227' : 'dashed #c2185b'}`,
              fontWeight: '700',
              fontSize: done ? '20px' : filled ? '16px' : '14px',
              background: done ? '#ffd54f' : filled ? '#fce4ec' : '#fff',
              color: done ? '#7a1f3d' : filled ? '#ad1457' : '#8a7a86',
              padding: '0 6px',
            },
          },
          done ? ch : filled ? `${n}:${ch}` : String(n),
        );
      }),
    );
    note.replaceChildren(row);
  };
  if (note) host.append(note);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(Hpx));
  svg.setAttribute('viewBox', `0 0 ${W} ${Hpx}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);

  const flashSpots = (spots: number[]): void => {
    spots.forEach((s) => flashing.add(s));
    blip(140, 120, 40);
    render();
    setTimeout(() => {
      spots.forEach((s) => flashing.delete(s));
      render();
    }, 400);
  };

  const spotAt = (e: PointerEvent, strict: boolean): number | undefined => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const y = ((e.clientY - box.top) * Hpx) / box.height;
    const r = Math.floor(y / cell);
    const c = Math.floor(x / cell);
    if (strict && Math.hypot(x - (c + 0.5) * cell, y - (r + 0.5) * cell) > cell * 0.42)
      return undefined;
    return b.index.get(key([r, c]));
  };

  const owner = (i: number): 'r' | 'b' | null =>
    routes.r.includes(i) ? 'r' : b.twoBunnies && routes.b.includes(i) ? 'b' : null;

  const canTake = (which: 'r' | 'b', i: number): boolean => {
    if (!b.twoBunnies || b.dark[i]) return true;
    const col = b.colour[i];
    const want = which === 'r' ? 'r' : secTone;
    return !col || col === 'w' || col === want;
  };

  const floorOf = (which: 'r' | 'b'): number =>
    which === 'r' ? (b.redStart === undefined ? 0 : 1) : b.blueStart === undefined ? 0 : 1;

  const persist = getBoardPersistence(host);
  const emitState = (): void => {
    persist?.onChange({
      r: [...routes.r],
      b: [...routes.b],
      lastBunny,
      hintOwner: [...hintOwner.entries()],
      hintSteps: [...hintOwner.keys()].map((spot) => [spot, b.given.get(spot) ?? 0]),
    });
  };
  try {
    const init = persist?.initialState as
      | {
          r?: unknown;
          b?: unknown;
          lastBunny?: unknown;
          hintOwner?: unknown;
          hintSteps?: unknown;
        }
      | undefined;
    if (init && Array.isArray(init.r) && Array.isArray(init.b)) {
      const seen = new Set<number>();
      const validRoute = (which: 'r' | 'b', arr: unknown[]): number[] | null => {
        const startSpot = which === 'r' ? b.redStart : b.twoBunnies ? b.blueStart : undefined;
        if (startSpot !== undefined) {
          if (arr.length === 0 || arr[0] !== startSpot) return null;
        } else if (which === 'b' && !b.twoBunnies && arr.length > 0) {
          return null;
        }
        const out: number[] = [];
        for (let k = 0; k < arr.length; k++) {
          const s = arr[k];
          if (
            typeof s !== 'number' ||
            !Number.isInteger(s) ||
            s < 0 ||
            s >= b.spots.length ||
            seen.has(s) ||
            !canTake(which, s)
          ) {
            return null;
          }
          if (k > 0) {
            const prev = out[k - 1] as number;
            if (!(b.hops[prev] ?? []).includes(s)) return null;
          }
          seen.add(s);
          out.push(s);
        }
        return out;
      };
      const candR = validRoute('r', init.r);
      const candB = validRoute('b', init.b);
      if (candR && candB) {
        const comb = b.twoBunnies ? [...candR, ...candB] : candR;
        if (!solved(b, comb)) {
          routes.r = candR;
          routes.b = candB;
          if (init.lastBunny === 'r' || init.lastBunny === 'b') {
            lastBunny = init.lastBunny;
          }
          if (Array.isArray(init.hintSteps) && Array.isArray(init.hintOwner)) {
            const ownerMap = new Map<number, 'r' | 'b'>();
            for (const pair of init.hintOwner) {
              if (
                Array.isArray(pair) &&
                typeof pair[0] === 'number' &&
                (pair[1] === 'r' || pair[1] === 'b')
              ) {
                ownerMap.set(pair[0], pair[1]);
              }
            }
            for (const pair of init.hintSteps) {
              if (
                Array.isArray(pair) &&
                typeof pair[0] === 'number' &&
                typeof pair[1] === 'number' &&
                pair[0] >= 0 &&
                pair[0] < b.spots.length &&
                !b.given.has(pair[0]) &&
                !b.letterAt.has(pair[0]) &&
                ownerMap.has(pair[0])
              ) {
                b.given.set(pair[0], pair[1]);
                hintOwner.set(pair[0], ownerMap.get(pair[0]) as 'r' | 'b');
                if (b.dark[pair[0]]) b.dark[pair[0]] = false;
              }
            }
          }
        }
      }
    }
  } catch {
    // Abandon invalid or stale board state.
  }

  let moved = false;
  let wasBunny = false;

  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const i = spotAt(e, false);
    if (i === undefined) return;
    const mine = owner(i);
    moved = false;
    wasBunny = false;

    if (mine) {
      active = mine;
      lastBunny = mine;
      const route = routes[mine];
      wasBunny = i === route[route.length - 1];
      route.length = Math.max(floorOf(mine), route.indexOf(i) + 1);
    } else {
      const candidates: ('r' | 'b')[] = b.twoBunnies
        ? lastBunny === 'b'
          ? ['b', 'r']
          : ['r', 'b']
        : ['r'];
      const adjacentBunnies = candidates.filter((t) => {
        const route = routes[t];
        const last = route[route.length - 1];
        return last === undefined || (b.hops[last] ?? []).includes(i);
      });
      if (!adjacentBunnies.length) {
        blip(150, 80, 25);
        return;
      }
      const neighborBunny = adjacentBunnies.find((t) => canTake(t, i));
      if (!neighborBunny) {
        const blocked = adjacentBunnies[0] as 'r' | 'b';
        const last = routes[blocked][routes[blocked].length - 1];
        flashSpots(last !== undefined ? [last, i] : [i]);
        return;
      }
      active = neighborBunny;
      lastBunny = neighborBunny;
      routes[neighborBunny].push(i);
      lastHoppedSpot = i;
      blip(500 + routes[neighborBunny].length * 12, 30, 6);
    }
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic pointer: no capture needed
    }
    drawNote();
    render();
  });

  svg.addEventListener('pointermove', (e) => {
    if (!active) return;
    const j = spotAt(e, true);
    const route = routes[active];
    const last = route[route.length - 1];
    if (j === undefined || j === last) return;
    const floor = floorOf(active);
    if (route.length > floor && route[route.length - 2] === j) {
      route.pop();
    } else if (last !== undefined && (b.hops[last] ?? []).includes(j) && owner(j) === null) {
      if (!canTake(active, j)) {
        flashSpots([last, j]);
        return;
      }
      route.push(j);
      lastHoppedSpot = j;
    } else {
      return;
    }
    moved = true;
    blip(500 + route.length * 12, 25, 4);
    drawNote();
    render();
  });

  const release = (): void => {
    if (!active) return;
    const cur = active;
    active = null;
    const route = routes[cur];
    const floor = floorOf(cur);
    if (wasBunny && !moved && route.length > floor) {
      route.pop();
      blip(300, 40, 8);
    }
    settle();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  const launchHopsCelebration = (): void => {
    if (typeof requestAnimationFrame !== 'function') return;
    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('style', 'pointer-events: none');
    svg.append(layer);

    interface Bloom {
      x: number;
      y: number;
      delay: number;
      dur: number;
      el: SVGTextElement;
    }
    interface Runner {
      pts: [number, number][];
      dur: number;
      halo: SVGCircleElement;
      core: SVGCircleElement;
    }
    const blooms: Bloom[] = [];
    const runners: Runner[] = [];
    const FLOWER_GLYPHS = ['✿', '❀', '✦'];
    const FLOWER_COLOURS = ['#f48fb1', '#ffd54f', '#ce93d8', '#81c784'];

    for (const [, path] of [
      ['r', routes.r],
      ['b', routes.b],
    ] as const) {
      if (path.length < 2) continue;
      const pts: [number, number][] = path.map((idx) => {
        const [r, c] = b.spots[idx] as Spot;
        return [c * cell + cell / 2, r * cell + cell / 2];
      });
      const halo = document.createElementNS(NS, 'circle');
      halo.setAttribute('r', String(cell * 0.16));
      halo.setAttribute('fill', 'rgba(255, 213, 79, 0.5)');
      halo.setAttribute('opacity', '0');
      const core = document.createElementNS(NS, 'circle');
      core.setAttribute('r', String(cell * 0.08));
      core.setAttribute('fill', '#fffdf0');
      core.setAttribute('opacity', '0');
      layer.append(halo, core);
      runners.push({ pts, dur: Math.min(820, Math.max(420, path.length * 28)), halo, core });

      path.forEach((spotIdx, stepIdx) => {
        if (stepIdx % 2 !== 0 && stepIdx !== path.length - 1) return;
        const [r, c] = b.spots[spotIdx] as Spot;
        const fx = c * cell + (stepIdx % 4 === 0 ? cell * 0.22 : cell * 0.78);
        const fy = r * cell + cell * 0.28;
        const el = document.createElementNS(NS, 'text');
        el.textContent = FLOWER_GLYPHS[stepIdx % FLOWER_GLYPHS.length] ?? '✿';
        el.setAttribute('x', String(fx));
        el.setAttribute('y', String(fy));
        el.setAttribute('text-anchor', 'middle');
        el.setAttribute('font-size', String(cell * 0.26));
        el.setAttribute('fill', FLOWER_COLOURS[stepIdx % FLOWER_COLOURS.length] ?? '#f48fb1');
        el.setAttribute('opacity', '0');
        layer.append(el);
        blooms.push({
          x: fx,
          y: fy,
          delay: stepIdx * 26,
          dur: 640,
          el,
        });
      });
    }

    const t0 = performance.now();
    const tick = (now: number): void => {
      if (!svg.isConnected) return;
      if (!layer.isConnected) svg.append(layer);
      const elapsed = now - t0;
      let active = false;

      for (const rn of runners) {
        if (elapsed > rn.dur) {
          rn.halo.setAttribute('opacity', '0');
          rn.core.setAttribute('opacity', '0');
          continue;
        }
        active = true;
        const p = elapsed / rn.dur;
        const totalSegs = rn.pts.length - 1;
        const exact = p * totalSegs;
        const seg = Math.min(totalSegs - 1, Math.floor(exact));
        const frac = exact - seg;
        const p1 = rn.pts[seg] ?? [0, 0];
        const p2 = rn.pts[seg + 1] ?? p1;
        const x = p1[0] + (p2[0] - p1[0]) * frac;
        const y = p1[1] + (p2[1] - p1[1]) * frac;
        const alpha = Math.sin(p * Math.PI);
        rn.halo.setAttribute('cx', String(x));
        rn.halo.setAttribute('cy', String(y));
        rn.halo.setAttribute('opacity', String(alpha * 0.9));
        rn.core.setAttribute('cx', String(x));
        rn.core.setAttribute('cy', String(y));
        rn.core.setAttribute('opacity', String(alpha));
      }

      for (const bl of blooms) {
        const dt = elapsed - bl.delay;
        if (dt < 0) {
          active = true;
          continue;
        }
        if (dt > bl.dur) {
          bl.el.setAttribute('opacity', '0');
          continue;
        }
        active = true;
        const p = dt / bl.dur;
        const alpha = p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75;
        bl.el.setAttribute('y', String(bl.y - p * cell * 0.18));
        bl.el.setAttribute('opacity', String(alpha * 0.95));
      }

      if (active && elapsed < 1250) {
        requestAnimationFrame(tick);
      } else {
        layer.remove();
      }
    };
    requestAnimationFrame(tick);
  };

  const settle = (): void => {
    const full = combinedRoute();
    if (solved(b, full)) {
      done = true;
      [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
      navigator.vibrate?.([20, 40, 20]);
      drawNote();
      render();
      launchHopsCelebration();
      hooks.solved();
    } else {
      emitState();
      drawNote();
      render();
    }
  };

  const render = (): void => {
    svg.replaceChildren();
    const add = (
      tag: string,
      attrs: Record<string, string | number>,
      text?: string,
    ): SVGElement => {
      const el = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
      if (text !== undefined) el.textContent = text;
      svg.append(el);
      return el;
    };
    const centre = ([r, c]: Spot): [number, number] => [c * cell + cell / 2, r * cell + cell / 2];
    const full = combinedRoute();
    const visitedSet = new Set(full);

    const lastR = routes.r[routes.r.length - 1];
    const lastB = b.twoBunnies ? routes.b[routes.b.length - 1] : undefined;
    const reach = new Set<number>();
    if (!done) {
      if (lastR !== undefined) {
        for (const j of b.hops[lastR] ?? []) if (owner(j) === null && canTake('r', j)) reach.add(j);
      }
      if (lastB !== undefined) {
        for (const j of b.hops[lastB] ?? []) if (owner(j) === null && canTake('b', j)) reach.add(j);
      }
    }

    const stepNumber = new Map<number, number>();
    routes.r.forEach((i, idx) => stepNumber.set(i, idx + 1));
    if (b.twoBunnies) routes.b.forEach((i, idx) => stepNumber.set(i, idx + 1));

    // Rocks (base game): grey stones where the bunny can't hop
    for (const [r, c] of panel.rocks ?? []) {
      add('rect', {
        x: c * cell + 2,
        y: r * cell + 2,
        width: cell - 4,
        height: cell - 4,
        rx: 8,
        fill: '#c9c2b8',
      });
      add('ellipse', {
        cx: c * cell + cell / 2,
        cy: r * cell + cell * 0.56,
        rx: cell * 0.32,
        ry: cell * 0.24,
        fill: '#8d8579',
        stroke: '#6d665c',
        'stroke-width': 1.5,
      });
      add('ellipse', {
        cx: c * cell + cell * 0.42,
        cy: r * cell + cell * 0.48,
        rx: cell * 0.1,
        ry: cell * 0.06,
        fill: '#b3aca1',
      });
    }

    // Lawn / coloured / shadowed squares
    b.spots.forEach(([r, c], i) => {
      const inDark = b.dark[i];
      const col = b.colour[i];
      const flash = flashing.has(i);
      const fill = flash
        ? '#ff8a80'
        : inDark && !done
          ? '#4b4859'
          : inDark && done && !visitedSet.has(i)
            ? '#d7ccc8'
            : col
              ? (TINT[col] ?? '#e3f2d9')
              : '#e3f2d9';
      const stroke = flash ? '#d32f2f' : inDark && !done ? '#7e7894' : col ? '#d8d0c5' : 'none';
      const lawnRect = add('rect', {
        x: c * cell + 2,
        y: r * cell + 2,
        width: cell - 4,
        height: cell - 4,
        rx: 8,
        fill,
        stroke: done && visitedSet.has(i) ? '#8bc34a' : stroke,
        'stroke-width': flash ? 3 : done && visitedSet.has(i) ? 2 : 1.5,
      });
      if (done && visitedSet.has(i)) {
        const delay = ((stepNumber.get(i) ?? 1) - 1) * 26;
        lawnRect.setAttribute(
          'style',
          `transform-box: fill-box; transform-origin: center; animation: puzz-hop-ripple 0.45s cubic-bezier(0.22, 1.35, 0.36, 1) ${delay}ms both;`,
        );
      } else if (!done && flash) {
        lawnRect.setAttribute(
          'style',
          'transform-box: fill-box; transform-origin: center; animation: puzz-error-shake 0.26s ease-in-out both;',
        );
      } else if (!done && lastHoppedSpot === i) {
        lawnRect.setAttribute(
          'style',
          'transform-box: fill-box; transform-origin: center; animation: puzz-tap-pop 0.16s cubic-bezier(0.22, 1.5, 0.36, 1) both;',
        );
      }
      if (inDark && !done && !visitedSet.has(i)) {
        add(
          'text',
          {
            x: c * cell + cell / 2,
            y: r * cell + cell * 0.62,
            'text-anchor': 'middle',
            'font-size': cell * 0.36,
            'font-weight': 700,
            fill: '#b0aac0',
          },
          '?',
        );
      } else if (inDark && done && !visitedSet.has(i)) {
        add(
          'text',
          {
            x: c * cell + cell / 2,
            y: r * cell + cell * 0.64,
            'text-anchor': 'middle',
            'font-size': cell * 0.4,
          },
          '🪨',
        );
      }
    });

    // Portion edges (Courses)
    b.spots.forEach(([r, c], i) => {
      const mine = b.portion[i];
      if (mine === undefined) return;
      for (const [r2, c2, x1, y1, x2, y2] of [
        [r, c + 1, (c + 1) * cell, r * cell, (c + 1) * cell, (r + 1) * cell],
        [r + 1, c, c * cell, (r + 1) * cell, (c + 1) * cell, (r + 1) * cell],
      ] as const) {
        const j = b.index.get(key([r2, c2]));
        if (j !== undefined && b.portion[j] !== mine)
          add('line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#b07a2a',
            'stroke-width': 5,
            'stroke-linecap': 'round',
          });
      }
    });

    // Snowflakes: frosty frame, mirror line with ❄, and ghost mirror trail strokes
    if (b.frame) {
      const f = b.frame;
      const [fx, fy] = [f.left * cell + 3, f.top * cell + 3];
      const [fw, fh] = [(f.right - f.left + 1) * cell - 6, (f.bottom - f.top + 1) * cell - 6];
      add('rect', {
        x: fx,
        y: fy,
        width: fw,
        height: fh,
        rx: 10,
        fill: 'rgba(154, 215, 255, 0.08)',
        stroke: '#5aa9e6',
        'stroke-width': 2.5,
        'stroke-dasharray': '7 5',
      });
      const vertical = f.axis === 'v';
      const mid = vertical
        ? ((f.left + f.right + 1) * cell) / 2
        : ((f.top + f.bottom + 1) * cell) / 2;
      const [x1, y1, x2, y2] = vertical ? [mid, fy, mid, fy + fh] : [fx, mid, fx + fw, mid];
      add('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: '#5aa9e6',
        'stroke-width': 2,
        'stroke-dasharray': '3 4',
      });
      for (const [x, y] of [
        [x1, y1],
        [x2, y2],
      ]) {
        add(
          'text',
          {
            x: x ?? 0,
            y: (y ?? 0) + cell * 0.1,
            'text-anchor': 'middle',
            'font-size': cell * 0.28,
          },
          '❄',
        );
      }
      const drawn = trailSegments(b, full);
      for (const seg of drawn) {
        if (!inside(f, seg)) continue;
        const m = mirrorKey(f, seg);
        if (drawn.has(m)) continue;
        const [r1 = 0, c1 = 0, r2 = 0, c2 = 0] = m.slice(1).split(',').map(Number);
        add('line', {
          x1: c1 * cell + cell / 2,
          y1: r1 * cell + cell / 2,
          x2: c2 * cell + cell / 2,
          y2: r2 * cell + cell / 2,
          stroke: '#5aa9e6',
          'stroke-width': cell * 0.16,
          'stroke-dasharray': '4 5',
          'stroke-linecap': 'round',
          opacity: 0.75,
        });
      }
    }

    // Bunny trail(s)
    for (const [which, path] of [
      ['r', routes.r],
      ['b', routes.b],
    ] as const) {
      const trailCol = done
        ? '#e0b030'
        : b.twoBunnies
          ? TRAIL[which === 'r' ? 'r' : secTone]
          : '#9ccc65';
      path.forEach((i, n) => {
        if (!n) return;
        const prev = path[n - 1] as number;
        const [x1, y1] = centre(b.spots[prev] as Spot);
        const [x2, y2] = centre(b.spots[i] as Spot);
        const underground = b.burrow.has(`${prev},${i}`);
        add('line', {
          x1,
          y1,
          x2,
          y2,
          stroke: trailCol,
          'stroke-width': cell * 0.28,
          'stroke-linecap': 'round',
          'stroke-dasharray': underground ? '3 5' : '',
          opacity: 0.85,
        });
      });
    }

    // Burrow holes
    (panel.burrows ?? []).forEach((pair, k) =>
      pair.forEach(([r, c]) =>
        add('circle', {
          cx: c * cell + cell * 0.22,
          cy: r * cell + cell * 0.78,
          r: cell * 0.13,
          fill: BURROW[k % BURROW.length] as string,
          stroke: '#fff',
          'stroke-width': 1.5,
        }),
      ),
    );

    // Eggs, letters, step numbers, and bunnies
    b.spots.forEach((s, i) => {
      const [x, y] = centre(s);
      const n = stepNumber.get(i);
      const g = b.given.get(i);
      const letter = b.letterAt.get(i);
      const isBunny = i === lastR || (b.twoBunnies && i === lastB);

      if (reach.has(i)) {
        add('circle', {
          cx: x,
          cy: y,
          r: cell * 0.36,
          fill: 'none',
          stroke: '#43a047',
          'stroke-width': 2.5,
          'stroke-dasharray': '4 3',
        });
      }

      if (g !== undefined || letter !== undefined) {
        const gold = panel.golden && key(panel.golden) === key(s);
        const eggTone: 'r' | 'b' =
          hintOwner.get(i) ?? (b.twoBunnies && b.colour[i] === secTone ? 'b' : 'r');
        const myRoute = routes[eggTone];
        const byMe = !b.twoBunnies || owner(i) === eggTone;
        const late = g !== undefined && n === undefined && myRoute.length >= g;
        const wrong =
          (g !== undefined && n !== undefined && (!byMe || n !== g)) ||
          (letter !== undefined && n !== undefined && (owner(i) !== 'r' || !blankSteps.has(n)));
        const right =
          (g !== undefined && byMe && n === g) ||
          (letter !== undefined && n !== undefined && owner(i) === 'r' && blankSteps.has(n));
        const strokeCol = b.twoBunnies
          ? eggTone === 'b'
            ? TRAIL[secTone]
            : '#d9534f'
          : gold
            ? '#c9a227'
            : '#b89a6a';

        const eggEl = add('ellipse', {
          cx: x,
          cy: y,
          rx: cell * 0.27,
          ry: cell * 0.33,
          fill:
            done || gold ? '#ffd54f' : wrong || late ? '#ff8a80' : right ? '#a5d6a7' : '#fffaf0',
          stroke: strokeCol,
          'stroke-width': 2.2,
        });
        const eggText = add(
          'text',
          {
            x,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.3,
            'font-weight': 700,
            fill: letter ? '#c2185b' : '#4a3a20',
          },
          letter ?? String(g),
        );
        if (done) {
          const delay = ((stepNumber.get(i) ?? 1) - 1) * 26;
          const anim = `transform-box: fill-box; transform-origin: center; animation: puzz-icon-bounce 0.5s ease-out ${delay}ms both;`;
          eggEl.setAttribute('style', anim);
          eggText.setAttribute('style', anim);
        } else if (lastHoppedSpot === i && (right || wrong)) {
          const anim = right
            ? 'transform-box: fill-box; transform-origin: center; animation: puzz-clue-met 0.3s cubic-bezier(0.22, 1.45, 0.36, 1) both;'
            : 'transform-box: fill-box; transform-origin: center; animation: puzz-error-shake 0.26s ease-in-out both;';
          eggEl.setAttribute('style', anim);
          eggText.setAttribute('style', anim);
        }
      } else if (n !== undefined) {
        add(
          'text',
          {
            x,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.3,
            'font-weight': 700,
            fill: done ? '#a07800' : b.dark[i] ? '#ffffff' : '#33691e',
          },
          String(n),
        );
      }

      if (isBunny) {
        const bunnyEl = add(
          'text',
          {
            x: x + cell * 0.26,
            y: y - cell * 0.14,
            'text-anchor': 'middle',
            'font-size': cell * 0.32,
          },
          '🐇',
        );
        if (done) {
          bunnyEl.setAttribute(
            'style',
            'transform-box: fill-box; transform-origin: center; animation: puzz-icon-bounce 0.48s ease-out 0.12s 2;',
          );
        }
      }
    });

    // Legacy parade flags
    if (flagged) {
      const firsts = firstVisits(b, full);
      const flag = (f: number | null, first: number, x: number, y: number): void => {
        if (f === null) return;
        const colour =
          first === f
            ? '#2f8a45'
            : (first && first !== f) || (!first && full.length >= f)
              ? '#d9534f'
              : '#6b5f52';
        add('rect', {
          x: x - cell * 0.3,
          y: y - cell * 0.22,
          width: cell * 0.6,
          height: cell * 0.44,
          rx: 3,
          fill: '#fff',
          stroke: colour,
          'stroke-width': 2,
        });
        add('rect', {
          x: x - cell * 0.3 + 1,
          y: y - cell * 0.22 + 1,
          width: cell * 0.18,
          height: cell * 0.16,
          fill: '#3c5aa6',
        });
        add(
          'text',
          {
            x: x + cell * 0.05,
            y: y + cell * 0.12,
            'text-anchor': 'middle',
            'font-size': cell * 0.28,
            'font-weight': 700,
            fill: colour,
          },
          String(f),
        );
      };
      b.rowFlags.forEach((f, r) =>
        flag(f, firsts.rows[r] ?? 0, Wd * cell + pad / 2, r * cell + cell / 2),
      );
      b.colFlags.forEach((f, c) =>
        flag(f, firsts.cols[c] ?? 0, c * cell + cell / 2, H * cell + pad / 2),
      );
    }

    const left = b.length - full.length;
    hooks.status(
      done
        ? b.twoBunnies
          ? 'Both bunnies home!'
          : 'Home!'
        : left > 0
          ? `${left} hop${left === 1 ? '' : 's'} left`
          : "Check your route: a clue or rule isn't met yet",
    );
    lastHoppedSpot = null;
  };

  const giveHint = (): void => {
    if (done) return;
    cachedSol ??= solve(b, 1)[0] ?? null;
    if (!cachedSol) return;
    const [solR, solB] = splitRoutes(b, cachedSol);
    const canStamp = (spot: number | undefined): spot is number =>
      spot !== undefined && !b.given.has(spot) && !b.letterAt.has(spot);

    const stampEgg = (spot: number, stepNum: number, bunny: 'r' | 'b'): void => {
      b.given.set(spot, stepNum);
      hintOwner.set(spot, bunny);
      if (b.dark[spot]) b.dark[spot] = false;
      emitState();
      blip(660, 70, 10);
      flashSpots([spot]);
    };

    // 1. Check if either bunny's current route has diverged from the solution
    const bunnies: [number[], number[], 'r' | 'b'][] = b.twoBunnies
      ? [
          [routes.r, solR, 'r'],
          [routes.b, solB, 'b'],
        ]
      : [[routes.r, solR, 'r']];

    for (const [userRoute, solRoute, bunny] of bunnies) {
      const divIdx = userRoute.findIndex((s, idx) => s !== solRoute[idx]);
      if (divIdx !== -1) {
        // Prefer stamping the true spot at the first divergence step
        const trueSpot = solRoute[divIdx];
        if (canStamp(trueSpot)) {
          stampEgg(trueSpot, divIdx + 1, bunny);
          return;
        }
        // Otherwise check if the wrong square the player stepped on can be stamped with its true step
        const wrongSpot = userRoute[divIdx];
        if (canStamp(wrongSpot)) {
          const inR = solR.indexOf(wrongSpot);
          if (inR !== -1) {
            stampEgg(wrongSpot, inR + 1, 'r');
            return;
          }
          const inB = solB.indexOf(wrongSpot);
          if (inB !== -1) {
            stampEgg(wrongSpot, inB + 1, 'b');
            return;
          }
        }
        // Otherwise stamp the next available un-egged spot along the solution from divIdx
        for (let k = divIdx; k < solRoute.length; k++) {
          const cand = solRoute[k];
          if (canStamp(cand)) {
            stampEgg(cand, k + 1, bunny);
            return;
          }
        }
      }
    }

    // 2. Path is on track so far: stamp an un-egged spot a couple steps ahead of the bunny's tip
    const orderedBunnies = b.twoBunnies && lastBunny === 'b' ? [...bunnies].reverse() : bunnies;
    for (const [userRoute, solRoute, bunny] of orderedBunnies) {
      if (!userRoute || !solRoute) continue;
      const aheadIdx = Math.min(solRoute.length - 1, userRoute.length + 1);
      for (let k = aheadIdx; k < solRoute.length; k++) {
        const cand = solRoute[k];
        if (canStamp(cand)) {
          stampEgg(cand, k + 1, bunny);
          return;
        }
      }
      for (let k = userRoute.length; k < aheadIdx; k++) {
        const cand = solRoute[k];
        if (canStamp(cand)) {
          stampEgg(cand, k + 1, bunny);
          return;
        }
      }
    }
  };
  host.addEventListener('puzz:hint', giveHint);

  drawNote();
  render();
  return () => ({
    done,
    redTrail: routes.r.map((idx) => b.spots[idx]),
    ...(b.twoBunnies ? { secondTrail: routes.b.map((idx) => b.spots[idx]) } : {}),
  });
}
