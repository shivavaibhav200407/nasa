import { describe, it, expect, beforeEach } from 'vitest';
import { getInitialReduceEffects, setReduceEffects } from '../utils/effectsSettings';

describe('Effects Settings Utility', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('reduce-effects', 'reduce-motion');
  });

  it('reads default from media query when localStorage is empty', () => {
    const initial = getInitialReduceEffects();
    expect(initial).toBe(false);
  });

  it('persists enabled reduceEffects to localStorage and sets HTML classes', () => {
    setReduceEffects(true);
    expect(localStorage.getItem('astra_reduce_effects')).toBe('true');
    expect(document.documentElement.classList.contains('reduce-effects')).toBe(true);
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
    expect(getInitialReduceEffects()).toBe(true);
  });

  it('removes HTML classes when disabled', () => {
    setReduceEffects(true);
    setReduceEffects(false);
    expect(localStorage.getItem('astra_reduce_effects')).toBe('false');
    expect(document.documentElement.classList.contains('reduce-effects')).toBe(false);
    expect(getInitialReduceEffects()).toBe(false);
  });
});
