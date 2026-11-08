# Puzz: Roadmap

From where the game stands (2026-11-07) to the finished, polished game.
What the game *is* lives in [GAME.md](GAME.md) (the story is "The story:
Santa's hostile takeover": you are Leap Day, freeing the mascots from Xmas365);
the full script and beat IDs live in [SCRIPT.md](SCRIPT.md); the puzzle-by-twist
map lives in [PUZZLES.md](PUZZLES.md); build status lives in
[PROTOTYPES.md](PROTOTYPES.md).

## Where we are (completed foundations)

- **Puzzles & generators (done):** All six genres (`Spiderweb`, `Carving`,
  `Heartstrings`, `Bunny Hops`, `Lights`, `Fireworks`) and all six holiday twists
  generate at easy, medium, and hard in seconds and are pinned by tests. Real-world
  puzzle names (`Hashi`, `Shikaku`, `Net`, `Strands`, `Numbrix`, `Nonograms`) are
  never shown in user-facing UI.
- **Guided opening & Room Ladder UX (done):** Only Thanksgiving starts open
  (with its big Warm-up button). Other rooms start locked until you bring one of
  their two eligible home items (**"Restore Item & Unlock Room"** → **Warm-up**).
  Beating a room's warm-up reveals the two-tier **Room Ladder UX** (completed
  green warm-up branching up to the two stray runs at the bottom; two non-puzzle
  return-item sockets feeding up into the centrepiece unlock at the top).
- **Calendar Desk progression (done):** Reclaims each holiday's warm-up and
  standard generator when its warm-up is beaten, and all twists when its
  centrepiece is beaten, alongside the daily puzzle and custom mixer.
- **3D mascots, cages & acquired room stages (done):** All 8 procedural low-poly
  mascots (`leapday`, `santa`, `spider`, `turkey`, `snowman`, `bear`, `bunny`,
  `eaglet`) are built in `src/game/mascots.ts` with Wind-Waker-style ink outlines
  and wired into `src/game/diorama.ts`, complete with cages, Xmas365 acquisition
  banners/crates that peel back as items are restored, drained-to-restored room
  palettes, and Hall lamps.
- **Script & corpspeak memos (done):** Every memo, Leap Day one-liner, mascot
  caged/freed/bonus line, Merger Contract clause, and ending scene is written in
  [SCRIPT.md](SCRIPT.md).

---

## Remaining plan to complete the game

Phases run in order; each ends in a playable milestone verified by `npm run check`
and a phone/browser playtest.

### Phase 1: Wire `SCRIPT.md` into the game shell & Hall Corkboard (Next Up)

Replace the legacy 4-act story code (`SHADOW_NOTES`, `TUESDAY_NOTES`,
`MILESTONE_VIGNETTES` in `src/game/state.ts` and `src/main.ts`) with the
Xmas365 / Leap Day story from [SCRIPT.md](SCRIPT.md).

- **Script content module (`src/content/script.ts`):** Encode all beats from
  `SCRIPT.md` (`P1`, `T1`, room entry memos `H1`/`X1`/`V1`/`A1`/`F1`, stray-freed
  beats `*2a`/`*2b`, item-returned beats `*3a`/`*3b`, mascot-freed thank-yous
  `*4`, escalating Santa memos `E1`–`E6`, caged/freed mascot barks `*0`,
  contract clauses `C0`–`C9`, and party ending `Y1`–`Y7`).
- **Clean puzzle panels:** Remove the old per-panel villain notes inside puzzle
  modals so panels show rules only.
- **Milestone beat cards:** Show a crisp memo/dialogue toast in the shell when
  a milestone fires (first room entry, stray freed, item returned, mascot freed),
  pairing the found Xmas365 memo with Leap Day's dry one-liner (and the mascot's
  thank-you when a cage opens).
- **The Hall Corkboard:** Add a clickable Corkboard in Holiday Hall where every
  found Xmas365 memo is pinned up to reread in order.
- **Player as Leap Day:** Rename remaining `Tuesday` UI labels in the Hall,
  Finale modal, and Calendar Desk to **Leap Day**, **Xmas365 Merger Contract**,
  and **Day 366**.

*Done when:* A full playthrough triggers every beat from `SCRIPT.md` in the
shell, panels are clean, found memos accumulate on the Hall Corkboard, and zero
legacy Shadowy Figure / Tuesday text remains.

### Phase 2: The Finale — Merger Contract, Santa Confrontation & Cake Relay

Build the two-stage climax in Holiday Hall (`SCRIPT.md`, "The Finale").

- **The Merger Contract (`C0`–`C6`):** Frame the 12 two-twist finale panels as
  the **6 Clauses of the Xmas365 Perpetual Holiday Merger Contract** (2 sub-panels
  per clause). Solving each clause plays a tear-up animation and triggers Santa's
  escalating clause memo + Leap Day's retort (`C1`–`C6`).
- **The Loophole & CEO Santa Confrontation (`C7`–`C9`):** When Clause VI is torn
  up, CEO Santa (`santa` mascot in his red business suit and green tie) appears
  in Holiday Hall demanding *"Who are you?!"*, discovers **Day 366** isn't in his
  365-day contract, and watches the contract void itself.
- **The Cake Relay (`Y2`):** Design and build the single multi-stage finale board
  where all 6 genres collaborate to build Leap Day's 6-tier birthday cake:
  1. `Fireworks`: paint the cake silhouette
  2. `Heartstrings`: trace the frosting message across the cake
  3. `Carving`: slice the cake into fair portions without cutting words
  4. `Bunny Hops`: hop slice-by-slice to place the toppings
  5. `Lights`: wire the birthday candles from the plug
  6. `Spiderweb`: spin celebratory bunting between the lit candles
- **Leap Day's Party & Xmas12 (`Y1`, `Y3`–`Y7`):** Transition Holiday Hall into
  the party scene with all 6 freed mascots and humbled Santa (rebranded to
  **Xmas12**), crown Leap Day **"Day 366 (Every Year)"**, and present the credits
  screen.

*Done when:* The game can be played from the opening memo all the way through
the Merger Contract, the Cake Relay, and the Party ending.

### Phase 3: Freed Mascot Bonus Panels & Party Hats

Give each freed mascot their post-rescue optional challenge (`SCRIPT.md`,
`T5`/`H5`/`X5`/`V5`/`A5`/`F5`).

- **Mascot interaction:** Tapping a caged mascot shows their caged line (`*0`);
  tapping a freed mascot offers their **3 hard bonus panels** (pinned from that
  room's generator).
- **Visible rewards:** Completing a mascot's bonus run awards a festive **party
  hat** on the mascot (worn in their alcove and in the Hall party) and a special
  room trophy decoration, plus their completion line (`*5` done).

*Done when:* Every freed mascot offers a 3-panel bonus run that visibly upgrades
the mascot and room upon completion.

### Phase 4: Sound & Music Moods

Bring the house to life with procedural audio (`src/audio`).

- **Two music moods per room:** Acquired rooms play a dreary, muzak-ish corporate
  Christmas loop; restored rooms play their own holiday theme; Holiday Hall and
  Leap Day's Party have their own themes.
- **Milestone SFX & camera moments:** Distinct synthesized chimes/flourishes for
  freeing a stray, slotting a returned item, opening a mascot's cage + lighting a
  Hall lamp (with a brief camera focus), finding a memo, and tearing up a
  contract clause.

*Done when:* Every room transition and progression milestone has clear musical
and sound feedback.

### Phase 5: The Lighter Layer (Hidden Strays & Clickable Gags)

Add the toy-theatre exploration layer between puzzles (`GAME.md`, "Room left for
a lighter layer").

- **Finding the strays:** Strays start tucked behind a room prop with a short
  riddle/memo clue hinting where to spot them; tapping the hiding spot reveals
  the stray and opens its puzzle run.
- **Clickable room gags:** Add 2–3 clickable diorama props per room (especially
  around the Xmas365 corporate signage and holiday mash-ups) that play a quick
  toy-theatre animation and a dry Leap Day one-liner.

*Done when:* Exploring each diorama rewards curiosity with visual gags and
riddle-guided stray discovery.

### Phase 6: Tuning, Accessibility & Release Polish

Final verification for mobile and desktop release (`TECHNICAL.md`).

- **Puzzle & UX polish:** Tune panel difficulty ordering based on playtest notes
  and resolve open UX items in `PROTOTYPES.md` (e.g. Pumpkin Pie slice badge,
  Easter hop curve).
- **Accessibility:** Ensure red/blue/green puzzle elements have secondary
  shape/pattern cues for color-blind readability; verify text contrast and touch
  targets on mobile portrait viewports.
- **Title screen, saves & performance:** Add a clean title/continue overlay,
  verify save persistence and reset flows, confirm steady 60 fps and `< 5 MB`
  bundle size, and run a full start-to-finish playtest.
