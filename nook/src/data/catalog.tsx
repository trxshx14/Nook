import { useMemo, type ReactElement } from 'react';
import { Color, DoubleSide } from 'three';
import type { FurnitureType } from '../types';

/**
 * ─── PHASE 3: The Furniture Catalog ──────────────────────────────────────
 * Every furniture piece is built from cheap primitives (boxes, cylinders,
 * spheres) instead of downloaded models. This keeps the bundle tiny, makes
 * recoloring trivial, and gives everything a cohesive toy-like style.
 *
 * Swapping a `Model` component for a GLTF loaded with drei's useGLTF later
 * requires zero changes anywhere else in the app — a great stretch goal.
 */

export const PASTELS = ['#F5B8C4', '#BFE3CD', '#F7E3A9', '#BCD9F2', '#D8C7F0', '#FBEFE2'];

const WOOD = '#C9A47E';
const WOOD_DARK = '#B08A63';

const lighten = (hex: string, amt = 0.3) =>
  '#' + new Color(hex).lerp(new Color('#ffffff'), amt).getHexString();

interface ModelProps {
  color: string;
}

export interface CatalogEntry {
  name: string;
  emoji: string;
  defaultColor: string;
  /** Half-extents of the footprint [x, z] — used for wall clamping and the selection ring */
  half: [number, number];
  Model: (props: ModelProps) => ReactElement;
}

/* Shared material props for the soft, matte "toy" look */
const matte = { roughness: 0.85 };

function Sofa({ color }: ModelProps) {
  const light = useMemo(() => lighten(color), [color]);
  return (
    <group>
      {/* base */}
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[2.2, 0.45, 1]} />
        <meshStandardMaterial color={color} {...matte} />
      </mesh>
      {/* backrest */}
      <mesh castShadow receiveShadow position={[0, 0.75, -0.36]}>
        <boxGeometry args={[2.2, 0.65, 0.28]} />
        <meshStandardMaterial color={color} {...matte} />
      </mesh>
      {/* armrests */}
      {[-0.96, 0.96].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.62, 0]}>
          <boxGeometry args={[0.28, 0.62, 1]} />
          <meshStandardMaterial color={color} {...matte} />
        </mesh>
      ))}
      {/* cushions in a lighter tint */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.58, 0.02]}>
          <boxGeometry args={[0.78, 0.2, 0.8]} />
          <meshStandardMaterial color={light} {...matte} />
        </mesh>
      ))}
      {/* little wooden feet */}
      {[-0.9, 0.9].flatMap((x) =>
        [-0.38, 0.38].map((z) => (
          <mesh key={`${x}:${z}`} castShadow position={[x, 0.07, z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
            <meshStandardMaterial color={WOOD_DARK} {...matte} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Chair({ color }: ModelProps) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.6]} />
        <meshStandardMaterial color={color} {...matte} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.85, -0.25]}>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial color={color} {...matte} />
      </mesh>
      {[-0.24, 0.24].flatMap((x) =>
        [-0.24, 0.24].map((z) => (
          <mesh key={`${x}:${z}`} castShadow position={[x, 0.21, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.42, 10]} />
            <meshStandardMaterial color={WOOD} {...matte} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Table({ color }: ModelProps) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.08, 32]} />
        <meshStandardMaterial color={color} {...matte} />
      </mesh>
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.68, 14]} />
        <meshStandardMaterial color={WOOD} {...matte} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.06, 20]} />
        <meshStandardMaterial color={WOOD_DARK} {...matte} />
      </mesh>
    </group>
  );
}

function Plant({ color }: ModelProps) {
  return (
    <group>
      {/* pot — the recolorable part */}
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.32, 20]} />
        <meshStandardMaterial color={color} {...matte} />
      </mesh>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#8A6B4F" {...matte} />
      </mesh>
      {/* three overlapping spheres read as a bushy plant */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.3, 16, 14]} />
        <meshStandardMaterial color="#8FC9A0" {...matte} />
      </mesh>
      <mesh castShadow position={[0.2, 0.68, 0.1]}>
        <sphereGeometry args={[0.2, 16, 14]} />
        <meshStandardMaterial color="#A6D7B4" {...matte} />
      </mesh>
      <mesh castShadow position={[-0.18, 0.7, -0.08]}>
        <sphereGeometry args={[0.17, 16, 14]} />
        <meshStandardMaterial color="#7FBF92" {...matte} />
      </mesh>
    </group>
  );
}

function Lamp({ color }: ModelProps) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.06, 20]} />
        <meshStandardMaterial color={WOOD_DARK} {...matte} />
      </mesh>
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 10]} />
        <meshStandardMaterial color={WOOD} {...matte} />
      </mesh>
      {/* the shade glows softly via emissive */}
      <mesh castShadow position={[0, 1.28, 0]}>
        <coneGeometry args={[0.3, 0.36, 24, 1, true]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          emissive={color}
          emissiveIntensity={0.35}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Rug({ color }: ModelProps) {
  const light = useMemo(() => lighten(color, 0.35), [color]);
  return (
    <group>
      {/* scaling z turns the circles into soft ovals */}
      <mesh receiveShadow position={[0, 0.018, 0]} scale={[1, 1, 0.7]}>
        <cylinderGeometry args={[1.3, 1.3, 0.035, 40]} />
        <meshStandardMaterial color={color} {...matte} />
      </mesh>
      <mesh receiveShadow position={[0, 0.02, 0]} scale={[1, 1, 0.7]}>
        <cylinderGeometry args={[0.9, 0.9, 0.04, 40]} />
        <meshStandardMaterial color={light} {...matte} />
      </mesh>
    </group>
  );
}

export const CATALOG: Record<FurnitureType, CatalogEntry> = {
  sofa: { name: 'Sofa', emoji: '🛋️', defaultColor: '#F5B8C4', half: [1.15, 0.55], Model: Sofa },
  chair: { name: 'Chair', emoji: '🪑', defaultColor: '#BFE3CD', half: [0.35, 0.35], Model: Chair },
  table: { name: 'Table', emoji: '🍽️', defaultColor: '#F7E3A9', half: [0.75, 0.75], Model: Table },
  plant: { name: 'Plant', emoji: '🪴', defaultColor: '#F5B8C4', half: [0.3, 0.3], Model: Plant },
  lamp: { name: 'Lamp', emoji: '💡', defaultColor: '#BCD9F2', half: [0.3, 0.3], Model: Lamp },
  rug: { name: 'Rug', emoji: '🧶', defaultColor: '#D8C7F0', half: [1.3, 0.9], Model: Rug },
};

export const CATALOG_LIST = (Object.keys(CATALOG) as FurnitureType[]).map((type) => ({
  type,
  ...CATALOG[type],
}));
