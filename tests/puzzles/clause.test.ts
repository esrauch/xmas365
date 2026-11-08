import { describe, expect, it } from 'vitest';
import { GameState, ROOM_SPECS, STRAY_ITEMS } from '../../src/game/state';
import { ALL_CLAUSES, CLAUSE_PANEL_COUNT } from '../../src/proto/puzzles/clauses';

describe('XMAS365™ Merger Contract Finale gauntlet (6 clauses × 29 panels = 174 panels)', () => {
  it('exposes all 6 clauses with 29 panels each (174 total)', () => {
    expect(ALL_CLAUSES).toHaveLength(6);
    expect(ALL_CLAUSES.map((c) => c.genre)).toEqual([
      'webs',
      'carving',
      'lights',
      'words',
      'hops',
      'pictures',
    ]);
    let total = 0;
    for (const clause of ALL_CLAUSES) {
      expect(clause.panels, clause.id).toHaveLength(CLAUSE_PANEL_COUNT);
      expect(clause.gimmicks, clause.id).toHaveLength(6);
      total += clause.panels.length;
    }
    expect(total).toBe(174);
  });

  it('tracks per-panel and per-clause voiding state through all 6 clauses', () => {
    const state = new GameState();
    state.resetAll();

    expect(state.voidedClauseCount()).toBe(0);
    expect(state.clauseSolvedPanelCount('webs')).toBe(0);

    for (let i = 0; i < CLAUSE_PANEL_COUNT - 1; i++) {
      state.markClausePanelSolved('webs', i);
    }
    expect(state.clauseSolvedPanelCount('webs')).toBe(28);
    expect(state.isClauseVoided(0)).toBe(false);

    // Solving the 29th panel voids Clause 1 and queues C1.torn
    state.markClausePanelSolved('webs', 28);
    expect(state.clauseSolvedPanelCount('webs')).toBe(29);
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

  it('maintains 2-item twist symmetry across all 6 holiday rooms', () => {
    expect(ROOM_SPECS).toHaveLength(6);
    const allStrays = Object.values(STRAY_ITEMS);
    expect(allStrays).toHaveLength(12);

    for (const room of ROOM_SPECS) {
      const foundHere = allStrays.filter((s) => s.foundIn === room.id);
      const belongsHere = allStrays.filter((s) => s.homeRoom === room.id);
      expect(foundHere, `${room.id} foundIn count`).toHaveLength(2);
      expect(belongsHere, `${room.id} homeRoom count`).toHaveLength(2);
      for (const s of foundHere) {
        expect(s.homeRoom).not.toBe(s.foundIn);
      }
      expect(new Set(room.centerpiece.requiredItems)).toEqual(
        new Set(belongsHere.map((s) => s.id)),
      );
    }
  });

  it('progresses through Acts I -> II -> III -> IV, pins XMAS365™ memos, and updates room signage', () => {
    const state = new GameState();
    state.resetAll();

    expect(state.act()).toBe(1);
    expect(state.pinnedMemos.has('P1')).toBe(true);

    const halloween = ROOM_SPECS[0];
    expect(state.getRoomSignage(halloween).isAcquired).toBe(true);
    expect(state.getRoomSignage(halloween).title).toBe('Ugly Sweater Porch');
    expect(state.getRoomSignage(halloween).subtitle).toBe('an XMAS365™ Subsidiary');
    expect(state.isStrayUnlocked(halloween)).toBe(false);
    expect(state.isCenterpieceUnlocked(halloween)).toBe(false);

    // Entering Halloween doesn't find its acquisition notice memo yet
    state.onEnterBay('halloween');
    expect(state.pinnedMemos.has('halloween.enter')).toBe(false);

    // Beat warmup -> finds the memo, and unlocks strays in Halloween
    state.markRunSolved(halloween.warmup.id);
    expect(state.pinnedMemos.has('halloween.enter')).toBe(true);
    expect(state.isStrayUnlocked(halloween)).toBe(true);

    // Beat a stray -> enters carry tray until placed on home pedestal
    state.markRunSolved('jack');
    expect(state.carriedItems().map((x) => x.id)).toContain('jack');
    state.markRunSolved('broom');
    state.placeItem('jack');
    state.placeItem('broom');
    expect(state.carriedItems().map((x) => x.id)).not.toContain('jack');
    expect(state.isCenterpieceUnlocked(halloween)).toBe(true);

    // Complete 3 rooms -> Act II + E1..E3 queued for Hall Corkboard
    for (const r of ROOM_SPECS.slice(0, 3)) {
      state.markRunSolved(r.warmup.id);
      state.markRunSolved(r.strays[0].proto.id);
      state.markRunSolved(r.strays[1].proto.id);
      state.markRunSolved(r.centerpiece.proto.id);
    }
    expect(state.completedRoomCount()).toBe(3);
    expect(state.act()).toBe(2);
    expect(state.getRoomSignage(halloween).isAcquired).toBe(false);
    expect(state.getRoomSignage(halloween).title).toBe(halloween.title);
    expect(state.firstRevertedHoliday).toBe(halloween.shortTitle);

    state.onEnterBay('hall');
    expect(state.pinnedMemos.has('E1')).toBe(true);
    expect(state.pinnedMemos.has('E3')).toBe(true);

    // Complete all 6 rooms -> Act III (All 6 XMAS365 escalation memos E1..E6)
    for (const r of ROOM_SPECS.slice(3)) {
      state.markRunSolved(r.warmup.id);
      state.markRunSolved(r.strays[0].proto.id);
      state.markRunSolved(r.strays[1].proto.id);
      state.markRunSolved(r.centerpiece.proto.id);
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

  it('derives runs, clauses, and memos from panels and round-trips JSON save state', () => {
    const state = new GameState();
    state.resetAll();

    // Toggling a room warm-up and centerpiece via setRunSolved fills their panels and pins memos
    const tg = ROOM_SPECS[1]; // Thanksgiving
    state.setRunSolved(tg.warmup.id, true);
    expect(state.runSolvedPanelCount(tg.warmup.id)).toBe(state.runPanelCount(tg.warmup.id));
    expect(state.solvedRuns.has(tg.warmup.id)).toBe(true);
    expect(state.pinnedMemos.has('thanksgiving.enter')).toBe(true);

    state.setRunSolved(tg.centerpiece.proto.id, true);
    expect(state.completedRoomCount()).toBe(1);
    expect(state.pinnedMemos.has('E1')).toBe(true);

    // Unchecking the centerpiece removes its panels, un-completes the room, and unpins E1
    state.setRunSolved(tg.centerpiece.proto.id, false);
    expect(state.runSolvedPanelCount(tg.centerpiece.proto.id)).toBe(0);
    expect(state.completedRoomCount()).toBe(0);
    expect(state.pinnedMemos.has('E1')).toBe(false);

    // Toggling clauses via setClauseVoided updates panel counts and round-trips via exportSaveJson/importSaveJson
    state.setClauseVoided(0, true);
    state.setClauseVoided(2, true);
    expect(state.voidedClauseCount()).toBe(2);
    expect(state.clauseSolvedPanelCount('webs')).toBe(29);
    expect(state.clauseSolvedPanelCount('lights')).toBe(29);

    const exported = state.exportSaveJson();
    state.resetAll();
    expect(state.voidedClauseCount()).toBe(0);
    expect(state.solvedRuns.has(tg.warmup.id)).toBe(false);

    const res = state.importSaveJson(exported);
    expect(res).toEqual({ ok: true });
    expect(state.solvedRuns.has(tg.warmup.id)).toBe(true);
    expect(state.pinnedMemos.has('thanksgiving.enter')).toBe(true);
    expect(state.voidedClauseCount()).toBe(2);
    expect(state.isClauseVoided(0)).toBe(true);
    expect(state.isClauseVoided(2)).toBe(true);

    expect(state.importSaveJson('not-json').ok).toBe(false);
  });
});
