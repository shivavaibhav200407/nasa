import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PillButton } from '../components/ui/PillButton';

describe('PillButton Component', () => {
  it('renders primary pale-blue pill button with text', () => {
    render(<PillButton variant="primary">START MISSION</PillButton>);
    const btn = screen.getByRole('button', { name: /start mission/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('bg-cinematic-pill');
    expect(btn).toHaveClass('text-cinematic-pill-text');
  });

  it('renders secondary glass button and handles clicks', () => {
    const handleClick = vi.fn();
    render(<PillButton variant="secondary" onClick={handleClick}>SECONDARY ACTION</PillButton>);
    const btn = screen.getByRole('button', { name: /secondary action/i });
    expect(btn).toHaveClass('bg-cinematic-glass');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders circular icon button with accessible label', () => {
    render(
      <PillButton variant="icon-circle" aria-label="How to play">
        <span>?</span>
      </PillButton>
    );
    const btn = screen.getByRole('button', { name: /how to play/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('rounded-full');
  });

  it('disables interactions and sets aria-disabled when disabled is true', () => {
    const handleClick = vi.fn();
    render(<PillButton disabled onClick={handleClick}>DISABLED BUTTON</PillButton>);
    const btn = screen.getByRole('button', { name: /disabled button/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
