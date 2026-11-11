/**
 * The clicky picture-grid panel. One colour: tap a square to fill it, again
 * to cross it out, again to clear it. Colours: pick a paint from the bar
 * (or the cross), and tap to paint (tap a painted square again to clear it).
 * Drag along a row or column to paint a run in one stroke. A line's clues go
 * grey when it matches; dark clues show '?', letter clues their letter.
 * Supports all six holiday twists:
 * - colours (red and blue paints in the bar, different colours can touch);
 * - dark ('?' clues of any length);
 * - letters (letter clues and message blank tiles above the board);
 * - eggs (glow green when covered by their row's egg-marked run clue, red when impossible);
 * - portions (live share counts per portion, green when fair, red when over);
 * - snowflakes (frosty frame, mirror line with ❄, and ghost mirror squares).
 * Solved, the picture glows and chimes (and a message's blanks fill in).
 */
import { mirrorSquare } from '../gen/core/mirror';
import { blip, getBoardPersistence, h } from './kit';
import {
  type Panel,
  type Run,
  arrangements,
  clues,
  eggsHold,
  fillMessage,
  frameSymmetric,
  gridSolved,
  lineDone,
  picture,
  portionCounts,
  runIndexAt,
} from './picture';

const NS = 'http://www.w3.org/2000/svg';
const PAINT: Record<string, string> = { '#': '#2b2a33', R: '#d9534f', B: '#3c5aa6', G: '#e0a62a' };
const SPARK_PALETTE: Record<string, readonly string[]> = {
  '#': ['#ffd54f', '#ffab40', '#fff8e1', '#ff7043'],
  R: ['#ff5252', '#ff8a80', '#ffd54f', '#ffffff'],
  B: ['#4dabf7', '#a5d8ff', '#ffffff', '#ffd54f'],
  G: ['#ffd54f', '#ffe082', '#ffffff', '#ffab40'],
};
const CROSS = -2;

export interface PictureHooks {
  solved(): void;
  status(text: string): void;
}

export function mountPicture(host: HTMLElement, panel: Panel, hooks: PictureHooks): () => unknown {
  const palette = panel.palette ?? '#';
  const c = clues(panel);
  const H = c.rows.length;
  const W = c.cols.length;
  const rowSlots = Math.max(1, ...c.rows.map((r) => r.length));
  const colSlots = Math.max(1, ...c.cols.map((r) => r.length));
  const avail = Math.min(host.clientWidth || 360, 520);
  const cell = Math.max(24, Math.min(48, Math.floor((avail - 8) / (W + rowSlots * 0.62))));
  const clueW = rowSlots * cell * 0.62;
  const clueH = colSlots * cell * 0.62;
  const Wpx = clueW + W * cell;
  const Hpx = clueH + H * cell;
  // 0 empty, CROSS crossed out, 1.. a colour.
  const grid = Array.from({ length: H }, () => new Array<number>(W).fill(0));
  const solGrid = picture(panel);
  const lockedCells = new Set<string>();
  let tool = 1;
  let done = false;

  const persist = getBoardPersistence(host);
  const emitState = (): void => {
    persist?.onChange({
      grid: grid.map((row) => [...row]),
      tool,
      locked: [...lockedCells],
    });
  };
  try {
    const init = persist?.initialState as
      { grid?: unknown; tool?: unknown; locked?: unknown } | undefined;
    if (init && Array.isArray(init.grid) && init.grid.length === H) {
      let valid = true;
      const cand: number[][] = [];
      for (let r = 0; r < H && valid; r++) {
        const row = init.grid[r];
        if (!Array.isArray(row) || row.length !== W) {
          valid = false;
          break;
        }
        const candRow: number[] = [];
        for (let cc = 0; cc < W; cc++) {
          const val = row[cc];
          if (
            typeof val !== 'number' ||
            !Number.isInteger(val) ||
            (val !== 0 && val !== CROSS && (val < 1 || val > palette.length))
          ) {
            valid = false;
            break;
          }
          candRow.push(val);
        }
        cand.push(candRow);
      }
      if (valid && !gridSolved(panel, cand)) {
        const sol = picture(panel);
        for (let r = 0; r < H; r++) {
          for (let cc = 0; cc < W; cc++) {
            (grid[r] as number[])[cc] = cand[r]?.[cc] ?? 0;
          }
        }
        if (
          typeof init.tool === 'number' &&
          (init.tool === CROSS || (init.tool >= 1 && init.tool <= palette.length))
        ) {
          tool = init.tool;
        }
        if (Array.isArray(init.locked)) {
          for (const k of init.locked) {
            if (typeof k === 'string') {
              const [r, cc] = k.split(',').map(Number);
              if (
                r !== undefined &&
                cc !== undefined &&
                Number.isInteger(r) &&
                Number.isInteger(cc) &&
                r >= 0 &&
                r < H &&
                cc >= 0 &&
                cc < W
              ) {
                const want = (sol[r]?.[cc] ?? 0) > 0 ? (sol[r]?.[cc] ?? 0) : CROSS;
                if (grid[r]?.[cc] === want) {
                  lockedCells.add(`${r},${cc}`);
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

  // The message's blanks, as tiles (letter panels).
  const note = panel.message
    ? h('div', { style: { display: 'flex', gap: '4px', margin: '0 0 8px', flexWrap: 'wrap' } })
    : null;
  const drawNote = (): void => {
    if (!note || !panel.message) return;
    const solved = fillMessage(panel);
    note.replaceChildren(
      ...[...panel.message].map((ch, i) => {
        if (ch === ' ') return h('span', { style: { width: '12px' } });
        const blank = /[0-9]/.test(ch);
        return h(
          'span',
          {
            style: {
              width: '30px',
              height: '38px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: blank && !done ? '14px' : '22px',
              background: blank ? (done ? '#ffd54f' : '#fff') : '#f3e3e8',
              border: blank ? '2px dashed #c9a2b0' : '2px solid transparent',
              color: blank && !done ? '#9a8a96' : '#7a1f3d',
            },
          },
          done ? (solved[i] ?? '') : ch,
        );
      }),
    );
  };
  if (note) host.append(note);

  const share = panel.portions ? ([...portionCounts(panel, picture(panel)).values()][0] ?? 0) : 0;
  const portionBar = panel.portions
    ? h('div', {
        style: {
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: '13.5px',
          fontWeight: '700',
          margin: '0 0 6px',
        },
      })
    : null;
  const drawPortionBar = (): void => {
    if (!portionBar || !panel.portions) return;
    const counts = portionCounts(panel, grid);
    portionBar.replaceChildren(
      h('span', {}, `Share (${share} each):`),
      ...[...counts.entries()].map(([k, have]) =>
        h(
          'span',
          {
            style: {
              padding: '2px 8px',
              borderRadius: '6px',
              background: have === share ? '#e2f2dc' : have > share ? '#fde0dd' : '#f4efe6',
              color: have === share ? '#2f8a45' : have > share ? '#c23b33' : '#5a4a3a',
              border: `1.5px solid ${have === share ? '#4caf50' : have > share ? '#d9534f' : '#c9beae'}`,
            },
          },
          `${k}: ${have}/${share}`,
        ),
      ),
    );
  };
  if (portionBar) host.append(portionBar);

  // Paints (colour panels only).
  const bar =
    palette.length > 1
      ? h('div', { style: { display: 'flex', gap: '6px', margin: '0 0 8px' } })
      : null;
  const drawBar = (): void => {
    if (!bar) return;
    bar.replaceChildren(
      ...[...palette, '✕'].map((ch, i) => {
        const value = ch === '✕' ? CROSS : i + 1;
        return h(
          'button',
          {
            style: {
              width: '44px',
              height: '36px',
              background: ch === '✕' ? '#fff' : PAINT[ch],
              color: '#666',
              border: tool === value ? '3px solid #222' : '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '18px',
            },
            onclick: () => {
              tool = value;
              emitState();
              drawBar();
            },
          },
          ch === '✕' ? '✕' : '',
        );
      }),
    );
  };
  if (bar) host.append(bar);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(Wpx));
  svg.setAttribute('height', String(Hpx));
  svg.setAttribute('viewBox', `0 0 ${Wpx} ${Hpx}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(svg);

  const at = (e: PointerEvent): [number, number] | null => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * Wpx) / box.width - clueW;
    const y = ((e.clientY - box.top) * Hpx) / box.height - clueH;
    const r = Math.floor(y / cell);
    const cc = Math.floor(x / cell);
    return r >= 0 && r < H && cc >= 0 && cc < W ? [r, cc] : null;
  };
  let drag: { r: number; c: number; value: number; axis: 'row' | 'col' | null } | null = null;
  let lastPaintedCell: string | null = null;
  const prevDoneLines = new Set<string>();
  const paint = (r: number, cc: number, value: number): void => {
    if (lockedCells.has(`${r},${cc}`)) return;
    const row = grid[r] as number[];
    if (row[cc] === value) return;
    row[cc] = value;
    lastPaintedCell = value !== 0 ? `${r},${cc}` : null;
    blip(value > 0 ? 560 : value === CROSS ? 380 : 260, 25, 5);
  };
  svg.addEventListener('pointerdown', (e) => {
    if (done) return;
    const p = at(e);
    if (!p) return;
    const [r, cc] = p;
    if (lockedCells.has(`${r},${cc}`)) {
      blip(180, 70, 20);
      return;
    }
    const now = grid[r]?.[cc] ?? 0;
    // One colour: fill → cross → clear. Colours: the chosen paint, or clear if it's already that.
    const value =
      palette.length === 1 ? (now === 0 ? 1 : now === 1 ? CROSS : 0) : now === tool ? 0 : tool;
    drag = { r, c: cc, value, axis: null };
    paint(r, cc, value);
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer: no capture needed.
    }
    drawPortionBar();
    render();
  });
  svg.addEventListener('pointermove', (e) => {
    if (done || !drag) return;
    const p = at(e);
    if (!p) return;
    const [r, cc] = p;
    if (r === drag.r && cc === drag.c && !drag.axis) return;
    // The drag keeps to the row or column it first moves along.
    drag.axis ??= r === drag.r ? 'row' : 'col';
    if (drag.axis === 'row') paint(drag.r, cc, drag.value);
    else paint(r, drag.c, drag.value);
    drawPortionBar();
    render();
  });
  const launchBoardFireworks = (): void => {
    if (typeof requestAnimationFrame !== 'function') return;
    const painted: { r: number; cc: number; sym: string }[] = [];
    grid.forEach((row, r) =>
      row.forEach((v, cc) => {
        if (v > 0) {
          painted.push({ r, cc, sym: (palette[v - 1] as string) ?? '#' });
        }
      }),
    );
    if (!painted.length) return;

    // Pick up to 12 evenly-spaced painted squares across the board pattern as firework launch sites
    const maxBursts = Math.min(12, painted.length);
    const step = painted.length / maxBursts;
    const chosen = Array.from(
      { length: maxBursts },
      (_, idx) => painted[Math.floor(idx * step)] ?? painted[0],
    ).filter((x): x is { r: number; cc: number; sym: string } => x !== undefined);

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('style', 'pointer-events: none');
    svg.append(layer);

    interface Spark {
      cx: number;
      cy: number;
      vx: number;
      vy: number;
      col: string;
      delay: number;
      dur: number;
      size: number;
      line: SVGLineElement;
      head: SVGCircleElement;
    }
    interface Ring {
      cx: number;
      cy: number;
      col: string;
      delay: number;
      dur: number;
      el: SVGCircleElement;
    }
    const sparks: Spark[] = [];
    const rings: Ring[] = [];

    chosen.forEach((site, bIdx) => {
      const cx = clueW + site.cc * cell + cell / 2;
      const cy = clueH + site.r * cell + cell / 2;
      const tones = SPARK_PALETTE[site.sym] ?? SPARK_PALETTE['#'] ?? ['#ffd54f'];
      const delay = (site.r + site.cc) * 28 + bIdx * 24;

      const ringEl = document.createElementNS(NS, 'circle');
      ringEl.setAttribute('cx', String(cx));
      ringEl.setAttribute('cy', String(cy));
      ringEl.setAttribute('r', '1');
      ringEl.setAttribute('fill', 'none');
      ringEl.setAttribute('stroke', tones[0] ?? '#ffd54f');
      ringEl.setAttribute('stroke-width', '2.5');
      ringEl.setAttribute('opacity', '0');
      layer.append(ringEl);
      rings.push({ cx, cy, col: tones[0] ?? '#ffd54f', delay, dur: 460, el: ringEl });

      const count = 10;
      for (let k = 0; k < count; k++) {
        const angle = (k / count) * Math.PI * 2 + (bIdx % 2) * 0.31;
        const speed = cell * (0.95 + ((k * 7 + bIdx * 3) % 5) * 0.24);
        const col = tones[k % tones.length] ?? '#ffd54f';
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('stroke', col);
        line.setAttribute('stroke-width', '2.2');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', '0');
        const head = document.createElementNS(NS, 'circle');
        head.setAttribute('r', String(Math.max(1.8, cell * 0.075)));
        head.setAttribute('fill', col);
        head.setAttribute('opacity', '0');
        layer.append(line, head);
        sparks.push({
          cx,
          cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - cell * 0.18,
          col,
          delay,
          dur: 620 + (k % 3) * 70,
          size: Math.max(1.8, cell * 0.075),
          line,
          head,
        });
      }
    });

    setTimeout(() => blip(1560, 45, 4), 220);
    setTimeout(() => blip(1760, 45, 4), 420);

    const t0 = performance.now();
    const gravity = cell * 1.4;
    const tick = (now: number): void => {
      if (!svg.isConnected) return;
      if (!layer.isConnected) svg.append(layer);
      const elapsed = now - t0;
      let active = false;

      for (const rg of rings) {
        const dt = elapsed - rg.delay;
        if (dt < 0) {
          active = true;
          continue;
        }
        if (dt > rg.dur) {
          rg.el.setAttribute('opacity', '0');
          continue;
        }
        active = true;
        const p = dt / rg.dur;
        const ease = 1 - (1 - p) * (1 - p);
        rg.el.setAttribute('r', String(cell * (0.2 + ease * 0.95)));
        rg.el.setAttribute('opacity', String((1 - p) * 0.85));
      }

      for (const sp of sparks) {
        const dt = elapsed - sp.delay;
        if (dt < 0) {
          active = true;
          continue;
        }
        if (dt > sp.dur) {
          sp.line.setAttribute('opacity', '0');
          sp.head.setAttribute('opacity', '0');
          continue;
        }
        active = true;
        const p = dt / sp.dur;
        const s = dt / 1000;
        const sPrev = Math.max(0, (dt - 65) / 1000);
        const x = sp.cx + sp.vx * s;
        const y = sp.cy + sp.vy * s + 0.5 * gravity * s * s;
        const tx = sp.cx + sp.vx * sPrev;
        const ty = sp.cy + sp.vy * sPrev + 0.5 * gravity * sPrev * sPrev;
        const alpha = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
        sp.line.setAttribute('x1', String(tx));
        sp.line.setAttribute('y1', String(ty));
        sp.line.setAttribute('x2', String(x));
        sp.line.setAttribute('y2', String(y));
        sp.line.setAttribute('opacity', String(alpha * 0.9));
        sp.head.setAttribute('cx', String(x));
        sp.head.setAttribute('cy', String(y));
        sp.head.setAttribute('r', String(sp.size * (1 - p * 0.35)));
        sp.head.setAttribute('opacity', String(alpha));
      }

      if (active && elapsed < 1300) {
        requestAnimationFrame(tick);
      } else {
        layer.remove();
      }
    };
    requestAnimationFrame(tick);
  };

  const release = (): void => {
    if (done || !drag) return;
    drag = null;
    if (gridSolved(panel, grid)) {
      done = true;
      [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
      navigator.vibrate?.([20, 40, 20]);
      drawNote();
      drawPortionBar();
      render();
      launchBoardFireworks();
      hooks.solved();
      return;
    }
    emitState();
    drawPortionBar();
    render();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

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
    const label = (run: Run): string => run.letter ?? (run.hidden ? '?' : String(run.n));
    const tone = (run: Run, grey: boolean): string =>
      grey
        ? '#c4bfb6'
        : palette.length > 1
          ? (PAINT[palette[run.colour - 1] as string] as string)
          : '#2b2a33';

    // Concrete-clue lines that appear solved trigger auto-X on their remaining empty squares.
    const rowAuto = c.rows.map(
      (runs, r) => runs.every((run) => !run.hidden) && lineDone(runs, grid[r] as number[]),
    );
    const colAuto = c.cols.map(
      (runs, cc) =>
        runs.every((run) => !run.hidden) &&
        lineDone(
          runs,
          grid.map((row) => row[cc] ?? 0),
        ),
    );
    const isAutoX = (r: number, cc: number): boolean =>
      (grid[r]?.[cc] ?? 0) === 0 && Boolean(rowAuto[r] || colAuto[cc]);
    const effective = (r: number, cc: number): number => {
      const v = grid[r]?.[cc] ?? 0;
      return v !== 0 ? v : isAutoX(r, cc) ? CROSS : 0;
    };

    // Map each egg [r, cc, n] to which run index k in c.rows[r] covers (r, cc),
    // and compute its live fill/stroke colours.
    const sol = picture(panel);
    const eggStyle = (r: number, cc: number): { fill: string; stroke: string; right: boolean } => {
      const row = grid[r] ?? [];
      const atCell = effective(r, cc);
      const runs = c.rows[r] ?? [];
      const wantRun = runIndexAt(sol[r] ?? [], cc);
      const targetRun = runs[wantRun];
      const known = row.map((_, cIdx) => {
        const v = effective(r, cIdx);
        return v === CROSS ? 0 : v > 0 ? v : -1;
      });
      const validArrs = (arrangements(runs, known) ?? []).filter(
        (arr) => runIndexAt(arr, cc) === wantRun,
      );
      let segLen = 0;
      if (atCell > 0) {
        let segStart = cc;
        while (segStart > 0 && row[segStart - 1] === atCell) segStart--;
        let segEnd = cc;
        while (segEnd + 1 < W && row[segEnd + 1] === atCell) segEnd++;
        segLen = segEnd - segStart + 1;
      }
      const wrong =
        atCell === CROSS ||
        (row.some((v) => v !== 0) && validArrs.length === 0) ||
        (atCell > 0 &&
          (atCell !== (targetRun?.colour ?? 1) ||
            (!targetRun?.hidden && segLen > (targetRun?.n ?? 0))));
      const right =
        !wrong &&
        atCell > 0 &&
        (targetRun?.hidden ? runIndexAt(row, cc) === wantRun : segLen === (targetRun?.n ?? 0));
      const fill = done ? '#ffd54f' : wrong ? '#ff8a80' : right ? '#a5d6a7' : '#fff6dc';
      const stroke = done ? '#b28704' : wrong ? '#c62828' : right ? '#2e7d32' : '#c9a227';
      return { fill, stroke, right };
    };
    const clueEgg = new Map<string, [number, number, number]>();
    for (const egg of panel.eggs ?? []) {
      const [r, cc] = egg;
      const runIdx = runIndexAt(sol[r] ?? [], cc);
      if (runIdx >= 0) clueEgg.set(`${r},${runIdx}`, egg);
    }

    // Row clues, right-aligned against the grid (with an egg behind any egg-marked clue).
    c.rows.forEach((runs, r) => {
      const effRow = Array.from({ length: W }, (_, cc) => effective(r, cc));
      const grey = done || lineDone(runs, effRow);
      const lineKey = `r${r}`;
      const justMet = !done && grey && !prevDoneLines.has(lineKey);
      if (grey) prevDoneLines.add(lineKey);
      else prevDoneLines.delete(lineKey);
      runs.forEach((run, k) => {
        const cx = clueW - (runs.length - k - 0.5) * cell * 0.62;
        const cy = clueH + r * cell + cell / 2;
        const egg = clueEgg.get(`${r},${k}`);
        if (egg) {
          const { fill, stroke } = eggStyle(egg[0], egg[1]);
          add('ellipse', {
            cx,
            cy,
            rx: cell * 0.25,
            ry: cell * 0.32,
            fill,
            stroke,
            'stroke-width': 2,
          });
        }
        const clueEl = add(
          'text',
          {
            x: cx,
            y: clueH + r * cell + cell * 0.66,
            'text-anchor': 'middle',
            'font-size': cell * 0.46,
            'font-weight': 700,
            // On an egg, keep the run's red or blue (it's part of the clue); plain runs read dark on the egg.
            fill:
              egg && (grey || palette.length < 2)
                ? grey
                  ? '#7a6f5d'
                  : '#4a3a20'
                : tone(run, grey),
          },
          label(run),
        );
        if (justMet) {
          clueEl.setAttribute(
            'style',
            'transform-box: fill-box; transform-origin: center; animation: puzz-clue-met 0.32s cubic-bezier(0.22, 1.45, 0.36, 1) both;',
          );
        }
      });
    });
    c.cols.forEach((runs, cc) => {
      const effCol = Array.from({ length: H }, (_, r) => effective(r, cc));
      const grey = done || lineDone(runs, effCol);
      const lineKey = `c${cc}`;
      const justMet = !done && grey && !prevDoneLines.has(lineKey);
      if (grey) prevDoneLines.add(lineKey);
      else prevDoneLines.delete(lineKey);
      runs.forEach((run, k) => {
        const clueEl = add(
          'text',
          {
            x: clueW + cc * cell + cell / 2,
            y: clueH - (runs.length - k - 1) * cell * 0.62 - cell * 0.16,
            'text-anchor': 'middle',
            'font-size': cell * 0.46,
            'font-weight': 700,
            fill: tone(run, grey),
          },
          label(run),
        );
        if (justMet) {
          clueEl.setAttribute(
            'style',
            'transform-box: fill-box; transform-origin: center; animation: puzz-clue-met 0.32s cubic-bezier(0.22, 1.45, 0.36, 1) both;',
          );
        }
      });
    });
    grid.forEach((row, r) =>
      row.forEach((v, cc) => {
        const x = clueW + cc * cell;
        const y = clueH + r * cell;
        const fill = v > 0 ? (PAINT[palette[v - 1] as string] as string) : '#fbf8f2';
        const isJustPainted = !done && lastPaintedCell === `${r},${cc}` && v > 0;
        const rectEl = add('rect', {
          x: x + 0.5,
          y: y + 0.5,
          width: cell - 1,
          height: cell - 1,
          rx: done && v > 0 ? 3 : 0,
          fill,
          stroke: done && v > 0 ? '#ffd54f' : '#d9d0c0',
          'stroke-width': done && v > 0 ? 1.4 : 1,
        });
        if (isJustPainted) {
          rectEl.setAttribute(
            'style',
            'transform-box: fill-box; transform-origin: center; animation: puzz-tap-pop 0.17s cubic-bezier(0.22, 1.5, 0.36, 1) both;',
          );
        } else if (done && v > 0) {
          rectEl.setAttribute(
            'style',
            `transform-box: fill-box; transform-origin: center; animation: puzz-cell-pop 0.48s cubic-bezier(0.22, 1.35, 0.36, 1) ${(r + cc) * 28}ms both;`,
          );
          add('rect', {
            x: x + 2.5,
            y: y + 2.5,
            width: Math.max(2, cell - 5),
            height: Math.max(2, (cell - 5) * 0.32),
            rx: 2,
            fill: 'rgba(255, 255, 255, 0.22)',
          });
        }
        if (!done && v === CROSS) {
          const crossEl = add(
            'text',
            {
              x: x + cell / 2,
              y: y + cell * 0.68,
              'text-anchor': 'middle',
              'font-size': cell * 0.5,
              'font-weight': 700,
              fill: '#968d7e',
            },
            '✕',
          );
          if (lastPaintedCell === `${r},${cc}`) {
            crossEl.setAttribute(
              'style',
              'transform-box: fill-box; transform-origin: center; animation: puzz-tap-pop 0.17s cubic-bezier(0.22, 1.5, 0.36, 1) both;',
            );
          }
        } else if (!done && isAutoX(r, cc))
          add(
            'text',
            {
              x: x + cell / 2,
              y: y + cell * 0.66,
              'text-anchor': 'middle',
              'font-size': cell * 0.44,
              fill: '#d8d0c2',
            },
            '✕',
          );
      }),
    );
    lastPaintedCell = null;

    // Snowflakes: frosty frame, mirror line with ❄, and ghost mirror squares
    if (panel.frame) {
      const f = panel.frame;
      for (let r = f.top; r <= f.bottom; r++) {
        for (let cc = f.left; cc <= f.right; cc++) {
          const v = grid[r]?.[cc] ?? 0;
          if (v <= 0) continue;
          const [mr, mc] = mirrorSquare(f, r, cc);
          if ((grid[mr]?.[mc] ?? 0) > 0) continue;
          add('rect', {
            x: clueW + mc * cell + 3,
            y: clueH + mr * cell + 3,
            width: cell - 6,
            height: cell - 6,
            rx: 5,
            fill: 'rgba(90, 169, 230, 0.22)',
            stroke: '#5aa9e6',
            'stroke-width': 2,
            'stroke-dasharray': '4 3',
          });
        }
      }
      const fx = clueW + f.left * cell + 2;
      const fy = clueH + f.top * cell + 2;
      const fw = (f.right - f.left + 1) * cell - 4;
      const fh = (f.bottom - f.top + 1) * cell - 4;
      add('rect', {
        x: fx,
        y: fy,
        width: fw,
        height: fh,
        rx: 8,
        fill: 'none',
        stroke: '#5aa9e6',
        'stroke-width': 2.5,
        'stroke-dasharray': '7 5',
      });
      const vertical = f.axis === 'v';
      const mid = vertical
        ? clueW + ((f.left + f.right + 1) * cell) / 2
        : clueH + ((f.top + f.bottom + 1) * cell) / 2;
      const [x1, y1, x2, y2] = vertical ? [mid, fy, mid, fy + fh] : [fx, mid, fx + fw, mid];
      add('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: '#5aa9e6',
        'stroke-width': 1.8,
        'stroke-dasharray': '3 4',
      });
      for (const [x, y] of [
        [x1, y1],
        [x2, y2],
      ])
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

    // Fair shares: thick edges between portions.
    if (panel.portions)
      for (let r = 0; r < H; r++)
        for (let cc = 0; cc < W; cc++) {
          const mine = panel.portions[r]?.[cc];
          if (cc + 1 < W && panel.portions[r]?.[cc + 1] !== mine)
            add('line', {
              x1: clueW + (cc + 1) * cell,
              y1: clueH + r * cell,
              x2: clueW + (cc + 1) * cell,
              y2: clueH + (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
          if (r + 1 < H && panel.portions[r + 1]?.[cc] !== mine)
            add('line', {
              x1: clueW + cc * cell,
              y1: clueH + (r + 1) * cell,
              x2: clueW + (cc + 1) * cell,
              y2: clueH + (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
        }

    // Eggs inside the grid: just an unnumbered egg icon in the square.
    for (const [r, cc] of panel.eggs ?? []) {
      const x = clueW + cc * cell + cell / 2;
      const y = clueH + r * cell + cell / 2;
      const { fill, stroke } = eggStyle(r, cc);
      add('ellipse', {
        cx: x,
        cy: y,
        rx: cell * 0.22,
        ry: cell * 0.28,
        fill,
        stroke,
        'stroke-width': 2,
      });
      add('ellipse', {
        cx: x - cell * 0.06,
        cy: y - cell * 0.08,
        rx: cell * 0.06,
        ry: cell * 0.09,
        fill: 'rgba(255, 255, 255, 0.65)',
      });
    }
    // Thicker lines every five squares, to help counting.
    for (let k = 5; k < W; k += 5)
      add('line', {
        x1: clueW + k * cell,
        y1: clueH,
        x2: clueW + k * cell,
        y2: clueH + H * cell,
        stroke: '#9a9080',
        'stroke-width': 2,
      });
    for (let k = 5; k < H; k += 5)
      add('line', {
        x1: clueW,
        y1: clueH + k * cell,
        x2: clueW + W * cell,
        y2: clueH + k * cell,
        stroke: '#9a9080',
        'stroke-width': 2,
      });
    if (done)
      add('rect', {
        x: clueW,
        y: clueH,
        width: W * cell,
        height: H * cell,
        fill: 'none',
        stroke: '#ffd54f',
        'stroke-width': 5,
      });
    const allLinesDone =
      c.rows.every((runs, r) =>
        lineDone(
          runs,
          Array.from({ length: W }, (_, cc) => effective(r, cc)),
        ),
      ) &&
      c.cols.every((runs, cc) =>
        lineDone(
          runs,
          Array.from({ length: H }, (_, r) => effective(r, cc)),
        ),
      );
    const snowBad =
      !done && allLinesDone && Boolean(panel.frame && !frameSymmetric(panel.frame, grid));
    const portionsBad =
      !done &&
      allLinesDone &&
      Boolean(
        panel.portions && [...portionCounts(panel, grid).values()].some((have) => have !== share),
      );
    const eggsBad = !done && allLinesDone && Boolean(panel.eggs?.length && !eggsHold(panel, grid));
    hooks.status(
      done
        ? 'A picture!'
        : snowBad
          ? 'Every line matches, but the frosty frame isn’t a mirror image'
          : portionsBad
            ? 'Every line matches, but the portions don’t have equal shares'
            : eggsBad
              ? 'Every line matches, but an egg square doesn’t match its clue'
              : '',
    );
  };
  const giveHint = (): void => {
    if (done) return;
    const revealCell = (r: number, cc: number): void => {
      const truth = solGrid[r]?.[cc] ?? 0;
      (grid[r] as number[])[cc] = truth > 0 ? truth : CROSS;
      lockedCells.add(`${r},${cc}`);
      blip(640, 70, 10);
      if (gridSolved(panel, grid)) {
        done = true;
        [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
        navigator.vibrate?.([20, 40, 20]);
        drawNote();
        drawPortionBar();
        render();
        launchBoardFireworks();
        hooks.solved();
        return;
      }
      emitState();
      drawPortionBar();
      render();
    };

    // 1. Check if any cell is wrongly painted or wrongly X'd out
    for (let r = 0; r < H; r++) {
      for (let cc = 0; cc < W; cc++) {
        const cur = grid[r]?.[cc] ?? 0;
        const truth = solGrid[r]?.[cc] ?? 0;
        if ((cur === CROSS && truth > 0) || (cur > 0 && cur !== truth)) {
          revealCell(r, cc);
          return;
        }
      }
    }

    // 2. Otherwise reveal and lock one unrevealed painted cell (or empty cell if all painted are filled)
    for (let r = 0; r < H; r++) {
      for (let cc = 0; cc < W; cc++) {
        if ((grid[r]?.[cc] ?? 0) === 0 && (solGrid[r]?.[cc] ?? 0) > 0) {
          revealCell(r, cc);
          return;
        }
      }
    }
    for (let r = 0; r < H; r++) {
      for (let cc = 0; cc < W; cc++) {
        if ((grid[r]?.[cc] ?? 0) === 0 && !lockedCells.has(`${r},${cc}`)) {
          revealCell(r, cc);
          return;
        }
      }
    }
  };
  host.addEventListener('puzz:hint', giveHint);

  drawNote();
  drawPortionBar();
  drawBar();
  render();
  if (!done && gridSolved(panel, grid)) {
    done = true;
    drawNote();
    drawPortionBar();
    render();
    setTimeout(() => {
      if (!svg.isConnected) return;
      [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
      navigator.vibrate?.([20, 40, 20]);
      launchBoardFireworks();
      hooks.solved();
    }, 300);
  }
  return () => ({
    done,
    grid: grid.map((row) =>
      row.map((v) => (v === CROSS ? 'X' : v > 0 ? (palette[v - 1] ?? '#') : '.')).join(''),
    ),
  });
}
