'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, ShaderMaterial, TubeGeometry, Vector3 } from 'three';

const vertex = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const fragment = `uniform float uTime; varying vec2 vUv; void main(){ float flow=fract(vUv.x-uTime*.08); vec3 gold=vec3(.93,.63,.21); vec3 green=vec3(.16,.39,.22); vec3 c=mix(gold,green,smoothstep(.3,.9,vUv.x)); float glint=smoothstep(.96,1.0,fract(flow*5.0)); gl_FragColor=vec4(c+glint*.22, .88); }`;

export default function OrbitSwoosh({ position = [0,0,0], scale = 1 }) {
  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; points.push(new Vector3(Math.cos(a) * 1.55, Math.sin(a) * .42 - .65, Math.sin(a) * .22)); }
    const curve = new CatmullRomCurve3(points, true, 'centripetal');
    return new TubeGeometry(curve, 120, .035, 8, true);
  }, []);
  const material = useMemo(() => new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { uTime: { value: 0 } }, transparent: true }), []);
  useFrame((state) => { material.uniforms.uTime.value = state.clock.elapsedTime; });
  return <mesh geometry={geometry} material={material} position={position} scale={scale} rotation={[.08,0,-.1]} />;
}
