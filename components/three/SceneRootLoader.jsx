'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import usePerformanceTier from './usePerformanceTier';

const SceneRoot = dynamic(() => import('./SceneRoot'), { ssr: false, loading: () => null });

export default function SceneRootLoader() {
  const pathname = usePathname();
  const { tier } = usePerformanceTier();

  // Do not load or mount 3D canvas when on non-home paths or when user has prefers-reduced-motion/saveData/tier=off
  if (pathname !== '/' || tier === 'off') {
    return null;
  }

  return <SceneRoot />;
}
