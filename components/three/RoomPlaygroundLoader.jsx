'use client';

import React, { Component, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import usePerformanceTier from './usePerformanceTier';

const loadRoomPlayground = () =>
  import('./RoomPlayground').catch((err) => {
    const isChunkError =
      err?.name === 'ChunkLoadError' ||
      err?.message?.includes('chunk') ||
      err?.message?.includes('Failed to load chunk');
    if (isChunkError && typeof window !== 'undefined') {
      return new Promise((resolve) => setTimeout(resolve, 800)).then(() =>
        import('./RoomPlayground')
      );
    }
    throw err;
  });

const RoomPlayground = dynamic(loadRoomPlayground, {
  ssr: false,
  loading: () => (
    <div className="container" style={{ padding: 24, textAlign: 'center', color: '#666' }}>
      Loading 3D room planner…
    </div>
  ),
});

class PlaygroundErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[RoomPlaygroundLoader] 3D Room planner degraded to 2D:', error?.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default function RoomPlaygroundLoader({ catalogue }) {
  const { tier, setLiteMode } = usePerformanceTier();
  const [manualEnable, setManualEnable] = useState(false);

  if (tier === 'off' && !manualEnable) {
    return (
      <div
        className="container"
        style={{
          padding: '36px 20px',
          textAlign: 'center',
          background: '#fbf9f4',
          borderRadius: 16,
          border: '1px solid #e7ded2',
          margin: '24px auto',
          maxWidth: 900,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#1f5f2e',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Interactive 3D Planner
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            margin: '8px 0 12px',
            color: '#1e2420',
          }}
        >
          Interactive 3D is paused for reduced motion or data saver
        </h3>
        <p style={{ color: '#555', maxWidth: 520, margin: '0 auto 20px', fontSize: 14 }}>
          To conserve battery, memory and network bandwidth on your device, the 3D physics environment
          is paused. You can enable it below or browse furniture directly.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setLiteMode(false);
              setManualEnable(true);
            }}
            style={{
              padding: '10px 22px',
              background: '#1f5f2e',
              color: '#fff',
              border: 0,
              borderRadius: 999,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Enable 3D Planner
          </button>
          <Link
            href="/furniture"
            style={{
              padding: '10px 22px',
              background: '#fff',
              color: '#1e2420',
              border: '1px solid #dcd3c5',
              borderRadius: 999,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Browse Furniture Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PlaygroundErrorBoundary>
      <RoomPlayground catalogue={catalogue} />
    </PlaygroundErrorBoundary>
  );
}
