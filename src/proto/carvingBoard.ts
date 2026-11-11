/**
 * The clicky carving panel: drag from one square to another to carve the
 * rectangle between them (it replaces any portions it overlaps); tap a
 * portion to lift it off; tap an empty square for a one-square portion.
 * The panel checks as you go: a portion glows green when it's right on its
 * own and shows red when it isn't (two numbers, the wrong size, a dish
 * missing, or touching a portion of its colour); a flag goes green
 * when its line is carved and right, red when it's over. Solved, the board
 * turns gold and chimes.
 */
import { inside as inFrame, mirrorKey } from '../gen/core/mirror';
import {
  type Panel,
  type Rect,
  colourClashes,
  colourOf,
  covers,
  cutsOf,
  lineCounts,
  parse,
  problem,
  solve,
  solved,
} from '../gen/carving';
import { blip, getBoardPersistence } from './kit';

const NS = 'http://www.w3.org/2000/svg';
const DISH: Record<string, string> = { T: '🦃', P: '🥧', C: '🍒' };
/** How a portion's share is listed: the Feast's dishes, then an Easter basket's food. */
const FOOD_ORDER = ['T', 'P', 'C', '🥚', '🥕', '🍫'];
// Red, white and blue: red and blue marks, plain portions white (green in older panels).
const TINT = { r: '#ef9a92', b: '#9db8ef', g: '#9fd49a' };
const INK = { r: '#c23b33', b: '#3c5aa6', g: '#2f8a45' };
const COLOUR_NAME = { r: 'red', b: 'blue', g: 'green' };

export interface CarveHooks {
  solved(): void;
  status(text: string): void;
}

export function mountCarving(host: HTMLElement, panel: Panel, hooks: CarveHooks): () => unknown {
  const b = parse(panel);
  const marks = [...b.rowMarks, ...b.colMarks].some((m) => m !== null);
  const avail = Math.min(host.clientWidth || 360, 560);
  const cols = b.width + (marks ? 0.9 : 0);
  const cell = Math.max(34, Math.min(62, Math.floor((avail - 8) / cols)));
  const pad = marks ? cell * 0.9 : 0;
  const W = b.width * cell + pad;
  const H = b.height * cell + pad;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  // Fair shares: the recipe every portion must get, spelled out above the board.
  if (b.dishes.length) {
    const recipe = document.createElement('div');
    recipe.textContent = `Each portion: ${b.dishes
      .slice()
      .sort((x, y) => FOOD_ORDER.indexOf(x) - FOOD_ORDER.indexOf(y))
      .map((d) => DISH[d] ?? d)
      .join(' ')}`;
    Object.assign(recipe.style, { fontSize: '14.5px', margin: '0 0 6px', fontWeight: '700' });
    host.append(recipe);
  }
  // A message's numbered blanks (coded sizes), filled in when the board's carved.
  const note = panel.message ? document.createElement('div') : null;
  const drawNote = (solved: boolean): void => {
    if (!note || !panel.message) return;
    note.replaceChildren(
      ...[...panel.message].map((ch) => {
        const tile = document.createElement('span');
        // A digit n is the letter for size n; other letters show as they are.
        const letter = /[0-9]/.test(ch) ? (panel.sizeLetters?.[Number(ch) - 1] ?? '?') : ch;
        tile.textContent = solved ? letter : ch;
        Object.assign(tile.style, {
          display: 'inline-grid',
          placeItems: 'center',
          width: '30px',
          height: '38px',
          margin: '0 4px 8px 0',
          borderRadius: '6px',
          border: '2px dashed #c9a2b0',
          fontWeight: '700',
          fontSize: solved ? '22px' : '14px',
          background: solved ? '#ffd54f' : '#fff',
          color: solved ? '#7a1f3d' : '#9a8a96',
        });
        return tile;
      }),
    );
  };
  if (note) {
    host.append(note);
    drawNote(false);
  }
  host.append(svg);
  let rects: Rect[] = [];
  let drag: { r: number; c: number; to: [number, number] } | null = null;
  let done = false;
  let cachedSol: Rect[] | null = null;
  let lastCarvedKey: string | null = null;
  const lockedRectKeys = new Set<string>();
  const rectKey = (x: Rect): string => `${x.r},${x.c},${x.h},${x.w}`;
  /** A flag being inspected (tapped): its skewer's line is counted out for a moment. */
  let inspect: { row: boolean; i: number } | null = null;
  let inspectTimer = 0;

  const at = (e: PointerEvent): [number, number] | null => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const y = ((e.clientY - box.top) * H) / box.height;
    const r = Math.floor(y / cell);
    const c = Math.floor(x / cell);
    return r >= 0 && r < b.height && c >= 0 && c < b.width ? [r, c] : null;
  };
  const span = (r1: number, c1: number, r2: number, c2: number): Rect => ({
    r: Math.min(r1, r2),
    c: Math.min(c1, c2),
    h: Math.abs(r1 - r2) + 1,
    w: Math.abs(c1 - c2) + 1,
  });
  const overlaps = (x: Rect, y: Rect): boolean =>
    x.r < y.r + y.h && y.r < x.r + x.h && x.c < y.c + y.w && y.c < x.c + x.w;
  const inside = (x: Rect, r: number, c: number): boolean =>
    r >= x.r && r < x.r + x.h && c >= x.c && c < x.c + x.w;

  const persist = getBoardPersistence(host);
  try {
    const init = persist?.initialState as { rects?: unknown; locked?: unknown } | undefined;
    if (init && Array.isArray(init.rects)) {
      const cand: Rect[] = [];
      let valid = true;
      for (const item of init.rects) {
        if (!item || typeof item !== 'object') {
          valid = false;
          break;
        }
        const { r, c, h, w } = item as Record<string, unknown>;
        if (
          typeof r !== 'number' ||
          typeof c !== 'number' ||
          typeof h !== 'number' ||
          typeof w !== 'number' ||
          !Number.isInteger(r) ||
          !Number.isInteger(c) ||
          !Number.isInteger(h) ||
          !Number.isInteger(w) ||
          r < 0 ||
          c < 0 ||
          h < 1 ||
          w < 1 ||
          r + h > b.height ||
          c + w > b.width
        ) {
          valid = false;
          break;
        }
        const rx: Rect = { r, c, h, w };
        if (cand.some((other) => overlaps(rx, other))) {
          valid = false;
          break;
        }
        cand.push(rx);
      }
      if (valid && !solved(b, cand)) {
        rects = cand;
        if (Array.isArray(init.locked)) {
          const validKeys = new Set(rects.map(rectKey));
          for (const k of init.locked) {
            if (typeof k === 'string' && validKeys.has(k)) lockedRectKeys.add(k);
          }
        }
      }
    }
  } catch {
    // Abandon invalid or stale board state.
  }

  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const p = at(e);
    if (!p) {
      // A tap on a flag counts its skewer's line out.
      const box = svg.getBoundingClientRect();
      const x = ((e.clientX - box.left) * W) / box.width;
      const y = ((e.clientY - box.top) * H) / box.height;
      const r = Math.floor(y / cell);
      const c = Math.floor(x / cell);
      const hit =
        x >= b.width * cell && r < b.height && b.rowMarks[r] != null
          ? { row: true, i: r }
          : y >= b.height * cell && c < b.width && b.colMarks[c] != null
            ? { row: false, i: c }
            : null;
      if (hit) {
        inspect = hit;
        blip(500, 40);
        clearTimeout(inspectTimer);
        inspectTimer = window.setTimeout(() => {
          inspect = null;
          render();
        }, 1800);
        render();
      }
      return;
    }
    drag = { r: p[0], c: p[1], to: p };
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer: no capture needed.
    }
    render();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = at(e);
    if (p && (p[0] !== drag.to[0] || p[1] !== drag.to[1])) {
      drag.to = p;
      blip(700, 15);
      render();
    }
  });
  svg.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const p = at(e) ?? drag.to;
    const { r, c } = drag;
    drag = null;
    if (p[0] === r && p[1] === c) {
      const hit = rects.findIndex((x) => inside(x, r, c));
      if (hit >= 0) {
        const hitRect = rects[hit];
        if (hitRect && lockedRectKeys.has(rectKey(hitRect))) {
          blip(180, 40, 8);
          return render();
        }
        rects.splice(hit, 1);
        blip(260, 50, 8);
        return settle();
      }
    }
    const x = span(r, c, p[0], p[1]);
    if (rects.some((y) => lockedRectKeys.has(rectKey(y)) && overlaps(x, y))) {
      blip(180, 50, 8);
      return render();
    }
    rects = rects.filter((y) => !overlaps(x, y));
    rects.push(x);
    lastCarvedKey = rectKey(x);
    blip(problem(b, x) ? 200 : 600, 60, 8);
    settle();
  });
  svg.addEventListener('pointercancel', () => {
    drag = null;
    render();
  });

  const launchCarvingCelebration = (): void => {
    if (typeof requestAnimationFrame !== 'function') return;
    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('style', 'pointer-events: none');
    svg.append(layer);

    interface Wisp {
      cx: number;
      cy: number;
      amp: number;
      freq: number;
      phase: number;
      rise: number;
      delay: number;
      dur: number;
      el: SVGElement;
    }
    const wisps: Wisp[] = [];
    const sorted = [...rects].sort((a, o) => a.r - o.r || a.c - o.c);
    sorted.forEach((rect, rIdx) => {
      const baseCx = (rect.c + rect.w / 2) * cell;
      const baseCy = (rect.r + rect.h / 2) * cell;
      const baseDelay = (rect.r + rect.c) * 40 + 80;
      for (let k = 0; k < 3; k++) {
        const offsetX = (k - 1) * (cell * 0.24);
        const isStar = k === 1;
        const el = document.createElementNS(NS, isStar ? 'text' : 'circle');
        if (isStar) {
          el.textContent = '✦';
          el.setAttribute('text-anchor', 'middle');
          el.setAttribute('font-size', String(cell * 0.28));
          el.setAttribute('fill', '#e6a100');
        } else {
          el.setAttribute('r', String(cell * 0.075));
          el.setAttribute('fill', k === 0 ? '#ffd54f' : '#ffab40');
        }
        el.setAttribute('opacity', '0');
        layer.append(el);
        wisps.push({
          cx: baseCx + offsetX,
          cy: baseCy,
          amp: cell * (0.1 + (k % 2) * 0.06),
          freq: 5 + k,
          phase: rIdx * 0.9 + k * 1.4,
          rise: cell * (0.75 + k * 0.14),
          delay: baseDelay + k * 65,
          dur: 680,
          el,
        });
      }
    });

    const t0 = performance.now();
    const tick = (now: number): void => {
      if (!svg.isConnected) return;
      if (!layer.isConnected) svg.append(layer);
      const elapsed = now - t0;
      let active = false;
      for (const w of wisps) {
        const dt = elapsed - w.delay;
        if (dt < 0) {
          active = true;
          continue;
        }
        if (dt > w.dur) {
          w.el.setAttribute('opacity', '0');
          continue;
        }
        active = true;
        const p = dt / w.dur;
        const x = w.cx + Math.sin(p * w.freq + w.phase) * w.amp;
        const y = w.cy - p * w.rise;
        const alpha = p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75;
        if (w.el.tagName === 'text') {
          w.el.setAttribute('x', String(x));
          w.el.setAttribute('y', String(y));
        } else {
          w.el.setAttribute('cx', String(x));
          w.el.setAttribute('cy', String(y));
        }
        w.el.setAttribute('opacity', String(alpha * 0.9));
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
    if (solved(b, rects)) {
      done = true;
      [660, 880, 1100].forEach((f, i) => setTimeout(() => blip(f, 160), i * 110));
      navigator.vibrate?.([20, 40, 20]);
      render();
      launchCarvingCelebration();
      drawNote(true);
      hooks.solved();
    } else {
      persist?.onChange({
        rects: rects.map((x) => ({ r: x.r, c: x.c, h: x.h, w: x.w })),
        locked: [...lockedRectKeys],
      });
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
    // Candy-cane stripes for red and green portions (a flat red would read as an error).
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = (['r', 'b', 'g'] as const)
      .map(
        (k) =>
          `<pattern id="stripes-${k}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#fffaf2"/><rect width="5" height="12" fill="${TINT[k]}"/></pattern>`,
      )
      .join('');
    svg.append(defs);
    add('rect', {
      x: 0,
      y: 0,
      width: b.width * cell,
      height: b.height * cell,
      rx: 8,
      fill: '#f7efe1',
    });
    for (let r = 0; r <= b.height; r++)
      add('line', {
        x1: 0,
        y1: r * cell,
        x2: b.width * cell,
        y2: r * cell,
        stroke: '#e3d6bf',
        'stroke-width': 1,
      });
    for (let c = 0; c <= b.width; c++)
      add('line', {
        x1: c * cell,
        y1: 0,
        x2: c * cell,
        y2: b.height * cell,
        stroke: '#e3d6bf',
        'stroke-width': 1,
      });
    const clashing = new Set(colourClashes(b, rects).flat());
    // Red, white and blue: a plain portion is white (green elsewhere), with the same green border.
    const patriotic = b.cells.some((row) => row.some((cl) => cl.colour));
    rects.forEach((x, i) => {
      const bad = problem(b, x) !== null || clashing.has(i);
      const colour = colourOf(b, x);
      const platterEl = add('rect', {
        x: x.c * cell + 3,
        y: x.r * cell + 3,
        width: x.w * cell - 6,
        height: x.h * cell - 6,
        rx: 7,
        fill: done
          ? '#ffe7a0'
          : colour
            ? `url(#stripes-${colour})`
            : bad
              ? '#f3e1dc'
              : patriotic
                ? '#ffffff'
                : '#e2f2dc',
        stroke: done ? '#d4a017' : bad ? '#d9534f' : '#4caf50',
        'stroke-width': 3,
        'stroke-dasharray': bad && !done ? '6 4' : '',
      });
      if (done) {
        const delay = (x.r + x.c) * 40;
        platterEl.setAttribute(
          'style',
          `transform-box: fill-box; transform-origin: center; animation: puzz-carve-pop 0.48s cubic-bezier(0.22, 1.35, 0.36, 1) ${delay}ms both;`,
        );
        const rimEl = add('rect', {
          x: x.c * cell + 6,
          y: x.r * cell + 6,
          width: Math.max(4, x.w * cell - 12),
          height: Math.max(4, x.h * cell - 12),
          rx: 5,
          fill: 'none',
          stroke: 'rgba(255, 255, 255, 0.65)',
          'stroke-width': 1.5,
        });
        rimEl.setAttribute(
          'style',
          `transform-box: fill-box; transform-origin: center; animation: puzz-carve-pop 0.48s cubic-bezier(0.22, 1.35, 0.36, 1) ${delay}ms both;`,
        );
      } else if (lastCarvedKey === rectKey(x)) {
        platterEl.setAttribute(
          'style',
          bad
            ? 'transform-box: fill-box; transform-origin: center; animation: puzz-error-shake 0.28s ease-in-out both;'
            : 'transform-box: fill-box; transform-origin: center; animation: puzz-tap-pop 0.2s cubic-bezier(0.22, 1.45, 0.36, 1) both;',
        );
      }
    });
    lastCarvedKey = null;
    // Colour clashes: a thick red line along every edge where two portions of one colour meet.
    const clashes = colourClashes(b, rects);
    for (const [i, j] of clashes) {
      const a = rects[i] as Rect;
      const o = rects[j] as Rect;
      const vertical = a.c + a.w === o.c || o.c + o.w === a.c;
      if (vertical) {
        const x = (a.c + a.w === o.c ? o.c : a.c) * cell;
        const y1 = Math.max(a.r, o.r) * cell;
        const y2 = Math.min(a.r + a.h, o.r + o.h) * cell;
        add('line', {
          x1: x,
          y1: y1 + 4,
          x2: x,
          y2: y2 - 4,
          stroke: '#d9534f',
          'stroke-width': 7,
          'stroke-linecap': 'round',
        });
      } else {
        const y = (a.r + a.h === o.r ? o.r : a.r) * cell;
        const x1 = Math.max(a.c, o.c) * cell;
        const x2 = Math.min(a.c + a.w, o.c + o.w) * cell;
        add('line', {
          x1: x1 + 4,
          y1: y,
          x2: x2 - 4,
          y2: y,
          stroke: '#d9534f',
          'stroke-width': 7,
          'stroke-linecap': 'round',
        });
      }
    }
    if (drag) {
      const x = span(drag.r, drag.c, drag.to[0], drag.to[1]);
      add('rect', {
        x: x.c * cell + 2,
        y: x.r * cell + 2,
        width: x.w * cell - 4,
        height: x.h * cell - 4,
        rx: 7,
        fill: 'rgba(255, 207, 107, 0.25)',
        stroke: '#e0a020',
        'stroke-width': 3,
        'stroke-dasharray': '5 4',
      });
    }
    b.cells.forEach((row, r) =>
      row.forEach((cl, c) => {
        const x = c * cell + cell / 2;
        const y = r * cell + cell / 2;
        if (cl.colour)
          add('circle', {
            cx: x,
            cy: y,
            r: cell * 0.3,
            fill: INK[cl.colour],
          });
        if (cl.letter || cl.dark)
          add(
            'text',
            {
              x,
              y: y + cell * 0.14,
              'text-anchor': 'middle',
              'font-size': cell * 0.4,
              'font-weight': 700,
              // On a red or blue mark, white like a number (crimson would vanish on red).
              fill: cl.colour ? '#fff' : cl.letter ? '#c2185b' : '#8a7f72',
            },
            cl.letter ?? '?',
          );
        else if (cl.n !== undefined)
          add(
            'text',
            {
              x,
              y: y + cell * 0.14,
              'text-anchor': 'middle',
              'font-size': cell * 0.4,
              'font-weight': 700,
              fill: cl.colour ? '#fff' : '#3a2f25',
            },
            String(cl.n),
          );
        else if (cl.dish)
          add(
            'text',
            { x, y: y + cell * 0.14, 'text-anchor': 'middle', 'font-size': cell * 0.42 },
            DISH[cl.dish] ?? cl.dish,
          );
      }),
    );
    if (drag) {
      const x = span(drag.r, drag.c, drag.to[0], drag.to[1]);
      add(
        'text',
        {
          x: (drag.c + 1) * cell - 6,
          y: (drag.r + 1) * cell - 6,
          'text-anchor': 'end',
          'font-size': cell * 0.32,
          'font-weight': 800,
          fill: '#b07800',
          stroke: '#fffaf2',
          'stroke-width': 3.5,
          'stroke-linejoin': 'round',
          'paint-order': 'stroke',
        },
        String(x.h * x.w),
      );
    }
    // Cuts: fences on the squares' edges.
    for (const w of b.walls) {
      const [r, c, side] = w.split(',');
      const rr = Number(r);
      const cc = Number(c);
      const [x1, y1, x2, y2] =
        side === 'v'
          ? [(cc + 1) * cell, rr * cell + 3, (cc + 1) * cell, (rr + 1) * cell - 3]
          : [cc * cell + 3, (rr + 1) * cell, (cc + 1) * cell - 3, (rr + 1) * cell];
      add('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: '#8b5a2b',
        'stroke-width': 6,
        'stroke-linecap': 'round',
      });
    }
    // Snowflakes: the frosty frame, its mirror line with a snowflake at each end,
    // and a ghost of each cut's mirror image until it's carved.
    if (b.frame) {
      const f = b.frame;
      const [fx, fy] = [f.left * cell + 2, f.top * cell + 2];
      const [fw, fh] = [(f.right - f.left + 1) * cell - 4, (f.bottom - f.top + 1) * cell - 4];
      add('rect', {
        x: fx,
        y: fy,
        width: fw,
        height: fh,
        rx: 10,
        fill: 'none',
        stroke: '#6fb8e8',
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
        stroke: '#6fb8e8',
        'stroke-width': 1.5,
        'stroke-dasharray': '3 4',
      });
      for (const [x, y] of [
        [x1, y1],
        [x2, y2],
      ])
        add(
          'text',
          { x: x ?? 0, y: (y ?? 0) + cell * 0.1, 'text-anchor': 'middle', 'font-size': cell * 0.3 },
          '❄',
        );
      const drawn = cutsOf(b.height, b.width, rects);
      for (const seg of drawn) {
        if (!inFrame(f, seg)) continue;
        const m = mirrorKey(f, seg);
        if (drawn.has(m)) continue;
        // A cut between two squares is the edge they share.
        const [r1 = 0, c1 = 0, r2 = 0, c2 = 0] = m.slice(1).split(',').map(Number);
        const [gx1, gy1, gx2, gy2] =
          r1 === r2
            ? [(c1 + 1) * cell, r1 * cell + 4, (c1 + 1) * cell, (r1 + 1) * cell - 4]
            : [c1 * cell + 4, (r1 + 1) * cell, (c1 + 1) * cell - 4, (r1 + 1) * cell];
        void c2;
        void r2;
        add('line', {
          x1: gx1,
          y1: gy1,
          x2: gx2,
          y2: gy2,
          stroke: '#6fb8e8',
          'stroke-width': 4,
          'stroke-dasharray': '4 4',
          opacity: 0.7,
        });
      }
    }
    let explain = '';
    if (marks) {
      const { rows, cols } = lineCounts(b, rects);
      const lineCells = (row: boolean, i: number): [number, number][] =>
        row
          ? Array.from({ length: b.width }, (_, c): [number, number] => [i, c])
          : Array.from({ length: b.height }, (_, r): [number, number] => [r, i]);
      const full = (cells: [number, number][]): boolean =>
        cells.every(([r, c]) => rects.some((x) => inside(x, r, c)));
      /** A line is wrong when it's over its mark, or carved right across and off it. */
      const wrong = (row: boolean, i: number): boolean => {
        const m = (row ? b.rowMarks : b.colMarks)[i];
        const have = (row ? rows : cols)[i] ?? 0;
        return m != null && (have > m || (have !== m && full(lineCells(row, i))));
      };
      // Count a line out: its skewer drawn right through it, and a numbered badge on each piece it goes through.
      const SKEWER = 0.8; // how far across a square the skewer runs (clear of the numbers)
      const countOut = (row: boolean, i: number, bad: boolean): void => {
        const along = i * cell + cell * SKEWER;
        const stick = bad ? '#d9534f' : '#b8894f';
        add('line', {
          x1: row ? cell * 0.15 : along,
          y1: row ? along : cell * 0.15,
          x2: row ? b.width * cell : along,
          y2: row ? along : b.height * cell,
          stroke: stick,
          'stroke-width': 4,
          'stroke-linecap': 'round',
        });
        rects
          .filter((x) => (row ? x.r <= i && i < x.r + x.h : x.c <= i && i < x.c + x.w))
          .sort((x, y) => (row ? x.c - y.c : x.r - y.r))
          .forEach((x, k) => {
            const cx = row ? (x.c + x.w / 2) * cell : along;
            const cy = row ? along : (x.r + x.h / 2) * cell;
            add('circle', { cx, cy, r: cell * 0.16, fill: bad ? '#d9534f' : '#e0a020' });
            add(
              'text',
              {
                x: cx,
                y: cy + cell * 0.07,
                'text-anchor': 'middle',
                'font-size': cell * 0.2,
                'font-weight': 700,
                fill: '#fff',
              },
              String(k + 1),
            );
          });
      };
      const lines = [
        ...b.rowMarks.map((_, i) => ({ row: true, i })),
        ...b.colMarks.map((_, i) => ({ row: false, i })),
      ];
      for (const { row, i } of lines) {
        const bad = wrong(row, i);
        if (bad || (inspect && inspect.row === row && inspect.i === i)) countOut(row, i, bad);
        if (bad && !explain) {
          const m = (row ? b.rowMarks : b.colMarks)[i];
          const have = (row ? rows : cols)[i] ?? 0;
          explain = `The skewer through ${row ? 'row' : 'column'} ${i + 1} goes through ${have} piece${have === 1 ? '' : 's'}, but its flag says ${m}`;
        }
      }
      const mark = (row: boolean, i: number, x: number, y: number): void => {
        const m = (row ? b.rowMarks : b.colMarks)[i];
        if (m == null) return;
        const have = (row ? rows : cols)[i] ?? 0;
        const right = have === m && full(lineCells(row, i));
        const colour = wrong(row, i) ? '#d9534f' : right ? '#2f8a45' : '#6b5f52';
        // A cookout flag on a toothpick skewer: the stub of the skewer from the board, a pole, and a pennant with the number.
        const along = i * cell + cell * SKEWER;
        add('line', {
          x1: row ? b.width * cell : along,
          y1: row ? along : b.height * cell,
          x2: row ? x - cell * 0.3 : along,
          y2: row ? along : y - cell * 0.3,
          stroke: '#b8894f',
          'stroke-width': 3,
          'stroke-linecap': 'round',
        });
        const fx = x - cell * 0.3;
        const fy = y - cell * 0.24;
        const fw = cell * 0.62;
        const fh = cell * 0.48;
        add('line', {
          x1: fx,
          y1: fy - cell * 0.06,
          x2: fx,
          y2: fy + fh + cell * 0.1,
          stroke: '#7a5a3a',
          'stroke-width': 2,
        });
        add('rect', {
          x: fx,
          y: fy,
          width: fw,
          height: fh,
          rx: 2,
          fill: '#fff',
          stroke: colour,
          'stroke-width': 2,
        });
        add('rect', { x: fx + 1, y: fy + 1, width: fw * 0.32, height: fh * 0.42, fill: '#3c5aa6' });
        add('rect', {
          x: fx + 1,
          y: fy + fh - fh * 0.2,
          width: fw - 2,
          height: fh * 0.18,
          fill: '#d9534f',
        });
        add(
          'text',
          {
            x: fx + fw * 0.62,
            y: fy + fh * 0.62,
            'text-anchor': 'middle',
            'font-size': cell * 0.32,
            'font-weight': 700,
            fill: colour,
          },
          String(m),
        );
      };
      b.rowMarks.forEach((_, r) => mark(true, r, b.width * cell + pad / 2, r * cell + cell / 2));
      b.colMarks.forEach((_, c) => mark(false, c, c * cell + cell / 2, b.height * cell + pad / 2));
    }
    hooks.status(
      done
        ? 'Carved!'
        : explain
          ? explain
          : clashes.length
            ? `Two ${COLOUR_NAME[colourOf(b, rects[clashes[0]?.[0] ?? 0] as Rect) ?? 'r']} portions touch (see the red line)`
            : covers(b, rects)
              ? 'Every square is carved, but something’s not right yet'
              : '',
    );
  };

  const giveHint = (): void => {
    if (done) return;
    cachedSol ??= solve(b, 1)[0] ?? null;
    if (!cachedSol) return;
    const solSet = new Set(cachedSol.map(rectKey));

    // 1. If any carved rectangle doesn't match the solution, remove one wrong rectangle
    const wrongIdx = rects.findIndex((x) => !solSet.has(rectKey(x)));
    if (wrongIdx !== -1) {
      rects.splice(wrongIdx, 1);
      blip(260, 60, 10);
      settle();
      return;
    }

    // 2. Otherwise carve and lock one missing solution rectangle
    const currentSet = new Set(rects.map(rectKey));
    const missing = cachedSol.find((s) => !currentSet.has(rectKey(s)));
    if (missing) {
      rects = rects.filter((y) => !overlaps(missing, y));
      rects.push({ ...missing });
      lockedRectKeys.add(rectKey(missing));
      blip(640, 70, 10);
      settle();
    }
  };
  host.addEventListener('puzz:hint', giveHint);

  render();
  return () => ({
    done,
    rects: rects.map((r) => ({ ...r })),
  });
}
