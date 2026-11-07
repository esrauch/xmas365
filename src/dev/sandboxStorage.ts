/**
 * For dev pages that build game scenes in made-up states: the game's saved
 * progress (every `puzz.` key) lives in memory on this page instead of
 * localStorage, so setting up a state here never touches the player's save.
 * Import it first, before anything that loads the game's state.
 */
const memory = new Map<string, string>();
const real = {
  get: Storage.prototype.getItem,
  set: Storage.prototype.setItem,
  remove: Storage.prototype.removeItem,
};
const ours = (key: string): boolean => key.startsWith('puzz.');

Storage.prototype.getItem = function (key: string): string | null {
  return ours(key) ? (memory.get(key) ?? null) : real.get.call(this, key);
};
Storage.prototype.setItem = function (key: string, value: string): void {
  if (ours(key)) memory.set(key, String(value));
  else real.set.call(this, key, value);
};
Storage.prototype.removeItem = function (key: string): void {
  if (ours(key)) memory.delete(key);
  else real.remove.call(this, key);
};
