import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LandingPage } from '../screens/LandingPage';

// Mock API calls
vi.mock('../api/client', () => ({
  api: {
    listMissions: vi.fn().mockResolvedValue([
      {
        id: 'm1',
        label: 'Lunar Alpha Test',
        difficulty_mode: 'EXPLORER',
        current_day: 12,
        status: 'IN_PROGRESS',
        updated_at: new Date().toISOString(),
      },
    ]),
  },
}));

describe('LandingPage (SCR-01 Overview State)', () => {
  it('renders overview hero with uppercase eyebrow, serif ASTRA title, and pale pill button', async () => {
    const handleNewMission = vi.fn();
    const handleResume = vi.fn();
    const handleViewReport = vi.fn();

    render(
      <LandingPage
        onNewMission={handleNewMission}
        onResumeMission={handleResume}
        onViewReport={handleViewReport}
      />
    );

    // Eyebrow and serif title
    expect(screen.getByText('LUNAR OUTPOST')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /ASTRA/i })).toBeInTheDocument();

    // 5-step daily cycle strip
    expect(screen.getByText(/The 5-Step Operational Cycle/i)).toBeInTheDocument();

    // The six coupled systems cards
    expect(screen.getByText(/Six Critical Outpost Loops/i)).toBeInTheDocument();
    expect(screen.getByText(/SYS.O2/i)).toBeInTheDocument();
    expect(screen.getByText(/SYS.H2O/i)).toBeInTheDocument();

    // Non-endorsement notice
    expect(screen.getByText(/NASA NON-ENDORSEMENT NOTICE/i)).toBeInTheDocument();
  });
});
