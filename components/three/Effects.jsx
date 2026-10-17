'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export default function Effects({ tier = 'medium' }) {
  if (tier !== 'high' && tier !== 'medium') return null;
  return <EffectComposer multisampling={tier === 'high' ? 2 : 0}><Bloom luminanceThreshold={.82} intensity={tier === 'high' ? .28 : .16} mipmapBlur /><Vignette eskil={false} offset={.2} darkness={.28} /></EffectComposer>;
}
