'use client';

import { RoundedBox } from '@react-three/drei';

export function MattressModel({ color = '#e8e0d2' }) {
  return <group><RoundedBox args={[1.85,.42,1.65]} radius={.15} smoothness={6}><meshStandardMaterial color={color} roughness={.95} /></RoundedBox><mesh position={[0,.08,.01]}><boxGeometry args={[1.5,.025,1.45]} /><meshStandardMaterial color="#b4c3a4" /></mesh></group>;
}
export function DecorModel({ color = '#be9a64' }) {
  return <group><mesh position={[0,-.1,0]}><cylinderGeometry args={[.36,.47,.5,28]} /><meshStandardMaterial color="#c7975f" roughness={.7} /></mesh><mesh position={[0,.38,0]}><cylinderGeometry args={[.19,.22,.5,20]} /><meshStandardMaterial color={color} roughness={.8} /></mesh><mesh position={[0,.67,0]}><sphereGeometry args={[.17,16,12]} /><meshStandardMaterial color="#64865c" /></mesh></group>;
}
export function StorageModel({ color = '#a67c4c', explode = 0 }) {
  return <group><RoundedBox args={[1.5,1.6,.48]} radius={.06} smoothness={3}><meshStandardMaterial color="#805b3b" /></RoundedBox>{[-.43,0,.43].map((y) => <mesh key={y} position={[0,y,.26+explode*.12]}><boxGeometry args={[1.28,.045,.12]} /><meshStandardMaterial color={color} /></mesh>)}<mesh position={[-.43,.5,.3]}><boxGeometry args={[.05,.72,.05]} /><meshStandardMaterial color="#b98b50" /></mesh></group>;
}
