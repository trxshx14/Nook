/**
 * ─── PHASE 1: The Data Schema ────────────────────────────────────────────
 * The "source of truth" for the entire app. The 3D scene never owns data —
 * it is a pure rendering of this state.
 *
 * v3.1: the full 36-item catalog — the 15 new v3 pieces PLUS the restored
 * v2 collection — organized under six categories.
 */

export type FurnitureType =
  /* ── Seating & Comfort ── */
  | 'clover_armchair'
  | 'cloud_floor_pillow'
  | 'scalloped_bench'
  | 'cozy_loveseat'
  | 'cloud_accent_chair'
  | 'tulip_stool'
  | 'slouchy_beanbag'
  /* ── Surfaces & Workspaces ── */
  | 'flower_side_table'
  | 'l-shaped_craft_station'
  | 'tiered_console_table'
  | 'pebble_coffee_table'
  | 'study_desk'
  | 'floating_nightstand'
  | 'circular_dining_table'
  /* ── Shelving & Specialty Display ── */
  | 'honeycomb_wall_shelf'
  | 'vintage_magazine_rack'
  | 'glass_display_cabinet'
  | 'arched_bookshelf'
  | 'modular_cubes'
  | 'rattan_sideboard'
  | 'pegboard_panel'
  /* ── Media & Tech ── */
  | 'retro_television'
  /* ── Lighting & Ambience ── */
  | 'tulip_desk_lamp'
  | 'pleated_floor_lamp'
  | 'bunny_nightlight'
  | 'mushroom_table_lamp'
  | 'arc_floor_lamp'
  | 'paper_lantern'
  | 'starry_nightlight'
  /* ── Coziness & Greenery ── */
  | 'terrarium_pod'
  | 'heart_leaf_ivy'
  | 'fluffy_cloud_rug'
  | 'potted_monstera'
  | 'hanging_pothos'
  | 'wavy_floor_mirror'
  | 'plush_checkered_rug';

export type Category =
  | 'Seating & Comfort'
  | 'Surfaces & Workspaces'
  | 'Shelving & Specialty Display'
  | 'Media & Tech'
  | 'Lighting & Ambience'
  | 'Coziness & Greenery';

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