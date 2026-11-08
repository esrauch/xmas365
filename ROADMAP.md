# XMAS365™: Roadmap

From where the game stands (2026-11-08) to the finished, polished game.
What the game *is* lives in [GAME.md](GAME.md) (the story is "The story:
Santa's hostile takeover": you are Leap Day, freeing the mascots from XMAS365™);
the full script and beat IDs live in [SCRIPT.md](SCRIPT.md); the puzzle-by-twist
map lives in [PUZZLES.md](PUZZLES.md); build status lives in
[PROTOTYPES.md](PROTOTYPES.md).

## Where we are (completed foundations — revamped 2026-11-08)

- **Puzzles & generators (done):** All six Bases (`Web`, `Carving`,
  `Heartstrings`, `Hops`, `Lights`, `Fireworks`) and all six holiday Twists
  (`Spooky`, `Portioned`, `Snowflake`, `Love-Letter`, `Egg-Hunt`, `Patriotic`)
  generate at easy (`5×5`), medium (`7×7`), and hard (`9×9`) in seconds and are
  pinned by tests. Real-world puzzle names (`Hashi`, `Shikaku`, `Net`,
  `Strands`, `Numbrix`, `Nonograms`) are never shown in user-facing UI.
- **No-Centerpiece Room Progression, 30 Relics & 5-Padlock Mascot Cages (done):**
  - Every room has **7 runs** (`23` puzzles per room, `~140` across the six
    rooms, all `5×5` → `7×7`): **Intro Run** (`5` puzzles, plain Base) → **Home
    Twist Run** (`5` puzzles, the room's own holiday Twist at home, built from
    the former centerpiece runs) → **5 Relic Runs** (`3` puzzles each, one for
    each other holiday, starting with a tiny teaching board). All **36 Base ×
    Twist cells** appear in the story rooms.
  - Only **Thanksgiving** starts open; beating a room's Home Twist Run opens all
    5 of its Relic Runs at once. Bringing the first Relic home to a locked room
    unlocks that room and places the Relic straight onto its shelf.
  - The top of each room holds **5 Relic Shelves** (showing dim silhouettes and
    stranded-room badges when empty) beneath the **Mascot's Cage Shelf** (`5`
    padlocks). Each returned Relic opens one padlock; the **5th Relic** opens
    the cage, freeing the Mascot (who hops off to the **Freed Mascots' Corner**
    in Holiday Hall), restoring the room's full colour and music, and lighting
    its lamp in Holiday Hall. The old centerpiece props stay as room decoration.
- **Free Play on Beaten Rungs & Freed Mascots' Corner (Calendar Desk Removed, done):**
  - The Calendar Desk has been removed (`calendarDesk.ts` deleted). Its spot in
    the right foreground of Holiday Hall is now the **Freed Mascots' Corner**,
    where freed mascots gather and speak a short line when tapped
    (`HALL_MASCOT_LINES`).
  - Tapping any beaten rung of a room's ladder opens a chooser for **Story
    levels** (replay) or endless browser **Free Play** at **`5×5`, `7×7` or
    `9×9`** (`src/gen/worker.ts`) with a solved counter.
- **Zero-churn 3D dioramas, 30 relic props, shelves & cages (done):** All 7
  dioramas (`src/game/dioramas/{hall,thanksgiving,halloween,christmas,valentines,easter,fourth}.ts`)
  are pre-built once at startup with zero WebGL resource churn, complete with
  all 8 procedural low-poly mascots (`leapday`, `santa`, `spider`, `turkey`,
  `snowman`, `bear`, `bunny`, `eaglet`), 30 relic props, 5-padlock cages,
  XMAS365™ acquisition banners/crates, and Hall lamps.
- **Script, Escalation Memos & Hall Corkboard (done):** `src/content/script.ts`
  encodes all memos (with `E1`–`E6` arriving every 5 Relics returned: `5, 10,
  15, 20, 25, 30`), Leap Day one-liners (`T1`–`T3` for relics, shelves, and
  padlocks), mascot lines (`HALL_MASCOT_LINES`), Merger Contract clauses
  (`C0`–`C6`, with CEO Santa standing at his podium in Holiday Hall), and ending
  beats (`Y1`–`Y7`), wired into milestone toasts and the Hall Corkboard.

---

## Completed Architecture: Act 3 & Act 4 Endgame (CEO Santa, 6-Clause × 22-Puzzle Merger Contract & Party)

Once all 30 Relics are returned and all 6 holiday mascots are released
(`lampsLit >= 6`), **CEO Santa** stands at his podium in Holiday Hall as the
clickable hotspot. Tapping Santa opens the **XMAS365™ Master Merger Contract**
modal with a checklist of the **6 Clauses** (`C1`–`C6`, one per puzzle Base).

Tapping any clause opens a **22-puzzle gauntlet** (`N = 22`) of that single
puzzle Base (trimmed from 29 by dropping the plain base and solo twist stages,
since all 36 Base × Twist combinations are now played in the story rooms):

1. **Stage 1 · Twist Reminders (`intro`, Puzzles 1–6 — 6 puzzles):** One
   bite-sized teaching board for each of the 6 Twists (including the room's home
   twist), with an explicit banner reminding how that Twist works on this Base.
2. **Stage 2 · Double Twist (`duo`, Puzzles 7–21 — 15 puzzles):** Every
   pair of Twists $\binom{6}{2} = 15$ at `easy` (`5×5`) or `medium` (`<= 7×7`)
   testing how the two Twists interact (`margin >= 2`).
3. **Stage 3 · All 6 Twists (`all6`, Puzzle 22 — 1 puzzle):** One boss puzzle at
   `easy` or `medium` (`<= 7×7`) combining **all 6 Twists at once** (verified to
   have a unique solution and all 6 twists active).

Across all 6 clauses, this totals **$6 \times 22 = 132$ puzzles**.

---

### Swarm Architecture & File Ownership Rules

To allow subagents to swarm in parallel without merge conflicts:

- **Do NOT modify `src/panels/{lights,hops,pictures,webs,carving,words}/*.json`:**
  Existing panel tests (`tests/panels/*.test.ts`) assert exact file counts in
  `src/panels/`. All clause panels live in `src/proto/puzzles/clauses/`.
- **Strict file isolation per workstream:** Each subagent in a wave edits **only**
  the files listed under its workstream.
- **Bounded CLI & loop rule (`AGENTS.md`):** Prefix every one-off CLI command with
  `timeout --kill-after=5s 30s` and always pass a `Budget` to solver calls.

---

### Wave 0: Shared Contract & State Foundation (Sequential Prerequisite)

- [x] **Workstream 0A — Shared Clause Types & Gimmick Metadata (`src/proto/puzzles/clauses/types.ts`)**
  - **Files owned:** `src/proto/puzzles/clauses/types.ts`
  - **Deliverables:**
    - Define `ClauseGenre = 'webs' | 'carving' | 'lights' | 'words' | 'hops' | 'pictures'`.
    - Define `ClauseSection = 'base' | 'intro' | 'solo' | 'duo' | 'all6'`.
    - Define `ClausePanelItem<P>`:
      ```ts
      export interface ClausePanelItem<P> {
        name: string;
        section: ClauseSection;
        /** Gimmick keys active on this panel (in canonical order). */
        twists: readonly string[];
        /** Short micro-rule pill shown in the header. */
        tip: string;
        /** Clear 1–2 sentence explanation of how the active gimmick(s) work on this panel. */
        explain: string;
        panel: P;
      }
      ```
    - Define `ClauseDef<P>` containing `clauseIndex` (`0..5`), `id` (`'C1'..'C6'`),
      `genre`, `title`, `gimmickOrder` (the 6 gimmick keys in canonical order),
      `gimmickLabels` (emoji + holiday gimmick name + rule summary per gimmick),
      and `panels: ClausePanelItem<P>[]` (length `29`).
    - Export canonical gimmick order and helper to list all 15 pairs `(g[i], g[j])`
      ($0 \le i < j < 6$) in deterministic order.

- [x] **Workstream 0B — Per-Clause & Per-Panel State Tracking (`src/game/state.ts`)**
  - **Files owned:** `src/game/state.ts`
  - **Deliverables:**
    - Storage key helper for clause panels: `clause:<genre>:<panelIdx>` (`0..28`)
      stored in `puzz.proto.panels` (`localStorage`), plus `clause:0`..`clause:5`
      for full clause completion.
    - Add methods on `GameState`:
      - `isClausePanelSolved(genre: string, panelIdx: number): boolean`
      - `markClausePanelSolved(genre: string, panelIdx: number): boolean`
      - `clauseSolvedPanelCount(genre: string): number`
      - `isClauseVoided(clauseIdx: number): boolean`
      - `markClauseVoided(clauseIdx: number): boolean` (marks `clause:${clauseIdx}`
        and, when all 6 clauses `0..5` are voided, calls `this.markRunSolved('clause')`)
      - `voidedClauseCount(): number`

---

### Wave 1: The 6 Clause × 29-Panel Puzzle Packs (6 Parallel Subagents)

Each Wave 1 subagent builds **one** clause module (`src/proto/puzzles/clauses/<genre>.ts`)
and its dedicated Vitest suite (`tests/puzzles/clauses/<genre>.test.ts`).

**Requirements for every Wave 1 Workstream (1A–1F):**
1. Export `CLAUSE_<GENRE>: ClauseDef<Panel>` with exactly **29 panels** in order:
   - Index `0` (`section: 'base'`, `twists: []`): 1 plain base-game panel (`easy`, 4×4 or 5×5).
   - Indices `1..6` (`section: 'intro'`, `twists: [g_i]`): 6 **trivial** teaching
     panels (one per gimmick in `gimmickOrder`), using a tiny board (2×2–4×4, or
     minimal 5×5 where required by a `>= 3×3` snowflake frame) that can be solved
     in a few seconds and clearly re-explains how that gimmick works in this genre.
   - Indices `7..12` (`section: 'solo'`, `twists: [g_i]`): 6 **nontrivial**
     single-gimmick panels (`easy` 5×5 or `medium` `<= 7×7`) with distinct board
     layouts where the gimmick does real deduction work (`problems(panel, 2)` is empty).
   - Indices `13..27` (`section: 'duo'`, `twists: [g_i, g_j]`): All **15 two-gimmick
     combinations** in canonical pair order (`0 <= i < j < 6`), at `easy` (5×5) or
     `medium` (`<= 7×7`), each passing `problems(panel, 2)` with `[]`.
   - Index `28` (`section: 'all6'`, `twists: [...gimmickOrder]`): 1 **all-6-gimmicks**
     boss panel at `easy` or `medium` (`<= 7×7`) where `twistsOf(panel)` contains
     all 6 gimmicks and `problems(panel, 1)` is empty (unique solution + all
     structural twist checks pass).
2. No two panels in the 29-panel array may share the same underlying `rows` layout.
3. Export a Vitest file `tests/puzzles/clauses/<genre>.test.ts` that verifies:
   - `panels.length === 29`
   - Exact section and `twistsOf(p.panel)` match for all 29 panels
   - Every panel has a unique solution (`solve()` returns 1 answer; for Lights with
     `dark`, under `blindDark: true`; for Words, `answers().length === 1` and
     `eachWordOnce()`)
   - All 6 `solo` and 15 `duo` panels pass `problems(p.panel, 2)` with `[]`
   - The `all6` panel (index 28) has all 6 twists active and passes `problems(p.panel, 1)` with `[]`.

#### Workstreams in Wave 1:

- [x] **Workstream 1A — Clause I (`C1`): Halloween · Spiderwebs (`webs`)**
  - **Files owned:** `src/proto/puzzles/clauses/webs.ts`, `tests/puzzles/clauses/webs.test.ts`
  - **Canonical 6 gimmicks (`WEB_TWISTS`):**
    1. `dark` (🎃 Spooky: `?` knot has any thread count `>= 1`)
    2. `letters` (💌 Love Letters: same letter = same thread count, different letters = different counts, fills message blanks)
    3. `colours` (🎆 Red, White & Blue: red and blue knots never join two knots of the same color; white joins anything)
    4. `eggs` (🥚 Egg Hunt: numbered egg knot reached in that exact fewest thread-steps from `🕷` home)
    5. `cuts` (🥧 Portions: threads cannot cross thick fence bars between squares)
    6. `snow` (❄️ Snowflakes: inside the frosty frame, whether two knots are joined mirrors across the icy line)
  - **Notes:** 12/15 duo panels exist in `src/panels/webs/*.easy.json`; the other 3
    (`dark+colours`, `letters+colours`, `letters+eggs`) generate in `<0.4s` via
    `genWebs({ tier: 'easy', twists })`. Build the 6 trivial intros (3×3 / 4×4 / 5×5)
    and the 5×5 or 7×7 `all6` web panel.

- [x] **Workstream 1B — Clause II (`C2`): Thanksgiving · Table Carving (`carving`)**
  - **Files owned:** `src/proto/puzzles/clauses/carving.ts`, `tests/puzzles/clauses/carving.test.ts`
  - **Canonical 6 gimmicks (`CARVE_TWISTS`):**
    1. `dark` (🎃 Spooky: `?` clue stands for a rectangle of any area)
    2. `letters` (💌 Love Letters: same letter = same rectangle area, different letters = different areas, fills message blanks)
    3. `colours` (🎆 Red, White & Blue: rectangles take the color of their red/blue mark; same-color rectangles cannot share an edge)
    4. `cuts` (🥧 Portions: rectangles cannot cross a thick fence line between squares)
    5. `snow` (❄️ Snowflakes: inside the frosty frame, cut lines between rectangles mirror across the icy line)
    6. `basket` (🥚 Easter Baskets: every rectangle must contain one of each food item `🥚`, `🥕`, `🍫` on the board)
  - **Notes:** 10/15 duo panels exist in `src/panels/carving/*.easy.json`; the other 5
    (`dark+colours`, `dark+cuts`, `dark+snow`, `letters+colours`, `letters+snow`)
    generate in `<0.4s` via `genCarve({ tier: 'easy', twists })`. Build the 6 trivial
    intros and the 5×5 or 7×7 `all6` carving panel.

- [x] **Workstream 1C — Clause III (`C3`): Christmas · Fairy Lights (`lights`)**
  - **Files owned:** `src/proto/puzzles/clauses/lights.ts`, `tests/puzzles/clauses/lights.test.ts`
  - **Canonical 6 gimmicks (`LIGHT_TWISTS`):**
    1. `snow` (❄️ Snowflakes: inside the frosty frame, wire pieces mirror across the icy line and turn together)
    2. `dark` (🎃 Spooky: `?` square hides its piece shape—deduce its connections from its neighbors)
    3. `letters` (💌 Love Letters: letter bulbs sit at step distances from the plug that spell the target word)
    4. `eggs` (🥚 Egg Hunt: power reaches each numbered egg in that exact number of wire-steps from its plug)
    5. `colours` (🎆 Red, White & Blue: two plugs, red and blue; each powers its own color while white pieces can join either without mixing)
    6. `slices` (🥧 Portions: each pie slice gets exactly one wire from the center `*`, and no wire crosses a crust wall between slices)
  - **Notes:** 12/15 duo panels generate directly via `genLights` at `easy`/`medium`;
    synthesize `letters+eggs`, `snow+colours`, and `snow+slices` (plus the 6 trivial
    intros and the `<= 7×7` `all6` lights panel) and verify with `lightProblems`.

- [x] **Workstream 1D — Clause IV (`C4`): Valentine's · Heartstrings (`words`)**
  - **Files owned:** `src/proto/puzzles/clauses/words.ts`, `tests/puzzles/clauses/words.test.ts`
  - **Canonical 6 gimmicks (`WORD_TWISTS`):**
    1. `dark` (🎃 Spooky: `?` tile hides its letter until a word through it is traced)
    2. `letters` (💌 Love Letters: numbers `1, 2, ...` on tiles stand for secret letters in a board-wide cipher)
    3. `colours` (🎆 Red, White & Blue: bowed letters reveal their word's red or blue color; two words of the same color never touch orthogonally)
    4. `eggs` (🥚 Egg Hunt: a numbered egg tile is at that 1-based letter index in its word)
    5. `cuts` (🥧 Portions: a word path cannot step across a thick fence bar or diagonally through a fenced corner)
    6. `snow` (❄️ Snowflakes: inside the frosty frame, words come in mirror-footprint pairs across the icy line)
  - **Notes:** 9/15 duo panels exist in `src/panels/words/*.easy.json`; the other 6
    (`dark+letters`, `dark+eggs`, `dark+cuts`, `letters+colours`, `letters+cuts`,
    `colours+eggs`) generate in `<0.4s` via `genWords({ tier: 'easy', twists })`.
    Build the 6 trivial intros (3×3 / 4×4 / 5×4) and the `<= 7×6` `all6` words panel.

- [x] **Workstream 1E — Clause V (`C5`): Easter · Bunny Hops (`hops`)**
  - **Files owned:** `src/proto/puzzles/clauses/hops.ts`, `tests/puzzles/clauses/hops.test.ts`
  - **Canonical 6 gimmicks (`HOP_TWISTS`):**
    1. `courses` (🥧 Portions: outlined lawn courses; a bunny must finish every square in a course before leaving it)
    2. `colours` (🎆 Red, White & Blue: two bunnies, Red and Blue, each starting at its own `1` egg and hopping on its own color; white squares go to either)
    3. `burrows` (🥚 Burrows: matching burrow holes connect underground as a single hop)
    4. `snow` (❄️ Snowflakes: inside the frosty frame, hop segments mirror across the icy line)
    5. `letters` (💌 Love Letters: letter eggs must be visited on the hop numbers in the blanks to spell the target word)
    6. `dark` (🎃 Spooky: shadowed `?` squares hide whether they are lawn or rock; the final numbered egg gives the bunny's total route length)
  - **Notes:** 14/15 duo panels generate in `<0.4s` via `genHops({ tier: 'easy', twists })`;
    synthesize `snow+dark` (from `hops/snow.easy.json` panel 1 with rock at `[0,0]`
    and dark at `[[0,0],[0,2],[0,3]]`, already verified `hopProblems(p, 2) === []`),
    plus the 6 trivial intros and the `<= 7×7` `all6` hops panel.

- [x] **Workstream 1F — Clause VI (`C6`): Fourth of July · Fireworks (`pictures`)**
  - **Files owned:** `src/proto/puzzles/clauses/pictures.ts`, `tests/puzzles/clauses/pictures.test.ts`
  - **Canonical 6 gimmicks (`PICTURE_TWISTS`):**
    1. `dark` (🎃 Spooky: `?` in a row or column clue is a filled run of any length `>= 1`)
    2. `letters` (💌 Love Letters: letter clues stand for run lengths; same letter = same length, different letters = different lengths, filling the message blanks)
    3. `colours` (🎆 Red, White & Blue: clues come in Red and Blue; same-color runs need a gap, while Red and Blue runs can touch directly)
    4. `eggs` (🥚 Egg Hunt: a numbered egg square is filled and is the $n$-th filled square from the left in its row)
    5. `portions` (🥧 Portions: outlined regions on the grid each contain the exact same number of filled squares)
    6. `snow` (❄️ Snowflakes: inside the frosty frame, filled squares mirror across the icy line)
  - **Notes:** 13/15 duo panels generate in `<0.4s` via `genPics({ tier: 'easy', twists })`;
    use the verified 6×6 `eggs+snow` and `portions+snow` panels (`picProblems(p, 2) === []`),
    plus the 6 trivial intros and the `<= 7×7` `all6` pictures panel.

---

### Wave 2: Merger Contract UI, 3D Hall Staging & Endgame Flow (3 Parallel Subagents)

Once Wave 0 (and Wave 1 exports) are in place, 3 subagents can build the UI, 3D
diorama staging, and shell flow in parallel:

- [x] **Workstream 2A — Merger Contract 6-Clause Checklist & 29-Panel Runner (`src/proto/puzzles/clause.ts`, `src/proto/puzzles/clauses/index.ts`)**
  - **Files owned:** `src/proto/puzzles/clauses/index.ts`, `src/proto/puzzles/clause.ts`
  - **Deliverables:**
    - `src/proto/puzzles/clauses/index.ts` aggregates `ALL_CLAUSES = [CLAUSE_WEBS, CLAUSE_CARVING, CLAUSE_LIGHTS, CLAUSE_WORDS, CLAUSE_HOPS, CLAUSE_PICTURES]`.
    - Update `clause.mount(host, ctx)` with two views:
      1. **Contract Checklist View (`MASTER MERGER & SUBSUMPTION AGREEMENT`)**:
         - Displays the legal header (`C0`) and a 6-card checklist (`Clause I`–`Clause VI`).
         - Each clause card shows its legal text from `CONTRACT_CLAUSES`, a progress
           pill (`X / 29 Panels`), a 5-stage mini-breakdown (`Base · 6 Intro · 6 Solo · 15 Duo · All-6`),
           and a red **`VOIDED ✗`** stamp when all 29 panels in that clause are solved.
         - Tapping any clause opens that clause's 29-panel run at the first unsolved panel.
      2. **Clause 29-Panel Runner View**:
         - Top bar with **`← Contract Checklist`** button, Clause badge (`Clause I · Spiderwebs`),
           and `↺ Reset`, `💡 Hint`, `?` controls.
         - Section-grouped progress strip (`Base [1]`, `Intro [2–7]`, `Solo [8–13]`,
           `Combos [14–28]`, `All-6 [29]`) with clickable pips and auto-advance on solve.
         - Prominent **Gimmick Explanation Banner** above the board displaying
           `item.explain` (especially clear on the 6 trivial `intro` panels and the
           `duo`/`all6` quirk tests).
         - When the 29th panel of a clause is solved, marks the clause voided
           (`gameState.markClauseVoided(clauseIdx)`), dispatches a clause-voided
           event/callback, and returns to the Checklist View (or triggers `ctx.solved()`
           when all 6 clauses are voided).

- [x] **Workstream 2B — 3D Holiday Hall Staging: CEO Santa Hotspot & Surprise Party (`src/game/dioramas/hall.ts`)**
  - **Files owned:** `src/game/dioramas/hall.ts`
  - **Deliverables:**
    - Pre-build all Act 3 and Act 4 3D groups once inside `buildHallScene()` with
      zero WebGL resource churn (`syncState()` only toggles `.visible` and transforms):
      1. **CEO Santa Center-Stage Hotspot (`santaConfrontGroup`)**:
         - Visible when `lampsLit >= 6` and the contract is not yet voided (`!finaleSolved || !partyStarted`).
         - Positions CEO Santa (`buildMascot('santa')`) in the center of Holiday Hall
           holding the Merger Contract clipboard, registered as the clickable hotspot
           for `tuesday` (`🎅 CEO Santa · XMAS365™ Merger Contract`, sublabel
           `${voided}/6 Clauses Voided · Tap to Red-Line!`).
      2. **Act 4 Surprise Party & 3D Birthday Cake Table (`partyCakeGroup`, `partyGuestsGroup`, `partyHatGroup`)**:
         - Visible once all 6 clauses are voided (`finaleSolved`).
         - Festive 3D multi-tier Birthday Cake table in the center of Holiday Hall
           with 6 holiday-colored tiers and lit candles, surrounded by all 6 freed
           mascots + humbled Santa, with Leap Day wearing his party hat.

- [x] **Workstream 2C — Shell Narrative Beats, Return CTA & Credits Modal (`src/main.ts`)**
  - **Files owned:** `src/main.ts`
  - **Deliverables:**
    - Add a **`← Return to Holiday Hall ▸`** button to a freed relic's completion banner
      (`proto.kind === 'relic'`), so carrying it home is a one-click trip. (Built before the
      revamp for centerpieces; centerpieces are gone, see `revamp-centerpieces.md`.)
    - Wire clause completion (`C1.torn`..`C6.torn`) so voiding each clause queues its
      Santa/Leap Day dialogue beat.
    - When `C6.torn` is dismissed (all 6 clauses voided), call `rebuildScene()` so
      Holiday Hall transforms into the 3D Surprise Party while `Y1` → `Y2` → `Y4` play.
    - When `Y4` is dismissed, open the celebratory **Day 366 · Xmas12 Victory & Credits
      Modal (`Y6`)**, which on close triggers Santa's post-credits memo (`Y7`).

---

### Wave 3: Integration, Full Test Suite & Playtest Polish

- [x] **Workstream 3A — Integration & Full Verification (`tests/puzzles/clause.test.ts`)**
  - **Files owned:** `tests/puzzles/clause.test.ts`
  - **Deliverables:**
    - Verify `ALL_CLAUSES` has 6 clauses × 29 panels = 174 valid panels.
    - Run `timeout --kill-after=5s 30s bash -c 'npm run format && npm run lint && npm run typecheck && npm test'`
      and verify 100% green tests, lint, and typecheck.

---

### Future Phases (Post-Revamp)

#### Phase 3: Freed Mascot Bonus Runs & Party Hats
- Optional hard bonus runs (`T5`/`H5`/`X5`/`V5`/`A5`/`F5`) for each freed mascot.

#### Phase 4: Sound & Music Moods
- Procedural corporate-muzak vs. restored-holiday room themes and milestone SFX.

#### Phase 5: The Lighter Layer (Shelf Hints & Clickable Gags)
- Hint lines on the 30 empty Relic Shelves (`<room>.hint.<relic>`) and clickable room gags around the XMAS365™ branding.

#### Phase 6: Tuning, Accessibility & Release Polish
- Color-blind secondary cues, mobile viewport polish, optional post-release daily puzzle, and final release checks.
