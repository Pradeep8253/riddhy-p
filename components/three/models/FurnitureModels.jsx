'use client';

import { RoundedBox } from '@react-three/drei';

const wood = '#9a6e43';

export function SofaModel({ color = '#6b8f5e', explode = 0 }) {
  return <group>
    <RoundedBox args={[1.9,.42,.78]} radius={.11} smoothness={5} position={[0,-.14,0]}><meshStandardMaterial color={color} roughness={.84} /></RoundedBox>
    <RoundedBox args={[1.88,.55,.28]} radius={.1} smoothness={5} position={[0,.27,-.25 + explode*.18]}><meshStandardMaterial color={color} roughness={.84} /></RoundedBox>
    <RoundedBox args={[.28,.62,.82]} radius={.1} smoothness={5} position={[-.82,.04,0]}><meshStandardMaterial color={color} roughness={.82} /></RoundedBox>
    <RoundedBox args={[.28,.62,.82]} radius={.1} smoothness={5} position={[.82,.04,0]}><meshStandardMaterial color={color} roughness={.82} /></RoundedBox>
    {[-.68,.68].map((x) => [-.25,.25].map((z) => <mesh key={`${x}${z}`} position={[x,-.48,z]}><cylinderGeometry args={[.045,.06,.25,10]} /><meshStandardMaterial color={wood} roughness={.55} /></mesh>))}
    <RoundedBox args={[.58,.42,.12]} radius={.06} smoothness={4} position={[-.36,.12,.08 + explode*.1]} rotation={[0,.08,.04]}><meshStandardMaterial color="#dfc9a7" roughness={.95} /></RoundedBox>
  </group>;
}

export function BedModel({ color = '#ad9777', explode = 0 }) {
  return <group>
    <RoundedBox args={[1.85,.19,1.9]} radius={.08} smoothness={4} position={[0,-.18,0]}><meshStandardMaterial color={wood} /></RoundedBox>
    <RoundedBox args={[1.75,.34,1.82]} radius={.12} smoothness={4} position={[0,.03,0]}><meshStandardMaterial color={color} roughness={.95} /></RoundedBox>
    <RoundedBox args={[1.82,.58,.16]} radius={.08} smoothness={4} position={[0,.17,-.95 - explode*.18]}><meshStandardMaterial color={wood} /></RoundedBox>
    <RoundedBox args={[.58,.16,.48]} radius={.08} smoothness={4} position={[-.48,.24,-.55]}><meshStandardMaterial color="#efe8dc" /></RoundedBox>
    <RoundedBox args={[.58,.16,.48]} radius={.08} smoothness={4} position={[.48,.24,-.55]}><meshStandardMaterial color="#d9c5a3" /></RoundedBox>
  </group>;
}

export function WardrobeModel({ color = '#9b7048', open = false, explode = 0 }) {
  return <group>
    <RoundedBox args={[1.45,1.95,.48]} radius={.06} smoothness={3} position={[0,0,0]}><meshStandardMaterial color="#815b3a" /></RoundedBox>
    <group position={[-.02,0,.26]} rotation={[0,open ? -.7 : 0,0]}>
      <RoundedBox args={[.69,1.86,.08]} radius={.045} smoothness={3} position={[-.37,0,0]}><meshStandardMaterial color={color} /></RoundedBox>
      <mesh position={[-.12,0,.06]}><sphereGeometry args={[.045,12,12]} /><meshStandardMaterial color="#d9b46b" metalness={.55} /></mesh>
    </group>
    <group position={[.02,0,.26]} rotation={[0,open ? .7 : 0,0]}>
      <RoundedBox args={[.69,1.86,.08]} radius={.045} smoothness={3} position={[.37,0,0]}><meshStandardMaterial color={color} /></RoundedBox>
      <mesh position={[.12,0,.06]}><sphereGeometry args={[.045,12,12]} /><meshStandardMaterial color="#d9b46b" metalness={.55} /></mesh>
    </group>
    {[.45,0,-.45].map((y) => <mesh key={y} position={[0,y,-.02-explode*.2]}><boxGeometry args={[1.1,.035,.38]} /><meshStandardMaterial color="#d5bd9b" /></mesh>)}
  </group>;
}

export function DiningModel({ color = wood }) {
  return <group>
    <RoundedBox args={[1.55,.13,.92]} radius={.15} smoothness={5} position={[0,.12,0]}><meshStandardMaterial color={color} roughness={.72} /></RoundedBox>
    {[-.58,.58].map((x) => [-.3,.3].map((z) => <mesh key={`${x}${z}`} position={[x,-.34,z]}><cylinderGeometry args={[.055,.07,.82,12]} /><meshStandardMaterial color="#7c5737" /></mesh>))}
    {[-1,1].map((side) => <group key={side} position={[side*.9,-.1,0]}><mesh position={[0,-.18,0]}><boxGeometry args={[.48,.1,.5]} /><meshStandardMaterial color="#728b70" /></mesh><mesh position={[0,.12,-.18]}><boxGeometry args={[.48,.48,.08]} /><meshStandardMaterial color="#728b70" /></mesh><mesh position={[-.17,-.4,.17]}><boxGeometry args={[.06,.55,.06]} /><meshStandardMaterial color="#815b3a" /></mesh><mesh position={[.17,-.4,.17]}><boxGeometry args={[.06,.55,.06]} /><meshStandardMaterial color="#815b3a" /></mesh></group>)}
  </group>;
}

export function StudyModel({ color = wood }) {
  return <group>
    <RoundedBox args={[1.55,.12,.72]} radius={.08} smoothness={4} position={[0,.03,0]}><meshStandardMaterial color={color} /></RoundedBox>
    {[-.62,.62].map((x) => <mesh key={x} position={[x,-.48,0]}><boxGeometry args={[.12,.95,.58]} /><meshStandardMaterial color="#805a39" /></mesh>)}
    <mesh position={[.32,-.22,-.1]}><boxGeometry args={[.4,.36,.55]} /><meshStandardMaterial color="#cda973" /></mesh>
    <RoundedBox args={[.45,.4,.1]} radius={.07} smoothness={3} position={[-.15,-.25,.15]}><meshStandardMaterial color="#789177" /></RoundedBox>
  </group>;
}
