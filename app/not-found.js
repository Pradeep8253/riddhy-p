import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return <main className="container" style={{ paddingBlock: '14vh', textAlign: 'center' }}><div className="kicker">404 · NOT FOUND</div><h1 className="display-title">This room isn’t here.</h1><p className="muted" style={{ margin: '18px auto 28px', maxWidth: 480 }}>The page may have moved, but your next favourite find is just around the corner.</p><Button href="/">Return to home</Button></main>;
}
