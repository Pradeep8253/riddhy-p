'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, PerformanceMonitor, RoundedBox } from '@react-three/drei';
import { MathUtils } from 'three';
import usePerformanceTier from './usePerformanceTier';
import CameraRail from './CameraRail';
import MonogramRF from './MonogramRF';
import OrbitSwoosh from './OrbitSwoosh';
import GoldDust from './GoldDust';
import Effects from './Effects';
import StudioEnvironment from './StudioEnvironment';

function HeroDiorama() {
  const group = useRef();
  useFrame((state, delta) => {
    if (!group.current) return;
    const pointerX = state.pointer.x * .035;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, pointerX, 2, delta);
    group.current.position.y = Math.sin(state.clock.elapsedTime * .45) * .025;
  });
  return <group ref={group} position={[2.35,-.42,-2.1]} scale={.84}>
    <Float speed={.45} rotationIntensity={.015} floatIntensity={.04}>
      <mesh position={[0,-.76,0]} receiveShadow><boxGeometry args={[4.4,.12,2.1]} /><meshStandardMaterial color="#d7c7ad" roughness={.85} /></mesh>
      <RoundedBox args={[1.7,.55,.62]} radius={.12} smoothness={4} position={[-.82,-.24,0]} castShadow><meshStandardMaterial color="#6b8f5e" roughness={.86} /></RoundedBox>
      <RoundedBox args={[1.65,.56,.22]} radius={.08} smoothness={4} position={[-.82,.12,-.22]} castShadow><meshStandardMaterial color="#78936a" roughness={.9} /></RoundedBox>
      <RoundedBox args={[.23,.74,.66]} radius={.08} smoothness={4} position={[-1.53,-.08,0]}><meshStandardMaterial color="#507551" /></RoundedBox>
      <RoundedBox args={[.23,.74,.66]} radius={.08} smoothness={4} position={[-.1,-.08,0]}><meshStandardMaterial color="#507551" /></RoundedBox>
      <mesh position={[1.02,-.01,.04]} castShadow><boxGeometry args={[.55,1.3,.55]} /><meshStandardMaterial color="#e3e5df" metalness={.18} roughness={.25} /></mesh>
      <mesh position={[1.02,.18,.32]}><boxGeometry args={[.57,.025,.02]} /><meshStandardMaterial color="#bdc2bb" /></mesh>
      <group position={[1.72,-.16,.08]}><mesh><cylinderGeometry args={[.38,.42,.68,32]} /><meshStandardMaterial color="#f0f0eb" /></mesh><mesh position={[0,0,.36]}><torusGeometry args={[.23,.055,12,32]} /><meshStandardMaterial color="#87958c" metalness={.45} /></mesh></group>
      <mesh position={[-1.18,.58,0]}><cylinderGeometry args={[.025,.025,1.12,12]} /><meshStandardMaterial color="#8b663d" /></mesh>
      <mesh position={[-1.18,1.15,0]}><coneGeometry args={[.34,.35,32]} /><meshStandardMaterial color="#dfa642" emissive="#ab6722" emissiveIntensity={.24} /></mesh>
      <mesh position={[-1.62,-.23,.78]}><cylinderGeometry args={[.3,.37,.38,24]} /><meshStandardMaterial color="#be8a55" /></mesh>
      <mesh position={[-1.62,.13,.78]}><cylinderGeometry args={[.035,.04,.72,10]} /><meshStandardMaterial color="#4f7c4e" /></mesh>
      <mesh position={[-1.78,.32,.78]} rotation={[0,0,-.5]}><sphereGeometry args={[.18,16,12]} /><meshStandardMaterial color="#6b8f5e" /></mesh>
      <mesh position={[-1.46,.44,.78]} rotation={[0,0,.45]}><sphereGeometry args={[.16,16,12]} /><meshStandardMaterial color="#86a575" /></mesh>
    </Float>
  </group>;
}

export default function SceneRoot() {
  const { tier, setOverride } = usePerformanceTier();
  if (tier === 'off') return null;
  const particleCount = tier === 'high' ? 50000 : tier === 'medium' ? 15000 : 3000;
  const dpr = tier === 'high' ? [1,1.75] : tier === 'medium' ? [1,1.4] : 1;
  return <div className="scene-layer" aria-hidden="true" style={{ opacity: tier === 'low' ? .22 : .38 }}>
    <Canvas dpr={dpr} frameloop="always" eventSource={document.body} camera={{ position: [0,0,8], fov: 37 }} gl={{ alpha: true, antialias: tier !== 'low', powerPreference: 'high-performance' }}>
      <ambientLight intensity={1.1} /><directionalLight position={[2,5,6]} intensity={2.1} color="#fff2d8" castShadow /><pointLight position={[-3,2,2]} intensity={1.3} color="#edb95e" />
      <Suspense fallback={null}>
        <StudioEnvironment />
        <HeroDiorama />
        <group position={[-2.4,.18,-2]} scale={.76}><MonogramRF scale={.76} /><OrbitSwoosh position={[0,0,-.06]} scale={.88} /></group>
        <GoldDust count={particleCount} spread={5.6} />
        <ContactShadows position={[1,-1.35,-2]} opacity={.25} scale={8} blur={2.2} far={2.5} />
      </Suspense>
      <CameraRail active />
      <PerformanceMonitor onDecline={() => setOverride(tier === 'high' ? 'medium' : tier === 'medium' ? 'low' : 'off')} />
      {tier !== 'low' && <Effects tier={tier} />}
    </Canvas>
  </div>;
}
