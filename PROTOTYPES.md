# Puzzle prototypes: status, audit and next steps

Working notes for the 19 puzzle prototypes (design in [GAME.md](GAME.md)).
Play them at `npm run dev` → `/dev/puzzles.html` (port 5176; `?p=<id>` for
one puzzle). Code: `src/proto/` (kit, page, one file per puzzle, rules as
plain functions); tests in `tests/puzzles/` prove each level is solvable
(and, where it matters, has exactly one answer or a known best solution).
Prototypes are deliberately unthemed: they test whether each puzzle is fun.

## Where things stand (2026-11-07)

- **Puzzles:** all six genres (Spiderweb, Carving, Heartstrings, Hops,
  Lights, Fireworks) generate the plain puzzle and every twist (Love Letters,
  Snowflakes, Spooky, Egg Hunt, Red White and Blue, Portions) at easy,
  medium and hard, in seconds, offline (`tools/make-panels.ts`) or in the
  browser (the workshops, through a Web Worker). Every room is rebuilt on the
  current twist set; Santa's merger contract is six two-twist panels.
- **Game shell:** Holiday Hall (a 3D rotunda: the hall plus six alcoves),
  room runs, carried items and placement, lamps, the Calendar Desk (daily
  puzzle and mixer), and a step hint on every board.
- **Story redesigned** (`GAME.md`, "The story"): you are Leap Day, freeing
  the mascots from XMAS365™, Santa's hostile takeover of all 365 days. The code still runs
  the older story (a Shadowy Figure, then Tuesday unmasked, then Santa), to
  be replaced.
- **Next:** `ROADMAP.md`.

## Status by puzzle (after three rounds of playtesting)

| Room | Puzzle (`?p=`) | Kind | Status |
|---|---|---|---|
| Valentine's | Love Notes (`lovenotes`) | warm-up | **New direction, built:** 5 Strands panels (LOVE on a 2×2, up to a 6×6 with a spangram). Needs playing. |
| Valentine's | Jack-o'-Lantern (`jack`) | stray | **Built:** 3 Strands panels with letters in the dark (Halloween). Needs playing. |
| Valentine's | Bunny's Basket (`basket`) | stray | **Built:** 3 Strands panels with numbered eggs (a letter's place in its word; Easter). Needs playing. |
| Valentine's | Valentine Mailbox (`mailbox`) | centrepiece | **Built:** 5 Strands panels with letters written as numbers (a codeword key fills in), 1 to 6 coded letters, ending on "Dear Valentine" (spangram BE MY VALENTINE). Needs playing. |
| Easter | The Hutch (`hutch`) | warm-up | **New direction, built (switched to Numbrix):** 5 panels (one step, a little run, every spot, numbered eggs, a first real hunt). Knight hops were too hard. Needs playing. |
| Easter | Star-Spangled Flag (`flag`) | stray | **Built:** 3 panels with parade flags (a flag gives the number of the bunny's first visit to its row or column). Needs playing. |
| Easter | Cornucopia (`cornucopia`) | stray | **Built:** 3 panels of courses (any connected shapes; finish each before the next). Needs playing. |
| Easter | Egg Tree (`eggtree`) | centrepiece | **Built:** 5 tree panels, burrows (joined pairs) on two of them, the Golden Egg the last hop at the top. Needs playing. |
| Fourth of July | Sparklers (`sparklers`) | warm-up | **New direction, built:** 5 picture-grid panels (a full line, a gap, a heart, a star, a rocket). Needs playing. |
| Fourth of July | Cupid's Bow (`bow`) | stray | **Built:** 3 panels with letter clues (Valentine's) and messages LOVE, KISS ME, HUGS. Needs playing. |
| Fourth of July | Witch's Broom (`broom`) | stray | **Built:** 3 panels with dark clues (Halloween): pumpkin, broom, bat. Needs playing. |
| Fourth of July | Grand Finale (`finale`) | centrepiece | **Built:** 5 panels: a big burst, then colour (red and blue, a rocket, three colours, the Grand Finale). Needs playing. |
| Halloween | Porch Cobwebs (`cobwebs`) | warm-up | **New direction, built:** 6 Hashi panels, one rule each (one thread, doubles, sharing out, no crossing, one web, a first web). Needs playing. |
| Halloween | Box of Chocolates (`chocolates`) | stray | **Built, reworked once:** 3 panels, Valentine's letters (same letter, same count), each with a message of numbered blanks (blank n = the letter with n threads): 1OV2, B2 M1N2, I 1234 YOU (I DARE YOU, or is it I READ YOU?). Words and web help each other. Needs playing. |
| Halloween | Tree-Top Star (`starlights`) | stray | **Built:** 3 panels, Christmas bulbs (threads only red to green); the last is one string from plug to star. Needs playing. |
| Halloween | Spider's Web (`web`) | centrepiece | **Built:** 5 panels: the big plain web, dark knots (Jack-o'-Lantern), diagonals (Witch's Broom), both, then a 9×8 web with everything. Needs playing. |
| Thanksgiving | Bread Board (`breadboard`) | warm-up | **New direction, built:** 5 Shikaku panels (one portion, size counts, shape matters, every square, a first board). Needs playing. |
| Thanksgiving | Hot Dog (`hotdog`) | stray | **Built, reworked twice:** clues from the edge are cookout flags on skewers (how many pieces the skewer goes through; was "grill marks"). 2 training panels with no numbers come first (5 panels); a wrong skewer is counted out with numbered badges and a message; tapping a flag counts its line. Needs playing. |
| Thanksgiving | Stocking (`stocking`) | stray | **Built:** 3 panels, Christmas's red and green (same-colour portions can't touch; plain ones can). Needs playing. |
| Thanksgiving | Feast (`feast`) | centrepiece | **Built, reworked once:** 5 panels, fair shares only (a centrepiece uses only its own twist; red and green there confused): big plain carve, one of each dish, with sizes, seconds (two cranberries each), a 7×7 table with no numbers. The share is shown above the board. Needs playing. |
| Christmas | Fairy Lights (`fairylights`) | warm-up | **New direction, built:** 6 Net panels (one turn, corners, a branch, no loose ends, everything lit, a first string). Needs playing. |
| Christmas | Golden Egg (`goldenegg`) | stray | **Built:** 3 panels on egg-shaped boards, Easter's numbered eggs (reach the egg in exactly its number of steps). Panel 3's eggs are far up (14, 15): playtest. |
| Christmas | Pumpkin Pie (`pumpkinpie`) | stray | **Built, reworked once:** one serving per slice (no wires between slices; each slice gets exactly one wire from the middle), on pies of 2, 4, 6 slices. Was "same number of wires into every slice": far too hard. Needs playing. |
| Christmas | Christmas Tree (`tree`) | centrepiece | **Built, reworked once:** colours only make Net easier, so it now ramps: a little plain tree, red and green strings (each from its own plug), a taller one, then white lights (either string) on a wreath and the big tree (~40% white). Needs playing. |
| Finale | The merger contract (`clause`) | final | **Built:** 6 Clauses × 29 panels = 174 panels (`src/proto/puzzles/clause.ts` + `src/proto/puzzles/clauses/`): each clause covers one genre through 1 base panel, 6 trivial gimmick refreshers, 6 solo gimmick panels, all 15 two-gimmick combos, and 1 all-6 boss panel, followed by Leap Day's 3D surprise party in Holiday Hall. |

Pattern from playtesting: a first version often makes a good **learning level**
before a real one; puzzles now ramp over 2–4 levels.

## Audit against the inspiration games (`inspiration/`)

**Puzzle types.**
- **Covered:** chess placement (Golden Egg), toggles (Egg Flag), sliding and swapping (Parade, Feast), fitting pieces (Shadows, Pie), division and measuring (Platter, Stocking).
- **Stronger than the originals:** pure logic (Admirers, Web, Cupid's grid, weighings, schedule). That's our modern turn.
- **Gaps:**
  1. **Routes and mazes:** (the Egg Tree's knight's tour now starts to fill this) a signature type of the originals (heart maze, altar maze, dollhouse, dice, pool table, card and coin "visit every square"), and we have none.
  2. **Words:** light (Jack, Mailbox); the planned riddle layer is where *11th Hour* put most of its.
- **Left out on purpose:** memory and sequence, board games against the host, sliding-tile pictures.
- **Overlap:** Parade and Feast are both slide-the-pieces search puzzles, the type the originals are most criticised for.

**Structure.**
- **Learning levels:** the originals give no warm-up; our learning levels fix that, but 19 puzzles have become about 32 solves. **Use the originals' answer:** Clandestiny's "Nervous/Brave" modes and Dr. Brain's Novice/Expert/Genius. Make learning levels optional, a difficulty choice.
- **Hints:** our biggest gap. *7th Guest* had a hint book (the third hint solves it), Dr. Brain hint coins, Clandestiny an easier mode, UHS graded hints. We have only the jack's glowing letters.
- **Matched well:** free order (*Safecracker*), centrepiece gating, the meta finale (*Fool's Errand*), rules explained up front.
- **Still to come:** the lighter layer (riddles, gags) and the found XMAS365™ memos.

**Room balance** (the centrepiece should be the room's hardest).
- **Egg Tree:** replaced by the knight's tour; only its learning level exists so far.
- **Feast:** probably weaker than its own stray.
- **Grand Finale:** untested in its new role.
- **Fine:** Web, Tree level 2, Mailbox.

## New direction (2026-11-02)

The game is now about 100 small, clicky panels, *The Witness*-style: a
genre per room, runs that add twists, and a final area crossing genres. See
GAME.md, "Direction". The round-one prototypes below become material: those
that fit a room's genre become panels. **Current focus: the Halloween web
run** (GAME.md, "Halloween: the web run"): built as 17 panels in four runs
(`cobwebs`, `chocolates`, `starlights`, `web`), replacing round one's Trick or
Trade and Star in the Shadows (in git history at d0d65b3).

How it's built, for the other rooms to follow:
- `src/proto/hashi.ts`: Hashi rules and twists, a solver with propagation
  (counts answers in milliseconds), and a random web generator.
- `src/proto/hashiBoard.ts`: the clicky panel (drag between knots, refusals
  flash, pieces coloured when split, chime and buzz when solved).
- `src/proto/run.ts`: a room's run of panels (strip, ticks, Next); any genre
  can use it.
- Thanksgiving follows the same pattern: `src/proto/shikaku.ts` (rules,
  twists, exact-cover solver, carving generator), `src/proto/shikakuBoard.ts`
  (drag a rectangle, tap to lift), `src/proto/puzzles/thanksgiving.ts`.
  Round one's Hot Dog Platter, Stuffed Stocking (weighings) and Feast are
  in git history at 4d830bc; the Platter lives on as fair shares.
- Christmas: `src/proto/net.ts` (rules, twists, solver checked against brute
  force, tree/egg/pie/wreath shapes, generator), `src/proto/netBoard.ts`
  (tap to turn, long-press to pin), `src/proto/puzzles/christmas.ts`. Round
  one's Golden Egg Ornament (queens), Pie in a Tin and Christmas Tree are in
  git history at 4d830bc.
- Valentine's: `src/proto/strands.ts` (rules, checks, a generator that lays
  words out to fill the grid without crossing), `src/proto/strandsBoard.ts`
  (drag through letters), `src/proto/puzzles/valentines.ts`. Word lists are
  hand-written; tests check every word has exactly one spelling. Round one's
  Jack-o'-Lantern, Secret Admirers and Mailbox are in git history at 4d830bc.
  No hints yet (Strands' non-theme-word hints need a dictionary).
- Easter: `src/proto/hops.ts` (Numbrix rules, twists, solver checked against
  brute force, with dead-end, reachability and connectivity pruning, and a
  step budget for the level search; random routes), `src/proto/hopsBoard.ts`
  (drag to draw the trail), `src/proto/puzzles/easter.ts`.
  Round one's Egg-Carton Flag, Woven Cornucopia and Egg Tree are in git
  history at a2d466c.
- Fourth of July: `src/proto/picture.ts` (clues, colour runs, a line-logic
  solver checked against brute force; letters checked by trying every value),
  `src/proto/pictureBoard.ts` (tap or drag to paint, colour bar),
  `src/proto/puzzles/fourth.ts`. Pictures hand-drawn, nudged a few squares by
  a search until line logic alone solves them. Round one's Cupid's Bow, Witch's
  Parade and Grand Finale are in git history at 202ad1c.
- Finale (`clause`): `src/proto/puzzles/clause.ts` and `src/proto/puzzles/clauses/`
  hold CEO Santa's 6-Clause Merger Contract (6 clauses × 29 panels = 174 verified
  panels across `webs.ts`, `carving.ts`, `lights.ts`, `words.ts`, `hops.ts`, and
  `pictures.ts`). Each clause runs through 1 base panel, 6 trivial gimmick
  intros, 6 solo-gimmick boards, all 15 two-gimmick combinations, and 1 all-6
  boss board. Voiding all 6 clauses triggers the 3D Surprise Party in Holiday
  Hall (`src/game/dioramas/hall.ts`). Round one's Tuesday is in git history at
  202ad1c.
- Panels were found by searching generated webs for one answer, plus the
  property each teaches (the rule must matter: relax it and there are more
  answers). Big diagonal webs are rarely unique (~1 in 100); search for a
  unique web first, then darken knots one at a time while it stays unique.
  Tests pin it all (tests/puzzles/halloween.test.ts).

## For the UX pass (later)

- Pumpkin Pie: the per-slice serving badge ("1") reads oddly.
- Easter: difficulty wants further tuning. Knight hops were far too hard;
  plain steps with over-clued boards were trivial; minimal clues with the
  hardest-of-many search came out a little too hard; adding an egg marked 1
  to every panel is the current state. Lever: the per-panel cap on solver
  work in the search (scratch script hard.ts; see GAME.md, Easter).

## Next steps (round one; largely superseded by the new direction)

1. **Hint system:** graded hints for every puzzle (perhaps Tuesday's grudging notes).
2. **Optional learning levels**, Nervous/Brave style, to keep the game near the originals' length.
3. **Replace or upgrade the Feast**, e.g. a "serve every guest exactly once" route puzzle: fills the route gap and makes Thanksgiving's centrepiece its hardest.
4. **Playtest the unplayed six:** Admirers, Parade, Trade, Shadows, Feast, Tuesday (Parade and Trade first, the likeliest to feel like searching).
5. **Decide:** the Mailbox's key sources.

## Working notes

- None of the prototype work is committed yet (`src/proto/`, `tests/puzzles/`,
  `dev/puzzles.html`, GAME.md edits, `tools/screenshot.ts` PAGE/VIEW
  options). Commit only when asked; never push.
- Designing a level: search for one with the property you want (unique answer,
  a minimum move count, logic-only for picture grids), then pin it with a test.
  Several were found with throwaway Python searches; the tests re-check them.
- `PAGE=/dev/puzzles.html?p=<id> VIEW=1100x760 npm run screenshot -- 0 "" name`
  captures one puzzle headlessly.
