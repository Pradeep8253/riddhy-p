'use client';

import dynamic from 'next/dynamic';
import usePerformanceTier from './usePerformanceTier';
import BrandMark from '@/components/ui/BrandMark';

const ConsultationScene = dynamic(() => import('./ConsultationScene'), {
  ssr: false,
  loading: () => <BrandMark size={140} title="RF Riddhy Emblem" />
});

export default function ConsultationHeroCanvas() {
  const { tier, isLite } = usePerformanceTier();

  if (isLite || tier === 'off' || tier === 'low') {
    return <BrandMark size={150} title="RF Riddhy Emblem" />;
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 280, display: 'grid', placeItems: 'center' }}>
      <ConsultationScene />
    </div>
  );
}
