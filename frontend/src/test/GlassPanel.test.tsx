import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassPanel } from '../components/ui/GlassPanel';

describe('GlassPanel Component', () => {
  it('renders children with default glass styles and hairline border', () => {
    render(
      <GlassPanel>
        <div data-testid="content">Subsystem Telemetry</div>
      </GlassPanel>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
    const panel = screen.getByTestId('content').parentElement;
    expect(panel).toHaveClass('bg-cinematic-glass');
    expect(panel).toHaveClass('border-cinematic-hairline');
  });

  it('renders heavy and interactive variants with appropriate classes', () => {
    const { container: heavyContainer } = render(
      <GlassPanel variant="heavy">Heavy Content</GlassPanel>
    );
    expect(heavyContainer.firstChild).toHaveClass('bg-cinematic-glass-heavy');

    const { container: interactiveContainer } = render(
      <GlassPanel variant="interactive">Interactive Panel</GlassPanel>
    );
    expect(interactiveContainer.firstChild).toHaveClass('hover:border-cinematic-hairline-bright');
  });
});
