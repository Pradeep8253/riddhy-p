'use client';

import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import usePerformanceTier from './usePerformanceTier';

// Resilient chunk loader with automatic retry on transient Turbopack HMR / compilation delays
const loadSceneRoot = () =>
  import('./SceneRoot').catch((err) => {
    const isChunkError =
      err?.name === 'ChunkLoadError' ||
      err?.message?.includes('chunk') ||
      err?.message?.includes('Failed to load chunk');

    if (isChunkError && typeof window !== 'undefined') {
      // Retry once after a brief delay so Turbopack can complete chunk generation
      return new Promise((resolve) => setTimeout(resolve, 800)).then(() =>
        import('./SceneRoot')
      );
    }
    throw err;
  });

const SceneRoot = dynamic(loadSceneRoot, {
  ssr: false,
  loading: () => null,
});

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[SceneRootLoader] 3D Scene safely degraded to 2D:', error?.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default function SceneRootLoader() {
  const pathname = usePathname();
  const { tier } = usePerformanceTier();

  // Do not load or mount 3D canvas when on non-home paths or when user has prefers-reduced-motion/saveData/tier=off
  if (pathname !== '/' || tier === 'off') {
    return null;
  }

  return (
    <SceneErrorBoundary>
      <SceneRoot />
    </SceneErrorBoundary>
  );
}
