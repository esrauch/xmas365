/**
 * The puzzle prototypes page: every puzzle by room, one at a time
 * (?p=<id>), with its rules, a reset, and a tick once solved (remembered in
 * this browser).
 */
import { type Proto, h } from './kit';
import { PROTOS } from './puzzles';

const nav = document.querySelector('nav');
const main = document.querySelector('main');
if (!nav || !main) throw new Error('puzzles.html is missing nav or main');

const DONE_KEY = 'puzz.proto.solved';
const done = new Set<string>(
  ((): string[] => {
    try {
      return JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  })(),
);
const remember = (): void => {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
  } catch {
    // No storage: ticks last for this visit.
  }
};

const ROOMS = [
  "Valentine's",
  'Easter',
  'Fourth of July',
  'Halloween',
  'Thanksgiving',
  'Christmas',
  'Holiday Hall',
  'Workshop',
];

function renderNav(current: string): void {
  if (!nav) return;
  nav.replaceChildren(h('h1', {}, 'Puzz · puzzle prototypes'));
  for (const room of ROOMS) {
    const list = PROTOS.filter((p) => p.room === room);
    if (!list.length) continue;
    nav.append(h('h2', {}, room));
    for (const p of list)
      nav.append(
        h(
          'a',
          {
            href: `?p=${p.id}`,
            class: [p.id === current ? 'on' : '', done.has(p.id) ? 'done' : ''].join(' '),
          },
          p.title,
          ' ',
          h('span', { class: 'tag' }, p.kind === 'stray' ? '' : `(${p.kind})`),
        ),
      );
  }
}

function show(p: Proto): void {
  if (!main) return;
  const status = h('span', { class: 'status' });
  const host = h('div', {});
  const mount = (): void => {
    host.replaceChildren();
    status.textContent = '';
    status.className = 'status';
    p.mount(host, {
      solved: () => {
        status.textContent = 'Solved!';
        status.className = 'status win';
        done.add(p.id);
        remember();
        renderNav(p.id);
      },
      status: (text) => {
        if (status.className.includes('win')) return;
        status.textContent = text;
      },
    });
  };
  main.replaceChildren(
    h('h1', {}, p.title),
    h('div', { class: 'meta' }, `${p.room} · ${p.kind} · from ${p.from}`),
    p.teaches
      ? h('details', { class: 'rules' }, h('summary', {}, 'Controls and rules'), p.rules)
      : h('div', { class: 'rules' }, p.rules),
    h('div', { class: 'bar' }, h('button', { onclick: mount }, 'Reset'), status),
    host,
  );
  mount();
}

const id = new URLSearchParams(location.search).get('p') ?? PROTOS[0]?.id ?? '';
const current = PROTOS.find((p) => p.id === id) ?? PROTOS[0];
renderNav(current?.id ?? '');
if (current) show(current);
