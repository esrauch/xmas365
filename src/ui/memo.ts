/**
 * Xmas365's memos, drawn as typed sheets of memo paper (`SCRIPT.md`): the
 * company letterhead, a rubber stamp for the kind of memo, TO / FROM / RE in
 * typewriter type, the body, Santa's sign-off, and a sticky note: Leap Day's
 * reaction on the opening memo, a caged mascot's plea on a room's memo. A new memo fills the screen (`showMemoOverlay`); the hall
 * corkboard reads old ones with the same sheet (`buildMemoSheet`).
 * Styles: `.memo-*` in `ui/base.css`.
 */
import { type MemoSpec, SPEAKERS, formatMemoText } from '../content/script';
import { h } from '../proto/kit';

/** Inline `**bold**`, `*italic*` and ` / ` line breaks (`SCRIPT.md`) as DOM nodes. */
export function renderFormattedText(raw: string): HTMLElement {
  const container = h('span', {});
  raw.split(' / ').forEach((line, i) => {
    if (i > 0) container.append(h('br', {}));
    for (const tok of line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)) {
      if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4)
        container.append(h('strong', {}, tok.slice(2, -2)));
      else if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2)
        container.append(h('em', {}, tok.slice(1, -1)));
      else if (tok) container.append(document.createTextNode(tok));
    }
  });
  return container;
}

/** After the merger the letterhead is Xmas12's. */
const isXmas12 = (memo: MemoSpec): boolean => memo.header.startsWith('XMAS12');

/** The company's letterhead: wordmark, tagline, and the memo's title block. */
function letterhead(memo: MemoSpec): HTMLElement {
  const xmas12 = isXmas12(memo);
  return h(
    'div',
    { class: 'memo-letterhead' },
    h(
      'div',
      { class: 'memo-brand' },
      h(
        'div',
        { class: 'memo-wordmark' },
        h('span', { class: 'memo-wordmark-xmas' }, 'XMAS'),
        h('span', { class: 'memo-wordmark-days' }, xmas12 ? '12' : '365'),
        h('span', { class: 'memo-wordmark-inc' }, 'INC.'),
      ),
      h(
        'div',
        { class: 'memo-tagline' },
        xmas12 ? 'Twelve days. Plenty.™' : 'Christmas. Every day. Forever.™',
      ),
    ),
    h(
      'div',
      { class: 'memo-titleblock' },
      h('div', { class: 'memo-titleblock-big' }, 'Interoffice Memorandum'),
      h('div', {}, xmas12 ? 'North Pole · Reduced Hours' : 'North Pole HQ · Confidential'),
    ),
  );
}

/** One typed field: `TO:` and its value. */
const field = (label: string, value: Node | string): HTMLElement =>
  h(
    'div',
    { class: 'memo-field' },
    h('span', { class: 'memo-field-label' }, label),
    h('span', {}, value),
  );

/**
 * A memo as a sheet of paper, with its sticky note (if any): Leap Day's in frog
 * green, a mascot's plea in yellow. `holiday` fills `{holiday}` (the room that just reverted).
 */
export function buildMemoSheet(memo: MemoSpec, holiday: string): HTMLElement {
  // The header is "BRAND · KIND": the kind goes on the rubber stamp.
  const kind = memo.header.split('·').slice(1).join('·').trim() || 'MEMO';
  const sheet = h(
    'article',
    { class: `memo-sheet${isXmas12(memo) ? ' memo-sheet--xmas12' : ''}` },
    letterhead(memo),
    h('div', { class: 'memo-stamp' }, kind),
    h(
      'div',
      { class: 'memo-fields' },
      field('TO:', formatMemoText(memo.to, holiday)),
      field('FROM:', memo.from),
      field('RE:', h('strong', {}, formatMemoText(memo.re, holiday))),
    ),
    h('div', { class: 'memo-body' }, renderFormattedText(formatMemoText(memo.body, holiday))),
    h('div', { class: 'memo-signoff' }, memo.signoff),
  );
  if (!memo.reaction) return sheet;
  const speaker = SPEAKERS[memo.reaction.speaker];
  return h(
    'div',
    { class: 'memo-stack' },
    sheet,
    h(
      'aside',
      { class: `memo-sticky${memo.reaction.speaker === 'leapday' ? '' : ' memo-sticky--plea'}` },
      h('div', { class: 'memo-sticky-who' }, `${speaker.icon} ${speaker.name}`),
      h('div', {}, renderFormattedText(memo.reaction.text)),
    ),
  );
}

/**
 * A new memo, filling the screen until it's put away. Enter, Space or Escape
 * also put it away. Returns the overlay (already in `host`).
 */
export function showMemoOverlay(
  host: HTMLElement,
  memo: MemoSpec,
  holiday: string,
  buttonLabel: string,
  onDone: () => void,
): HTMLElement {
  let done = false;
  const finish = (): void => {
    if (done) return;
    done = true;
    window.removeEventListener('keydown', onKey);
    overlay.remove();
    onDone();
  };
  const onKey = (e: KeyboardEvent): void => {
    // Taken down some other way (a puzzle opened over it): just stop listening.
    if (!overlay.isConnected) {
      window.removeEventListener('keydown', onKey);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      finish();
    }
  };
  const overlay = h(
    'div',
    { class: 'memo-overlay interactive', role: 'dialog', 'aria-modal': 'true' },
    h(
      'div',
      { class: 'memo-overlay-inner' },
      h('div', { class: 'memo-overlay-kicker' }, '📄 You found a memo'),
      buildMemoSheet(memo, holiday),
      h('button', { class: 'memo-done', onclick: finish }, buttonLabel),
    ),
  );
  window.addEventListener('keydown', onKey);
  host.replaceChildren(overlay);
  return overlay;
}
