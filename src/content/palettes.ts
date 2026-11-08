/**
 * The single source of truth for colors. It feeds voxel vertex colors, CSS
 * custom properties and SVG fills, so 3D and 2D always match (TECHNICAL.md §9).
 * These are neutral starters: retune them once the game has an art direction.
 */

export type Hex = `#${string}`;

/** Shared colors used everywhere: the backdrop, the ground, the UI chrome. */
export const common = {
  /** The world behind everything: the page, the empty scene and the fog all fade to this. */
  backdrop: '#7cc4f5',
  ground: '#8fd14f',
  groundDark: '#6fb83c',
  accent: '#ffb627',
  bone: '#f4efe4',
  ink: '#1f2430',
  /** Warnings and errors. */
  danger: '#e8344e',
  white: '#ffffff',
} as const satisfies Record<string, Hex>;

/**
 * Named colors the 3D models (mascots, props) use. Models use these names,
 * never raw hex, so changing a color here recolors every model that uses it.
 */
export const voxel = {
  ink: '#1f2430',
  white: '#ffffff',
  bone: '#f4efe4',
  red: '#e2543b',
  orange: '#ff8a1f',
  gold: '#ffb627',
  green: '#6cc447',
  greenLight: '#a8e07c',
  greenDark: '#489830',
  blue: '#4a90d9',
  purple: '#a259ff',
  wood: '#b88a5e',
  woodDark: '#7a4e2d',
  stone: '#8d93a3',
  stoneDark: '#646a79',
  pink: '#ff7b93',
  pinkLight: '#ffb3c1',
  /** Faces (Santa): warm, so lit skin doesn't wash out to white beside a white beard. */
  skin: '#f0a27a',
  /** Eyes: deeper than any colour round them, so they always read. */
  eye: '#0e1018',
  glass: '#a7d8f0',
  brass: '#e0b24a',
} as const satisfies Record<string, Hex>;

/** The sky behind the scene. */
export const sky = {
  top: '#3d8fe6',
  horizon: '#c4ecff',
  sun: '#fff3d6',
} as const satisfies Record<string, Hex>;

/**
 * The two cel tones (render/toon.ts): every surface is its own colour × the
 * lit tint where the sun reaches it; where it doesn't, its (linear) colour
 * raised to the shade gamma, which darkens and saturates it, × the shade tint.
 */
export const cel = {
  litTint: '#fffaf0',
  shadeTint: '#d2d8f4',
  shadeGamma: 1.45,
} as const;

export type VoxelColor = keyof typeof voxel;
export type CommonColor = keyof typeof common;

/** Convert a palette hex string to a 0xRRGGBB number for three.js. */
export function hexToNumber(hex: Hex): number {
  return Number.parseInt(hex.slice(1), 16);
}
