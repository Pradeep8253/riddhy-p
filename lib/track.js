/**
 * RF Riddhy — Vendor-neutral lightweight analytics dispatcher
 *
 * Emits browser CustomEvents ('rf:track') so any future analytics tool
 * (Google Tag Manager, PostHog, Segment, Matomo) can subscribe with:
 * window.addEventListener('rf:track', (e) => { ... })
 *
 * Safe to call on server or client.
 */

export function trackEvent(name, detail = {}) {
  if (typeof window === 'undefined') return;
  try {
    const event = new CustomEvent('rf:track', {
      bubbles: true,
      cancelable: false,
      detail: {
        event: name,
        ...detail,
        timestamp: Date.now(),
        path: window.location.pathname
      }
    });
    window.dispatchEvent(event);
  } catch (error) {
    // Fail silently in non-supporting browsers
  }
}
