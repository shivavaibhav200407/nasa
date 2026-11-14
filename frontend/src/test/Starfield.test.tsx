import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Starfield } from '../components/Starfield';

describe('Starfield Component', () => {
  it('renders fixed canvas overlay with aria-hidden true', () => {
    const { container } = render(<Starfield />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveClass('fixed');
    expect(canvas).toHaveClass('pointer-events-none');
  });

  it('renders under reducedEffects mode without throwing', () => {
    const { container } = render(<Starfield reducedEffects={true} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
