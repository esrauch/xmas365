import { describe, expect, it } from 'vitest';
import { GameState, ROOM_SPECS, STRAY_ITEMS, getRunIdentity } from '../../src/game/state';
import {
  ALL_CLAUSES,
  CLAUSE_PANEL_COUNT,
  formatPuzzleIdentity,
} from '../../src/proto/puzzles/clauses';

describe('XMAS365™ Merger Contract Finale gauntlet (6 clauses × 22 puzzles = 132 puzzles)', () => {
  it('exposes all 6 clauses with 22 puzzles each (132 total)', () => {
    expect(ALL_CLAUSES).toHaveLength(6);
    expect(ALL_CLAUSES.map((c) => c.genre)).toEqual([
      'webs',
      'carving',
      'lights',
      'words',
      'hops',
      'pictures',
    ]);
    expect(ALL_CLAUSES.map((c) => c.genreTitle)).toEqual([
      'Web',
      'Carving',
      'Lights',
      'Heartstrings',
      'Hops',
      'Fireworks',
    ]);
    let total = 0;
    for (const clause of ALL_CLAUSES) {
      expect(clause.panels, clause.id).toHaveLength(CLAUSE_PANEL_COUNT);
      expect(clause.twistMeta, clause.id).toHaveLength(6);
      total += clause.panels.length;
    }
    expect(total).toBe(132);
  });

  it('formats normalized Dual Display puzzle identities for 0, 1, and 2+ twists', () => {
    const baseOnly = formatPuzzleIdentity('webs', []);
    expect(baseOnly.themedName).toBe('Web');
    expect(baseOnly.holidayFormula).toBe('Halloween');
    expect(baseOnly.dualLabel).toBe('Web · Halloween');

    const soloTwist = formatPuzzleIdentity('webs', ['letters']);
    expect(soloTwist.themedName).toBe('Love-Letter Web');
    expect(soloTwist.holidayFormula).toBe("Halloween (Valentine's)");
    expect(soloTwist.dualLabel).toBe("Love-Letter Web · Halloween (Valentine's)");

    const duoTwist = formatPuzzleIdentity('webs', ['letters', 'cuts']);
    expect(duoTwist.themedName).toBe('Love-Letter Portioned Web');
    expect(duoTwist.holidayFormula).toBe("Halloween (Valentine's, Thanksgiving)");
    expect(duoTwist.dualLabel).toBe(
      "Love-Letter Portioned Web · Halloween (Valentine's, Thanksgiving)",
    );

    expect(getRunIdentity('cobwebs')?.dualLabel).toBe('Web · Halloween');
    expect(getRunIdentity('chocolates')?.dualLabel).toBe(
      "Love-Letter Web · Halloween (Valentine's)",
    );
    expect(getRunIdentity('web')?.dualLabel).toBe('Spooky Web · Halloween (Halloween)');
  });

  it('tracks per-panel and per-clause voiding state through all 6 clauses', () => {
    const state = new GameState();
    state.resetAll();

    expect(state.voidedClauseCount()).toBe(0);
    expect(state.clauseSolvedPanelCount('webs')).toBe(0);

    for (let i = 0; i < CLAUSE_PANEL_COUNT - 1; i++) {
      state.markClausePanelSolved('webs', i);
    }
    expect(state.clauseSolvedPanelCount('webs')).toBe(21);
    expect(state.isClauseVoided(0)).toBe(false);

    // Solving the 22nd panel voids Clause 1 and queues C1.torn
    state.markClausePanelSolved('webs', 21);
    expect(state.clauseSolvedPanelCount('webs')).toBe(22);
    expect(state.isClauseVoided(0)).toBe(true);
    expect(state.voidedClauseCount()).toBe(1);
    expect(state.beatQueue).toContain('C1.torn');

    // Voiding Clause 6 early queues C6.early (not C6.torn), so dismissing it never skips C6.torn
    state.markClauseVoided(5);
    expect(state.beatQueue).toContain('C6.early');
    expect(state.beatQueue).not.toContain('C6.torn');
    state.dismissBeat('C6.early');
    expect(state.milestones.has('C6.early')).toBe(true);
    expect(state.milestones.has('C6.torn')).toBe(false);

    // Voiding the remaining clauses completes the Merger Contract ('clause') and queues C6.torn
    for (let c = 1; c < 5; c++) {
      state.markClauseVoided(c);
    }
    expect(state.voidedClauseCount()).toBe(6);
    expect(state.solvedRuns.has('clause')).toBe(true);
    expect(state.beatQueue).toContain('C6.torn');
    expect(state.act()).toBe(4);
  });

  it('maintains 5-item relic symmetry across all 6 holiday rooms (30 relics total)', () => {
    expect(ROOM_SPECS).toHaveLength(6);
    const allStrays = Object.values(STRAY_ITEMS);
    expect(allStrays).toHaveLength(30);

    for (const room of ROOM_SPECS) {
      const foundHere = allStrays.filter((s) => s.foundIn === room.id);
      const belongsHere = allStrays.filter((s) => s.homeRoom === room.id);
      expect(foundHere, `${room.id} foundIn count`).toHaveLength(5);
      expect(belongsHere, `${room.id} homeRoom count`).toHaveLength(5);
      for (const s of foundHere) {
        expect(s.homeRoom).not.toBe(s.foundIn);
      }
      // Every non-home holiday is represented once in foundHere and once in belongsHere
      expect(new Set(foundHere.map((s) => s.homeRoom)).size).toBe(5);
      expect(new Set(belongsHere.map((s) => s.foundIn)).size).toBe(5);
      expect(new Set(room.homeRelics)).toEqual(new Set(belongsHere.map((s) => s.id)));
    }
  });

  it('progresses through Acts I -> II -> III -> IV, pins XMAS365™ memos every 5 relics, and updates room signage', () => {
    const state = new GameState();
    state.resetAll();

    expect(state.act()).toBe(1);
    expect(state.pinnedMemos.has('P1')).toBe(true);

    const halloween = ROOM_SPECS[0];
    expect(state.getRoomSignage(halloween).isAcquired).toBe(true);
    expect(state.getRoomSignage(halloween).title).toBe('Ugly Sweater Porch');
    expect(state.getRoomSignage(halloween).subtitle).toBe('an XMAS365™ Subsidiary');
    expect(state.isHomeTwistUnlocked(halloween)).toBe(false);
    expect(state.isStrayUnlocked(halloween)).toBe(false);
    expect(state.isRoomComplete(halloween)).toBe(false);

    // Entering Halloween doesn't find its acquisition notice memo yet
    state.onEnterBay('halloween');
    expect(state.pinnedMemos.has('halloween.enter')).toBe(false);

    // Beat warmup -> finds the memo, and unlocks the Home Twist run
    state.markRunSolved(halloween.warmup.id);
    expect(state.pinnedMemos.has('halloween.enter')).toBe(true);
    expect(state.isHomeTwistUnlocked(halloween)).toBe(true);
    expect(state.isStrayUnlocked(halloween)).toBe(false);

    // Beat Home Twist -> unlocks the 5 stray relics in Halloween
    state.markRunSolved(halloween.homeTwist.id);
    expect(state.isStrayUnlocked(halloween)).toBe(true);

    // Beat a stray -> enters carry tray until placed on home shelf
    state.markRunSolved('jack');
    expect(state.carriedItems().map((x) => x.id)).toContain('jack');

    // Place all 5 Halloween relics -> frees Halloween mascot, completes Halloween, and queues E1 (5 relics)
    for (const relicId of halloween.homeRelics) {
      state.markRunSolved(relicId);
      state.placeItem(relicId);
    }
    expect(state.carriedItems().map((x) => x.id)).not.toContain('jack');
    expect(state.isRoomComplete(halloween)).toBe(true);
    expect(state.completedRoomCount()).toBe(1);
    expect(state.getRoomSignage(halloween).isAcquired).toBe(false);
    expect(state.getRoomSignage(halloween).title).toBe(halloween.title);
    expect(state.firstRevertedHoliday).toBe(halloween.shortTitle);

    state.onEnterBay('hall');
    expect(state.pinnedMemos.has('E1')).toBe(true);

    // Complete 3 rooms (15 relics placed) -> Act II + E1..E3 queued for Hall Corkboard
    for (const r of ROOM_SPECS.slice(1, 3)) {
      for (const relicId of r.homeRelics) {
        state.markRunSolved(relicId);
        state.placeItem(relicId);
      }
    }
    expect(state.completedRoomCount()).toBe(3);
    expect(state.act()).toBe(2);
    state.onEnterBay('hall');
    expect(state.pinnedMemos.has('E3')).toBe(true);

    // Complete all 6 rooms (30 relics placed) -> Act III (All 6 XMAS365 escalation memos E1..E6)
    for (const r of ROOM_SPECS.slice(3)) {
      for (const relicId of r.homeRelics) {
        state.markRunSolved(relicId);
        state.placeItem(relicId);
      }
    }
    expect(state.completedRoomCount()).toBe(6);
    expect(state.act()).toBe(3);
    state.onEnterBay('hall');
    expect(state.pinnedMemos.has('E6')).toBe(true);

    // Beat the XMAS365 Merger Contract -> Act IV (Day 366 Party + Xmas12 Memo Y7)
    state.markRunSolved('clause');
    expect(state.act()).toBe(4);
    expect(state.freePlayUnlocked).toBe(true);
    expect(state.pinnedMemos.has('Y7')).toBe(true);
  });

  it('derives runs, clauses, memos, and Free Play counts and round-trips JSON save state', () => {
    const state = new GameState();
    state.resetAll();

    // Toggling a room warm-up and home relics fills their panels and pins memos
    const tg = ROOM_SPECS[1]; // Thanksgiving
    state.setRunSolved(tg.warmup.id, true);
    expect(state.runSolvedPanelCount(tg.warmup.id)).toBe(state.runPanelCount(tg.warmup.id));
    expect(state.solvedRuns.has(tg.warmup.id)).toBe(true);
    expect(state.pinnedMemos.has('thanksgiving.enter')).toBe(true);

    for (const relicId of tg.homeRelics) {
      state.setRunSolved(relicId, true);
      state.setItemPlaced(relicId, true);
    }
    expect(state.completedRoomCount()).toBe(1);
    expect(state.pinnedMemos.has('E1')).toBe(true);

    // Unplacing one relic un-completes the room and unpins E1
    state.setItemPlaced(tg.homeRelics[0], false);
    expect(state.completedRoomCount()).toBe(0);
    expect(state.pinnedMemos.has('E1')).toBe(false);

    // Record Free Play solved counts
    state.incrementFreePlaySolved(tg.warmup.id, 'easy');
    state.incrementFreePlaySolved(tg.warmup.id, 'easy');
    state.incrementFreePlaySolved(tg.warmup.id, 'medium');
    expect(state.freePlaySolvedCount(tg.warmup.id, 'easy')).toBe(2);
    expect(state.freePlaySolvedCount(tg.warmup.id, 'medium')).toBe(1);

    // Toggling clauses via setClauseVoided updates panel counts and round-trips via exportSaveJson/importSaveJson
    state.setClauseVoided(0, true);
    state.setClauseVoided(2, true);
    expect(state.voidedClauseCount()).toBe(2);
    expect(state.clauseSolvedPanelCount('webs')).toBe(22);
    expect(state.clauseSolvedPanelCount('lights')).toBe(22);

    const exported = state.exportSaveJson();
    state.resetAll();
    expect(state.voidedClauseCount()).toBe(0);
    expect(state.solvedRuns.has(tg.warmup.id)).toBe(false);
    expect(state.freePlaySolvedCount(tg.warmup.id, 'easy')).toBe(0);

    const res = state.importSaveJson(exported);
    expect(res).toEqual({ ok: true });
    expect(state.solvedRuns.has(tg.warmup.id)).toBe(true);
    expect(state.pinnedMemos.has('thanksgiving.enter')).toBe(true);
    expect(state.voidedClauseCount()).toBe(2);
    expect(state.isClauseVoided(0)).toBe(true);
    expect(state.isClauseVoided(2)).toBe(true);
    expect(state.freePlaySolvedCount(tg.warmup.id, 'easy')).toBe(2);
    expect(state.freePlaySolvedCount(tg.warmup.id, 'medium')).toBe(1);

    expect(state.importSaveJson('not-json').ok).toBe(false);
  });
});
