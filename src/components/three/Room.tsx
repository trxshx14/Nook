import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import { useNookStore } from '../../store/useNookStore';
import { THEMES } from '../../data/themes';
import { SNAP } from '../../lib/math';

/**
 * ─── PHASE 2 (v2): The Room ──────────────────────────────────────────────
 * Floor, snapping grid, and two back walls — all colors now read from the
 * active theme, so switching themes re-paints the architecture too.
 *
 * UX detail worth showing off: the walls fade to 12% opacity whenever the
 * camera swings behind them, so the view of the room is never blocked.
 */

const WALL_H = 2.4;
const WALL_T = 0.15;

export function Room() {
  const room = useNookStore((s) => s.room);
  const theme = useNookStore((s) => THEMES[s.currentTheme]);
  // "Wall Canvas": an explicit user paint wins; otherwise follow the theme
  const wallColor = useNookStore((s) => s.wallColor) ?? theme.wall;
  const select = useNookStore((s) => s.select);
  const wallBack = useRef<MeshStandardMaterial>(null); // at -Z
  const wallLeft = useRef<MeshStandardMaterial>(null); // at -X

  useFrame(({ camera }) => {
    if (wallBack.current)
      wallBack.current.opacity = camera.position.z < -room.depth / 2 ? 0.12 : 1;
    if (wallLeft.current)
      wallLeft.current.opacity = camera.position.x < -room.width / 2 ? 0.12 : 1;
  });

  const onFloorClick = (e: ThreeEvent<MouseEvent>) => {
    // e.delta = pixels traveled between down and up; a drag isn't a click
    if (e.delta <= 3) select(null);
  };

  const maxSide = Math.max(room.width, room.depth);

  return (
    <group>
      {/* floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow onClick={onFloorClick}>
        <boxGeometry args={[room.width, 0.2, room.depth]} />
        <meshStandardMaterial color={theme.floor} roughness={0.95} />
      </mesh>

      {/* plinth — the diorama base */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[room.width + 0.4, 0.22, room.depth + 0.4]} />
        <meshStandardMaterial color={theme.plinth} roughness={0.9} />
      </mesh>

      {/* the snapping grid; `args` include theme colors, so R3F rebuilds it
          automatically when the theme (and therefore args) change */}
      <gridHelper
        args={[maxSide, maxSide / SNAP, theme.grid[0], theme.grid[1]]}
        position={[0, 0.005, 0]}
        scale={[room.width / maxSide, 1, room.depth / maxSide]}
      />

      {/* back wall (-Z) */}
      <mesh position={[0, WALL_H / 2, -room.depth / 2 - WALL_T / 2]} receiveShadow>
        <boxGeometry args={[room.width + 0.3, WALL_H, WALL_T]} />
        <meshStandardMaterial ref={wallBack} color={wallColor} roughness={0.95} transparent />
      </mesh>

      {/* left wall (-X) */}
      <mesh position={[-room.width / 2 - WALL_T / 2, WALL_H / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_T, WALL_H, room.depth + 0.3]} />
        <meshStandardMaterial ref={wallLeft} color={wallColor} roughness={0.95} transparent />
      </mesh>

      {/* a soft round window on the back wall, glowing in the theme's light */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[room.width * 0.18, 1.5, -room.depth / 2 - WALL_T / 2]}
      >
        <cylinderGeometry args={[0.55, 0.55, WALL_T + 0.05, 32]} />
        <meshStandardMaterial
          color={theme.emissive}
          roughness={0.3}
          emissive={theme.emissive}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}