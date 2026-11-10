/**
 * A room's Run of Puzzles, The Witness's way: a wired strip of small puzzles,
 * each solved one powering up the next and auto-advancing after a short
 * celebration. Includes the Dual Display subtitle, a compact 1-line twist pill,
 * and a '?' controls toggle.
 */
import { cancelGenerating, generateInBrowser } from '../gen/client';
import type { Tier } from '../gen/core/spec';
import { gameState, getCompactRulePill, getRunFreePlaySpec, getRunIdentity } from '../game/state';
import { type Proto, h } from './kit';

export interface PanelHooks {
  /** The panel's solved; `message` is shown under it. */
  solved(message?: string): void;
  status(text: string): void;
}

export interface RunDef<P extends { name: string; tip?: string }> extends Omit<Proto, 'mount'> {
  panels: P[];
  mountPanel(host: HTMLElement, panel: P, hooks: PanelHooks): void;
}

export function run<P extends { name: string; tip?: string }>(def: RunDef<P>): Proto {
  const { panels, mountPanel, ...proto } = def;
  return {
    ...proto,
    teaches: true,
    panelCount: panels.length,
    panels,
    mount(host, ctx) {
      const done = gameState.solvedPanels;
      let autoAdvanceTimer = 0;
      const freePlaySpec = getRunFreePlaySpec(proto.id);
      let activeFreePlayTier: Tier | null = null;
      let currentFreePlayPanel: P | null = null;
      let currentFreePlaySeed = 0;
      /** Bumped on every new Free Play request, so a superseded one stops quietly. */
      let freePlayToken = 0;

      const TIER_SIZE_LABELS: Record<Tier, string> =
        freePlaySpec?.genre === 'hops'
          ? {
              easy: '4×4',
              medium: '5×5',
              hard: '6×6',
            }
          : freePlaySpec?.genre === 'lights'
            ? {
                easy: '5×5',
                medium: '6×6',
                hard: '7×7',
              }
            : {
                easy: '5×5',
                medium: '7×7',
                hard: '9×9',
              };

      // Row 0: Story vs Free Play (5×5 / 7×7 / 9×9) chooser bar (shown once rung is beaten or Free Play unlocked)
      const modeBar = h('div', {
        style: {
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          margin: '0 0 8px',
          padding: '5px 8px',
          borderRadius: '10px',
          background: '#f7f3eb',
          border: '1px solid #d8cfc0',
        },
      });

      const renderModeBar = (): void => {
        const isUnlocked =
          Boolean(freePlaySpec) &&
          (gameState.solvedRuns.has(proto.id) || gameState.freePlayUnlocked);
        if (!isUnlocked) {
          modeBar.style.display = 'none';
          return;
        }
        modeBar.style.display = 'flex';
        const storyActive = activeFreePlayTier === null;
        const makeBtn = (label: string, active: boolean, onClick: () => void): HTMLButtonElement =>
          h(
            'button',
            {
              style: {
                borderRadius: '999px',
                height: '26px',
                padding: '0 10px',
                fontWeight: active ? '800' : '700',
                fontSize: '12px',
                cursor: 'pointer',
                border: active ? '2px solid #1f2430' : '1px solid #cbbba0',
                background: active ? 'var(--room-accent, #2f855a)' : '#fffdf9',
                color: active ? '#fff' : '#2d3748',
                boxShadow: active ? '0 1px 0 #1f2430' : 'none',
              },
              onclick: onClick,
            },
            label,
          );

        const buttons: HTMLElement[] = [
          makeBtn('📖 Story Puzzles', storyActive, () => {
            if (activeFreePlayTier !== null) {
              freePlayToken++;
              cancelGenerating();
              activeFreePlayTier = null;
              currentFreePlayPanel = null;
              strip.style.display = 'flex';
              newFreePlayBtn.style.display = 'none';
              renderModeBar();
              open(at);
            }
          }),
        ];

        for (const tier of ['easy', 'medium', 'hard'] as const) {
          const sizeLbl = TIER_SIZE_LABELS[tier];
          const count = gameState.freePlaySolvedCount(proto.id, tier);
          const btnText =
            count > 0 ? `🎲 Free Play ${sizeLbl} (✓ ${count})` : `🎲 Free Play ${sizeLbl}`;
          buttons.push(
            makeBtn(btnText, activeFreePlayTier === tier, () => {
              void openFreePlay(tier);
            }),
          );
        }

        modeBar.replaceChildren(...buttons);
      };

      // Row 1: wired progress pips
      const strip = h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0px',
          flexWrap: 'wrap',
          margin: '0 0 8px',
        },
      });

      // Row 2: Reset (left-aligned) + Hint & '?' (right-aligned) on the same row
      const topRow = h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          margin: '0 0 8px',
        },
      });

      const helpBox = h(
        'div',
        {
          style: {
            display: 'none',
            fontSize: '13px',
            lineHeight: '1.45',
            background: '#f7f3eb',
            border: '1px solid #d8cfc0',
            borderRadius: '8px',
            padding: '8px 12px',
            margin: '0 0 8px',
            color: '#4a4238',
          },
        },
        proto.rules,
      );

      const resetBtn = h(
        'button',
        {
          title: 'Reset current puzzle panel',
          style: {
            borderRadius: '999px',
            height: '28px',
            padding: '0 11px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            border: '1px solid #cbbba0',
            background: '#fffdf9',
            color: '#1f2430',
          },
          onclick: () => {
            if (activeFreePlayTier && currentFreePlayPanel) {
              mountFreePlayPanel(activeFreePlayTier, currentFreePlayPanel, currentFreePlaySeed);
            } else {
              open(at);
            }
          },
        },
        '↺ Reset',
      );

      const newFreePlayBtn = h(
        'button',
        {
          title: 'Generate a new Free Play board of this size',
          style: {
            display: 'none',
            borderRadius: '999px',
            height: '28px',
            padding: '0 11px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            border: '1px solid #2b6cb0',
            background: '#ebf8ff',
            color: '#2c5282',
          },
          onclick: () => {
            if (activeFreePlayTier) {
              void openFreePlay(activeFreePlayTier);
            }
          },
        },
        '🎲 New Board',
      );

      const leftControls = h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
        resetBtn,
        newFreePlayBtn,
      );

      const hintBtn = h(
        'button',
        {
          title: 'Get a hint for this panel',
          style: {
            borderRadius: '999px',
            height: '28px',
            padding: '0 11px',
            fontWeight: '700',
            fontSize: '13px',
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

      const helpBtn = h(
        'button',
        {
          title: 'Show full controls and rules',
          style: {
            borderRadius: '999px',
            width: '28px',
            height: '28px',
            padding: '0',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            border: '1px solid #cbbba0',
            background: '#fffaf0',
            color: '#5a4a38',
          },
          onclick: () => {
            const openHelp = helpBox.style.display !== 'none';
            helpBox.style.display = openHelp ? 'none' : 'block';
          },
        },
        '?',
      );
      const rightControls = h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' } },
        hintBtn,
        helpBtn,
      );
      topRow.append(leftControls, rightControls);

      // Compact puzzle title + Dual Display subtitle + ultra-short micro-rule pill
      const defaultPillText = getCompactRulePill({ ...proto, mount: () => {} });
      const runIdentity = getRunIdentity(proto.id);
      const title = h('div', {
        style: { fontWeight: '800', fontSize: '14.5px', color: '#1f2430' },
      });
      const subtitle = runIdentity
        ? h(
            'div',
            {
              style: {
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#4a5568',
                lineHeight: '1.25',
              },
            },
            runIdentity.dualLabel,
          )
        : null;
      const titleGroup = h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
        title,
        subtitle,
      );
      const rulePill = h(
        'div',
        {
          style: {
            fontSize: '12px',
            fontWeight: '700',
            background: '#fffdf9',
            color: '#2d3748',
            border: '1.5px solid var(--room-accent, #cbbba0)',
            borderRadius: '999px',
            padding: '3px 10px',
            boxShadow: '0 1px 0 rgba(31, 36, 48, 0.12)',
          },
        },
        defaultPillText,
      );
      const metaRow = h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            margin: '0 0 8px',
          },
        },
        titleGroup,
        rulePill,
      );

      const board = h('div', { class: 'puzz-board-stage' });
      let activePane: HTMLElement | null = null;
      let lastOpenedIdx = -1;
      let stageHeightTimer = 0;
      const AUTO_ADVANCE_MS = 1350;
      const advanceBarFill = h('div', {
        style: {
          height: '100%',
          width: '0%',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #38a169 0%, #48bb78 100%)',
        },
      });
      const advanceBarTrack = h(
        'div',
        {
          style: {
            display: 'none',
            width: '100%',
            height: '6px',
            borderRadius: '999px',
            background: '#d8e8dc',
            border: '1px solid #9ae6b4',
            overflow: 'hidden',
          },
        },
        advanceBarFill,
      );

      const stopAdvanceBar = (): void => {
        advanceBarTrack.style.display = 'none';
        advanceBarFill.style.transition = 'none';
        advanceBarFill.style.width = '0%';
      };

      const startAdvanceBar = (durationMs: number): void => {
        advanceBarFill.style.transition = 'none';
        advanceBarFill.style.width = '0%';
        advanceBarTrack.style.display = 'block';
        void advanceBarFill.offsetWidth;
        advanceBarFill.style.transition = `width ${durationMs}ms linear`;
        advanceBarFill.style.width = '100%';
      };

      const footer = h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          minHeight: '34px',
          margin: '8px 0 0',
        },
      });
      const footerRow = h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          minHeight: '34px',
        },
      });
      const message = h('div', {
        style: { fontWeight: '700', color: '#276749', fontSize: '14.5px' },
      });
      const next = h(
        'button',
        {
          style: {
            visibility: 'hidden',
            fontSize: '13.5px',
            fontWeight: '800',
            padding: '5px 14px',
            borderRadius: '999px',
            border: '2px solid #1f2430',
            background: '#2f855a',
            color: '#fff',
            boxShadow: '0 2px 0 #1f2430',
            cursor: 'pointer',
          },
        },
        'Next puzzle ▸',
      );
      footerRow.append(message, next);
      footer.append(advanceBarTrack, footerRow);

      let at = Math.max(
        0,
        panels.findIndex((_, i) => !done.has(`${proto.id}:${i}`)),
      );
      if (panels.every((_, k) => done.has(`${proto.id}:${k}`))) {
        gameState.markRunSolved(proto.id);
      }

      const renderStrip = (activeIdx: number, justSolvedIdx = -1, waveAll = false): void => {
        const nodes: HTMLElement[] = [];
        panels.forEach((_, j) => {
          const isDone = done.has(`${proto.id}:${j}`);
          const isCurrent = j === activeIdx;
          if (j > 0) {
            const prevDone = done.has(`${proto.id}:${j - 1}`);
            nodes.push(
              h('span', {
                style: {
                  display: 'inline-block',
                  width: '12px',
                  height: '3px',
                  background: prevDone ? '#38a169' : '#d2c8b8',
                  transition: 'background 0.25s ease',
                },
              }),
            );
          }
          nodes.push(
            h(
              'button',
              {
                style: {
                  minWidth: '32px',
                  height: '28px',
                  borderRadius: '999px',
                  fontWeight: isCurrent ? '800' : '700',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  border: isCurrent
                    ? '2px solid #1f2430'
                    : isDone
                      ? '1.5px solid #38a169'
                      : '1.5px solid #cbbba0',
                  background: isCurrent
                    ? isDone && (j === justSolvedIdx || waveAll)
                      ? '#2f855a'
                      : 'var(--room-accent, #e0662d)'
                    : isDone
                      ? '#c6f6d5'
                      : '#fffdf9',
                  color: isCurrent ? '#fff' : isDone ? '#22543d' : '#4a4238',
                  boxShadow: isCurrent ? '0 2px 0 #1f2430' : 'none',
                  transition: 'all 0.18s ease',
                  animation: waveAll
                    ? `puzz-pip-solved 0.42s cubic-bezier(0.22, 1.4, 0.36, 1) ${j * 55}ms both`
                    : j === justSolvedIdx
                      ? 'puzz-pip-solved 0.38s cubic-bezier(0.22, 1.4, 0.36, 1)'
                      : 'none',
                },
                onclick: () => open(j),
              },
              isDone ? `${j + 1}✓` : String(j + 1),
            ),
          );
        });
        strip.replaceChildren(...nodes);
      };

      const updateFreePlayTitle = (tier: Tier, seed: number): void => {
        const sizeLbl = TIER_SIZE_LABELS[tier];
        const count = gameState.freePlaySolvedCount(proto.id, tier);
        title.textContent = `Free Play · ${sizeLbl} (✓ ${count} solved) · Seed #${seed}`;
      };

      const mountFreePlayPanel = (tier: Tier, fpPanel: P, seed: number): void => {
        if (autoAdvanceTimer) {
          clearTimeout(autoAdvanceTimer);
          autoAdvanceTimer = 0;
        }
        stopAdvanceBar();
        currentFreePlayPanel = fpPanel;
        currentFreePlaySeed = seed;
        updateFreePlayTitle(tier, seed);
        rulePill.textContent = defaultPillText;
        footer.style.display = 'flex';
        message.className = '';
        message.style.color = '#4a5568';
        message.style.fontSize = '13px';
        message.textContent = '';
        next.style.visibility = 'hidden';
        ctx.status('');

        board.replaceChildren();
        const nextPane = h('div', { class: 'puzz-board-pane' });
        activePane = nextPane;
        board.append(nextPane);

        let panelSolved = false;
        mountPanel(nextPane, fpPanel, {
          solved: (text) => {
            if (panelSolved) return;
            panelSolved = true;
            gameState.incrementFreePlaySolved(proto.id, tier);
            updateFreePlayTitle(tier, seed);
            renderModeBar();
            const sizeLbl = TIER_SIZE_LABELS[tier];
            message.className = '';
            message.style.color = '#276749';
            message.style.fontSize = '14.5px';
            message.textContent = text ? `✓ ${text}` : `✓ Free Play ${sizeLbl} solved!`;
            next.textContent = `🎲 New ${sizeLbl} Board ▸`;
            next.style.visibility = 'visible';
            ctx.status(`Free Play ${sizeLbl} solved`);
          },
          status: (text) => {
            ctx.status(text);
            if (!panelSolved) {
              message.className = '';
              message.style.color = '#4a5568';
              message.style.fontSize = '13px';
              message.textContent = text;
            }
          },
        });
      };

      const openFreePlay = async (tier: Tier): Promise<void> => {
        if (!freePlaySpec) return;
        if (autoAdvanceTimer) {
          clearTimeout(autoAdvanceTimer);
          autoAdvanceTimer = 0;
        }
        stopAdvanceBar();
        cancelGenerating();
        activeFreePlayTier = tier;
        strip.style.display = 'none';
        newFreePlayBtn.style.display = 'inline-block';
        renderModeBar();

        const sizeLbl = TIER_SIZE_LABELS[tier];
        const count = gameState.freePlaySolvedCount(proto.id, tier);
        title.textContent = `Free Play · ${sizeLbl} (✓ ${count} solved) · Generating…`;
        rulePill.textContent = defaultPillText;
        next.style.visibility = 'hidden';
        message.textContent = '';

        const shuffling = h(
          'div',
          {
            style: {
              padding: '32px 16px',
              textAlign: 'center',
              fontWeight: '700',
              fontSize: '14px',
              color: '#4a5568',
            },
          },
          `🎲 Shuffling a ${sizeLbl} board…`,
        );
        board.replaceChildren(shuffling);

        // Keep trying fresh seeds until one lands: never stand in a story puzzle, never give up.
        const token = ++freePlayToken;
        const sizeNum = tier === 'easy' ? 5 : tier === 'medium' ? 7 : 9;
        for (let attempt = 1; ; attempt++) {
          if (attempt > 1)
            shuffling.textContent = `🎲 Shuffling a ${sizeLbl} board… (try ${attempt})`;
          const seed = Math.floor(Math.random() * 900000) + 100000;
          const reply = await generateInBrowser({
            genre: freePlaySpec.genre,
            spec: {
              tier,
              ...(freePlaySpec.genre === 'words' ? { size: sizeNum } : {}),
              twists: [...freePlaySpec.twists],
            },
            seconds: 4,
            seed,
          });
          if (token !== freePlayToken || !board.isConnected || activeFreePlayTier !== tier) return;
          if (reply.made) {
            const genPanel = {
              ...(reply.made.panel as unknown as Record<string, unknown>),
              name: `Free Play ${sizeLbl} #${reply.made.seed}`,
            } as unknown as P;
            mountFreePlayPanel(tier, genPanel, reply.made.seed);
            return;
          }
        }
      };

      const open = (i: number): void => {
        if (autoAdvanceTimer) {
          clearTimeout(autoAdvanceTimer);
          autoAdvanceTimer = 0;
        }
        stopAdvanceBar();
        activeFreePlayTier = null;
        currentFreePlayPanel = null;
        strip.style.display = 'flex';
        newFreePlayBtn.style.display = 'none';
        next.textContent = 'Next puzzle ▸';
        renderModeBar();
        const prevIdx = lastOpenedIdx;
        lastOpenedIdx = i;
        at = i;
        const panel = panels[i] as P;
        renderStrip(i);
        helpBox.style.display = 'none';
        title.textContent = `Puzzle ${i + 1}/${panels.length} · ${panel.name}`;
        rulePill.textContent = panel.tip ?? defaultPillText;
        footer.style.display = 'flex';
        message.className = '';
        message.style.color = '#4a5568';
        message.style.fontSize = '13px';
        message.textContent = '';
        ctx.status('');
        next.style.visibility =
          done.has(`${proto.id}:${i}`) && i < panels.length - 1 ? 'visible' : 'hidden';

        const prevPane = activePane;
        const prevHeight = prevPane ? board.offsetHeight : 0;
        if (prevPane) {
          const dir = i > prevIdx ? 'forward' : i < prevIdx ? 'backward' : 'reset';
          const pTop = prevPane.offsetTop;
          const pLeft = prevPane.offsetLeft;
          const pWidth = prevPane.offsetWidth;
          Object.assign(prevPane.style, {
            position: 'absolute',
            top: `${pTop}px`,
            left: `${pLeft}px`,
            width: `${pWidth}px`,
            pointerEvents: 'none',
          });
          prevPane.className = `puzz-board-pane puzz-pane-exit-${dir}`;
          window.setTimeout(() => {
            prevPane.remove();
          }, 240);
        }

        const enterDir =
          prevPane === null ? null : i > prevIdx ? 'forward' : i < prevIdx ? 'backward' : 'reset';
        const nextPane = h('div', {
          class: enterDir ? `puzz-board-pane puzz-pane-enter-${enterDir}` : 'puzz-board-pane',
        });
        activePane = nextPane;
        board.append(nextPane);

        let panelSolved = false;
        mountPanel(nextPane, panel, {
          solved: (text) => {
            panelSolved = true;
            gameState.markPanelSolved(proto.id, i);
            const allSolved = panels.every((_, k) => done.has(`${proto.id}:${k}`));
            renderStrip(i, i, allSolved);
            if (allSolved || i === panels.length - 1) {
              message.className = '';
              message.textContent = '';
              next.style.visibility = 'hidden';
              footer.style.display = 'none';
              gameState.markRunSolved(proto.id);
              renderModeBar();
              ctx.solved();
            } else {
              const nextIdx =
                panels.findIndex((_, k) => k > i && !done.has(`${proto.id}:${k}`)) !== -1
                  ? panels.findIndex((_, k) => k > i && !done.has(`${proto.id}:${k}`))
                  : Math.min(i + 1, panels.length - 1);
              message.className = '';
              message.style.color = '#276749';
              message.style.fontSize = '14.5px';
              message.textContent = text ? `✓ ${text}` : `✓ Puzzle ${i + 1} solved!`;
              next.style.visibility = 'visible';
              ctx.status(`Puzzle ${i + 1} of ${panels.length} solved`);
              startAdvanceBar(AUTO_ADVANCE_MS);
              autoAdvanceTimer = window.setTimeout(() => {
                autoAdvanceTimer = 0;
                if (board.isConnected) open(nextIdx);
              }, AUTO_ADVANCE_MS);
            }
          },
          status: (text) => {
            ctx.status(text);
            if (!panelSolved) {
              message.className = '';
              message.style.color = '#4a5568';
              message.style.fontSize = '13px';
              message.textContent = text;
            }
          },
        });

        if (prevPane && prevHeight > 0) {
          if (stageHeightTimer) clearTimeout(stageHeightTimer);
          board.style.height = 'auto';
          const targetHeight = board.offsetHeight;
          if (Math.abs(targetHeight - prevHeight) > 2) {
            board.style.height = `${prevHeight}px`;
            void board.offsetHeight;
            board.style.height = `${targetHeight}px`;
            stageHeightTimer = window.setTimeout(() => {
              stageHeightTimer = 0;
              board.style.height = '';
            }, 260);
          } else {
            board.style.height = '';
          }
        }
      };

      next.addEventListener('click', () => {
        if (activeFreePlayTier) {
          void openFreePlay(activeFreePlayTier);
        } else {
          open(Math.min(at + 1, panels.length - 1));
        }
      });
      host.append(modeBar, strip, topRow, helpBox, metaRow, board, footer);
      open(at);
    },
  };
}
