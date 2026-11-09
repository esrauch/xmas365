# Making Compelling Puzzles: Generator & Twist Design Guide

How to make procedurally generated logic panels feel hand-crafted, fair, and surprising. Whereas [`PUZZLES.md`](PUZZLES.md) maps the $6 \times 6$ matrix of base puzzles and holiday twists and [`TECHNICAL.md`](TECHNICAL.md) covers the engine architecture, this guide captures the **design rules, failure modes, concrete Do/Don't examples, and external precedents** learned from building and auditing Puzz's generators (`src/gen/`).

---

## 1. The Seven Laws of Compelling Generated Puzzles

### 1.1 Solution-First Construction, Solver-Guided Minimization
Never scatter random clues onto a blank grid and hope a unique puzzle emerges. Every generator in `src/gen/` works backwards:
1. **Grow a valid, well-shaped ground-truth solution** (`make.ts`) with intentional structural loops or pockets of ambiguity.
2. **Derive complete clues** from that truth, then hide clues (`dark`, `letters`) to open up candidate solutions.
3. **List candidate answers or prune clues against the solver** (`clues.ts`, `solve.ts`), adding twist clues only while they eliminate rival solutions and then **stripping away every clue that the remaining clues render redundant**.

### 1.2 Every Twist Must Do Work: Constraint or Hint
A twist is only pointless if it offers **neither a constraint nor a hint**. A twist or clue can earn its place on the board in two ways:
- **As a constraint (eliminating rival solutions):** Without the twist (`without(panel, t)`), the board admits multiple valid solutions (`margin` in the generators), and the twist is what narrows the board down to its unique answer.
- **As a hint or shortcut (guiding the player's deduction):** Even when the board's final answer is already mathematically unique without the twist, a twist does real work if it helps the player *find* or *verify* steps along the way:
  - In `Words` (`src/gen/words/verify.ts`), whole-board partitions hardly ever have multiple solutions; instead, a twist (`eggs`, `colours`, `cuts`, `snow`) acts as a local guide that settles which path an individual word traces so the player isn't left hunting through false word paths.
  - In `Letters`, guessing the message word from a few solved blanks is a legitimate shortcut (`PUZZLES.md`) that hands the player the remaining counts.
  - In `Carving` (`colours`) and `Words` (`bows`), extra colour marks are kept beyond the minimal mathematical set (`keepSpare` / marking every colourable portion) so the colours read as a coherent pattern and give useful local hints rather than looking like stray dots.
- **When a twist is genuinely pointless:** A twist or clue fails when it neither constrains the solution space nor gives the player a useful hint—for example, an egg that only confirms an already-obvious 1-step connection, a white square trapped inside a single colour's interior where the other colour can never reach it, or a single letter clue with no cross-reference.

### 1.3 Clues Must Refute the Obvious Path, Never Confirm It
When a player looks at a plug, a spider's home knot, or a numbered gap on a trail, their eye immediately traces the shortest, straightest route.
- A clue that sits on that shortest route with the shortest possible number merely says *"your first guess was right."*
- A compelling clue **blocks or outlasts the greedy route** (e.g., an egg at Manhattan distance $2$ that requires $4$ or $6$ steps to reach), forcing a detour that unlocks the rest of the board.

### 1.4 Symmetry Requires Asymmetric Details
A mirror line where both halves are identical copies halves the puzzle: solve the left side, copy it to the right.
- For a snowflake frame (`snow`) to work as a deduction rule, **the skeleton must mirror while a local detail stays free on each side** (single vs. double bridges in `webs`; wire entry/exit outside the frame in `lights`; portion sizes outside the frame in `carving`; step-number direction in `hops`; anagrammed word paths in `words`).
- Clues inside the frame must be **split across both halves** so neither side can be solved in isolation.

### 1.5 Neutral ("White") Elements Belong Only on Contested Frontiers
In `colours` (Red, White, and Blue), white is the wildcard that can join or be visited by either colour.
- A white square buried deep inside a red region—unreachable from blue—is a lie: it looks like a choice on the board, but only red can ever touch it.
- Every white element must **border both red and blue**, each colour region must form a single connected component, and **both colours must actually use at least one white element** in the unique solution.

### 1.6 Verify Under the Player's Blind View, Not the Generator's Omniscient View
When a twist hides information (`dark` `?` squares, unrevealed `letters`), the generator knows what lies underneath, but the player does not.
- The uniqueness check in `verify.ts` must give the solver **only what the player can see** (e.g., `blindDark: true` in `lights`, allowing any valid pipe shape `1..14` under `?`; `noCode: true` in `words`; unknown lawn-vs.-rock under `?` in `hops`).

### 1.7 Strict Seeded Determinism
Every random decision in `make.ts`, `generate.ts`, and `clues.ts` must flow through `rng(seed)` and Fisher–Yates `shuffle(random, array)`.
- **Never** write `array.sort(() => random() - 0.5)`. JavaScript engines invoke `.sort()` comparators a non-deterministic number of times and bias the permutation, breaking seed reproducibility and causing subtle topological bias.

---

## 2. Concrete Do's and Don'ts (Lessons from Puzz's Generators)

### 2.1 Red, White & Blue (`colours`)

#### ❌ Don't: Leave white squares stranded inside one colour's interior, or let one colour stay connected only through white squares
- **What went wrong (`hops` seeds `261750990` and `143981906`):**
  1. Early `colourTwoBunnies` randomly tinted squares `'w'` along a bunny's path even when every orthogonal neighbour of that square was `'r'`. Players saw white squares that the blue bunny could never physically reach, or a red `7` isolated across a blue barrier.
  2. In `seed 143981906`, the blue squares (`'b'`) were split into two disconnected islands separated by `'w'` squares, and all `'w'` squares belonged exclusively to the blue bunny's route—meaning the red bunny never visited a single `'w'` square, so the player had zero red-vs.-blue territory decisions to make.
- **✅ Do: Restrict `'w'` to the red–blue frontier, keep `'r'` and `'b'` internally connected, and require both sides to claim white territory**
  - In [`src/gen/hops/make.ts`](src/gen/hops/make.ts) (`colourTwoBunnies`) and [`src/gen/hops/verify.ts`](src/gen/hops/verify.ts):
    - Every `'w'` square must have at least one non-dark `'r'` neighbour and at least one non-dark `'b'` neighbour.
    - The `'r'` squares alone and the `'b'` squares alone must each form a single connected component.
    - Both the red bunny and the blue bunny must visit at least one `'w'` square in the unique solution, and given/letter eggs near the meeting boundary are prioritized for removal so the player must deduce who takes which `'w'` square.
  - Same rule in [`src/gen/lights/verify.ts`](src/gen/lights/verify.ts), [`src/gen/webs/make.ts`](src/gen/webs/make.ts) (`colourWeb`), and [`src/gen/carving/make.ts`](src/gen/carving/make.ts) (`colourCarving`): a white piece, knot, or portion only exists where it touches both red and blue.

#### ❌ Don't: Place distance clues (`eggs` or `letters`) on white boundary pieces in two-plug puzzles
- **What went wrong (`lights` `colours + eggs` / `colours + letters`):**
  - When `colours` is active in `lights`, there are two plugs (`plug` for red, `bluePlug` for blue). Placing a numbered egg or letter bulb on a white (`'w'`) piece leaves it visually ambiguous which plug its distance is measured from.
- **✅ Do: Place distance clues only on coloured (`'r'` or `'b'`) pieces when `colours` is active**
  - Enforced in [`src/gen/lights/make.ts`](src/gen/lights/make.ts) (`addEggs`, `addLetters`) and [`src/gen/lights/verify.ts`](src/gen/lights/verify.ts).

---

### 2.2 Snowflakes (`snow`)

#### ❌ Don't: Leave one half of a snowflake frame completely filled with given clues
- **What went wrong (`hops` `snow`):**
  - When `minimizeEggs` stripped clues in random order without regard to the snowflake frame, it frequently left every square in one half of the frame populated with numbered eggs while emptying the other half. The frame stopped being a two-way deduction and became one-way copying.
- **✅ Do: Prioritize stripping clues from the second half of the frame and forbid fully clued halves**
  - In [`src/gen/hops/generate.ts`](src/gen/hops/generate.ts), squares in the second half of `frame` (and their exits) are added to `prioritySpots` so `minimizeEggs` removes them first, and [`src/gen/hops/verify.ts`](src/gen/hops/verify.ts) rejects any panel where `givenHalf1 >= halfArea || givenHalf2 >= halfArea`.
  - In [`src/gen/webs/verify.ts`](src/gen/webs/verify.ts), mirror knot pairs are checked to ensure at least one-third of numeric mirror pairs show *different* numbers (because single vs. double threads differ across the axis).

#### ❌ Don't: Run a mirror line through the middle of squares in a grid-square puzzle
- **What went wrong (early `carving` / `hops` / `lights` frames):**
  - A frame with an odd width across a vertical axis (`(right - left + 1) % 2 === 1`) puts the mirror line down the middle of a column of squares, where a unit step or cut across the axis has no distinct mirror partner.
- **✅ Do: Enforce even span across the mirror axis, near-square aspect ratio ($\ge 0.6$), and room outside the frame**
  - Every square-grid generator checks `(f.axis === 'v' ? w : h) % 2 === 0`, `Math.min(h, w) / Math.max(h, w) >= 0.6`, `area(f) < boardArea`, and `offAxis(f, drawn) >= 3`.

---

### 2.3 The Dark (`dark`)

#### ❌ Don't: Let the generator's solver "peek" under dark squares, or place `?` on 4-way crosses / adjacent clusters in `lights`
- **What went wrong (`lights` `dark`):**
  1. Originally, `solve()` rotated the true piece mask `b.solution[r][c]` even on `dark` squares. That meant the generator accepted boards where a `?` square had a turn (`L`) versus a tee (`T`) that the player could *never* deduce without seeing inside the `?`.
  2. Placing two `?` squares orthogonally adjacent to each other created a mutual blind spot where wire across their shared edge was underconstrained; placing `?` on a 4-way cross (`mask === 15`) was pointless because a cross is rotationally invariant.
- **✅ Do: Solve with `blindDark: true` and keep dark squares non-adjacent and non-cross**
  - In [`src/gen/lights/rules.ts`](src/gen/lights/rules.ts) (`options`), when `blindDark` is enabled and `(r, c)` is in `b.dark`, the solver tests all piece masks `1..14`.A board is only valid if its solution is unique even when `?` could be *any* piece shape, forced purely by the wire ends of its visible neighbours.
  - [`src/gen/lights/verify.ts`](src/gen/lights/verify.ts) enforces `p.dark.length >= 2`, no two dark squares touching (`manhattan <= 1`), no dark square on a plug/egg/letter, and no dark square on a 4-way cross (`15`).

#### ❌ Don't: Frame a dark detour with immediately adjacent given numbers that make the rest of the board irrelevant
- **What went wrong (`hops` `dark`, seeds `101` and `123`):**
  - `makePanel` placed a 2-square lawn U-turn at steps $N-2, N-1$ and a rock at the adjacent dead end, and put **both** $N-3$ (`route[uIdx]`) and $N$ (`newLastSpot`) into `preservedSpots`. Every panel handed the player `21` and `24` (or `45` and `48`) right next to the three `?` cells, making the local `21 → 22 → 23 → 24` U-turn solvable in two seconds without solving the rest of the puzzle.
- **✅ Do: Preserve only the final egg $N$ (which states the route length) and prioritize removing $N-3$**
  - In [`src/gen/hops/generate.ts`](src/gen/hops/generate.ts), `route[uIdx]` ($N-3$) is placed in `prioritySpots` instead of `preservedSpots`. Now `minimizeEggs` strips $N-3$ first (leaving gaps like `15 → 24` on easy or `40 → 48` on medium), so the player must trace the global trail into the dark zone to know when they arrive.

---

### 2.4 Numbered Eggs & Letters (`eggs`, `letters`)

#### ❌ Don't: Place distance clues at distance $1$ or along trivial shortest-path Manhattan lines
- **What went wrong (`lights` `eggs` & `letters`, seed `100`):**
  - Placing an egg or letter bulb orthogonally adjacent to the plug (`d0 === 1`) or at distance $2$ on a Manhattan-distance-$2$ square confirms the only direct path rather than forcing a deduction.
- **✅ Do: Require distance $\ge 2$ and weight winding detour paths (`d0 > manhattan`) higher**
  - In [`src/gen/webs/generate.ts`](src/gen/webs/generate.ts) and [`src/gen/webs/verify.ts`](src/gen/webs/verify.ts), every egg must satisfy `egg >= 2 && egg > near[k]` (strictly more threads from `home` than the shortest link path).
  - In [`src/gen/lights/make.ts`](src/gen/lights/make.ts) (`addEggs`, `addLetters`), candidates require `d0 >= 2`, compute Manhattan distance from whichever plug (`plug` or `bluePlug`) powers that square, and add a score bonus when `d0 > manhattan` and `d0 >= 3`.

#### ❌ Don't: Use a single letter clue (which is just a disguised `?`)
- **What went wrong (naive `letters` encoding):**
  - If only one letter appears on the board (or in `words`, only one letter is coded), the letter does no cross-referencing work—it is functionally identical to a dark `?` square.
- **✅ Do: Always require at least 2 distinct letters (2–3 by tier) that decode a real theme word**
  - Enforced across all 5 generators' `verify.ts` files (`shown.size < 2` / `distinct.size < 2` / `p.code.length < 2`).

---

### 2.5 Fair Shares, Cuts & Burrows (`courses`, `slices`, `cuts`, `burrows`)

#### ❌ Don't: Carve erratic 1-cell splinters or interior islands as "pie slices" or disconnected courses
- **What went wrong (early `lights` `slices` and `hops` `courses` + `burrows`):**
  1. Random flood-fill in `lights` created 1-square slices or interior blobs that didn't touch the rim of the pie, looking nothing like pie slices.
  2. In `hops` `burrows` (`seed 117`), numbered eggs could land directly on top of a burrow hole (`[2, 0, 31]`), visually colliding with the burrow icon and giving away the exact step of the tunnel jump.
- **✅ Do: Use angular pie wedges reaching the rim, contiguous courses, centered fences, and clue-free burrow mouths**
  - [`src/gen/lights/make.ts`](src/gen/lights/make.ts) (`carveSlices`) partitions the board by angle `atan2(r - pr, c - pc)` around a central hub plug (`*`) and verifies that every slice reaches the outer edge of the board and holds a fair share of squares.
  - [`src/gen/hops/generate.ts`](src/gen/hops/generate.ts) and [`src/gen/hops/verify.ts`](src/gen/hops/verify.ts) forbid given/letter eggs on burrow endpoints (`noEggSpots`), prioritize removing eggs on steps adjacent to burrows, and verify that every course in `p.portions` is orthogonally connected.
  - [`src/gen/webs/generate.ts`](src/gen/webs/generate.ts) places each `cuts` fence at the midpoint `ws[Math.floor(ws.length / 2)]` of `wallsBetween(a, b)` so fences sit cleanly in the channel between knots rather than flush against a knot circle.

---

### 2.6 Touch Interaction When Twists Overlap

#### ❌ Don't: Hardcode player-1 priority when two players/bunnies can share or border squares
- **What went wrong ([`src/proto/hopsBoard.ts`](src/proto/hopsBoard.ts) on `seed 143981906`):**
  - On tap/pointerdown, the board checked `for (const t of ['r', 'b'])` and picked the first bunny orthogonally adjacent to the tapped cell *before* checking `canTake(t, i)`. Whenever the red bunny sat next to a blue square that the blue bunny was also adjacent to, tapping that blue square selected `'r'`, failed `canTake('r', i)`, and flashed an error—making a valid puzzle impossible to complete by tapping!
- **✅ Do: Filter candidate actors by rule legality (`canTake`) before tie-breaking**
  - [`src/proto/hopsBoard.ts`](src/proto/hopsBoard.ts) now checks whether a single bunny can legally take the tapped cell first (`canR && !canB` or `canB && !canR`), and only falls back to active-bunny preference when both bunnies can legally step onto a shared white border cell.

### 2.7 Twist Difficulty: Keep Every Twist About as Hard as Its Base (audit, 2026-11-08)

A twist can make a board easier (it rules things out, acting as a hint) or harder
(it hides information, or adds a long-range rule). Generators that trim clues to
the minimum don't notice: a harder twist gets the same few hints as the plain
puzzle. So each generator needs a **difficulty knob**, set per twist and size.

**Measured** at 7×7: median solver steps for the uniqueness check on generated
boards, relative to the plain puzzle (a rough proxy; ratings also use judgement,
since some solvers finish plain boards almost by propagation alone).

| Genre | Halloween (dark) | Valentine's (letters) | Fourth of July (colours) | Easter | Thanksgiving | Christmas (snow) |
|---|---|---|---|---|---|---|
| Webs | + 4× | = 13×† | − 3×* | eggs ++ 14× | cuts − 3×* | − 1× |
| Carving | + 17× | = 56×† | 0 1.9× | basket 0 0.9× | cuts − 0.9× | + 3.4× |
| Lights | + 1.1× | ++ 2.9× | 0 1.3× | eggs ++ 2.9× | slices − 0.9× | 0 1.0× |
| Words | + 1.2× | = 3.8×† | 0 1.1× | eggs − 0.9× | cuts 0 1.0× | − 0.9× |
| Hops | ++ 2.0× | = 0.4×† | −− 0.2× | burrows ++ 2.6× | courses −− 0.1× | − 0.7× |
| Pictures | + 1.0× | +++ 184× | 0 1.0× | eggs 0 1.1× | portions 0 1.3× | 0 1.0× |

\* tiny step counts; rated by how the twist plays (it rules moves out).
† the solver brute-forces the letter code; players solve the words ahead first (trivially, with three-letter words), so letters play as = in Words, Hops, Webs and Carving.

The full report, with the rating scale and the clue-adjustment rule, is [DIFFICULTY.md](DIFFICULTY.md).

**Patterns:** hidden information (dark, letters) is always harder; Easter's
number twists are hard in the path and network genres (Webs, Lights, Hops) but
help in Words; fences and portions make things easier; snow and colours are
mostly neutral.

#### ✅ Do: Hops' knobs are rocks and spare eggs
- **Rocks** are part of the base game ([`src/gen/hops/generate.ts`](src/gen/hops/generate.ts),
  `SHAPES.rocks`, `placeRocks`): squares the bunny can't hop onto, which shrink the
  lawn. `ROCK_SHIFT` adds rocks for harder twists (burrows, dark) and removes them
  for easier ones (courses, two bunnies). Spooky's shadowed squares are then simply
  "maybe a rock".
- **Spare eggs** (`SPARE_EGGS`, `addSpareEggs`): the minimal-egg search takes back
  what a smaller lawn gives, so harder twists also get a few true eggs back after
  trimming, spread far from the others, and only while every twist still does its
  work.
- **Result at 7×7:** burrows 0.95×, dark 0.89×, snow 0.89×, letters 0.69× of the
  plain board (which, with its own 3 rocks, now takes about 1,800 steps instead of
  4,800). Courses and two bunnies stay easier (0.2×, 0.4×) with no rocks at all:
  there's nothing left to take away. 9×9 boards vary a lot board to board; their
  settings lean easier.

#### Still to do: the other genres' knobs
- **Carving:** a pre-carved rectangle; fewer `?` or letter sizes.
- **Webs:** a pre-drawn thread; fewer dark knots or eggs.
- **Lights:** pre-locked tiles, already turned the right way.
- **Words:** one word already found.
- **Pictures:** a few cells pre-filled; one letter's value revealed.

---

## 3. Lessons From the Design Lineage & Literature (Applied to Puzz)

The sections above capture what we learned empirically from debugging our own generators. Below are the distinct lessons drawn from the external references in [`inspiration/`](inspiration/README.md) and the puzzle-construction literature—what those designers and critics discovered, and how their findings apply to Puzz's generators, boards, and room structure.

---

### 3.1 Simon Tatham — *Portable Puzzle Collection* (`inspiration/nikoli/tatham-puzzle-collection-manual.txt`)

Tatham's collection is the closest technical ancestor to `src/gen/`: forty logic genres generated on demand in C, with `Bridges` (`webs`), `Rectangles` (`carving`), `Net` (`lights`), `Pattern` (`picture`), and `Signpost` (`hops`). Three specific lessons from Tatham's manual and generator design apply directly here:

1. **Expansion Factors Control Deductive Feel (`Rectangles` §8.2, `Bridges` §26.2):**
   - *What Tatham found:* In `Rectangles` (*Shikaku*), partitioning a grid purely at random produces too many tiny $1 \times 2$ and $1 \times 3$ rectangles that resolve locally by counting, never interacting across the board. Tatham introduced an **expansion factor**: generate a partition on a smaller grid (e.g., $\frac{2}{3}$ size) and stretch its rectangles to fill the target grid. A moderate expansion (~`0.5`) yields fewer, larger rectangles whose aspect ratios interlock globally; too high an expansion collapses the grid into 2–3 giant trivial blocks.
   - Similarly, in `Bridges` (*Hashi*), Tatham's **expansion factor** governs how far a new island is cast from an existing one: low expansion packs islands into tight, noisy clusters, while higher expansion creates long, clean bridge channels that cross-constrain perpendicular links.
   - *Application to Puzz:* When tuning `SHAPES` in `carving` (`minArea`, `maxArea`) and `webs` (`reach`, `knots`), prefer medium-to-long spans and moderate portion counts over dense micro-clues; a 7×7 board with 8–10 interlocking portions feels much richer than one chopped into 18 dominoes.

2. **Avoid "Spoiler" Error Highlighting During Intermediate Moves (`Net` §3.3 vs. `Bridges` §26.1):**
   - *What Tatham found:* In `Net` (§3.3), highlighting closed loops as errors the instant a player rotates a tile *through* a loop position acts as an **unintended spoiler**: the player learns about a global cycle involving distant tiles they haven't even inspected yet, just by spinning a piece past $90^\circ$. By contrast, in `Bridges` (§26.1), highlighting an isolated closed component (such as connecting two `1`s to each other) or an overloaded knot only flags a completed local commitment.
   - *Application to Puzz:* Real-time feedback must distinguish **rotational/transient pass-throughs** from **committed violations**. In `lights` (`netBoard.ts`), rotating a piece clockwise naturally passes through intermediate orientations; feedback should reward power connectivity and flag loose ends without giving away global deductions via premature error flashes on untouched regions.

3. **Orthogonal Constraint Injection as Controllable Hints (`Net` §3.2) & Mid-Chain Deduction (`Signpost` §34.1):**
   - *What Tatham found:* In `Net` (§3.2), Tatham decoupled barrier wall placement from tree generation so that increasing `Barrier probability` on the *same seed* injects immovable wall hints into the exact same network. And in `Signpost` (§34.1, a cousin of `hops`), Tatham notes that human solvers rarely trace $1 \to 2 \to 3 \dots \to N$ in strict order; instead, they link forced mid-board chains (`a → a+1 → a+2`) and splice them together later.
   - *Application to Puzz:* Our `chooseClues` (`keepSpare`) architecture can expose a "Hint" button that reveals one additional true wall/bow/egg from the generator's truth without changing the board. And in `hops`, puzzles are most compelling when mid-route geometry (corridors, burrows, snowflake frames, course boundaries) forces segments in the middle of the board before the player reaches them from `1`.

---

### 3.2 Maki Kaji (Nikoli) & Thomas Snyder (*Grandmaster Puzzles*) — Hand-Crafted Flow vs. Computer Soup

Both Maki Kaji (*Puzzle Communication Nikoli*, [`inspiration/nikoli/nikoli-rules.md`](inspiration/nikoli/nikoli-rules.md)) and World Puzzle Champion Thomas Snyder (*GMPuzzles*) have written extensively on why human solvers can immediately tell a naive computer-generated puzzle apart from a hand-crafted one:

1. **The "Break-In" (Entry Point) Problem:**
   - *What Kaji & Snyder found:* When an algorithm strips clues purely at random until `solutions === 1`, the starting board typically suffers from one of two extremes:
     - **Scattershot triviality:** Five or six independent easy moves sit in different corners, so the player mops up disconnected fragments without any single "aha!" moment.
     - **Blank-wall paralysis:** Every remaining clue is a mid-range number with 4–6 possibilities, forcing the player to scan every cell on the grid looking for a microscopic foothold.
   - Hand-crafted puzzles are built around a **deliberate break-in**: one or two clear, inviting entry points (a large rectangle with only two ways to lie, a corner knot near a fence, a tight egg gap) whose resolution triggers a domino cascade into the harder interior.
   - *Application to Puzz:* Clue reducers (`minimizeEggs`, `chooseClues`) should not treat all minimal clue sets as equal. Prefer candidate boards whose solve trace begins with a low-branching local deduction and then propagates across the board, rather than boards that require deep lookahead on move 1.

2. **Flow and the Ban on Sealed-Off Sub-Puzzles:**
   - *What Snyder found:* Good puzzles have **flow**—each resolved region hands you the constraint you need for the neighbouring region. A classic generator flaw in region/wall puzzles (*Shikaku*, *Hashi*, *Slitherlink*) is accidentally generating a full-span cut or colour boundary that bisects the grid into two independent sub-boards that never talk to each other.
   - *Application to Puzz:* When generating `cuts` (`carving`, `webs`, `words`), `slices` (`lights`), or `courses` (`hops`), constraints must leave **cross-boundary tension** (e.g., portions in `carving` that straddle the snowflake frame's edge, or white frontier cells in `colours` that force red and blue to negotiate shared space).

3. **Visual Gestalt and Breathing Room:**
   - *What Nikoli found:* A puzzle grid is a visual object first. Clues clumped into one dense corner while three-quarters of the board is empty—or numbers that all share the same boring value (e.g., a *Shikaku* board of nothing but `4`s)—feel mechanical and uninviting even if the logic is sound.
   - *Application to Puzz:* Ensure variety in portion sizes, bridge counts, and word lengths (`pickWords` in `words/themes.ts`), and spread clues across quadrants when breaking ties between equally valid minimal clue sets.

---

### 3.3 Jonathan Blow's *The Witness* & Its Critical Postmortems (`inspiration/the-witness/`)

The five reviews and design analyses in [`inspiration/the-witness/`](inspiration/the-witness/) ([`puzzle-snob-review.txt`](inspiration/the-witness/puzzle-snob-review.txt), [`scientific-gamer-review.txt`](inspiration/the-witness/scientific-gamer-review.txt), [`ars-technica-review.txt`](inspiration/the-witness/ars-technica-review.txt), [`game-wisdom-analysis.txt`](inspiration/the-witness/game-wisdom-analysis.txt), [`room-escape-artist-review.txt`](inspiration/the-witness/room-escape-artist-review.txt)) highlight both what made *The Witness* a landmark and where its design frustrated players:

1. **Rule Discovery vs. Deductive Execution (`puzzle-snob-review.txt`, `scientific-gamer-review.txt`):**
   - *What the critics found:* In [`puzzle-snob-review.txt`](inspiration/the-witness/puzzle-snob-review.txt), the reviewer contrasts Nikoli puzzles (where the rules are stated in one sentence and the depth comes from deducing the unique solution) with *The Witness* (where the grids are small and the primary challenge is guessing what the symbols mean). In [`scientific-gamer-review.txt`](inspiration/the-witness/scientific-gamer-review.txt), a commenter notes a fatal failure mode of purely wordless symbol teaching: forming a plausible *false* hypothesis on an early panel ("black and white squares can't be stepped between") that accidentally passes the tutorial panels and then breaks 20 minutes later, forcing the player to unlearn a rule they thought the game had confirmed.
   - *Application to Puzz:* Puzz deliberately takes the best of both worlds:
     - Like *The Witness*, rules compose across a $6 \times 6$ matrix using a single gesture per genre and immediate audio/visual feedback.
     - Like Nikoli, **every panel states its twist rule in one crisp line above the board** (`strandsBoard.ts`, `hashiBoard.ts`, `hopsBoard.ts`, `netBoard.ts`, `shikakuBoard.ts`), eliminating false-hypothesis frustration so 100% of the player's energy goes into deductive insights.

2. **Never Confuse Short-Term Memory Taxes with Puzzle Difficulty (`puzzle-snob-review.txt`):**
   - *What the critic found:* [`puzzle-snob-review.txt`](inspiration/the-witness/puzzle-snob-review.txt) calls out *The Witness*'s habit of manufacturing difficulty by putting clues in one place and the panel in another—testing the player's short-term memory or forcing them to take phone photos/notes rather than testing logic.
   - *Application to Puzz:* Every piece of state the player has deduced or needs to reference must stay visible **on the board itself**:
     - In `Words` (`letters`), once a word containing a coded number is found, the board reveals that letter everywhere on the grid *and* in the key line above the board (`strandsBoard.ts`).
     - In `Snowflakes`, the ghost of every drawn stroke's mirror image is rendered directly on the opposite side of the axis until matched.
     - In `Carving` / `Hops` / `Lights`, portion and slice statuses update live on the board so the player never has to count squares or wire steps by hand.

3. **Hub-and-Spoke Signposting so Players Never Blunder into Unlearned Twists (`scientific-gamer-review.txt`):**
   - *What the critic found:* [`scientific-gamer-review.txt`](inspiration/the-witness/scientific-gamer-review.txt) notes that *The Witness*'s open island let players wander into compound puzzles using symbols whose tutorial zone entrance was hidden six hours away.
   - *Application to Puzz:* In [`GAME.md`](GAME.md), Tuesday's hall is a clean two-click hub to all six holiday rooms, each room opens with its own plain warm-up run, and each room's centrepiece uses *only* its own holiday's twist (`PUZZLES.md`), guaranteeing the player never hits an unexplained compound wall.

---

### 3.4 The 1990s Puzzle-House Canon (*The 7th Guest*, *Dr. Brain*, *Shivers*, *Safecracker* — `inspiration/`)

The walkthroughs, UHS hint files, and reviews by Andrew Plotkin ([`safecracker/zarf-review.txt`](inspiration/safecracker/zarf-review.txt), [`shivers/zarf-review.txt`](inspiration/shivers/zarf-review.txt)) and Reiko ([`7th-guest/adventure-gamer-playthrough.txt`](inspiration/7th-guest/adventure-gamer-playthrough.txt), [`island-of-dr-brain/adventure-gamer-playthrough.txt`](inspiration/island-of-dr-brain/adventure-gamer-playthrough.txt)) document the exact pitfalls of house-of-puzzles adventure games:

1. **Length $\ne$ Depth: Avoid "One-Slip Reset" Anxiety (`7th-guest/adventure-gamer-playthrough.txt`):**
   - *What the playthrough found:* In [`7th-guest/adventure-gamer-playthrough.txt`](inspiration/7th-guest/adventure-gamer-playthrough.txt) (lines 6379–6385), the reviewer notes that *The 7th Guest*'s late chess and music puzzles weren't conceptually richer than early ones—just longer and more tedious, creating constant dread in the second half that a single misclick would force a full restart.
   - *Application to Puzz:* Keep grids small (`5×5`, `7×7`, `9×9`), never reset the board on an error, and make local undo effortless (tap the bunny to step back one square; tap a rectangle or thread to lift just that piece; slide back one letter in `Words`). Difficulty scales by **combining twists**, not by bloating move counts.

2. **Ban "Moon Logic", Anagram/Dictionary Taxes, and Blind Trial-and-Error (`7th-guest/adventure-gamer-playthrough.txt`):**
   - *What the playthrough found:* *The 7th Guest*'s soup-can puzzle (`SHY GYPSY SLYLY SPRYLY TRYST BY MY CRYPT`) forced players—especially non-native speakers—to use external anagram solvers, while the chapel floor and dollhouse puzzles hid their transition rules completely, reducing solving to random clicking.
   - *Application to Puzz:* Word banks (`src/gen/words/themes.ts`) use only familiar, concrete holiday vocabulary (`CANDLE`, `PUMPKIN`, `BLOSSOM`, `RIBBON`), never obscure words or cryptic crosswords; and every rejected interaction visually flashes *why* it was rejected.

3. **Ban Generic "Filler" Classics and Adversarial AI Minigames (`safecracker/zarf-review.txt`, `shivers/zarf-review.txt`):**
   - *What Plotkin found:* In [`safecracker/zarf-review.txt`](inspiration/safecracker/zarf-review.txt) and [`shivers/zarf-review.txt`](inspiration/shivers/zarf-review.txt), Plotkin calls out the laziness of dropping stock 15-puzzles, Mastermind, Towers of Hanoi, or peg-jumping into a puzzle mansion, and *The 7th Guest*'s microscope puzzle was infamous for being an adversarial Ataxx AI game rather than a solvable deduction puzzle.
   - *Application to Puzz:* Every puzzle in the house belongs to the coherent $6 \times 6$ base-genre $\times$ holiday-twist language; there are zero sliding-tile, peg-solitaire, or AI-opponent minigames.

4. **Surprise Over Lock-and-Key Bookkeeping (`safecracker/zarf-review.txt`) & Graded Hints (`uhs-hints.md`):**
   - *What Plotkin & UHS found:* Plotkin observes that *Safecracker*'s weakest puzzles were mere combinations found elsewhere (*"When you get the third key for the three-key safe, you say 'Yay! Now I can go open that safe!' ... Anything which is obviously right is immediately obviously right"*), whereas great puzzles make clues interact in a surprising way on the board itself. And the Universal Hint System files (`uhs-hints.md` across all folders in `inspiration/`) show how hints should work: start by pointing the player's eye to the **break-in constraint**, then explain the deduction, and only reveal the answer as a last resort—unlike *The 7th Guest*'s hint book, which auto-solved the puzzle and skipped the reward scene.

---

## 4. Technical Implementation of Efficient, Compelling Generators

Generating puzzles that are both **computationally fast** (milliseconds per seed) and **compelling to play** (smooth deduction flow, no 50/50 guessing traps, non-trivial topology) requires pairing specialized **solution-construction algorithms** with **stratified constraint-propagation solvers**. Below are the proven implementation patterns from Simon Tatham's Portable Puzzle Collection (`bridges.c`, `loopy.c`, `rectangles.c`, `signpost.c`, `net.c`, `pattern.c`, `solo.c`), Knuth's Exact Cover (`DLX`), and academic puzzle-generation literature, mapped to Puzz's generators.

---

### 4.1 Stratified (Rule-Tiered) Deduction Solvers vs. Backtracking / SAT

A common mistake in puzzle generator engineering is relying solely on a backtracking depth-first search (or SAT/ASP solver with a blocking clause $\bigvee_{i \in S_1} \neg x_i$) to check that `countSolutions(board, limit = 2) === 1`.

- **Why pure backtracking isn't enough for compelling design:**
  A board can have a mathematically unique solution ($|S| = 1$) while still being **unfun or human-insoluble** if every local deduction stalls on move 3 and the only way forward is guessing a 50/50 branch and tracing a 12-step contradiction (*the Guessing Trap*). Conversely, a board can have $|S| = 1$ only because every single square is over-clued, yielding a flat, mechanical click-fest.
- **How Tatham (`solo.c`, `loopy.c`, `bridges.c`) and Nikoli-grade generators solve this:**
  1. **Organize solver rules into explicit difficulty tiers (`Tier 1` < `Tier 2` < `Tier 3` < `Branching`):**
     - **Tier 1 (Atomic / Single-Entity):** Rules that inspect one clue or vertex in isolation (e.g., an island whose remaining capacity equals its remaining neighbour slots; a rectangle clue with only one valid bounding box; a `0` or corner `3` in *Slitherlink*).
     - **Tier 2 (Pairwise / Relational Propagation):** Rules that intersect two adjacent entities or maintain a Disjoint-Set Forest (`dsf`) to forbid premature closed components (e.g., pigeonhole lower bounds in *Hashi*; mandatory core intersection in *Shikaku*; adjacent `3–3` or diagonal `3–3` in *Slitherlink*; dynamic-programming line overlap in *Nonograms*).
     - **Tier 3 (Global / Parity / Depth-1 Lookahead):** Rules requiring bipartite parity, Jordan-curve inside/outside colouring, or single-step *reductio* ("if edge $e$ were placed, vertex $v$ would immediately violate Tier 1").
  2. **Always run the cheapest applicable tier to fixpoint before invoking a higher tier:**
     ```ts
     while (!isSolved(state)) {
       if (applyTier1(state)) continue;
       if (maxTier >= 2 && applyTier2(state)) continue;
       if (maxTier >= 3 && applyTier3(state)) continue;
       break; // Stalled at maxTier
     }
     ```
  3. **Enforce both an upper bound AND a lower bound on rule tiers during clue reduction:**
     - **Upper bound (solvability guarantee):** For an `easy` board, reject any clue removal that requires `Tier 3` or backtracking.
     - **Lower bound (compelling-deduction gate):** For a `medium` or `hard` board, reject candidate puzzles that solve using *only* `Tier 1`! Require that `Tier 2` or `Tier 3` deductions fire at least $k$ times during the solve trace so the puzzle is guaranteed to have an "aha!" crux rather than just a larger grid of trivial moves.
  4. **Fast uniqueness + human-flow hybrid in Puzz:**
     When a full backtracking verifier (`verify.ts`) is used to guarantee mathematical uniqueness across compound holiday twists, pair it with **propagation before branching** (unit propagation on forced cells/bridges/wires at every recursion node) and score candidate boards by their **branch-free cascade depth** and **detour ratio** (`distance > shortestReach`).

---

### 4.2 *Hashiwokakero* (`Bridges` / [`src/gen/webs/`](src/gen/webs/))

In *Hashiwokakero* (and Puzz's `Webs`), naive random placement of islands followed by random bridge connection almost always fails—either producing disconnected sub-graphs, crossing bridges, or tree graphs that unravel trivially from degree-1 leaves.

1. **Constructive Solution Growth (Ray-Cast Expansion + Cycle Injection):**
   - **Step 1 — Spanning tree growth from a seed knot:** Place an initial knot and maintain a candidate list of existing knots. Repeatedly pick a knot, cast a ray in a random cardinal direction, and place a new knot along that ray before hitting any existing knot or bridge.
   - **Expansion bias (`bridges.c`):** Weight candidate landing cells toward longer spans when the grid is sparse so knots establish long cross-board sightlines first, then fill intermediate pockets. Reject any candidate cell that is orthogonally adjacent to an existing knot (unless explicitly allowed) so bridges have visible span.
   - **Step 2 — Non-tree cycle injection:** A pure tree of islands is trivially solvable by peeling degree-1 leaves (`1`s and `2`s at dead ends) inward. After growing the tree, scan pairs of collinear visible knots whose span does not cross an existing bridge and add **cycle edges** up to a target loop ratio (e.g., 25–40% extra edges), assigning multiplicity $m \in \{1, 2\}$ (with double threads rarer than single threads so `1`s and `2`s stay balanced).
   - **Step 3 — Twist-aware topology (`Webs`):**
     - For `cuts` (scissors), place the cut between two collinear knots that *could* connect in a rival solution, or use cuts to block long sightlines during cycle injection so the remaining bridges must route around the cut.
     - For `colours` (`'r'`, `'w'`, `'b'`), partition the spanning graph into connected red and blue regions first, and promote only frontier knots touching *both* red and blue neighbours to `'w'`.

2. **Fast Deductive Propagation Rules:**
   - **Pigeonhole Lower-Bound Rule:** Suppose knot $u$ needs $r$ more threads across its open directions $D$, where direction $d \in D$ can accept at most $c_d \in \{1, 2\}$ additional threads. Then direction $d$ is **forced** to take at least:
     $$\text{forced}(u, d) = \max\!\left(0,\; r - \sum_{d' \in D \setminus \{d\}} c_{d'}\right)$$
     *Example:* A `7` with 4 neighbours ($c_{d'} = 2$) must place at least $7 - (2+2+2) = 1$ thread in all 4 directions immediately on move 1, even before knowing which three directions get a second thread. A `5` with 3 neighbours ($c_{d'} = 2$) forces $\ge 1$ in all 3 directions; a `4` with 2 neighbours where one direction is capped at $c_1 = 1$ (because that neighbour only needs `1` more) forces $4 - 1 = 3$ (impossible) or, for a `3`, forces $3 - 1 = 2$ in the other direction.
   - **Disjoint-Set Forest (`dsf`) Premature-Isolation Pruning:**
     Maintain a union-find structure over knots, tracking for each connected component $C$ the total remaining unsatisfied degree $\text{rem}(C) = \sum_{v \in C} \text{rem}(v)$. Whenever adding $k$ threads between $u$ and $v$ (already in the same component or merging two components) would make $\text{rem}(C) = 0$ while $|C| < |V_{\text{total}}|$, that assignment would seal off an isolated sub-web and is immediately forbidden (or capped at $k - 1$).

---

### 4.3 *Slitherlink* (`Loopy` / Loop & Fence Puzzles)

In *Slitherlink* (*Fences* / Tatham's `loopy.c`), generating a random single non-self-intersecting cycle by walking vertex-to-vertex almost always traps itself in dead ends or produces short, degenerate loops.

1. **Dual-Graph Inside/Outside Cell Flipping (Jordan Curve Construction):**
   - By the Jordan Curve Theorem, any simple closed loop on a planar grid partitions the cells into **Inside (`1`)** and **Outside (`0`)** regions; the loop itself is simply the set of grid edges where an Inside cell meets an Outside cell.
   - **Algorithm:**
     1. Initialize all cells to `Outside (0)`, plus a virtual border ring of permanent `Outside (0)` cells around the grid.
     2. Flip one random interior cell to `Inside (1)` (forming a valid $1 \times 1$ loop of 4 edges).
     3. Repeatedly pick a random cell $c$ on the boundary between `0` and `1` and propose flipping its state ($0 \leftrightarrow 1$). Accept the flip if and only if **three local $3 \times 3$ neighbourhood invariants** hold:
        - **Inside connectivity:** All `1` cells in $c$'s $3 \times 3$ neighbourhood remain 4-connected around $c$ (preventing the inside region from pinching into two loops).
        - **Outside connectivity:** All `0` cells in $c$'s $3 \times 3$ neighbourhood remain 4-connected around $c$ (preventing the loop from enclosing an unreachable hole of `0`s—an internal second loop).
        - **No degree-4 kiss vertices:** None of the 4 corners of $c$ exhibits a $2 \times 2$ checkerboard pattern $\begin{smallmatrix} 1 & 0 \\ 0 & 1 \end{smallmatrix}$ or $\begin{smallmatrix} 0 & 1 \\ 1 & 0 \end{smallmatrix}$, which would create a vertex of degree 4 where the loop pinches against itself.
   - Because all three checks inspect only the 8 neighbours of $c$, each flip is $O(1)$ and the boundary is guaranteed at every step to be a single valid simple cycle.

2. **Fast Deductive Propagation Rules (`loopy.c`):**
   - **Edge & Vertex State Machine:** Every grid edge is `{UNKNOWN, LINE, CROSS}`. At every grid vertex (dot), maintain `lines` and `crosses` counts:
     - `lines == 2` $\implies$ all remaining `UNKNOWN` incident edges become `CROSS`.
     - `crosses == deg(v) - 1` and `lines == 0` $\implies$ the last `UNKNOWN` edge becomes `CROSS` (no dead ends).
     - `crosses == deg(v) - 2` and `lines == 1` $\implies$ the last `UNKNOWN` edge becomes `LINE` (a line entering a vertex must exit).
   - **Vertex Equivalence / Corner Entry-Exit Propagation:** When two outside edges of a vertex $v$ are both `CROSS` (or one `LINE` and one `CROSS`), the two remaining edges of $v$ that border cell $C$ either have the **same state** (`both LINE` or `both CROSS`, contributing $0$ or $2$ to cell $C$) or **opposite states** (`one LINE, one CROSS`, contributing exactly $1$ to cell $C$). This allows a `3` and an adjacent `1` or diagonal `3` to propagate across the grid without branching:
     - **Adjacent `3–3`:** Their shared edge and the two outer parallel edges are immediately `LINE`, and the two lateral extension edges from the shared vertices are `CROSS`.
     - **Diagonal `3–3`:** The two outer corner edges of each `3` away from the shared vertex are forced `LINE`.
     - **Diagonal `3` and `0`:** The two edges of the `3` meeting at the shared vertex with the `0` have no external exit, forcing the `3`'s other two outer edges to be `LINE` and its two inner edges to supply `1` line into the remaining exits.
   - **DSF Sub-Loop Prevention:** Maintain a union-find structure over vertices connected by `LINE` edges, tracking the two endpoints of each open chain. If an `UNKNOWN` edge connects the two endpoints of the *same* chain, marking it `LINE` would close a cycle—which is immediately marked `CROSS` unless closing that edge satisfies every clue on the board and uses all existing `LINE` segments.

---

### 4.4 *Shikaku* (`Rectangles` / [`src/gen/carving/`](src/gen/carving/))

In *Shikaku* (and Puzz's `Carving`), both how you partition the rectangle grid and how you represent candidate rectangles determine whether the puzzle has interlocking flow or falls apart into isolated sub-boxes.

1. **Non-Guillotine (Pinwheel) Partitioning vs. Guillotine BSP:**
   - **Why Guillotine BSP is weak:** A recursive binary space partition (splitting the $W \times H$ grid with a full horizontal or vertical cut, then recursing on the two halves) guarantees that every level of the tree has a seam running completely across the bounding box. As a result, rectangles on one side of the cut never cross into the other side, decomposing the puzzle into independent sub-puzzles (violating Snyder's Flow rule in §3.2).
   - **Non-Guillotine Tiling (`rectangles.c` & [`src/gen/carving/generate.ts`](src/gen/carving/generate.ts)):**
     Place varied $h \times w$ rectangles directly onto the uncarved grid (or merge adjacent $1 \times 1$ cells with an aspect-ratio cap and area limit $2 \le A \le A_{\max}$), intentionally favouring **pinwheel / interlocking arrangements** where four rectangles cycle around an interior corner without any line bisecting the board. Every remaining $1 \times 1$ singleton is folded into an adjacent rectangle if that neighbour stays rectangular, or triggers a fast local re-carve.

2. **Exact-Cover Candidate Graph & Mandatory-Core Intersection:**
   - Precompute for each clue $i$ with area $A_i$ at $(r_i, c_i)$ its set of valid **candidate rectangles** $R_i$: every axis-aligned box of area $A_i$ that covers $(r_i, c_i)$, contains no other clue, and respects active twists (`snow` mirror symmetry, `cuts` borders, `dark` exclusion, etc.).
   - Maintain a reverse index `cover[r][c]` listing all candidate rectangles across all clues that cover cell $(r, c)$.
   - **Three fast propagation sweeps before any branching:**
     1. **Unique Candidate per Clue:** If $|R_i| = 1$, commit its sole rectangle $B$, mark all cells in $B$ as covered, and prune every candidate $B' \in R_j$ ($j \ne i$) that overlaps $B$.
     2. **Unique Candidate per Cell (Hidden Single):** If an uncovered cell $(r, c)$ has $|\text{cover}[r][c]| = 1$, commit that single candidate rectangle immediately.
     3. **Mandatory Core Intersection:** Even when $|R_i| > 1$, compute the intersection of all surviving candidates for clue $i$:
        $$\text{Core}(i) = \bigcap_{B \in R_i} B$$
        Because $\text{Core}(i)$ is a contiguous sub-rectangle containing $(r_i, c_i)$ that clue $i$ *must* occupy in every valid solution, any candidate $B' \in R_j$ ($j \ne i$) that overlaps $\text{Core}(i)$ can be eliminated immediately—even before clue $i$'s exact rectangle is known.

---

### 4.5 *Numbrix / Hidato* (`Signpost` / [`src/gen/hops/`](src/gen/hops/)) & *Net* ([`src/gen/lights/`](src/gen/lights/))

Hamiltonian-path puzzles (*Numbrix*, *Hidato*, Tatham's `signpost.c`, Puzz's `Hops`) and spanning-tree puzzles (*Net* / `Lights`) face dual technical challenges: generating unbiased paths/trees quickly on small grids, and pruning the exponential search space during uniqueness verification.

1. **Unbiased Hamiltonian Path Generation via Backbite (Oberdorf et al.):**
   - Simple random walks with backtracking get trapped in dead-end pockets or produce predictable "lawnmower" (boustrophedon) zig-zags.
   - **The Backbite Move:** Start from *any* valid Hamiltonian path $P = (v_0, v_1, \dots, v_{N-1})$ (even a trivial zig-zag snake) and apply $K$ random **backbite mutations**:
     1. Pick one endpoint of $P$ at random (say $v_0$) and pick a random grid neighbour $u$ of $v_0$ that is not $v_1$.
     2. Because $P$ visits every square, $u = v_k$ for some index $2 \le k \le N-1$. Adding edge $(v_0, v_k)$ creates a loop $(v_0, v_1, \dots, v_k, v_0)$ with a tail $(v_k, \dots, v_{N-1})$.
     3. Delete edge $(v_{k-1}, v_k)$ to break the loop. In array terms, this simply **reverses the prefix** $(v_0, \dots, v_{k-1}) \to (v_{k-1}, \dots, v_0)$, producing a brand-new valid Hamiltonian path with new endpoint $v_{k-1}$ in $O(k)$ time and zero dead-end retries!
   - When obstacles (`dark` rocks) or teleporters (`burrows`) are present, combining seeded randomized Warnsdorff-heuristic DFS (preferring next squares with the fewest unvisited neighbours so corners are visited before they become dead ends) with backbite mutations produces rich, non-boustrophedon paths in milliseconds.

2. **Fast Pruning Invariants in Path Solvers (`hops/verify.ts`):**
   - **Manhattan Slack Pruning:** Between the current head $(r, c)$ at step $s$ and the next fixed clue $(r_t, c_t)$ at step $t > s$ (when no burrows intervene), prune immediately if $|r - r_t| + |c - c_t| > t - s$.
   - **Bipartite Checkerboard Parity:** On an orthogonal grid without burrows, every step changes $(r + c) \bmod 2$. Thus $(r + c) + (r_t + c_t) \equiv (t - s) \pmod 2$ is an $O(1)$ bitwise check.
   - **Degree-1 Corridor Forcing (Dead-End Detection):** After stepping to $u$, inspect the unvisited orthogonal neighbours of the *previous* square and surrounding squares. If any unvisited non-target square $w$ drops to **0 available neighbours**, or if **two** unvisited non-target squares drop to **1 available neighbour** simultaneously (so the path cannot visit and leave both), prune the branch immediately.
   - **Clue Reduction via Minimum-Anchor Deletion (`chooseClues` / `minimizeEggs`):** Start with all steps clued (guaranteed unique), shuffle the interior clues with the seeded RNG, and greedily strip clue $c$ if `verify()` still returns `1`—preferring to keep clues at path turns or detour bends rather than straightaways.

3. **Cycle-Breaking Spanning Trees in *Net* (`net.c` / [`src/gen/lights/`](src/gen/lights/)):**
   - Generate the solution tree via randomized Prim's/Kruskal's algorithm with degree weights (preventing trivial long straight corridors of I-pieces and balancing T-junctions, corners, and leaves).
   - **Why *Net* puzzles go ambiguous:** A $2 \times 2$ block of corners or T-pieces can often spin inward in a $2 \times 2$ cycle while leaving external connections satisfied unless prevented by walls (`slices`) or distance clues (`eggs`/`letters`).
   - **Technical fix:** During clue placement, run the solver *without* distance clues first to harvest up to $K$ rival spanning trees $T_1, T_2, \dots$, and place `eggs` / `letters` specifically on squares whose root distance $d_{T^*}(s)$ in the intended tree differs from $d_{T_i}(s)$ in the rival trees, guaranteeing each clue eliminates multiple rival rotations at once.

---

### 4.6 *Nonograms* (`Pattern` / [`src/gen/picture/`](src/gen/picture/))

In *Nonograms* (*Picross* / Tatham's `pattern.c`), enumerating all $\binom{W}{k}$ ways to place a row's clue blocks by brute force blows up as soon as a row has several small numbers.

1. **Forward–Backward Dynamic Programming Line Solver ($O(W \cdot K)$):**
   - Given a line of length $W$ with current cell states `state[0..W-1]` $\in \{\text{UNKNOWN}, \text{FULL}, \text{EMPTY}\}$ and $K$ run lengths $(L_0, \dots, L_{K-1})$:
     - Compute boolean table `prefix[i][j]`: can the first $j$ runs fit inside cells `0..i-1` respecting existing `FULL`/`EMPTY` marks?
     - Compute boolean table `suffix[i][j]`: can the remaining runs `j..K-1` fit inside cells `i..W-1`?
     - A run $j$ of length $L_j$ can validly start at index $s$ iff `prefix[s][j]` is true, cells `s..s+L_j-1` contain no `EMPTY`, cell `s+L_j` is not `FULL`, and `suffix[s+L_j+1][j+1]` is true.
   - Accumulate two bitmasks across all valid placements in a single pass:
     - `canBeFull[x]`: set to `1` if cell $x$ is covered by some valid placement of some run $j$.
     - `canBeEmpty[x]`: set to `1` if cell $x$ is left uncovered in some valid gap between runs.
   - Any cell with `canBeFull[x] && !canBeEmpty[x]` is forced `FULL`; any cell with `!canBeFull[x] && canBeEmpty[x]` is forced `EMPTY`; any cell with neither is an immediate contradiction (`0` solutions).

2. **Dirty-Line Worklist Propagation:**
   - Maintain a bitset queue of "dirty" rows and columns. Initially enqueue all $H$ rows and $W$ columns.
   - Whenever the DP solver for row $r$ newly determines cell $(r, c)$, enqueue column $c$ (and vice versa) until the queue is empty.
   - In compelling Nonogram generators (`pattern.c`), a candidate picture is accepted without extra given cells only if this pure line-DP worklist empties with 100% of cells determined—guaranteeing the player never has to guess a pixel to finish the picture.

---

## 5. Audit Checklist for Every Generator & Twist

Before pinning panels with `tools/make-panels.ts`, every generator (`src/gen/<genre>/`) must pass these checks in `verify.ts` and manual multi-seed inspection:

1. **Uniqueness under player visibility:** Does `solve()` find Status = `1` solution when given *only* what the player sees on the initial board (e.g., `blindDark: true`, `noCode: true`)?
2. **Every twist offers a constraint or a hint:** Does every active twist $t$ either rule out rival solutions (`without(panel, t)` margin) or provide a genuine deduction hint/shortcut (such as settling ambiguous word paths in `Words`, completing a visual colour pattern in `Carving`, or enabling a message-word shortcut in `Letters`), rather than doing nothing at all?
3. **No pointless clues:** Are clues pruned to a minimal constraining set (`chooseClues` / `minimizeEggs`), with any extra clues (`keepSpare`, pattern-completing colour marks, hint bows) kept deliberately as player-facing hints rather than accidental clutter?
4. **Shortest-path refutation:** Is every distance clue (`eggs`, `letters` in `webs` and `lights`) at distance $\ge 2$, and prioritized for detour paths (`distance > shortestReach`)?
5. **Frontier-only white elements (`colours`):** Does every `'w'` square/knot/portion touch both `'r'` and `'b'`? Are `'r'` and `'b'` each connected? Do both colours interact with `'w'` in the unique solution?
6. **Balanced, between-square symmetry (`snow`):** Does the mirror axis run between squares (even span across axis) on square grids, with aspect ratio $\ge 0.6$, room outside the frame (where applicable), $\ge 3$ off-axis strokes, and clues distributed across *both* halves?
7. **Non-trivial dark placement (`dark`):** Are there at least 2 dark elements (or both lawn and rock in `hops`), non-touching where required (`lights`), never on endpoints (`words`), and never trivially framed by immediately adjacent given numbers (`hops`)?
8. **Clean spatial separation:** Do twist markers avoid colliding on the same cell (no eggs/letters on burrow mouths in `hops`, no eggs/letters on `'w'` squares or plugs in `lights`, cuts centered between knots in `webs`)?
9. **Multi-letter cross-referencing (`letters`):** Are there always at least 2 distinct letters on the board spelling a real theme word?
10. **Seeded determinism:** Are all random choices driven by `rng(seed)` and `shuffle(random, ...)`, with zero `Math.random()` or `.sort(() => random() - 0.5)` calls?
