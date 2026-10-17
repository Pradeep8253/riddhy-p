'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const SceneRoot = dynamic(() => import('./SceneRoot'), { ssr: false, loading: () => null });
export default function SceneRootLoader() {
  const pathname = usePathname();
  return pathname === '/' ? <SceneRoot /> : null;
}
