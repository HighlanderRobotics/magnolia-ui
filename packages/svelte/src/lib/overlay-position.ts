/** Keep a top-layer panel anchored and inside the viewport, including on scroll. */
export function positionOverlay(panel: HTMLElement, anchor: HTMLElement) {
  function update() {
    const rect = anchor.getBoundingClientRect();
    const gap =
      parseFloat(getComputedStyle(panel).getPropertyValue('--mg-spacing-sm')) ||
      8;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const below = rect.bottom + gap;
    const top =
      below + height <= innerHeight - gap ? below : rect.top - height - gap;
    panel.style.left = `${Math.max(gap, Math.min(rect.left, innerWidth - width - gap))}px`;
    panel.style.top = `${Math.max(gap, Math.min(top, innerHeight - height - gap))}px`;
  }
  update();
  const observer = new ResizeObserver(update);
  observer.observe(panel);
  observer.observe(anchor);
  window.addEventListener('resize', update);
  window.addEventListener('scroll', update, true);
  return {
    destroy() {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    },
  };
}
