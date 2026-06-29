/* ════════════════════════════════════════════════════════════════
   HeroName3D — the hero name as extruded 3D text. Same "decode"
   scramble animation as the DOM version (shared useScramble hook), now
   rendered with drei <Text3D>: glossy, lit, with a gentle float and a
   slight lean toward the cursor for depth.
   ════════════════════════════════════════════════════════════════ */
import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Environment, Lightformer, Text3D } from '@react-three/drei';
import { useScramble } from '../ui/primitives';

const FONT = '/fonts/helvetiker_bold.typeface.json';

/* one extruded line, X-centered (baseline kept fixed so the vertical
   position never jitters as random glyphs swap in and out) */
function Line({ text, y, color, emissive }) {
  return (
    // key={text} forces a re-measure each time the scrambled string
    // changes width, so the line stays horizontally centered (drei
    // <Center> otherwise caches the first, empty measurement)
    <Center key={text} position={[0, y, 0]} disableY disableZ>
      <Text3D
        font={FONT}
        size={1}
        height={0.34}
        curveSegments={6}
        bevelEnabled
        bevelThickness={0.03}
        bevelSize={0.022}
        bevelSegments={3}
      >
        {text || ' '}
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.24}
          emissive={emissive}
          emissiveIntensity={0.35}
        />
      </Text3D>
    </Center>
  );
}

function Names() {
  const group = useRef();
  const { viewport } = useThree();

  const l1 = useScramble('Navendra', { framesPerChar: 24, flickerEvery: 5 });
  const l2 = useScramble('Ramdhan', { startDelay: 1500, framesPerChar: 24, flickerEvery: 5 });

  // responsive fit: scale the block so the widest line never clips
  const contentW = 6.6;   // ~"Navendra" width at size 1, with margin
  const contentH = 2.7;   // two lines + breathing room
  const scale = Math.min(1.1, (viewport.width * 0.86) / contentW, (viewport.height * 0.9) / contentH);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // gentle float + a soft lean toward the cursor
    g.rotation.y = Math.sin(t * 0.5) * 0.07 + state.pointer.x * 0.1;
    g.rotation.x = Math.sin(t * 0.4) * 0.04 - state.pointer.y * 0.07;
    g.position.y = Math.sin(t * 0.8) * 0.04;
  });

  // baselines chosen so the two cap-boxes sit symmetrically about y=0,
  // keeping the block vertically centered in the canvas
  return (
    <group ref={group} scale={scale}>
      <Line text={l1} y={0.39} color="#eef4ff" emissive="#1c3361" />
      <Line text={l2} y={-1.11} color="#4cf06f" emissive="#1f5a32" />
    </group>
  );
}

export default function HeroName3D() {
  return (
    <Canvas
      className="hero-name-canvas"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 7], fov: 35 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 8]} intensity={2.6} />
      <directionalLight position={[-5, -2, 3]} intensity={0.9} color="#8fb0ff" />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 3, 3]} scale={[10, 4, 1]} color="#cfe0ff" />
        <Lightformer intensity={1.6} position={[-4, 1, 3]} scale={[5, 5, 1]} color="#4cf06f" />
        <Lightformer intensity={1.2} position={[4, -1, 2]} scale={[5, 5, 1]} color="#ffffff" />
      </Environment>
      <Suspense fallback={null}>
        <Names />
      </Suspense>
    </Canvas>
  );
}
