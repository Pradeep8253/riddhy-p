'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * Self-contained Studio Environment lighting.
 * Generates an HDR studio environment map in WebGL memory on the fly
 * using procedural lightformers. Eliminates external network fetches
 * to remote CDNs (such as studio_small_03_1k.hdr), completely preventing
 * 'Failed to fetch' runtime errors, CSP blocking, and offline crashes.
 */
export default function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <group rotation={[-Math.PI / 4, -0.2, 0]}>
        {/* Soft overhead warm key light */}
        <Lightformer
          form="rect"
          intensity={3}
          color="#fff5ea"
          scale={[10, 5, 1]}
          position={[0, 5, -9]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Left fill light with warm sand tint */}
        <Lightformer
          form="rect"
          intensity={2}
          color="#fdf4e7"
          scale={[10, 2, 1]}
          position={[-5, 2, -1]}
          rotation={[0, Math.PI / 2, 0]}
        />
        {/* Right rim light for metallic & wooden edge highlight */}
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#ffffff"
          scale={[10, 2, 1]}
          position={[10, 1, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        {/* Subtle ground bounce */}
        <Lightformer
          form="circle"
          intensity={1.2}
          color="#ede4d4"
          scale={8}
          position={[0, -5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>
    </Environment>
  );
}
