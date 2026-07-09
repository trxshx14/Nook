import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, MathUtils, Vector3 } from 'three';
import { useNookStore } from '../../store/useNookStore';
import { CATALOG } from '../../data/catalog';
import { snap } from '../../lib/math';

/**
 * ─── v2: The Cat Tracker — a tiny pathfinding agent ─────────────────────
 * A resident cat that wanders the floor grid. Every few seconds it picks a
 * random empty cell as its destination, but BEFORE walking it consults the
 * same `placedItems` array that renders the furniture:
 *
 *   1. Is the destination cell inside any obstacle's footprint? → blocked
 *   2. Does the straight line to it pass through any footprint?  → blocked
 *      (line-of-sight = sampling points every 20cm along the segment and
 *      testing each against the obstacle AABBs, inflated by the cat's
 *      radius so it doesn't clip corners)
 *
 * When blocked, the cat sits down, `isBlocked` flips true, and a floating
 * <Html> bubble fades in above its head. This is the recruiter-facing
 * proof that the furniture array is real, queryable application data — an
 * autonomous agent is literally navigating your interior design decisions.
 *
 * All continuous motion lives in refs + useFrame; React state is only
 * touched for the ONE thing the DOM needs to know (isBlocked).
 */

type Mode = 'idle' | 'walk' | 'sit';

const CAT_RADIUS = 0.26; // inflate obstacles by this so the cat keeps clearance
const SPEED = 1.1; // m/s
const LOS_STEP = 0.2; // line-of-sight sampling interval

interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

function obstacleBoxes(): Box[] {
  const { placedItems } = useNookStore.getState();
  return placedItems
    .filter((p) => CATALOG[p.type].obstacle)
    .map((p) => {
      const [hx, hz] = CATALOG[p.type].half;
      return {
        minX: p.position[0] - hx - CAT_RADIUS,
        maxX: p.position[0] + hx + CAT_RADIUS,
        minZ: p.position[2] - hz - CAT_RADIUS,
        maxZ: p.position[2] + hz + CAT_RADIUS,
      };
    });
}

const pointBlocked = (x: number, z: number, boxes: Box[]) =>
  boxes.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);

function lineBlocked(ax: number, az: number, bx: number, bz: number, boxes: Box[]) {
  const dist = Math.hypot(bx - ax, bz - az);
  const steps = Math.max(1, Math.ceil(dist / LOS_STEP));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    if (pointBlocked(ax + (bx - ax) * t, az + (bz - az) * t, boxes)) return true;
  }
  return false;
}

export function CatTracker() {
  const body = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // continuous state lives in a ref — mutated at 60fps, never re-renders
  const cat = useRef({
    pos: new Vector3(1.5, 0, 1.5),
    target: new Vector3(1.5, 0, 1.5),
    mode: 'idle' as Mode,
    waitUntil: 0,
    heading: 0,
  });

  useFrame(({ clock }, dt) => {
    if (!body.current) return;
    const c = cat.current;
    const now = performance.now();
    const { room } = useNookStore.getState();
    const boxes = obstacleBoxes();
    const margin = 0.5;

    /* keep the cat inside the room if it was resized */
    c.pos.x = MathUtils.clamp(c.pos.x, -room.width / 2 + margin, room.width / 2 - margin);
    c.pos.z = MathUtils.clamp(c.pos.z, -room.depth / 2 + margin, room.depth / 2 - margin);

    if (c.mode === 'idle' && now >= c.waitUntil) {
      // ── pick a random empty grid cell as the new destination ──
      let found = false;
      for (let attempt = 0; attempt < 14 && !found; attempt++) {
        const tx = snap(MathUtils.randFloat(-room.width / 2 + margin, room.width / 2 - margin));
        const tz = snap(MathUtils.randFloat(-room.depth / 2 + margin, room.depth / 2 - margin));
        if (!pointBlocked(tx, tz, boxes) && !lineBlocked(c.pos.x, c.pos.z, tx, tz, boxes)) {
          c.target.set(tx, 0, tz);
          c.mode = 'walk';
          found = true;
        }
      }
      if (!found) {
        // every candidate path was obstructed by furniture → sit + complain
        c.mode = 'sit';
        c.waitUntil = now + 2600;
        setIsBlocked(true);
      }
    }

    if (c.mode === 'walk') {
      const dx = c.target.x - c.pos.x;
      const dz = c.target.z - c.pos.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.06) {
        c.mode = 'idle';
        c.waitUntil = now + MathUtils.randFloat(900, 2600);
      } else {
        const step = Math.min(SPEED * dt, dist);
        const nx = c.pos.x + (dx / dist) * step;
        const nz = c.pos.z + (dz / dist) * step;
        // furniture may have been dropped onto the path mid-walk
        if (pointBlocked(nx, nz, boxes)) {
          c.mode = 'sit';
          c.waitUntil = now + 2600;
          setIsBlocked(true);
        } else {
          c.pos.set(nx, 0, nz);
          c.heading = Math.atan2(dx, dz);
        }
      }
    }

    if (c.mode === 'sit' && now >= c.waitUntil) {
      setIsBlocked(false);
      c.mode = 'idle';
      c.waitUntil = now; // retry immediately
    }

    /* ── apply pose ── */
    const t = clock.elapsedTime;
    body.current.position.copy(c.pos);
    // walking: trot bob; sitting: settle lower on the haunches
    const bob = c.mode === 'walk' ? Math.abs(Math.sin(t * 9)) * 0.045 : 0;
    body.current.position.y = c.mode === 'sit' ? -0.03 : bob;
    // turn smoothly toward the heading
    let delta = c.heading - body.current.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    body.current.rotation.y += delta * Math.min(1, dt * 8);
    body.current.rotation.x = c.mode === 'sit' ? -0.18 : 0;
    // tail: content sway vs. agitated flick when blocked
    if (tail.current) tail.current.rotation.y = Math.sin(t * (isBlocked ? 10 : 3)) * 0.45;
  });

  return (
    <group ref={body} position={[1.5, 0, 1.5]}>
      {/* body: rounded box */}
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.26, 0.22, 0.44]} />
        <meshPhysicalMaterial color="#C9C3D2" roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 0.36, 0.24]}>
        <boxGeometry args={[0.22, 0.2, 0.2]} />
        <meshPhysicalMaterial color="#D4CFDD" roughness={0.9} />
      </mesh>
      {/* triangular ears */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} castShadow position={[x, 0.5, 0.24]}>
          <coneGeometry args={[0.045, 0.09, 4]} />
          <meshPhysicalMaterial color="#B8B0C6" roughness={0.9} />
        </mesh>
      ))}
      {/* nose + eyes */}
      <mesh position={[0, 0.34, 0.345]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshPhysicalMaterial color="#E793A4" roughness={0.6} />
      </mesh>
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} position={[x, 0.39, 0.34]}>
          <sphereGeometry args={[0.014, 8, 6]} />
          <meshPhysicalMaterial color="#4A4139" roughness={0.4} />
        </mesh>
      ))}
      {/* cylinder legs */}
      {([[-0.08, 0.14], [0.08, 0.14], [-0.08, -0.14], [0.08, -0.14]] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} castShadow position={[x, 0.06, z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 8]} />
          <meshPhysicalMaterial color="#C9C3D2" roughness={0.9} />
        </mesh>
      ))}
      {/* curved tail: a quarter torus that sways */}
      <group ref={tail} position={[0, 0.28, -0.24]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.14, 0.028, 8, 16, Math.PI * 0.8]} />
          <meshPhysicalMaterial color="#B8B0C6" roughness={0.9} />
        </mesh>
      </group>

      {/* the UX alert bubble — plain HTML floating in 3D space */}
      <Html position={[0, 0.75, 0]} center distanceFactor={7} zIndexRange={[10, 0]}>
        <div className={'cat-bubble' + (isBlocked ? ' show' : '')}>🐈? (Blocked!)</div>
      </Html>
    </group>
  );
}
