/**
 * Player settings, saved to localStorage (TECHNICAL.md §10). Storage can be
 * unavailable (private mode, cleared by the OS), so every access is guarded
 * and the game works with the defaults.
 */

const KEY = 'puzz.settings';
const VERSION = 1;

export interface Settings {
  /** Music and sound volume (0..1). */
  volume: number;
  /** Show live FPS counter overlay. */
  showFps?: boolean;
  /** Play the 3D intro cinematic on page load (defaults to true). */
  showIntroOnLoad?: boolean;
}

const DEFAULTS: Settings = { volume: 1, showFps: false, showIntroOnLoad: true };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Settings> & { version?: number };
    if (parsed.version !== VERSION) return { ...DEFAULTS };
    return {
      volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULTS.volume,
      showFps: typeof parsed.showFps === 'boolean' ? parsed.showFps : false,
      showIntroOnLoad: typeof parsed.showIntroOnLoad === 'boolean' ? parsed.showIntroOnLoad : true,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: Settings): void {
  cachedSettings = { ...settings };
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, ...settings }));
  } catch {
    // Storage unavailable: settings last for this session only.
  }
}

let cachedSettings: Settings | null = null;

export function isSoundEnabled(): boolean {
  cachedSettings ??= loadSettings();
  return cachedSettings.volume > 0;
}

export function setSoundEnabled(enabled: boolean): void {
  const cur = cachedSettings ?? loadSettings();
  saveSettings({ ...cur, volume: enabled ? 1 : 0 });
}

export function isFpsEnabled(): boolean {
  cachedSettings ??= loadSettings();
  return Boolean(cachedSettings.showFps);
}

export function setFpsEnabled(enabled: boolean): void {
  const cur = cachedSettings ?? loadSettings();
  saveSettings({ ...cur, showFps: enabled });
}

export function isShowIntroOnLoadEnabled(): boolean {
  cachedSettings ??= loadSettings();
  return cachedSettings.showIntroOnLoad !== false;
}

export function setShowIntroOnLoadEnabled(enabled: boolean): void {
  const cur = cachedSettings ?? loadSettings();
  saveSettings({ ...cur, showIntroOnLoad: enabled });
}
