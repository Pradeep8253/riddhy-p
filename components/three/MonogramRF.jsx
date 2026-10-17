'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ExtrudeGeometry, MeshPhysicalMaterial, Shape } from 'three';

function letterShapes() {
  const r = new Shape();
  r.moveTo(-.75,-1.05); r.lineTo(-.75,1.05); r.lineTo(.1,1.05); r.bezierCurveTo(.8,1.05,.92,.64,.92,.28); r.bezierCurveTo(.92,-.08,.72,-.3,.38,-.4); r.lineTo(1.05,-1.05); r.lineTo(.25,-1.05); r.lineTo(-.18,-.42); r.lineTo(-.18,-1.05); r.closePath();
  r.moveTo(-.18,.47); r.lineTo(.08,.47); r.bezierCurveTo(.35,.47,.4,.38,.4,.24); r.bezierCurveTo(.4,.1,.33,.02,.08,.02); r.lineTo(-.18,.02); r.closePath();
  const f = new Shape();
  f.moveTo(-.65,-1.05); f.lineTo(-.65,1.05); f.lineTo(.65,1.05); f.lineTo(.65,.55); f.lineTo(-.08,.55); f.lineTo(-.08,.15); f.lineTo(.51,.15); f.lineTo(.51,-.32); f.lineTo(-.08,-.32); f.lineTo(-.08,-1.05); f.closePath();
  return [r,f];
}

function createMaterial(color, metalness, roughness, displacement = false) {
  const material = new MeshPhysicalMaterial({ color, metalness, roughness, clearcoat: displacement ? 1 : .3, clearcoatRoughness: .22 });
  if (displacement) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed.z += sin(position.x * 5.0 + uTime * 1.6) * cos(position.y * 3.0 - uTime) * 0.014;`);
      material.userData.shader = shader;
    };
  }
  return material;
}

export default function MonogramRF({ position = [0,0,0], scale = 1, animate = true }) {
  const group = useRef();
  const materials = useMemo(() => [createMaterial('#d99a36', .92, .22, true), createMaterial('#6b8f5e', .28, .3)], []);
  const geometries = useMemo(() => letterShapes().map((shape) => new ExtrudeGeometry(shape, { depth: .16, bevelEnabled: true, bevelSegments: 6, steps: 1, bevelSize: .045, bevelThickness: .045, curveSegments: 24 })), []);
  useFrame((state, delta) => {
    if (animate && group.current) {
      group.current.rotation.y += delta * .12;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * .3) * .035;
    }
    materials[0].userData.shader?.uniforms?.uTime && (materials[0].userData.shader.uniforms.uTime.value = state.clock.elapsedTime);
  });
  return <group ref={group} position={position} scale={scale} dispose={null}>
    <mesh geometry={geometries[0]} material={materials[0]} position={[-.48,0,0]} castShadow />
    <mesh geometry={geometries[1]} material={materials[1]} position={[.48,0,.02]} castShadow />
  </group>;
}
