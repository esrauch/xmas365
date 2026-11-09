# XMAS365™: Twist Difficulty

How hard each twist makes its puzzle, and how the generators compensate so
that every twist is about as hard as the plain puzzle of the same size.
Started 2026-11-08. The design rules this builds on are in
[PUZZLE_DESIGN.md](PUZZLE_DESIGN.md) (§2.7 has the short version); the
twist-by-genre map is in [PUZZLES.md](PUZZLES.md).

## The premise

A twist changes how hard a board is. Some twists act like a **hint**: they rule
moves out, so the board gets easier. Others **hide information** or add a
**long-range rule**, so the board gets harder. Our generators trim clues to the
fewest that keep the answer unique, and they don't notice the difference: a
harder twist gets the same few hints as the plain puzzle, and the player feels
a spike (the 7×7 Egg Tree was the first one we hit).

So every twist gets a **rating** for each genre:

| Rating | Meaning |
|---|---|
| **++** | much harder than the plain puzzle |
| **+** | harder |
| **=** | about the same |
| **−** | easier |
| **−−** | much easier |

And the generator **adjusts the clues to match**: more hints (or a smaller
board) for **+** and **++**, and as few as it can get away with for **−** and
**−−**, aiming for every twist to land near **=**.

### What "flat" can and can't mean

- **Harder twists can always be brought down,** by giving back hints.
- **Easier twists mostly can't be brought up.** Their hints are already the
  fewest that keep one answer, so there's nothing left to take away. The honest
  knobs are the twist's own intensity, where a genre has one, or taking away an
  easing feature the base game added (like Hops' rocks). Some twists will stay
  a little easy, and that's fine: an easy twist is a breather, while a spike is
  a wall.

## How we rate a twist

Two inputs, combined:

1. **Solver work.** Generate boards of the plain puzzle and of each twist at
   the same size, and compare the median number of search steps the uniqueness
   check takes. It's cheap, repeatable and good at spotting big swings.
2. **Judgement about how a person plays it.** The solvers are not people:
   - Some finish the plain puzzle almost by elimination alone (Webs, Pictures),
     so tiny step counts make their ratios noisy.
   - **The solvers brute-force the letter twists.** A person works out the
     letter-to-number code first, often in a few moves, and then solves an
     ordinary puzzle. The solver instead searches the code and the board
     together, so its step count balloons. In **Words** especially, with short
     three-letter words in the grid, a player cracks the code almost at once.
     **We rate letters as = in Words, Hops, Webs and Carving** (playtest
     judgement: solving the words ahead is trivial), not ++ as the solver
     suggests. Lights and Pictures are still to be checked the same way.

When the two disagree, judgement wins, and the reason is written down.

## The ratings

Measured at 7×7, median of 4–5 generated boards per cell, before any
compensation. The number is solver work relative to the plain puzzle.

| Genre | Halloween (dark) | Valentine's (letters) | Fourth of July (colours) | Easter | Thanksgiving | Christmas (snow) |
|---|---|---|---|---|---|---|
| **Webs** | **+** (4×) | **=** (13×) ⁴ | **−** (3×) ² | eggs **++** (14×) | cuts **−** (3×) ² | **−** (1×) |
| **Carving** | **+** (17×) | **=** (56×) ⁴ | **=** (1.9×) | basket **=** (0.9×) ³ | cuts **−** (0.9×) | **+** (3.4×) |
| **Lights** | **+** (1.1×) | **++** (2.9×) ¹ | **=** (1.3×) | eggs **++** (2.9×) | slices **−** (0.9×) | **=** (1.0×) |
| **Words** | **+** (1.2×) | **=** (3.8×) ⁴ | **=** (1.1×) | eggs **−** (0.9×) | cuts **=** (1.0×) | **−** (0.9×) |
| **Hops** | **++** (2.0×) | **=** (0.4×) ⁴ | **−−** (0.2×) | burrows **++** (2.6×) | courses **−−** (0.1×) | **−** (0.7×) |
| **Pictures** | **+** (1.0×) ⁵ | **++** (184×) ¹ | **=** (1.0×) | eggs **=** (1.1×) | portions **=** (1.3×) | **=** (1.0×) |

1. **Letters, solver-inflated (Lights, Pictures).** The step counts reflect the
   solver searching the code. Rated on how they play, but each needs a playtest
   check, as the other four genres got: if players crack the code first here
   too, these drop to **=**.
2. **Tiny step counts** (1 → 3): rated on how the twist plays. Each adds a
   restriction that rules moves out.
3. **Basket already compensates itself:** the generator swaps size numbers for
   basket items (3 numbers instead of 14).
4. **Letters is = in Words, Hops, Webs and Carving (playtest judgement):**
   players solve the words (the letter mapping) ahead first, which is trivial,
   especially with three-letter words, and the rest is an ordinary board. The
   solver's 3.8×–56× is brute force over the code.
5. **The line solver doesn't feel hidden clue numbers,** but a player does.

### Patterns

- **Hiding information is harder:** Halloween's dark, everywhere.
- **Easter's number twists are hard where the board is a path or a network**
  (Webs, Lights, Hops: you're counting steps along a route you haven't drawn
  yet), but they help in Words, where they pin letters in place.
- **Fences and portions make things easier:** Thanksgiving's cuts, slices,
  courses and portions all rule moves out.
- **Snow and colours are mostly neutral,** except in Hops, where two bunnies
  split the route in half and make it much easier.

## Adjusting the clues

### The rule

After the generator finds its minimal clue set, a rated twist gets **extra
true hints back**:

| Rating | 5×5 | 7×7 | 9×9 (free play) |
|---|---|---|---|
| ++ | 1 | 2 | 3 |
| + | 0 | 1 | 2 |
| = | 0 | 0 | 0 |
| − / −− | 0, and remove any easing feature | 0, same | 0, same |

Two conditions on every extra hint:

- **It never makes the twist pointless.** The generator re-checks that every
  twist still does real work (`problems(panel, margin)`), and gives back fewer
  hints if not.
- **It's spread out:** placed far from the hints already shown, so it opens a
  new region rather than repeating one.

A twist can also change the board itself (Hops' rocks shrink the lawn). The
table above is the starting point; each genre is then **tuned against
measurements**, since one more hint is worth a different amount in each genre.

### Each genre's knobs

| Genre | Knob for harder twists | Status |
|---|---|---|
| **Hops** | **Rocks** (base game: squares the bunny can't hop onto, shrinking the lawn) and **spare eggs** | **Done** (below) |
| **Carving** | a pre-carved rectangle; fewer `?` or letter sizes | to do |
| **Webs** | a pre-drawn thread; fewer dark knots or eggs | to do |
| **Lights** | pre-locked tiles, already turned the right way | to do |
| **Words** | one word already found | to do (only the dark twist needs it) |
| **Pictures** | a few cells pre-filled; one letter's value revealed | to do |

## Hops: done (2026-11-08)

- **Rocks are part of the base game:** 1 at 5×5, 3 at 7×7 and 5 at 9×9.
  Spooky's shadowed squares are now simply "maybe a rock".
- **Per twist, rocks shift** (`ROCK_SHIFT` in `src/gen/hops/generate.ts`):

  | Twist | 5×5 | 7×7 | 9×9 |
  |---|---|---|---|
  | burrows | +1 | +3 | +3 |
  | dark | +1 | +2 | +2 |
  | courses, colours | −1 | −3 | −5 |
  | snow | none at all (a rock in the mirror frame would break it) | | |

- **Spare eggs** (`SPARE_EGGS`), because the minimal-egg search otherwise takes
  back what a smaller lawn gives:

  | Twist | 7×7 | 9×9 |
  |---|---|---|
  | burrows | 1 | 1 |
  | dark | 1 | 1 |
  | snow | 2 | 3 |

- **Results at 7×7** (solver work against a plain board, which with its own 3
  rocks now takes about 1,800 steps instead of 4,800):

  | Twist | Before | After |
  |---|---|---|
  | burrows | 2.6× | 0.95× |
  | dark | 2.0× | 0.89× |
  | snow | 0.7–8× (noisy) | 0.89× |
  | letters | 0.4× | 0.69× |
  | colours | 0.2× | 0.41× |
  | courses | 0.1× | 0.20× |

  Courses and colours stay easier with no rocks at all: there's nothing left to
  take away. **9×9** boards vary a lot from one board to the next, so their
  settings lean easier.
- **Story boards re-pinned:** the Egg Tree's two 7×7 boards and the Bedsheet
  Ghost relic's 7×7 board. The other Hops story boards keep their old rock-free
  layouts until they're re-pinned.

## Audit run: 2026-11-08 (after the Hops changes)

All six genres, the plain puzzle and every twist, at **5×5 / 7×7 / 9×9**: the
median solver work of 6–8 generated boards per cell (8 at 5×5 and 7×7, 6 at
9×9), relative to the plain puzzle at the same size. Hops includes its new rocks
and spare eggs; nothing else is compensated yet.

| Genre | Twist | 5×5 | 7×7 | 9×9 | Rating | Change from the first pass |
|---|---|---|---|---|---|---|
| **Webs** | dark | 4.0× | 4.0× | 2.2× | **+** | |
| | letters | 3.0× | 12× | 6.4× | **=** ³ | was **++** |
| | colours | 1.0× | 3.0× | 0.6× | **−** ² | |
| | eggs | 3.0× | 8.0× | 3.6× | **++** | |
| | cuts | 1.0× | 3.0× | 1.0× | **−** ² | |
| | snow | 1.0× | 1.0× | 0.2× | **−** | |
| **Carving** | dark | 1.5× | 2.7× | **18×** | **+**, **++** at 9×9 | harder at 9×9 |
| | letters | 5.6× | 24× | 26× | **=** ³ | was **++** |
| | colours | 1.1× | 1.6× | 1.3× | **=** | |
| | cuts | 1.1× | 1.0× | 1.1× | **=** | was **−** |
| | snow | 2.0× | 3.2× | 2.4× | **+** | |
| | basket | 2.3× | 1.3× | 2.2× | **+** | was **=** |
| **Lights** | snow | 1.0× | 1.2× | 1.4× | **=** (**+** at 9×9) | |
| | dark | 1.1× | 1.3× | 1.5× | **+** | |
| | letters | 1.7× | 3.1× | 2.9× | **++** ¹ | |
| | eggs | 1.7× | 2.9× | 3.1× | **++** | |
| | colours | 1.0× | 1.0× | 1.0× | **=** | |
| | slices | 1.0× | 1.0× | 1.2× | **=** | was **−** |
| **Words** | dark | 1.4× | 1.2× | 1.2× | **+** | |
| | letters | 6.2× | 5.4× | 12× | **=** ³ | |
| | colours | 1.4× | 1.1× | 1.0× | **=** | |
| | eggs | 1.1× | 1.0× | 1.0× | **=** | was **−** |
| | cuts | 1.1× | 0.9× | 1.0× | **=** | |
| | snow | 0.9× | 0.9× | 0.8× | **−** | |
| **Hops** (compensated) | courses | 0.36× | 0.33× | 0.08× | **−−** (nothing left to remove) | |
| | colours | 0.55× | 0.36× | 1.0× | **−** (= at 9×9) | |
| | burrows | 0.39× | 0.66× | 0.64× | **−** (overshot) | was **++** |
| | snow | 1.3× | 1.0× | 0.15× | **=** (overshot at 9×9) | |
| | letters | 0.92× | 0.38× | 1.0× | **=** ³ | |
| | dark | 0.98× | 0.93× | 0.24× | **=** (overshot at 9×9) | was **++** |
| **Pictures** | dark | 1.0× | 1.0× | 1.0× | **+** ⁴ | |
| | letters | 11× | 184× | 292× | **++** ¹ | |
| | colours | 1.0× | 1.0× | 1.0× | **=** | |
| | eggs | 1.4× | 1.1× | **12×** | **=**, **++** at 9×9 | harder at 9×9 |
| | portions | 2.2× | 1.9× | **4.2×** | **+** | was **=** |
| | snow | 1.0× | 1.0× | 1.0× | **=** | |

1. Letters in Lights and Pictures: solver-inflated (it searches the code); playtest before trusting.
2. Webs' tiny step counts make these noisy; rated on how they play.
3. Letters in Words, Hops, Webs and Carving: rated **=** by playtest judgement (solving the words ahead is trivial).
4. The line solver doesn't feel hidden clue numbers; a player does.

### What the run changes

- **Hops is flat at 7×7 and now overshoots into easy at the edges.**
  - **Burrows at 5×5** (0.39×): its extra rock is too much; drop it.
  - **Dark and snow at 9×9** (0.24×, 0.15×): too many spare eggs; drop to 0 and
    1. 9×9 Hops boards vary a lot between boards (the plain 9×9 ranged widely
    across runs), so retune with more samples.
- **Size matters more than the first pass showed.** Several twists are fine at
  5×5 or 7×7 and spike at 9×9: **Carving dark** (18×), **Pictures eggs** (12×)
  and **Pictures portions** (4.2×). These need their compensation to grow with
  size, which the clue-adjustment table already allows (more hints at 9×9).
- **Re-rated:** Carving basket **=** → **+** (2.2× at 5×5 and 9×9), Pictures portions
  **=** → **+**, and Carving cuts, Lights slices and Words eggs **−** → **=** (all within
  noise of 1.0×).
- **Letters re-rated to =** in Webs, Carving and Hops (playtest judgement, as for
  Words): solving the words ahead is trivial.
- **Still the biggest jobs:** Webs eggs, Lights eggs, and (pending the same
  playtest check) Lights and Pictures letters.

## Next

1. **Playtest the letter twists** in Lights and Pictures, as for the other four
   genres: does a player crack the code first? Re-rate them.
2. **Build the knobs,** in order of the biggest spikes: **Webs** (eggs ++,
   dark +), **Lights** (eggs ++, letters ++, dark +), **Carving** (dark +, ++ at
   9×9; snow +; basket +), **Pictures** (letters ++, eggs ++ at 9×9, portions +,
   dark +), **Words** (dark +).
3. **Re-pin the story boards** of every + and ++ cell with the new settings.
   Free play picks them up automatically.
4. **Keep a measuring tool in the repo.** The audit used a throwaway script:
   generate N boards per genre and twist at a size, and report median solver
   steps and hint counts. Make it `npm run measure-twists`, so every change to
   a knob can be checked against the table above.
