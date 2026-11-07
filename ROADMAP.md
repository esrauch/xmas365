# Puzz: Roadmap

From where the game stands (2026-11-07) to the finished, polished game.
What the game *is* lives in [GAME.md](GAME.md) (the story is "The story:
Santa's hostile takeover": you are Leap Day, freeing the
mascots from Xmas365); the puzzle-by-twist map in
[PUZZLES.md](PUZZLES.md); build status in [PROTOTYPES.md](PROTOTYPES.md).

## Where we are

- **Puzzles: in decent shape.** Six genres, six twists, three tiers, all
  generated in seconds and pinned by tests; every room's runs built; the
  merger contract is six two-twist panels.
- **Game shell: working.** Holiday Hall (3D rotunda), room runs, carried
  items, lamps, the Calendar Desk, step hints.
- **Story and progression: the weak part.** The code runs an older story
  told in text banners, with progress shown as counters. The new design (you
  are Leap Day; free the mascots; found Xmas365 memos; acquired rooms that
  peel back; a party at the end) isn't built.

## The plan

Phases run roughly in order; each ends in something playable. Playtests
(your phone, the whole loop, in order) are the checkpoints between them.

### Phase 0: housekeeping (small)

- Finish and commit the in-progress Calendar Desk menu work.
- Keep `GAME.md`, `PUZZLES.md` and `PROTOTYPES.md` in step as each phase lands.

### Phase 1: the new story in the shell

Replace the old story with the new one, in words first (art comes later).

- **State:** drop the act chain (Shadowy Figure, Tuesday unmasked); Xmas365
  is the open villain from the start, and the player is Leap Day. Track story milestones as events: first
  entry to a room, stray freed, item brought home, mascot freed, lamp count.
- **Beats:** one small system that shows a short beat at each milestone (a
  found Xmas365 memo, a Leap Day one-liner, a mascot's thank-you), shown
  once, then pinned up in the hall to reread. Remove the per-panel villain notes: panels show
  rules only.
- **Lines:** all story text in one content file: Xmas365's internal memos
  (by milestone, escalating, written to Santa's staff and never to you),
  Leap Day's reactions, six mascot thank-yous, the ending.
- **Player as Leap Day:** UI copy speaks to the player as Leap Day; rename
  Tuesday throughout the shell (the hall, the finale, the desk's daily
  puzzle).

*Done when:* a full playthrough reads as the new story, start to finish,
with no old-story text left.

### Phase 2: the guided opening and Room Ladder UX

- **Opening & room unlocks:** a dropped Xmas365 memo announces the takeover of
  all 365 days; only Thanksgiving starts open (showing its big Warm-up button).
  Other rooms start with a big Locked indicator until you bring one of their two
  eligible items: arriving with an eligible item turns the button into **"Restore
  Item & Unlock Room"**, which places the item and transitions into the big
  Warm-up button.
- **Room Ladder UX:** once a room's warm-up is complete, show the two-tree
  progression ladder in the room:
  - **Bottom:** the completed warm-up (clearly green) with lines branching up to
    the room's two stray puzzle boxes (each turning green and staying in place
    when solved).
  - **Top:** the two home items to return in their own non-puzzle slot UX, with
    lines feeding up into the centrepiece unlock.
- **Calendar Desk:** reclaims each holiday's warm-up & standard generator as its
  warm-up is beaten, and all twists as its centrepiece is beaten; **"Day 366"**
  (the daily puzzle) and the full mixer serve as the endless mode.

*Done when:* a brand-new player is taught the whole loop in Thanksgiving
without reading instructions. **Playtest 1: the whole loop, new story.**

### Phase 3: acquired rooms, mascots and lamps (art)

The story told in the world.

- **Leap Day** as a voxel frog in round glasses (the player's look), and
  **six mascots** (`GAME.md`, "The cast"): the Spider in a witch's hat, the
  Turkey in a buckle hat, the Snowman in a top hat, the Teddy Bear with a
  heart on its tummy, the Easter Bunny, and the Eaglet in an Uncle Sam hat;
  each with a cage at its centrepiece, and a freed pose.
- **Acquired rooms:** each room starts with corporate Christmas signage,
  drained colours and the caged mascot.
- **Peel-back stages:** each item brought home peels some branding off;
  restoring the centrepiece opens the cage, brings back the room's full
  colour and lights its lamp in the hall (a moment with sound and a little
  camera move).
- The found memos pinned up in the hall (a corkboard), growing as you go.

*Done when:* you can tell how far you are by looking at the house.

### Phase 4: the ending

- **The merger contract:** the six two-twist panels framed as clauses, each
  torn up on solving; the last is the loophole, day 366.
- **The party:** all six mascots in the hall, Leap Day crowned **"Day 366
  (Every Year)"** (pencilling Feb 29th onto every year's calendar), Santa
  finally learning who you are, credits.
- **The cake relay:** design and build the single board where every genre
  adds to Leap Day's party cake (outline in `GAME.md`). This needs a small
  multi-genre board of its own.

*Done when:* the game can be finished. **Playtest 2: the whole game, start
to end.**

### Phase 5: bonus panels

- Offered by each room's **freed mascot** once their cage opens: a few optional
  hard panels per room, picked from the generators (and pinned), earning a room
  decoration and a party hat for that mascot to wear at the party.

### Phase 6: sound

- Music per room in two moods (acquired: muzak-ish corporate Christmas;
  restored: the room's own theme), the hall's theme, the party.
- Milestone sounds: stray freed, item placed, cage opened, lamp lit, clause
  torn. Built on `src/audio` (synthesized songs and effects already exist).

### Phase 7: the lighter layer

- Strays that start hidden, with a found memo hinting where.
- Clickable gags and reactions in every room, above all round the mash-ups
  and Santa's branding.

### Phase 8: tuning and UX

- Panel order and difficulty within each run (from playtest notes); the
  open UX items in `PROTOTYPES.md` ("For the UX pass").
- Accessibility: red and blue readable for colour-blind players (shapes or
  patterns as well as colour), text size, touch targets.
- **Playtest 3**, ideally with someone who hasn't seen the game.

### Phase 9: release

- Phone performance: a steady 60 fps on a mid-range phone, first load under
  ~5 MB (`TECHNICAL.md`, Goals).
- Saves that survive refreshes and updates; a reset option.
- Title screen, settings, credits; deployment as a static site.

### After release: the Calendar Desk

- The daily puzzle (**"Day 366"**, seeded by date) and the mixer are the endless
  mode; tune which genres and twists the daily rotates through.

## Decisions still open

From `GAME.md`, "To decide": the exact lines; how the cake relay looks
with the mascots at the party; hidden strays and the lighter layer's gags.
