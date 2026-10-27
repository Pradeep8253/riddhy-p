export function trackEvent(name, detail = {}) {
  if (typeof window === "undefined") return;
  try {
    const event = new CustomEvent("rf:track", {
      bubbles: true,
      cancelable: false,
      detail: {
        event: name,
        ...detail,
        timestamp: Date.now(),
        path: window.location.pathname,
      },
    });
    window.dispatchEvent(event);
  } catch (error) {
  }
}
