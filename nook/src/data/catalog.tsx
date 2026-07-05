import { useMemo, type ReactElement } from 'react';
import { Color, DoubleSide, FrontSide, type Texture } from 'three';
import type { Category, FurnitureType } from '../types';
import type { Theme } from './themes';
import {
  makeCheckerTexture,
  makeDotsTexture,
  makeScreenTexture,
  makeWeaveTexture,
} from '../lib/textures';

/**
 * ─── PHASE 3 (v2): The Furniture Catalog — 21 items, 6 categories ────────
 * Every model is still built from cheap primitives, but materials are now
 * <meshPhysicalMaterial> and every part is "tagged" by WHICH color it reads:
 *
 *   color={color}            → primary   (the user's swatch pick)
 *   color={theme.wood}       → wood      (re-skins on theme change)
 *   color={theme.secondary}  → secondary
 *   color={theme.leaf}       → greenery
 *   e={theme.emissive}       → glow      (lamps, lanterns, nightlights)
 *
 * That tag→slot mapping IS the "Style Sheet" system: switching themes
 * rewrites one store field, and every tagged part across all 21 models
 * re-reads its slot on the next render.
 */

export const lighten = (hex: string, amt = 0.3) =>
  '#' + new Color(hex).lerp(new Color('#ffffff'), amt).getHexString();
export const darken = (hex: string, amt = 0.25) =>
  '#' + new Color(hex).lerp(new Color('#000000'), amt).getHexString();

/* ── tiny part helpers: keep 21 models readable ── */
type Xyz = [number, number, number];

interface MatOpts {
  c: string;
  rough?: number;
  metal?: number;
  clear?: number; // clearcoat, for glossy ceramics
  e?: string; // emissive color
  ei?: number; // emissive intensity
  map?: Texture;
  emap?: Texture;
  ds?: boolean; // double-sided
}
interface PartOpts extends MatOpts {
  p?: Xyz;
  r?: Xyz;
  s?: Xyz | number;
  noShadow?: boolean;
}

const Mat = (o: MatOpts) => (
  <meshPhysicalMaterial
    color={o.c}
    roughness={o.rough ?? 0.85}
    metalness={o.metal ?? 0}
    clearcoat={o.clear ?? 0}
    emissive={o.e ?? '#000000'}
    emissiveIntensity={o.ei ?? 0}
    map={o.map ?? null}
    emissiveMap={o.emap ?? null}
    side={o.ds ? DoubleSide : FrontSide}
  />
);

const Bx = ({ a, ...o }: { a: Xyz } & PartOpts) => (
  <mesh castShadow={!o.noShadow} receiveShadow position={o.p} rotation={o.r} scale={o.s}>
    <boxGeometry args={a} />
    <Mat {...o} />
  </mesh>
);
const Cy = ({ a, ...o }: { a: ConstructorParameters<typeof import('three').CylinderGeometry> } & PartOpts) => (
  <mesh castShadow={!o.noShadow} receiveShadow position={o.p} rotation={o.r} scale={o.s}>
    <cylinderGeometry args={a} />
    <Mat {...o} />
  </mesh>
);
const Sp = ({ a, ...o }: { a: ConstructorParameters<typeof import('three').SphereGeometry> } & PartOpts) => (
  <mesh castShadow={!o.noShadow} receiveShadow position={o.p} rotation={o.r} scale={o.s}>
    <sphereGeometry args={a} />
    <Mat {...o} />
  </mesh>
);
const Tr = ({ a, ...o }: { a: ConstructorParameters<typeof import('three').TorusGeometry> } & PartOpts) => (
  <mesh castShadow={!o.noShadow} receiveShadow position={o.p} rotation={o.r} scale={o.s}>
    <torusGeometry args={a} />
    <Mat {...o} />
  </mesh>
);

interface ModelProps {
  color: string;
  theme: Theme;
}

/* ════════════════════════ SEATING ════════════════════════ */

function CozyLoveseat({ color, theme }: ModelProps) {
  const light = lighten(color);
  return (
    <group>
      <Bx a={[1.7, 0.42, 0.9]} p={[0, 0.28, 0]} c={color} />
      {/* rounded backrest = a horizontal cylinder atop a slab */}
      <Cy a={[0.24, 0.24, 1.7, 20]} r={[0, 0, Math.PI / 2]} p={[0, 0.72, -0.32]} c={color} />
      <Bx a={[1.7, 0.42, 0.24]} p={[0, 0.5, -0.32]} c={color} />
      {/* plump cylinder arms */}
      {[-0.78, 0.78].map((x) => (
        <Cy key={x} a={[0.16, 0.16, 0.86, 16]} r={[Math.PI / 2, 0, 0]} p={[x, 0.6, 0]} c={color} />
      ))}
      {[-0.4, 0.4].map((x) => (
        <Bx key={x} a={[0.72, 0.18, 0.72]} p={[x, 0.56, 0.04]} c={light} />
      ))}
      {[-0.7, 0.7].flatMap((x) =>
        [-0.34, 0.34].map((z) => (
          <Cy key={`${x}${z}`} a={[0.045, 0.045, 0.16, 10]} p={[x, 0.08, z]} c={theme.woodDark} />
        )),
      )}
    </group>
  );
}

function CloudAccentChair({ color, theme }: ModelProps) {
  const light = lighten(color, 0.2);
  return (
    <group>
      {/* puffy organic blobs */}
      <Sp a={[0.42, 20, 16]} p={[0, 0.4, 0]} s={[1.1, 0.7, 1]} c={color} />
      <Sp a={[0.4, 20, 16]} p={[0, 0.72, -0.28]} s={[1.05, 1, 0.6]} c={light} />
      {[-0.42, 0.42].map((x) => (
        <Sp key={x} a={[0.2, 16, 12]} p={[x, 0.5, 0.05]} s={[0.8, 1, 1.4]} c={light} />
      ))}
      <Cy a={[0.3, 0.34, 0.16, 20]} p={[0, 0.1, 0]} c={theme.secondary} />
    </group>
  );
}

function TulipStool({ color, theme }: ModelProps) {
  return (
    <group>
      <Cy a={[0.09, 0.16, 0.34, 14]} p={[0, 0.17, 0]} c={theme.woodDark} />
      <Cy a={[0.2, 0.09, 0.1, 16]} p={[0, 0.38, 0]} c={theme.wood} />
      {/* the flower: a squashed center + five petal spheres */}
      <Sp a={[0.19, 16, 12]} p={[0, 0.5, 0]} s={[1, 0.55, 1]} c={lighten(color, 0.15)} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <Sp
            key={i}
            a={[0.13, 14, 10]}
            p={[Math.cos(a) * 0.19, 0.52, Math.sin(a) * 0.19]}
            s={[1, 0.5, 1]}
            c={color}
          />
        );
      })}
    </group>
  );
}

function SlouchyBeanbag({ color }: ModelProps) {
  return (
    <group>
      <Sp a={[0.5, 22, 16]} p={[0, 0.3, 0]} s={[1.1, 0.62, 1.1]} c={color} />
      <Sp a={[0.34, 20, 14]} p={[0, 0.5, -0.08]} s={[1, 0.6, 1]} c={lighten(color, 0.18)} />
    </group>
  );
}

/* ════════════════════════ SURFACES ════════════════════════ */

function PebbleCoffeeTable({ color, theme }: ModelProps) {
  return (
    <group>
      {/* asymmetric pebble = a squashed, unevenly scaled sphere */}
      <Sp a={[0.72, 26, 18]} p={[0.05, 0.36, 0]} s={[1.15, 0.13, 0.8]} c={color} clear={0.4} rough={0.5} />
      {(
        [
          [-0.45, -0.28],
          [0.5, -0.22],
          [0.05, 0.34],
        ] as const
      ).map(([x, z], i) => (
        <Cy key={i} a={[0.055, 0.065, 0.32, 12]} p={[x, 0.16, z]} c={theme.woodDark} />
      ))}
    </group>
  );
}

function StudyDesk({ color, theme }: ModelProps) {
  return (
    <group>
      <Bx a={[1.5, 0.07, 0.7]} p={[0, 0.72, 0]} c={theme.wood} />
      {/* drawer pod on the right */}
      <Bx a={[0.42, 0.56, 0.62]} p={[0.5, 0.42, 0]} c={color} />
      {[0.55, 0.3].map((y) => (
        <Bx key={y} a={[0.34, 0.18, 0.03]} p={[0.5, y, 0.32]} c={lighten(color, 0.25)} />
      ))}
      {[0.55, 0.3].map((y) => (
        <Sp key={y} a={[0.028, 10, 8]} p={[0.5, y, 0.35]} c={theme.woodDark} />
      ))}
      {/* legs on the open side */}
      {[-0.3, 0.28].map((z) => (
        <Cy key={z} a={[0.035, 0.035, 0.7, 10]} p={[-0.68, 0.36, z]} c={theme.woodDark} />
      ))}
    </group>
  );
}

function FloatingNightstand({ color, theme }: ModelProps) {
  return (
    <group>
      <Bx a={[0.6, 0.4, 0.5]} p={[0, 0.5, 0]} c={color} />
      <Bx a={[0.5, 0.22, 0.03]} p={[0, 0.5, 0.26]} c={lighten(color, 0.25)} />
      <Sp a={[0.035, 12, 8]} p={[0, 0.5, 0.29]} c={theme.woodDark} />
      <Bx a={[0.64, 0.05, 0.54]} p={[0, 0.73, 0]} c={theme.wood} />
      {/* slim rear legs make it read as "floating" */}
      {[-0.24, 0.24].map((x) => (
        <Cy key={x} a={[0.02, 0.02, 0.3, 8]} p={[x, 0.15, -0.18]} c={theme.woodDark} />
      ))}
    </group>
  );
}

function CircularDiningTable({ color, theme }: ModelProps) {
  return (
    <group>
      <Cy a={[0.78, 0.78, 0.07, 36]} p={[0, 0.74, 0]} c={theme.wood} />
      <Cy a={[0.78, 0.78, 0.025, 36]} p={[0, 0.785, 0]} c={lighten(color, 0.1)} />
      <Cy a={[0.08, 0.11, 0.68, 14]} p={[0, 0.38, 0]} c={theme.woodDark} />
      <Cy a={[0.32, 0.38, 0.07, 24]} p={[0, 0.035, 0]} c={theme.woodDark} />
    </group>
  );
}

/* ═══════════════════ STORAGE & DISPLAY ═══════════════════ */

function ArchedBookshelf({ color, theme }: ModelProps) {
  const books = ['#E28C8C', '#8CB8E2', '#E2CE8C', '#9CD1A8', '#C7A8E0'];
  return (
    <group>
      {[-0.5, 0.5].map((x) => (
        <Bx key={x} a={[0.08, 1.7, 0.42]} p={[x, 0.85, 0]} c={color} />
      ))}
      {/* arched crown = a half-cylinder laid on its side */}
      <Cy
        a={[0.54, 0.54, 0.42, 24, 1, false, -Math.PI / 2, Math.PI]}
        r={[Math.PI / 2, 0, 0]}
        p={[0, 1.7, 0]}
        c={color}
      />
      <Bx a={[1.08, 0.06, 0.42]} p={[0, 1.68, 0]} c={color} />
      <Bx a={[0.92, 1.62, 0.04]} p={[0, 0.84, -0.17]} c={theme.secondary} />
      {[0.35, 0.85, 1.35].map((y) => (
        <Bx key={y} a={[0.92, 0.05, 0.38]} p={[0, y, 0]} c={theme.wood} />
      ))}
      {/* a few leaning books per shelf */}
      {[0.35, 0.85, 1.35].flatMap((y, row) =>
        books.slice(0, 4 - row).map((c, i) => (
          <Bx
            key={`${y}${i}`}
            a={[0.09, 0.3, 0.24]}
            p={[-0.3 + i * 0.13 + row * 0.06, y + 0.18, 0]}
            r={[0, 0, (i % 2) * 0.08]}
            c={c}
          />
        )),
      )}
    </group>
  );
}

function ModularCubes({ color, theme }: ModelProps) {
  const cells: Xyz[] = [
    [-0.28, 0.28, 0],
    [0.28, 0.28, 0],
    [-0.28, 0.84, 0],
    [0.28, 0.84, 0],
  ];
  return (
    <group>
      <Bx a={[1.16, 1.16, 0.4]} p={[0, 0.58, -0.02]} c={color} />
      {/* dark insets suggest open cube mouths */}
      {cells.map((p, i) => (
        <Bx key={i} a={[0.44, 0.44, 0.04]} p={[p[0], p[1], 0.18]} c={darken(theme.secondary, 0.35)} />
      ))}
      {/* one cube holds a tiny plant, one a box */}
      <Sp a={[0.1, 12, 10]} p={[-0.28, 0.36, 0.14]} c={theme.leaf} />
      <Bx a={[0.2, 0.16, 0.16]} p={[0.28, 0.78, 0.14]} c={theme.wood} />
    </group>
  );
}

function RattanSideboard({ color, theme }: ModelProps) {
  const weave = useMemo(
    () => makeWeaveTexture(lighten(theme.wood, 0.2), theme.woodDark),
    [theme],
  );
  return (
    <group>
      <Bx a={[1.7, 0.6, 0.5]} p={[0, 0.45, 0]} c={color} />
      {/* woven grid doors */}
      {[-0.42, 0.42].map((x) => (
        <Bx key={x} a={[0.74, 0.48, 0.03]} p={[x, 0.45, 0.26]} c="#ffffff" map={weave} />
      ))}
      <Bx a={[1.76, 0.06, 0.56]} p={[0, 0.78, 0]} c={theme.wood} />
      {[-0.75, 0.75].map((x) => (
        <Cy key={x} a={[0.035, 0.045, 0.3, 10]} p={[x, 0.15, 0]} c={theme.woodDark} />
      ))}
    </group>
  );
}

function PegboardPanel({ color, theme }: ModelProps) {
  const dots = useMemo(() => makeDotsTexture(lighten(color, 0.1), darken(color, 0.3)), [color]);
  return (
    <group>
      <Bx a={[1.1, 1.3, 0.06]} p={[0, 1.15, 0]} c="#ffffff" map={dots} />
      <Bx a={[1.16, 1.36, 0.03]} p={[0, 1.15, -0.04]} c={theme.wood} />
      {/* A-frame stand */}
      {[-0.4, 0.4].map((x) => (
        <Bx key={x} a={[0.06, 0.06, 0.5]} p={[x, 0.03, 0.1]} c={theme.woodDark} />
      ))}
      {[-0.4, 0.4].map((x) => (
        <Cy key={x} a={[0.03, 0.03, 1.0, 8]} p={[x, 0.5, 0]} c={theme.woodDark} />
      ))}
      {/* little shelf + a hanging hook prop */}
      <Bx a={[0.5, 0.04, 0.16]} p={[-0.2, 1.35, 0.12]} c={theme.wood} />
      <Sp a={[0.06, 10, 8]} p={[-0.3, 1.43, 0.12]} c={theme.leaf} />
      <Tr a={[0.07, 0.02, 8, 16]} p={[0.3, 1.0, 0.05]} c={theme.woodDark} />
    </group>
  );
}

/* ═══════════════════════ MEDIA & TECH ═══════════════════════ */

function RetroTelevision({ color, theme }: ModelProps) {
  // the screen's emissive glow map is a per-theme procedural CanvasTexture
  const screen = useMemo(() => makeScreenTexture(theme.screen), [theme]);
  return (
    <group>
      <Bx a={[0.9, 0.66, 0.5]} p={[0, 0.55, 0]} c={color} clear={0.5} rough={0.45} />
      <Bx
        a={[0.62, 0.46, 0.03]}
        p={[-0.06, 0.56, 0.26]}
        c="#111111"
        map={screen}
        emap={screen}
        e="#ffffff"
        ei={0.9}
        rough={0.35}
      />
      {/* dials */}
      {[0.42, 0.68].map((y) => (
        <Cy
          key={y}
          a={[0.045, 0.045, 0.04, 12]}
          r={[Math.PI / 2, 0, 0]}
          p={[0.34, y, 0.26]}
          c={theme.secondary}
        />
      ))}
      {/* rabbit-ear antennas */}
      {[-0.35, 0.35].map((tilt) => (
        <group key={tilt} position={[0, 0.88, 0]} rotation={[0, 0, tilt]}>
          <Cy a={[0.012, 0.012, 0.5, 8]} p={[0, 0.25, 0]} c={theme.woodDark} metal={0.6} rough={0.4} />
          <Sp a={[0.03, 10, 8]} p={[0, 0.5, 0]} c={theme.woodDark} />
        </group>
      ))}
      {[-0.32, 0.32].map((x) => (
        <Cy key={x} a={[0.05, 0.06, 0.22, 10]} p={[x, 0.11, 0]} c={theme.woodDark} />
      ))}
    </group>
  );
}

/* ════════════════════════ LIGHTING ════════════════════════ */

function MushroomTableLamp({ color, theme }: ModelProps) {
  return (
    <group>
      <Cy a={[0.16, 0.2, 0.08, 18]} p={[0, 0.04, 0]} c={theme.secondary} />
      <Cy a={[0.06, 0.08, 0.34, 12]} p={[0, 0.25, 0]} c={lighten(color, 0.2)} clear={0.8} rough={0.3} />
      {/* glossy dome cap = a hemisphere */}
      <Sp
        a={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
        p={[0, 0.42, 0]}
        c={color}
        clear={0.9}
        rough={0.25}
        e={theme.emissive}
        ei={0.25}
        ds
      />
      <Sp a={[0.09, 12, 10]} p={[0, 0.4, 0]} c={theme.emissive} e={theme.emissive} ei={1.4} />
    </group>
  );
}

function ArcFloorLamp({ color, theme }: ModelProps) {
  return (
    <group>
      <Cy a={[0.22, 0.26, 0.08, 20]} p={[0, 0.04, 0]} c={theme.woodDark} metal={0.4} rough={0.5} />
      <Cy a={[0.025, 0.025, 1.4, 8]} p={[-0.3, 0.75, 0]} c={theme.woodDark} metal={0.5} rough={0.4} />
      {/* the sweeping arc = a quarter torus */}
      <Tr
        a={[0.55, 0.025, 8, 24, Math.PI / 2]}
        p={[0.25, 1.45, 0]}
        c={theme.woodDark}
        metal={0.5}
        rough={0.4}
      />
      {/* hanging dome shade at the arc's tip */}
      <Sp
        a={[0.2, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]}
        p={[0.8, 1.42, 0]}
        r={[Math.PI, 0, 0]}
        c={color}
        clear={0.5}
        ds
      />
      <Sp a={[0.08, 12, 10]} p={[0.8, 1.38, 0]} c={theme.emissive} e={theme.emissive} ei={1.5} />
    </group>
  );
}

function PaperLantern({ color, theme }: ModelProps) {
  return (
    <group>
      {/* cord from the ceiling */}
      <Cy a={[0.012, 0.012, 0.5, 6]} p={[0, 2.15, 0]} c={theme.woodDark} noShadow />
      <Sp
        a={[0.3, 24, 18]}
        p={[0, 1.72, 0]}
        s={[1, 1.15, 1]}
        c={lighten(color, 0.2)}
        e={theme.emissive}
        ei={0.6}
        rough={0.9}
      />
      {/* horizontal paper ribs */}
      {[1.52, 1.66, 1.8, 1.94].map((y, i) => (
        <Tr
          key={y}
          a={[[0.21, 0.28, 0.28, 0.21][i], 0.008, 6, 24]}
          r={[Math.PI / 2, 0, 0]}
          p={[0, y, 0]}
          c={color}
          noShadow
        />
      ))}
    </group>
  );
}

function StarryNightlight({ color, theme }: ModelProps) {
  return (
    <group>
      <Bx a={[0.16, 0.2, 0.08]} p={[0, 0.24, 0]} c={lighten(color, 0.2)} clear={0.6} rough={0.35} />
      <Cy a={[0.03, 0.03, 0.26, 8]} p={[0, 0.08, 0]} c={theme.secondary} />
      {/* the star = two crossed emissive bars + a core */}
      <Bx a={[0.16, 0.05, 0.04]} p={[0, 0.42, 0]} c={theme.emissive} e={theme.emissive} ei={1.6} noShadow />
      <Bx a={[0.05, 0.16, 0.04]} p={[0, 0.42, 0]} c={theme.emissive} e={theme.emissive} ei={1.6} noShadow />
      <Sp a={[0.045, 10, 8]} p={[0, 0.42, 0]} c={theme.emissive} e={theme.emissive} ei={1.8} noShadow />
    </group>
  );
}

/* ═══════════════════ GREENERY & DECOR ═══════════════════ */

function PottedMonstera({ color, theme }: ModelProps) {
  const leaves: { p: Xyz; r: Xyz }[] = [
    { p: [0.28, 1.0, 0.1], r: [0.4, 0.3, -0.5] },
    { p: [-0.3, 1.1, 0.05], r: [0.3, -0.4, 0.55] },
    { p: [0.05, 1.25, -0.25], r: [-0.5, 0.2, 0.1] },
    { p: [0.1, 0.85, 0.3], r: [0.7, 0, -0.15] },
  ];
  return (
    <group>
      <Cy a={[0.26, 0.19, 0.4, 20]} p={[0, 0.2, 0]} c={color} clear={0.6} rough={0.4} />
      <Cy a={[0.24, 0.24, 0.04, 20]} p={[0, 0.42, 0]} c={darken(theme.wood, 0.3)} />
      {leaves.map((l, i) => (
        <group key={i}>
          <Cy
            a={[0.015, 0.02, 0.6, 6]}
            p={[l.p[0] * 0.5, 0.65, l.p[2] * 0.5]}
            r={[l.r[0] * 0.4, 0, l.r[2] * 0.4]}
            c={theme.leaf}
          />
          {/* big split leaf = a flattened sphere; the "split" is a darker notch wedge */}
          <Sp a={[0.26, 18, 12]} p={l.p} r={l.r} s={[1, 0.06, 0.8]} c={i % 2 ? theme.leaf : theme.leafLight} ds />
          <Bx a={[0.1, 0.03, 0.14]} p={[l.p[0], l.p[1], l.p[2] + 0.16]} r={l.r} c={darken(theme.leaf, 0.2)} noShadow />
        </group>
      ))}
    </group>
  );
}

function HangingPothos({ color, theme }: ModelProps) {
  const vines = [
    { x: -0.18, z: 0.08, n: 6 },
    { x: 0.05, z: 0.14, n: 8 },
    { x: 0.2, z: -0.05, n: 5 },
  ];
  return (
    <group>
      <Bx a={[0.7, 0.05, 0.35]} p={[0, 1.6, 0]} c={theme.wood} />
      {[-0.28, 0.28].map((x) => (
        <Bx key={x} a={[0.05, 0.35, 0.05]} p={[x, 1.8, -0.14]} c={theme.woodDark} />
      ))}
      <Cy a={[0.16, 0.12, 0.22, 16]} p={[0, 1.73, 0.02]} c={color} clear={0.6} rough={0.4} />
      {/* cascading vines: chains of shrinking leaf-spheres */}
      {vines.flatMap((v, vi) =>
        Array.from({ length: v.n }).map((_, i) => (
          <Sp
            key={`${vi}-${i}`}
            a={[0.075 - i * 0.005, 10, 8]}
            p={[v.x + Math.sin(i * 1.3 + vi) * 0.07, 1.66 - i * 0.14, v.z + Math.cos(i * 0.9) * 0.05]}
            s={[1, 0.75, 1]}
            c={i % 2 ? theme.leaf : theme.leafLight}
            noShadow
          />
        )),
      )}
    </group>
  );
}

function WavyFloorMirror({ color }: ModelProps) {
  const scallops = 7;
  return (
    <group rotation={[-0.08, 0, 0]}>
      <Bx a={[0.8, 1.7, 0.05]} p={[0, 0.9, -0.01]} c={color} />
      {/* the "glass": high metalness + low roughness catches the light */}
      <Bx a={[0.62, 1.5, 0.02]} p={[0, 0.9, 0.03]} c="#D7E2EE" metal={1} rough={0.08} />
      {/* wavy ribbon frame = scalloped rows of spheres */}
      {Array.from({ length: scallops }).flatMap((_, i) => {
        const y = 0.18 + (i / (scallops - 1)) * 1.44;
        return [-0.4, 0.4].map((x) => (
          <Sp key={`s${i}${x}`} a={[0.07, 12, 10]} p={[x, y, 0.01]} c={lighten(color, 0.15)} />
        ));
      })}
      {Array.from({ length: 5 }).flatMap((_, i) => {
        const x = -0.32 + i * 0.16;
        return [0.12, 1.68].map((y) => (
          <Sp key={`t${i}${y}`} a={[0.07, 12, 10]} p={[x, y, 0.01]} c={lighten(color, 0.15)} />
        ));
      })}
    </group>
  );
}

function PlushCheckeredRug({ color }: ModelProps) {
  const checker = useMemo(() => makeCheckerTexture(lighten(color, 0.35), color), [color]);
  return (
    <group>
      <Bx a={[2.4, 0.05, 1.6]} p={[0, 0.028, 0]} c="#ffffff" map={checker} rough={0.95} noShadow />
      <Bx a={[2.5, 0.03, 1.7]} p={[0, 0.012, 0]} c={darken(color, 0.12)} rough={0.95} noShadow />
    </group>
  );
}

/* ════════════════════════ REGISTRY ════════════════════════ */

export interface CatalogEntry {
  name: string;
  emoji: string;
  category: Category;
  /** which theme swatch index a fresh spawn uses as its primary color */
  swatch: number;
  /** Half-extents of the footprint [x, z] — wall clamping + selection ring */
  half: [number, number];
  /** must the Cat Tracker walk around this? (rugs / hanging / flat = no) */
  obstacle: boolean;
  Model: (props: ModelProps) => ReactElement;
}

export const CATALOG: Record<FurnitureType, CatalogEntry> = {
  /* Seating */
  cozy_loveseat:         { name: 'Cozy Loveseat',  emoji: '🛋️', category: 'Seating',           swatch: 0, half: [0.95, 0.5],  obstacle: true,  Model: CozyLoveseat },
  cloud_accent_chair:    { name: 'Cloud Chair',    emoji: '☁️', category: 'Seating',           swatch: 1, half: [0.5, 0.5],   obstacle: true,  Model: CloudAccentChair },
  tulip_stool:           { name: 'Tulip Stool',    emoji: '🌷', category: 'Seating',           swatch: 0, half: [0.3, 0.3],   obstacle: true,  Model: TulipStool },
  slouchy_beanbag:       { name: 'Beanbag',        emoji: '🫘', category: 'Seating',           swatch: 2, half: [0.58, 0.58], obstacle: true,  Model: SlouchyBeanbag },
  /* Surfaces */
  pebble_coffee_table:   { name: 'Pebble Table',   emoji: '🪨', category: 'Surfaces',          swatch: 4, half: [0.85, 0.6],  obstacle: true,  Model: PebbleCoffeeTable },
  study_desk:            { name: 'Study Desk',     emoji: '📚', category: 'Surfaces',          swatch: 1, half: [0.78, 0.4],  obstacle: true,  Model: StudyDesk },
  floating_nightstand:   { name: 'Nightstand',     emoji: '🌛', category: 'Surfaces',          swatch: 3, half: [0.35, 0.3],  obstacle: true,  Model: FloatingNightstand },
  circular_dining_table: { name: 'Bistro Table',   emoji: '🍽️', category: 'Surfaces',          swatch: 4, half: [0.8, 0.8],   obstacle: true,  Model: CircularDiningTable },
  /* Storage & Display */
  arched_bookshelf:      { name: 'Arched Shelf',   emoji: '🏛️', category: 'Storage & Display', swatch: 2, half: [0.58, 0.25], obstacle: true,  Model: ArchedBookshelf },
  modular_cubes:         { name: 'Cube Grid',      emoji: '🧊', category: 'Storage & Display', swatch: 5, half: [0.6, 0.22],  obstacle: true,  Model: ModularCubes },
  rattan_sideboard:      { name: 'Sideboard',      emoji: '🧺', category: 'Storage & Display', swatch: 4, half: [0.88, 0.3],  obstacle: true,  Model: RattanSideboard },
  pegboard_panel:        { name: 'Pegboard',       emoji: '📌', category: 'Storage & Display', swatch: 1, half: [0.58, 0.28], obstacle: false, Model: PegboardPanel },
  /* Media & Tech */
  retro_television:      { name: 'Retro TV',       emoji: '📺', category: 'Media & Tech',      swatch: 3, half: [0.48, 0.3],  obstacle: true,  Model: RetroTelevision },
  /* Lighting */
  mushroom_table_lamp:   { name: 'Mushroom Lamp',  emoji: '🍄', category: 'Lighting',          swatch: 0, half: [0.28, 0.28], obstacle: true,  Model: MushroomTableLamp },
  arc_floor_lamp:        { name: 'Arc Lamp',       emoji: '🎣', category: 'Lighting',          swatch: 3, half: [0.3, 0.3],   obstacle: true,  Model: ArcFloorLamp },
  paper_lantern:         { name: 'Paper Lantern',  emoji: '🏮', category: 'Lighting',          swatch: 2, half: [0.32, 0.32], obstacle: false, Model: PaperLantern },
  starry_nightlight:     { name: 'Nightlight',     emoji: '⭐', category: 'Lighting',          swatch: 1, half: [0.15, 0.12], obstacle: false, Model: StarryNightlight },
  /* Greenery & Decor */
  potted_monstera:       { name: 'Monstera',       emoji: '🪴', category: 'Greenery & Decor',  swatch: 4, half: [0.42, 0.42], obstacle: true,  Model: PottedMonstera },
  hanging_pothos:        { name: 'Hanging Pothos', emoji: '🌿', category: 'Greenery & Decor',  swatch: 0, half: [0.38, 0.2],  obstacle: false, Model: HangingPothos },
  wavy_floor_mirror:     { name: 'Wavy Mirror',    emoji: '🪞', category: 'Greenery & Decor',  swatch: 5, half: [0.45, 0.18], obstacle: true,  Model: WavyFloorMirror },
  plush_checkered_rug:   { name: 'Checkered Rug',  emoji: '🧶', category: 'Greenery & Decor',  swatch: 1, half: [1.25, 0.85], obstacle: false, Model: PlushCheckeredRug },
};

export const ALL_TYPES = Object.keys(CATALOG) as FurnitureType[];

export const CATEGORIES: Category[] = [
  'Seating',
  'Surfaces',
  'Storage & Display',
  'Media & Tech',
  'Lighting',
  'Greenery & Decor',
];

/** Sidebar helper: [{ category, items: [{ type, ...entry }] }] */
export const CATALOG_BY_CATEGORY = CATEGORIES.map((category) => ({
  category,
  items: ALL_TYPES.filter((t) => CATALOG[t].category === category).map((type) => ({
    type,
    ...CATALOG[type],
  })),
}));
