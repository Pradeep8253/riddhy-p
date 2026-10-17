'use client';

import { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function RefrigeratorModel({ open = false, explode = 0 }) {
  return <group>
    <RoundedBox args={[.9,1.8,.82]} radius={.08} smoothness={4} position={[0,0,0]}><meshStandardMaterial color="#dce0da" metalness={.24} roughness={.28} /></RoundedBox>
    {[.45,0,-.45].map((y) => <mesh key={y} position={[0,y,.42]}><boxGeometry args={[.8,.025,.05]} /><meshStandardMaterial color="#eef2ed" /></mesh>)}
    <group position={[-.43,0,.43]} rotation={[0,open ? -.85 : 0,0]}>
      <RoundedBox args={[.82,1.76,.09]} radius={.05} smoothness={3} position={[.42,0,.02]}><meshStandardMaterial color="#f0f1ec" metalness={.2} roughness={.26} /></RoundedBox>
      <mesh position={[.73,.1,.1]}><boxGeometry args={[.035,.48,.04]} /><meshStandardMaterial color="#87928a" metalness={.6} /></mesh>
    </group>
    <mesh position={[0,-.93,0]}><boxGeometry args={[.72,.08,.7]} /><meshStandardMaterial color="#9ca79e" /></mesh>
  </group>;
}

export function WasherModel({ open = false, explode = 0 }) {
  const drum = useRef();
  useFrame((state, delta) => { if (drum.current) drum.current.rotation.z += delta * .3; });
  return <group>
    <RoundedBox args={[1.02,1.42,.82]} radius={.09} smoothness={4}><meshStandardMaterial color="#e4e6e0" metalness={.2} roughness={.28} /></RoundedBox>
    <mesh position={[0,.53,.43]}><boxGeometry args={[.82,.2,.035]} /><meshStandardMaterial color="#c5cbc4" /></mesh>
    <mesh position={[-.3,.53,.46]}><circleGeometry args={[.055,18]} /><meshStandardMaterial color="#d59d42" /></mesh>
    <group ref={drum} position={[0,-.13,.43]}>
      <mesh><torusGeometry args={[.34,.055,12,48]} /><meshStandardMaterial color="#85958d" metalness={.5} roughness={.28} /></mesh>
      <mesh><circleGeometry args={[.29,40]} /><meshStandardMaterial color="#91ad9f" transparent opacity={.7} roughness={.2} /></mesh>
    </group>
    <group position={[0,-.13,.46]} rotation={[0,open ? -.2 : 0,0]}><mesh><torusGeometry args={[.4,.045,10,40]} /><meshStandardMaterial color="#cbd3cc" metalness={.4} roughness={.25} /></mesh></group>
  </group>;
}

export function ACModel({ open = false }) {
  return <group>
    <RoundedBox args={[1.9,.48,.43]} radius={.12} smoothness={5}><meshStandardMaterial color="#f5f5f0" /></RoundedBox>
    <mesh position={[0,-.16,.23]} rotation={[open ? -.2 : -.08,0,0]}><boxGeometry args={[1.55,.045,.06]} /><meshStandardMaterial color="#aab5ad" /></mesh>
    {[-.5,-.25,0,.25,.5].map((x) => <mesh key={x} position={[x,-.235,.28]}><sphereGeometry args={[.018,8,8]} /><meshStandardMaterial color="#6b8f5e" /></mesh>)}
    <mesh position={[.76,.12,.23]}><sphereGeometry args={[.035,12,12]} /><meshStandardMaterial color="#d7a348" emissive="#6b4b17" /></mesh>
  </group>;
}

export function TVModel() {
  return <group>
    <RoundedBox args={[1.9,1.15,.1]} radius={.06} smoothness={4} position={[0,.12,0]}><meshStandardMaterial color="#1e2420" /></RoundedBox>
    <mesh position={[0,.12,.057]}><planeGeometry args={[1.78,1.02]} /><meshStandardMaterial color="#4e7b67" emissive="#183b2a" emissiveIntensity={.5} /></mesh>
    <mesh position={[0,-.49,0]}><boxGeometry args={[.55,.08,.3]} /><meshStandardMaterial color="#37443b" /></mesh>
  </group>;
}

export function MicrowaveModel({ open = false }) {
  return <group>
    <RoundedBox args={[1.35,.9,.85]} radius={.08} smoothness={4}><meshStandardMaterial color="#e4e7e1" metalness={.16} roughness={.3} /></RoundedBox>
    <RoundedBox args={[.86,.65,.06]} radius={.04} smoothness={3} position={[-.17,0,.44]}><meshStandardMaterial color="#687a72" transparent opacity={.9} /></RoundedBox>
    <group position={[.28,0,.4]} rotation={[0,open ? .95 : 0,0]}><mesh position={[.2,0,0]}><boxGeometry args={[.4,.72,.045]} /><meshStandardMaterial color="#f4f4ef" /></mesh></group>
    <mesh position={[.48,.22,.46]}><sphereGeometry args={[.06,12,12]} /><meshStandardMaterial color="#d8a347" /></mesh>
  </group>;
}

export function ChimneyModel() {
  return <group>
    <RoundedBox args={[1.65,.26,.56]} radius={.08} smoothness={4} position={[0,-.48,0]}><meshStandardMaterial color="#dfe2dc" metalness={.35} /></RoundedBox>
    <mesh position={[0,.2,-.12]}><boxGeometry args={[.6,1.1,.38]} /><meshStandardMaterial color="#c9d0c8" metalness={.4} /></mesh>
    <mesh position={[0,-.31,.26]}><boxGeometry args={[1.4,.06,.12]} /><meshStandardMaterial color="#868f88" /></mesh>
  </group>;
}

export function PurifierModel() {
  return <group>
    <RoundedBox args={[.95,1.45,.56]} radius={.16} smoothness={5}><meshStandardMaterial color="#f5f5f0" /></RoundedBox>
    <RoundedBox args={[.48,.3,.06]} radius={.08} smoothness={4} position={[0,.28,.3]}><meshStandardMaterial color="#91ad9c" /></RoundedBox>
    <mesh position={[0,-.3,.3]}><boxGeometry args={[.25,.035,.04]} /><meshStandardMaterial color="#7c8880" /></mesh>
    <mesh position={[0,-.63,.3]}><sphereGeometry args={[.045,12,12]} /><meshStandardMaterial color="#d7a348" /></mesh>
  </group>;
}
