import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionDashboard } from '../screens/MissionDashboard';
import type { MissionDetail } from '../types/mission';

const mockDashboardMission: MissionDetail = {
  id: 'm-dash',
  label: 'Lunar Outpost Alpha',
  seed: 'seed_dash',
  difficulty_mode: 'EXPLORER',
  current_day: 12,
  status: 'IN_PROGRESS',
  systems: {
    oxygen_level: 94.0,
    water_level: 270.0,
    battery_level: 105.0,
    food_level: 165.0,
    radiation_daily_dose: 0.3,
    greenhouse_progress: 12.0,
    solar_generation: 65.0,
    total_energy_load: 35.0,
  },
  crew: [
    {
      astronaut_id: 'c1',
      name: 'Dr. Elena Rostova',
      role: 'Commander',
      health: 96,
      stress: 15,
      cumulative_radiation: 8.5,
      survival_status: 'ALIVE',
    },
  ],
  history: [],
  educational_feedback: [],
  active_event: null,
};

const mockAllocations = {
  expected_day: 12,
  power_allocations: {
    life_support: 12.0,
    water_recycling: 8.0,
    greenhouse: 10.0,
    radiation_shelter: 0.0,
  },
  water_allocations: {
    crew_share: 4.0,
    greenhouse_share: 2.0,
    electrolysis_share: 1.0,
  },
  oxygen_mode: 'NOMINAL' as const,
  greenhouse_active: true,
  storm_shelter_posture: false,
  crew_rest_posture: false,
};

describe('MissionDashboard (SCR-03 Mission Control)', () => {
  it('renders Sol day counter, subsystem gauges, and Advance Day action', () => {
    render(
      <MissionDashboard
        mission={mockDashboardMission}
        currentAllocations={mockAllocations}
        onNavigate={vi.fn()}
        onMissionUpdated={vi.fn()}
        onMissionFinished={vi.fn()}
        onExit={vi.fn()}
      />
    );

    // Systems gauges (may appear in both tile and annunciator)
    expect(screen.getAllByText(/Atmospheric O2/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Potable Water/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Battery Storage/i).length).toBeGreaterThan(0);

    // Crew vitals card
    expect(screen.getByText(/Dr. Elena Rostova/i)).toBeInTheDocument();

    // Advance Day action
    expect(screen.getByRole('button', { name: /Advance to Day 13/i })).toBeInTheDocument();
  });
});
