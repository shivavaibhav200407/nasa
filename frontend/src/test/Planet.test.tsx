import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Planet } from '../components/Planet';

describe('Planet Component', () => {
  it('renders overview-arc variant with aria-hidden', () => {
    const { container } = render(<Planet type="moon" variant="overview-arc" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders detail-sphere variant for earth with custom size', () => {
    const { container } = render(<Planet type="earth" variant="detail-sphere" size={320} />);
    const sphere = container.firstChild as HTMLElement;
    expect(sphere).toHaveStyle({ width: '320px', height: '320px' });
  });

  it('renders edge-preview variant with interactive button and label', () => {
    const { getByRole, getByText } = render(
      <Planet
        type="mars"
        variant="edge-preview"
        label="Mars"
        sublabel="Future Mission"
      />
    );
    const btn = getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(getByText('Mars')).toBeInTheDocument();
    expect(getByText('Future Mission')).toBeInTheDocument();
  });
});
