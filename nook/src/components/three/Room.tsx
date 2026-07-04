import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import { useNookStore } from '../../store/useNookStore';
import { SNAP } from '../../lib/math';

/**
 * ─── PHASE 2: The Room ───────────────────────────────────────────────────
 * Floor, a visible snapping grid, and two back walls. The floor doubles as
 * the "click empty space to deselect" target.
 *
 * UX detail worth showing off in interviews: the walls fade to 12% opacity
 * whenever the camera swings behind them, so the user's view of the room is
 * never blocked. That's a `useFrame` check against the camera position.
 */

const WALL_H = 2.4;
const WALL_T = 0.15;

export function Room() {
  const room = useNookStore((s) => s.room);
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
    // e.delta = pixels the pointer traveled between down and up.
    // A real click deselects; an orbit-drag that ends on the floor doesn't.
    if (e.delta <= 3) select(null);
  };

  const maxSide = Math.max(room.width, room.depth);

  return (
    <group>
      {/* floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow onClick={onFloorClick}>
        <boxGeometry args={[room.width, 0.2, room.depth]} />
        <meshStandardMaterial color="#F6E9D8" roughness={0.95} />
      </mesh>

      {/* plinth — a chunky base that makes the room read like a diorama */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[room.width + 0.4, 0.22, room.depth + 0.4]} />
        <meshStandardMaterial color="#EAD9C3" roughness={0.9} />
      </mesh>

      {/* the snapping grid, scaled to the room's footprint */}
      <gridHelper
        args={[maxSide, maxSide / SNAP, '#E8CDBA', '#F0E2D2']}
        position={[0, 0.005, 0]}
        scale={[room.width / maxSide, 1, room.depth / maxSide]}
      />

      {/* back wall (-Z) */}
      <mesh position={[0, WALL_H / 2, -room.depth / 2 - WALL_T / 2]} receiveShadow>
        <boxGeometry args={[room.width + 0.3, WALL_H, WALL_T]} />
        <meshStandardMaterial ref={wallBack} color="#FBF3E9" roughness={0.95} transparent />
      </mesh>

      {/* left wall (-X) */}
      <mesh position={[-room.width / 2 - WALL_T / 2, WALL_H / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_T, WALL_H, room.depth + 0.3]} />
        <meshStandardMaterial ref={wallLeft} color="#FBF3E9" roughness={0.95} transparent />
      </mesh>

      {/* a soft round window on the back wall */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[room.width * 0.18, 1.5, -room.depth / 2 - WALL_T / 2]}
      >
        <cylinderGeometry args={[0.55, 0.55, WALL_T + 0.05, 32]} />
        <meshStandardMaterial
          color="#BCD9F2"
          roughness={0.3}
          emissive="#9FC6E8"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}
