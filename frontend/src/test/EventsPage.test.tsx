import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventsPage } from '../screens/EventsPage';
import type { MissionDetail } from '../types/mission';

const mockMissionWithEvent: MissionDetail = {
  id: 'm-evt',
  label: 'Artemis Base Beta',
  seed: 'evt_seed',
  difficulty_mode: 'EXPLORER',
  current_day: 14,
  status: 'IN_PROGRESS',
  systems: {
    oxygen_level: 90.0,
    water_level: 250.0,
    battery_level: 90.0,
    food_level: 160.0,
    radiation_daily_dose: 0.8,
    greenhouse_progress: 10.0,
    solar_generation: 60.0,
    total_energy_load: 35.0,
  },
  crew: [],
  history: [],
  educational_feedback: [],
  active_event: {
    event_id: 'e1',
    day_number: 14,
    category: 'ENVIRONMENTAL',
    event_code: 'EVT_CME',
    severity: 'SEVERE',
    title: 'Coronal Mass Ejection: Solar Particle Influx',
    description: 'High-energy proton bombardment detected approaching lunar orbit.',
    affected_systems: ['radiation', 'power'],
    requires_decision: true,
    resolution_status: 'PENDING',
    options: [
      {
        option_id: 'opt1',
        title: 'Activate Storm Shelter Protocol',
        description: 'Order all 4 crew members into the heavily reinforced regolith shelter (+10 kW).',
        trade_offs_summary: '+10 kW power required, 80% radiation attenuation.',
        educational_hint: 'Regolith mass attenuates up to 80% of ionising radiation.',
        energy_cost: 10.0,
        water_cost: 0,
        food_cost: 0,
        stress_impact: 5,
        health_impact: 0,
      },
      {
        option_id: 'opt2',
        title: 'Maintain Nominal Operations',
        description: 'Rely purely on exterior habitat hull shielding.',
        trade_offs_summary: '0 kW power, risks acute radiation dose spikes.',
        energy_cost: 0,
        water_cost: 0,
        food_cost: 0,
        stress_impact: 15,
        health_impact: -10,
      },
    ],
  },
};

describe('EventsPage (SCR-05 Emergency Decisions)', () => {
  it('displays emergency event with severity indicator, affected systems, and options', () => {
    render(
      <EventsPage
        mission={mockMissionWithEvent}
        onNavigate={vi.fn()}
        onMissionUpdated={vi.fn()}
        onExit={vi.fn()}
      />
    );

    // Event title heading
    expect(
      screen.getByRole('heading', { level: 1, name: /Coronal Mass Ejection/i })
    ).toBeInTheDocument();

    // Event description
    expect(screen.getByText(/High-energy proton bombardment detected/i)).toBeInTheDocument();

    // Decision option cards
    expect(screen.getByText(/Activate Storm Shelter Protocol/i)).toBeInTheDocument();
    expect(screen.getByText(/Maintain Nominal Operations/i)).toBeInTheDocument();

    // Explorer Mode hint text
    expect(screen.getByText(/Regolith mass attenuates up to 80%/i)).toBeInTheDocument();
  });
});
