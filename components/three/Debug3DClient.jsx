'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stats } from '@react-three/drei';
import { Leva, useControls } from 'leva';
import { useState } from 'react';
import MonogramRF from './MonogramRF';
import OrbitSwoosh from './OrbitSwoosh';
import GoldDust from './GoldDust';
import ProductModel from './ProductModel';
import usePerformanceTier from './usePerformanceTier';
import styles from './Debug3DClient.module.css';
function Tuning(){useControls('Scene',{goldMetalness:{value:.92,min:0,max:1},motion:{value:.7,min:0,max:2}});return null}
export default function Debug3DClient(){const {tier,autoTier,setOverride}=usePerformanceTier();const [type,setType]=useState('sofa');return <main className={styles.page}><div className={styles.head}><span className="kicker">Development only · 3D tuning</span><h1>Scene lab.</h1><p>Detected tier: <b>{tier}</b> · automatic tier: {autoTier}</p><div className={styles.buttons}>{['high','medium','low','off'].map((value)=><button type="button" key={value} onClick={()=>setOverride(value)}>{value}</button>)}</div><select value={type} onChange={(e)=>setType(e.target.value)}><option value="sofa">Sofa</option><option value="refrigerator">Refrigerator</option><option value="washer">Washer</option><option value="wardrobe">Wardrobe</option><option value="tv">Television</option></select></div><div className={styles.canvas}><Canvas camera={{position:[0,.3,6],fov:42}} dpr={[1,1.7]}><ambientLight intensity={1.2}/><directionalLight position={[3,5,4]} intensity={2}/><Environment preset="studio"/><MonogramRF position={[-1.7,0,0]} scale={.7}/><OrbitSwoosh position={[-1.7,0,0]} scale={.75}/><ProductModel type={type} dims={{width:140,depth:80,height:100}} float/><GoldDust count={1800}/><OrbitControls/><Stats/></Canvas></div><Leva collapsed/><Tuning/></main>}
