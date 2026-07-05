/**
 * ─── PHASE 1: The Data Schema ────────────────────────────────────────────
 * The "source of truth" for the entire app. The 3D scene never owns data —
 * it is a pure rendering of this state.
 *
 * v2: the catalog grew from 6 to 21 items across six categories, and a
 * ThemeName now lives alongside the room data.
 */

export type FurnitureType =
  // Seating
  | 'cozy_loveseat'
  | 'cloud_accent_chair'
  | 'tulip_stool'
  | 'slouchy_beanbag'
  // Surfaces
  | 'pebble_coffee_table'
  | 'study_desk'
  | 'floating_nightstand'
  | 'circular_dining_table'
  // Storage & Display
  | 'arched_bookshelf'
  | 'modular_cubes'
  | 'rattan_sideboard'
  | 'pegboard_panel'
  // Media & Tech
  | 'retro_television'
  // Lighting
  | 'mushroom_table_lamp'
  | 'arc_floor_lamp'
  | 'paper_lantern'
  | 'starry_nightlight'
  // Greenery & Decor
  | 'potted_monstera'
  | 'hanging_pothos'
  | 'wavy_floor_mirror'
  | 'plush_checkered_rug';

export type Category =
  | 'Seating'
  | 'Surfaces'
  | 'Storage & Display'
  | 'Media & Tech'
  | 'Lighting'
  | 'Greenery & Decor';

export type ThemeName = 'cottage' | 'retro70s' | 'space';

export interface PlacedItem {
  /** Unique identifier — used as the React key and for selection/dragging */
  id: string;
  /** Which catalog entry this item was spawned from */
  type: FurnitureType;
  /** [x, y, z] world coordinates. y is always 0 (items sit on the floor grid) */
  position: [number, number, number];
  /** Rotation around the Y (vertical) axis, in degrees */
  rotation: number;
  /** The user-chosen accent color for this item's "primary" tagged parts */
  color: string;
}

export interface RoomSize {
  width: number; // meters along X
  depth: number; // meters along Z
}
