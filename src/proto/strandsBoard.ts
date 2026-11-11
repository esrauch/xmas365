/**
 * The clicky Strands panel: drag through touching letters (diagonals too)
 * to spell a word; slide back to undo the last letter; let go to check it.
 * Each word's first letter is ringed (the spangram's in gold) until the word
 * is found, then the ring fades.
 * A theme word locks in (blue; the spangram gold) and chimes; anything else
 * shakes. The word builds above the board as you drag. Dark letters show as
 * blanks, coded letters as their number, until a word through them is found
 * (a coded letter is then revealed everywhere, and in the key).
 */
import { blip, getBoardPersistence } from './kit';
import {
  type Panel,
  type Spot,
  find,
  key,
  letterAt,
  placeIn,
  stepBlocked,
  touching,
  wallSet,
} from '../gen/words';

const NS = 'http://www.w3.org/2000/svg';

export interface StrandsHooks {
  solved(): void;
  status(text: string): void;
}

export function mountStrands(host: HTMLElement, panel: Panel, hooks: StrandsHooks): () => unknown {
  const H = panel.rows.length;
  const Wd = panel.rows[0]?.length ?? 0;
  const avail = Math.min(host.clientWidth || 360, 480);
  const cell = Math.max(40, Math.min(64, Math.floor((avail - 8) / Wd)));
  const W = Wd * cell;
  const Hpx = H * cell;
  const found = new Set<number>();
  /** Each word's first square (highlighted until the word is found) → the word. */
  const starts = new Map(
    panel.words.flatMap((w, i) => (w.cells[0] ? [[key(w.cells[0]), i] as const] : [])),
  );
  const dark = new Set((panel.dark ?? []).map(key));
  const eggs = new Set((panel.eggs ?? []).map(key));
  const walls = wallSet(panel.walls);
  const code = panel.code ?? '';
  let path: Spot[] = [];
  let shake = 0;
  let hintedWord: number | null = null;
  let lastFoundWord: number | null = null;

  const persist = getBoardPersistence(host);
  try {
    const init = persist?.initialState as { found?: unknown; hintedWord?: unknown } | undefined;
    if (init && Array.isArray(init.found)) {
      const cand = new Set<number>();
      let valid = true;
      for (const idx of init.found) {
        if (
          typeof idx !== 'number' ||
          !Number.isInteger(idx) ||
          idx < 0 ||
          idx >= panel.words.length
        ) {
          valid = false;
          break;
        }
        cand.add(idx);
      }
      if (valid && cand.size < panel.words.length) {
        for (const idx of cand) found.add(idx);
        if (
          typeof init.hintedWord === 'number' &&
          Number.isInteger(init.hintedWord) &&
          init.hintedWord >= 0 &&
          init.hintedWord < panel.words.length &&
          !found.has(init.hintedWord)
        ) {
          hintedWord = init.hintedWord;
        }
      }
    }
  } catch {
    // Abandon invalid or stale board state.
  }

  const top = document.createElement('div');
  Object.assign(top.style, { margin: '0 0 6px' });
  const theme = document.createElement('div');
  theme.textContent = `Theme: ${panel.theme}`;
  Object.assign(theme.style, { fontSize: '15px', fontWeight: '700' });
  const building = document.createElement('div');
  Object.assign(building.style, {
    minHeight: '30px',
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '3px',
    color: '#7a1f3d',
  });
  const keyLine = document.createElement('div');
  Object.assign(keyLine.style, {
    fontSize: '14.5px',
    margin: '2px 0',
    fontWeight: '600',
    color: '#5a4a52',
  });
  top.append(theme, keyLine, building);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(Hpx));
  svg.setAttribute('viewBox', `0 0 ${W} ${Hpx}`);
  Object.assign(svg.style, { touchAction: 'none', userSelect: 'none', display: 'block' });
  host.append(top, svg);

  /** Squares in found words. */
  const foundCells = (): Set<string> =>
    new Set([...found].flatMap((i) => (panel.words[i]?.cells ?? []).map(key)));
  /** Squares in the currently hinted word. */
  const hintedCells = (): Set<string> =>
    hintedWord !== null && !found.has(hintedWord)
      ? new Set((panel.words[hintedWord]?.cells ?? []).map(key))
      : new Set<string>();
  /** Coded letters revealed (by a found word through one). */
  const revealed = (): Set<string> => {
    const out = new Set<string>();
    for (const k of [...foundCells(), ...hintedCells()]) {
      const [r, c] = k.split(',').map(Number) as Spot;
      out.add(letterAt(panel, [r, c]));
    }
    return out;
  };
  /** What a square shows: its letter, a blank in the dark, or its code number. */
  const shown = (s: Spot): string => {
    const letter = letterAt(panel, s);
    const isFoundOrHinted = foundCells().has(key(s)) || hintedCells().has(key(s));
    if (dark.has(key(key(s) ? s : s)) && !isFoundOrHinted) return '?';
    const n = code.indexOf(letter);
    if (n >= 0 && !revealed().has(letter)) return String(n + 1);
    return letter;
  };

  const at = (e: PointerEvent, strict: boolean): Spot | null => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const y = ((e.clientY - box.top) * Hpx) / box.height;
    const r = Math.floor(y / cell);
    const c = Math.floor(x / cell);
    if (r < 0 || r >= H || c < 0 || c >= Wd) return null;
    // While dragging, only count a square near its middle, so diagonals are easy to hit.
    if (strict && Math.hypot(x - (c + 0.5) * cell, y - (r + 0.5) * cell) > cell * 0.4) return null;
    return foundCells().has(key([r, c])) ? null : [r, c];
  };

  svg.addEventListener('pointerdown', (e) => {
    const s = at(e, false);
    if (!s) return;
    path = [s];
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer: no capture needed.
    }
    blip(600, 20);
    render();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!path.length) return;
    const s = at(e, true);
    if (!s) return;
    const last = path[path.length - 1] as Spot;
    if (key(s) === key(last)) return;
    const back = path[path.length - 2];
    if (back && key(back) === key(s)) path.pop();
    else if (
      touching(last, s) &&
      !stepBlocked(walls, last, s) &&
      !path.some((x) => key(x) === key(s))
    )
      path.push(s);
    else return;
    blip(600 + path.length * 40, 20);
    render();
  });
  const launchStrandsCelebration = (): void => {
    if (typeof requestAnimationFrame !== 'function') return;
    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('style', 'pointer-events: none');
    svg.append(layer);

    interface HeartFloat {
      cx: number;
      cy: number;
      amp: number;
      freq: number;
      phase: number;
      rise: number;
      delay: number;
      dur: number;
      el: SVGTextElement;
    }
    const floats: HeartFloat[] = [];
    const HEART_TONES = ['#e91e63', '#ff5252', '#ffd54f', '#ff80ab'];

    panel.words.forEach((w, wIdx) => {
      const isSpan = Boolean(panel.spangram && wIdx === 0);
      w.cells.forEach(([r, c], cIdx) => {
        if (!isSpan && cIdx % 2 !== 0 && cIdx !== w.cells.length - 1) return;
        const cx = c * cell + cell / 2;
        const cy = r * cell + cell / 2;
        const delay = wIdx * 55 + cIdx * 35;
        const el = document.createElementNS(NS, 'text');
        el.textContent = isSpan && cIdx % 2 === 1 ? '✦' : '♥';
        el.setAttribute('text-anchor', 'middle');
        el.setAttribute('font-size', String(cell * (isSpan ? 0.34 : 0.28)));
        el.setAttribute(
          'fill',
          isSpan ? '#f59f00' : (HEART_TONES[(wIdx + cIdx) % HEART_TONES.length] ?? '#e91e63'),
        );
        el.setAttribute('opacity', '0');
        layer.append(el);
        floats.push({
          cx,
          cy: cy - cell * 0.12,
          amp: cell * (0.12 + (cIdx % 2) * 0.06),
          freq: 5 + (cIdx % 3),
          phase: wIdx * 1.1 + cIdx * 0.8,
          rise: cell * (0.85 + (cIdx % 3) * 0.15),
          delay,
          dur: 680,
          el,
        });
      });
    });

    const t0 = performance.now();
    const tick = (now: number): void => {
      if (!svg.isConnected) return;
      if (!layer.isConnected) svg.append(layer);
      const elapsed = now - t0;
      let active = false;
      for (const fl of floats) {
        const dt = elapsed - fl.delay;
        if (dt < 0) {
          active = true;
          continue;
        }
        if (dt > fl.dur) {
          fl.el.setAttribute('opacity', '0');
          continue;
        }
        active = true;
        const p = dt / fl.dur;
        const x = fl.cx + Math.sin(p * fl.freq + fl.phase) * fl.amp;
        const y = fl.cy - p * fl.rise;
        const alpha = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
        fl.el.setAttribute('x', String(x));
        fl.el.setAttribute('y', String(y));
        fl.el.setAttribute('opacity', String(alpha * 0.92));
      }
      if (active && elapsed < 1200) {
        requestAnimationFrame(tick);
      } else {
        layer.remove();
      }
    };
    requestAnimationFrame(tick);
  };

  const release = (): void => {
    if (!path.length) return;
    const i = find(panel, path);
    if (i >= 0 && !found.has(i)) {
      found.add(i);
      lastFoundWord = i;
      blip(880, 120, 15);
      if (found.size === panel.words.length) {
        [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
        navigator.vibrate?.([20, 40, 20]);
        path = [];
        render();
        launchStrandsCelebration();
        hooks.solved();
        return;
      }
      persist?.onChange({ found: [...found], hintedWord });
    } else if (path.length > 1) {
      shake = 6;
      blip(150, 120, 40);
      setTimeout(() => {
        shake = 0;
        render();
      }, 220);
    }
    path = [];
    render();
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  /** Colours: a letter's tint (plain letters white), and a ring in its colour (red, white and blue; red and green in older panels). */
  const TINTS: Record<string, string> = { r: '#fde0dd', g: '#dff3df', b: '#dde6fb' };
  const RINGS: Record<string, string> = { r: '#d9534f', g: '#43a35c', b: '#3c5aa6' };
  // With bows, only the bowed letters show their colour.
  const bowed = new Set((panel.bows ?? []).map(key));
  const shows = (s: Spot): boolean => !panel.bows || bowed.has(key(s));
  const tint = ([r, c]: Spot): string =>
    (shows([r, c]) ? TINTS[panel.colours?.[r]?.[c] ?? ''] : undefined) ?? '#fff';
  const ring = ([r, c]: Spot): string =>
    (shows([r, c]) ? RINGS[panel.colours?.[r]?.[c] ?? ''] : undefined) ?? '#d8d0dc';
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
    const centre = ([r, c]: Spot): [number, number] => [
      c * cell + cell / 2 + shake,
      r * cell + cell / 2,
    ];
    const strand = (cells: Spot[], colour: string): void => {
      for (let i = 1; i < cells.length; i++) {
        const [x1, y1] = centre(cells[i - 1] as Spot);
        const [x2, y2] = centre(cells[i] as Spot);
        add('line', {
          x1,
          y1,
          x2,
          y2,
          stroke: colour,
          'stroke-width': cell * 0.32,
          'stroke-linecap': 'round',
        });
      }
    };
    const colourOf = (i: number): string => (panel.spangram && i === 0 ? '#f5c542' : '#8ec5ff');
    // Fair shares: thick edges between portions.
    if (panel.portions)
      for (let r = 0; r < H; r++)
        for (let c = 0; c < Wd; c++) {
          const mine = panel.portions[r]?.[c];
          if (c + 1 < Wd && panel.portions[r]?.[c + 1] !== mine)
            add('line', {
              x1: (c + 1) * cell,
              y1: r * cell,
              x2: (c + 1) * cell,
              y2: (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
          if (r + 1 < H && panel.portions[r + 1]?.[c] !== mine)
            add('line', {
              x1: c * cell,
              y1: (r + 1) * cell,
              x2: (c + 1) * cell,
              y2: (r + 1) * cell,
              stroke: '#b07a2a',
              'stroke-width': 4,
            });
        }
    // Snowflakes: the frosty frame and its mirror line, and a ghost of each found word's
    // mirror squares until the word that lies there is found too.
    if (panel.frame) {
      const f = panel.frame;
      const [fx, fy] = [f.left * cell + 2, f.top * cell + 2];
      const [fw, fh] = [(f.right - f.left + 1) * cell - 4, (f.bottom - f.top + 1) * cell - 4];
      add('rect', {
        x: fx,
        y: fy,
        width: fw,
        height: fh,
        rx: 12,
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
      const foundSquares = foundCells();
      for (const i of found) {
        const cells = panel.words[i]?.cells ?? [];
        if (!cells.every(([r, c]) => r >= f.top && r <= f.bottom && c >= f.left && c <= f.right))
          continue;
        const mirror = cells.map(([r, c]): Spot =>
          vertical ? [r, f.left + f.right - c] : [f.top + f.bottom - r, c],
        );
        if (mirror.every((s) => foundSquares.has(key(s)))) continue;
        for (const [r, c] of mirror)
          add('rect', {
            x: c * cell + 5,
            y: r * cell + 5,
            width: cell - 10,
            height: cell - 10,
            rx: 9,
            fill: 'rgba(111, 184, 232, 0.12)',
            stroke: '#6fb8e8',
            'stroke-width': 2,
            'stroke-dasharray': '4 4',
          });
      }
    }
    // Cuts: fences on the squares' edges.
    for (const [r, c, side] of panel.walls ?? []) {
      const [x1, y1, x2, y2] =
        side === 'v'
          ? [(c + 1) * cell, r * cell + 4, (c + 1) * cell, (r + 1) * cell - 4]
          : [c * cell + 4, (r + 1) * cell, (c + 1) * cell - 4, (r + 1) * cell];
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
    for (const i of found) strand(panel.words[i]?.cells ?? [], colourOf(i));
    if (hintedWord !== null && !found.has(hintedWord)) {
      for (const [r, c] of panel.words[hintedWord]?.cells ?? []) {
        add('rect', {
          x: c * cell + 4,
          y: r * cell + 4,
          width: cell - 8,
          height: cell - 8,
          rx: 10,
          fill: 'rgba(245, 197, 66, 0.18)',
          stroke: '#d69e2e',
          'stroke-width': 2.5,
          'stroke-dasharray': '5 4',
        });
      }
    }
    strand(path, '#c9b6e8');
    const isAllSolved = found.size === panel.words.length;
    const inFound = new Map<string, number>();
    const cellStepInWord = new Map<string, number>();
    for (const i of found) {
      (panel.words[i]?.cells ?? []).forEach((s, idx) => {
        inFound.set(key(s), i);
        cellStepInWord.set(key(s), idx);
      });
    }
    const inPath = new Set(path.map(key));
    for (let r = 0; r < H; r++)
      for (let c = 0; c < Wd; c++) {
        const s: Spot = [r, c];
        const [x, y] = centre(s);
        const f = inFound.get(key(s));
        const text = shown(s);
        const isDark = text === '?';
        const coded = /[0-9]/.test(text);
        // A word's first letter is ringed until the word is found, then the ring fades.
        const startOf = starts.get(key(s));
        if (startOf !== undefined && (!found.has(startOf) || startOf === lastFoundWord)) {
          const ringEl = add('circle', {
            cx: x,
            cy: y,
            r: cell * 0.44,
            fill: 'none',
            stroke: panel.spangram && startOf === 0 ? '#d4a017' : '#e0457b',
            'stroke-width': 3,
          });
          if (found.has(startOf))
            ringEl.setAttribute('style', 'animation: puzz-start-fade 0.6s ease-out both;');
        }
        const circEl = add('circle', {
          cx: x,
          cy: y,
          r: cell * 0.36,
          fill:
            f !== undefined
              ? colourOf(f)
              : inPath.has(key(s))
                ? '#c9b6e8'
                : isDark
                  ? '#3a3340'
                  : coded
                    ? '#fde7ef'
                    : tint(s),
          stroke: coded
            ? '#c2185b'
            : isAllSolved && f === 0 && panel.spangram
              ? '#b28704'
              : panel.colours
                ? ring(s)
                : 'none',
          'stroke-width': 2,
        });
        const textEl = add(
          'text',
          {
            x,
            y: y + cell * 0.13,
            'text-anchor': 'middle',
            'font-size': cell * 0.38,
            'font-weight': 700,
            fill: isDark ? '#bfb4cc' : coded ? '#c2185b' : '#2a2230',
          },
          text,
        );
        if (isAllSolved && f !== undefined) {
          const delay = f * 55 + (cellStepInWord.get(key(s)) ?? 0) * 35;
          const animStyle = `transform-box: fill-box; transform-origin: center; animation: puzz-strand-pop 0.46s cubic-bezier(0.22, 1.35, 0.36, 1) ${delay}ms both;`;
          circEl.setAttribute('style', animStyle);
          textEl.setAttribute('style', animStyle);
        } else if (!isAllSolved && f !== undefined && f === lastFoundWord) {
          const delay = (cellStepInWord.get(key(s)) ?? 0) * 30;
          const animStyle = `transform-box: fill-box; transform-origin: center; animation: puzz-clue-met 0.3s cubic-bezier(0.22, 1.45, 0.36, 1) ${delay}ms both;`;
          circEl.setAttribute('style', animStyle);
          textEl.setAttribute('style', animStyle);
        } else if (
          !isAllSolved &&
          path.length > 0 &&
          key(path[path.length - 1] as Spot) === key(s)
        ) {
          const animStyle =
            'transform-box: fill-box; transform-origin: center; animation: puzz-tap-pop 0.16s cubic-bezier(0.22, 1.5, 0.36, 1) both;';
          circEl.setAttribute('style', animStyle);
          textEl.setAttribute('style', animStyle);
        }
        if (eggs.has(key(s))) {
          add('ellipse', {
            cx: x + cell * 0.3,
            cy: y - cell * 0.28,
            rx: cell * 0.13,
            ry: cell * 0.16,
            fill: '#fff3c4',
            stroke: '#c9a227',
            'stroke-width': 1.5,
          });
          add(
            'text',
            {
              x: x + cell * 0.3,
              y: y - cell * 0.23,
              'text-anchor': 'middle',
              'font-size': cell * 0.17,
              'font-weight': 700,
              fill: '#7a5a00',
            },
            String(placeIn(panel, s)),
          );
        }
      }
    building.textContent = path.map(shown).join('');
    if (code)
      keyLine.textContent = `Key: ${[...code]
        .map((letter, i) => `${i + 1} = ${revealed().has(letter) ? letter : '?'}`)
        .join(' · ')}`;
    // Once solved, the run's own message stands.
    if (found.size < panel.words.length)
      hooks.status(
        `${found.size} of ${panel.words.length} theme words${panel.spangram && !found.has(0) ? ' (one is a spangram, side to side, from the gold ring)' : ''}`,
      );
    lastFoundWord = null;
  };

  const giveHint = (): void => {
    if (found.size >= panel.words.length) return;
    // 2nd click on the currently hinted word: auto-trace and lock it in
    if (hintedWord !== null && !found.has(hintedWord)) {
      found.add(hintedWord);
      lastFoundWord = hintedWord;
      hintedWord = null;
      path = [];
      blip(880, 120, 15);
      if (found.size === panel.words.length) {
        [660, 880, 1100, 1320].forEach((f, k) => setTimeout(() => blip(f, 150), k * 110));
        navigator.vibrate?.([20, 40, 20]);
        render();
        launchStrandsCelebration();
        hooks.solved();
        return;
      }
      persist?.onChange({ found: [...found], hintedWord });
      render();
      return;
    }

    // 1st click: pick an unfound word (preferring non-spangram theme words first) and outline its squares
    const order = panel.words.map((_, i) => i);
    if (panel.spangram && order.length > 1) {
      order.push(order.shift() as number);
    }
    const nextWord = order.find((i) => !found.has(i));
    if (nextWord !== undefined) {
      hintedWord = nextWord;
      blip(620, 70, 10);
      persist?.onChange({ found: [...found], hintedWord });
      render();
    }
  };
  host.addEventListener('puzz:hint', giveHint);

  render();
  return () => ({
    done: found.size === panel.words.length,
    foundWords: [...found].map((i) => panel.words[i]?.word),
    currentPath: [...path],
  });
}
