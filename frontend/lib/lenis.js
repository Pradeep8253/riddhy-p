import Lenis from 'lenis';
export function createLenis(){
  return new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
    gestureOrientation: 'vertical',
    infinite: false
  });
}
