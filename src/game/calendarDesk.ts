/**
 * Leap Day's Calendar Desk: houses the deterministic "Day 366" daily challenge
 * (seeded by YYYY-MM-DD) and the reclaimed holiday puzzle generators powered by
 * the in-browser Web Worker generator.
 */
import { ROOM_SCRIPT } from '../content/script';
import type { Panel as CarvePanel } from '../gen/carving';
import { type Genre, cancelGenerating, generateInBrowser } from '../gen/client';
import type { Tier, WordBoardSize } from '../gen/core/spec';
import type { Panel as HopPanel } from '../gen/hops';
import type { Panel as LightPanel } from '../gen/lights';
import type { Panel as PicPanel } from '../gen/pictures';
import type { Panel as WebPanel } from '../gen/webs';
import { type Panel as WordPanel, WORD_BOARD_SIZES } from '../gen/words';
import { mountWeb } from '../proto/hashiBoard';
import { mountHops } from '../proto/hopsBoard';
import { blip, h } from '../proto/kit';
import { mountLights } from '../proto/netBoard';
import { mountPicture } from '../proto/pictureBoard';
import { mountCarving } from '../proto/shikakuBoard';
import { mountStrands } from '../proto/strandsBoard';
import { ROOM_SPECS, type RoomId, type RoomSpec, gameState } from './state';

const GENRE_OPTIONS = [
  {
    id: 'webs' as Genre,
    roomId: 'halloween' as RoomId,
    label: '🎃 Spiderweb (Halloween)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'cuts', label: '🦃 Portions (Fences)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'carving' as Genre,
    roomId: 'thanksgiving' as RoomId,
    label: '🦃 Carving (Thanksgiving)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'basket', label: '🥚 Egg Hunt (Basket)' },
      { id: 'cuts', label: '🦃 Portions (Fences)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'lights' as Genre,
    roomId: 'christmas' as RoomId,
    label: '🎄 Lights (Christmas)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'slices', label: '🦃 Portions (Slices)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'words' as Genre,
    roomId: 'valentines' as RoomId,
    label: "💌 Heartstrings (Valentine's)",
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters (Cipher)' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'cuts', label: '🦃 Portions (Fences)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'hops' as Genre,
    roomId: 'easter' as RoomId,
    label: '🐰 Bunny Hops (Easter)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'burrows', label: '🐰 Burrows' },
      { id: 'courses', label: '🦃 Portions (Courses)' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
  {
    id: 'pictures' as Genre,
    roomId: 'fourth' as RoomId,
    label: '🎆 Fireworks (Fourth of July)',
    twists: [
      { id: 'dark', label: '🎃 Spooky (?)' },
      { id: 'letters', label: '💌 Love Letters' },
      { id: 'colours', label: '🎆 Red, White & Blue' },
      { id: 'eggs', label: '🥚 Egg Hunt' },
      { id: 'portions', label: '🦃 Portions' },
      { id: 'snow', label: '❄️ Snowflakes' },
    ] as const,
  },
] as const;

function getRoomForGenre(genre: Genre): RoomSpec {
  const opt = GENRE_OPTIONS.find((g) => g.id === genre) ?? GENRE_OPTIONS[0];
  return ROOM_SPECS.find((r) => r.id === opt.roomId) ?? (ROOM_SPECS[0] as RoomSpec);
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateHash(str: string): number {
  let hVal = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hVal ^= str.charCodeAt(i);
    hVal = Math.imul(hVal, 16777619);
  }
  return ((hVal >>> 0) % 900_000) + 100;
}

function mountGenrePanel(
  host: HTMLElement,
  genre: Genre,
  panel: unknown,
  onSolved: () => void,
  onStatus: (s: string) => void,
): void {
  const hooks = { solved: onSolved, status: onStatus };
  if (genre === 'webs') mountWeb(host, panel as WebPanel, hooks);
  else if (genre === 'carving') mountCarving(host, panel as CarvePanel, hooks);
  else if (genre === 'lights') mountLights(host, panel as LightPanel, hooks);
  else if (genre === 'words') mountStrands(host, panel as WordPanel, hooks);
  else if (genre === 'hops') mountHops(host, panel as HopPanel, hooks);
  else mountPicture(host, panel as PicPanel, hooks);
}

export function mountCalendarDesk(host: HTMLElement, onClose: () => void): void {
  const dateStr = todayKey();
  const baseSeed = dateHash(dateStr);

  // Pick 3 deterministic daily specs from today's date hash
  const g1 = GENRE_OPTIONS[baseSeed % GENRE_OPTIONS.length] ?? GENRE_OPTIONS[0];
  const g2 = GENRE_OPTIONS[(baseSeed + 2) % GENRE_OPTIONS.length] ?? GENRE_OPTIONS[1];
  const g3 = GENRE_OPTIONS[(baseSeed + 4) % GENRE_OPTIONS.length] ?? GENRE_OPTIONS[2];
  const dailySteps: { genre: Genre; label: string; tier: Tier; twists: string[]; seed: number }[] =
    [
      {
        genre: g1.id,
        label: `Easy · ${g1.label}`,
        tier: 'easy',
        twists: [(g1.twists[baseSeed % g1.twists.length] ?? g1.twists[0]).id],
        seed: (baseSeed % 50) + 1,
      },
      {
        genre: g2.id,
        label: `Medium · ${g2.label}`,
        tier: 'medium',
        twists: [(g2.twists[(baseSeed >> 3) % g2.twists.length] ?? g2.twists[0]).id],
        seed: ((baseSeed >> 4) % 50) + 1,
      },
      {
        genre: g3.id,
        label: `Hard · ${g3.label}`,
        tier: 'hard',
        twists: [(g3.twists[(baseSeed >> 6) % g3.twists.length] ?? g3.twists[0]).id],
        seed: ((baseSeed >> 7) % 50) + 1,
      },
    ];

  const dailySolved = new Set<number>();
  let dailyIdx = 0;

  const content = h('div', { style: { marginTop: '12px' } });
  const statusEl = h('div', {
    style: { fontWeight: '700', color: '#2b6cb0', minHeight: '22px' },
  });
  let remountCurrentBoard: (() => void) | null = null;
  const deskResetBtn = h(
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
        remountCurrentBoard?.();
      },
    },
    '↺ Reset',
  );
  const deskHintBtn = h(
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
        activeDeskPane?.dispatchEvent(new CustomEvent('puzz:hint'));
      },
    },
    '💡 Hint',
  );
  const dailyAdvanceBarFill = h('div', {
    style: {
      height: '100%',
      width: '0%',
      borderRadius: '999px',
      background: 'linear-gradient(90deg, #38a169 0%, #48bb78 100%)',
    },
  });
  const dailyAdvanceBarTrack = h(
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
        marginTop: '4px',
      },
    },
    dailyAdvanceBarFill,
  );
  const stopDailyAdvanceBar = (): void => {
    dailyAdvanceBarTrack.style.display = 'none';
    dailyAdvanceBarFill.style.transition = 'none';
    dailyAdvanceBarFill.style.width = '0%';
  };
  const startDailyAdvanceBar = (durationMs: number): void => {
    dailyAdvanceBarFill.style.transition = 'none';
    dailyAdvanceBarFill.style.width = '0%';
    dailyAdvanceBarTrack.style.display = 'block';
    void dailyAdvanceBarFill.offsetWidth;
    dailyAdvanceBarFill.style.transition = `width ${durationMs}ms linear`;
    dailyAdvanceBarFill.style.width = '100%';
  };

  const statusRow = h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        margin: '8px 0',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        },
      },
      deskResetBtn,
      statusEl,
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' } },
        deskHintBtn,
      ),
    ),
    dailyAdvanceBarTrack,
  );
  const boardHost = h('div', { class: 'puzz-board-stage', style: { minHeight: '240px' } });
  let activeDeskPane: HTMLElement | null = null;
  let deskHeightTimer = 0;
  let deskViewToken = 0;

  const clearBoardHost = (): void => {
    deskViewToken++;
    cancelGenerating();
    stopDailyAdvanceBar();
    if (deskHeightTimer) {
      clearTimeout(deskHeightTimer);
      deskHeightTimer = 0;
    }
    boardHost.style.height = '';
    activeDeskPane = null;
    remountCurrentBoard = null;
    boardHost.replaceChildren();
  };

  const swapDeskPane = (dir: 'forward' | 'reset', mountInto: (pane: HTMLElement) => void): void => {
    const prevPane =
      activeDeskPane && activeDeskPane.parentElement === boardHost ? activeDeskPane : null;
    const prevHeight = prevPane ? boardHost.offsetHeight : 0;
    // Remove any non-tracked children so two boards can never stack
    for (const child of Array.from(boardHost.children)) {
      if (child !== prevPane) {
        child.remove();
      }
    }
    if (prevPane) {
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
    const nextPane = h('div', {
      class: prevPane ? `puzz-board-pane puzz-pane-enter-${dir}` : 'puzz-board-pane',
    });
    activeDeskPane = nextPane;
    boardHost.append(nextPane);
    mountInto(nextPane);

    if (prevPane && prevHeight > 0) {
      if (deskHeightTimer) clearTimeout(deskHeightTimer);
      boardHost.style.height = 'auto';
      const targetHeight = boardHost.offsetHeight;
      if (Math.abs(targetHeight - prevHeight) > 2) {
        boardHost.style.height = `${prevHeight}px`;
        void boardHost.offsetHeight;
        boardHost.style.height = `${targetHeight}px`;
        deskHeightTimer = window.setTimeout(() => {
          deskHeightTimer = 0;
          boardHost.style.height = '';
        }, 260);
      } else {
        boardHost.style.height = '';
      }
    }
  };

  const loadDailyStep = async (idx: number): Promise<void> => {
    dailyIdx = idx;
    const step = dailySteps[idx] ?? dailySteps[0];
    if (!step) return;
    const token = ++deskViewToken;
    cancelGenerating();
    statusEl.textContent = `Generating Daily Panel ${idx + 1}/3 (${step.label})...`;
    const dailyWordSize: WordBoardSize | undefined =
      step.genre === 'words'
        ? step.tier === 'easy'
          ? 4
          : step.tier === 'medium'
            ? 5
            : 6
        : undefined;
    const reply = await generateInBrowser({
      genre: step.genre,
      spec: {
        tier: step.tier,
        ...(dailyWordSize ? { size: dailyWordSize } : {}),
        twists: step.twists,
      },
      seconds: 8,
      seed: step.seed,
    });
    if (token !== deskViewToken) return;
    if (!reply.made) {
      statusEl.textContent = 'Could not generate panel; try again.';
      return;
    }
    const mountStep = (dir: 'forward' | 'reset'): void => {
      statusEl.textContent = `${step.label} · Twist: ${step.twists.join(', ')}`;
      swapDeskPane(dir, (pane) => {
        mountGenrePanel(
          pane,
          step.genre,
          reply.made?.panel,
          () => {
            dailySolved.add(idx);
            blip(660, 120);
            renderTabs();
            if (dailySolved.size === 3) {
              statusEl.textContent = `🎉 Day 366 Daily (${dateStr}) Complete!`;
            } else if (idx < 2) {
              statusEl.textContent = `✓ Panel ${idx + 1} solved! Loading next...`;
              startDailyAdvanceBar(1350);
              window.setTimeout(() => {
                stopDailyAdvanceBar();
                if (boardHost.isConnected && activeTab === 'daily') void loadDailyStep(idx + 1);
              }, 1350);
            }
          },
          (t) => {
            statusEl.textContent = t;
          },
        );
      });
    };
    remountCurrentBoard = () => mountStep('reset');
    mountStep('forward');
  };

  let activeTab: 'custom' | 'daily' = 'custom';
  // Level 1 when null (pick a holiday); Level 2 when set (options + board for that holiday)
  let selectedGenre: Genre | null = null;
  let customMode: 'generator' | 'warmup' = 'generator';
  let customTier: Tier = 'easy';
  let customWordSize: WordBoardSize = 5;
  const customTwists = new Set<string>();

  const mountWarmupInDesk = (room: RoomSpec): void => {
    clearBoardHost();
    const warmupHost = h('div', { style: { marginTop: '8px' } });
    remountCurrentBoard = () => mountWarmupInDesk(room);
    room.warmup.mount(warmupHost, {
      solved: () => {
        blip(660, 120);
        gameState.markRunSolved(room.warmup.id);
      },
      status: () => {
        // Warm-up run renders its own status bar
      },
    });
    boardHost.replaceChildren(warmupHost);
  };

  const generateAndMountStandardOrTwist = async (): Promise<void> => {
    if (!selectedGenre) return;
    const genre = selectedGenre;
    const gInfo = GENRE_OPTIONS.find((x) => x.id === genre) ?? GENRE_OPTIONS[0];
    const room = getRoomForGenre(genre);
    if (!gameState.isDeskTwistsUnlocked(room)) {
      customTwists.clear();
    }
    const token = ++deskViewToken;
    cancelGenerating();
    const seed = Math.floor(Math.random() * 100_000) + 1;
    const twistDesc =
      customTwists.size === 0 ? 'Standard (No Twist)' : `Twists: ${[...customTwists].join(', ')}`;
    const sizeDesc = genre === 'words' ? `${customWordSize}×${customWordSize}` : customTier;
    statusEl.textContent = `Generating ${sizeDesc} ${gInfo.label} · ${twistDesc}...`;
    const reply = await generateInBrowser({
      genre,
      spec: {
        tier: customTier,
        ...(genre === 'words' ? { size: customWordSize } : {}),
        twists: [...customTwists],
      },
      seconds: 10,
      seed,
    });
    if (token !== deskViewToken) return;
    if (!reply.made) {
      statusEl.textContent =
        'No board found for that combination in time. Try 1 twist or Easy/Medium.';
      return;
    }
    const mountCustom = (dir: 'forward' | 'reset'): void => {
      statusEl.textContent = `${gInfo.label} · ${twistDesc} · Seed ${reply.made?.seed}`;
      swapDeskPane(dir, (pane) => {
        mountGenrePanel(
          pane,
          genre,
          reply.made?.panel,
          () => {
            statusEl.textContent = `✓ Solved! (${twistDesc} · Seed ${reply.made?.seed})`;
          },
          (s) => {
            statusEl.textContent = s;
          },
        );
      });
    };
    remountCurrentBoard = () => mountCustom('reset');
    mountCustom('forward');
  };

  const renderCustom = (autoGen = false): void => {
    const currentlyUnlocked = GENRE_OPTIONS.filter((g) =>
      gameState.isDeskGenreUnlocked(getRoomForGenre(g.id)),
    );

    if (selectedGenre && !gameState.isDeskGenreUnlocked(getRoomForGenre(selectedGenre))) {
      selectedGenre = null;
    }

    // LEVEL 1: Pick a Holiday / Puzzle Type
    if (selectedGenre === null) {
      clearBoardHost();
      const introBanner =
        currentlyUnlocked.length === 0
          ? h(
              'div',
              {
                style: {
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: '#f7fafc',
                  border: '2px dashed #cbd5e0',
                  textAlign: 'center',
                  color: '#2d3748',
                  marginBottom: '12px',
                },
              },
              h('div', { style: { fontSize: '24px', marginBottom: '4px' } }, '🔒'),
              h(
                'h3',
                { style: { margin: '0 0 4px 0', fontSize: '16px' } },
                'No Puzzle Types Unlocked Yet',
              ),
              h(
                'p',
                {
                  style: {
                    margin: '0 auto',
                    maxWidth: '500px',
                    fontSize: '13px',
                    lineHeight: '1.42',
                    color: '#4a5568',
                  },
                },
                'Beat any holiday’s center Warm-up puzzle in its alcove to unlock its Warm-up and Standard (No-Twist) generator here. Beat its Centerpiece to unlock all 6 of its Holiday Twists!',
              ),
            )
          : h(
              'div',
              {
                style: {
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#4a5568',
                  marginBottom: '10px',
                },
              },
              'Select an unlocked holiday puzzle type to play its Warm-up or generate Standard & Twist boards:',
            );

      const holidayMenuGrid = h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '10px',
          },
        },
        ...GENRE_OPTIONS.map((g) => {
          const r = getRoomForGenre(g.id);
          const unlocked = gameState.isDeskGenreUnlocked(r);
          const hasTwists = gameState.isDeskTwistsUnlocked(r);
          const statusBadge = !unlocked
            ? `🔒 Beat Warm-up (${r.warmup.title})`
            : hasTwists
              ? '★ Warm-up + Standard + All 6 Twists'
              : '✓ Warm-up + Standard Unlocked';
          return h(
            'button',
            {
              disabled: !unlocked,
              style: {
                padding: '12px 14px',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? '1' : '0.62',
                border: unlocked ? `2px solid ${r.accent}` : '1.5px solid #cbd5e0',
                background: unlocked ? '#fffdf9' : '#edf2f7',
                color: '#1f2430',
                boxShadow: unlocked ? '0 3px 0 #1f2430' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              },
              onclick: () => {
                if (!unlocked) return;
                selectedGenre = g.id;
                customMode = 'generator';
                customTwists.clear();
                renderCustom(true);
              },
            },
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                },
              },
              h('span', { style: { fontWeight: '800', fontSize: '14px' } }, g.label),
              unlocked
                ? h(
                    'span',
                    {
                      style: {
                        fontSize: '12px',
                        fontWeight: '800',
                        color: r.accent,
                      },
                    },
                    'Open ▸',
                  )
                : null,
            ),
            h(
              'div',
              {
                style: {
                  fontSize: '11.5px',
                  fontWeight: '700',
                  color: hasTwists ? '#2f855a' : unlocked ? '#2b6cb0' : '#718096',
                },
              },
              statusBadge,
            ),
            !hasTwists
              ? h(
                  'div',
                  { style: { fontSize: '11px', color: '#718096' } },
                  unlocked
                    ? `${ROOM_SCRIPT[r.id].deskReclaimedSign} · Beat ${r.centerpiece.title} for all 6 Twists`
                    : `Then beat ${r.centerpiece.title} for all 6 Twists`,
                )
              : h(
                  'div',
                  { style: { fontSize: '11px', color: '#2f855a', fontWeight: '700' } },
                  ROOM_SCRIPT[r.id].deskReclaimedSign,
                ),
          );
        }),
      );

      content.replaceChildren(introBanner, holidayMenuGrid);
      return;
    }

    // LEVEL 2: Options & Board for `selectedGenre`
    const gInfo = GENRE_OPTIONS.find((x) => x.id === selectedGenre) ?? GENRE_OPTIONS[0];
    const activeRoom = getRoomForGenre(selectedGenre);
    const twistsUnlocked = gameState.isDeskTwistsUnlocked(activeRoom);
    if (!twistsUnlocked) {
      customTwists.clear();
    }

    const level2Header = h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
          paddingBottom: '8px',
          marginBottom: '10px',
          borderBottom: '1px solid #e2e8f0',
        },
      },
      h(
        'button',
        {
          style: {
            padding: '5px 12px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12.5px',
            cursor: 'pointer',
            border: '1.5px solid #2d3748',
            background: '#fffdf9',
            color: '#1f2430',
          },
          onclick: () => {
            selectedGenre = null;
            clearBoardHost();
            renderCustom(false);
          },
        },
        '← All Holidays',
      ),
      h('div', { style: { fontWeight: '800', fontSize: '15px', color: '#1f2430' } }, gInfo.label),
      h(
        'span',
        {
          style: {
            fontSize: '11.5px',
            fontWeight: '800',
            padding: '3px 9px',
            borderRadius: '999px',
            background: twistsUnlocked ? '#f0fff4' : '#ebf8ff',
            color: twistsUnlocked ? '#22543d' : '#2b6cb0',
            border: twistsUnlocked ? '1px solid #2f855a' : '1px solid #90cdf4',
          },
        },
        twistsUnlocked ? '★ All 6 Twists Unlocked' : '✓ Warm-up + Standard',
      ),
    );

    const modeSwitchRow = h(
      'div',
      {
        style: {
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '10px',
        },
      },
      h(
        'button',
        {
          style: {
            padding: '6px 13px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12.5px',
            cursor: 'pointer',
            border: customMode === 'generator' ? '2px solid #1f2430' : '1px solid #cbd5e0',
            background: customMode === 'generator' ? activeRoom.accent : '#f7fafc',
            color: customMode === 'generator' ? '#fff' : '#2d3748',
          },
          onclick: () => {
            if (customMode === 'generator') return;
            customMode = 'generator';
            clearBoardHost();
            renderCustom(true);
          },
        },
        '🎲 Standard & Twist Generator',
      ),
      h(
        'button',
        {
          style: {
            padding: '6px 13px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '12.5px',
            cursor: 'pointer',
            border: customMode === 'warmup' ? '2px solid #1f2430' : '1px solid #cbd5e0',
            background: customMode === 'warmup' ? activeRoom.accent : '#f7fafc',
            color: customMode === 'warmup' ? '#fff' : '#2d3748',
          },
          onclick: () => {
            if (customMode === 'warmup') return;
            customMode = 'warmup';
            renderCustom(false);
          },
        },
        `★ Warm-up: ${activeRoom.warmup.title}`,
      ),
    );

    if (customMode === 'warmup') {
      content.replaceChildren(level2Header, modeSwitchRow, boardHost);
      mountWarmupInDesk(activeRoom);
      return;
    }

    const tierSelect =
      selectedGenre === 'words'
        ? h(
            'select',
            {
              style: {
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: '700',
              },
              onchange: (e: Event) => {
                customWordSize = Number((e.target as HTMLSelectElement).value) as WordBoardSize;
                void generateAndMountStandardOrTwist();
              },
            },
            ...WORD_BOARD_SIZES.map((sz) =>
              h(
                'option',
                { value: String(sz), selected: sz === customWordSize },
                sz === 9 ? '9×9 (Bonus)' : `${sz}×${sz}`,
              ),
            ),
          )
        : h(
            'select',
            {
              style: {
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: '700',
              },
              onchange: (e: Event) => {
                customTier = (e.target as HTMLSelectElement).value as Tier;
                void generateAndMountStandardOrTwist();
              },
            },
            ...(['easy', 'medium', 'hard'] as const).map((t) =>
              h('option', { value: t, selected: t === customTier }, t.toUpperCase()),
            ),
          );

    const noTwistActive = customTwists.size === 0;
    const standardBtn = h(
      'button',
      {
        style: {
          padding: '5px 11px',
          borderRadius: '999px',
          fontSize: '12.5px',
          fontWeight: '700',
          cursor: 'pointer',
          border: noTwistActive ? '2px solid #2f855a' : '1px solid #cbd5e0',
          background: noTwistActive ? '#f0fff4' : '#f7fafc',
          color: noTwistActive ? '#22543d' : '#4a5568',
        },
        onclick: () => {
          customTwists.clear();
          renderCustom(true);
        },
      },
      '✨ Standard (No Twist)',
    );

    const twistRow = h(
      'div',
      { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' } },
      standardBtn,
      ...gInfo.twists.map((tw) => {
        const on = customTwists.has(tw.id);
        return h(
          'button',
          {
            disabled: !twistsUnlocked,
            title: twistsUnlocked
              ? tw.label
              : `Locked: Beat ${activeRoom.centerpiece.title} (${activeRoom.shortTitle} Centerpiece) to unlock twists`,
            style: {
              padding: '5px 10px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: twistsUnlocked ? 'pointer' : 'not-allowed',
              opacity: twistsUnlocked ? '1' : '0.55',
              border: on ? '1.5px solid #2b6cb0' : '1px solid #cbd5e0',
              background: on ? '#ebf8ff' : '#f7fafc',
              color: on ? '#2b6cb0' : '#4a5568',
            },
            onclick: () => {
              if (!twistsUnlocked) return;
              if (on) customTwists.delete(tw.id);
              else if (customTwists.size < 2) customTwists.add(tw.id);
              renderCustom(true);
            },
          },
          twistsUnlocked ? tw.label : `🔒 ${tw.label}`,
        );
      }),
    );

    const twistLockNotice = !twistsUnlocked
      ? h(
          'div',
          {
            style: {
              padding: '6px 11px',
              borderRadius: '8px',
              background: '#fffaf0',
              border: '1px solid #dd6b20',
              color: '#9c4221',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '6px',
            },
          },
          `🔒 Twists Locked: Beat the ${activeRoom.shortTitle} Centerpiece (${activeRoom.centerpiece.icon} ${activeRoom.centerpiece.title}) to unlock all 6 twists for ${gInfo.label}!`,
        )
      : null;

    const genBtn = h(
      'button',
      {
        style: {
          padding: '7px 16px',
          borderRadius: '8px',
          fontWeight: '700',
          background: '#e0662d',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        },
        onclick: () => {
          void generateAndMountStandardOrTwist();
        },
      },
      'New Board ▸',
    );

    content.replaceChildren(
      level2Header,
      modeSwitchRow,
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
        h('span', { style: { fontSize: '12.5px', fontWeight: '800' } }, 'Difficulty:'),
        tierSelect,
        genBtn,
      ),
      twistRow,
      ...(twistLockNotice ? [twistLockNotice] : []),
      statusRow,
      boardHost,
    );

    if (autoGen) {
      void generateAndMountStandardOrTwist();
    }
  };

  const renderDaily = (): void => {
    clearBoardHost();
    const strip = h(
      'div',
      { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      ...dailySteps.map((_, i) =>
        h(
          'button',
          {
            style: {
              padding: '6px 12px',
              borderRadius: '999px',
              fontWeight: '700',
              cursor: 'pointer',
              border: i === dailyIdx ? '2px solid #c05621' : '1px solid #cbd5e0',
              background: i === dailyIdx ? '#e0662d' : dailySolved.has(i) ? '#c6f6d5' : '#f7fafc',
              color: i === dailyIdx ? '#fff' : '#2d3748',
            },
            onclick: () => void loadDailyStep(i),
          },
          dailySolved.has(i) ? `Daily ${i + 1} ✓` : `Daily ${i + 1}`,
        ),
      ),
      h(
        'button',
        {
          style: {
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            border: '1px solid #805ad5',
            background: '#faf5ff',
            color: '#553c9a',
          },
          onclick: async () => {
            const marks = [0, 1, 2].map((i) => (dailySolved.has(i) ? '🟩' : '⬜')).join('');
            const text = `XMAS365™ · Day 366 (${dateStr}) ${marks} (${dailySolved.size}/3)`;
            try {
              await navigator.clipboard.writeText(text);
              statusEl.textContent = `Copied: "${text}"`;
            } catch {
              statusEl.textContent = text;
            }
          },
        },
        '📋 Copy Daily Receipt',
      ),
    );
    content.replaceChildren(strip, statusRow, boardHost);
    void loadDailyStep(dailyIdx);
  };

  const tabBar = h('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } });
  const renderTabs = (): void => {
    const anyUnlocked = gameState.unlockedDeskGenreCount() > 0;
    tabBar.replaceChildren(
      h(
        'button',
        {
          style: {
            padding: '7px 14px',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeTab === 'custom' ? '#805ad5' : '#edf2f7',
            color: activeTab === 'custom' ? '#fff' : '#2d3748',
            border: 'none',
          },
          onclick: () => {
            activeTab = 'custom';
            selectedGenre = null;
            clearBoardHost();
            renderTabs();
            renderCustom(false);
          },
        },
        `🔓 Unlocked Puzzles (${gameState.unlockedDeskGenreCount()}/6)`,
      ),
      h(
        'button',
        {
          disabled: !anyUnlocked,
          style: {
            padding: '7px 14px',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: anyUnlocked ? 'pointer' : 'not-allowed',
            opacity: anyUnlocked ? '1' : '0.55',
            background: activeTab === 'daily' ? '#805ad5' : '#edf2f7',
            color: activeTab === 'daily' ? '#fff' : '#2d3748',
            border: 'none',
          },
          onclick: () => {
            if (!anyUnlocked) return;
            activeTab = 'daily';
            clearBoardHost();
            renderTabs();
            renderDaily();
          },
        },
        anyUnlocked ? `📅 Day 366 Daily (${dateStr})` : '🔒 Day 366 Daily',
      ),
    );
  };

  const isPartyDone = gameState.act() === 4;
  const header = h(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      },
    },
    h(
      'h2',
      { style: { margin: '0', fontSize: '20px' } },
      isPartyDone ? '📅 Day 366 · Open Every Day' : "📅 Leap Day's Calendar Desk",
    ),
    h(
      'button',
      {
        style: {
          marginLeft: 'auto',
          flexShrink: '0',
          padding: '6px 12px',
          borderRadius: '8px',
          fontWeight: '700',
          cursor: 'pointer',
          border: '1px solid #cbd5e0',
          background: '#f7fafc',
        },
        onclick: () => {
          clearBoardHost();
          onClose();
        },
      },
      '✕ Close',
    ),
  );

  renderTabs();
  renderCustom(false);
  host.replaceChildren(header, tabBar, content);
}
