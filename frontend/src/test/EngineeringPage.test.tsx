import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EngineeringPage } from '../screens/EngineeringPage';
import type { MissionDetail } from '../types/mission';

const mockMission: MissionDetail = {
  id: 'm-test',
  label: 'Artemis Base Beta',
  seed: 'test_seed',
  difficulty_mode: 'EXPLORER',
  current_day: 5,
  status: 'IN_PROGRESS',
  systems: {
    oxygen_level: 95.0,
    water_level: 280.0,
    battery_level: 110.0,
    food_level: 180.0,
    radiation_daily_dose: 0.2,
    greenhouse_progress: 5.0,
    solar_generation: 65.0,
    total_energy_load: 35.0,
  },
  crew: [],
  history: [],
  educational_feedback: [],
  active_event: null,
};

const mockAllocations = {
  expected_day: 5,
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

describe('EngineeringPage (SCR-04 Management)', () => {
  it('renders subsystem engineering controls and power microgrid bus', () => {
    const handleSave = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <EngineeringPage
        mission={mockMission}
        allocations={mockAllocations}
        onSaveAllocations={handleSave}
        onNavigate={handleNavigate}
        onExit={vi.fn()}
      />
    );

    expect(screen.getByText(/Outpost Electrical Microgrid & Bus Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Electrolysis & Scrubber Power/i)).toBeInTheDocument();
    expect(screen.getByText(/Distillation & Filter Power/i)).toBeInTheDocument();
  });
});
