import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="container" style={{ paddingBlock: '14vh', textAlign: 'center' }}>
      <div className="kicker">404 · NOT FOUND</div>
      <h1 className="display-title">This room isn’t here.</h1>
      <p className="muted" style={{ margin: '18px auto 28px', maxWidth: 480 }}>
        The page may have moved, but your next favourite piece is just around the corner.
        Our team is also happy to help you find what you need.
      </p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button href="/">Return to home</Button>
        <Button href="/furniture" variant="gold">Explore collection</Button>
        <Button href="/contact" variant="outline">Prayagraj Store Support</Button>
      </div>
    </main>
  );
}
