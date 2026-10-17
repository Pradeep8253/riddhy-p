'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3 } from 'three';

// GPGPU feedback shaders: every frame the velocity and position fields run in float textures.
const velocityShader = `uniform float uTime; uniform vec3 uPointer; void main(){ vec2 uv=gl_FragCoord.xy/resolution.xy; vec3 p=texture2D(texturePosition,uv).xyz; vec3 v=texture2D(textureVelocity,uv).xyz; vec3 flow=vec3(sin(p.y*1.6+uTime),cos(p.z*1.4-uTime*.8),sin(p.x*1.8+uTime*.6)); vec3 away=p-uPointer; float d=max(length(away),.16); v+=flow*.00065+normalize(away)*exp(-d*1.8)*.00055; v*=.994; gl_FragColor=vec4(v,1.0); }`;
const positionShader = `uniform float uTime; void main(){ vec2 uv=gl_FragCoord.xy/resolution.xy; vec3 p=texture2D(texturePosition,uv).xyz; vec3 v=texture2D(textureVelocity,uv).xyz; p+=v; if(p.x>5.5)p.x=-5.5;if(p.x< -5.5)p.x=5.5;if(p.y>3.6)p.y=-3.6;if(p.y< -3.6)p.y=3.6;if(p.z>1.3)p.z=-1.3;if(p.z< -1.3)p.z=1.3; gl_FragColor=vec4(p,1.0); }`;
const pointVertex = `uniform sampler2D uPositions; uniform float uTime; attribute vec2 reference; attribute float aSize; varying float vAlpha; void main(){ vec3 p=texture2D(uPositions,reference).xyz; p.y+=sin(uTime*.35+p.x*1.4)*.035; vec4 mv=modelViewMatrix*vec4(p,1.0); gl_PointSize=aSize*(165.0/-mv.z); gl_Position=projectionMatrix*mv; vAlpha=.45+.55*sin(uTime*.55+p.x*2.0); }`;
const pointFragment = `varying float vAlpha; void main(){ float d=length(gl_PointCoord-.5); float a=(1.0-smoothstep(.08,.5,d))*vAlpha; gl_FragColor=vec4(.94,.68,.29,a); }`;

function FallbackDust({ count, spread }) {
  const points=useRef();
  const geometry=useMemo(()=>{const positions=new Float32Array(count*3),sizes=new Float32Array(count);for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*spread*2;positions[i*3+1]=(Math.random()-.5)*spread*1.2;positions[i*3+2]=(Math.random()-.5)*2;sizes[i]=.35+Math.random()*.8}const geo=new BufferGeometry();geo.setAttribute('position',new BufferAttribute(positions,3));geo.setAttribute('aSize',new BufferAttribute(sizes,1));return geo},[count,spread]);
  const material=useMemo(()=>new ShaderMaterial({vertexShader:`uniform float uTime; attribute float aSize; varying float vAlpha; void main(){vec3 p=position;p.y+=sin(uTime*.32+position.x*1.7+position.z)*.08;p.x+=cos(uTime*.2+position.y)*.035;vAlpha=.4+.6*sin(uTime*.6+position.x*2.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*(165./-mv.z);gl_Position=projectionMatrix*mv;}`,fragmentShader:pointFragment,uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,blending:AdditiveBlending}),[]);
  useFrame((state)=>{material.uniforms.uTime.value=state.clock.elapsedTime;if(points.current)points.current.rotation.y=Math.sin(state.clock.elapsedTime*.08)*.08});
  return <points ref={points} geometry={geometry} material={material} frustumCulled={false}/>;
}

export default function GoldDust({ count=15000, spread=5.4 }) {
  const { gl }=useThree();
  const gpuRef=useRef(null);
  const [failed,setFailed]=useState(false);
  const size=Math.ceil(Math.sqrt(count));
  const actualCount=size*size;
  const geometry=useMemo(()=>{const refs=new Float32Array(actualCount*2),sizes=new Float32Array(actualCount);for(let i=0;i<actualCount;i++){const x=i%size,y=Math.floor(i/size);refs[i*2]=(x+.5)/size;refs[i*2+1]=(y+.5)/size;sizes[i]=.38+Math.random()*.75}const geo=new BufferGeometry();geo.setAttribute('reference',new BufferAttribute(refs,2));geo.setAttribute('aSize',new BufferAttribute(sizes,1));geo.setDrawRange(0,actualCount);return geo},[actualCount,size]);
  const material=useMemo(()=>new ShaderMaterial({vertexShader:pointVertex,fragmentShader:pointFragment,uniforms:{uPositions:{value:null},uTime:{value:0}},transparent:true,depthWrite:false,blending:AdditiveBlending}),[]);

  useEffect(()=>{
    let cancelled=false;
    import('three/examples/jsm/misc/GPUComputationRenderer.js').then(({GPUComputationRenderer})=>{
      if(cancelled)return;
      const gpu=new GPUComputationRenderer(size,size,gl);
      const positionTexture=gpu.createTexture(),velocityTexture=gpu.createTexture();
      const pData=positionTexture.image.data,vData=velocityTexture.image.data;
      for(let i=0;i<actualCount;i++){pData[i*4]=(Math.random()-.5)*spread*2;pData[i*4+1]=(Math.random()-.5)*spread*1.2;pData[i*4+2]=(Math.random()-.5)*2;pData[i*4+3]=1;vData[i*4]=(Math.random()-.5)*.006;vData[i*4+1]=(Math.random()-.5)*.006;vData[i*4+2]=(Math.random()-.5)*.004;vData[i*4+3]=1;}
      const velocityVariable=gpu.addVariable('textureVelocity',velocityShader,velocityTexture);
      const positionVariable=gpu.addVariable('texturePosition',positionShader,positionTexture);
      gpu.setVariableDependencies(velocityVariable,[positionVariable,velocityVariable]);
      gpu.setVariableDependencies(positionVariable,[positionVariable,velocityVariable]);
      velocityVariable.material.uniforms.uTime={value:0};velocityVariable.material.uniforms.uPointer={value:new Vector3()};positionVariable.material.uniforms.uTime={value:0};
      const error=gpu.init();
      if(error){gpu.dispose();if(!cancelled)setFailed(true);return;}
      gpuRef.current={gpu,velocityVariable,positionVariable};
      material.uniforms.uPositions.value=gpu.getCurrentRenderTarget(positionVariable).texture;
    }).catch(()=>{if(!cancelled)setFailed(true)});
    return()=>{cancelled=true;gpuRef.current?.gpu?.dispose();gpuRef.current=null};
  },[actualCount,gl,material,size,spread]);

  useFrame((state)=>{
    const current=gpuRef.current;if(!current)return;
    current.velocityVariable.material.uniforms.uTime.value=state.clock.elapsedTime;
    current.velocityVariable.material.uniforms.uPointer.value.set(state.pointer.x*spread*.6,state.pointer.y*spread*.4,0);
    current.positionVariable.material.uniforms.uTime.value=state.clock.elapsedTime;
    current.gpu.compute();
    material.uniforms.uPositions.value=current.gpu.getCurrentRenderTarget(current.positionVariable).texture;
    material.uniforms.uTime.value=state.clock.elapsedTime;
  });
  if(failed)return <FallbackDust count={Math.min(count,3000)} spread={spread}/>;
  return <points geometry={geometry} material={material} frustumCulled={false}/>;
}
