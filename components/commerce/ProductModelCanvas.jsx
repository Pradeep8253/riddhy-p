'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import ProductModel from '@/components/three/ProductModel';
import Hotspots from '@/components/three/Hotspots';
import StudioEnvironment from '@/components/three/StudioEnvironment';

export default function ProductModelCanvas({type,dims,colorway,open,explode,rotation=[0,0,0],showHotspots=false}){
 return <Canvas camera={{position:[0,1.25,4.5],fov:36}} dpr={[1,1.6]} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} aria-label="Interactive 3D product model"><ambientLight intensity={1.4}/><directionalLight position={[4,5,5]} intensity={2.2} castShadow/><pointLight position={[-3,2,1]} color="#edb95e" intensity={.8}/><Suspense fallback={null}><StudioEnvironment/><group rotation={rotation}><ProductModel type={type} dims={dims} colorway={colorway} open={open} explode={explode} float={false}/>{showHotspots&&<Hotspots/>}</group><ContactShadows position={[0,-1.45,0]} opacity={.25} scale={5} blur={2.2}/></Suspense><OrbitControls makeDefault enablePan={false} minDistance={2.5} maxDistance={7} minPolarAngle={.45} maxPolarAngle={2.2} /></Canvas>
}
