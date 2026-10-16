'use client';

import { Canvas } from '@react-three/fiber';
import MonogramRF from './MonogramRF';

export default function ConsultationScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#e0a040" />
      <MonogramRF scale={0.88} position={[0, 0, 0]} animate={true} />
    </Canvas>
  );
}
