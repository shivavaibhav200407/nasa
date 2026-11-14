// Effects settings utility for ASTRA Cinematic UI
const REDUCE_EFFECTS_KEY = 'astra_reduce_effects';

export function getInitialReduceEffects(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(REDUCE_EFFECTS_KEY);
  if (saved !== null) {
    return saved === 'true';
  }
  // Default to prefers-reduced-motion media query
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function setReduceEffects(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REDUCE_EFFECTS_KEY, String(enabled));
  if (enabled) {
    document.documentElement.classList.add('reduce-effects');
    document.documentElement.classList.add('reduce-motion');
  } else {
    document.documentElement.classList.remove('reduce-effects');
    document.documentElement.classList.remove('reduce-motion');
  }
}
