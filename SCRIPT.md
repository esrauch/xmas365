# XMAS365™: Script

Every line in the game's story: Santa's memos, Leap Day's one-liners, the
mascots, the contract and the party. The story itself is in
[GAME.md](GAME.md) ("The story: Santa's hostile takeover"); the build plan is
[ROADMAP.md](ROADMAP.md), Phase 1, where these lines move into one content
file keyed by the beat IDs below.

**Status (2026-11-07): third draft (corpspeak & holiday puns, with the weak
puns cut).** Every
beat is written; expect rewrites after Playtest 1.

## Decided (2026-11-07)

- **Santa writes every memo.** He signs as CEO of XMAS365™ and writes to his
  staff, never to you. The humour is **full-throttle corporate buzzword-speak
  ("corpspeak": KPIs, sleigh-holder value, Q4 deliverables, right-sizing,
  synergistic verticals) colliding with shameless holiday puns**.
- **Pun rules (third pass):** a pun has to work both ways: the corporate
  phrase is real, and the holiday word sounds like the word it replaces
  (*fowl play*, *sleigh-ding*, *Always Be Clausing*). At most one pun per
  line, and none in the lines that have to teach or carry feeling (`T1`,
  the Snowman, `Y5`). The `sleigh-` prefix is kept to two spots.
- **The opening memo starts the hall corkboard.** It's already pinned up
  when the game begins.
- **Leap Day is wry and unbothered** about being forgotten ("Story of my
  life"). Leap Day only reacts, in dry punny one-liners, until the loophole
  and the party, where Leap Day finally talks to Santa and the mascots.
- **Each caged mascot's plea** is a yellow sticky note on its room's memo
  (found when you beat the intro run).
- **Leap Day never replies to memos** (decided 2026-11-08): the opening memo's
  reaction (`P2`) and the reaction to the first relic memo (`T2`) are dropped.
- **Freeing a relic is silent** (after the first one triggers `T1`). Each
  room has one memo, found when you beat its intro run.
- **Freeing a mascot is silent too** (decided 2026-11-11): its cage opens and
  it hops off to the Freed Mascots' Corner, with no dialogue. That dropped the
  running gag's setup (each freed mascot got your name or date wrong), so the
  party lines that pay it off ("Not the 28th!", "Not March 1st!", "not
  Tuesday!") need rewriting.
- **Christmas is a victim too.** Santa turns down complaints we never see
  (the elves' unionization drive, the reindeer's burnout), and the freed
  Snowman says it outright.
- **Escalation memos arrive every 5 relics returned** (`E1` at 5, `E2` at 10,
  `E3` at 15, `E4` at 20, `E5` at 25, `E6` at 30 when all six mascots are free).
- **Santa stands in Holiday Hall during the Merger Contract.** Once all 30
  relics are returned and all six mascots are free (`E6`), CEO Santa takes the
  podium in Holiday Hall personally with the Master Merger Contract. You
  confront him at `C0`, red-line each of the 6 clauses (`22` puzzles each)
  across the podium (`C1.torn`–`C5.torn`, `C6.early`), and spring the Sec 6.2
  Leap Year loophole (`C6.torn`) right in front of him. Then he's a humbled
  guest at the party, where the mascots vote to let him keep his twelve days
  of Christmas: **XMAS365™ becomes Xmas12**.
- **The contract has one holiday per clause**, each a 22-puzzle run on that
  holiday's base puzzle (`6 Twist Reminders + 15 Double Twists + 1 All 6 Twists`).
  The last clause defines "Fiscal Year" as 365 days, which is the loophole.
- **The Feast keeps its roast**, and the freed Turkey insists it's a
  tofurkey.
- **In the cake relay, each mascot hands over its stage with one line.**

## Format

| Voice | Form | Length |
|---|---|---|
| **Memo** | XMAS365™ internal memo: To / From / Re / body, signed by Santa. Shown once, then pinned to the hall corkboard. | ≤ 65 words |
| **Leap Day** | One dry line, usually a reaction to the memo just read. | ≤ 14 words |
| **Mascot** | A caged plea, a Freed Mascots' Corner line, or a party line. A `/` starts a new line on screen. | ≤ 2 short lines |
| **Santa** | Spoken, in person: at his podium during the Merger Contract and at the party. | ≤ 2 short lines |
| **Sign** | Signage, a tag or a contract clause. | a few words |

**Rules:**
- **Memos are never written to the player.** The one exception is the last
  memo, after the credits (`Y7`).
- **Panels stay clean.** Beats play when a run ends or when you walk into a
  room, never in front of a puzzle.
- **Every beat plays once.** A beat that falls due while another is showing
  waits its turn.
- **Order:** only Thanksgiving's opening is fixed. Beating Thanksgiving's
  home twist opens its five relic runs—one for each of the five other rooms—so
  the house fans out in any order. Escalation is counted every 5 relics
  returned (`E1` at 5 .. `E6` at 30).

```
Thanksgiving ─┬─ Hot Dog         ──▶ Fourth of July
(starts open) ├─ Stocking        ──▶ Christmas
              ├─ Heart Locket    ──▶ Valentine's
              ├─ Jelly Bean Jar  ──▶ Easter
              └─ Candy Corn      ──▶ Halloween
```

---

## Prologue: the takeover

### `P0`: the intro cinematic
*New game: the end of the intro cinematic (`intro_cinematic.md`), close on Leap
Day on the lone Feb 29 tile. Then the title card, then `P1`.*

**Leap Day:** "Huh. Missed a spot."

### `P1`: the press release
*New game. It's already pinned to the hall corkboard, and opens first.*

> **XMAS365™ · ALL-HANDS MEMO**
> **To:** All Verticals · **From:** S. Claus, CEO · **Re:** Maximizing
> Sleigh-Holder Value!
>
> Thrilled to announce XMAS365™ has finalized our hostile takeover of every
> holiday on the calendar! Going forward, all seasonal verticals will
> synergize under one North Star KPI: **Christmas, 365 days a year.** Legacy
> mascots have been right-sized into cages, and core assets cross-siloed.
> Let's wrap up Q1 through Q4!
>
> *S. Claus, CEO ("Always Be Clausing")*

### `P3`: the hall
*Signage (no prompt). Thanksgiving's door stands ajar.*

- Over the hall: **HOLIDAY HALL · An XMAS365™ Synergized Campus**
- Over each room: **{Rebranded name} · an XMAS365™ Subsidiary** (names below)

## Act 1: Thanksgiving, the guided opening

### `thanksgiving.enter`
*Its intro run beaten.* Room sign: **Pre-Christmas Table · an XMAS365™ Subsidiary**

> **To:** Pre-Christmas Dinner (fka Thanksgiving) · **Re:** Gobbling Up
> Market Share
>
> Per our Q4 roadmap, Thanksgiving is now **Pre-Christmas Dinner**. We're
> pivoting from "gratitude" to high-margin gift-wrapping. The Turkey is on
> involuntary garden leave: do not baste, consult, or uncage. All gravy is
> frozen pending a liquidity review, and leftovers are rebranded as
> "Boxing Day Beta".
>
> *S. Claus, CEO*

### `thanksgiving.caged`
**The Turkey:** "Ahem! This hostile takeover is *fowl* play! / Be a dear and
bail me out before I'm downsized into soup!"

### `T1`: the first relic freed
*The first time any relic run is solved.*

> **To:** Logistics · **Re:** Who Moved a Relic?
>
> Logistics: a relic has left its assigned room. Unacceptable. Those relics
> are the *locks*. Each mascot's cage holds five padlocks, one for each of its
> holiday's relics, and every relic that gets home opens one, plus that
> holiday's doors. Five home and the cage opens. Find the relic. Put it back
> where it doesn't belong.
>
> *S. Claus, CEO*

### `T3`: the first relic placed on its home shelf
*The first relic placed on its home shelf under a caged mascot (unlocking its room and popping the first padlock on the cage).*

**Leap Day:** "One relic back on its shelf, and one padlock off the cage. Four
more to free them."

## Act 2: the open house

The six rooms, in the order the house usually opens. Each room has a memo
(found when you beat its intro run) with its caged mascot's plea stuck to it,
and two bonus lines. Freeing a mascot plays no dialogue: it just hops off to
the Freed Mascots' Corner.

### Fourth of July

**Room sign:** **Christmas in July Yard · an XMAS365™ Subsidiary**

#### `fourth.enter`
> **To:** Christmas in July (fka Fourth of July) · **Re:** Q3 Sparkle Alignment
>
> Welcome to **Christmas in July**, our newest Q3 deliverable! High-decibel
> fireworks are sunsetted in favour of indoor tinsel-bursts. Grills will
> convert 100% to chestnut-roasting, and the Eaglet is grounded for
> unauthorized Yankee Doodle-ing on company time. Keep the noise floor
> festive!
>
> *S. Claus, CEO*

#### `fourth.caged`
**The Eaglet:** "Give me liberty or give me a snack! / Mister? Ma'am? ...Frog?"

#### `fourth.bonus`
- **Offer:** "Wanna launch the BIG-budget rockets? The really, really hard
  ones?"
- **Reward:** "KA-BOOM! Talk about a bang-up job! Saving this party hat for
  your bash!"

### Christmas

**Room sign:** **Christmas+™ Hearth · 365/24/7 Crunch Mode**

#### `christmas.enter`
> **To:** Christmas+™ (fka Christmas) · **Re:** Yes, Christmas Too
>
> Several of you have asked why we acquired Christmas when it's already ours.
> It isn't. Christmas belongs to the Snowman, the elves and one cosy day in
> December. XMAS365™ owns the *brand*. As of today, Christmas is
> **Christmas+™**, running 365/24/7. The Snowman, who keeps insisting "one day
> is the whole point," is in cold storage for brand misalignment.
>
> *S. Claus, CEO*

#### `christmas.caged`
**The Snowman:** "One day a year was *cool*. Three hundred and sixty-five is a
meltdown. / Could you get me out of here?"

#### `christmas.bonus`
- **Offer:** "A few strings of lights are still tangled, if you have the
  bandwidth."
- **Reward:** "The whole tree, lit. I'll tip my party hat to that."

### Thanksgiving

*Its entry beats are in Act 1.*

#### `thanksgiving.bonus`
- **Offer:** "Care to circle back for seconds? I've some high-*steaks*
  carving on the table."
- **Reward:** "Upper-crust execution! I shall wear a party hat *atop* my
  buckle hat. Double-hatted!"

### Easter

**Room sign:** **Eggnog Garden · an XMAS365™ Subsidiary**

#### `easter.enter`
> **To:** Eggnog Day (fka Easter) · **Re:** Egg-cellent Q2
> Synergies!
>
> Our audit found ten thousand eggs hidden in bushes with zero visibility.
> Terrible ROI! Effective immediately, all eggs are liquidated into eggnog, chocolate is consolidated into stocking-stuffers, and the Bunny
> is detained for insubordinate hopping and refusing to onboard as a
> temp reindeer.
>
> *S. Claus, CEO*

#### `easter.caged`
**The Bunny:** "Hi-hello-quick-sync! They clipped *antlers* to my ears! / I'm
*hopping* mad! Let's bounce!"

#### `easter.bonus`
- **Offer:** "Ooh, want some stretch-goal hops? High-impact, super bouncy!"
- **Reward:** "Nailed the landing! Party hat goes on the left ear. Or the
  right ear. Both ears!"

### Valentine's

**Room sign:** **Mistletoe Parlor · an XMAS365™ Subsidiary**

#### `valentines.enter`
> **To:** Mistletoe Day (fka Valentine's Day) · **Re:** Scaling Romance
>
> Handwritten love notes are a bottleneck. One sender, one recipient, abysmal
> conversion! We're replacing romance with automated bulk-mail blasts
> ("Warm Regards from XMAS365™"). Roses are now holly-berry red, and the
> Teddy Bear is impounded. One-on-one hugs don't scale across Q1.
>
> *S. Claus, CEO*

#### `valentines.caged`
**The Teddy Bear:** "This hostile takeover is *un-bear-able*! / The mailbox is
full of junk mail. Help me put the heart back in here?"

#### `valentines.bonus`
- **Offer:** "I still have a few VIP love letters stuck in the mailroom. Lend
  a paw?"
- **Reward:** "Signed, sealed, and hand-delivered! I'll wear this party hat
  with all my heart."

### Halloween

**Room sign:** **Ugly Sweater Porch · an XMAS365™ Subsidiary**

#### `halloween.enter`
> **To:** Ugly Sweater Night (fka Halloween) · **Re:** Brand Alignment:
> Spooky Season
>
> Per Dress Code Policy 12.25, all ghoul and witch attire is sunsetted in
> favour of ugly Christmas sweaters. Trick-or-treaters will receive a Q4 gift
> catalogue, jack-o'-lanterns are now jolly-o'-lanterns, and the Spider is
> quarantined for spinning non-compliant, "creepy" web architecture.
>
> *S. Claus, CEO*

#### `halloween.caged`
**The Spider:** "Quarantined for *web design*? The sheer lack of taste! / Do
pull some strings and let me out, darling."

#### `halloween.bonus`
- **Offer:** "Care to test my high-complexity webs, darling? Very
  cutting-edge."
- **Reward:** "A party hat right on the tip of my witch hat. Very chic,
  darling."

### Escalation (every 5 relics returned)

Each memo is pinned to the hall corkboard, and opens itself, the next time
you're in the hall (`E1` at 5 relics returned, `E2` at 10, `E3` at 15, `E4` at
20, `E5` at 25, `E6` at 30 when all six mascots are free).

#### `E1`: 5 relics returned
> **To:** Change-Management Taskforce · **Re:** Unauthorized Relic Restocking
>
> Who is putting confiscated holiday relics back on their home shelves?! Five
> padlocks have already clicked open across the campus, and someone keeps
> opening locked subsidiary doors without a ticket. Circle back and lock down
> those shelves before EOD!
>
> *S. Claus, CEO*

#### `E2`: 10 relics returned
> **To:** Elf Human Resources · **Re:** PTO Request & Padlock Audit
>
> Regarding your union petition for "one Silent Night a year": hard pass!
> Hustle is the reason for the season. Worse, ten relics are back on their
> shelves and cage padlocks are dropping like flies. Also, Accounting's master
> spreadsheet is showing **366** billable days instead of 365. Fix it!
>
> *S. Claus, CEO*

#### `E3`: 15 relics returned
> **To:** Forensic Accounting · **Re:** HALF THE RELICS & DAY 366
>
> Fifteen of our thirty cross-siloed relics have been returned to their home
> shelves! That's half our leverage! And why does every pivot table still spit
> out **366** days?! Stop muttering about "February's quadrennial edge-case"
> and find whoever is smuggling relics through Holiday Hall!
>
> *S. Claus, CEO*

#### `E4`: 20 relics returned
> **To:** All Staff · **Re:** CODE RED-NOSED: Twenty Relics Back!
>
> All hands on deck! Twenty relics are back on their shelves, padlocks are
> popping all over campus, and our stock is sleigh-ding! Find the saboteur
> running between the doors! Someone stuck a Post-it on my monitor saying
> *"Check Feb 29"* and I had Security shred it. Reindeer: your "sky-high
> burnout" ticket is closed!
>
> *S. Claus, CEO*

#### `E5`: 25 relics returned
> **To:** General Counsel · **Re:** URGENT: Five Relics Left—Lock It Down
>
> Twenty-five relics returned! TWENTY-FIVE! Only five padlocks stand between us
> and total brand rollback! Draft the ironclad Master Merger Agreement
> immediately: every holiday, 365 days, locked in perpetuity with zero opt-out
> clauses! Once I take the podium in Holiday Hall, our monopoly is legally
> bulletproof!
>
> *S. Claus, CEO*

#### `E6`: all 30 relics returned (all six mascots free)
*All six lamps lit. CEO Santa takes center stage at his podium in Holiday Hall holding the Master Merger Contract.*

> **To:** All Staff · **Re:** Mandatory Signing Mixer @ Hall
>
> All thirty relics returned and all six mascots loose in the hall?! Fine—if
> you want a hostile takeover done right, do it yourself! I have taken the
> podium in Holiday Hall personally with the binding Master Merger Contract and
> my platinum fountain pen. Once I initial all six clauses, every holiday snaps
> back under XMAS365™ ownership forever!
>
> *S. Claus, CEO*

## Act 3: the merger contract

### `C0`: confronting CEO Santa & the cover page
*Tapping CEO Santa at his podium in Holiday Hall opens the contract checklist. A sign, as a document.*

> **MASTER MERGER & SUBSUMPTION AGREEMENT**
> between **XMAS365™ Inc.** ("The Big Guy") and **All Other Holidays**
> ("Sub-Brands").
> **Term:** All 365 calendar days of the Fiscal Year, in perpetuity.
> **Executive Signature:** ____________

**Santa** *(standing center-stage, waving a platinum fountain pen)*: "Aha!
Caught you red-handed, you rogue intern! Who on earth are *you*?!"

**Leap Day:** "Leap Day. February 29th. And before you sign that Master Merger
Contract, I'm auditing every clause."

**Santa** *(shoving the golden clipboard forward)*: "February twenty-*what*?!
Audit away, frog—six ironclad clauses, zero loopholes!"

### `C1`..`C6`: the clauses
*Each clause is a 22-puzzle gauntlet (`6 Twist Reminders + 15 Double Twists + 1 All 6 Twists` = 132 puzzles across the 6 clauses) of its puzzle Base. Voiding a clause triggers its `C1.torn`..`C5.torn` (or `C6.early`) exchange with Santa right across the podium.*

| ID | Panel | Clause |
|---|---|---|
| `C1` | Webs | **Clause 1: Halloween Vertical.** Oct 31st is hereby acquired. All cobwebs are to be replaced with tinsel. |
| `C2` | Carving | **Clause 2: Thanksgiving Vertical.** The fourth Thursday of Nov is sunsetted. All gratitude requires a gift receipt. |
| `C3` | Lights | **Clause 3: Core Flagship.** Dec 25th is copy-pasted across all 365 fiscal days. Overtime is non-negotiable. |
| `C4` | Words | **Clause 4: Valentine's Vertical.** Feb 14th is merged into CRM. Romance is replaced with quarterly e-newsletters. |
| `C5` | Hops | **Clause 5: Easter Vertical.** Spring is restructured into Q2 Pre-Order Season. All bunnies report to Sleigh Ops. |
| `C6` | Pictures | **Clause 6: July 4th & Definitions.** July 4th is Christmas in July. *Sec 6.2: "Fiscal Year" is strictly defined as 365 days.* |

- **`C1.torn`:**
  - **Leap Day:** "Clause 1: Halloween Vertical — red-lined and voided! Keep your tinsel off the cobwebs."
  - **Santa** *(clutching his clipboard)*: "Hey! Do not initial my margins in red ink! That Halloween vertical was Q4 accretive!"
- **`C2.torn`:**
  - **Leap Day:** "Clause 2: Thanksgiving Vertical — carved right out of the merger. Gratitude needs no gift receipt."
  - **Santa** *(sputtering into his beard)*: "My November runway! Give me back that red pen this instant!"
- **`C3.torn`:**
  - **Leap Day:** "Clause 3: Core Flagship — rewired! December 25th stays on December 25th."
  - **Santa** *(tugging at his green tie)*: "You unplugged my 365-day rollout! Do you have any idea what sleigh overtime costs?!"
- **`C4.torn`:**
  - **Leap Day:** "Clause 4: Valentine's Vertical — un-merged from CRM. Love letters aren't drip campaigns."
  - **Santa** *(checking his falling stock ticker)*: "Our Q1 engagement metrics! Shredded! Have you no respect for corporate synergy?!"
- **`C5.torn`:**
  - **Leap Day:** "Clause 5: Easter Vertical — hopped right off the balance sheet. Bunnies report to no sleigh."
  - **Santa** *(shielding the remaining pages)*: "That was our entire spring pre-order pipeline! Stop tearing the parchment!"
- **`C6.early`** *(if Clause 6 is voided before all 6 clauses are complete)*:
  - **Leap Day:** "Clause 6: July 4th & Definitions — red-lined. Wait... 'Fiscal Year is strictly defined as 365 days'? Hold that thought."
  - **Santa** *(trying to cover Sec 6.2 with his thumb)*: "Stop reading Sec 6.2! Nobody is supposed to read the fine print!"

### `C6.torn`: the loophole
*All six clauses voided right at Santa's podium in Holiday Hall.*

**Leap Day:** "All six clauses voided. And look at Sec 6.2: 'Fiscal Year is
strictly defined as 365 days.' Hate to break it to you, Nick—it's a Leap Year."

**Santa** *(staring at the shredded contract on his podium, dropping his platinum pen)*:
"366 days?! Wait—the frog in the glasses—you're February 29th!"

**Leap Day:** "The quadrennial edge-case you deleted from the spreadsheet. Your
entire merger is null and void."

**Santa** *(adjusts his green tie, checks his pocket diary)*: "February 29th...
Oh, tinsel. You're real. And my monopoly is cooked."

## Act 4: Leap Day's party

### `Y1`: surprise
*The party opens in the hall. One line per mascot, each one getting the
date right at last.*

- **The Spider:** "Surprise, darling! **February 29th**, spun in silk right
  across the banner! No bugs in *this* rollout."
- **The Turkey:** "Hear, hear for **Leap Day**! Not the 28th! I'll eat my
  buckle hat if I ever forget again."
- **The Eaglet:** "HAPPY **LEAP DAY**! Not March 1st! Give this frog a
  twenty-one-firework salute!"
- **The Snowman:** "To **Leap Day**, not Tuesday! Coolest day on the whole
  calendar, hands down."
- **The Bunny:** "**Leap Day! Leap Day!** Finally a holiday with *LEAP* right
  in the name!"
- **The Teddy Bear:** "Happy **February 29th**! Not Groundhog Day. We threw
  this whole party just for you!"

### `Y2`: Santa at the banquet table, and the vote

**Santa** *(in his rumpled suit, swapping his clipboard for birthday candles)*:
"I... liquidated my calendar monopoly. Brought candles instead. / Room for one
more stakeholder?"

**The Spider:** "Shall we take a board vote on letting Nick keep a *modest*
market share?"

**The Eaglet:** "Give him TWELVE DAYS! There's already a song about it and
everything!"

**Santa:** "**Xmas12**... You know, the overhead is *much* more manageable."

### `Y3.1`..`Y3.6`: the cake relay
*Each before its stage of the board.*

| ID | Stage | Line |
|---|---|---|
| `Y3.1` | Picture: the cake | **The Eaglet:** "Stage one: bake the cake! Make it pop like a grand finale!" |
| `Y3.2` | Words: on the cake | **The Teddy Bear:** "Now pipe the frosting and spell out something sweet from the heart!" |
| `Y3.3` | Carving: the slices | **The Turkey:** "Time to carve fair shares! Mind the lettering, nobody wants a half-baked word." |
| `Y3.4` | Hops: eating it | **The Bunny:** "My turn! Hop slice to slice in order. Taste-testing is mission-critical!" |
| `Y3.5` | Lights: the candles | **The Snowman:** "Wire up the birthday candles from where the Bunny stopped. Let's make it glow!" |
| `Y3.6` | Webs: the bunting | **The Spider:** "And the finishing touch, darling: spin festive bunting between every candle!" |

### `Y4`: the crowning
*The cake relay solved.*

**The mascots** *(together)*: "By unanimous vote of every holiday: Leap Day is
now **Day 366 (Every Year)**! / Pencilled onto every calendar, with no
four-year wait!"

### `Y5`: Leap Day's last line

**Leap Day:** "An annual party? Careful, you'll ruin my mysterious low profile."

### `Y6`: credits
*Credits roll over the party.*

### `Y7`: after the credits
*Back in the hall. One last memo is on the corkboard, the only one ever
addressed to you. Every beaten rung on a room's ladder can be replayed or
played in endless Free Play (`5×5`, `7×7`, `9×9`).*

> **XMAS12 · POST-MERGER MEMO**
> **To:** All Holidays (and Day 366) · **From:** S. Claus, Founder · **Re:**
> Right-Sizing to Xmas12
>
> Effective today, XMAS365™ has pivoted to **Xmas12**: twelve cosy days starting
> Dec 25th, and 353 days of well-earned PTO for the elves, the reindeer, and
> me. Plus one permanent VIP slot pencilled into every diary on earth:
> **February 29th**. Happy Leap Day. See you every year!
>
> *S. Claus, Recovering CEO*

## Freed Mascots' Corner (`HALL_MASCOT_LINES`)

*As each mascot's fifth relic opens its cage, the mascot moves to the Freed
Mascots' Corner in Holiday Hall. Tapping a freed mascot in the hall plays a
short line:*

- **The Spider (`halloween`):** "Waiting in the hall until all six of us are free, darling—keep un-padlocking those cages!"
- **The Turkey (`thanksgiving`):** "Much obliged for the rescue! Fetch the rest of the flock so we can audit Santa right out of the hall."
- **The Snowman (`christmas`):** "Chilling in the corner until the whole crew is uncaged—even Christmas wants our old holidays back."
- **The Teddy Bear (`valentines`):** "Sending moral hugs from the hall! Bring the rest of the relics home and free everyone!"
- **The Bunny (`easter`):** "Antlers off, paws warmed up—free the rest of the mascots and we'll crash Santa's merger!"
- **The Eaglet (`fourth`):** "Standing by for the big finale! Unlock the remaining cages and let freedom ring!"

## Later (Phase 7: the lighter layer)

- `<room>.hint.<relic>`: hint lines on empty relic shelves ("the Golden
  Egg has been filed somewhere sweet"). 30 slots, to write then.
- Gags: clickable reactions round the Santa branding in each room.
