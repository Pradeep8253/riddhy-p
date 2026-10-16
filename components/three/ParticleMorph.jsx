'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, ShaderMaterial, Float32BufferAttribute, AdditiveBlending } from 'three';

// GPU vertex morph between seeded target coordinates. This lightweight mode keeps all motion on the GPU.
const vertex = `uniform float uTime; uniform float uMorph; attribute vec3 aTarget; varying float vAlpha; void main(){ vec3 p=mix(position,aTarget,uMorph); p+=.025*vec3(sin(uTime+p.y*4.0),cos(uTime+p.x*3.0),sin(uTime*.7+p.z*5.0)); vec4 mv=modelViewMatrix*vec4(p,1.0); gl_PointSize=2.0*(100.0/-mv.z); gl_Position=projectionMatrix*mv; vAlpha=.5+.5*sin(uTime+p.x*2.); }`;
const fragment = `varying float vAlpha; void main(){ float d=length(gl_PointCoord-.5); float a=(1.0-smoothstep(.12,.5,d))*vAlpha; gl_FragColor=vec4(.91,.63,.24,a); }`;
export default function ParticleMorph({ count = 900, target = 'rf', progress = .18 }) {
  const points = useRef();
  const geometry = useMemo(() => {
    const geo = new BufferGeometry(); const from = []; const to = [];
    for (let i=0;i<count;i++) {
      const x=(Math.random()-.5)*4, y=(Math.random()-.5)*2.6, z=(Math.random()-.5)*.5;
      from.push(x,y,z);
      if (target === 'tree') { const angle=Math.random()*Math.PI*2; const radius=Math.random()*1.1; to.push(Math.cos(angle)*radius, Math.random()*2.1-.1, Math.sin(angle)*radius); }
      else if (target === 'sofa') { const part=i%3; to.push((Math.random()-.5)*2.5, part===0?.4+Math.random()*.3:part===1?-.1+Math.random()*.3:-.55+Math.random()*.25, (Math.random()-.5)*.45); }
      else if (target === 'fridge') { to.push((Math.random()-.5)*.7, (Math.random()-.5)*1.5, (Math.random()-.5)*.4); }
      else { const side=i%2?1:-1; to.push(side*(.25+Math.random()*.5), (Math.random()-.5)*1.2, (Math.random()-.5)*.35); }
    }
    geo.setAttribute('position',new Float32BufferAttribute(from,3)); geo.setAttribute('aTarget',new Float32BufferAttribute(to,3)); return geo;
  },[count,target]);
  const material = useMemo(() => new ShaderMaterial({ vertexShader:vertex, fragmentShader:fragment, uniforms:{uTime:{value:0},uMorph:{value:progress}},transparent:true,depthWrite:false,blending:AdditiveBlending }),[progress]);
  useFrame((state) => { material.uniforms.uTime.value=state.clock.elapsedTime; });
  return <points ref={points} geometry={geometry} material={material} />;
}
