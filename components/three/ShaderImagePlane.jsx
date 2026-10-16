'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { ShaderMaterial } from 'three';

const vertex = `varying vec2 vUv; uniform float uTime; uniform float uHover; void main(){ vUv=uv; vec3 p=position; p.z+=sin((uv.x+uTime*.12)*8.0)*uHover*.018; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`;
const fragment = `uniform sampler2D uMap; uniform float uTime; uniform float uHover; varying vec2 vUv; void main(){ float wave=sin(vUv.y*15.0+uTime*2.0)*.006*uHover; vec2 uv=vUv+vec2(wave,0.0); vec4 color=texture2D(uMap,uv); gl_FragColor=color; }`;
export default function ShaderImagePlane({ src, width = 2, height = 1.25, hover = 0 }) {
  const map = useTexture(src);
  const material = useMemo(() => new ShaderMaterial({ uniforms: { uMap: { value: map }, uTime: { value: 0 }, uHover: { value: hover } }, vertexShader: vertex, fragmentShader: fragment }), [map]);
  const ref = useRef();
  useFrame((state) => { material.uniforms.uTime.value=state.clock.elapsedTime; material.uniforms.uHover.value=hover; });
  return <mesh ref={ref} material={material}><planeGeometry args={[width,height,32,32]} /></mesh>;
}
