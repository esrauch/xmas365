/**
 * Act III Finale ("XMAS365™ Merger Contract"):
 * Tapping CEO Santa in Holiday Hall opens the Master Merger Contract modal
 * with a checklist of the 6 Clauses (`C1`–`C6`). Tapping any clause enters
 * a 29-puzzle Run of that single Base:
 *   - Puzzle 1 (`base`): Base Puzzle with no twists
 *   - Puzzles 2–7 (`intro`): 6 5×5 Twist Reminder puzzles re-explaining each of the 6 twists
 *   - Puzzles 8–13 (`solo`): 6 nontrivial Solo Twist puzzles
 *   - Puzzles 14–28 (`duo`): All 15 Double Twist combinations
 *   - Puzzle 29 (`all6`): 1 finale puzzle combining all 6 twists at once
 */
import { CONTRACT_CLAUSES } from '../../content/script';
import { gameState } from '../../game/state';
import type { Panel as CarvePanel } from '../../gen/carving';
import type { Panel as HopPanel } from '../../gen/hops';
import type { Panel as LightPanel } from '../../gen/lights';
import type { Panel as PicPanel } from '../../gen/pictures';
import type { Panel as WebPanel } from '../../gen/webs';
import type { Panel as WordPanel } from '../../gen/words';
import { mountWeb } from '../hashiBoard';
import { mountHops } from '../hopsBoard';
import { type Proto, h } from '../kit';
import { mountLights } from '../netBoard';
import { mountPicture } from '../pictureBoard';
import type { PanelHooks } from '../run';
import { mountCarving } from '../shikakuBoard';
import { mountStrands } from '../strandsBoard';
import {
  ALL_CLAUSES,
  CLAUSE_PANEL_COUNT,
  type ClauseDef,
  type ClausePanelItem,
  type ClauseSection,
  formatPuzzleIdentity,
} from './clauses';

const SECTION_META: Record<
  ClauseSection,
  { badge: string; shortLabel: string; rangeLabel: string; color: string; bg: string }
> = {
  base: {
    badge: 'Stage 1 · Base Puzzle',
    shortLabel: 'Base (1)',
    rangeLabel: '1',
    color: '#2b6cb0',
    bg: '#ebf8ff',
  },
  intro: {
    badge: 'Stage 2 · Twist Reminders',
    shortLabel: 'Reminders (2–7)',
    rangeLabel: '2–7',
    color: '#2f855a',
    bg: '#f0fff4',
  },
  solo: {
    badge: 'Stage 3 · Solo Twist',
    shortLabel: 'Solo (8–13)',
    rangeLabel: '8–13',
    color: '#b7791f',
    bg: '#fefcbf',
  },
  duo: {
    badge: 'Stage 4 · Double Twist',
    shortLabel: 'Double (14–28)',
    rangeLabel: '14–28',
    color: '#805ad5',
    bg: '#faf5ff',
  },
  all6: {
    badge: 'Stage 5 · All 6 Twists',
    shortLabel: 'All 6 (29)',
    rangeLabel: '29',
    color: '#c53030',
    bg: '#fff5f5',
  },
};

function mountClauseBoard(
  genre: ClauseDef['genre'],
  slot: HTMLElement,
  panel: unknown,
  hooks: PanelHooks,
): void {
  const boardHooks = { solved: () => hooks.solved(), status: hooks.status };
  if (genre === 'webs') mountWeb(slot, panel as WebPanel, boardHooks);
  else if (genre === 'carving') mountCarving(slot, panel as CarvePanel, boardHooks);
  else if (genre === 'lights') mountLights(slot, panel as LightPanel, boardHooks);
  else if (genre === 'words') mountStrands(slot, panel as WordPanel, boardHooks);
  else if (genre === 'hops') mountHops(slot, panel as HopPanel, boardHooks);
  else mountPicture(slot, panel as PicPanel, boardHooks);
}

export const clause: Proto = {
  id: 'clause',
  title: 'XMAS365™ Merger Contract',
  room: 'Holiday Hall',
  kind: 'final',
  teaches: true,
  from: "Six binding clauses of CEO Santa's Master Merger Contract. Tap a clause to enter its 29-puzzle Run and red-line it!",
  rules:
    'Each of the 6 clauses covers one holiday Base across 29 bite-sized puzzles: 1 Base Puzzle, 6 Twist Reminders, 6 Solo Twist puzzles, all 15 Double Twist combinations, and 1 All-6-Twists Finale.',
  mount(host, ctx) {
    let autoAdvanceTimer = 0;

    const clearTimer = (): void => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = 0;
      }
    };

    const root = h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
      },
    });
    host.append(root);

    const renderChecklist = (): void => {
      clearTimer();
      ctx.status('');
      const voidedCount = gameState.voidedClauseCount();
      const totalSolved = ALL_CLAUSES.reduce(
        (acc, c) => acc + gameState.clauseSolvedPanelCount(c.genre),
        0,
      );
      const totalPanels = ALL_CLAUSES.length * CLAUSE_PANEL_COUNT;

      const headerCard = h(
        'div',
        {
          style: {
            background: 'linear-gradient(180deg, #fffdf7 0%, #f8f1e0 100%)',
            border: '2px solid #b7791f',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 3px 0 rgba(116, 66, 16, 0.2)',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '6px',
            },
          },
          h(
            'div',
            {
              style: {
                fontSize: '13px',
                fontWeight: '900',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#9b2c2c',
              },
            },
            '📜 XMAS365™ MASTER MERGER & SUBSUMPTION AGREEMENT',
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              },
            },
            h(
              'span',
              {
                style: {
                  fontSize: '12px',
                  fontWeight: '800',
                  padding: '2px 9px',
                  borderRadius: '999px',
                  background: voidedCount >= 6 ? '#c6f6d5' : '#fefcbf',
                  color: voidedCount >= 6 ? '#22543d' : '#744210',
                  border: `1.5px solid ${voidedCount >= 6 ? '#38a169' : '#d69e2e'}`,
                },
              },
              `${voidedCount} / 6 Clauses Voided`,
            ),
            h(
              'span',
              {
                style: {
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '2px 9px',
                  borderRadius: '999px',
                  background: '#edf2f7',
                  color: '#2d3748',
                  border: '1px solid #cbd5e0',
                },
              },
              `${totalSolved} / ${totalPanels} Puzzles`,
            ),
          ),
        ),
        h(
          'div',
          {
            style: {
              fontSize: '12.5px',
              lineHeight: '1.4',
              color: '#4a4238',
            },
          },
          'Select any binding clause below to challenge its 29-puzzle Run: Base Puzzle → 6 Twist Reminders → 6 Solo Twists → 15 Double Twists → All 6 Twists.',
        ),
      );

      const grid = h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(255px, 1fr))',
          gap: '10px',
        },
      });

      ALL_CLAUSES.forEach((clauseDef, idx) => {
        const spec = CONTRACT_CLAUSES[idx];
        const solvedCount = gameState.clauseSolvedPanelCount(clauseDef.genre);
        const isVoided = gameState.isClauseVoided(idx);
        const pct = Math.round((solvedCount / CLAUSE_PANEL_COUNT) * 100);

        const stageSummary = [
          { label: 'Base', indices: [0] },
          { label: '6 Reminders', indices: [1, 2, 3, 4, 5, 6] },
          { label: '6 Solo', indices: [7, 8, 9, 10, 11, 12] },
          {
            label: '15 Double',
            indices: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
          },
          { label: 'All 6', indices: [28] },
        ];

        const card = h(
          'div',
          {
            role: 'button',
            tabIndex: 0,
            style: {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: isVoided ? '#f0fff4' : '#fffdf9',
              border: isVoided ? '2px solid #38a169' : `2px solid ${clauseDef.accent}`,
              boxShadow: '0 2px 0 rgba(31, 36, 48, 0.14)',
              cursor: 'pointer',
              transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            },
            onclick: () => openClauseRunner(idx),
          },
          isVoided
            ? h(
                'div',
                {
                  style: {
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '2px solid #c53030',
                    background: '#fff5f5',
                    color: '#c53030',
                    fontWeight: '900',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    transform: 'rotate(-4deg)',
                  },
                },
                'VOIDED ✗',
              )
            : null,
          h(
            'div',
            {},
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '800',
                  fontSize: '14px',
                  color: '#1f2430',
                  paddingRight: isVoided ? '76px' : '0',
                },
              },
              h('span', { style: { fontSize: '17px' } }, clauseDef.icon),
              h('span', {}, clauseDef.title),
            ),
            spec
              ? h(
                  'div',
                  {
                    style: {
                      fontSize: '11.5px',
                      lineHeight: '1.35',
                      color: '#5a4a38',
                      marginTop: '4px',
                      fontStyle: 'italic',
                    },
                  },
                  `“${spec.body.replaceAll('*', '')}”`,
                )
              : null,
          ),
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                },
              },
              ...stageSummary.map((st) => {
                const stDone = st.indices.every((pi) =>
                  gameState.isClausePanelSolved(clauseDef.genre, pi),
                );
                return h(
                  'span',
                  {
                    style: {
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      background: stDone ? '#c6f6d5' : '#edf2f7',
                      color: stDone ? '#22543d' : '#4a5568',
                      border: `1px solid ${stDone ? '#68d391' : '#cbd5e0'}`,
                    },
                  },
                  stDone ? `${st.label} ✓` : st.label,
                );
              }),
            ),
            h(
              'div',
              {
                style: {
                  width: '100%',
                  height: '6px',
                  borderRadius: '999px',
                  background: '#e2e8f0',
                  overflow: 'hidden',
                },
              },
              h('div', {
                style: {
                  width: `${pct}%`,
                  height: '100%',
                  background: isVoided ? '#38a169' : clauseDef.accent,
                  transition: 'width 0.25s ease',
                },
              }),
            ),
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: isVoided ? '#276749' : clauseDef.accent,
                },
              },
              h('span', {}, `${solvedCount} / ${CLAUSE_PANEL_COUNT} Puzzles`),
              h('span', {}, isVoided ? 'Review Clause ▸' : 'Challenge Clause ▸'),
            ),
          ),
        );

        grid.append(card);
      });

      root.replaceChildren(headerCard, grid);
    };

    const openClauseRunner = (clauseIdx: number, initialPanelIdx?: number): void => {
      clearTimer();
      const clauseDef = ALL_CLAUSES[clauseIdx];
      if (!clauseDef) return;

      const panels = clauseDef.panels;
      let at =
        initialPanelIdx ??
        Math.max(
          0,
          panels.findIndex((_, i) => !gameState.isClausePanelSolved(clauseDef.genre, i)),
        );
      let activePane: HTMLElement | null = null;

      // Row 0: Clause navigation header (Back button + Clause title)
      const backBtn = h(
        'button',
        {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            borderRadius: '999px',
            padding: '5px 12px',
            fontWeight: '800',
            fontSize: '12.5px',
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
            flexShrink: '0',
            cursor: 'pointer',
            border: '1.5px solid #1f2430',
            background: '#fffaf0',
            color: '#1f2430',
            boxShadow: '0 1px 0 #1f2430',
          },
          onclick: () => renderChecklist(),
        },
        '← Checklist',
      );

      const clauseBadge = h(
        'div',
        {
          style: {
            fontWeight: '800',
            fontSize: '13.5px',
            lineHeight: '1.25',
            color: '#1f2430',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: '0',
          },
        },
        h('span', { style: { flexShrink: '0' } }, clauseDef.icon),
        h('span', { style: { minWidth: '0' } }, clauseDef.title),
      );

      const clauseHeaderRow = h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          },
        },
        backBtn,
        clauseBadge,
      );

      // Row 1: Compact 29-pip progress strip grouped by section
      const pipStrip = h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '3px',
          padding: '6px 8px',
          background: '#f7f3eb',
          borderRadius: '10px',
          border: '1px solid #e2d9c8',
        },
      });

      // Row 2: Controls row below the puzzle progression (Reset on left, Hint + ? on right)
      const resetBtn = h(
        'button',
        {
          title: 'Reset current puzzle',
          style: {
            borderRadius: '999px',
            height: '28px',
            padding: '0 11px',
            fontWeight: '700',
            fontSize: '12.5px',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            border: '1px solid #cbbba0',
            background: '#fffdf9',
            color: '#1f2430',
          },
          onclick: () => openPanel(at),
        },
        '↺ Reset',
      );

      const hintBtn = h(
        'button',
        {
          title: 'Get a hint for this puzzle',
          style: {
            borderRadius: '999px',
            height: '28px',
            padding: '0 11px',
            fontWeight: '700',
            fontSize: '12.5px',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            border: '1px solid #d69e2e',
            background: '#fefcbf',
            color: '#744210',
          },
          onclick: () => {
            activePane?.dispatchEvent(new CustomEvent('puzz:hint'));
          },
        },
        '💡 Hint',
      );

      const helpBox = h(
        'div',
        {
          style: {
            display: 'none',
            fontSize: '12.5px',
            lineHeight: '1.45',
            background: '#f7f3eb',
            border: '1px solid #d8cfc0',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#4a4238',
          },
        },
        h(
          'div',
          { style: { fontWeight: '800', marginBottom: '4px' } },
          `${clauseDef.icon} ${clauseDef.genreTitle} · All 6 Holiday Twists:`,
        ),
        ...clauseDef.twistMeta.map((g) =>
          h(
            'div',
            { style: { marginBottom: '2px' } },
            h('strong', {}, `${g.icon} ${g.label}: `),
            h('span', {}, g.rule),
          ),
        ),
      );

      const helpBtn = h(
        'button',
        {
          title: 'Show all 6 twist rules for this Base',
          style: {
            borderRadius: '999px',
            width: '28px',
            height: '28px',
            padding: '0',
            fontWeight: '700',
            fontSize: '13.5px',
            cursor: 'pointer',
            border: '1px solid #cbbba0',
            background: '#fffaf0',
            color: '#5a4a38',
          },
          onclick: () => {
            helpBox.style.display = helpBox.style.display === 'none' ? 'block' : 'none';
          },
        },
        '?',
      );

      const controlsRow = h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          },
        },
        resetBtn,
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' } },
          hintBtn,
          helpBtn,
        ),
      );

      const renderPips = (activeIdx: number): void => {
        const nodes: HTMLElement[] = [];
        let lastSection: ClauseSection | null = null;
        panels.forEach((item, idx) => {
          if (lastSection && item.section !== lastSection) {
            nodes.push(
              h('span', {
                style: {
                  display: 'inline-block',
                  width: '2px',
                  height: '18px',
                  background: '#cbbba0',
                  margin: '0 3px',
                },
              }),
            );
          }
          lastSection = item.section;
          const isDone = gameState.isClausePanelSolved(clauseDef.genre, idx);
          const isCurrent = idx === activeIdx;
          const idInfo = formatPuzzleIdentity(clauseDef.genre, item.twists);
          nodes.push(
            h(
              'button',
              {
                title: `Puzzle ${idx + 1}: ${item.name} — ${idInfo.dualLabel} (${SECTION_META[item.section].badge})`,
                style: {
                  minWidth: '24px',
                  height: '22px',
                  padding: '0 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: isCurrent ? '900' : '700',
                  cursor: 'pointer',
                  border: isCurrent
                    ? '2px solid #1f2430'
                    : isDone
                      ? '1px solid #38a169'
                      : '1px solid #cbbba0',
                  background: isCurrent ? clauseDef.accent : isDone ? '#c6f6d5' : '#fffdf9',
                  color: isCurrent ? '#fff' : isDone ? '#22543d' : '#4a4238',
                },
                onclick: () => openPanel(idx),
              },
              isDone ? `${idx + 1}✓` : String(idx + 1),
            ),
          );
        });
        pipStrip.replaceChildren(...nodes);
      };

      // Puzzle title + Stage badge + Dual Display + Rule explanation
      const metaHeader = h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        },
      });

      const boardStage = h('div', { class: 'puzz-board-stage' });

      const message = h('div', {
        style: { fontWeight: '700', color: '#276749', fontSize: '14px' },
      });

      const nextBtn = h(
        'button',
        {
          style: {
            visibility: 'hidden',
            fontSize: '13px',
            fontWeight: '800',
            padding: '5px 14px',
            borderRadius: '999px',
            border: '2px solid #1f2430',
            background: '#2f855a',
            color: '#fff',
            boxShadow: '0 2px 0 #1f2430',
            cursor: 'pointer',
          },
          onclick: () => {
            if (at < panels.length - 1) openPanel(at + 1);
            else renderChecklist();
          },
        },
        'Next puzzle ▸',
      );

      const footerRow = h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            minHeight: '32px',
          },
        },
        message,
        nextBtn,
      );

      const openPanel = (idx: number): void => {
        clearTimer();
        at = idx;
        const item = panels[idx] as ClausePanelItem<unknown>;
        const sec = SECTION_META[item.section];
        renderPips(idx);

        const activeTwists = item.twists
          .map((k) => clauseDef.twistMeta.find((g) => g.key === k))
          .filter((g): g is NonNullable<typeof g> => Boolean(g));

        const identity = formatPuzzleIdentity(clauseDef.genre, item.twists);
        const isIntro = item.section === 'intro';

        metaHeader.replaceChildren(
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '6px',
              },
            },
            h(
              'span',
              {
                style: { fontWeight: '800', fontSize: '14px', color: '#1f2430' },
              },
              `Puzzle ${idx + 1}/${panels.length} · ${item.name}`,
            ),
            h(
              'span',
              {
                style: {
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                  background: sec.bg,
                  color: sec.color,
                  border: `1px solid ${sec.color}`,
                },
              },
              sec.badge,
            ),
          ),
          h(
            'div',
            {
              style: {
                fontSize: '12px',
                fontWeight: '700',
                color: '#4a5568',
                lineHeight: '1.3',
              },
            },
            identity.dualLabel,
          ),
          isIntro
            ? h(
                'div',
                {
                  style: {
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: '#f0fff4',
                    border: '1.5px solid #38a169',
                    fontSize: '12px',
                    lineHeight: '1.38',
                    color: '#2d3748',
                  },
                },
                activeTwists.length > 0
                  ? h(
                      'span',
                      { style: { fontWeight: '800', marginRight: '6px', color: '#1f2430' } },
                      activeTwists.map((g) => `${g.icon} ${g.label}`).join(' + ') + ':',
                    )
                  : h(
                      'span',
                      { style: { fontWeight: '800', marginRight: '6px', color: '#1f2430' } },
                      `${clauseDef.icon} Base Rules:`,
                    ),
                h('span', {}, item.explain),
              )
            : h(
                'div',
                {
                  style: {
                    fontSize: '12px',
                    fontWeight: '700',
                    lineHeight: '1.35',
                    background: '#fffdf9',
                    color: '#2d3748',
                    border: `1.5px solid ${clauseDef.accent}`,
                    borderRadius: '8px',
                    padding: '5px 10px',
                  },
                },
                item.tip,
              ),
        );

        message.textContent = '';
        message.style.color = '#4a5568';
        const alreadyDone = gameState.isClausePanelSolved(clauseDef.genre, idx);
        nextBtn.textContent = idx < panels.length - 1 ? 'Next puzzle ▸' : '← Contract Checklist';
        nextBtn.style.visibility = alreadyDone ? 'visible' : 'hidden';

        const pane = h('div', { class: 'puzz-board-pane' });
        activePane = pane;
        boardStage.replaceChildren(pane);

        let solvedHere = false;
        mountClauseBoard(clauseDef.genre, pane, item.panel, {
          solved: (text) => {
            solvedHere = true;
            gameState.markClausePanelSolved(clauseDef.genre, idx);
            renderPips(idx);

            const clauseNowVoided = gameState.isClauseVoided(clauseIdx);
            const allClausesVoided = gameState.voidedClauseCount() >= ALL_CLAUSES.length;

            if (allClausesVoided) {
              message.style.color = '#276749';
              message.textContent = '🎉 All 6 Merger Contract Clauses Voided!';
              nextBtn.style.visibility = 'hidden';
              ctx.solved();
              return;
            }

            if (clauseNowVoided && idx === panels.length - 1) {
              message.style.color = '#276749';
              message.textContent = `🎉 ${clauseDef.title} VOIDED!`;
              nextBtn.textContent = '← Contract Checklist ▸';
              nextBtn.style.visibility = 'visible';
              autoAdvanceTimer = window.setTimeout(() => {
                autoAdvanceTimer = 0;
                if (root.isConnected) renderChecklist();
              }, 1400);
              return;
            }

            const nextUnsolved = panels.findIndex(
              (_, k) => k > idx && !gameState.isClausePanelSolved(clauseDef.genre, k),
            );
            const targetIdx =
              nextUnsolved !== -1 ? nextUnsolved : Math.min(idx + 1, panels.length - 1);

            message.style.color = '#276749';
            message.textContent = text ? `✓ ${text}` : `✓ Puzzle ${idx + 1} solved!`;
            nextBtn.textContent =
              idx < panels.length - 1 ? 'Next puzzle ▸' : '← Contract Checklist';
            nextBtn.style.visibility = 'visible';
            ctx.status(`Puzzle ${idx + 1} of ${panels.length} solved`);

            autoAdvanceTimer = window.setTimeout(() => {
              autoAdvanceTimer = 0;
              if (!boardStage.isConnected) return;
              if (idx < panels.length - 1) openPanel(targetIdx);
              else renderChecklist();
            }, 1250);
          },
          status: (text) => {
            ctx.status(text);
            if (!solvedHere) {
              message.style.color = '#4a5568';
              message.textContent = text;
            }
          },
        });
      };

      root.replaceChildren(
        clauseHeaderRow,
        pipStrip,
        controlsRow,
        helpBox,
        metaHeader,
        boardStage,
        footerRow,
      );
      openPanel(at);
    };

    renderChecklist();
  },
};
