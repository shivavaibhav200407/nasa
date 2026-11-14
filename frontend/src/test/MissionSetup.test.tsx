import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionSetup } from '../screens/MissionSetup';

vi.mock('../api/client', () => ({
  api: {
    createMission: vi.fn().mockResolvedValue({ id: 'new-mission-id' }),
  },
}));

describe('MissionSetup (SCR-02 Detail State)', () => {
  it('renders briefing eyebrow, serif title, and mode comparison cards', () => {
    const handleBack = vi.fn();
    const handleLaunch = vi.fn();

    render(<MissionSetup onBack={handleBack} onMissionLaunched={handleLaunch} />);

    expect(screen.getByText(/MISSION BRIEFING/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /SET UP EXPEDITION/i })).toBeInTheDocument();
    expect(screen.getByText(/Explorer Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Commander Mode/i)).toBeInTheDocument();

    // 4 crew specialist avatars
    expect(screen.getByText(/Dr. Elena Rostova/i)).toBeInTheDocument();
    expect(screen.getByText(/Marcus Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah Jenkins/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Tariq Al-Mansoor/i)).toBeInTheDocument();

    // Primary BEGIN MISSION action pill
    expect(screen.getByRole('button', { name: /BEGIN MISSION/i })).toBeInTheDocument();
  });

  it('opens How to Play quick-start modal when circular ? button is clicked', () => {
    render(<MissionSetup onBack={vi.fn()} onMissionLaunched={vi.fn()} />);
    const howToPlayBtn = screen.getByTitle(/How to Play Quick Start/i);
    fireEvent.click(howToPlayBtn);
    expect(screen.getByRole('heading', { name: /How to Play: 3-Step Quick Start/i })).toBeInTheDocument();
  });
});
