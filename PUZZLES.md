# Puzzles: six base puzzles, six twists

The puzzle design in one place. `GAME.md` has the story, rooms and panel
runs; `PROTOTYPES.md` has build status; `PUZZLE_DESIGN.md` has the generator
design rules, Do/Don't examples and precedents for making compelling panels.
This file is the map that ties them
together: every base puzzle against every holiday twist, and what makes each
one satisfying to play with a thumb.

**Decided 2026-11-03:** Christmas's twist is **snowflakes** (a mirror) and
the Fourth of July's is **red, white and blue**. Red and green (the old
Christmas twist) and edge flags (the old Fourth of July twist) are retired.
All built rooms now use the current set.

## The premise

XMAS365™, Santa's hostile takeover, has mixed up the six holidays (you are
Leap Day, freeing them; see `GAME.md`). Each holiday brings two
things, kept apart on purpose:

- **A base puzzle:** a proven logic puzzle (Nikoli, Simon Tatham's
  collection, the NYT) dressed in the holiday's theme. It's the genre of
  that holiday's room: every panel there is that puzzle.
- **A twist:** one extra rule about the holiday itself, not its puzzle. It
  travels: the holiday's **five relics** are stranded in the five other rooms
  (one per other room, **30 relics** in all) and carry the twist into those
  rooms' puzzles. A twist means the same thing everywhere, so a player who's
  met it once recognises it in the next room.

So the game is a **6 × 6 grid** where every Base carries every Twist right in
the story rooms (~140 puzzles across the six rooms):
1. **Intro Run** (`5` puzzles, `5×5` → `7×7`): plays the room's Base plain (0 Twists), taught puzzle by puzzle.
2. **Home Twist Run** (`5` puzzles, `5×5` → `7×7`): plays the room's own holiday Twist at home (built from the former centerpiece runs). Beating it unlocks all five Relic Runs.
3. **5 Relic Runs** (`3` puzzles each, `5×5` → `7×7`, one per other holiday): brings each of the other five holidays' Twists into this room's Base. The first puzzle of every Relic Run is a tiny one-solution board that teaches the Twist, since a Twist can be met first in any of five rooms. Solving a Relic Run frees the Relic so you can carry it home to its **Relic Shelf** under the caged mascot (opening one of the cage's five padlocks).

Any beaten rung on a room's ladder can be replayed or played forever in
**Free Play** (`5×5`, `7×7` or `9×9`, with a solved count). The final area,
XMAS365™'s **Merger Contract**, then tests multi-twist mastery across 6 Clauses
× **22 puzzles** (`6 Twist Reminders + 15 Double Twists + 1 All 6 Twists` =
**132 puzzles**). Across the whole grid the player keeps meeting the same six
puzzles and six twists in new combinations, which is *The Witness*'s pleasure:
learn a language, then read it everywhere.

**Rules that hold everywhere:**
- Every panel has exactly one answer, reached by logic.
- No twist feels pointless: remove it and more answers fit, and its clues
  change what the player would otherwise do (an egg refutes the obvious
  path, rather than confirming it). Extra clues are fine as hints or theme.
- A room's Home Twist Run uses only its own holiday's twist, and each Relic Run
  starts with a teaching board.
- Words in a grid are real words; puns go in labels only.

## What "clicky" means here

The bar is *The Witness* on a phone: every touch does something you can see
and hear, the rules are on the board, and solving is a small celebration.

1. **One gesture per puzzle,** learned in a second: drag a thread, drag a
   rectangle, tap to turn, drag through letters, drag a trail, tap to fill.
   A twist never adds a second gesture.
2. **Every action answers back:** a blip, a buzz, a colour. A clue glows
   when it's satisfied and blushes red when it's broken, *as you go*, so the
   player never has to check by hand.
3. **Twists you can see working:** an egg turns green on time, a fence
   flashes when a thread tries to cross it, a snowflake's ghost shows where
   the mirror image still has to go. If a twist can't show its progress, it
   isn't clicky enough.
4. **A reveal on solving:** the board turns gold and chimes, and the twist
   pays off: a message spells itself, the dark lights up, the picture
   appears.
5. **Failure teaches:** a wrong move is allowed and then explained, never
   silently refused.
6. **Small boards:** 5×5, 7×7 and 9×9 (easy, medium, hard), solvable in a
   minute or two.

## The six base puzzles

| Holiday | Base (Noun) | Based on | Rules in brief | The gesture | The payoff |
|---|---|---|---|---|---|
| **Halloween** | **Web** *(formerly Spiderweb)* | Hashi (Nikoli's Hashiwokakero; Tatham's Bridges) | Join the knots with threads. Each knot's number is how many threads leave it; threads run straight, one or two between a pair, never cross; the web is all one piece. | Drag knot to knot (again for a double); tap to cut. | Knots glow as they fill; a web in pieces flashes each piece; solved, it turns gold in the moonlight. |
| **Thanksgiving** | **Carving** | Shikaku (Nikoli; Tatham's Rectangles) | Divide the grid into rectangles, each holding exactly one number: its size. | Drag corner to corner; tap to lift. | A portion glows green when right; the carved board turns gold. |
| **Christmas** | **Lights** *(formerly Fairy Lights)* | Net (Tatham) | Turn the pieces so power from the plug reaches every square, with no loose wire ends. | Tap to turn a quarter clockwise. | You watch the power spread from the plug; loose ends spark; solved, the string turns gold and the star lights. |
| **Valentine's** | **Heartstrings** *(formerly Words)* | Strands (NYT) | Every letter belongs to one theme word; trace words through touching letters (diagonals too). Every word starts on a ringed letter. | Drag through letters. | A word locks in blue with a chime, and its ring fades. |
| **Easter** | **Hops** *(formerly Bunny Hops)* | Numbrix (Hidato with plain steps) | The bunny visits every square once, stepping up, down, left or right; numbered eggs are its steps of that number. Every puzzle has an egg 1 to start on. | Drag the trail; tap the bunny to step back. | Eggs glow when reached on time (red when early or missed); solved, they turn gold. |
| **Fourth of July** | **Fireworks** *(formerly Pictures)* | Nonograms | Clues at each row and column give its runs of filled squares, in order. Pictures solve exactly as drawn. | Tap to fill / cross / clear; drag a run. | Clues go grey as lines match; the firework picture appears. |

## The six twists

Each Twist has a canonical adjective used in the Dual Display format (`[Twist1] [Twist2] [Base] · BaseHoliday (TwistHoliday1, TwistHoliday2)`):

| Holiday | Twist (Adjective) | Formerly Used Terms | What it always means | How it shows itself working |
|---|---|---|---|---|
| **Valentine's** | **Love-Letter** | *Love Letters*, *Letters* | Some numbers are written as letters: the same letter is the same number, different letters different numbers. A little message's numbered blanks fill in from them, so the words and the puzzle help each other. Always at least two different letters (different numbers), even on easy: one letter alone is just a hidden given (fine only for a training level). | The message tiles fill in, gold, as the puzzle solves. Guessing the word is a legitimate shortcut. |
| **Christmas** | **Snowflake** | *Snowflakes*, *Frosty mirror* | The answer's skeleton is its own mirror image across a line, but a detail on each side is free, so neither half can be solved alone (see below). | A ghost shows where your drawing's mirror image still has to go; it fades once it's drawn. |
| **Halloween** | **Spooky** | *Dark*, *The dark* | Some clues are hidden in shadow (could be anything) until worked out. | The dark lights up on solving, showing what was there. |
| **Easter** | **Egg-Hunt** | *Egg Hunt*, *Eggs*, *Baskets*, *Burrows* | An egg marks *when* or *which*: the step a square is visited on, its place in an order, or an Easter basket share. | An egg turns green when its moment comes on time, red when it doesn't. |
| **Fourth of July** | **Patriotic** | *Red, White and Blue*, *Red/White/Blue*, *Colours* | Things are red or blue, or white (the default: uncoloured); two reds or two blues can't join or touch, and white touches anything. | A same-colour touch flashes both pieces red. |
| **Thanksgiving** | **Portioned** | *Portions*, *Fair shares*, *Cuts*, *Slices*, *Courses* | The board is outlined in portions and every portion gets the same; or short fences (cuts) that nothing may cross. | Each portion shows its share so far (🥧 2/3), green when it's fair; a fence flashes when something tries to cross it. |

### Snowflakes in detail

The rule that makes a mirror a puzzle rather than a copy: **some aspect of
the answer mirrors, and something still has to be decided on each side.**
Mirroring everything just halves the puzzle (solve one side, copy it).

- **Whole board where the mechanics allow.** Webs mirrors the whole board:
  the *joins* mirror across the icy line, but each side picks its own
  singles and doubles, so mirror knots usually show different numbers and
  you reason across both halves.
- **Otherwise, a frame:** inside a frosty frame, what's drawn (threads,
  cuts, wires, word strokes, the trail, filled squares) is its own mirror
  image; outside it, anything goes. Things crossing the frame's edge carry
  on freely, which is the escape: a 2×3 portion on one side can face a 2×2
  on the other, as long as the parts inside the frame match.
- **Between squares, in square puzzles.** In puzzles played on squares
  (Carving, Words, Bunny hops, Pictures, Lights) the mirror line runs between
  squares, never through their middles; Webs, played on points, mirrors
  through its middle knots.
- **Frames as large and square as possible.** A long thin frame (two
  columns mirroring each other) doesn't read as a snowflake; prefer near
  square frames covering a good share of the board.
- Shared code: `src/gen/core/mirror.ts` (frames, mirrored grid features,
  the symmetry check), so each genre only says what it draws.

## The matrix (all 36 Base × Twist cells in the story rooms)

Rows are Bases (rooms), columns are Twists (the home holiday of the Relic).
**Bold** marks the room's **Home Twist Run** (5 puzzles, `5×5` → `7×7`); the
30 off-diagonal cells are the **30 Relic Runs** (3 puzzles each, `5×5` → `7×7`,
5 per room). Every cell also supports endless browser **Free Play** (`5×5`,
`7×7`, `9×9`, ⚙️). Santa's **Merger Contract** (`src/proto/puzzles/clause.ts` +
`src/proto/puzzles/clauses/`) then combines twists across 6 Clauses × **22
puzzles** = **132 puzzles** (`Stage 1 · Twist Reminders` [6] + `Stage 2 · Double Twist` [15] + `Stage 3 · All 6 Twists` [1] per Base).

| Base (Room) ↓ / Twist → | Love-Letter (Val.) | Snowflake (Xmas) | Spooky (Hall.) | Egg-Hunt (Easter) | Patriotic (4th) | Portioned (Thanks.) |
|---|---|---|---|---|---|---|
| **Web** (Halloween) | ✅ Box of Chocolates, ⚙️ | ✅ Tree-Top Star, ⚙️ | ✅ **Home Twist: Spooky Web** (`dark`), ⚙️ | ✅ *Marshmallow Chick*, ⚙️ | ✅ *Picnic Basket*, ⚙️ | ✅ *Gravy Boat* (`cuts`), ⚙️ |
| **Carving** (Thanksgiving) | ✅ *Heart Locket*, ⚙️ | ✅ Stocking, ⚙️ | ✅ *Candy Corn*, ⚙️ | ✅ *Jelly Bean Jar* (Easter baskets), ⚙️ | ✅ Hot Dog, ⚙️ | ✅ **Home Twist: Portioned Carving** (`cuts`), ⚙️ |
| **Lights** (Christmas) | ✅ *Love Letter*, ⚙️ | ✅ **Home Twist: Snowflake Lights** (`snow`), ⚙️ | ✅ *Cauldron*, ⚙️ | ✅ Golden Egg, ⚙️ | ✅ *Ice Pop*, ⚙️ | ✅ Pumpkin Pie (`slices`), ⚙️ |
| **Heartstrings** (Valentine's) | ✅ **Home Twist: Love-Letter Heartstrings** (`letters`), ⚙️ | ✅ *Candy Cane* (mirror pairs), ⚙️ | ✅ Jack-o'-Lantern, ⚙️ | ✅ Bunny's Basket, ⚙️ | ✅ *Watermelon Slice*, ⚙️ | ✅ *Wishbone* (`cuts`), ⚙️ |
| **Hops** (Easter) | ✅ *Single Rose*, ⚙️ | ✅ *Gingerbread Man*, ⚙️ | ✅ *Bedsheet Ghost*, ⚙️ | ✅ **Home Twist: Egg-Hunt Hops** (`burrows`), ⚙️ | ✅ Star-Spangled Flag, ⚙️ | ✅ Cornucopia (`courses`), ⚙️ |
| **Fireworks** (Fourth) | ✅ Cupid's Bow, ⚙️ | ✅ *Snow Globe*, ⚙️ | ✅ Witch's Broom, ⚙️ | ✅ *Chocolate Bunny*, ⚙️ | ✅ **Home Twist: Patriotic Fireworks** (`colours`), ⚙️ | ✅ *Harvest Corn* (`portions`), ⚙️ |

### The 30 Relics by Home Holiday (5 per Mascot Cage)

| Holiday (Mascot) | Its 5 Relics (and the room where each is stranded) |
|---|---|
| **Valentine's** (Teddy Bear) | Cupid's Bow (Fourth), Box of Chocolates (Halloween), *Single Rose* (Easter), *Heart Locket* (Thanksgiving), *Love Letter* (Christmas) |
| **Easter** (Bunny) | Bunny's Basket (Valentine's), Golden Egg (Christmas), *Chocolate Bunny* (Fourth), *Marshmallow Chick* (Halloween), *Jelly Bean Jar* (Thanksgiving) |
| **Fourth of July** (Eaglet) | Star-Spangled Flag (Easter), Hot Dog (Thanksgiving), *Watermelon Slice* (Valentine's), *Picnic Basket* (Halloween), *Ice Pop* (Christmas) |
| **Halloween** (Spider) | Jack-o'-Lantern (Valentine's), Witch's Broom (Fourth), *Candy Corn* (Thanksgiving), *Cauldron* (Christmas), *Bedsheet Ghost* (Easter) |
| **Thanksgiving** (Turkey) | Cornucopia (Easter), Pumpkin Pie (Christmas), *Wishbone* (Valentine's), *Harvest Corn* (Fourth), *Gravy Boat* (Halloween) |
| **Christmas** (Snowman) | Tree-Top Star (Halloween), Stocking (Thanksgiving), *Candy Cane* (Valentine's), *Gingerbread Man* (Easter), *Snow Globe* (Fourth) |

---

### Spiderweb (Halloween)

- **Love Letters (Box of Chocolates, ✅; generator ⚙️):** every unique letter of a
  4–5 letter word is assigned to a thread count on the board, so the message is
  all numbered blanks: unscramble the word first to learn the numbers, then
  solve the web.
- **Snowflakes (generator ⚙️):** the whole board; the joins mirror across
  the icy line, singles and doubles don't. Ghost threads show missing
  mirror joins.
- **Spooky, at home (Spider's Web, ✅; generator ⚙️):** knots outside the
  lantern's light show no number. Home-only extra: diagonal threads.
- **Egg Hunt (generator ⚙️):** 🕷 marks the spider's home; an egg's
  number is how many threads it takes to reach it from home, always more
  than the shortest possible path (it refutes the obvious route).
- **Red, White and Blue (generator ⚙️; the Tree-Top Star now carries Snowflakes):**
  knots are coloured, and a thread only joins different colours; plain
  knots join anything. The generator colours a grown web along its threads.
  Knots are red or blue; white ones (the default) join anything.
- **Portions (generator ⚙️):** short fences on the squares' edges that no
  thread may cross, placed only where they rule other webs out.

### Carving (Thanksgiving)

All six columns are in the generator (⚙️), at every tier, in any mix (three
clue-adding twists at once only on easy so far). Playtested 2026-11-03:
Spooky and Portions (cuts) are good; the rest were adjusted as below.

- **Love Letters (⚙️):** every unique letter of a 4–5 letter word (CORN, FEAST,
  SWEET, HEART, ...) is assigned to a portion size on the board, so the message
  is all numbered blanks: unscramble the word first to learn the numbers, then
  solve the carving.
- **Snowflakes (⚙️):** inside a frame, the cuts mirror; portions crossing
  the frame's edge carry on differently outside. The mirror line runs
  *between* squares (a line through a square's middle made no sense), so
  frames are an even number of squares across the mirror. Frames at least
  3×3, near square, at most three quarters of the board, largest first.
  Random carvings rarely mirror over a big area, so frames come out small
  (4×4 on a 9×9); carving symmetrically inside a chosen frame is the next
  step to make them larger.
- **Spooky (⚙️):** some sizes show '?'. Playtested: good.
- **Egg Hunt, as baskets (⚙️; decided 2026-11-03):** Carving's Easter twist
  isn't numbered eggs (the "first cut" version was built and playtested:
  too confusing). Instead every portion gets an Easter basket: one 🥚 egg,
  one 🥕 carrot and one 🍫 chocolate (two foods on easy), with at least half
  the portions' sizes taken away. It's the Feast's fair-share rule with
  Easter food; Carving only, an exception to Easter's numbered eggs.
- **Red, White and Blue (✅ Hot Dog; ⚙️):** portions take the colour of
  their marks, and two of one colour never share an edge; plain portions
  touch anything. Every portion that can be coloured carries a mark (with
  only the strictly needed marks, the few dots looked pointless).
- **Portions, at home (⚙️):** fences no portion may cross.
  Playtested: great. The built Feast centrepiece uses fair shares (one of
  each Thanksgiving dish per portion); the generator's Thanksgiving twist
  for Carving is cuts.

### Lights (Christmas)

All six columns are in the generator (⚙️), generating in seconds across easy, medium, and hard.

- **Love Letters (⚙️):** letter bulbs whose distances (counting steps of wire from the plug)
  match numbered blanks in a message (e.g. LIGHT, SHINE, SPARK).
- **Snowflakes, at home (⚙️):** inside a frosty frame, the wires mirror across the axis;
  outside the frame, wiring carries on freely.
- **Spooky (⚙️):** some pieces stay dark, and turn blind, until
  the whole panel is solved.
- **Egg Hunt (Golden Egg, ✅; ⚙️):** an egg bulb must be reached in exactly its
  number of steps from the plug.
- **Red, White and Blue (⚙️):** a red string and a blue string that never
  join, each powered from its own plug; white pieces can belong to either.
- **Portions (Pumpkin Pie, ✅; ⚙️):** pie slices round the middle; no wire crosses
  a slice wall. The walls are placed so each slice gets exactly one wire from the
  middle anyway, so that isn't a separate rule (checked in `verify.ts`).

### Heartstrings (Valentine's)

All six columns are in the generator (⚙️). Words come from theme banks
(`src/gen/words/themes.ts`, real words only), picked to fill the board
exactly. Every word's first letter is highlighted (the ring fades once the
word is found), and the board must be sound as the player sees it, twists
included: one answer, and every word traceable only one way, so a found word
is always the right one. Unlike the other genres, twists needn't do work here:
a board may lean on its twists or be sound without them (decided 2026-11-10).
The dark hides only vowels, and eggs show 3 or more. Boards are
filled straight from the theme's bank, choosing words as they go (a pocket
of four squares takes a four-letter word), with dead ends caught as each
word grows (a sealed-off pocket must fit some unused words; a lone square
never can) and paths grown Warnsdorff-style (hugging edges and corners).
A word that can be traced another way is swapped for a bank word of the
same length on the same path (new letters usually kill the other way), with
a refill of its squares as the fallback. Every single twist now generates
at every tier in seconds or less (eggs on hard is the slowest, ~6 s).

- **Love Letters, at home (Valentine Mailbox, ✅; ⚙️):** some letters are written
  as numbers, like a codeword (at least two). Tracing counts coded letters
  as known (the key fills in); the whole board must have one answer with the
  code unknown.
- **Snowflakes (⚙️):** the whole board is the frame, one column narrower
  than the tier's size (5×4, 7×6, 9×8, or turned) so the mirror line runs
  between squares; a leftover column would only have held a straight word
  outside the frame, a giveaway. Words come in mirror pairs: each word's
  squares mirror another word's, its letters in a different order (so the
  mirror side still has to be read). Built from same-length word pairs: one
  of each laid on the first half, preferring curled-up shapes (a straight
  word has only two ways to lie in its mirror), the partner on the mirrored
  squares in a new order. The solver keeps a word's way to lie only if
  another word of its length could lie on the mirror image, which settles
  almost everything (fast at every tier).
- **Spooky (Jack-o'-Lantern, ✅; ⚙️):** some letters are blanks until a
  word through them is found; at most one per word, never first or last.
- **Egg Hunt (Bunny's Basket, ✅; ⚙️):** a letter's egg is its place in its word,
  placed on words that could otherwise be traced another way.
- **Red, White and Blue (⚙️):** words are red, white or
  blue; one letter of each word is bowed to show its colour, and two words
  of one colour never touch.
- **Portions (⚙️):** short fences between neighbouring squares that no word
  steps straight across, added after the board is laid: only on edges the
  true words never step, next to squares another way to lie would use, and
  kept only while they rule ways out (spare ones dropped). The earlier final area's
  words panel uses the older form: two portions, the same number of words
  each.

### Hops (Easter)

The base game has **rocks**: squares the bunny can't hop onto. The generator uses
them (and spare eggs) to keep each twist about as hard as a plain board
(`PUZZLE_DESIGN.md` §2.7).

- **Love Letters (⚙️):** some eggs show letters; each bunny's message
  of numbered blanks is its steps where its letters lie.
- **Snowflakes (⚙️):** inside a frame, the trail's strokes mirror; it
  enters and leaves in a different order, so the numbers differ.
- **Spooky (⚙️):** rocks in the shadows (shadowed squares are lawn or
  rock; the last egg gives the route's length).
- **Egg Hunt, at home (Egg Tree, ✅; ⚙️):** numbered eggs on tree-shaped boards.
  Home-only extra: burrows.
- **Red, White and Blue (✅ Star-Spangled Flag: red and blue bunnies; ⚙️):** bunnies of different
  colours, each over its own colour; plain squares go to any.
- **Portions (Cornucopia, ✅; ⚙️):** courses: the bunny finishes each
  outlined portion before starting the next.

### Fireworks (Fourth of July)

All six columns are in the generator (⚙️), generating across easy, medium, and hard.

- **Love Letters (Cupid's Bow, ✅; ⚙️):** every letter of a fireworks word
  (BOOM, GLOW, LIGHT, ...) is a run length, so the message is all numbered
  blanks: unscramble the clue letters into the word to learn the numbers, then
  solve the picture.
- **Snowflakes (⚙️):** inside a frosty frame, the filled squares mirror; clues
  cover whole lines, so they differ outside the frame.
- **Spooky (Witch's Broom, ✅; ⚙️):** some clues are in the dark (at most one
  per line, never a line's only clue).
- **Egg Hunt (⚙️):** an egg on a row clue marks which run in that
  row covers the egg square.
- **Red, White and Blue, at home (Grand Finale, ✅; ⚙️):** colour clues (runs of
  different colours may touch without a gap; empty squares are white).
- **Portions (⚙️):** every outlined portion holds the same
  number of filled squares.

---

## The final area: the merger contract, then the party

XMAS365™'s merger contract (`src/proto/puzzles/clause.ts` +
`src/proto/puzzles/clauses/`) is a 6-Clause checklist in Holiday Hall, one
clause per puzzle Base (`Web`, `Carving`, `Lights`, `Heartstrings`, `Hops`,
`Fireworks`). Each clause is a **22-puzzle Clause Run** (`6 Twist Reminders +
15 Double Twists + 1 All 6 Twists boss` = **132 puzzles** total across all 6
clauses; the plain base and solo twist stages were dropped since all 36 Base ×
Twist combinations now appear in the story rooms). Voiding all six clauses
triggers the Sec 6.2 Leap Year loophole right at Santa's podium and opens Leap
Day's surprise party in Holiday Hall (`src/game/dioramas/hall.ts`).

## Status (2026-11-08)

Every room now covers all six holiday twists (1 Intro Run + 1 Home Twist Run +
5 Relic Runs = 23 puzzles per room, ~140 across the 6 rooms), all 30 Relics
unlock the 5-padlock Mascot Cages, Free Play (`5×5`, `7×7`, `9×9`) lives directly
on any beaten rung of a room's ladder, and the Merger Contract is streamlined
to 22 puzzles per clause (132 total). What's next is in `ROADMAP.md`.
