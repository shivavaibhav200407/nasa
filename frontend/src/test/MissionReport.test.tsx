import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionReportScreen } from '../screens/MissionReport';

vi.mock('../api/client', () => ({
  api: {
    getMissionReport: vi.fn().mockResolvedValue({
      mission_id: 'm-report',
      label: 'Artemis Base Beta',
      difficulty_mode: 'EXPLORER',
      outcome_status: 'COMPLETED',
      days_survived: 90,
      failure_reason: null,
      score_breakdown: {
        crew_survival_score: 400,
        duration_score: 200,
        resource_stewardship_score: 150,
        radiation_safety_score: 100,
        decision_quality_score: 150,
        difficulty_multiplier: 1.0,
        total_score: 1000,
      },
      crew: [],
      telemetry_history: [],
      key_turning_points: [],
      educational_takeaways: [
        {
          feedback_id: 'fb1',
          title: 'Closed-Loop Conservation',
          fact_summary: 'Mass is conserved in closed systems: water recycling requires 10% makeup feed.',
          scientific_principle: 'Conservation of Mass',
        },
      ],
    }),
  },
}));

describe('MissionReportScreen (SCR-06 Mission Report & Final Score)', () => {
  it('renders completed mission outcome with score breakdown and educational takeaways', async () => {
    render(
      <MissionReportScreen
        missionId="m-report"
        onPlayAgain={vi.fn()}
        onReturnHome={vi.fn()}
      />
    );

    // Outcome title
    expect(await screen.findByText(/MISSION ACCOMPLISHED: DAY 90 COMPLETED/i)).toBeInTheDocument();

    // Total score
    expect(screen.getByText(/1000/i)).toBeInTheDocument();

    // Factor breakdown
    expect(screen.getByText(/Crew Survival/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Resource Stewardship/i).length).toBeGreaterThan(0);

    // Pedagogical takeaways
    expect(screen.getByText(/Closed-Loop Conservation/i)).toBeInTheDocument();
  });
});
