import type { ThemeName } from '../types';

/**
 * ─── v2: "Style Sheet" Aesthetic Themes ──────────────────────────────────
 * A theme is a named set of color SLOTS, not per-item colors. Every mesh
 * part in the catalog is tagged with a role — wood, secondary, leaf,
 * emissive, primary — and reads its color from the active theme's slot for
 * that role. Switch themes and every wooden leg, glowing lampshade, wall
 * and floor re-skins itself in one store write.
 *
 * The exception is `primary` parts (cushions, pots, shades…): those use the
 * per-item `color` the user picked from the swatches. Each theme supplies
 * its own swatch palette, so new items always spawn on-theme, while items
 * the user already recolored keep their chosen color.
 */

export interface ScreenStyle {
  /** which procedural pattern the TV's CanvasTexture draws */
  pattern: 'fire' | 'waves' | 'grid';
  bg: string;
  colors: string[];
}

export interface Theme {
  name: ThemeName;
  label: string;
  emoji: string;
  /** CSS gradient stops applied to <body> behind the transparent canvas */
  bg: [string, string, string];
  /** the branding/logo ink — dark charcoal on warm themes, deep slate on cool */
  ink: string;
  floor: string;
  plinth: string;
  wall: string;
  /** the "Wall Canvas" paint swatches offered for this theme */
  wallPresets: [string, string, string, string];
  grid: [string, string];
  wood: string;
  woodDark: string;
  /** neutral secondary surfaces (shelf backs, drawer fronts, lamp bases) */
  secondary: string;
  leaf: string;
  leafLight: string;
  /** the glow color shared by lamps, lanterns, and nightlights */
  emissive: string;
  /** the user-facing swatch palette for `primary` parts */
  swatches: string[];
  screen: ScreenStyle;
}

export const THEMES: Record<ThemeName, Theme> = {
  cottage: {
    name: 'cottage',
    label: 'Cozy Cottage',
    emoji: '🏡',
    bg: ['#FDEFEA', '#FDF8F1', '#EAF3F7'],
    ink: '#4A4139',
    floor: '#F6E9D8',
    plinth: '#EAD9C3',
    wall: '#FBF3E9',
    wallPresets: ['#FBF3E9', '#F8E2DC', '#E8F0E2', '#F2E9F5'],
    grid: ['#E8CDBA', '#F0E2D2'],
    wood: '#C9A47E',
    woodDark: '#B08A63',
    secondary: '#EFE3D2',
    leaf: '#8FC9A0',
    leafLight: '#B2DCBE',
    emissive: '#FFD9A0',
    swatches: ['#EFB3A0', '#F5C7CE', '#BFD8C0', '#A9C4A5', '#F3E0C3', '#E5C3AE'],
    // a soft, warm amber "fireplace" flicker
    screen: { pattern: 'fire', bg: '#3A2A1E', colors: ['#FFB65C', '#FF8A4C', '#FFDCA0'] },
  },
  retro70s: {
    name: 'retro70s',
    label: 'Retro 70s',
    emoji: '🕺',
    bg: ['#F9EED3', '#F5E4BE', '#EFD9A8'],
    ink: '#4A3222',
    floor: '#E8D3AC',
    plinth: '#D6BC8C',
    wall: '#F4E7C6',
    wallPresets: ['#F4E7C6', '#F3D8B4', '#EBDDA4', '#EAD0BD'],
    grid: ['#D8BC8A', '#E6D2A6'],
    wood: '#A9713F',
    woodDark: '#8A5A30',
    secondary: '#E3CD9E',
    leaf: '#8FA65D',
    leafLight: '#B0C077',
    emissive: '#FFC46B',
    swatches: ['#E07A3F', '#E0A93F', '#9BA65D', '#C25E3A', '#F2E3C2', '#B5854F'],
    // groovy, muted abstract horizontal waves
    screen: { pattern: 'waves', bg: '#4A3222', colors: ['#E07A3F', '#E0A93F', '#9BA65D'] },
  },
  space: {
    name: 'space',
    label: 'Space Minimalist',
    emoji: '🌙',
    bg: ['#F6F6FB', '#EEF0F9', '#E3E6F4'],
    ink: '#3C3E4C',
    floor: '#EEEFF6',
    plinth: '#DCDFEC',
    wall: '#F8F8FC',
    wallPresets: ['#F8F8FC', '#ECEAF8', '#E2ECF8', '#EEEDF3'],
    grid: ['#CBCFE2', '#E0E3F0'],
    wood: '#C6C9D8',
    woodDark: '#5C5F6E',
    secondary: '#E6E8F2',
    leaf: '#9DBBAD',
    leafLight: '#BCD3C8',
    emissive: '#C9A0FF',
    swatches: ['#C9BFE8', '#B8CDEB', '#F4F5FA', '#7A7D8C', '#DCE0F2', '#AEB8E0'],
    // a calm neon-purple perspective grid
    screen: { pattern: 'grid', bg: '#1E1B2E', colors: ['#B27CFF', '#7C5CFF'] },
  },
};

export const THEME_LIST = Object.values(THEMES);