/**
 * Single source of truth for the game's narrative script, corporate memos,
 * character voices, room signage, and contract clauses (`SCRIPT.md`).
 *
 * Designed to be purely declarative so tweaking lines, adding beats, or
 * adjusting speaker styling never requires touching UI or state logic.
 */

export type RoomScriptId =
  'halloween' | 'thanksgiving' | 'christmas' | 'valentines' | 'easter' | 'fourth';

export type SpeakerId =
  'santa' | 'leapday' | 'spider' | 'turkey' | 'snowman' | 'bear' | 'bunny' | 'eaglet' | 'mascots';

export interface SpeakerMeta {
  id: SpeakerId;
  name: string;
  badge: string;
  icon: string;
  bg: string;
  border: string;
  textColor: string;
}

export const SPEAKERS: Record<SpeakerId, SpeakerMeta> = {
  leapday: {
    id: 'leapday',
    name: 'Leap Day',
    badge: '🐸 LEAP DAY · FEB 29',
    icon: '🐸',
    bg: '#f0fff4',
    border: '#2f855a',
    textColor: '#1c4532',
  },
  santa: {
    id: 'santa',
    name: 'Santa Claus',
    badge: '🎅 S. CLAUS · CEO, XMAS365™',
    icon: '🎅',
    bg: '#fff5f5',
    border: '#c53030',
    textColor: '#742a2a',
  },
  turkey: {
    id: 'turkey',
    name: 'The Turkey',
    badge: '🦃 THE TURKEY · THANKSGIVING',
    icon: '🦃',
    bg: '#fffaf0',
    border: '#c05621',
    textColor: '#7b341e',
  },
  eaglet: {
    id: 'eaglet',
    name: 'The Eaglet',
    badge: '🦅 THE EAGLET · JULY 4TH',
    icon: '🦅',
    bg: '#ebf8ff',
    border: '#2b6cb0',
    textColor: '#1a365d',
  },
  snowman: {
    id: 'snowman',
    name: 'The Snowman',
    badge: '⛄ THE SNOWMAN · CHRISTMAS',
    icon: '⛄',
    bg: '#f0fff4',
    border: '#2f855a',
    textColor: '#22543d',
  },
  bunny: {
    id: 'bunny',
    name: 'The Bunny',
    badge: '🐰 THE BUNNY · EASTER',
    icon: '🐰',
    bg: '#fefcbf',
    border: '#d69e2e',
    textColor: '#744210',
  },
  bear: {
    id: 'bear',
    name: 'The Teddy Bear',
    badge: "🧸 THE TEDDY BEAR · VALENTINE'S",
    icon: '🧸',
    bg: '#fff5f7',
    border: '#d53f8c',
    textColor: '#702459',
  },
  spider: {
    id: 'spider',
    name: 'The Spider',
    badge: '🕷️ THE SPIDER · HALLOWEEN',
    icon: '🕷️',
    bg: '#faf5ff',
    border: '#805ad5',
    textColor: '#44337a',
  },
  mascots: {
    id: 'mascots',
    name: 'All Six Mascots',
    badge: '🎉 ALL SIX HOLIDAY MASCOTS',
    icon: '🎉',
    bg: '#fefcbf',
    border: '#d69e2e',
    textColor: '#744210',
  },
};

export interface DialogueLine {
  speaker: SpeakerId;
  /** Stage direction shown in italics next to the speaker name, if any. */
  stage?: string;
  /** Spoken text. Follows `SCRIPT.md`: a ` / ` starts a new line on screen. */
  text: string;
}

export type MemoId =
  | 'P1'
  | 'thanksgiving.enter'
  | 'T1'
  | 'fourth.enter'
  | 'christmas.enter'
  | 'easter.enter'
  | 'valentines.enter'
  | 'halloween.enter'
  | 'E1'
  | 'E2'
  | 'E3'
  | 'E4'
  | 'E5'
  | 'E6'
  | 'Y7';

export interface MemoSpec {
  id: MemoId;
  header: string;
  to: string;
  from: string;
  re: string;
  body: string;
  signoff: string;
}

/** Canonical display order of memos on the Hall Corkboard when multiple are pinned. */
export const MEMO_ORDER: readonly MemoId[] = [
  'P1',
  'thanksgiving.enter',
  'T1',
  'fourth.enter',
  'christmas.enter',
  'easter.enter',
  'valentines.enter',
  'halloween.enter',
  'E1',
  'E2',
  'E3',
  'E4',
  'E5',
  'E6',
  'Y7',
] as const;

export const MEMOS: Record<MemoId, MemoSpec> = {
  P1: {
    id: 'P1',
    header: 'XMAS365™ · ALL-HANDS MEMO',
    to: 'All Verticals',
    from: 'S. Claus, CEO',
    re: 'Maximizing Sleigh-Holder Value!',
    body: "Thrilled to announce XMAS365™ has finalized our hostile takeover of every holiday on the calendar! Going forward, all seasonal verticals will synergize under one North Star KPI: **Christmas, 365 days a year.** Legacy mascots have been right-sized into cages, and core assets cross-siloed. Let's wrap up Q1 through Q4!",
    signoff: 'S. Claus, CEO ("Always Be Clausing")',
  },
  'thanksgiving.enter': {
    id: 'thanksgiving.enter',
    header: 'XMAS365™ · SUBSIDIARY DIRECTIVE',
    to: 'Pre-Christmas Dinner (fka Thanksgiving)',
    from: 'S. Claus, CEO',
    re: 'Gobbling Up Market Share',
    body: 'Per our Q4 roadmap, Thanksgiving is now **Pre-Christmas Dinner**. We\'re pivoting from "gratitude" to high-margin gift-wrapping. The Turkey is on involuntary garden leave: do not baste, consult, or uncage. All gravy is frozen pending a liquidity review, and leftovers are rebranded as "Boxing Day Beta".',
    signoff: 'S. Claus, CEO',
  },
  T1: {
    id: 'T1',
    header: 'XMAS365™ · LOGISTICS BRIEFING',
    to: 'Logistics',
    from: 'S. Claus, CEO',
    re: 'Cross-Silo Relic Scrambling',
    body: "Great work on the 30-relic shuffle! With five prized relics per holiday locked away—one in each of the other five departments—their mascots aren't going anywhere. Every cage has five padlocks wired to the five relic shelves underneath it, and returning a relic to a locked department automatically unlocks the door. So nothing goes home. Not one sock.",
    signoff: 'S. Claus, CEO',
  },
  'fourth.enter': {
    id: 'fourth.enter',
    header: 'XMAS365™ · SUBSIDIARY DIRECTIVE',
    to: 'Christmas in July (fka Fourth of July)',
    from: 'S. Claus, CEO',
    re: 'Q3 Sparkle Alignment',
    body: 'Welcome to **Christmas in July**, our newest Q3 deliverable! High-decibel fireworks are sunsetted in favour of indoor tinsel-bursts. Grills will convert 100% to chestnut-roasting, and the Eaglet is grounded for unauthorized Yankee Doodle-ing on company time. Keep the noise floor festive!',
    signoff: 'S. Claus, CEO',
  },
  'christmas.enter': {
    id: 'christmas.enter',
    header: 'XMAS365™ · GLOBAL HQ MEMO',
    to: 'Christmas+™ (fka Christmas)',
    from: 'S. Claus, CEO',
    re: '365/24/7 Crunch Mode!',
    body: 'Welcome to year-round peak season! To maximize elf-fficiency, sleep has been deprecated and the tree restructured into a vertical org chart (note my new corner office at the Star). The Snowman is in cold storage for raising "work-life melt" concerns. Per my mandatory poll, morale is at 110%!',
    signoff: 'S. Claus, CEO',
  },
  'easter.enter': {
    id: 'easter.enter',
    header: 'XMAS365™ · SUBSIDIARY DIRECTIVE',
    to: 'Eggnog Day (fka Easter)',
    from: 'S. Claus, CEO',
    re: 'Egg-cellent Q2 Synergies!',
    body: 'Our audit found ten thousand eggs hidden in bushes with zero visibility. Terrible ROI! Effective immediately, all eggs are liquidated into eggnog, chocolate is consolidated into stocking-stuffers, and the Bunny is detained for insubordinate hopping and refusing to onboard as a temp reindeer.',
    signoff: 'S. Claus, CEO',
  },
  'valentines.enter': {
    id: 'valentines.enter',
    header: 'XMAS365™ · SUBSIDIARY DIRECTIVE',
    to: "Mistletoe Day (fka Valentine's Day)",
    from: 'S. Claus, CEO',
    re: 'Scaling Romance',
    body: 'Handwritten love notes are a bottleneck. One sender, one recipient, abysmal conversion! We\'re replacing romance with automated bulk-mail blasts ("Warm Regards from XMAS365™"). Roses are now holly-berry red, and the Teddy Bear is impounded. One-on-one hugs don\'t scale across Q1.',
    signoff: 'S. Claus, CEO',
  },
  'halloween.enter': {
    id: 'halloween.enter',
    header: 'XMAS365™ · SUBSIDIARY DIRECTIVE',
    to: 'Ugly Sweater Night (fka Halloween)',
    from: 'S. Claus, CEO',
    re: 'Brand Alignment: Spooky Season',
    body: 'Per Dress Code Policy 12.25, all ghoul and witch attire is sunsetted in favour of ugly Christmas sweaters. Trick-or-treaters will receive a Q4 gift catalogue, jack-o\'-lanterns are now jolly-o\'-lanterns, and the Spider is quarantined for spinning non-compliant, "creepy" web architecture.',
    signoff: 'S. Claus, CEO',
  },
  E1: {
    id: 'E1',
    header: 'XMAS365™ · INCIDENT TICKET #1',
    to: 'Change-Management Taskforce',
    from: 'S. Claus, CEO',
    re: 'Unauthorized Relic Restocking',
    body: 'Who is putting confiscated holiday relics back on their home shelves?! Five padlocks have already clicked open across the campus, and someone keeps opening locked subsidiary doors without a ticket. Circle back and lock down those shelves before EOD! Probably a rogue intern.',
    signoff: 'S. Claus, CEO',
  },
  E2: {
    id: 'E2',
    header: 'XMAS365™ · HR & ACCOUNTING MEMO',
    to: 'Elf Human Resources',
    from: 'S. Claus, CEO',
    re: 'PTO Request & Padlock Audit',
    body: 'Regarding your union petition for "one Silent Night a year": hard pass! Hustle is the reason for the season. Worse, ten relics are back on their shelves and cage padlocks are dropping like flies. Also, Accounting\'s master spreadsheet is showing **366** billable days instead of 365. Fix it!',
    signoff: 'S. Claus, CEO',
  },
  E3: {
    id: 'E3',
    header: 'XMAS365™ · EXECUTIVE AUDIT',
    to: 'Forensic Accounting',
    from: 'S. Claus, CEO',
    re: 'HALF THE RELICS & DAY 366',
    body: 'Fifteen of our thirty cross-siloed relics have been returned to their home shelves! That\'s half our leverage! And why does every pivot table still spit out **366** days?! Stop muttering about "February\'s quadrennial edge-case" and find whoever is smuggling relics through Holiday Hall!',
    signoff: 'S. Claus, CEO',
  },
  E4: {
    id: 'E4',
    header: 'XMAS365™ · SECURITY ALERT',
    to: 'All Staff',
    from: 'S. Claus, CEO',
    re: 'CODE RED-NOSED: Twenty Relics Back!',
    body: 'All hands on deck! Twenty relics are back on their shelves, padlocks are popping all over campus, and our stock is sleigh-ding! Find the saboteur running between the doors! Someone stuck a Post-it on my monitor saying *"Check Feb 29"* and I had Security shred it. Reindeer: your "sky-high burnout" ticket is closed!',
    signoff: 'S. Claus, CEO',
  },
  E5: {
    id: 'E5',
    header: 'XMAS365™ · LEGAL ESCALATION',
    to: 'General Counsel',
    from: 'S. Claus, CEO',
    re: 'URGENT: Five Relics Left—Lock It Down',
    body: 'Twenty-five relics returned! TWENTY-FIVE! Only five padlocks stand between us and total brand rollback! Draft the ironclad Master Merger Agreement immediately: every holiday, 365 days, locked in perpetuity with zero opt-out clauses! Once I take the podium in Holiday Hall, our monopoly is legally bulletproof!',
    signoff: 'S. Claus, CEO',
  },
  E6: {
    id: 'E6',
    header: 'XMAS365™ · MANDATORY SUMMONS',
    to: 'All Staff',
    from: 'S. Claus, CEO',
    re: 'Mandatory Signing Mixer @ Hall',
    body: 'All thirty relics returned and all six mascots loose in the hall?! Fine—if you want a hostile takeover done right, do it yourself! I have taken the podium in Holiday Hall personally with the binding Master Merger Contract and my platinum fountain pen. Once I initial all six clauses, every holiday snaps back under XMAS365™ ownership forever!',
    signoff: 'S. Claus, CEO',
  },
  Y7: {
    id: 'Y7',
    header: 'XMAS12 · POST-MERGER MEMO',
    to: 'All Holidays (and Day 366)',
    from: 'S. Claus, Founder',
    re: 'Right-Sizing to Xmas12',
    body: 'Effective today, XMAS365™ has pivoted to **Xmas12**: twelve cosy days starting Dec 25th, and 353 days of well-earned PTO for the elves, the reindeer, and me. Plus one permanent VIP slot pencilled into every diary on earth: **February 29th**. Happy Leap Day. See you every year!',
    signoff: 'S. Claus, Recovering CEO',
  },
};

export type DialogueBeatId =
  | 'P0'
  | 'P2'
  | 'thanksgiving.caged'
  | 'thanksgiving.freed'
  | 'thanksgiving.bonus.offer'
  | 'thanksgiving.bonus.reward'
  | 'T2'
  | 'T3'
  | 'fourth.caged'
  | 'fourth.freed'
  | 'fourth.bonus.offer'
  | 'fourth.bonus.reward'
  | 'christmas.caged'
  | 'christmas.freed'
  | 'christmas.bonus.offer'
  | 'christmas.bonus.reward'
  | 'easter.caged'
  | 'easter.freed'
  | 'easter.bonus.offer'
  | 'easter.bonus.reward'
  | 'valentines.caged'
  | 'valentines.freed'
  | 'valentines.bonus.offer'
  | 'valentines.bonus.reward'
  | 'halloween.caged'
  | 'halloween.freed'
  | 'halloween.bonus.offer'
  | 'halloween.bonus.reward'
  | 'C0'
  | 'C1.torn'
  | 'C2.torn'
  | 'C3.torn'
  | 'C4.torn'
  | 'C5.torn'
  | 'C6.early'
  | 'C6.torn'
  | 'Y1'
  | 'Y2'
  | 'Y4';

export type BeatId = MemoId | DialogueBeatId;

export interface DialogueBeatSpec {
  id: DialogueBeatId;
  kind: 'dialogue';
  /** Optional document/sign header rendered above the dialogue (e.g. `C0` contract cover). */
  document?: {
    title: string;
    subtitle: string;
    term: string;
    signature: string;
  };
  lines: readonly DialogueLine[];
}

export interface MemoBeatSpec {
  id: MemoId;
  kind: 'memo';
  memoId: MemoId;
}

export type BeatSpec = MemoBeatSpec | DialogueBeatSpec;

export const DIALOGUE_BEATS: Record<DialogueBeatId, DialogueBeatSpec> = {
  P0: {
    id: 'P0',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'Huh. Missed a spot.',
      },
    ],
  },
  P2: {
    id: 'P2',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'All 365 days. Funny how I never make the spreadsheet.',
      },
    ],
  },
  'thanksgiving.caged': {
    id: 'thanksgiving.caged',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'turkey',
        text: "Ahem! This hostile takeover is *fowl* play! / Be a dear and bail me out before I'm downsized into soup!",
      },
    ],
  },
  'thanksgiving.freed': {
    id: 'thanksgiving.freed',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'turkey',
        text: 'Uncaged at last! Much obliged, Feb... 28th, is it? / And for the record, that platter is 100% *tofurkey*.',
      },
    ],
  },
  'thanksgiving.bonus.offer': {
    id: 'thanksgiving.bonus.offer',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'turkey',
        text: "Care to circle back for seconds? I've some high-*steaks* carving on the table.",
      },
    ],
  },
  'thanksgiving.bonus.reward': {
    id: 'thanksgiving.bonus.reward',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'turkey',
        text: 'Upper-crust execution! I shall wear a party hat *atop* my buckle hat. Double-hatted!',
      },
    ],
  },
  T2: {
    id: 'T2',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'Five relics per shelf, five padlocks per cage. Better start delivering.',
      },
    ],
  },
  T3: {
    id: 'T3',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'One relic back on its shelf, and one padlock off the cage. Four more to free them.',
      },
    ],
  },
  'fourth.caged': {
    id: 'fourth.caged',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'eaglet',
        text: "Give me liberty or give me a snack! / Mister? Ma'am? ...Frog?",
      },
    ],
  },
  'fourth.freed': {
    id: 'fourth.freed',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'eaglet',
        text: 'FREEDOM RINGS! And chirps! Thanks, uh... March 1st! / Close enough for government work, right?',
      },
    ],
  },
  'fourth.bonus.offer': {
    id: 'fourth.bonus.offer',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'eaglet',
        text: 'Wanna launch the BIG-budget rockets? The really, really hard ones?',
      },
    ],
  },
  'fourth.bonus.reward': {
    id: 'fourth.bonus.reward',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'eaglet',
        text: 'KA-BOOM! Talk about a bang-up job! Saving this party hat for your bash!',
      },
    ],
  },
  'christmas.caged': {
    id: 'christmas.caged',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'snowman',
        text: 'One day a year was *cool*. Three hundred and sixty-five is a meltdown. / Could you get me out of here?',
      },
    ],
  },
  'christmas.freed': {
    id: 'christmas.freed',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'snowman',
        text: 'Thank you... Tuesday, was it? / Even Christmas was sick of Christmas. The elves are clocking out.',
      },
    ],
  },
  'christmas.bonus.offer': {
    id: 'christmas.bonus.offer',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'snowman',
        text: 'A few strings of lights are still tangled, if you have the bandwidth.',
      },
    ],
  },
  'christmas.bonus.reward': {
    id: 'christmas.bonus.reward',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'snowman',
        text: "The whole tree, lit. I'll tip my party hat to that.",
      },
    ],
  },
  'easter.caged': {
    id: 'easter.caged',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bunny',
        text: "Hi-hello-quick-sync! They clipped *antlers* to my ears! / I'm *hopping* mad! Let's bounce!",
      },
    ],
  },
  'easter.freed': {
    id: 'easter.freed',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bunny',
        text: 'Thanksthanksthanks, Leap Year! Leap Week? Leapfrog! / Gotta dash, antlers off, bye!',
      },
    ],
  },
  'easter.bonus.offer': {
    id: 'easter.bonus.offer',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bunny',
        text: 'Ooh, want some stretch-goal hops? High-impact, super bouncy!',
      },
    ],
  },
  'easter.bonus.reward': {
    id: 'easter.bonus.reward',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bunny',
        text: 'Nailed the landing! Party hat goes on the left ear. Or the right ear. Both ears!',
      },
    ],
  },
  'valentines.caged': {
    id: 'valentines.caged',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bear',
        text: 'This hostile takeover is *un-bear-able*! / The mailbox is full of junk mail. Help me put the heart back in here?',
      },
    ],
  },
  'valentines.freed': {
    id: 'valentines.freed',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bear',
        text: 'Oh, thank you, sweet... Groundhog Day? / Take a free, 100% non-scalable hug on me!',
      },
    ],
  },
  'valentines.bonus.offer': {
    id: 'valentines.bonus.offer',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bear',
        text: 'I still have a few VIP love letters stuck in the mailroom. Lend a paw?',
      },
    ],
  },
  'valentines.bonus.reward': {
    id: 'valentines.bonus.reward',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'bear',
        text: "Signed, sealed, and hand-delivered! I'll wear this party hat with all my heart.",
      },
    ],
  },
  'halloween.caged': {
    id: 'halloween.caged',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'spider',
        text: 'Quarantined for *web design*? The sheer lack of taste! / Do pull some strings and let me out, darling.',
      },
    ],
  },
  'halloween.freed': {
    id: 'halloween.freed',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'spider',
        text: "*Fang-tastic* work, darling... February 30th? / Well, whatever date you are, you're a total catch.",
      },
    ],
  },
  'halloween.bonus.offer': {
    id: 'halloween.bonus.offer',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'spider',
        text: 'Care to test my high-complexity webs, darling? Very cutting-edge.',
      },
    ],
  },
  'halloween.bonus.reward': {
    id: 'halloween.bonus.reward',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'spider',
        text: 'A party hat right on the tip of my witch hat. Very chic, darling.',
      },
    ],
  },
  C0: {
    id: 'C0',
    kind: 'dialogue',
    document: {
      title: 'MASTER MERGER & SUBSUMPTION AGREEMENT',
      subtitle: 'between XMAS365™ Inc. ("The Big Guy") and All Other Holidays ("Sub-Brands").',
      term: 'All 365 calendar days of the Fiscal Year, in perpetuity.',
      signature: '____________',
    },
    lines: [
      {
        speaker: 'santa',
        stage: 'standing center-stage, waving a platinum fountain pen',
        text: 'Aha! Caught you red-handed, you rogue intern! Who on earth are *you*?!',
      },
      {
        speaker: 'leapday',
        text: "Leap Day. February 29th. And before you sign that Master Merger Contract, I'm auditing every clause.",
      },
      {
        speaker: 'santa',
        stage: 'shoving the golden clipboard forward',
        text: 'February twenty-*what*?! Audit away, frog—six ironclad clauses, zero loopholes!',
      },
    ],
  },
  'C1.torn': {
    id: 'C1.torn',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'Clause 1: Halloween Vertical — red-lined and voided! Keep your tinsel off the cobwebs.',
      },
      {
        speaker: 'santa',
        stage: 'clutching his clipboard',
        text: 'Hey! Do not initial my margins in red ink! That Halloween vertical was Q4 accretive!',
      },
    ],
  },
  'C2.torn': {
    id: 'C2.torn',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'Clause 2: Thanksgiving Vertical — carved right out of the merger. Gratitude needs no gift receipt.',
      },
      {
        speaker: 'santa',
        stage: 'sputtering into his beard',
        text: 'My November runway! Give me back that red pen this instant!',
      },
    ],
  },
  'C3.torn': {
    id: 'C3.torn',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'Clause 3: Core Flagship — rewired! December 25th stays on December 25th.',
      },
      {
        speaker: 'santa',
        stage: 'tugging at his green tie',
        text: 'You unplugged my 365-day rollout! Do you have any idea what sleigh overtime costs?!',
      },
    ],
  },
  'C4.torn': {
    id: 'C4.torn',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: "Clause 4: Valentine's Vertical — un-merged from CRM. Love letters aren't drip campaigns.",
      },
      {
        speaker: 'santa',
        stage: 'checking his falling stock ticker',
        text: 'Our Q1 engagement metrics! Shredded! Have you no respect for corporate synergy?!',
      },
    ],
  },
  'C5.torn': {
    id: 'C5.torn',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'Clause 5: Easter Vertical — hopped right off the balance sheet. Bunnies report to no sleigh.',
      },
      {
        speaker: 'santa',
        stage: 'shielding the remaining pages',
        text: 'That was our entire spring pre-order pipeline! Stop tearing the parchment!',
      },
    ],
  },
  'C6.early': {
    id: 'C6.early',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'Clause 6: July 4th & Definitions — red-lined. Wait... "Fiscal Year is strictly defined as 365 days"? Hold that thought.',
      },
      {
        speaker: 'santa',
        stage: 'trying to cover Sec 6.2 with his thumb',
        text: 'Stop reading Sec 6.2! Nobody is supposed to read the fine print!',
      },
    ],
  },
  'C6.torn': {
    id: 'C6.torn',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'leapday',
        text: 'All six clauses voided. And look at Sec 6.2: "Fiscal Year is strictly defined as 365 days." Hate to break it to you, Nick—it\'s a Leap Year.',
      },
      {
        speaker: 'santa',
        stage: 'staring at the shredded contract on his podium, dropping his platinum pen',
        text: "366 days?! Wait—the frog in the glasses—you're February 29th!",
      },
      {
        speaker: 'leapday',
        text: 'The quadrennial edge-case you deleted from the spreadsheet. Your entire merger is null and void.',
      },
      {
        speaker: 'santa',
        stage: 'adjusts his green tie, checks his pocket diary',
        text: "February 29th... Oh, tinsel. You're real. And my monopoly is cooked.",
      },
    ],
  },
  Y1: {
    id: 'Y1',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'spider',
        text: 'Surprise, darling! **February 29th**, spun in silk right across the banner! No bugs in *this* rollout.',
      },
      {
        speaker: 'turkey',
        text: "Hear, hear for **Leap Day**! Not the 28th! I'll eat my buckle hat if I ever forget again.",
      },
      {
        speaker: 'eaglet',
        text: 'HAPPY **LEAP DAY**! Not March 1st! Give this frog a twenty-one-firework salute!',
      },
      {
        speaker: 'snowman',
        text: 'To **Leap Day**, not Tuesday! Coolest day on the whole calendar, hands down.',
      },
      {
        speaker: 'bunny',
        text: '**Leap Day! Leap Day!** Finally a holiday with *LEAP* right in the name!',
      },
      {
        speaker: 'bear',
        text: 'Happy **February 29th**! Not Groundhog Day. We threw this whole party just for you!',
      },
    ],
  },
  Y2: {
    id: 'Y2',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'santa',
        stage: 'in his rumpled suit, swapping his clipboard for birthday candles',
        text: 'I... liquidated my calendar monopoly. Brought candles instead. / Room for one more stakeholder?',
      },
      {
        speaker: 'spider',
        text: 'Shall we take a board vote on letting Nick keep a *modest* market share?',
      },
      {
        speaker: 'eaglet',
        text: "Give him TWELVE DAYS! There's already a song about it and everything!",
      },
      {
        speaker: 'santa',
        text: '**Xmas12**... You know, the overhead is *much* more manageable.',
      },
    ],
  },
  Y4: {
    id: 'Y4',
    kind: 'dialogue',
    lines: [
      {
        speaker: 'mascots',
        stage: 'together',
        text: 'By unanimous vote of every holiday: Leap Day is now **Day 366 (Every Year)**! / Pencilled onto every calendar, with no four-year wait!',
      },
      {
        speaker: 'leapday',
        text: "An annual party? Careful, you'll ruin my mysterious low profile.",
      },
    ],
  },
};

export const STORY_BEATS = DIALOGUE_BEATS;

export const HALL_MASCOT_LINES: Record<
  'halloween' | 'thanksgiving' | 'christmas' | 'valentines' | 'easter' | 'fourth',
  { speaker: string; icon: string; line: string }
> = {
  halloween: {
    speaker: 'The Spider',
    icon: '🕷️',
    line: 'Waiting in the hall until all six of us are free, darling—keep un-padlocking those cages!',
  },
  thanksgiving: {
    speaker: 'The Turkey',
    icon: '🦃',
    line: 'Much obliged for the rescue! Fetch the rest of the flock so we can audit Santa right out of the hall.',
  },
  christmas: {
    speaker: 'The Snowman',
    icon: '⛄',
    line: 'Chilling in the corner until the whole crew is uncaged—even Christmas wants our old holidays back.',
  },
  valentines: {
    speaker: 'The Teddy Bear',
    icon: '🧸',
    line: 'Sending moral hugs from the hall! Bring the rest of the relics home and free everyone!',
  },
  easter: {
    speaker: 'The Bunny',
    icon: '🐰',
    line: "Antlers off, paws warmed up—free the rest of the mascots and we'll crash Santa's merger!",
  },
  fourth: {
    speaker: 'The Eaglet',
    icon: '🦅',
    line: 'Standing by for the big finale! Unlock the remaining cages and let freedom ring!',
  },
};

export function getBeatSpec(id: BeatId): BeatSpec {
  if (id in MEMOS) {
    return { id: id as MemoId, kind: 'memo', memoId: id as MemoId };
  }
  return DIALOGUE_BEATS[id as DialogueBeatId];
}

export interface RoomScriptSpec {
  id: RoomScriptId;
  /** Rebranded XMAS365 corporate name while acquired (`SCRIPT.md`). */
  acquiredTitle: string;
  /** Short corporate tag shown in the top bar while acquired. */
  acquiredSubtitle: string;
  /** True holiday room title once restored. */
  restoredTitle: string;
  enterMemoId: MemoId;
  cagedBeatId: DialogueBeatId;
  freedBeatId: DialogueBeatId;
  bonusOfferBeatId: DialogueBeatId;
  bonusRewardBeatId: DialogueBeatId;
  deskReclaimedSign: string;
}

export const ROOM_SCRIPT: Record<RoomScriptId, RoomScriptSpec> = {
  thanksgiving: {
    id: 'thanksgiving',
    acquiredTitle: 'Pre-Christmas Table',
    acquiredSubtitle: 'an XMAS365™ Subsidiary',
    restoredTitle: 'Thanksgiving Table',
    enterMemoId: 'thanksgiving.enter',
    cagedBeatId: 'thanksgiving.caged',
    freedBeatId: 'thanksgiving.freed',
    bonusOfferBeatId: 'thanksgiving.bonus.offer',
    bonusRewardBeatId: 'thanksgiving.bonus.reward',
    deskReclaimedSign: 'Thanksgiving: de-merged & back on the calendar!',
  },
  fourth: {
    id: 'fourth',
    acquiredTitle: 'Christmas in July Yard',
    acquiredSubtitle: 'an XMAS365™ Subsidiary',
    restoredTitle: 'Fourth of July Yard',
    enterMemoId: 'fourth.enter',
    cagedBeatId: 'fourth.caged',
    freedBeatId: 'fourth.freed',
    bonusOfferBeatId: 'fourth.bonus.offer',
    bonusRewardBeatId: 'fourth.bonus.reward',
    deskReclaimedSign: 'Fourth of July: de-merged & back on the calendar!',
  },
  christmas: {
    id: 'christmas',
    acquiredTitle: 'Christmas+™ Hearth',
    acquiredSubtitle: '365/24/7 Crunch Mode',
    restoredTitle: 'Christmas Hearth',
    enterMemoId: 'christmas.enter',
    cagedBeatId: 'christmas.caged',
    freedBeatId: 'christmas.freed',
    bonusOfferBeatId: 'christmas.bonus.offer',
    bonusRewardBeatId: 'christmas.bonus.reward',
    deskReclaimedSign: 'Christmas: de-merged & back on the calendar!',
  },
  easter: {
    id: 'easter',
    acquiredTitle: 'Eggnog Garden',
    acquiredSubtitle: 'an XMAS365™ Subsidiary',
    restoredTitle: 'Easter Garden',
    enterMemoId: 'easter.enter',
    cagedBeatId: 'easter.caged',
    freedBeatId: 'easter.freed',
    bonusOfferBeatId: 'easter.bonus.offer',
    bonusRewardBeatId: 'easter.bonus.reward',
    deskReclaimedSign: 'Easter: de-merged & back on the calendar!',
  },
  valentines: {
    id: 'valentines',
    acquiredTitle: 'Mistletoe Parlor',
    acquiredSubtitle: 'an XMAS365™ Subsidiary',
    restoredTitle: "Valentine's Parlor",
    enterMemoId: 'valentines.enter',
    cagedBeatId: 'valentines.caged',
    freedBeatId: 'valentines.freed',
    bonusOfferBeatId: 'valentines.bonus.offer',
    bonusRewardBeatId: 'valentines.bonus.reward',
    deskReclaimedSign: "Valentine's Day: de-merged & back on the calendar!",
  },
  halloween: {
    id: 'halloween',
    acquiredTitle: 'Ugly Sweater Porch',
    acquiredSubtitle: 'an XMAS365™ Subsidiary',
    restoredTitle: 'Halloween Porch',
    enterMemoId: 'halloween.enter',
    cagedBeatId: 'halloween.caged',
    freedBeatId: 'halloween.freed',
    bonusOfferBeatId: 'halloween.bonus.offer',
    bonusRewardBeatId: 'halloween.bonus.reward',
    deskReclaimedSign: 'Halloween: de-merged & back on the calendar!',
  },
};

export interface ContractClauseSpec {
  id: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
  genre: 'webs' | 'carving' | 'lights' | 'words' | 'hops' | 'pictures';
  heading: string;
  body: string;
}

export const CONTRACT_CLAUSES: readonly ContractClauseSpec[] = [
  {
    id: 'C1',
    genre: 'webs',
    heading: 'Clause 1: Halloween Vertical',
    body: 'Oct 31st is hereby acquired. All cobwebs are to be replaced with tinsel.',
  },
  {
    id: 'C2',
    genre: 'carving',
    heading: 'Clause 2: Thanksgiving Vertical',
    body: 'The fourth Thursday of Nov is sunsetted. All gratitude requires a gift receipt.',
  },
  {
    id: 'C3',
    genre: 'lights',
    heading: 'Clause 3: Core Flagship',
    body: 'Dec 25th is copy-pasted across all 365 fiscal days. Overtime is non-negotiable.',
  },
  {
    id: 'C4',
    genre: 'words',
    heading: "Clause 4: Valentine's Vertical",
    body: 'Feb 14th is merged into CRM. Romance is replaced with quarterly e-newsletters.',
  },
  {
    id: 'C5',
    genre: 'hops',
    heading: 'Clause 5: Easter Vertical',
    body: 'Spring is restructured into Q2 Pre-Order Season. All bunnies report to Sleigh Ops.',
  },
  {
    id: 'C6',
    genre: 'pictures',
    heading: 'Clause 6: July 4th & Definitions',
    body: 'July 4th is Christmas in July. *Sec 6.2: "Fiscal Year" is strictly defined as 365 days.*',
  },
] as const;

export const CAKE_RELAY_LINES: readonly {
  id: string;
  stage: string;
  line: DialogueLine;
}[] = [
  {
    id: 'Y3.1',
    stage: 'Picture: the cake',
    line: {
      speaker: 'eaglet',
      text: 'Stage one: bake the cake! Make it pop like a grand finale!',
    },
  },
  {
    id: 'Y3.2',
    stage: 'Words: on the cake',
    line: {
      speaker: 'bear',
      text: 'Now pipe the frosting and spell out something sweet from the heart!',
    },
  },
  {
    id: 'Y3.3',
    stage: 'Carving: the slices',
    line: {
      speaker: 'turkey',
      text: 'Time to carve fair shares! Mind the lettering, nobody wants a half-baked word.',
    },
  },
  {
    id: 'Y3.4',
    stage: 'Hops: eating it',
    line: {
      speaker: 'bunny',
      text: 'My turn! Hop slice to slice in order. Taste-testing is mission-critical!',
    },
  },
  {
    id: 'Y3.5',
    stage: 'Lights: the candles',
    line: {
      speaker: 'snowman',
      text: "Wire up the birthday candles from where the Bunny stopped. Let's make it glow!",
    },
  },
  {
    id: 'Y3.6',
    stage: 'Webs: the bunting',
    line: {
      speaker: 'spider',
      text: 'And the finishing touch, darling: spin festive bunting between every candle!',
    },
  },
] as const;

/** Dialogue beats queued when a Merger Contract clause (`0..5`) is voided before the final clause. */
export const CLAUSE_EARLY_TORN_BEATS: readonly DialogueBeatId[] = [
  'C1.torn',
  'C2.torn',
  'C3.torn',
  'C4.torn',
  'C5.torn',
  'C6.early',
] as const;

/** Interpolate `{holiday}` placeholders in memo fields. */
export function formatMemoText(text: string, firstRevertedHoliday = 'Thanksgiving'): string {
  return text.replaceAll('{holiday}', firstRevertedHoliday);
}
