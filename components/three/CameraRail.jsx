'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three';

export default function CameraRail({ active = true }) {
  const { camera } = useThree();
  const progress = useRef({ value: 0 });
  const target = useRef(new Vector3());
  // Seven subtle rail nodes echo the monogram, living space, appliance, campaign and finale chapters.
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(0,.08,8), new Vector3(.22,.12,7.9), new Vector3(.38,.02,7.8),
    new Vector3(.08,-.12,8.05), new Vector3(-.3,-.04,8.2), new Vector3(-.18,.08,8.1), new Vector3(0,0,8)
  ]), []);

  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let context, alive=true;
    Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([gsapMod,scrollMod])=>{
      if(!alive)return;
      const gsap=gsapMod.gsap,ScrollTrigger=scrollMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      context=gsap.context(()=>gsap.to(progress.current,{value:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:1.2}}));
    }).catch(()=>{});
    return()=>{alive=false;context?.revert()};
  },[active]);

  useFrame((_,delta)=>{
    const p=MathUtils.clamp(progress.current.value,0,1),point=curve.getPointAt(p);
    camera.position.lerp(point,1-Math.exp(-delta*2.4));
    target.current.set(MathUtils.lerp(0,.45,p),MathUtils.lerp(0,-.12,p),-1.5);
    camera.lookAt(target.current);
  });
  return null;
}
