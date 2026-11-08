# XMAS365™: Intro Cinematic

The first thing a new player sees: about 13 seconds, no words until the last
line, telling the whole premise. Every holiday has its mascot; XMAS365™ gift-wraps
the entire year; the mascots are boxed up; and one day was never on the
calendar at all, and that day is you. Then the title card, then the hall and the opening memo (`SCRIPT.md`, `P1`).

**Status (2026-11-07): designed, not built.** It replaces the current DOM
calendar card in `main.ts` (`mountIntroOverlay`, `updateIntroCinematic`).

## Decided (2026-11-07)

- **The set is a calendar floor**, not the hall: the year laid out as twelve
  month slabs of day tiles, with no numbers. It reads as a calendar from its
  shape alone.
- **Each mascot stands on its holiday**, a coloured square where that day is.
- **A driverless XMAS365™ steamroller gift-wraps the year.** Its front drum is
  a giant roll of wrapping paper that **unrolls behind it like a carpet**. It
  mows three lanes, back and forth. There's no driver, so Santa stays offstage
  until he bursts in at the loophole (`SCRIPT.md`, `C7`).
- **Mascots are wrapped where they stand.** Each startles and jumps; the paper
  rolls over it, and a gift box with a bow pops up in its place.
- **The calendar has no Feb 29.** It's XMAS365™'s calendar: 365 days, and
  the steamroller papers every one of them. February is 28 days, a neat
  rectangle of four rows (in 2032 it starts on a Sunday). **Feb 29 is a lone
  tile somewhere else entirely**, off the calendar, never part of the plan.
  When the year is all wrapped, the camera finds it, with Leap Day sitting
  on it.
- **The caption:** *Leap Day: "Huh. Missed a spot."*
- **Then the title card**, a straight corporate logo: **XMAS365™**, as if the
  game were Santa's product.

## The flow around it

1. **Tap to start** (needed before a browser will play sound): a plain dark
   screen with a small "Tap to start" and a sound-on hint. No logo, which
   saves the reveal for the title card.
2. **The cinematic** (below), about 13 s.
3. **The title card**, about 3 s, then a tap (or 3 more seconds) to go on.
4. **The hall**: the camera settles, the opening memo (`P1`) lands, and play
   begins.

**When it plays:** in full on a new game. On a replay (from settings), it can
be skipped by holding the screen for a second. A stray tap never skips it. A
returning player with a save goes straight from "Tap to start" to the hall.

## The set

### The calendar floor

- **The year 2032**, weeks starting on Sunday, so the layout is a real one
  (each month starts on its true weekday; the ragged first and last rows make
  it read as a calendar).
- **Twelve month slabs**, four across and three down, each a 7-column grid of
  day tiles on a slightly raised wooden board, with the month's name painted
  on the slab's top edge (JAN … DEC). Gutters of bare floor run between the
  slabs and between the three rows (the three lanes).
- **Day tiles** are plain cream squares with a little bevel, no numbers.
- **Holiday squares**, each in its holiday's colour, with its mascot on it:

| Day (2032) | Holiday | Square | Mascot |
|---|---|---|---|
| Sat Feb 14 | Valentine's | pink | the Teddy Bear |
| Sun Mar 28 | Easter | pastel yellow | the Bunny |
| Sun Jul 4 | Fourth of July | blue | the Eaglet |
| Sun Oct 31 | Halloween | orange | the Spider |
| Thu Nov 25 | Thanksgiving | amber | the Turkey |
| Sat Dec 25 | Christmas | green | the Snowman |

- **No Feb 29 on the floor.** February is exactly four full rows, with no
  room for a 29th.
- **The lone Feb 29 tile** sits by itself on the bare floor some way below
  the calendar's bottom edge, out of shot until the end: one plain tile, a
  little askew, with Leap Day on it.
- **Lighting:** one warm key light from high on the left, long soft shadows,
  the game's cel shading and line art. A plain warm backdrop (no hall).

### The steamroller

- **XMAS365™ livery:** red body, green trim, the XMAS365™ logo on the sides,
  a chimney puffing little white clouds, a blinking "XMAS365™" sign on top of
  an **empty cab**.
- **The front drum is a roll of wrapping paper** (red and green, with a
  repeating XMAS365™ print). As it rolls, the paper unrolls flat behind it,
  covering the lane like a carpet. The roll gets visibly thinner with each
  lane.
- Rear wheels are ordinary dark drums; the whole machine only slides along
  its lane, with the drums turning to match.

### The gift boxes

- A box rises from under the paper where a mascot stood, in the same paper,
  with a ribbon cross and a bow that pops up last. A tag on the bow says
  **XMAS365™**.

## Shot list

Times are from the start of the cinematic. Camera moves ease in and out;
nothing cuts except where marked.

| # | Time | Camera | Action | Sound |
|---|---|---|---|---|
| 1 | 0.0–2.0 s | High, wide, three-quarter view of the whole floor, drifting slowly. Letterbox bars slide in. | The year in warm light. The six mascots idle on their squares (a bob, a blink, a look round). | A music-box tune |
| 2 | 2.0–3.0 s | Eases toward the floor's left edge, lower. | A horn honks. The steamroller rolls in from the left at January, roll fat, chimney puffing. | Horn, engine rumble |
| 3 | 3.0–4.6 s | Follows alongside lane 1 (JAN–APR). | Paper unrolls behind it. **Valentine's:** the Teddy Bear jumps, the paper rolls over, a box pops up. Then **Easter**: the Bunny. | Rumble, paper rustle, two box pops |
| 4 | 4.6–5.0 s | Holds as it turns. | The roller swings round at April's end and drops into lane 2. | Gear clunk |
| 5 | 5.0–6.2 s | Follows lane 2 (MAY–AUG), right to left. | **Fourth of July:** the Eaglet jumps, wrapped. | Rumble, one box pop |
| 6 | 6.2–6.6 s | Holds as it turns. | Down into lane 3. | Gear clunk |
| 7 | 6.6–8.0 s | Follows lane 3 (SEP–DEC). | **Halloween**, **Thanksgiving**, **Christmas** wrapped in quick succession; the roll runs out of paper just as it reaches December's end, and the steamroller puffs off-screen. | Rumble, three box pops in rhythm, a sputter |
| 8 | 8.0–9.2 s | Pulls up to straight overhead, the whole year in frame. | The year is all wrapping paper and six gift boxes, not one day left showing. The **XMAS365™ logo** slams down across it: a small camera shake, confetti, the music cuts out. | A big stamp hit, then silence |
| 9 | 9.2–11.0 s | Tilts and pans down past the calendar's bottom edge, over bare floor, and settles low and close. | A single plain tile on its own, nowhere near the calendar. Leap Day sits on it, blinks; the glasses catch the light. | A single croak |
| 10 | 11.0–13.0 s | Holds close on Leap Day. | Caption at the bottom: **Leap Day:** *"Huh. Missed a spot."* | A soft two-note sting |
| — | 13.0 s | Cut. | Letterbox bars close; **the title card**. | Title sting |

## The title card

A straight corporate logo, played deadpan: the **XMAS365™** wordmark (the
same red and green italic as the memo letterhead, `ui/memo.ts`), and under it
the tagline *Christmas. Every day. Forever.™* It fades up on a plain backdrop
in the wrapping paper's red, holds about 3 seconds, and waits for a tap (or
moves on by itself after 3 more).

## The caption

Bottom of the frame, inside the letterbox: the speaker's name in small caps,
then the line, typed on letter by letter, white with a soft dark shadow.

> LEAP DAY
> Huh. Missed a spot.

This is the only text in the cinematic. It belongs in `SCRIPT.md` as the
first beat (before `P1`).

## How it's built (with what we have)

Everything is made in code, like the hall (`TECHNICAL.md` §6); nothing new
to install.

- **One scene**, separate from the hall, built and shown only for the intro,
  then thrown away.
- **Day tiles:** one `InstancedMesh` of 365 bevelled boxes (plus the lone Feb 29 tile, separate), with a colour
  per tile for the holiday squares (one draw call).
- **Month slabs and names:** a box per slab, and the name on a small canvas
  texture.
- **The paper:** for each lane, one plane with a repeating wrapping-paper
  canvas texture. It grows from the lane's start to the roller's position
  every frame (its length and texture repeat change together). Three planes
  in all.
- **The steamroller:** primitives (box body and cab, cylinder drums, a
  chimney), with the logo on a canvas texture. Its roll's radius shrinks a
  little per lane. Chimney puffs are a few white spheres that rise, grow and
  fade.
- **Mascots:** the meshes from `game/mascots.ts`, moved as whole objects:
  an idle bob, then a squash, a hop and a stretch when the roller arrives.
  They're hidden as their box appears.
- **Gift boxes:** a box, two ribbon strips and a bow (two flattened spheres),
  rising from the paper with an overshoot; the bow pops last.
- **The logo slam:** one plane with the wordmark on a canvas texture, scaled
  down onto the floor with a fast ease and a bounce; confetti is a few dozen
  small instanced squares.
- **Camera:** a short list of keyframes (position, look-at point, field of
  view) with eased blends between them. No free camera.
- **A timeline:** the cinematic is data, a list of timed events (camera
  keys, "roller enters lane 2", "wrap mascot 3", "caption"), run by one
  small player. That keeps it tunable, and identical on every play.
- **Letterbox, caption and title card:** DOM over the canvas, styled like
  the memos.
- **Sound:** from `src/audio`: a music-box tune, a horn, a noise-based engine
  rumble, rustles, box pops, a stamp hit, a croak and two stings.
- **No stutter:** compile the scene's shaders before shot 1 starts (during
  "Tap to start"), and start the timeline only once frames are steady.

## Build order

1. The calendar floor, holiday squares, mascots and the lone Feb 29 tile,
   with the camera keyframes and the timeline player: shots 1 and 9 working.
2. The steamroller, the unrolling paper and the lane path: shots 2 to 7.
3. Wrapping the mascots: the hop and the box pop.
4. The overhead logo slam, the caption, the letterbox and the title card.
5. Sound.
6. "Tap to start", skipping, and the hand-off to the hall and `P1`.
7. A polish pass at phone size: timing, easing, shadows and a steady frame
   rate.
