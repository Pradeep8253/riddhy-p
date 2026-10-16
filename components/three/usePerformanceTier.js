'use client';

import { useEffect, useState } from 'react';

function webglAvailable() {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); }
  catch { return false; }
}
export function detectPerformanceTier() {
  if (typeof window === 'undefined') return 'medium';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData || !webglAvailable()) return 'off';
  const memory = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4, coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse || memory <= 4 || cores <= 4) return 'low';
  if (memory >= 8 && cores >= 8) return 'high';
  return 'medium';
}
export default function usePerformanceTier() {
  const [tier, setTier] = useState('off'); const [override, setOverride] = useState(null);
  useEffect(() => {
    const detected=detectPerformanceTier(),storedLite=window.localStorage.getItem('rf-lite-mode')==='1';setTier(storedLite?'off':detected);
    const onLite=(event)=>{setOverride(event.detail?'off':null);if(!event.detail)setTier(detectPerformanceTier())};
    const onVisibility=()=>{document.documentElement.dataset.scenePaused=document.hidden?'true':'false'};
    window.addEventListener('rf-lite-mode',onLite);document.addEventListener('visibilitychange',onVisibility);
    return()=>{window.removeEventListener('rf-lite-mode',onLite);document.removeEventListener('visibilitychange',onVisibility)};
  },[]);
  const effectiveTier=override||tier;
  const setLiteMode=(enabled)=>{window.localStorage.setItem('rf-lite-mode',enabled?'1':'0');setOverride(enabled?'off':null);if(!enabled)setTier(detectPerformanceTier())};
  return {tier:effectiveTier,autoTier:tier,setOverride,setLiteMode,isLite:effectiveTier==='off'||effectiveTier==='low'};
}
