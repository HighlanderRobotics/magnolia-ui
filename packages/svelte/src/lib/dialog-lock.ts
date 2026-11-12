let locks = 0;
let original = '';
/** Reference counting keeps scroll locked while any nested dialog is open. */
export function lockScroll() {
  if (locks++ === 0) {
    original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
  return () => {
    if (--locks === 0) document.documentElement.style.overflow = original;
  };
}
