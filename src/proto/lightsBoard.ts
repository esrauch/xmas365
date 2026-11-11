/**
 * The clicky lights panel: tap a piece to turn it a quarter clockwise
 * (always clockwise; four taps go all the way round). Power spreads from the plug as
 * you turn: every piece it reaches lights up, and a lit wire end that meets
 * nothing sparks red. Supports all six holiday twists:
 * - snowflakes (frosty frame, mirror line with ❄, and ghost mirror wires);
 * - the dark (squares marked ? turn blind until solved);
 * - letters (letter bulbs and message blank tiles above the board);
 * - numbered eggs (glow green when reached in their exact step count);
 * - red, white and blue (two strings from two plugs, white pieces take either);
 * - slices (no wires across slice walls; the dotted edge is where each slice meets the middle).
 */
import { inFrame, mirrorSquare } from '../gen/core/mirror';
import { blip, getBoardPersistence, h } from './kit';
import {
  DIRS,
  E,
  N,
  type Panel,
  STEP,
  type Spot,
  W as WEST,
  joinsAlong,
  key,
  light,
  mirrorMask,
  parse,
  servings,
  solved,
  spell,
  startGrid,
  turn,
} from './lights';

const NS = 'http://www.w3.org/2000/svg';
const WIRE: Record<string, string> = {
  r: '#ff6b6b',
  g: '#5fd27a',
  b: '#4dabf7',
  w: '#ffe08a',
};
const DIM: Record<string, string> = {
  r: '#6e3a44',
  g: '#2f5a43',
  b: '#2a4365',
  w: '#55607a',
};

export interface LightsHooks {
  solved(): void;
  status(text: string): void;
}

/** A panel with a tree-top star to light when it's solved (decoration). */
export type LightsPanel = Panel & { star?: Spot };

export function mountLights(
  host: HTMLElement,
  panel: LightsPanel,
  hooks: LightsHooks,
): () => unknown {
  const b = parse(panel);
  const grid = startGrid(panel);
  const avail = Math.min(host.clientWidth || 360, 560);
  const flagged = [...b.rowFlags, ...b.colFlags].some((f) => f !== null);
  const cell = Math.max(
    30,
    Math.min(64, Math.floor((avail - 8) / (b.width + (flagged ? 0.8 : 0)))),
  );
  const pad = flagged ? cell * 0.8 : 0;
  const darkSet = b.dark;
  let done = false;
  let lastTurnedKey: string | null = null;
  let shakeTileKey: string | null = null;
  const lockedTiles = new Set<string>();
  const revealed = (): Set<string> => (done ? new Set([...darkSet, ...lockedTiles]) : lockedTiles);
  const persist = getBoardPersistence(host);
  try {
    const init = persist?.initialState as { grid?: unknown; locked?: unknown } | undefined;
    if (init && Array.isArray(init.grid) && init.grid.length === b.height) {
      let valid = true;
      const cand: number[][] = [];
      for (let r = 0; r < b.height && valid; r++) {
        const row = init.grid[r];
        if (!Array.isArray(row) || row.length !== b.width) {
          valid = false;
          break;
        }
        const candRow: number[] = [];
        for (let c = 0; c < b.width; c++) {
          const val = row[c];
          const base = grid[r]?.[c] ?? -1;
          if (typeof val !== 'number' || !Number.isInteger(val)) {
            valid = false;
            break;
          }
          if (base < 0) {
            if (val >= 0) {
              valid = false;
              break;
            }
            candRow.push(-1);
          } else {
            const rot0 = base;
            const rot1 = turn(rot0);
            const rot2 = turn(rot1);
            const rot3 = turn(rot2);
            if (val !== rot0 && val !== rot1 && val !== rot2 && val !== rot3) {
              valid = false;
              break;
            }
            candRow.push(val);
          }
        }
        cand.push(candRow);
      }
      if (valid && !solved(b, cand)) {
        for (let r = 0; r < b.height; r++) {
          for (let c = 0; c < b.width; c++) {
            (grid[r] as number[])[c] = cand[r]?.[c] ?? -1;
          }
        }
        if (Array.isArray(init.locked)) {
          for (const k of init.locked) {
            if (typeof k === 'string') {
              const [r, c] = k.split(',').map(Number);
              if (
                r !== undefined &&
                c !== undefined &&
                b.inside(r, c) &&
                (grid[r]?.[c] ?? -1) === (b.solution[r]?.[c] ?? -2)
              ) {
                lockedTiles.add(k);
                if (b.frame && inFrame(b.frame, r, c)) {
                  const [mr, mc] = mirrorSquare(b.frame, r, c);
                  if (b.inside(mr, mc) && (grid[mr]?.[mc] ?? -1) === (b.solution[mr]?.[mc] ?? -2)) {
                    lockedTiles.add(key(mr, mc));
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch {
    // Abandon invalid or stale board state.
  }
  const W = b.width * cell + pad;
  const H = b.height * cell + pad;

  // Message blank tiles for Valentine's letters twist
  const note = b.blanks.length ? h('div', { style: { margin: '0 0 8px' } }) : null;
  const blankSet = new Set(b.blanks);
  const drawNote = (): void => {
    if (!note) return;
    const word = done && b.word ? b.word : spell(b, grid);
    const row = h(
      'div',
      { style: { display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' } },
      h('span', { style: { fontSize: '20px', marginRight: '2px' } }, '💡'),
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
              border: `2px ${done ? 'solid #c9a227' : 'dashed #d4af37'}`,
              fontWeight: '700',
              fontSize: done ? '20px' : filled ? '16px' : '14px',
              background: done ? '#ffd54f' : filled ? '#fff8e1' : '#fff',
              color: done ? '#3a2f25' : filled ? '#8d6e00' : '#8a7a86',
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
  svg.setAttribute('height', String(H));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);

  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    e.preventDefault();
    const box = svg.getBoundingClientRect();
    const r = Math.floor(((e.clientY - box.top) * H) / box.height / cell);
    const c = Math.floor(((e.clientX - box.left) * W) / box.width / cell);
    if (!b.inside(r, c)) return;
    if (lockedTiles.has(key(r, c))) {
      shakeTileKey = key(r, c);
      blip(180, 40, 6);
      render();
      return;
    }
    const row = grid[r] as number[];
    const next = turn(row[c] ?? 0);
    row[c] = next;
    lastTurnedKey = key(r, c);
    if (b.frame && inFrame(b.frame, r, c)) {
      const [mr, mc] = mirrorSquare(b.frame, r, c);
      if (b.inside(mr, mc) && (mr !== r || mc !== c) && !lockedTiles.has(key(mr, mc))) {
        (grid[mr] as number[])[mc] = mirrorMask(next, b.frame.axis);
      }
    }
    blip(520, 30, 6);
    settle();
  });

  const launchLightsCelebration = (): void => {
    if (typeof requestAnimationFrame !== 'function') return;
    const { dist, string } = light(b, grid);
    const secPlug = b.bluePlug ?? b.greenPlug;
    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('style', 'pointer-events: none');
    svg.append(layer);

    interface BulbBurst {
      cx: number;
      cy: number;
      col: string;
      delay: number;
      dur: number;
      ring: SVGCircleElement;
      rays: SVGLineElement[];
    }
    const bursts: BulbBurst[] = [];

    grid.forEach((row, r) =>
      row.forEach((m, c) => {
        if (m < 0) return;
        let arms = 0;
        for (const d of DIRS) if (m & d) arms++;
        const isStar = panel.star !== undefined && panel.star[0] === r && panel.star[1] === c;
        if (arms !== 1 && !isStar) return;
        const dStep = dist.get(key(r, c)) ?? 0;
        const own = b.colour(r, c);
        const white = secPlug !== undefined && !own;
        const reached = string.get(key(r, c));
        const tone = own ?? (white && reached ? reached : 'w');
        const col = isStar ? '#ffd54f' : (WIRE[tone] ?? '#ffe08a');
        const cx = c * cell + cell / 2;
        const cy = r * cell + (isStar ? cell * 0.24 : cell / 2);
        const delay = dStep * 45 + 60;

        const ring = document.createElementNS(NS, 'circle');
        ring.setAttribute('cx', String(cx));
        ring.setAttribute('cy', String(cy));
        ring.setAttribute('r', '2');
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', col);
        ring.setAttribute('stroke-width', isStar ? '2.5' : '1.8');
        ring.setAttribute('opacity', '0');
        layer.append(ring);

        const rayCount = isStar ? 8 : 4;
        const rays: SVGLineElement[] = [];
        for (let k = 0; k < rayCount; k++) {
          const ray = document.createElementNS(NS, 'line');
          ray.setAttribute('stroke', k % 2 === 0 ? '#fffdf0' : col);
          ray.setAttribute('stroke-width', isStar ? '2.4' : '1.8');
          ray.setAttribute('stroke-linecap', 'round');
          ray.setAttribute('opacity', '0');
          layer.append(ray);
          rays.push(ray);
        }
        bursts.push({ cx, cy, col, delay, dur: isStar ? 650 : 480, ring, rays });
      }),
    );

    const t0 = performance.now();
    const tick = (now: number): void => {
      if (!svg.isConnected) return;
      if (!layer.isConnected) svg.append(layer);
      const elapsed = now - t0;
      let active = false;
      for (const bItem of bursts) {
        const dt = elapsed - bItem.delay;
        if (dt < 0) {
          active = true;
          continue;
        }
        if (dt > bItem.dur) {
          bItem.ring.setAttribute('opacity', '0');
          bItem.rays.forEach((ray) => ray.setAttribute('opacity', '0'));
          continue;
        }
        active = true;
        const p = dt / bItem.dur;
        const ease = 1 - (1 - p) * (1 - p);
        const alpha = 1 - p;
        bItem.ring.setAttribute('r', String(cell * (0.16 + ease * 0.44)));
        bItem.ring.setAttribute('opacity', String(alpha * 0.8));
        bItem.rays.forEach((ray, k) => {
          const angle = (k / bItem.rays.length) * Math.PI * 2 + Math.PI / 4;
          const r1 = cell * (0.14 + ease * 0.18);
          const r2 = cell * (0.26 + ease * 0.36);
          ray.setAttribute('x1', String(bItem.cx + Math.cos(angle) * r1));
          ray.setAttribute('y1', String(bItem.cy + Math.sin(angle) * r1));
          ray.setAttribute('x2', String(bItem.cx + Math.cos(angle) * r2));
          ray.setAttribute('y2', String(bItem.cy + Math.sin(angle) * r2));
          ray.setAttribute('opacity', String(alpha));
        });
      }
      if (active && elapsed < 1200) {
        requestAnimationFrame(tick);
      } else {
        layer.remove();
      }
    };
    requestAnimationFrame(tick);
  };

  const settle = (): void => {
    if (solved(b, grid)) {
      done = true;
      [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => blip(f, 150), i * 110));
      navigator.vibrate?.([20, 40, 20]);
      drawNote();
      render();
      launchLightsCelebration();
      hooks.solved();
    } else {
      persist?.onChange({
        grid: grid.map((row) => [...row]),
        locked: [...lockedTiles],
      });
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
    const { dist, string, loose, loop } = light(b, grid);
    const shownNow = revealed();
    const sparks = new Set(loose.map(([r, c, d]) => `${key(r, c)}:${d}`));
    const { walls } = b.servings ? servings(b, grid) : { walls: [] };
    const crossing = new Set(walls.map(([r, c, d]) => `${key(r, c)}:${d}`));
    for (const [r, c, d] of walls) {
      const [dr, dc] = STEP[d] as Spot;
      crossing.add(`${key(r + dr, c + dc)}:${d === E ? WEST : N}`);
    }
    const secPlug = b.bluePlug ?? b.greenPlug;
    const secTone = b.bluePlug ? 'b' : 'g';
    const plugTone = (r: number, c: number): string | undefined =>
      r === b.plug[0] && c === b.plug[1]
        ? WIRE[secPlug ? 'r' : 'w']
        : secPlug && r === secPlug[0] && c === secPlug[1]
          ? WIRE[secTone]
          : undefined;
    // Squares.
    for (let r = 0; r < b.height; r++)
      for (let c = 0; c < b.width; c++) {
        if (!b.inside(r, c)) continue;
        const s = b.slice(r, c);
        const frosty = b.frame !== undefined && inFrame(b.frame, r, c);
        const shade =
          s === '*'
            ? '#5a4a3a'
            : s
              ? s.charCodeAt(0) % 2
                ? '#3a2a22'
                : '#2e2420'
              : frosty
                ? '#1c2e42'
                : '#1f2636';
        const isLocked = lockedTiles.has(key(r, c));
        const tileEl = add('rect', {
          x: c * cell + 1,
          y: r * cell + 1,
          width: cell - 2,
          height: cell - 2,
          rx: 6,
          fill: shade,
          stroke: plugTone(r, c) ?? (isLocked ? '#68d391' : 'none'),
          'stroke-width': plugTone(r, c) ? 3 : isLocked ? 2.2 : 1.5,
        });
        if (!done && shakeTileKey === key(r, c)) {
          tileEl.setAttribute(
            'style',
            'transform-box: fill-box; transform-origin: center; animation: puzz-error-shake 0.25s ease-in-out both;',
          );
        } else if (!done && lastTurnedKey === key(r, c)) {
          tileEl.setAttribute(
            'style',
            'transform-box: fill-box; transform-origin: center; animation: puzz-tap-pop 0.16s cubic-bezier(0.22, 1.5, 0.36, 1) both;',
          );
        }
      }
    lastTurnedKey = null;
    shakeTileKey = null;
    // Slice walls (solid gold), and the middle's edge (dashed: a slice's serving comes in across it).
    if (b.servings)
      for (let r = 0; r < b.height; r++)
        for (let c = 0; c < b.width; c++) {
          const s = b.slice(r, c);
          if (s === undefined) continue;
          for (const [r2, c2, x1, y1, x2, y2] of [
            [r, c + 1, (c + 1) * cell, r * cell, (c + 1) * cell, (r + 1) * cell],
            [r + 1, c, c * cell, (r + 1) * cell, (c + 1) * cell, (r + 1) * cell],
          ] as const) {
            const t = b.slice(r2, c2);
            if (t === undefined || t === s) continue;
            const middle = s === '*' || t === '*';
            add('line', {
              x1,
              y1,
              x2,
              y2,
              stroke: middle ? '#f0d9a8' : '#e0a040',
              'stroke-width': middle ? 2 : 7,
              'stroke-dasharray': middle ? '2 5' : '',
              'stroke-linecap': 'round',
            });
          }
        }
    // Wires and bulbs.
    grid.forEach((row, r) =>
      row.forEach((m, c) => {
        if (m < 0) return;
        if (darkSet.has(key(r, c)) && !shownNow.has(key(r, c))) {
          const darkOwn = b.colour(r, c);
          add(
            'text',
            {
              x: c * cell + cell / 2,
              y: r * cell + cell * 0.62,
              'text-anchor': 'middle',
              'font-size': cell * 0.4,
              'font-weight': 700,
              fill: darkOwn ? (WIRE[darkOwn] ?? '#8a8fa6') : '#8a8fa6',
            },
            '?',
          );
          return;
        }
        const lit = dist.has(key(r, c));
        const own = b.colour(r, c);
        const white = secPlug !== undefined && !own;
        const reached = string.get(key(r, c));
        const tone = own ?? (white && lit && reached ? reached : 'w');
        const colour = done
          ? own
            ? (WIRE[own] ?? '#ffd54f')
            : '#ffd54f'
          : lit
            ? (WIRE[tone] ?? '#ffe08a')
            : (DIM[tone] ?? '#55607a');
        const surgeStyle = done
          ? `animation: puzz-light-surge 0.55s cubic-bezier(0.22, 1.35, 0.36, 1) ${(dist.get(key(r, c)) ?? 0) * 45}ms both;`
          : '';
        const wrongString = lit && own !== undefined && reached !== undefined && reached !== own;
        const across = (d: number): boolean => crossing.has(`${key(r, c)}:${d}`);
        const cx = c * cell + cell / 2;
        const cy = r * cell + cell / 2;
        let arms = 0;
        for (const d of DIRS) {
          if (!(m & d)) continue;
          arms++;
          const [dr, dc] = STEP[d] as Spot;
          const wireEl = add('line', {
            x1: cx,
            y1: cy,
            x2: cx + (dc * cell) / 2,
            y2: cy + (dr * cell) / 2,
            stroke: across(d) ? '#ff3b30' : colour,
            'stroke-width': cell * 0.14,
            'stroke-linecap': 'round',
          });
          if (surgeStyle) wireEl.setAttribute('style', surgeStyle);
          if (lit && sparks.has(`${key(r, c)}:${d}`))
            add('circle', {
              cx: cx + dc * cell * 0.42,
              cy: cy + dr * cell * 0.42,
              r: cell * 0.1,
              fill: '#ff3b30',
            });
        }
        if (arms === 1) {
          if (done) {
            const haloEl = add('circle', {
              cx,
              cy,
              r: cell * 0.31,
              fill: colour,
              opacity: 0.24,
            });
            if (surgeStyle) haloEl.setAttribute('style', surgeStyle);
          }
          const bulbEl = add('circle', {
            cx,
            cy,
            r: cell * 0.2,
            fill: lit || done ? colour : '#2a3142',
            stroke: white || done ? '#ffffff' : colour,
            'stroke-width': white || done ? 2.5 : 2,
          });
          if (surgeStyle) bulbEl.setAttribute('style', surgeStyle);
        } else {
          const jointEl = add('circle', {
            cx,
            cy,
            r: cell * (white ? 0.13 : 0.09),
            fill: white ? '#ffffff' : colour,
          });
          if (surgeStyle) jointEl.setAttribute('style', surgeStyle);
        }
        if (wrongString)
          add('circle', {
            cx,
            cy,
            r: cell * 0.3,
            fill: 'none',
            stroke: '#ff9f1a',
            'stroke-width': 3,
          });
      }),
    );

    // Snowflakes: frosty frame and mirror line with ❄ (pieces inside start mirrored and turn together)
    if (b.frame) {
      const f = b.frame;
      const [fx, fy] = [f.left * cell + 2, f.top * cell + 2];
      const [fw, fh] = [(f.right - f.left + 1) * cell - 4, (f.bottom - f.top + 1) * cell - 4];
      add('rect', {
        x: fx,
        y: fy,
        width: fw,
        height: fh,
        rx: 8,
        fill: 'rgba(154, 215, 255, 0.06)',
        stroke: '#9ad7ff',
        'stroke-width': 2,
        'stroke-dasharray': '6 4',
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
        stroke: '#9ad7ff',
        'stroke-width': 1.8,
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
    }

    // Plugs, eggs, letters, the star and the slice counts.
    const plugs: [Spot, string][] = [[b.plug, secPlug ? 'r' : 'w']];
    if (secPlug) plugs.push([secPlug, secTone]);
    for (const [[r, c], tone] of plugs) {
      add('circle', {
        cx: c * cell + cell * 0.2,
        cy: r * cell + cell * 0.8,
        r: cell * 0.16,
        fill: WIRE[tone] ?? WIRE['w'] ?? '#ffe08a',
      });
      add(
        'text',
        {
          x: c * cell + cell * 0.2,
          y: r * cell + cell * 0.86,
          'text-anchor': 'middle',
          'font-size': cell * 0.2,
        },
        '🔌',
      );
    }
    for (const [r, c, n] of b.eggs) {
      const reached = dist.get(key(r, c));
      const fill = done
        ? '#ffd54f'
        : reached === undefined
          ? '#fff6dc'
          : reached === n
            ? '#7ed37e'
            : '#ff8a80';
      add('ellipse', {
        cx: c * cell + cell * 0.75,
        cy: r * cell + cell * 0.27,
        rx: cell * 0.2,
        ry: cell * 0.25,
        fill,
        stroke: '#c9a227',
        'stroke-width': 2,
      });
      add(
        'text',
        {
          x: c * cell + cell * 0.75,
          y: r * cell + cell * 0.35,
          'text-anchor': 'middle',
          'font-size': cell * 0.22,
          'font-weight': 700,
          fill: '#3a2f25',
        },
        String(n),
      );
    }
    const letterDistCounts = new Map<number, Set<string>>();
    const letterToDists = new Map<string, Set<number>>();
    for (const [r, c, ch] of b.letters) {
      const d = dist.get(key(r, c));
      if (d !== undefined) {
        const set = letterDistCounts.get(d) ?? new Set<string>();
        set.add(ch);
        letterDistCounts.set(d, set);
        const dSet = letterToDists.get(ch) ?? new Set<number>();
        dSet.add(d);
        letterToDists.set(ch, dSet);
      }
    }
    for (const [r, c, ch] of b.letters) {
      const reached = dist.get(key(r, c));
      const conflict =
        reached !== undefined &&
        ((letterDistCounts.get(reached)?.size ?? 0) > 1 || (letterToDists.get(ch)?.size ?? 0) > 1);
      const fill = done
        ? '#ffd54f'
        : reached === undefined
          ? '#fff6dc'
          : blankSet.has(reached) && !conflict
            ? '#7ed37e'
            : '#ff8a80';
      add('circle', {
        cx: c * cell + cell * 0.75,
        cy: r * cell + cell * 0.27,
        r: cell * 0.21,
        fill,
        stroke: '#d4af37',
        'stroke-width': 2,
      });
      add(
        'text',
        {
          x: c * cell + cell * 0.75,
          y: r * cell + cell * 0.35,
          'text-anchor': 'middle',
          'font-size': cell * 0.22,
          'font-weight': 700,
          fill: '#3a2f25',
        },
        ch,
      );
    }
    if (panel.star) {
      const [r, c] = panel.star;
      add(
        'text',
        {
          x: c * cell + cell / 2,
          y: r * cell + cell * 0.36,
          'text-anchor': 'middle',
          'font-size': cell * 0.5,
          fill: done ? '#ffd54f' : '#77705a',
        },
        '★',
      );
    }
    // Edge flags: green when the line has that many joins, red when it has more.
    if (flagged) {
      const along = joinsAlong(b, grid);
      const flag = (f: number | null, have: number, x: number, y: number): void => {
        if (f === null) return;
        const colour = have === f ? '#2f8a45' : have > f ? '#d9534f' : '#6b5f52';
        add('rect', {
          x: x - cell * 0.28,
          y: y - cell * 0.2,
          width: cell * 0.56,
          height: cell * 0.4,
          rx: 3,
          fill: '#fff',
          stroke: colour,
          'stroke-width': 2,
        });
        add('rect', {
          x: x - cell * 0.28 + 1,
          y: y - cell * 0.2 + 1,
          width: cell * 0.16,
          height: cell * 0.14,
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
        flag(f, along.rows[r] ?? 0, b.width * cell + pad / 2, r * cell + cell / 2),
      );
      b.colFlags.forEach((f, c) =>
        flag(f, along.cols[c] ?? 0, c * cell + cell / 2, b.height * cell + pad / 2),
      );
    }
    let total = 0;
    grid.forEach((row) => row.forEach((m) => (total += m >= 0 ? 1 : 0)));
    let wrongStrings = false;
    for (const [k, tone] of string) {
      const [r, c] = k.split(',').map(Number) as [number, number];
      const own = b.colour(r, c);
      if (own && own !== tone) wrongStrings = true;
    }
    const eggWrong = b.eggs.some(([r, c, n]) => dist.has(key(r, c)) && dist.get(key(r, c)) !== n);
    const letterWrong =
      b.letters.some(
        ([r, c, ch]) =>
          dist.has(key(r, c)) &&
          (!blankSet.has(dist.get(key(r, c)) ?? -1) ||
            (letterDistCounts.get(dist.get(key(r, c)) ?? -1)?.size ?? 0) > 1 ||
            (letterToDists.get(ch)?.size ?? 0) > 1),
      ) ||
      (b.blanks.length > 0 && spell(b, grid).includes('_'));
    hooks.status(
      done
        ? 'Lit!'
        : dist.size === total && !loose.length
          ? loop
            ? 'Everything’s lit, but the wires form a loop'
            : eggWrong
              ? 'Everything’s lit, but an egg is the wrong number of steps from the plug'
              : letterWrong
                ? 'Everything’s lit, but a letter bulb is not on one of the message’s distances'
                : wrongStrings
                  ? 'Everything’s lit, but a light is on the wrong-colored string'
                  : b.frame && !solved(b, grid)
                    ? 'Everything’s lit, but the wires inside the frosty frame don’t mirror yet'
                    : walls.length
                      ? 'Everything’s lit, but a wire crosses between two slices'
                      : 'Everything’s lit, but something doesn’t match its clues yet'
          : `${dist.size} of ${total} lit`,
    );
  };
  const giveHint = (): void => {
    if (done) return;
    const { dist } = light(b, grid);
    const lockCell = (r: number, c: number): void => {
      const solMask = b.solution[r]?.[c];
      if (solMask === undefined || solMask < 0) return;
      (grid[r] as number[])[c] = solMask;
      lockedTiles.add(key(r, c));
      if (b.frame && inFrame(b.frame, r, c)) {
        const [mr, mc] = mirrorSquare(b.frame, r, c);
        const mMask = b.solution[mr]?.[mc];
        if (b.inside(mr, mc) && mMask !== undefined && mMask >= 0) {
          (grid[mr] as number[])[mc] = mMask;
          lockedTiles.add(key(mr, mc));
        }
      }
      blip(640, 70, 10);
      settle();
    };

    // Prefer a misoriented tile in or adjacent to the powered tree so light visibly extends
    const cands: Spot[] = [];
    for (let r = 0; r < b.height; r++) {
      for (let c = 0; c < b.width; c++) {
        if (!b.inside(r, c)) continue;
        if ((grid[r]?.[c] ?? -1) !== (b.solution[r]?.[c] ?? -1)) {
          cands.push([r, c]);
        }
      }
    }
    const nearLit = cands.find(([r, c]) => {
      if (dist.has(key(r, c))) return true;
      return DIRS.some((d) => {
        const [dr, dc] = STEP[d] as Spot;
        return dist.has(key(r + dr, c + dc));
      });
    });
    const pick = nearLit ?? cands[0];
    if (pick) {
      lockCell(pick[0], pick[1]);
      return;
    }

    // If all tiles already match solution (or only need locking), lock one unlocked tile
    for (let r = 0; r < b.height; r++) {
      for (let c = 0; c < b.width; c++) {
        if (b.inside(r, c) && !lockedTiles.has(key(r, c))) {
          lockCell(r, c);
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
    grid: grid.map((row) => row.map((v) => v.toString(16)).join('')),
  });
}
