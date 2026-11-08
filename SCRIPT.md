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
  (found when you beat the warm-up). Leap Day's own sticky note is only on
  the opening memo (`P2`); the other memos carry no Leap Day reaction.
- **Freeing a stray is silent.** Each room has one memo, found when
  you beat its warm-up. Peeling
  the branding back is visual only.
- **The running gag:** every freed mascot thanks you, then gets your name or
  date wrong, each one differently. At the party they've all got it right.
- **Christmas is a victim too.** Santa turns down complaints we never see
  (the elves' unionization drive, the reindeer's burnout), and the freed
  Snowman says it outright.
- **Santa thinks the extra day is a bookkeeping error** and orders audits.
  He never imagines it's *someone* until he meets you.
- **Santa appears once, at the loophole**, bursting in too late. Then he's a
  humbled guest at the party, where the mascots vote to let him keep his
  twelve days of Christmas: **XMAS365™ becomes Xmas12**.
- **The contract has one holiday per clause**, each on that holiday's genre
  panel. The last clause defines "Year" as 365 days, which is the loophole.
- **The Feast keeps its roast**, and the freed Turkey insists it's a
  tofurkey.
- **In the cake relay, each mascot hands over its stage with one line.**

## Format

| Voice | Form | Length |
|---|---|---|
| **Memo** | XMAS365™ internal memo: To / From / Re / body, signed by Santa. Shown once, then pinned to the hall corkboard. | ≤ 65 words |
| **Leap Day** | One dry line, usually a reaction to the memo just read. | ≤ 14 words |
| **Mascot** | A caged plea, a thank-you, or a party line. A `/` starts a new line on screen. | ≤ 2 short lines |
| **Santa** | Spoken, in person: only at the loophole and the party. | ≤ 2 short lines |
| **Sign** | Signage, a tag or a contract clause. | a few words |

**Rules:**
- **Memos are never written to the player.** The one exception is the last
  memo, after the credits (`Y7`).
- **Panels stay clean.** Beats play when a run ends or when you walk into a
  room, never in front of a puzzle.
- **Every beat plays once.** A beat that falls due while another is showing
  waits its turn.
- **Order:** only Thanksgiving's opening is fixed. Room beats make sense in
  any order. Escalation is counted by how many mascots are free (`E1`..`E6`);
  `{holiday}` is the room that has just reverted.

```
Thanksgiving ─┬─ Hot Dog  ──▶ Fourth of July ─┬─ Cupid's Bow   ──▶ Valentine's
(open)        │                               └─ Witch's Broom ──▶ Halloween
              └─ Stocking ──▶ Christmas ──────┬─ Golden Egg   ──▶ Easter
                                              └─ Pumpkin Pie  ──▶ (Thanksgiving)
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

### `P2`: Leap Day
*P1 closed.*

> **Leap Day:** "All 365 days. Funny how I never make the spreadsheet."

### `P3`: the hall
*Signage (no prompt). Thanksgiving's door stands ajar.*

- Over the hall: **HOLIDAY HALL · An XMAS365™ Synergized Campus**
- Over each room: **{Rebranded name} · an XMAS365™ Subsidiary** (names below)

## Act 1: Thanksgiving, the guided opening

### `thanksgiving.enter`
*Its warm-up beaten.* Room sign: **Pre-Christmas Table · an XMAS365™ Subsidiary**

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

### `T1`: the first stray freed
*The first time any stray is freed: the Hot Dog or the Stocking.*

> **To:** Logistics · **Re:** Cross-Silo Asset Scrambling
>
> Great work on the asset shuffle! With every holiday's key gear locked in
> the wrong department, the old celebrations can't even open for business.
> Reminder: returning an item to its home room automatically unlocks the
> door. So nothing goes home. Not one sock.
>
> *S. Claus, CEO*

### `T2`: carrying an item
*The first time you're in the hall with an item.* Item tag (sign):
**Misfiled Asset · Return to: {holiday}**. Its home room's door glows.

### `T3`: the first item home
*The first item restored (its room unlocks).*

**Leap Day:** "One returned asset, one unlocked vertical. Time to hop to it."

## Act 2: the open house

The six rooms, in the order the house usually opens. Each room has a memo
(found when you beat its warm-up) with its caged mascot's plea stuck to it, a
thank-you when its mascot is freed, and two bonus lines.

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

#### `fourth.freed`
**The Eaglet:** "FREEDOM RINGS! And chirps! Thanks, uh... March 1st! / Close
enough for government work, right?"

#### `fourth.bonus`
- **Offer:** "Wanna launch the BIG-budget rockets? The really, really hard
  ones?"
- **Reward:** "KA-BOOM! Talk about a bang-up job! Saving this party hat for
  your bash!"

### Christmas

**Room sign:** **Christmas+™ Hearth · 365/24/7 Crunch Mode**

#### `christmas.enter`
> **To:** Christmas+™ (fka Christmas) · **Re:** 365/24/7 Crunch Mode!
>
> Welcome to year-round peak season! To maximize elf-fficiency, sleep has
> been deprecated and the tree restructured into a vertical org chart (note
> my new corner office at the Star). The Snowman is in cold storage for
> raising "work-life melt" concerns. Per my mandatory poll, morale is at
> 110%!
>
> *S. Claus, CEO*

#### `christmas.caged`
**The Snowman:** "One day a year was *cool*. Three hundred and sixty-five is a
meltdown. / Could you get me out of here?"

#### `christmas.freed`
**The Snowman:** "Thank you... Tuesday, was it? / Even Christmas was sick of
Christmas. The elves are clocking out."

#### `christmas.bonus`
- **Offer:** "A few strings of lights are still tangled, if you have the
  bandwidth."
- **Reward:** "The whole tree, lit. I'll tip my party hat to that."

### Thanksgiving

*Its entry beats are in Act 1.*

#### `thanksgiving.freed`
**The Turkey:** "Uncaged at last! Much obliged, Feb... 28th, is it? / And for
the record, that platter is 100% *tofurkey*."

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

#### `easter.freed`
**The Bunny:** "Thanksthanksthanks, Leap Year! Leap Week? Leapfrog! / Gotta
dash, antlers off, bye!"

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

#### `valentines.freed`
**The Teddy Bear:** "Oh, thank you, sweet... Groundhog Day? / Take a free,
100% non-scalable hug on me!"

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

#### `halloween.freed`
**The Spider:** "*Fang-tastic* work, darling... February 30th? / Well,
whatever date you are, you're a total catch."

#### `halloween.bonus`
- **Offer:** "Care to test my high-complexity webs, darling? Very
  cutting-edge."
- **Reward:** "A party hat right on the tip of my witch hat. Very chic,
  darling."

### Escalation (by how many mascots are free)

Each memo is pinned to the hall corkboard, and opens itself, the next time
you're in the hall.

#### `E1`: one mascot free
> **To:** Change-Management Taskforce · **Re:** Unauthorized De-Synergizing
> ({holiday})
>
> It has come to my attention that {holiday} has staged an unscheduled
> brand rollback! The mascot is loose, the old lamp is back on, and someone
> pulled down our banner without a ticket. Circle back and re-acquire that
> vertical before EOD! Probably a rogue intern.
>
> *S. Claus, CEO*

#### `E2`: two mascots free
> **To:** Elf Human Resources · **Re:** PTO Request & Spreadsheet Glitch
>
> Regarding your union petition for "one Silent Night a year": hard pass!
> Hustle is the reason for the season. Also, Accounting's master spreadsheet
> has a bug. It's showing **366** billable days instead of 365. Delete the
> phantom row! P.S. A second holiday just churned. Fix it!
>
> *S. Claus, CEO*

#### `E3`: three mascots free
> **To:** Forensic Accounting · **Re:** THE 366TH DAY ANOMALY
>
> I've checked the master deck three times. Our entire valuation is built on
> **XMAS365™**, yet every pivot table spits out 366! Stop muttering about
> "February's quadrennial edge-case" and delete the extra cell! Worse, we're
> down three subsidiaries. That's half the portfolio!
>
> *S. Claus, CEO*

#### `E4`: four mascots free
> **To:** All Staff · **Re:** CODE RED-NOSED: Locate Day 366!
>
> All hands on deck! Four verticals have de-merged and our stock is
> sleigh-ding! Tear up the floorboards and find where this rogue 366th day is
> hiding! Someone stuck a Post-it on my monitor saying *"Leap Year?"* and I had
> Security shred it. Reindeer: your "sky-high burnout" ticket is closed!
>
> *S. Claus, CEO*

#### `E5`: five mascots free
> **To:** General Counsel · **Re:** URGENT: Lock It Down
>
> Five holidays have churned! FIVE! Draft the ironclad Master Merger
> Agreement immediately: every holiday, 365 days, locked in perpetuity with
> zero opt-out clauses! Once I sign that contract in Holiday Hall, our
> monopoly is legally bulletproof. Skip the boilerplate, nobody reads the
> fine print!
>
> *S. Claus, CEO*

#### `E6`: all six mascots free
*All six lamps lit. CEO Santa takes center stage in Holiday Hall holding the Master Merger Contract.*

> **To:** All Staff · **Re:** Mandatory Signing Mixer @ Hall
>
> All six verticals have churned?! Fine—if you want a hostile takeover done
> right, do it yourself! I am standing in Holiday Hall right now with the
> binding Master Merger Contract on my clipboard and my platinum fountain pen
> in hand. Once I initial all six clauses, every holiday snaps back under
> XMAS365™ ownership forever!
>
> *S. Claus, CEO*

## Act 3: the merger contract

### `C0`: confronting CEO Santa & the cover page
*Tapping CEO Santa in Holiday Hall opens the contract checklist. A sign, as a document.*

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
*Each clause is a 29-panel gauntlet of its puzzle genre. Voiding a clause triggers its `C1.torn`..`C5.torn` (or `C6.early`) exchange with Santa right across the podium.*

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
*All six clauses voided.*

**Leap Day:** "All six clauses voided. And look at Sec 6.2: 'Fiscal Year is
strictly defined as 365 days.' Hate to break it to you, Nick—it's a Leap Year."

**Santa** *(staring at the shredded contract, dropping his platinum pen)*:
"Wait. Strictly 365?! Did Legal forget to budget for a 366th day?!"

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
*Back in the hall. The Calendar Desk is open in full, with its sign reading
**Day 366 · open every day**. One last memo is on the corkboard, the only
one ever addressed to you.*

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

## The Calendar Desk

### `D.<room>`: a holiday reclaimed (optional)
*Shown on the desk's calendar when a room's warm-up is beaten and its genre
reclaimed.*

**Sign:** "{Holiday}: de-merged & back on the calendar!"

## Later (Phase 7: the lighter layer)

- `<room>.hint.<item>`: hint memos for strays that start hidden ("the Golden
  Egg has been filed somewhere sweet"). 12 slots, to write then.
- Gags: clickable reactions round the Santa branding in each room.
