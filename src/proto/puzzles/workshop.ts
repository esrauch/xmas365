/**
 * The workshops: generate a new panel in the browser (one page per genre), with the same generator
 * the offline tool uses (src/gen/). Pick a difficulty and any twists, press
 * Generate, and play it. The seed is shown, so a panel you like can be made
 * again offline (tools/make-panels.ts --seed).
 */
import { type Panel as CarvePanel, twistsOf as carveTwists } from '../../gen/carving';
import { type Genre, cancelGenerating, generateInBrowser } from '../../gen/client';
import type { BoardShape, Tier } from '../../gen/core/spec';
import { type Panel as HopPanel, twistsOf as hopTwists } from '../../gen/hops';
import { type Panel as LightPanel, twistsOf as lightTwists } from '../../gen/lights';
import { type Panel as PicturePanel, twistsOf as pictureTwists } from '../../gen/pictures';
import { type Panel as WebPanel, twistsOf as webTwists } from '../../gen/webs';
import { type Panel as WordPanel, twistsOf as wordTwists } from '../../gen/words';
import { mountWeb } from '../hashiBoard';
import { mountHops } from '../hopsBoard';
import { type Proto, h } from '../kit';
import { mountLights } from '../netBoard';
import { mountPicture } from '../pictureBoard';
import { mountCarving } from '../shikakuBoard';
import { mountStrands } from '../strandsBoard';
import { formatPuzzleIdentity } from './clauses/types';

interface Workshop {
  genre: Genre;
  title: string;
  from: string;
  rules: string;
  shapes?: { id: BoardShape; label: string }[];
  twists: { id: string; label: string }[];
  twistsOf(panel: unknown): string[];
  mount(
    host: HTMLElement,
    panel: unknown,
    hooks: { solved(): void; status(text: string): void },
  ): () => unknown;
}

const WEBS: Workshop = {
  genre: 'webs',
  title: 'Web Workshop',
  from: 'Web, generated in the browser, with any mix of twists',
  rules:
    'Pick a difficulty and any twists, then Generate. Drag between knots to spin a thread (again for a double); tap a thread to cut it.',
  twists: [
    { id: 'dark', label: 'Spooky (Halloween): some knots show no number' },
    { id: 'letters', label: "Love-Letter (Valentine's): a message to fill in" },
    {
      id: 'colours',
      label: 'Patriotic (Fourth of July): threads join red to blue; white knots join anything',
    },
    { id: 'eggs', label: 'Egg-Hunt (Easter): threads from the spider’s home' },
    { id: 'cuts', label: 'Portioned (Thanksgiving): fences no thread may cross' },
    { id: 'snow', label: 'Snowflake (Christmas): the joins mirror; singles and doubles don’t' },
  ],
  twistsOf: (p) => webTwists(p as WebPanel),
  mount: (host, p, hooks) => mountWeb(host, { ...(p as WebPanel), name: 'Workshop Web' }, hooks),
};

const CARVING: Workshop = {
  genre: 'carving',
  title: 'Carving Workshop',
  from: 'Carving, generated in the browser, with any mix of twists',
  rules:
    'Pick a difficulty and any twists, then Generate. Drag from one square to another to carve a portion; tap a portion to lift it.',
  twists: [
    { id: 'dark', label: 'Spooky (Halloween): some sizes hidden' },
    {
      id: 'letters',
      label: "Love-Letter (Valentine's): some sizes are letters, with a message",
    },
    { id: 'colours', label: 'Patriotic (Fourth of July): same colors never touch' },
    { id: 'cuts', label: 'Portioned (Thanksgiving): fences no portion may cross' },
    {
      id: 'basket',
      label: 'Egg-Hunt (Easter): every portion gets an egg, a carrot and a chocolate',
    },
    { id: 'snow', label: 'Snowflake (Christmas): inside a frame, the cuts mirror' },
  ],
  twistsOf: (p) => carveTwists(p as CarvePanel),
  mount: (host, p, hooks) =>
    mountCarving(host, { ...(p as CarvePanel), name: 'Workshop Carving' }, hooks),
};

const keyOf = (genre: Genre): string => `puzz.workshop.${genre}`;
interface Choice {
  tier: Tier;
  shape?: BoardShape;
  twists: string[];
}
const load = (genre: Genre): Choice => {
  try {
    return {
      tier: 'easy',
      shape: 'rect',
      twists: [],
      ...(JSON.parse(localStorage.getItem(keyOf(genre)) ?? '{}') as Partial<Choice>),
    };
  } catch {
    return { tier: 'easy', shape: 'rect', twists: [] };
  }
};
const save = (genre: Genre, c: Choice): void => {
  try {
    localStorage.setItem(keyOf(genre), JSON.stringify(c));
  } catch {
    // No storage: the choice lasts for this visit.
  }
};

const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below (e.g. non-HTTPS LAN IPs).
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
};

const workshop = (id: string, w: Workshop): Proto => ({
  id,
  title: w.title,
  room: 'Workshop',
  kind: 'workshop',
  from: w.from,
  rules: w.rules,
  mount(host, ctx) {
    const choice = load(w.genre);
    const tier = h(
      'select',
      { style: { fontSize: '16px', padding: '4px' } },
      ...(['easy', 'medium', 'hard'] as const).map((t) =>
        h('option', { value: t, ...(t === choice.tier ? { selected: true } : {}) }, t),
      ),
    ) as HTMLSelectElement;
    const shapeSelect = w.shapes
      ? (h(
          'select',
          { style: { fontSize: '16px', padding: '4px', marginLeft: '6px' } },
          ...w.shapes.map((s) =>
            h(
              'option',
              { value: s.id, ...(s.id === (choice.shape ?? 'rect') ? { selected: true } : {}) },
              s.label,
            ),
          ),
        ) as HTMLSelectElement)
      : null;
    const boxes = w.twists.map((t) => {
      const box = h('input', {
        type: 'checkbox',
        ...(choice.twists.includes(t.id) ? { checked: true } : {}),
      }) as HTMLInputElement;
      return {
        id: t.id,
        box,
        row: h('label', { style: { display: 'block', margin: '4px 0' } }, box, ' ', t.label),
      };
    });
    const go = h('button', { style: { fontSize: '17px', padding: '8px 18px' } }, 'Generate');
    const copyBtn = h(
      'button',
      { style: { fontSize: '17px', padding: '8px 18px', marginLeft: '8px' }, disabled: true },
      'Copy state',
    ) as HTMLButtonElement;
    const info = h('div', { style: { minHeight: '1.4em', margin: '8px 0', color: '#6b5f52' } });
    const board = h('div', { style: { maxWidth: '560px' } });

    const stop = h(
      'button',
      { style: { fontSize: '17px', padding: '8px 18px', marginLeft: '8px', display: 'none' } },
      'Cancel',
    );
    let ticking = 0;
    let currentMeta: {
      tier: Tier;
      shape?: BoardShape;
      twists: string[];
      seed: number;
      stats: Record<string, number>;
      panel: unknown;
    } | null = null;
    let getState: (() => unknown) | null = null;
    let lastStatus = '';

    const busy = (on: boolean): void => {
      go.toggleAttribute('disabled', on);
      stop.style.display = on ? '' : 'none';
      clearInterval(ticking);
    };

    const generateNow = async (): Promise<void> => {
      const pickedShape = shapeSelect ? (shapeSelect.value as BoardShape) : undefined;
      const spec: Choice = {
        tier: tier.value as Tier,
        ...(pickedShape && pickedShape !== 'rect' ? { shape: pickedShape } : {}),
        twists: boxes.filter((b) => b.box.checked).map((b) => b.id),
      };
      save(w.genre, spec);
      board.replaceChildren();
      currentMeta = null;
      getState = null;
      lastStatus = '';
      copyBtn.disabled = true;
      busy(true);
      const began = performance.now();
      info.textContent = 'Generating…';
      ticking = window.setInterval(() => {
        info.textContent = `Generating… ${((performance.now() - began) / 1000).toFixed(1)} s`;
      }, 100);
      const reply = await generateInBrowser({
        genre: w.genre,
        spec,
        seconds: 8,
        seed: Math.floor(Math.random() * 1e9),
      });
      busy(false);
      const { made, ms } = reply;
      if (!made) {
        info.textContent = `Nothing found in ${ms} ms (${reply.rejected || 'no attempts'}). Try again, or fewer twists.`;
        return;
      }
      const on = w.twistsOf(made.panel);
      const identity = formatPuzzleIdentity(w.genre, on);
      const shapeTag = spec.shape && spec.shape !== 'rect' ? ` · ${spec.shape}` : '';
      info.textContent = `${identity.dualLabel} · Made in ${ms} ms · seed ${made.seed} · ${spec.tier}${shapeTag} · ${Object.entries(
        made.stats,
      )
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}`;
      currentMeta = {
        tier: spec.tier,
        ...(spec.shape ? { shape: spec.shape } : {}),
        twists: on,
        seed: made.seed,
        stats: made.stats,
        panel: made.panel,
      };
      copyBtn.disabled = false;
      getState = w.mount(board, made.panel, {
        solved: () => ctx.solved(),
        status: (text) => {
          lastStatus = text;
          ctx.status(text);
        },
      });
    };
    copyBtn.addEventListener('click', () => {
      if (!currentMeta) return;
      const payload = JSON.stringify(
        {
          genre: w.genre,
          tier: currentMeta.tier,
          ...(currentMeta.shape ? { shape: currentMeta.shape } : {}),
          twists: currentMeta.twists,
          seed: currentMeta.seed,
          stats: currentMeta.stats,
          status: lastStatus,
          panel: currentMeta.panel,
          state: getState ? getState() : null,
        },
        null,
        2,
      );
      void copyText(payload).then((ok) => {
        copyBtn.textContent = ok ? 'Copied!' : 'Copy failed';
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy state';
        }, 1500);
      });
    });
    stop.addEventListener('click', () => {
      cancelGenerating();
      busy(false);
      info.textContent = 'Cancelled.';
    });
    go.addEventListener('click', () => void generateNow());
    host.append(
      h(
        'div',
        { style: { margin: '0 0 6px' } },
        'Difficulty ',
        tier,
        ...(shapeSelect ? [' · Shape ', shapeSelect] : []),
      ),
      ...boxes.map((b) => b.row),
      h('div', { style: { margin: '8px 0' } }, go, stop, copyBtn),
      info,
      board,
    );
    void generateNow();
  },
});

const WORDS: Workshop = {
  genre: 'words',
  title: 'Heartstrings Workshop',
  from: 'Heartstrings, generated in the browser, with any mix of twists',
  rules:
    'Pick a difficulty and any twists, then Generate. Drag through touching letters (diagonals too) to find the theme words. Every word starts on a ringed letter, and every letter is in one.',
  twists: [
    { id: 'dark', label: 'Spooky (Halloween): a few letters hidden' },
    { id: 'letters', label: "Love-Letter (Valentine's): some letters written as numbers" },
    {
      id: 'colours',
      label: 'Patriotic (Fourth of July): bows; same colors never touch',
    },
    { id: 'eggs', label: 'Egg-Hunt (Easter): a letter’s place in its word' },
    {
      id: 'cuts',
      label: 'Portioned (Thanksgiving): fences no word steps across',
    },
    { id: 'snow', label: 'Snowflake (Christmas): words in mirror pairs inside a frame' },
  ],
  twistsOf: (p) => wordTwists(p as WordPanel),
  mount: (host, p, hooks) =>
    mountStrands(host, { ...(p as WordPanel), name: 'Workshop Heartstrings' }, hooks),
};

export const webWorkshop = workshop('webworkshop', WEBS);
export const wordsWorkshop = workshop('wordsworkshop', WORDS);
export const carvingWorkshop = workshop('carvingworkshop', CARVING);

const HOPS: Workshop = {
  genre: 'hops',
  title: 'Hops Workshop',
  from: 'Hops, generated in the browser, with any mix of twists',
  rules:
    'Pick a difficulty and any twists, then Generate. Drag through neighboring spots to lay the bunny’s trail; tap the bunny to step back.',
  shapes: [
    { id: 'rect', label: 'Lawn (rectangle)' },
    { id: 'tree', label: 'Tree (★ Golden Egg at top)' },
  ],
  twists: [
    { id: 'courses', label: 'Portioned (Thanksgiving): finish each portion before the next' },
    {
      id: 'colours',
      label:
        'Patriotic (Fourth of July): two bunnies, each over its own color; white goes to either',
    },
    { id: 'burrows', label: 'Egg-Hunt (Easter): underground hops between burrows' },
    { id: 'snow', label: 'Snowflake (Christmas): inside a frame, the trail mirrors' },
    {
      id: 'letters',
      label: "Love-Letter (Valentine's): eggs with letters; a message to fill in",
    },
    { id: 'dark', label: 'Spooky (Halloween): rocks hidden in shadow' },
  ],
  twistsOf: (p) => hopTwists(p as HopPanel),
  mount: (host, p, hooks) => mountHops(host, { ...(p as HopPanel), name: 'Workshop Hops' }, hooks),
};

export const hopsWorkshop = workshop('hopsworkshop', HOPS);

const LIGHTS: Workshop = {
  genre: 'lights',
  title: 'Lights Workshop',
  from: 'Lights, generated in the browser, with any mix of twists',
  rules:
    'Pick a difficulty and any twists, then Generate. Tap a piece to turn it a quarter clockwise. Power spreads from the plug to light every square.',
  shapes: [
    { id: 'rect', label: 'Square' },
    { id: 'tree', label: 'Christmas Tree (★ star at top)' },
    { id: 'egg', label: 'Easter Egg' },
    { id: 'pie', label: 'Pie' },
    { id: 'wreath', label: 'Wreath (ring)' },
  ],
  twists: [
    { id: 'snow', label: 'Snowflake (Christmas): inside a frame, wires mirror' },
    { id: 'dark', label: 'Spooky (Halloween): pieces stay dark until solved' },
    {
      id: 'letters',
      label: "Love-Letter (Valentine's): letter bulbs whose distances match message blanks",
    },
    { id: 'eggs', label: 'Egg-Hunt (Easter): power reaches each egg in its step count' },
    {
      id: 'colours',
      label: 'Patriotic (Fourth of July): red and blue strings from separate plugs',
    },
    {
      id: 'slices',
      label: 'Portioned (Thanksgiving): pie slices with one feed each, no crossing slice walls',
    },
  ],
  twistsOf: (p) => lightTwists(p as LightPanel),
  mount: (host, p, hooks) =>
    mountLights(host, { ...(p as LightPanel), name: 'Workshop Lights' }, hooks),
};

export const lightsWorkshop = workshop('lightsworkshop', LIGHTS);

const PICTURES: Workshop = {
  genre: 'pictures',
  title: 'Fireworks Workshop',
  from: 'Fireworks, generated in the browser, with any mix of twists',
  rules:
    'Pick a difficulty and any twists, then Generate. Tap to fill, cross out, or clear (or pick a paint in color); drag along a row or column to paint a run.',
  twists: [
    { id: 'dark', label: 'Spooky (Halloween): some run clues hidden (?)' },
    {
      id: 'letters',
      label: "Love-Letter (Valentine's): some run clues are letters, with a message",
    },
    {
      id: 'colours',
      label: 'Patriotic (Fourth of July): red and blue runs; different colors can touch',
    },
    {
      id: 'eggs',
      label: 'Egg-Hunt (Easter): an egg on a row clue marks which run covers the egg square',
    },
    {
      id: 'portions',
      label: 'Portioned (Thanksgiving): every outlined portion holds the same filled squares',
    },
    { id: 'snow', label: 'Snowflake (Christmas): inside a frame, the filled squares mirror' },
  ],
  twistsOf: (p) => pictureTwists(p as PicturePanel),
  mount: (host, p, hooks) =>
    mountPicture(host, { ...(p as PicturePanel), name: 'Workshop Fireworks' }, hooks),
};

export const picturesWorkshop = workshop('picturesworkshop', PICTURES);
